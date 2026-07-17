import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, type MutationCtx } from './_generated/server';
import {
	advanceCountryCycle,
	getDueCountry,
	getEnabledCategories,
	getNextEnabledCategory,
	getOrCreateGnewsFetchState
} from './fetchCycle';

const MAX_RETRY_ATTEMPTS = 3;
// Convex actions are hard-capped at 10 minutes, so anything in_progress past
// this point died without reaching its catch block.
const STUCK_IN_PROGRESS_TIMEOUT_MS = 15 * 60 * 1000;
// Pending jobs whose scheduled action never ran (for example after a deploy).
const STALE_PENDING_TIMEOUT_MS = 30 * 60 * 1000;
const JOB_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const CLEANUP_BATCH_SIZE = 200;
const SCHEDULER_BATCH_SIZE = 100;

async function hasActiveFetchJob(ctx: MutationCtx) {
	const pendingJob = await ctx.db
		.query('fetchJobs')
		.withIndex('by_status', (q) => q.eq('status', 'pending'))
		.first();

	if (pendingJob) {
		return true;
	}

	const inProgressJob = await ctx.db
		.query('fetchJobs')
		.withIndex('by_status', (q) => q.eq('status', 'in_progress'))
		.first();

	return inProgressJob !== null;
}

async function getBlockedJob(ctx: MutationCtx, cycleId: Id<'countryFetchCycles'>) {
	const failed = await ctx.db
		.query('fetchJobs')
		.withIndex('by_cycleId_and_status', (q) => q.eq('cycleId', cycleId).eq('status', 'failed'))
		.first();

	if (failed) {
		return failed;
	}

	return await ctx.db
		.query('fetchJobs')
		.withIndex('by_cycleId_and_status', (q) =>
			q.eq('cycleId', cycleId).eq('status', 'rate_limited')
		)
		.first();
}

async function scheduleJob(
	ctx: MutationCtx,
	categoryId: Id<'categories'>,
	countryId: Id<'countries'>,
	cycleId: Id<'countryFetchCycles'>,
	delayMs: number
) {
	const jobId = await ctx.db.insert('fetchJobs', {
		categoryId,
		countryId,
		cycleId,
		status: 'pending',
		error: null,
		fetchedAt: null
	});

	await ctx.scheduler.runAfter(delayMs, internal.gnews.getLatestHeadlines, {
		categoryId,
		jobId
	});

	return jobId;
}

export const enqueueNextFetchJob = internalMutation({
	args: {},
	handler: async (ctx) => {
		if (await hasActiveFetchJob(ctx)) {
			return;
		}

		const now = Date.now();
		const fetchState = await getOrCreateGnewsFetchState(ctx);
		let cycle: Doc<'countryFetchCycles'> | null = null;
		let category: Doc<'categories'> | null = null;

		if (fetchState.activeCycleId) {
			cycle = await ctx.db.get(fetchState.activeCycleId);

			if (!cycle || cycle.status !== 'in_progress') {
				await ctx.db.patch(fetchState._id, {
					activeCycleId: undefined,
					lastCompletedCategoryCode: undefined
				});
				return;
			}

			if (await getBlockedJob(ctx, cycle._id)) {
				return;
			}

			category = await getNextEnabledCategory(ctx, fetchState.lastCompletedCategoryCode);
			if (!category) {
				return;
			}
		} else {
			const categories = await getEnabledCategories(ctx);
			if (categories.length === 0) {
				return;
			}

			const due = await getDueCountry(ctx, now);
			if (!due) {
				return;
			}

			const cycleId = await ctx.db.insert('countryFetchCycles', {
				countryId: due.country._id,
				status: 'in_progress',
				startedAt: now,
				totalCategories: categories.length,
				completedCategories: 0,
				failedCategories: 0
			});

			cycle = (await ctx.db.get(cycleId))!;
			category = categories[0];

			await ctx.db.patch(fetchState._id, {
				activeCycleId: cycleId,
				lastCompletedCategoryCode: undefined
			});
			await ctx.db.patch(due.state._id, {
				lastCycleStartedAt: now,
				lastCycleId: cycleId
			});
		}

		await scheduleJob(
			ctx,
			category._id,
			cycle.countryId,
			cycle._id,
			Math.max(0, fetchState.nextRequestAt - now)
		);
	}
});

export const retryFailedJob = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		const inProgressJobs = await ctx.db
			.query('fetchJobs')
			.withIndex('by_status', (q) => q.eq('status', 'in_progress'))
			.take(SCHEDULER_BATCH_SIZE);

		for (const job of inProgressJobs) {
			if ((job.startedAt ?? job._creationTime) < now - STUCK_IN_PROGRESS_TIMEOUT_MS) {
				await ctx.db.patch(job._id, {
					status: 'failed',
					error: 'Job was stuck in_progress and timed out',
					fetchedAt: now,
					retryAt: now
				});
			}
		}

		const pendingJobs = await ctx.db
			.query('fetchJobs')
			.withIndex('by_status', (q) => q.eq('status', 'pending'))
			.take(SCHEDULER_BATCH_SIZE);

		for (const job of pendingJobs) {
			if (job._creationTime < now - STALE_PENDING_TIMEOUT_MS) {
				await ctx.db.patch(job._id, {
					status: 'failed',
					error: 'Job was stuck pending and timed out',
					fetchedAt: now,
					retryAt: now
				});
			}
		}

		if (await hasActiveFetchJob(ctx)) {
			return;
		}

		const fetchState = await getOrCreateGnewsFetchState(ctx);
		if (!fetchState.activeCycleId) {
			return;
		}

		const job = await getBlockedJob(ctx, fetchState.activeCycleId);
		if (!job || (job.retryAt ?? now) > now) {
			return;
		}

		const attempts = job.attempts ?? 0;
		if (attempts >= MAX_RETRY_ATTEMPTS) {
			await ctx.db.patch(job._id, {
				status: 'exhausted',
				fetchedAt: now
			});
			await advanceCountryCycle(ctx, job, 'failed');
			return;
		}

		await ctx.db.patch(job._id, {
			status: 'pending',
			attempts: attempts + 1,
			error: null,
			fetchedAt: null,
			startedAt: undefined,
			retryAt: undefined
		});

		await ctx.scheduler.runAfter(
			Math.max(0, fetchState.nextRequestAt - now),
			internal.gnews.getLatestHeadlines,
			{
				categoryId: job.categoryId,
				jobId: job._id
			}
		);
	}
});

export const cleanupOldJobs = internalMutation({
	args: {},
	handler: async (ctx) => {
		const cutoff = Date.now() - JOB_RETENTION_MS;
		const terminalStatuses = ['completed', 'failed', 'rate_limited', 'exhausted'] as const;
		let hitBatchLimit = false;

		for (const status of terminalStatuses) {
			const oldJobs = await ctx.db
				.query('fetchJobs')
				.withIndex('by_status', (q) => q.eq('status', status).lt('_creationTime', cutoff))
				.take(CLEANUP_BATCH_SIZE);

			for (const job of oldJobs) {
				await ctx.db.delete(job._id);
			}

			if (oldJobs.length === CLEANUP_BATCH_SIZE) {
				hitBatchLimit = true;
			}
		}

		if (hitBatchLimit) {
			await ctx.scheduler.runAfter(0, internal.newsScheduler.cleanupOldJobs, {});
		}
	}
});

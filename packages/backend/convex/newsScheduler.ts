import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { internalMutation, type MutationCtx } from './_generated/server';

const FETCH_JOB_SPACING_MS = 10 * 1000;
const MAX_RETRY_ATTEMPTS = 3;
// Convex actions are hard-capped at 10 minutes, so anything in_progress past
// this point died without reaching its catch block.
const STUCK_IN_PROGRESS_TIMEOUT_MS = 15 * 60 * 1000;
// Pending jobs whose scheduled action never ran (e.g. cancelled by a deploy).
const STALE_PENDING_TIMEOUT_MS = 30 * 60 * 1000;
const JOB_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const CLEANUP_BATCH_SIZE = 200;
const SCHEDULER_BATCH_SIZE = 100;

async function hasActiveFetchJob(ctx: MutationCtx, categoryId: Id<'categories'>) {
	const pendingJob = await ctx.db
		.query('fetchJobs')
		.withIndex('by_categoryId_and_status', (q) =>
			q.eq('categoryId', categoryId).eq('status', 'pending')
		)
		.first();

	if (pendingJob) {
		return true;
	}

	const inProgressJob = await ctx.db
		.query('fetchJobs')
		.withIndex('by_categoryId_and_status', (q) =>
			q.eq('categoryId', categoryId).eq('status', 'in_progress')
		)
		.first();

	return inProgressJob !== null;
}

export const enqueueNextFetchJob = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		const categories = await ctx.db
			.query('categories')
			.withIndex('by_enabled_nextFetchAt', (q) => q.eq('enabled', true).lte('nextFetchAt', now))
			.take(SCHEDULER_BATCH_SIZE);

		let delayMs = 0;

		for (const category of categories) {
			if (await hasActiveFetchJob(ctx, category._id)) {
				continue;
			}

			const job = await ctx.db.insert('fetchJobs', {
				categoryId: category._id,
				status: 'pending',
				error: null,
				fetchedAt: null
			});

			await ctx.scheduler.runAfter(delayMs, internal.gnews.getLatestHeadlines, {
				categoryId: category._id,
				jobId: job
			});

			delayMs += FETCH_JOB_SPACING_MS;
		}
	}
});

export const retryFailedJob = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		// Recover jobs whose action died mid-flight or never ran, so they
		// neither block their category forever nor sit invisible.
		const inProgressJobs = await ctx.db
			.query('fetchJobs')
			.withIndex('by_status', (q) => q.eq('status', 'in_progress'))
			.take(SCHEDULER_BATCH_SIZE);

		for (const job of inProgressJobs) {
			if ((job.startedAt ?? job._creationTime) < now - STUCK_IN_PROGRESS_TIMEOUT_MS) {
				await ctx.db.patch(job._id, {
					status: 'failed',
					error: 'Job was stuck in_progress and timed out',
					fetchedAt: now
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
					fetchedAt: now
				});
			}
		}

		const failedJobs = await ctx.db
			.query('fetchJobs')
			.withIndex('by_status', (q) => q.eq('status', 'failed'))
			.take(SCHEDULER_BATCH_SIZE);

		let delayMs = 0;

		for (const job of failedJobs) {
			const attempts = job.attempts ?? 0;

			// Exhausted jobs stay failed for observability; the enqueue cron
			// picks the category back up once its nextFetchAt arrives.
			if (attempts >= MAX_RETRY_ATTEMPTS) {
				continue;
			}

			if (await hasActiveFetchJob(ctx, job.categoryId)) {
				continue;
			}

			await ctx.db.patch(job._id, {
				status: 'pending',
				attempts: attempts + 1,
				error: null,
				fetchedAt: null,
				startedAt: undefined
			});

			await ctx.scheduler.runAfter(delayMs, internal.gnews.getLatestHeadlines, {
				categoryId: job.categoryId,
				jobId: job._id
			});

			delayMs += FETCH_JOB_SPACING_MS;
		}
	}
});

export const cleanupOldJobs = internalMutation({
	args: {},
	handler: async (ctx) => {
		const cutoff = Date.now() - JOB_RETENTION_MS;
		const terminalStatuses = ['completed', 'failed', 'rate_limited'] as const;
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

		// Reschedule to drain the backlog without blowing transaction limits.
		if (hitBatchLimit) {
			await ctx.scheduler.runAfter(0, internal.newsScheduler.cleanupOldJobs, {});
		}
	}
});

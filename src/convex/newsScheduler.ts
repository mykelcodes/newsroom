import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { internalMutation, type MutationCtx } from './_generated/server';

const FETCH_JOB_SPACING_MS = 10 * 1000;

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
			.collect();

		let delayMs = 0;

		for (const category of categories) {
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
		const failedJobs = await ctx.db
			.query('fetchJobs')
			.withIndex('by_status', (q) => q.eq('status', 'failed'))
			.collect();

		let delayMs = 0;

		for (const job of failedJobs) {
			if (await hasActiveFetchJob(ctx, job.categoryId)) {
				continue;
			}

			await ctx.db.patch(job._id, {
				status: 'pending',
				error: null,
				fetchedAt: null
			});

			await ctx.scheduler.runAfter(delayMs, internal.gnews.getLatestHeadlines, {
				categoryId: job.categoryId,
				jobId: job._id
			});

			delayMs += FETCH_JOB_SPACING_MS;
		}
	}
});

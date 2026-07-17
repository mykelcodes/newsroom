import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, type MutationCtx } from './_generated/server';
import { headlineInputValidator, insertHeadlines } from './headlines';

async function updateCategorySchedule(
	ctx: MutationCtx,
	categoryId: Id<'categories'>,
	updates: { nextFetchAt: number; lastFetchedPage?: number }
) {
	const category = await ctx.db.get(categoryId);

	if (!category) {
		return;
	}

	await ctx.db.patch(categoryId, {
		nextFetchAt: updates.nextFetchAt,
		lastFetchedAt: Date.now(),
		lastFetchedPage: updates.lastFetchedPage ?? category.lastFetchedPage
	});
}

/**
 * Marks the job in_progress and returns its category so the calling action
 * needs no separate lookup. Returns null (and fails the job) if the category
 * no longer exists.
 */
export const startJob = internalMutation({
	args: {
		id: v.id('fetchJobs')
	},
	handler: async (ctx, args): Promise<Doc<'categories'> | null> => {
		const job = await ctx.db.get(args.id);

		if (!job) {
			return null;
		}

		const category = await ctx.db.get(job.categoryId);

		if (!category) {
			await ctx.db.patch(args.id, {
				status: 'failed',
				error: `Category ${job.categoryId} no longer exists`,
				fetchedAt: Date.now()
			});
			return null;
		}

		await ctx.db.patch(args.id, {
			status: 'in_progress',
			startedAt: Date.now(),
			error: null,
			fetchedAt: null
		});

		return category;
	}
});

export const completeJob = internalMutation({
	args: {
		id: v.id('fetchJobs'),
		categoryId: v.id('categories'),
		headlines: v.array(headlineInputValidator),
		nextFetchAt: v.number(),
		fetchedPage: v.number()
	},
	handler: async (ctx, args) => {
		await insertHeadlines(ctx, args.headlines);

		await updateCategorySchedule(ctx, args.categoryId, {
			nextFetchAt: args.nextFetchAt,
			lastFetchedPage: args.fetchedPage
		});

		await ctx.db.patch(args.id, {
			status: 'completed',
			fetchedAt: Date.now(),
			dataLength: args.headlines.length,
			fetchedPage: args.fetchedPage
		});
	}
});

export const rateLimitJob = internalMutation({
	args: {
		id: v.id('fetchJobs'),
		categoryId: v.id('categories'),
		error: v.string(),
		nextFetchAt: v.number()
	},
	handler: async (ctx, args) => {
		// Keep lastFetchedPage where it is so the next successful fetch resumes
		// from the page this one never got.
		await updateCategorySchedule(ctx, args.categoryId, { nextFetchAt: args.nextFetchAt });

		await ctx.db.patch(args.id, {
			status: 'rate_limited',
			error: args.error,
			fetchedAt: Date.now(),
			dataLength: 0
		});
	}
});

export const failJob = internalMutation({
	args: {
		id: v.id('fetchJobs'),
		error: v.string(),
		categoryId: v.optional(v.id('categories')),
		// Pushing nextFetchAt forward hands recovery to the retry cron; without
		// it the enqueue cron would keep creating fresh jobs for a category
		// whose schedule never advanced.
		retryAt: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		if (args.categoryId && args.retryAt) {
			await updateCategorySchedule(ctx, args.categoryId, { nextFetchAt: args.retryAt });
		}

		await ctx.db.patch(args.id, {
			status: 'failed',
			error: args.error,
			fetchedAt: Date.now()
		});
	}
});

import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { internalMutation } from './_generated/server';
import {
	advanceCountryCycle,
	FETCH_JOB_SPACING_MS,
	getOrCreateGnewsFetchState
} from './fetchCycle';
import { headlineInputValidator, insertHeadlines } from './headlines';

type FetchJobContext = {
	category: Doc<'categories'>;
	country: Doc<'countries'>;
	lastFetchedPage: number;
};

/**
 * Marks a pending job in progress and returns all database-backed request
 * context to the action. Legacy category-only jobs fail safely and age out.
 */
export const startJob = internalMutation({
	args: {
		id: v.id('fetchJobs')
	},
	handler: async (ctx, args): Promise<FetchJobContext | null> => {
		const job = await ctx.db.get(args.id);

		if (!job || job.status !== 'pending') {
			return null;
		}

		if (!job.countryId || !job.cycleId) {
			await ctx.db.patch(args.id, {
				status: 'failed',
				error: 'Legacy fetch job has no country cycle',
				fetchedAt: Date.now()
			});
			return null;
		}

		const [category, country, cycle, fetchState, progress] = await Promise.all([
			ctx.db.get(job.categoryId),
			ctx.db.get(job.countryId),
			ctx.db.get(job.cycleId),
			getOrCreateGnewsFetchState(ctx),
			ctx.db
				.query('countryCategoryFetchStates')
				.withIndex('by_countryId_and_categoryId', (q) =>
					q.eq('countryId', job.countryId!).eq('categoryId', job.categoryId)
				)
				.unique()
		]);

		if (
			!category ||
			!country ||
			!cycle ||
			cycle.status !== 'in_progress' ||
			fetchState.activeCycleId !== cycle._id
		) {
			await ctx.db.patch(args.id, {
				status: 'failed',
				error: 'Fetch job no longer belongs to the active country cycle',
				fetchedAt: Date.now()
			});
			return null;
		}

		const now = Date.now();
		await ctx.db.patch(args.id, {
			status: 'in_progress',
			startedAt: now,
			error: null,
			fetchedAt: null,
			retryAt: undefined
		});
		await ctx.db.patch(fetchState._id, {
			nextRequestAt: Math.max(fetchState.nextRequestAt, now + FETCH_JOB_SPACING_MS)
		});

		return {
			category,
			country,
			lastFetchedPage: progress?.lastFetchedPage ?? 0
		};
	}
});

export const completeJob = internalMutation({
	args: {
		id: v.id('fetchJobs'),
		headlines: v.array(headlineInputValidator),
		fetchedPage: v.number()
	},
	handler: async (ctx, args) => {
		const job = await ctx.db.get(args.id);

		if (!job || job.status !== 'in_progress' || !job.countryId || !job.cycleId) {
			return;
		}

		await insertHeadlines(ctx, args.headlines);

		const progress = await ctx.db
			.query('countryCategoryFetchStates')
			.withIndex('by_countryId_and_categoryId', (q) =>
				q.eq('countryId', job.countryId!).eq('categoryId', job.categoryId)
			)
			.unique();
		const now = Date.now();

		if (progress) {
			await ctx.db.patch(progress._id, {
				lastFetchedAt: now,
				lastFetchedPage: args.fetchedPage
			});
		} else {
			await ctx.db.insert('countryCategoryFetchStates', {
				countryId: job.countryId,
				categoryId: job.categoryId,
				lastFetchedAt: now,
				lastFetchedPage: args.fetchedPage
			});
		}

		await ctx.db.patch(args.id, {
			status: 'completed',
			fetchedAt: now,
			dataLength: args.headlines.length,
			fetchedPage: args.fetchedPage
		});

		await advanceCountryCycle(ctx, job, 'completed');
	}
});

export const rateLimitJob = internalMutation({
	args: {
		id: v.id('fetchJobs'),
		error: v.string(),
		retryAt: v.number()
	},
	handler: async (ctx, args) => {
		const job = await ctx.db.get(args.id);

		if (!job || job.status !== 'in_progress') {
			return;
		}

		await ctx.db.patch(args.id, {
			status: 'rate_limited',
			error: args.error,
			fetchedAt: Date.now(),
			dataLength: 0,
			retryAt: args.retryAt
		});

		const fetchState = await getOrCreateGnewsFetchState(ctx);
		await ctx.db.patch(fetchState._id, {
			nextRequestAt: Math.max(fetchState.nextRequestAt, args.retryAt)
		});
	}
});

export const failJob = internalMutation({
	args: {
		id: v.id('fetchJobs'),
		error: v.string(),
		retryAt: v.number()
	},
	handler: async (ctx, args) => {
		const job = await ctx.db.get(args.id);

		if (!job || job.status !== 'in_progress') {
			return;
		}

		await ctx.db.patch(args.id, {
			status: 'failed',
			error: args.error,
			fetchedAt: Date.now(),
			retryAt: args.retryAt
		});
	}
});

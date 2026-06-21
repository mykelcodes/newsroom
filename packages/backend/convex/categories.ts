import { v } from 'convex/values';
import { internalMutation, query } from './_generated/server';

export const getAll = query({
	handler: async (ctx) => {
		return await ctx.db.query('categories').collect();
	}
});

export const getById = query({
	args: {
		id: v.id('categories')
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

export const updateFetchSchedule = internalMutation({
	args: {
		id: v.id('categories'),
		nextFetchAt: v.number(),
		lastFetchedPage: v.number()
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		await ctx.db.patch(args.id, {
			nextFetchAt: args.nextFetchAt,
			lastFetchedAt: now,
			lastFetchedPage: args.lastFetchedPage
		});
	}
});

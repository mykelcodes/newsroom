import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';

const GNEWS_TOP_HEADLINES_SOURCE = 'gnews:top-headlines';

export const getNextCategory = internalQuery({
	args: {},
	handler: async (ctx) => {
		const categories = await ctx.db.query('categories').withIndex('by_code').collect();

		if (categories.length === 0) {
			return null;
		}

		const state = await ctx.db
			.query('gnewsFetchStates')
			.withIndex('by_source', (q) => q.eq('source', GNEWS_TOP_HEADLINES_SOURCE))
			.first();

		if (!state) {
			return categories[0];
		}

		const lastCategoryIndex = categories.findIndex(
			(category) => category.code === state.lastCategoryCode
		);
		const nextCategoryIndex =
			lastCategoryIndex === -1 ? 0 : (lastCategoryIndex + 1) % categories.length;

		return categories[nextCategoryIndex];
	}
});

export const markCategoryFetched = internalMutation({
	args: {
		categoryCode: v.string()
	},
	handler: async (ctx, { categoryCode }) => {
		const now = Date.now();
		const state = await ctx.db
			.query('gnewsFetchStates')
			.withIndex('by_source', (q) => q.eq('source', GNEWS_TOP_HEADLINES_SOURCE))
			.first();

		if (state) {
			await ctx.db.patch(state._id, {
				lastCategoryCode: categoryCode,
				lastFetchedAt: now
			});
			return state._id;
		}

		return await ctx.db.insert('gnewsFetchStates', {
			source: GNEWS_TOP_HEADLINES_SOURCE,
			lastCategoryCode: categoryCode,
			lastFetchedAt: now
		});
	}
});
import { v } from 'convex/values';
import { query } from './_generated/server';

export const getAll = query({
	handler: async (ctx) => {
		return await ctx.db.query('languages').collect();
	}
});

export const getByCode = query({
	args: {
		code: v.string()
	},
	handler: async (ctx, { code }) => {
		return await ctx.db
			.query('languages')
			.withIndex('by_code', (q) => q.eq('code', code))
			.first();
	}
});

import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { query } from './_generated/server';

export const getAll = query({
	args: {
		paginationOpts: paginationOptsValidator
	},
	handler: async (ctx, { paginationOpts }) => {
		return await ctx.db.query('headlines').order('desc').paginate(paginationOpts);
	}
});

export const getByCategory = query({
	args: {
		category: v.string(),
		paginationOpts: paginationOptsValidator
	},
	handler: async (ctx, { category, paginationOpts }) => {
		return await ctx.db
			.query('headlines')
			.withIndex('by_category_and_publishedAt', (q) => q.eq('category', category))
			.order('desc')
			.paginate(paginationOpts);
	}
});

export const getLatest = query({
	args: {
		lang: v.string()
	},
	handler: async (ctx, { lang }) => {
		return await ctx.db
			.query('headlines')
			.withIndex('by_lang_and_publishedAt', (q) => q.eq('lang', lang))
			.order('desc')
			.first();
	}
});

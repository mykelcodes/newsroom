import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { internalMutation, query } from './_generated/server';

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

const addHeadlineValidator = v.object({
	externalId: v.string(),
	title: v.string(),
	description: v.string(),
	content: v.nullable(v.string()),
	url: v.string(),
	image: v.nullable(v.string()),
	publishedAt: v.string(),
	lang: v.string(),
	category: v.string(),
	country: v.nullable(v.string()),
	sourceId: v.string(),
	sourceName: v.string(),
	sourceUrl: v.string()
});

export const add = internalMutation({
	args: addHeadlineValidator,
	handler: async (ctx, data) => {
		const existing = await ctx.db
			.query('headlines')
			.withIndex('by_externalId', (q) => q.eq('externalId', data.externalId))
			.first();

		if (existing) {
			return existing._id;
		}

		return await ctx.db.insert('headlines', data);
	}
});

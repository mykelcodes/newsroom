import { paginationOptsValidator } from 'convex/server';
import { v, type Infer } from 'convex/values';
import { query, type MutationCtx } from './_generated/server';

export const getAll = query({
	args: {
		paginationOpts: paginationOptsValidator,
		categoryCode: v.optional(v.string())
	},
	handler: async (ctx, { paginationOpts, categoryCode }) => {
		if (categoryCode) {
			return await ctx.db
				.query('headlines')
				.withIndex('by_category_and_publishedAt', (q) => q.eq('category', categoryCode))
				.order('desc')
				.paginate(paginationOpts);
		}

		return await ctx.db
			.query('headlines')
			.withIndex('by_publishedAt')
			.order('desc')
			.paginate(paginationOpts);
	}
});

export const getLatest = query({
	args: {
		count: v.optional(v.number())
	},
	handler: async (ctx, { count = 4 }) => {
		return await ctx.db.query('headlines').withIndex('by_publishedAt').order('desc').take(count);
	}
});

/**
 * @deprecated Released mobile builds still call this; new code should use
 * getAll with categoryCode. Remove once those clients are off the market.
 */
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

export const headlineInputValidator = v.object({
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

export type HeadlineInput = Infer<typeof headlineInputValidator>;

// The by_publishedAt indexes sort lexicographically, so every stored value must
// use the same ISO-8601 UTC format regardless of what the upstream API returns.
function normalizePublishedAt(publishedAt: string) {
	const timestamp = Date.parse(publishedAt);
	return Number.isNaN(timestamp) ? publishedAt : new Date(timestamp).toISOString();
}

export async function insertHeadlines(ctx: MutationCtx, headlines: HeadlineInput[]) {
	let inserted = 0;

	for (const headline of headlines) {
		const existing = await ctx.db
			.query('headlines')
			.withIndex('by_externalId_and_country', (q) =>
				q.eq('externalId', headline.externalId).eq('country', headline.country)
			)
			.first();

		if (existing) {
			continue;
		}

		await ctx.db.insert('headlines', {
			...headline,
			publishedAt: normalizePublishedAt(headline.publishedAt)
		});
		inserted++;
	}

	return inserted;
}

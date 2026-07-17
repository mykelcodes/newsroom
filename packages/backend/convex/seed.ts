import { internalMutation } from './_generated/server';

// GNews top-headlines categories. 9 categories at a 4-hour interval is ~54
// requests/day, safely inside the free tier's 100/day quota.
const DEFAULT_FETCH_INTERVAL_SECONDS = 4 * 60 * 60;

const GNEWS_CATEGORIES = [
	{ name: 'General', code: 'general' },
	{ name: 'World', code: 'world' },
	{ name: 'Nation', code: 'nation' },
	{ name: 'Business', code: 'business' },
	{ name: 'Technology', code: 'technology' },
	{ name: 'Entertainment', code: 'entertainment' },
	{ name: 'Sports', code: 'sports' },
	{ name: 'Science', code: 'science' },
	{ name: 'Health', code: 'health' }
];

/**
 * Idempotent: only inserts categories that don't exist yet, so it is safe to
 * run against a deployment that already has hand-tuned rows.
 *
 * Run with: pnpm exec convex run seed:categories
 */
export const categories = internalMutation({
	args: {},
	handler: async (ctx) => {
		let inserted = 0;

		for (const category of GNEWS_CATEGORIES) {
			const existing = await ctx.db
				.query('categories')
				.withIndex('by_code', (q) => q.eq('code', category.code))
				.first();

			if (existing) {
				continue;
			}

			await ctx.db.insert('categories', {
				name: category.name,
				code: category.code,
				enabled: true,
				description: null,
				fetchIntervalSeconds: DEFAULT_FETCH_INTERVAL_SECONDS,
				lastFetchedPage: 0,
				nextFetchAt: Date.now()
			});
			inserted++;
		}

		return { inserted, skipped: GNEWS_CATEGORIES.length - inserted };
	}
});

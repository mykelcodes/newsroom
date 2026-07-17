import { internalMutation } from './_generated/server';
import { DEFAULT_COUNTRY_FETCH_INTERVAL_SECONDS, getOrCreateCountryFetchState } from './fetchCycle';

// Kept on category rows for compatibility with existing deployments. Country
// cycles now own the active schedule.
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

const GNEWS_COUNTRIES = [
	{ name: 'United Kingdom', code: 'gb' },
	{ name: 'United States', code: 'us' }
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

/**
 * Seeds the countries used by the country/category fetch loop and initializes
 * their independent schedules.
 *
 * Run with: pnpm exec convex run seed:countries
 */
export const countries = internalMutation({
	args: {},
	handler: async (ctx) => {
		let inserted = 0;
		const now = Date.now();

		for (const country of GNEWS_COUNTRIES) {
			const existing = await ctx.db
				.query('countries')
				.withIndex('by_code', (q) => q.eq('code', country.code))
				.unique();

			const countryId =
				existing?._id ??
				(await ctx.db.insert('countries', {
					name: country.name,
					code: country.code,
					enabled: true,
					fetchIntervalSeconds: DEFAULT_COUNTRY_FETCH_INTERVAL_SECONDS
				}));

			if (!existing) {
				inserted++;
			} else if (existing.enabled === undefined || existing.fetchIntervalSeconds === undefined) {
				await ctx.db.patch(existing._id, {
					enabled: existing.enabled ?? true,
					fetchIntervalSeconds:
						existing.fetchIntervalSeconds ?? DEFAULT_COUNTRY_FETCH_INTERVAL_SECONDS
				});
			}

			await getOrCreateCountryFetchState(ctx, countryId, now);
		}

		return { inserted, skipped: GNEWS_COUNTRIES.length - inserted };
	}
});

/// <reference types="vite/client" />
import { convexTest, type TestConvex } from 'convex-test';
import { expect, test } from 'vitest';
import { api, internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import type { HeadlineInput } from './headlines';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

function setup() {
	return convexTest(schema, modules);
}

type Backend = TestConvex<typeof schema>;

function makeHeadline(overrides: Partial<HeadlineInput> = {}): HeadlineInput {
	return {
		externalId: 'ext-1',
		title: 'A headline',
		description: 'A description',
		content: null,
		url: 'https://example.com/article',
		image: null,
		publishedAt: '2026-07-12T10:30:00Z',
		lang: 'en',
		category: 'technology',
		country: 'gb',
		sourceId: 'src-1',
		sourceName: 'Example News',
		sourceUrl: 'https://example.com',
		...overrides
	};
}

async function createCategory(t: Backend) {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('categories', {
			name: 'Technology',
			code: 'technology',
			enabled: true,
			description: null,
			fetchIntervalSeconds: 3600,
			lastFetchedPage: 0,
			nextFetchAt: Date.now() - 1000
		});
	});
}

async function createCountry(t: Backend, code: 'gb' | 'us' = 'gb') {
	return await t.run(async (ctx) => {
		const countryId = await ctx.db.insert('countries', {
			name: code === 'gb' ? 'United Kingdom' : 'United States',
			code,
			enabled: true,
			fetchIntervalSeconds: 6 * 60 * 60
		});
		await ctx.db.insert('countryFetchStates', { countryId, nextFetchAt: Date.now() });
		return countryId;
	});
}

async function createInProgressJob(
	t: Backend,
	categoryId: Id<'categories'>,
	countryId: Id<'countries'>
) {
	return await t.run(async (ctx) => {
		const cycleId = await ctx.db.insert('countryFetchCycles', {
			countryId,
			status: 'in_progress',
			startedAt: Date.now(),
			totalCategories: 1,
			completedCategories: 0,
			failedCategories: 0
		});
		const fetchState = await ctx.db
			.query('gnewsFetchStates')
			.withIndex('by_key', (q) => q.eq('key', 'gnews'))
			.unique();
		if (fetchState) {
			await ctx.db.patch(fetchState._id, {
				activeCycleId: cycleId,
				lastCompletedCategoryCode: undefined
			});
		} else {
			await ctx.db.insert('gnewsFetchStates', {
				key: 'gnews',
				activeCycleId: cycleId,
				nextRequestAt: 0
			});
		}

		const jobId = await ctx.db.insert('fetchJobs', {
			categoryId,
			countryId,
			cycleId,
			status: 'in_progress',
			startedAt: Date.now(),
			error: null,
			fetchedAt: null
		});

		return { jobId, cycleId };
	});
}

test('completeJob stores headlines and country/category page progress', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const countryId = await createCountry(t);
	const { jobId, cycleId } = await createInProgressJob(t, categoryId, countryId);

	await t.mutation(internal.fetchJobs.completeJob, {
		id: jobId,
		headlines: [makeHeadline(), makeHeadline({ externalId: 'ext-2', title: 'Another' })],
		fetchedPage: 2
	});

	const headlines = await t.run(async (ctx) => await ctx.db.query('headlines').collect());
	expect(headlines).toHaveLength(2);

	const progress = await t.run(async (ctx) =>
		ctx.db
			.query('countryCategoryFetchStates')
			.withIndex('by_countryId_and_categoryId', (q) =>
				q.eq('countryId', countryId).eq('categoryId', categoryId)
			)
			.unique()
	);
	expect(progress).toMatchObject({ countryId, categoryId, lastFetchedPage: 2 });

	const cycle = await t.run(async (ctx) => await ctx.db.get(cycleId));
	expect(cycle).toMatchObject({ status: 'completed', completedCategories: 1 });
	const job = await t.run(async (ctx) => await ctx.db.get(jobId));
	expect(job).toMatchObject({ status: 'completed', dataLength: 2, fetchedPage: 2 });
});

test('headline deduplication is scoped by country', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const gbId = await createCountry(t, 'gb');
	const first = await createInProgressJob(t, categoryId, gbId);

	await t.mutation(internal.fetchJobs.completeJob, {
		id: first.jobId,
		headlines: [makeHeadline(), makeHeadline({ title: 'Same id, same country' })],
		fetchedPage: 1
	});

	const second = await createInProgressJob(t, categoryId, gbId);
	await t.mutation(internal.fetchJobs.completeJob, {
		id: second.jobId,
		headlines: [makeHeadline({ title: 'Refetched' })],
		fetchedPage: 2
	});

	const usId = await createCountry(t, 'us');
	const usJob = await createInProgressJob(t, categoryId, usId);
	await t.mutation(internal.fetchJobs.completeJob, {
		id: usJob.jobId,
		headlines: [makeHeadline({ country: 'us', title: 'US copy' })],
		fetchedPage: 1
	});

	const headlines = await t.run(async (ctx) => await ctx.db.query('headlines').collect());
	expect(headlines).toHaveLength(2);
	expect(headlines.map((headline) => headline.country).sort()).toEqual(['gb', 'us']);
});

test('completeJob normalizes publishedAt to ISO-8601 UTC', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const countryId = await createCountry(t);
	const { jobId } = await createInProgressJob(t, categoryId, countryId);

	await t.mutation(internal.fetchJobs.completeJob, {
		id: jobId,
		headlines: [makeHeadline({ publishedAt: '2026-07-12T10:30:00+02:00' })],
		fetchedPage: 1
	});

	const [headline] = await t.run(async (ctx) => await ctx.db.query('headlines').collect());
	expect(headline.publishedAt).toBe('2026-07-12T08:30:00.000Z');
});

test('getAll filters by category code', async () => {
	const t = setup();
	await t.run(async (ctx) => {
		await ctx.db.insert('headlines', makeHeadline());
		await ctx.db.insert('headlines', {
			...makeHeadline({ externalId: 'ext-2', category: 'sports' })
		});
	});

	const all = await t.query(api.headlines.getAll, {
		paginationOpts: { numItems: 10, cursor: null }
	});
	expect(all.page).toHaveLength(2);

	const sportsOnly = await t.query(api.headlines.getAll, {
		paginationOpts: { numItems: 10, cursor: null },
		categoryCode: 'sports'
	});
	expect(sportsOnly.page).toHaveLength(1);
	expect(sportsOnly.page[0].category).toBe('sports');
});

test('category and country queries hide fetch scheduling fields', async () => {
	const t = setup();
	await createCategory(t);
	await createCountry(t);

	const categories = await t.query(api.categories.getAll, {});
	const countries = await t.query(api.countries.getAll, {});

	expect(categories[0]).toMatchObject({
		name: 'Technology',
		code: 'technology',
		enabled: true
	});
	expect(categories[0]).not.toHaveProperty('nextFetchAt');
	expect(countries[0]).toMatchObject({
		name: 'United Kingdom',
		code: 'gb',
		enabled: true
	});
	expect(countries[0]).not.toHaveProperty('fetchIntervalSeconds');
});

test('seed:categories is idempotent', async () => {
	const t = setup();

	expect(await t.mutation(internal.seed.categories, {})).toEqual({ inserted: 9, skipped: 0 });
	expect(await t.mutation(internal.seed.categories, {})).toEqual({ inserted: 0, skipped: 9 });

	const categories: Doc<'categories'>[] = await t.run(async (ctx) =>
		ctx.db.query('categories').collect()
	);
	expect(categories).toHaveLength(9);
});

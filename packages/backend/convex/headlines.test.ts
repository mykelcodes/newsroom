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

async function createInProgressJob(t: Backend, categoryId: Id<'categories'>) {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('fetchJobs', {
			categoryId,
			status: 'in_progress',
			startedAt: Date.now(),
			error: null,
			fetchedAt: null
		});
	});
}

test('completeJob stores headlines, advances the schedule, and completes the job', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const jobId = await createInProgressJob(t, categoryId);
	const nextFetchAt = Date.now() + 3600 * 1000;

	await t.mutation(internal.fetchJobs.completeJob, {
		id: jobId,
		categoryId,
		headlines: [makeHeadline(), makeHeadline({ externalId: 'ext-2', title: 'Another' })],
		nextFetchAt,
		fetchedPage: 2
	});

	const headlines = await t.run(async (ctx) => await ctx.db.query('headlines').collect());
	expect(headlines).toHaveLength(2);

	const category = await t.run(async (ctx) => await ctx.db.get(categoryId));
	expect(category).toMatchObject({ nextFetchAt, lastFetchedPage: 2 });

	const job = await t.run(async (ctx) => await ctx.db.get(jobId));
	expect(job).toMatchObject({ status: 'completed', dataLength: 2, fetchedPage: 2 });
});

test('completeJob dedupes headlines by externalId', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const jobId = await createInProgressJob(t, categoryId);

	await t.mutation(internal.fetchJobs.completeJob, {
		id: jobId,
		categoryId,
		headlines: [makeHeadline(), makeHeadline({ title: 'Same id, different title' })],
		nextFetchAt: Date.now(),
		fetchedPage: 1
	});

	const secondJobId = await createInProgressJob(t, categoryId);
	await t.mutation(internal.fetchJobs.completeJob, {
		id: secondJobId,
		categoryId,
		headlines: [makeHeadline({ title: 'Refetched' })],
		nextFetchAt: Date.now(),
		fetchedPage: 2
	});

	const headlines = await t.run(async (ctx) => await ctx.db.query('headlines').collect());
	expect(headlines).toHaveLength(1);
	expect(headlines[0].title).toBe('A headline');
});

test('completeJob normalizes publishedAt to ISO-8601 UTC', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const jobId = await createInProgressJob(t, categoryId);

	await t.mutation(internal.fetchJobs.completeJob, {
		id: jobId,
		categoryId,
		headlines: [makeHeadline({ publishedAt: '2026-07-12T10:30:00+02:00' })],
		nextFetchAt: Date.now(),
		fetchedPage: 1
	});

	const [headline] = await t.run(async (ctx) => await ctx.db.query('headlines').collect());
	expect(headline.publishedAt).toBe('2026-07-12T08:30:00.000Z');
});

test('failJob pushes the category schedule forward so enqueue does not pile on', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const jobId = await createInProgressJob(t, categoryId);
	const retryAt = Date.now() + 30 * 60 * 1000;

	await t.mutation(internal.fetchJobs.failJob, {
		id: jobId,
		error: 'boom',
		categoryId,
		retryAt
	});

	const job = await t.run(async (ctx) => await ctx.db.get(jobId));
	expect(job).toMatchObject({ status: 'failed', error: 'boom' });

	const category = await t.run(async (ctx) => await ctx.db.get(categoryId));
	expect(category?.nextFetchAt).toBe(retryAt);
});

test('getAll filters by category code', async () => {
	const t = setup();
	await t.run(async (ctx) => {
		const base = makeHeadline();
		await ctx.db.insert('headlines', base);
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

test('categories.getAll does not leak fetch-scheduling fields', async () => {
	const t = setup();
	await createCategory(t);

	const categories = await t.query(api.categories.getAll, {});

	expect(categories).toHaveLength(1);
	expect(categories[0]).toMatchObject({ name: 'Technology', code: 'technology', enabled: true });
	expect(categories[0]).not.toHaveProperty('nextFetchAt');
	expect(categories[0]).not.toHaveProperty('lastFetchedPage');
	expect(categories[0]).not.toHaveProperty('fetchIntervalSeconds');
});

test('seed:categories is idempotent', async () => {
	const t = setup();

	const first = await t.mutation(internal.seed.categories, {});
	expect(first).toEqual({ inserted: 9, skipped: 0 });

	const second = await t.mutation(internal.seed.categories, {});
	expect(second).toEqual({ inserted: 0, skipped: 9 });

	const categories: Doc<'categories'>[] = await t.run(
		async (ctx) => await ctx.db.query('categories').collect()
	);
	expect(categories).toHaveLength(9);
});

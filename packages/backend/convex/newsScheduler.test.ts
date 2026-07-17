/// <reference types="vite/client" />
import { convexTest, type TestConvex } from 'convex-test';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

function setup() {
	return convexTest(schema, modules);
}

type Backend = TestConvex<typeof schema>;

async function createCategory(t: Backend, code = 'general') {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('categories', {
			name: code === 'general' ? 'General' : 'Technology',
			code,
			enabled: true,
			description: null,
			fetchIntervalSeconds: 3600,
			lastFetchedPage: 0,
			nextFetchAt: Date.now() - 1000
		});
	});
}

async function createCountry(t: Backend, code: 'gb' | 'us', nextFetchAt = Date.now() - 1000) {
	return await t.run(async (ctx) => {
		const countryId = await ctx.db.insert('countries', {
			name: code === 'gb' ? 'United Kingdom' : 'United States',
			code,
			enabled: true,
			fetchIntervalSeconds: 6 * 60 * 60
		});
		await ctx.db.insert('countryFetchStates', { countryId, nextFetchAt });
		return countryId;
	});
}

async function getJobs(t: Backend) {
	return await t.run(async (ctx) => await ctx.db.query('fetchJobs').collect());
}

async function completePendingJob(t: Backend) {
	const job = await t.run(async (ctx) => {
		return await ctx.db
			.query('fetchJobs')
			.withIndex('by_status', (q) => q.eq('status', 'pending'))
			.first();
	});

	if (!job) {
		throw new Error('Expected a pending fetch job');
	}

	await t.mutation(internal.fetchJobs.startJob, { id: job._id });
	await t.mutation(internal.fetchJobs.completeJob, {
		id: job._id,
		headlines: [],
		fetchedPage: 1
	});

	return job;
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-07-17T12:00:00Z'));
});

afterEach(() => {
	vi.useRealTimers();
});

test('enqueue starts one GB job for the first enabled category', async () => {
	const t = setup();
	const generalId = await createCategory(t, 'general');
	await createCategory(t, 'technology');
	const gbId = await createCountry(t, 'gb');
	await createCountry(t, 'us');

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	const jobs = await getJobs(t);
	expect(jobs).toHaveLength(1);
	expect(jobs[0]).toMatchObject({
		categoryId: generalId,
		countryId: gbId,
		status: 'pending'
	});

	const cycles = await t.run(async (ctx) => await ctx.db.query('countryFetchCycles').collect());
	expect(cycles[0]).toMatchObject({
		countryId: gbId,
		status: 'in_progress',
		totalCategories: 2
	});
});

test('enqueue never creates a second active request', async () => {
	const t = setup();
	await createCategory(t);
	await createCountry(t, 'gb');

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});
	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	expect(await getJobs(t)).toHaveLength(1);
});

test('the loop completes every GB category before moving to US', async () => {
	const t = setup();
	await createCategory(t, 'general');
	await createCategory(t, 'technology');
	const gbId = await createCountry(t, 'gb');
	const usId = await createCountry(t, 'us');

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});
	const first = await completePendingJob(t);
	expect(first.countryId).toBe(gbId);

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});
	const secondPending = (await getJobs(t)).find((job) => job.status === 'pending');
	expect(secondPending).toMatchObject({ countryId: gbId });

	await completePendingJob(t);
	const gbCycle = await t.run(async (ctx) => await ctx.db.get(first.cycleId!));
	expect(gbCycle).toMatchObject({
		status: 'completed',
		completedCategories: 2,
		failedCategories: 0
	});

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});
	const usPending = (await getJobs(t)).find((job) => job.status === 'pending');
	expect(usPending).toMatchObject({ countryId: usId });
});

test('retry waits for retryAt and keeps the same country/category job', async () => {
	const t = setup();
	await createCategory(t);
	await createCountry(t, 'gb');
	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	const [job] = await getJobs(t);
	await t.mutation(internal.fetchJobs.startJob, { id: job._id });
	const retryAt = Date.now() + 60_000;
	await t.mutation(internal.fetchJobs.failJob, { id: job._id, error: 'boom', retryAt });

	await t.mutation(internal.newsScheduler.retryFailedJob, {});
	expect(await t.run(async (ctx) => await ctx.db.get(job._id))).toMatchObject({
		status: 'failed',
		retryAt
	});

	vi.setSystemTime(retryAt);
	await t.mutation(internal.newsScheduler.retryFailedJob, {});
	expect(await t.run(async (ctx) => await ctx.db.get(job._id))).toMatchObject({
		status: 'pending',
		attempts: 1
	});
});

test('an exhausted category advances and marks the country cycle with errors', async () => {
	const t = setup();
	await createCategory(t);
	await createCountry(t, 'gb');
	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	const [job] = await getJobs(t);
	await t.run(async (ctx) => {
		await ctx.db.patch(job._id, {
			status: 'failed',
			attempts: 3,
			retryAt: Date.now(),
			error: 'still broken',
			fetchedAt: Date.now()
		});
	});

	await t.mutation(internal.newsScheduler.retryFailedJob, {});

	const exhausted = await t.run(async (ctx) => await ctx.db.get(job._id));
	expect(exhausted?.status).toBe('exhausted');
	const cycle = await t.run(async (ctx) => await ctx.db.get(job.cycleId!));
	expect(cycle).toMatchObject({ status: 'completed_with_errors', failedCategories: 1 });
});

test('a rate-limited job blocks the country loop until its retry time', async () => {
	const t = setup();
	await createCategory(t);
	await createCountry(t, 'gb');
	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	const [job] = await getJobs(t);
	await t.mutation(internal.fetchJobs.startJob, { id: job._id });
	const retryAt = Date.now() + 60 * 60 * 1000;
	await t.mutation(internal.fetchJobs.rateLimitJob, {
		id: job._id,
		error: '429',
		retryAt
	});

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});
	expect(await getJobs(t)).toHaveLength(1);

	await t.mutation(internal.newsScheduler.retryFailedJob, {});
	expect((await getJobs(t))[0].status).toBe('rate_limited');

	vi.setSystemTime(retryAt);
	await t.mutation(internal.newsScheduler.retryFailedJob, {});
	expect((await getJobs(t))[0]).toMatchObject({ status: 'pending', attempts: 1 });
});

test('retry recovers a stuck in-progress job', async () => {
	const t = setup();
	await createCategory(t);
	await createCountry(t, 'gb');
	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	const [job] = await getJobs(t);
	await t.run(async (ctx) => {
		await ctx.db.patch(job._id, {
			status: 'in_progress',
			startedAt: Date.now() - 20 * 60 * 1000
		});
	});

	await t.mutation(internal.newsScheduler.retryFailedJob, {});

	const recovered = await t.run(async (ctx) => await ctx.db.get(job._id));
	expect(recovered).toMatchObject({ status: 'pending', attempts: 1 });
});

test('cleanup deletes old terminal jobs and retains recent ones', async () => {
	const t = setup();
	vi.setSystemTime(new Date('2026-07-01T00:00:00Z'));
	const categoryId = await createCategory(t);
	const countryId = await createCountry(t, 'gb');

	const oldJob = await t.run(async (ctx) => {
		return await ctx.db.insert('fetchJobs', {
			categoryId,
			countryId,
			status: 'exhausted',
			error: 'old',
			fetchedAt: Date.now()
		});
	});

	vi.setSystemTime(new Date('2026-07-10T00:00:00Z'));
	const recentJob = await t.run(async (ctx) => {
		return await ctx.db.insert('fetchJobs', {
			categoryId,
			countryId,
			status: 'completed',
			error: null,
			fetchedAt: Date.now()
		});
	});

	await t.mutation(internal.newsScheduler.cleanupOldJobs, {});

	const ids = (await getJobs(t)).map((job) => job._id);
	expect(ids).toEqual([recentJob]);
	expect(ids).not.toContain(oldJob);
});

test('legacy country rows remain schedulable before backfill', async () => {
	const t = setup();
	await createCategory(t);
	const legacyCountryId = await t.run(async (ctx) => {
		return await ctx.db.insert('countries', {
			name: 'United States',
			code: 'us'
		});
	});

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	expect((await getJobs(t))[0]).toMatchObject({
		countryId: legacyCountryId,
		status: 'pending'
	});
});

test('seed:countries backfills scheduling fields on legacy rows', async () => {
	const t = setup();
	const legacyCountryId = await t.run(async (ctx) => {
		return await ctx.db.insert('countries', {
			name: 'United Kingdom',
			code: 'gb'
		});
	});

	expect(await t.mutation(internal.seed.countries, {})).toEqual({ inserted: 1, skipped: 1 });

	const country = await t.run(async (ctx) => await ctx.db.get(legacyCountryId));
	expect(country).toMatchObject({
		enabled: true,
		fetchIntervalSeconds: 6 * 60 * 60
	});
});

test('seed:countries is idempotent and initializes GB and US state', async () => {
	const t = setup();

	expect(await t.mutation(internal.seed.countries, {})).toEqual({ inserted: 2, skipped: 0 });
	expect(await t.mutation(internal.seed.countries, {})).toEqual({ inserted: 0, skipped: 2 });

	const countries: Doc<'countries'>[] = await t.run(async (ctx) =>
		ctx.db.query('countries').collect()
	);
	const states = await t.run(async (ctx) => ctx.db.query('countryFetchStates').collect());
	expect(countries.map((country) => country.code)).toEqual(['gb', 'us']);
	expect(states).toHaveLength(2);
});

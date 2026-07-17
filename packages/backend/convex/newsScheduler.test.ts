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

async function createCategory(t: Backend, overrides: Partial<Doc<'categories'>> = {}) {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('categories', {
			name: 'Technology',
			code: 'technology',
			enabled: true,
			description: null,
			fetchIntervalSeconds: 3600,
			lastFetchedPage: 0,
			nextFetchAt: Date.now() - 1000,
			...overrides
		});
	});
}

async function createJob(
	t: Backend,
	categoryId: Id<'categories'>,
	overrides: Partial<Doc<'fetchJobs'>> = {}
) {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('fetchJobs', {
			categoryId,
			status: 'pending',
			error: null,
			fetchedAt: null,
			...overrides
		});
	});
}

async function getJobs(t: Backend) {
	return await t.run(async (ctx) => await ctx.db.query('fetchJobs').collect());
}

// Fake timers keep scheduled actions (which would hit the real GNews API)
// from firing mid-test.
beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

test('enqueue creates a pending job for a due category', async () => {
	const t = setup();
	const categoryId = await createCategory(t);

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	const jobs = await getJobs(t);
	expect(jobs).toHaveLength(1);
	expect(jobs[0]).toMatchObject({ categoryId, status: 'pending' });
});

test('enqueue includes categories that have never been fetched', async () => {
	const t = setup();
	await createCategory(t, { nextFetchAt: undefined });

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	expect(await getJobs(t)).toHaveLength(1);
});

test('enqueue skips disabled and not-yet-due categories', async () => {
	const t = setup();
	await createCategory(t, { enabled: false });
	await createCategory(t, { code: 'sports', nextFetchAt: Date.now() + 60_000 });

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});

	expect(await getJobs(t)).toHaveLength(0);
});

test('enqueue does not duplicate a category that already has an active job', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	await createJob(t, categoryId, { status: 'pending' });

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});
	expect(await getJobs(t)).toHaveLength(1);

	await t.run(async (ctx) => {
		const [job] = await ctx.db.query('fetchJobs').collect();
		await ctx.db.patch(job._id, { status: 'in_progress' });
	});

	await t.mutation(internal.newsScheduler.enqueueNextFetchJob, {});
	expect(await getJobs(t)).toHaveLength(1);
});

test('retry re-queues a failed job and increments attempts', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const jobId = await createJob(t, categoryId, { status: 'failed', error: 'boom' });

	await t.mutation(internal.newsScheduler.retryFailedJob, {});

	const jobs = await getJobs(t);
	expect(jobs).toHaveLength(1);
	expect(jobs[0]).toMatchObject({ _id: jobId, status: 'pending', attempts: 1, error: null });
});

test('retry gives up after the attempt cap', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	await createJob(t, categoryId, { status: 'failed', error: 'boom', attempts: 3 });

	await t.mutation(internal.newsScheduler.retryFailedJob, {});

	const jobs = await getJobs(t);
	expect(jobs[0]).toMatchObject({ status: 'failed', attempts: 3 });
});

test('retry skips a failed job while its category has another active job', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const failedId = await createJob(t, categoryId, { status: 'failed', error: 'boom' });
	await createJob(t, categoryId, { status: 'in_progress' });

	await t.mutation(internal.newsScheduler.retryFailedJob, {});

	const failed = await t.run(async (ctx) => await ctx.db.get(failedId));
	expect(failed?.status).toBe('failed');
	expect(failed?.attempts).toBeUndefined();
});

test('retry recovers a stuck in_progress job and re-queues it', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const jobId = await createJob(t, categoryId, {
		status: 'in_progress',
		startedAt: Date.now() - 20 * 60 * 1000
	});

	await t.mutation(internal.newsScheduler.retryFailedJob, {});

	const job = await t.run(async (ctx) => await ctx.db.get(jobId));
	expect(job).toMatchObject({ status: 'pending', attempts: 1 });
});

test('retry recovers a stale pending job whose action never ran', async () => {
	const t = setup();
	vi.setSystemTime(new Date('2026-07-12T00:00:00Z'));
	const categoryId = await createCategory(t);
	const jobId = await createJob(t, categoryId, { status: 'pending' });

	vi.setSystemTime(new Date('2026-07-12T00:45:00Z'));
	await t.mutation(internal.newsScheduler.retryFailedJob, {});

	const job = await t.run(async (ctx) => await ctx.db.get(jobId));
	expect(job).toMatchObject({ status: 'pending', attempts: 1 });
});

test('a recent in_progress job is left alone', async () => {
	const t = setup();
	const categoryId = await createCategory(t);
	const jobId = await createJob(t, categoryId, {
		status: 'in_progress',
		startedAt: Date.now() - 60 * 1000
	});

	await t.mutation(internal.newsScheduler.retryFailedJob, {});

	const job = await t.run(async (ctx) => await ctx.db.get(jobId));
	expect(job?.status).toBe('in_progress');
});

test('cleanup deletes terminal jobs past retention and keeps recent ones', async () => {
	const t = setup();
	vi.setSystemTime(new Date('2026-07-01T00:00:00Z'));
	const categoryId = await createCategory(t);
	const oldCompleted = await createJob(t, categoryId, { status: 'completed' });
	const oldFailed = await createJob(t, categoryId, { status: 'failed', error: 'boom' });

	vi.setSystemTime(new Date('2026-07-10T00:00:00Z'));
	const recentCompleted = await createJob(t, categoryId, { status: 'completed' });

	await t.mutation(internal.newsScheduler.cleanupOldJobs, {});

	const jobs = await getJobs(t);
	expect(jobs.map((job) => job._id)).toEqual([recentCompleted]);
	expect(jobs.map((job) => job._id)).not.toContain(oldCompleted);
	expect(jobs.map((job) => job._id)).not.toContain(oldFailed);
});

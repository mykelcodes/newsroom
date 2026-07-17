/// <reference types="vite/client" />
import { convexTest, type TestConvex } from 'convex-test';
import { afterEach, expect, test, vi } from 'vitest';
import { internal } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

function setup() {
	return convexTest(schema, modules);
}

type Backend = TestConvex<typeof schema>;

async function createPendingUsJob(t: Backend) {
	return await t.run(async (ctx) => {
		const categoryId = await ctx.db.insert('categories', {
			name: 'Technology',
			code: 'technology',
			enabled: true,
			description: null,
			fetchIntervalSeconds: 3600,
			lastFetchedPage: 0
		});
		const countryId = await ctx.db.insert('countries', {
			name: 'United States',
			code: 'us',
			enabled: true,
			fetchIntervalSeconds: 6 * 60 * 60
		});
		await ctx.db.insert('countryFetchStates', { countryId, nextFetchAt: Date.now() });
		const cycleId = await ctx.db.insert('countryFetchCycles', {
			countryId,
			status: 'in_progress',
			startedAt: Date.now(),
			totalCategories: 1,
			completedCategories: 0,
			failedCategories: 0
		});
		await ctx.db.insert('gnewsFetchStates', {
			key: 'gnews',
			activeCycleId: cycleId,
			nextRequestAt: 0
		});
		const jobId = await ctx.db.insert('fetchJobs', {
			categoryId,
			countryId,
			cycleId,
			status: 'pending',
			error: null,
			fetchedAt: null
		});

		return { categoryId, countryId, jobId };
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
	delete process.env.GNEWS_API_KEY;
});

test('the GNews action uses the country row for its request and stored headlines', async () => {
	const t = setup();
	const { categoryId, jobId } = await createPendingUsJob(t);
	process.env.GNEWS_API_KEY = 'test-key';

	let requestedUrl: URL | undefined;
	vi.stubGlobal(
		'fetch',
		vi.fn(async (input: string | URL | Request) => {
			requestedUrl = new URL(input instanceof Request ? input.url : input.toString());
			return new Response(
				JSON.stringify({
					information: { realTimeArticles: { message: 'ok' } },
					totalArticles: 1,
					articles: [
						{
							id: 'us-article',
							title: 'US headline',
							description: 'Description',
							content: null,
							url: 'https://example.com/us',
							image: null,
							publishedAt: '2026-07-17T10:00:00Z',
							lang: 'en',
							source: {
								id: 'source',
								name: 'Source',
								url: 'https://example.com'
							}
						}
					]
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		})
	);

	await t.action(internal.gnews.getLatestHeadlines, { categoryId, jobId });

	expect(requestedUrl?.searchParams.get('country')).toBe('us');
	const [headline] = await t.run(async (ctx) => await ctx.db.query('headlines').collect());
	expect(headline).toMatchObject({ externalId: 'us-article', country: 'us' });
});

import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc } from './_generated/dataModel';
import { internalAction } from './_generated/server';
import type { HeadlineInput } from './headlines';

const DEFAULT_COUNTRY = 'gb';
const DEFAULT_LANG = 'en';
// GNews caps top-headlines usefully at the first few pages; rotate through
// them so successive fetches cover more than the first 10 stories.
const MAX_HEADLINE_PAGES = 3;
const RATE_LIMIT_BACKOFF_MS = 60 * 60 * 1000;
const FAILURE_BACKOFF_MS = 30 * 60 * 1000;

export const getLatestHeadlines = internalAction({
	args: {
		categoryId: v.id('categories'),
		jobId: v.id('fetchJobs')
	},
	handler: async (ctx, args) => {
		const category: Doc<'categories'> | null = await ctx.runMutation(internal.fetchJobs.startJob, {
			id: args.jobId
		});

		if (!category) {
			console.warn(`Fetch job ${args.jobId} skipped: category ${args.categoryId} not found`);
			return;
		}

		try {
			const apiKey = process.env.GNEWS_API_KEY;

			if (!apiKey) {
				throw new Error('GNEWS_API_KEY is not configured');
			}

			const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
			const nextPage =
				category.lastFetchedPage >= MAX_HEADLINE_PAGES ? 1 : category.lastFetchedPage + 1;

			const url = new URL('https://gnews.io/api/v4/top-headlines');
			url.searchParams.set('category', category.code);
			url.searchParams.set('apikey', apiKey);
			url.searchParams.set('country', DEFAULT_COUNTRY);
			url.searchParams.set('from', fromDate);
			url.searchParams.set('lang', DEFAULT_LANG);
			url.searchParams.set('page', nextPage.toString());

			const res = await fetch(url);

			if (res.status === 429 || res.status === 403) {
				const body = await res.text();
				const message = `Rate limited or access denied when fetching headlines for category ${category.name}: ${res.status} ${res.statusText} ${body}`;
				console.warn(message);

				await ctx.runMutation(internal.fetchJobs.rateLimitJob, {
					id: args.jobId,
					categoryId: category._id,
					error: message,
					// 403 means the daily quota is spent: wait for the reset at
					// midnight. 429 is transient throttling: back off an hour.
					nextFetchAt: res.status === 403 ? nextDayMidnight() : Date.now() + RATE_LIMIT_BACKOFF_MS
				});
				return;
			}

			if (!res.ok) {
				const body = await res.text();
				throw new Error(
					`Failed to fetch latest headlines for category ${category.name}: ${res.status} ${res.statusText} ${body}`
				);
			}

			const data = (await res.json()) as APIResponse;

			const headlines: HeadlineInput[] = data.articles.map((article) => ({
				externalId: article.id,
				title: article.title,
				description: article.description,
				content: article.content,
				url: article.url,
				image: article.image,
				publishedAt: article.publishedAt,
				lang: article.lang,
				category: category.code,
				country: DEFAULT_COUNTRY,
				sourceId: article.source.id,
				sourceName: article.source.name,
				sourceUrl: article.source.url
			}));

			await ctx.runMutation(internal.fetchJobs.completeJob, {
				id: args.jobId,
				categoryId: category._id,
				headlines,
				nextFetchAt: Date.now() + category.fetchIntervalSeconds * 1000,
				fetchedPage: nextPage
			});
		} catch (error) {
			console.error(`Error fetching headlines for category ${category.name}:`, error);
			await ctx.runMutation(internal.fetchJobs.failJob, {
				id: args.jobId,
				error: error instanceof Error ? error.message : String(error),
				categoryId: category._id,
				retryAt: Date.now() + Math.max(category.fetchIntervalSeconds * 1000, FAILURE_BACKOFF_MS)
			});
		}
	}
});

function nextDayMidnight() {
	const now = new Date();
	const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
	return nextMidnight.getTime();
}

type APIResponse = {
	information: Information;
	totalArticles: number;
	articles: Article[];
};

type Information = {
	realTimeArticles: RealTimeArticles;
};

type RealTimeArticles = {
	message: string;
};

type Article = {
	id: string;
	title: string;
	description: string;
	content: string | null;
	url: string;
	image: string | null;
	publishedAt: string;
	lang: string;
	source: Source;
};

type Source = {
	id: string;
	name: string;
	url: string;
};

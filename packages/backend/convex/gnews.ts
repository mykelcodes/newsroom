import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction } from './_generated/server';
import type { HeadlineInput } from './headlines';

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
		const jobContext = await ctx.runMutation(internal.fetchJobs.startJob, {
			id: args.jobId
		});

		if (!jobContext) {
			console.warn(`Fetch job ${args.jobId} skipped because it is no longer pending`);
			return;
		}

		const { category, country, lastFetchedPage } = jobContext;

		try {
			const apiKey = process.env.GNEWS_API_KEY;

			if (!apiKey) {
				throw new Error('GNEWS_API_KEY is not configured');
			}

			const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
			const nextPage = lastFetchedPage >= MAX_HEADLINE_PAGES ? 1 : lastFetchedPage + 1;

			const url = new URL('https://gnews.io/api/v4/top-headlines');
			url.searchParams.set('category', category.code);
			url.searchParams.set('apikey', apiKey);
			url.searchParams.set('country', country.code);
			url.searchParams.set('from', fromDate);
			url.searchParams.set('lang', DEFAULT_LANG);
			url.searchParams.set('page', nextPage.toString());

			const res = await fetch(url);

			if (res.status === 429 || res.status === 403) {
				const body = await res.text();
				const message = `Rate limited or access denied when fetching ${category.name} headlines for ${country.name}: ${res.status} ${res.statusText} ${body}`;
				console.warn(message);

				await ctx.runMutation(internal.fetchJobs.rateLimitJob, {
					id: args.jobId,
					error: message,
					// 403 means the daily quota is spent: wait for the reset at
					// midnight. 429 is transient throttling: back off an hour.
					retryAt: res.status === 403 ? nextUtcMidnight() : Date.now() + RATE_LIMIT_BACKOFF_MS
				});
				return;
			}

			if (!res.ok) {
				const body = await res.text();
				throw new Error(
					`Failed to fetch ${category.name} headlines for ${country.name}: ${res.status} ${res.statusText} ${body}`
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
				country: country.code,
				sourceId: article.source.id,
				sourceName: article.source.name,
				sourceUrl: article.source.url
			}));

			await ctx.runMutation(internal.fetchJobs.completeJob, {
				id: args.jobId,
				headlines,
				fetchedPage: nextPage
			});
		} catch (error) {
			console.error(`Error fetching ${category.name} headlines for ${country.name}:`, error);
			await ctx.runMutation(internal.fetchJobs.failJob, {
				id: args.jobId,
				error: error instanceof Error ? error.message : String(error),
				retryAt: Date.now() + FAILURE_BACKOFF_MS
			});
		}
	}
});

function nextUtcMidnight() {
	const now = new Date();
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
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

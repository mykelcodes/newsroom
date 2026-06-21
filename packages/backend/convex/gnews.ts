import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { internalAction } from './_generated/server';

const DEFAULT_COUNTRY = 'gb';
const DEFAULT_LANG = 'en';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

export const getLatestHeadlines = internalAction({
	args: {
		categoryId: v.id('categories'),
		jobId: v.id('fetchJobs')
	},
	handler: async (ctx, args) => {
		await ctx.runMutation(internal.fetchJobs.markInProgress, { id: args.jobId });
		let categoryName: string = args.categoryId;

		try {
			if (!GNEWS_API_KEY) {
				throw new Error('GNEWS_API_KEY is not configured');
			}

			const category = await ctx.runQuery(api.categories.getById, { id: args.categoryId });

			if (!category) {
				const message = `Category with ID ${args.categoryId} not found, skipping fetch job ${args.jobId}`;
				console.warn(message);
				await ctx.runMutation(internal.fetchJobs.markFailed, {
					id: args.jobId,
					error: message
				});
				return;
			}

			categoryName = category.name;

			const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
			const nextPage = category.lastFetchedPage === 3 ? 1 : category.lastFetchedPage + 1;

			const url = new URL('https://gnews.io/api/v4/top-headlines');
			url.searchParams.set('category', category.code);
			url.searchParams.set('apikey', GNEWS_API_KEY);
			url.searchParams.set('country', DEFAULT_COUNTRY);
			url.searchParams.set('from', fromDate);
			url.searchParams.set('lang', DEFAULT_LANG);
			url.searchParams.set('page', nextPage.toString());

			const res = await fetch(url);

			if (res.status === 429 || res.status === 403) {
				const body = await res.text();
				console.warn(
					`Rate limited or access denied when fetching headlines for category ${category.name}: ${res.status} ${res.statusText} ${body}`
				);

				const now = Date.now();
				await ctx.runMutation(internal.categories.updateFetchSchedule, {
					id: args.categoryId,
					nextFetchAt: res.status === 403 ? nextDayMidnight() : now + 60 * 60 * 1000,
					lastFetchedPage: category.lastFetchedPage // Don't advance page number on rate limit
				});
				await ctx.runMutation(internal.fetchJobs.markCompleted, {
					id: args.jobId,
					dataLength: 0,
					fetchedPage: category.lastFetchedPage
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

			for (const article of data.articles) {
				await ctx.runMutation(internal.headlines.add, {
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
				});
			}

			const now = Date.now();
			await ctx.runMutation(internal.categories.updateFetchSchedule, {
				id: args.categoryId,
				nextFetchAt: now + category.fetchIntervalSeconds * 1000,
				lastFetchedPage: nextPage
			});

			await ctx.runMutation(internal.fetchJobs.markCompleted, {
				id: args.jobId,
				dataLength: data.articles.length,
				fetchedPage: nextPage
			});
		} catch (error) {
			console.error(`Error fetching headlines for category ${categoryName}:`, error);
			await ctx.runMutation(internal.fetchJobs.markFailed, {
				id: args.jobId,
				error: error instanceof Error ? error.message : String(error)
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

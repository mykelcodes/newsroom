import { internal } from './_generated/api';
import { internalAction } from './_generated/server';

const DEFAULT_COUNTRY = 'gb';
const DEFAULT_LANG = 'en';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

export const getLatestHeadlines = internalAction({
	args: {},
	handler: async (ctx) => {
		if (!GNEWS_API_KEY) {
			throw new Error('GNEWS_API_KEY is not configured');
		}

		const category = await ctx.runQuery(internal.gnewsState.getNextCategory, {});

		if (!category) {
			console.warn('No categories configured for GNews headline fetching');
			return;
		}

		const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

		try {
			const url = new URL('https://gnews.io/api/v4/top-headlines');
			url.searchParams.set('category', category.code);
			url.searchParams.set('apikey', GNEWS_API_KEY);
			url.searchParams.set('country', DEFAULT_COUNTRY);
			url.searchParams.set('from', fromDate);
			url.searchParams.set('lang', DEFAULT_LANG);

			const res = await fetch(url);

			if (res.status === 429) {
				const body = await res.text();
				console.warn(`GNews rate limit reached while fetching ${category.name}: ${body}`);
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

			await ctx.runMutation(internal.gnewsState.markCategoryFetched, {
				categoryCode: category.code
			});
		} catch (error) {
			console.error(`Error fetching headlines for category ${category.name}:`, error);
		}
	}
});

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

import type { Doc } from '@newsroom/backend/dataModel';

export const siteUrl = 'https://newsroom.mykelcodes.com';

export const siteMeta = {
	title: 'Newsroom — Breaking News, Analysis & More',
	description:
		'Stay informed with the latest breaking news, in-depth analysis, and top stories across politics, tech, sports, and culture.',
	image: `${siteUrl}/newsroom/hero-main.jpg`
};

export function buildHomeJsonLd(
	articles: Doc<'headlines'>[],
	featuredArticle?: Doc<'headlines'>
): string {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: siteMeta.title,
		url: siteUrl,
		description: siteMeta.description,
		...(featuredArticle && {
			mainEntity: {
				'@type': 'NewsArticle',
				headline: featuredArticle.title,
				description: featuredArticle.description,
				url: featuredArticle.url,
				datePublished: featuredArticle.publishedAt,
				image: featuredArticle.image ?? undefined,
				publisher: {
					'@type': 'Organization',
					name: featuredArticle.sourceName,
					url: featuredArticle.sourceUrl
				}
			}
		}),
		hasPart: articles.map((a) => ({
			'@type': 'NewsArticle',
			headline: a.title,
			url: a.url,
			datePublished: a.publishedAt,
			image: a.image ?? undefined,
			publisher: {
				'@type': 'Organization',
				name: a.sourceName,
				url: a.sourceUrl
			}
		}))
	});
}

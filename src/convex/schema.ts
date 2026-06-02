import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const newsArticle = defineTable({
	externalId: v.string(),
	title: v.string(),
	description: v.string(),
	content: v.nullable(v.string()),
	url: v.string(),
	image: v.nullable(v.string()),
	publishedAt: v.string(),
	lang: v.string(),
	category: v.string(),
	country: v.nullable(v.string()),
	sourceId: v.string(),
	sourceName: v.string(),
	sourceUrl: v.string()
})
	.index('by_externalId', ['externalId'])
	.index('by_category_and_publishedAt', ['category', 'publishedAt'])
	.index('by_country_and_publishedAt', ['country', 'publishedAt'])
	.index('by_lang_and_publishedAt', ['lang', 'publishedAt'])
	.index('by_lang_category', ['lang', 'category'])
	.index('by_sourceId', ['sourceId'])
	.index('by_lang_category_country', ['lang', 'category', 'country']);

export default defineSchema({
	languages: defineTable({
		name: v.string(),
		code: v.string()
	}).index('by_code', ['code']),
	categories: defineTable({
		name: v.string(),
		code: v.string(),
		description: v.nullable(v.string())
	}).index('by_code', ['code']),
	countries: defineTable({
		name: v.string(),
		code: v.string()
	}).index('by_code', ['code']),
	headlines: newsArticle,
	articles: newsArticle
});

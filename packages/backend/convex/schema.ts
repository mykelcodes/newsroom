import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	categories: defineTable({
		name: v.string(),
		code: v.string(),
		enabled: v.boolean(),
		description: v.nullable(v.string()),
		lastFetchedAt: v.optional(v.number()),
		nextFetchAt: v.optional(v.number()),
		fetchIntervalSeconds: v.number(),
		lastFetchedPage: v.number()
	})
		.index('by_code', ['code'])
		.index('by_enabled_nextFetchAt', ['enabled', 'nextFetchAt']),
	headlines: defineTable({
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
		.index('by_publishedAt', ['publishedAt'])
		.index('by_externalId', ['externalId'])
		.index('by_category_and_publishedAt', ['category', 'publishedAt']),
	fetchJobs: defineTable({
		categoryId: v.id('categories'),
		status: v.union(
			v.literal('pending'),
			v.literal('in_progress'),
			v.literal('completed'),
			v.literal('failed'),
			v.literal('rate_limited')
		),
		error: v.nullable(v.string()),
		fetchedAt: v.nullable(v.number()),
		startedAt: v.optional(v.number()),
		attempts: v.optional(v.number()),
		dataLength: v.optional(v.number()),
		fetchedPage: v.optional(v.number())
	})
		.index('by_status', ['status'])
		.index('by_categoryId_and_status', ['categoryId', 'status'])
});

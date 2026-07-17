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
		.index('by_enabled_and_code', ['enabled', 'code'])
		.index('by_enabled_nextFetchAt', ['enabled', 'nextFetchAt']),
	countries: defineTable({
		name: v.string(),
		code: v.string(),
		// Optional during the widen/backfill phase because country rows existed
		// before scheduling configuration was added.
		enabled: v.optional(v.boolean()),
		fetchIntervalSeconds: v.optional(v.number())
	})
		.index('by_code', ['code'])
		.index('by_enabled_and_code', ['enabled', 'code']),
	countryFetchStates: defineTable({
		countryId: v.id('countries'),
		nextFetchAt: v.number(),
		lastFetchedAt: v.optional(v.number()),
		lastCycleStartedAt: v.optional(v.number()),
		lastCycleId: v.optional(v.id('countryFetchCycles'))
	}).index('by_countryId', ['countryId']),
	countryFetchCycles: defineTable({
		countryId: v.id('countries'),
		status: v.union(
			v.literal('in_progress'),
			v.literal('completed'),
			v.literal('completed_with_errors')
		),
		startedAt: v.number(),
		completedAt: v.optional(v.number()),
		totalCategories: v.number(),
		completedCategories: v.number(),
		failedCategories: v.number()
	})
		.index('by_countryId_and_startedAt', ['countryId', 'startedAt'])
		.index('by_status', ['status']),
	countryCategoryFetchStates: defineTable({
		countryId: v.id('countries'),
		categoryId: v.id('categories'),
		lastFetchedAt: v.optional(v.number()),
		lastFetchedPage: v.number()
	}).index('by_countryId_and_categoryId', ['countryId', 'categoryId']),
	gnewsFetchStates: defineTable({
		key: v.string(),
		activeCycleId: v.optional(v.id('countryFetchCycles')),
		lastCompletedCategoryCode: v.optional(v.string()),
		nextRequestAt: v.number()
	}).index('by_key', ['key']),
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
		.index('by_externalId_and_country', ['externalId', 'country'])
		.index('by_category_and_publishedAt', ['category', 'publishedAt']),
	fetchJobs: defineTable({
		categoryId: v.id('categories'),
		// Optional while legacy category-only jobs age out of the deployment.
		countryId: v.optional(v.id('countries')),
		cycleId: v.optional(v.id('countryFetchCycles')),
		status: v.union(
			v.literal('pending'),
			v.literal('in_progress'),
			v.literal('completed'),
			v.literal('failed'),
			v.literal('rate_limited'),
			v.literal('exhausted')
		),
		error: v.nullable(v.string()),
		fetchedAt: v.nullable(v.number()),
		startedAt: v.optional(v.number()),
		attempts: v.optional(v.number()),
		retryAt: v.optional(v.number()),
		dataLength: v.optional(v.number()),
		fetchedPage: v.optional(v.number())
	})
		.index('by_status', ['status'])
		.index('by_categoryId_and_status', ['categoryId', 'status'])
		.index('by_cycleId_and_status', ['cycleId', 'status'])
});

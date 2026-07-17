import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';

export const FETCH_JOB_SPACING_MS = 10 * 1000;
export const DEFAULT_COUNTRY_FETCH_INTERVAL_SECONDS = 6 * 60 * 60;
export const MAX_CATEGORIES_PER_CYCLE = 100;
export const MAX_COUNTRIES = 100;

const FETCH_STATE_KEY = 'gnews';

export async function getOrCreateGnewsFetchState(ctx: MutationCtx) {
	const existing = await ctx.db
		.query('gnewsFetchStates')
		.withIndex('by_key', (q) => q.eq('key', FETCH_STATE_KEY))
		.unique();

	if (existing) {
		return existing;
	}

	const id = await ctx.db.insert('gnewsFetchStates', {
		key: FETCH_STATE_KEY,
		nextRequestAt: 0
	});

	return (await ctx.db.get(id))!;
}

export async function getOrCreateCountryFetchState(
	ctx: MutationCtx,
	countryId: Id<'countries'>,
	nextFetchAt = Date.now()
) {
	const existing = await ctx.db
		.query('countryFetchStates')
		.withIndex('by_countryId', (q) => q.eq('countryId', countryId))
		.unique();

	if (existing) {
		return existing;
	}

	const id = await ctx.db.insert('countryFetchStates', {
		countryId,
		nextFetchAt
	});

	return (await ctx.db.get(id))!;
}

export async function getNextEnabledCategory(ctx: MutationCtx, afterCode?: string) {
	const query = ctx.db
		.query('categories')
		.withIndex('by_enabled_and_code', (q) =>
			afterCode ? q.eq('enabled', true).gt('code', afterCode) : q.eq('enabled', true)
		);

	return await query.first();
}

export async function getEnabledCategories(ctx: MutationCtx) {
	return await ctx.db
		.query('categories')
		.withIndex('by_enabled_and_code', (q) => q.eq('enabled', true))
		.take(MAX_CATEGORIES_PER_CYCLE);
}

export async function getDueCountry(ctx: MutationCtx, now: number) {
	const countries = await ctx.db.query('countries').withIndex('by_code').take(MAX_COUNTRIES);

	let due: { country: Doc<'countries'>; state: Doc<'countryFetchStates'> } | undefined;

	for (const country of countries) {
		// Legacy {code, name} rows are enabled until the seed backfills them.
		if (country.enabled === false) {
			continue;
		}

		const state = await getOrCreateCountryFetchState(ctx, country._id, now);

		if (state.nextFetchAt > now) {
			continue;
		}

		if (
			!due ||
			state.nextFetchAt < due.state.nextFetchAt ||
			(state.nextFetchAt === due.state.nextFetchAt && country.code < due.country.code)
		) {
			due = { country, state };
		}
	}

	return due;
}

export async function advanceCountryCycle(
	ctx: MutationCtx,
	job: Doc<'fetchJobs'>,
	outcome: 'completed' | 'failed'
) {
	if (!job.countryId || !job.cycleId) {
		return;
	}

	const [fetchState, cycle, category, country] = await Promise.all([
		getOrCreateGnewsFetchState(ctx),
		ctx.db.get(job.cycleId),
		ctx.db.get(job.categoryId),
		ctx.db.get(job.countryId)
	]);

	if (
		!cycle ||
		cycle.status !== 'in_progress' ||
		fetchState.activeCycleId !== cycle._id ||
		!category
	) {
		return;
	}

	const completedCategories = cycle.completedCategories + (outcome === 'completed' ? 1 : 0);
	const failedCategories = cycle.failedCategories + (outcome === 'failed' ? 1 : 0);
	const now = Date.now();
	const nextRequestAt = Math.max(fetchState.nextRequestAt, now + FETCH_JOB_SPACING_MS);
	const nextCategory = await getNextEnabledCategory(ctx, category.code);

	if (nextCategory) {
		await ctx.db.patch(cycle._id, { completedCategories, failedCategories });
		await ctx.db.patch(fetchState._id, {
			lastCompletedCategoryCode: category.code,
			nextRequestAt
		});
		await ctx.scheduler.runAfter(
			Math.max(0, nextRequestAt - now),
			internal.newsScheduler.enqueueNextFetchJob,
			{}
		);
		return;
	}

	await ctx.db.patch(cycle._id, {
		status: failedCategories > 0 ? 'completed_with_errors' : 'completed',
		completedAt: now,
		completedCategories,
		failedCategories
	});

	if (country) {
		const countryState = await getOrCreateCountryFetchState(ctx, country._id, now);
		await ctx.db.patch(countryState._id, {
			lastFetchedAt: now,
			lastCycleId: cycle._id,
			nextFetchAt:
				now + (country.fetchIntervalSeconds ?? DEFAULT_COUNTRY_FETCH_INTERVAL_SECONDS) * 1000
		});
	}

	await ctx.db.patch(fetchState._id, {
		activeCycleId: undefined,
		lastCompletedCategoryCode: undefined,
		nextRequestAt
	});

	await ctx.scheduler.runAfter(
		Math.max(0, nextRequestAt - now),
		internal.newsScheduler.enqueueNextFetchJob,
		{}
	);
}

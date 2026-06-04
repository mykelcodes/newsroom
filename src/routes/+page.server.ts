import { api } from '../convex/_generated/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const initialCategoriesPromise = locals.convexClient.query(api.categories.getAll, {});
	const initialLatestPromise = locals.convexClient.query(api.headlines.getLatest, {
		count: 4
	});
	const otherNewsPromise = locals.convexClient.query(api.headlines.getAll, {
		paginationOpts: { numItems: 14, cursor: null }
	});

	const [initialCategories, initialLatest, otherNews] = await Promise.all([
		initialCategoriesPromise,
		initialLatestPromise,
		otherNewsPromise
	]);

	return { initialCategories, initialLatest, otherNews };
};

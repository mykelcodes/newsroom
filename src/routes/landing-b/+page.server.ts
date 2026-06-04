import { api } from '../../convex/_generated/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const initialCategories = await locals.convexClient.query(api.categories.getAll, {});

	return { initialCategories };
};

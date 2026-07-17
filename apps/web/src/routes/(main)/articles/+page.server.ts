import { api } from '@newsroom/backend/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const category = getOptionalParam(url.searchParams.get('category'));

	const articles = await locals.convexClient.query(api.headlines.getAll, {
		paginationOpts: { numItems: 20, cursor: null },
		categoryCode: category
	});

	return { articles };
};

function getOptionalParam(value: string | null) {
	const trimmed = value?.trim();

	return trimmed ? trimmed.toLowerCase() : undefined;
}

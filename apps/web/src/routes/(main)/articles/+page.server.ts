import { api } from '@newsroom/backend/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const category = getOptionalParam(url.searchParams.get('category'));
	const rawPage = url.searchParams.get('page');
	const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;

	const articles = await locals.convexClient.query(api.headlines.getAll, {
		paginationOpts: { numItems: 20, cursor: null },
		categoryCode: category ?? undefined
	});

	return {
		articles,
		filters: {
			category,
			page: parsedPage
		}
	};
};

function getOptionalParam(value: string | null) {
	const trimmed = value?.trim();

	return trimmed ? trimmed.toLowerCase() : null;
}

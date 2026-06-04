import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const category = getOptionalParam(url.searchParams.get('category'));
	const type = getOptionalParam(url.searchParams.get('type'));
	const rawPage = url.searchParams.get('page');
	const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
	const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

	return {
		filters: {
			category,
			type,
			page,
			hasQuery: category !== null || type !== null || rawPage !== null
		}
	};
};

function getOptionalParam(value: string | null) {
	const trimmed = value?.trim();

	return trimmed ? trimmed.toLowerCase() : null;
}

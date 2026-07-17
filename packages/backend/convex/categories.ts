import { query } from './_generated/server';

// Only the fields clients render — fetch-scheduling state (nextFetchAt,
// lastFetchedPage, ...) stays private to the backend.
export const getAll = query({
	args: {},
	handler: async (ctx) => {
		const categories = await ctx.db.query('categories').take(100);
		return categories.map(({ _id, name, code, enabled }) => ({ _id, name, code, enabled }));
	}
});

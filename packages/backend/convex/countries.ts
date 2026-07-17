import { query } from './_generated/server';

const MAX_COUNTRIES = 100;

export const getAll = query({
	args: {},
	handler: async (ctx) => {
		const countries = await ctx.db.query('countries').withIndex('by_code').take(MAX_COUNTRIES);

		return countries.map(({ _id, name, code, enabled }) => ({
			_id,
			name,
			code,
			enabled: enabled ?? true
		}));
	}
});

import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

export const markInProgress = internalMutation({
	args: {
		id: v.id('fetchJobs')
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			status: 'in_progress',
			error: null,
			fetchedAt: null
		});
	}
});

export const markCompleted = internalMutation({
	args: {
		id: v.id('fetchJobs')
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			status: 'completed',
			fetchedAt: Date.now()
		});
	}
});

export const markFailed = internalMutation({
	args: {
		id: v.id('fetchJobs'),
		error: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			status: 'failed',
			error: args.error,
			fetchedAt: Date.now()
		});
	}
});

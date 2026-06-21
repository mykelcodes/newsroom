import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

if (process.env.RUN_GNEWS_CRON === 'true') {
	crons.interval(
		'fetch latest GNews headlines',
		{ minutes: 15 },
		internal.newsScheduler.enqueueNextFetchJob
	);

	crons.interval(
		'retry failed GNews fetch jobs',
		{ minutes: 5 },
		internal.newsScheduler.retryFailedJob
	);
}

export default crons;

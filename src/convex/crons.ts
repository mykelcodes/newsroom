import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

if (process.env.RUN_GNEWS_CRON === 'true') {
	crons.interval(
		'fetch latest GNews headlines',
		{ seconds: 100 },
		internal.gnews.getLatestHeadlines
	);
}

export default crons;

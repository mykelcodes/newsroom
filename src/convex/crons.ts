import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval('fetch latest GNews headlines', { minutes: 10 }, internal.gnews.getLatestHeadlines);

export default crons;
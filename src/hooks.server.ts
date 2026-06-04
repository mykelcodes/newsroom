import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';

export const handle: Handle = async ({ event, resolve }) => {
	const convexClient = new ConvexHttpClient(PUBLIC_CONVEX_URL);
	event.locals.convexClient = convexClient;

	return await resolve(event);
};

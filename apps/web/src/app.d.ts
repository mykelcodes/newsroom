// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { ConvexHttpClient } from 'convex/browser';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		interface Locals {
			convexClient: ConvexHttpClient;
		}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};

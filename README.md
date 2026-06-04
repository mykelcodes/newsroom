# Newsroom

Newsroom is a SvelteKit and Convex project for collecting, storing, querying, and presenting news headlines. The backend ingestion pipeline uses Convex scheduled jobs to fetch top headlines from GNews, store unique articles, and expose query functions. The frontend includes a responsive editorial newsroom landing page built from reusable Svelte components and local image assets.

The repository is public, so configuration examples use placeholder values only. Do not commit real API keys, deployment secrets, or local environment files.

## What It Does

- Fetches GNews top headlines by enabled category.
- Stores normalized headline/article records in Convex.
- Deduplicates headlines by external article ID.
- Tracks fetch jobs with `pending`, `in_progress`, `completed`, and `failed` states.
- Retries failed fetch jobs on a cron schedule.
- Spaces scheduled fetch actions apart to reduce bursty upstream API traffic.
- Provides Convex queries for listing headlines and reading headlines by category/language.
- Presents a responsive newsroom homepage with a masthead, category navigation, hero collage, latest news, video highlights, popular stories, and footer newsletter form.
- Supports a light/dark UI theme toggle with the selected theme stored in local storage.

The homepage currently uses static editorial data and image assets in `src/routes/+page.svelte` and `static/newsroom`. The Convex headline queries are available for wiring live data into the UI as the product evolves.

## Tech Stack

- SvelteKit 2 and Svelte 5
- TypeScript
- Convex for database, server functions, scheduled jobs, and generated API types
- Tailwind CSS v4 and component-scoped Svelte styles for the UI
- Cloudflare adapter and Wrangler for deployment targets
- pnpm for package management
- Prettier and ESLint for formatting/linting

## Project Structure

```txt
src/
	convex/
		schema.ts          Convex tables and indexes
		gnews.ts           Internal action that fetches GNews headlines
		newsScheduler.ts   Cron-facing job enqueue/retry logic
		fetchJobs.ts       Fetch job state transitions
		headlines.ts       Headline queries and insert mutation
		categories.ts      Category queries and fetch schedule updates
	lib/
		components/
			newsroom/        Header, hero, article, video, popular-news, and footer UI components
	routes/
		+page.svelte       SvelteKit app entry page
		layout.css         Global typography, theme variables, and shared base styles
static/
	newsroom/            Local images used by the newsroom landing page
```

## Prerequisites

- Node.js compatible with the package versions in `package.json`
- pnpm
- A Convex account/project
- A GNews API key
- Wrangler if you plan to build or preview the Cloudflare output

## Environment Variables

Copy the example file and fill in local values:

```sh
cp .env.example .env.local
```

Expected variables:

```sh
GNEWS_API_KEY=
RUN_GNEWS_CRON=
CONVEX_DEPLOYMENT=
PUBLIC_CONVEX_URL=
PUBLIC_CONVEX_SITE_URL=
```

Notes:

- `GNEWS_API_KEY` is required by the Convex GNews fetch action.
- `RUN_GNEWS_CRON=true` enables the GNews cron definitions in `src/convex/crons.ts`.
- `CONVEX_DEPLOYMENT` and `PUBLIC_CONVEX_URL` are created by Convex setup/dev flows.
- Keep real values in `.env.local` or Convex environment variables. `.env.local` is ignored by Git.
- For deployed Convex functions, set sensitive values with Convex environment management, for example `pnpm exec convex env set GNEWS_API_KEY <value>`.

## Getting Started

Install dependencies:

```sh
pnpm install
```

Start Convex and the SvelteKit dev server together:

```sh
pnpm dev
```

Or start each process separately if you want to inspect their logs in different terminals:

```sh
pnpm convex:dev
```

Start the SvelteKit dev server in another terminal:

```sh
pnpm exec vite dev
```

## Convex Data Setup

The scheduler reads enabled category documents from the `categories` table. Category documents need these fields:

```ts
{
	name: string;
	code: string;
	enabled: boolean;
	description: string | null;
	fetchIntervalSeconds: number;
	lastFetchedPage: number;
	nextFetchAt?: number;
	lastFetchedAt?: number;
}
```

Set `nextFetchAt` to a timestamp at or before `Date.now()` when you want a category to be eligible for the next scheduled fetch.

## Available Scripts

```sh
pnpm convex:dev      # Run Convex locally
pnpm convex:build    # Validate/build Convex functions
pnpm convex:deploy   # Deploy Convex functions
pnpm dev             # Run Convex and Vite together
pnpm build           # Build the SvelteKit app for Cloudflare
pnpm preview         # Preview the Cloudflare worker output
pnpm check           # Run Svelte/TypeScript checks
pnpm lint            # Run Prettier check and ESLint
pnpm format          # Format the repository
```

## Secret Safety

This repository should not contain production secrets.

- `.env.example` is tracked and intentionally contains empty placeholders.
- `.env`, `.env.*`, and `.env.local` are ignored, except for safe example/test files allowed by `.gitignore`.
- Do not paste API keys into source files, README examples, issues, commits, or screenshots.
- If a secret is accidentally committed, rotate it immediately and remove it from Git history before relying on the repository again.
- Before pushing, check that only placeholder env files are tracked and that no concrete key values appear in source or docs.

## Frontend UI

The staged UI is a static, responsive newsroom landing page composed from files in `src/lib/components/newsroom`:

- `Header.svelte` provides the top bar, social links, category drawer, primary navigation, search button, and theme toggle.
- `Hero.svelte` renders the oversized NEWSROOM masthead, category ticker, and image collage.
- `FeaturedArticle.svelte`, `ArticleGrid.svelte`, and `ArticleCard.svelte` render the latest-news feature and supporting cards.
- `EditorialBand.svelte`, `VideoGrid.svelte`, and `PopularNews.svelte` add the editorial image band, video highlights, and popular-story list.
- `Footer.svelte` includes newsletter signup, footer navigation, social links, and a back-to-top link.

The UI is not yet connected to live Convex headline data. Article content in `src/routes/+page.svelte` is sample content used to compose and style the page.

## Current Status

Newsroom is an early-stage project. The backend ingestion model is in active development, and the SvelteKit frontend has a polished static landing page ready to be connected to live Convex data.

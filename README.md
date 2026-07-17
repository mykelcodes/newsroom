# Newsroom

Newsroom is a SvelteKit and Convex project for collecting, storing, querying, and presenting news headlines. The backend ingestion pipeline uses Convex scheduled jobs to fetch top headlines from GNews, store unique articles, and expose query functions. The frontend includes a responsive editorial newsroom landing page built from reusable Svelte components and local image assets.

The repository is public, so configuration examples use placeholder values only. Do not commit real API keys, deployment secrets, or local environment files.

## What It Does

- Fetches GNews top headlines by enabled category.
- Stores normalized headline records in Convex (publish dates normalized to ISO-8601 UTC, deduplicated by external article ID).
- Tracks fetch jobs with `pending`, `in_progress`, `completed`, `failed`, and `rate_limited` states.
- Retries failed fetch jobs on a cron schedule with a capped attempt count, recovers jobs stuck `pending`/`in_progress`, and never enqueues a category that already has an active job.
- Backs off on upstream rate limits (an hour on 429, until midnight on 403) and pushes a failing category's schedule forward so the enqueue cron cannot pile on duplicate jobs.
- Cleans up terminal job records older than seven days via a daily cron.
- Spaces scheduled fetch actions apart to reduce bursty upstream API traffic.
- Provides Convex queries for listing headlines, optionally filtered by category.
- Presents a responsive newsroom homepage (masthead, category navigation, hero collage, latest news, popular stories, newsletter footer) server-rendered from Convex data and kept live on the client with `convex-svelte`.
- Supports a light/dark UI theme toggle with the selected theme stored in local storage.

## Tech Stack

- SvelteKit 2 and Svelte 5
- TypeScript
- Convex for database, server functions, scheduled jobs, and generated API types
- Tailwind CSS v4 and component-scoped Svelte styles for the UI
- Cloudflare adapter and Wrangler for deployment targets
- pnpm for package management
- Prettier and ESLint for formatting/linting

## Project Structure

pnpm monorepo (pnpm workspace) with two apps sharing one Convex backend:

```txt
apps/
	web/                     SvelteKit app (Cloudflare), consumes @newsroom/backend
		src/lib/components/
			newsroom/            Header, hero, article, video, popular-news, and footer UI components
		src/routes/
			+page.svelte         SvelteKit app entry page
			layout.css           Global typography, theme variables, and shared base styles
		static/newsroom/         Local images used by the newsroom landing page
	mobile/                  Expo (React Native) app, expo-router, consumes @newsroom/backend
		app/                     File-based routes (_layout.tsx wires the Convex provider)
packages/
	backend/                 Shared Convex backend (@newsroom/backend)
		convex/
			schema.ts            Convex tables and indexes
			gnews.ts             Internal action that fetches GNews headlines
			newsScheduler.ts     Cron-facing job enqueue/retry logic
			fetchJobs.ts         Fetch job state transitions
			headlines.ts         Headline queries and insert mutation
			categories.ts        Category queries and fetch schedule updates
		convex.json              Points Convex at ./convex
```

The web and mobile apps import the generated client from the shared package:
`import { api } from '@newsroom/backend/api'` and
`import type { Doc } from '@newsroom/backend/dataModel'`.

## Prerequisites

- Node.js compatible with the package versions in `package.json`
- pnpm
- A Convex account/project
- A GNews API key
- Wrangler if you plan to build or preview the Cloudflare output

## Environment Variables

Env vars live with the package that consumes them. Copy each example file and fill in local values:

```sh
cp packages/backend/.env.example packages/backend/.env.local   # Convex backend
cp apps/web/.env.example apps/web/.env.local                   # SvelteKit web app
cp apps/mobile/.env.example apps/mobile/.env                    # Expo mobile app
```

Expected variables:

```sh
# packages/backend/.env.local
GNEWS_API_KEY=
RUN_GNEWS_CRON=
CONVEX_DEPLOYMENT=

# apps/web/.env.local
PUBLIC_CONVEX_URL=
PUBLIC_CONVEX_SITE_URL=

# apps/mobile/.env
EXPO_PUBLIC_CONVEX_URL=
```

Notes:

- `GNEWS_API_KEY` is required by the Convex GNews fetch action.
- `RUN_GNEWS_CRON=true` enables the GNews cron definitions in `packages/backend/convex/crons.ts`.
- `CONVEX_DEPLOYMENT` and the `*_CONVEX_URL` values are created by Convex setup/dev flows.
- Keep real values in `.env.local` or Convex environment variables. `.env.local` is ignored by Git.
- For deployed Convex functions, set sensitive values with Convex environment management, for example `pnpm exec convex env set GNEWS_API_KEY <value>`.

## Getting Started

Install dependencies:

```sh
pnpm install
```

Start the Convex backend and the SvelteKit web dev server together:

```sh
pnpm dev
```

Or start each process separately if you want to inspect their logs in different terminals:

```sh
pnpm dev:backend   # Convex
pnpm dev:web       # SvelteKit
pnpm dev:mobile    # Expo (mobile)
```

## Convex Data Setup

The scheduler reads enabled category and country documents. Seed the standard GNews categories and the initial GB/US countries with:

```sh
pnpm --filter @newsroom/backend exec convex run seed:categories
pnpm --filter @newsroom/backend exec convex run seed:countries
```

Both seeds are idempotent. The country seed also backfills scheduling defaults on legacy `{ code, name }` rows. The fetcher completes every enabled category for one due country before moving to the next due country, and persists page progress separately for each country/category pair. Country cycles default to six hours, keeping GB and US at about 72 scheduled requests per day before retries; tune `fetchIntervalSeconds` on country rows for your GNews plan.

## Available Scripts

Run from the repo root:

```sh
pnpm dev             # Run Convex backend + SvelteKit web together
pnpm dev:web         # SvelteKit web dev server
pnpm dev:mobile      # Expo mobile dev server
pnpm dev:backend     # Convex dev (codegen + push)
pnpm build:web       # Build the SvelteKit app for Cloudflare
pnpm convex:deploy   # Deploy Convex functions
pnpm check           # Run checks across all packages
pnpm lint            # Lint across all packages
pnpm test            # Run tests across all packages (backend: vitest + convex-test)
pnpm format          # Format the repository
```

CI (GitHub Actions, `.github/workflows/ci.yml`) runs lint, check, and test on pushes to `main` and on pull requests.

Per-package commands use pnpm filters, e.g. `pnpm --filter web preview`,
`pnpm --filter @newsroom/backend deploy`, or `pnpm --filter mobile ios`.

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
- `EditorialBand.svelte` and `PopularNews.svelte` add the editorial image band and popular-story list.
- `Footer.svelte` includes newsletter signup, footer navigation, social links, and a back-to-top link.

Pages are server-rendered from Convex via `+layout.server.ts`/`+page.server.ts` loads, then hydrated into live `convex-svelte` queries on the client. The hero collage images in `static/newsroom` are the only static editorial assets.

## Current Status

Newsroom is an early-stage project: the GNews ingestion pipeline, the SvelteKit web app, and the Expo mobile app all run against the same live Convex backend, with tests covering the scheduler and ingestion paths.

<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { api } from '@newsroom/backend/api';
	import type { Doc } from '@newsroom/backend/dataModel';
	import ArticleCard from '$lib/components/newsroom/ArticleCard.svelte';
	import { siteMeta, siteUrl } from '$lib/seo';
	import { useQuery } from 'convex-svelte';
	import { untrack } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const category = $derived(page.url.searchParams.get('category') || undefined);
	let continueCursor = $state<string | null>(null);
	let articles = $state<Doc<'headlines'>[]>([]);

	const articlesQuery = $derived(
		useQuery(
			api.headlines.getAll,
			{ paginationOpts: { numItems: 20, cursor: continueCursor }, categoryCode: category },
			{ initialData: untrack(() => data.articles) }
		)
	);

	let hasMore = $derived(articlesQuery.data?.isDone !== true);

	$effect(() => {
		resetArticles(category);
	});

	function resetArticles(categoryKey?: string) {
		if (categoryKey === '') return;

		continueCursor = null;
		articles = [];
	}

	$effect(() => {
		const page = articlesQuery.data?.page;

		if (!page) return;

		if (continueCursor === null) {
			articles = page;
			return;
		}

		const currentArticles = untrack(() => articles);
		articles = [
			...currentArticles,
			...page.filter((article) => !currentArticles.some((a) => a._id === article._id))
		];
	});
</script>

<svelte:head>
	<title>Articles | Newsroom</title>
	<meta
		name="description"
		content="Browse the latest news articles across politics, tech, sports, culture, and more."
	/>
	<link rel="canonical" href="{siteUrl}/articles" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Newsroom" />
	<meta property="og:title" content="Articles | Newsroom" />
	<meta
		property="og:description"
		content="Browse the latest news articles across politics, tech, sports, culture, and more."
	/>
	<meta property="og:url" content="{siteUrl}/articles" />
	<meta property="og:image" content={siteMeta.image} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Articles | Newsroom" />
	<meta
		name="twitter:description"
		content="Browse the latest news articles across politics, tech, sports, culture, and more."
	/>
	<meta name="twitter:image" content={siteMeta.image} />
</svelte:head>

<main class="articles-page">
	<section class="articles-hero" aria-labelledby="articles-title">
		<div class="hero-inner">
			<div class="hero-copy">
				<h1 id="articles-title" class="text-center">All articles</h1>
			</div>
		</div>
	</section>

	<section class="article-results" aria-labelledby="article-results-title">
		<div class="results-inner">
			<div class="results-heading">
				<div>
					<h2 id="article-results-title">Latest from the archive</h2>
				</div>
				{#if category}
					<a href={resolve('/articles')}>Reset</a>
				{/if}
			</div>

			{#if articles.length}
				<div class="article-grid">
					{#each articles as article (article._id)}
						<ArticleCard {article} />
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>No articles found {category ? `for category "${category}"` : 'in the archive'}.</p>
					<a href={resolve('/articles')}> Show all articles </a>
				</div>
			{/if}

			{#if hasMore}
				<div class="load-more">
					<button
						type="button"
						onclick={() => (continueCursor = articlesQuery.data?.continueCursor || null)}
					>
						Load more
					</button>
				</div>
			{/if}
		</div>
	</section>
</main>

<style>
	.articles-page {
		background: var(--surface);
		color: var(--ink);
	}

	.articles-hero {
		border-bottom: 1px solid var(--line-strong);
	}

	.hero-inner,
	.results-inner {
		max-width: 1320px;
		margin: 0 auto;
	}

	.hero-inner {
		display: grid;
		grid-template-columns: 180px minmax(0, 1fr) 250px;
		gap: 40px;
		align-items: end;
		padding: 76px 0 56px;
	}

	.hero-copy {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	h1,
	h2 {
		margin: 0;
	}

	h1 {
		font-size: clamp(64px, 10vw, 152px);
		font-weight: 500;
		line-height: 0.92;
		letter-spacing: 0;
		text-align: center;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	.empty-state a,
	.results-heading a {
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		padding: 8px 14px;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
	}

	.empty-state a {
		background: var(--ink);
		color: var(--surface);
	}

	.results-inner {
		padding: 56px 0 88px;
	}

	.results-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 24px;
		border-bottom: 1px solid var(--line);
		padding-bottom: 18px;
	}

	.results-heading div {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	h2 {
		font-size: 40px;
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: 0;
	}

	.article-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 44px 28px;
		margin-top: 40px;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		margin-top: 40px;
		border: 1px solid var(--line);
		padding: 28px;
	}

	.empty-state p {
		margin: 0;
		color: var(--ink-soft);
		font-size: 18px;
		line-height: 1.4;
	}

	.load-more {
		display: flex;
		justify-content: center;
		margin-top: 56px;
	}

	.load-more button {
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		padding: 10px 28px;
		background: transparent;
		color: var(--ink);
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
		cursor: pointer;
	}

	.load-more button:hover {
		background: var(--ink);
		color: var(--surface);
	}

	@media (max-width: 1024px) {
		.hero-inner,
		.results-inner {
			padding-right: 32px;
			padding-left: 32px;
		}

		.hero-inner {
			grid-template-columns: 1fr;
			gap: 28px;
			padding-top: 64px;
			padding-bottom: 44px;
		}

		.article-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 40px 24px;
		}
	}

	@media (max-width: 640px) {
		.hero-inner,
		.results-inner {
			padding-right: 20px;
			padding-left: 20px;
		}

		.hero-inner {
			padding-top: 44px;
		}

		h1 {
			font-size: 56px;
		}

		.results-heading,
		.empty-state {
			align-items: flex-start;
			flex-direction: column;
		}

		.article-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

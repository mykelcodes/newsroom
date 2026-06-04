<script lang="ts">
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api.js';
	import Footer from '$lib/components/newsroom/Footer.svelte';
	import Header from '$lib/components/newsroom/Header.svelte';
	import TextArticleCard from '$lib/components/newsroom/TextArticleCard.svelte';
	import { articles } from '$lib/data/newsroomText';
	import { useQuery } from 'convex-svelte';
	import { untrack } from 'svelte';

	let { data } = $props();

	const categoriesQuery = useQuery(
		api.categories.getAll,
		{},
		{ initialData: untrack(() => data.initialCategories) }
	);

	const leadArticle = articles[0];
	const latestArticles = articles.slice(1, 5);
	const popularArticles = articles.slice(5, 10);
</script>

<svelte:head>
	<title>Landing B | Newsroom</title>
	<meta name="description" content="A text-first newsroom landing page variant." />
</svelte:head>

<Header categories={categoriesQuery.data} />
<main class="landing-b">
	<section class="masthead" aria-labelledby="landing-b-title">
		<div class="masthead-inner">
			<div class="masthead-title">
				<h1 id="landing-b-title">NEWSROOM</h1>
				<div class="ticker" aria-label="News categories">
					{#each categoriesQuery.data as category (category.code)}
						<span>{category.name}</span>
					{/each}
				</div>
			</div>
			<div class="lead-shell">
				<TextArticleCard article={leadArticle} variant="feature" />
			</div>
		</div>
	</section>

	<section class="latest" aria-labelledby="landing-b-latest">
		<div class="section-inner">
			<div class="section-heading">
				<h2 id="landing-b-latest">Latest news</h2>
				<a href={resolve('/articles-b')}>See all</a>
			</div>
			<div class="latest-grid">
				{#each latestArticles as article, index (article.title)}
					<TextArticleCard {article} {index} />
				{/each}
			</div>
		</div>
	</section>

	<section class="popular" aria-labelledby="landing-b-popular">
		<div class="section-inner">
			<div class="section-heading">
				<h2 id="landing-b-popular">Popular news</h2>
				<a href={resolve('/articles-b?type=news')}>See all</a>
			</div>
			<div class="popular-list">
				{#each popularArticles as article, index (article.title)}
					<TextArticleCard {article} {index} variant="list" />
				{/each}
			</div>
		</div>
	</section>
</main>
<Footer />

<style>
	.landing-b {
		overflow-x: clip;
		background: var(--surface);
		color: var(--ink);
	}

	.masthead {
		overflow: hidden;
		border-bottom: 1px solid var(--line-strong);
	}

	.masthead-inner,
	.section-inner {
		max-width: 1320px;
		margin: 0 auto;
	}

	.masthead-inner {
		padding: 40px 0 72px;
	}

	.masthead-title {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		min-width: 0;
		margin-top: 38px;
	}

	.ticker {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20px;
		width: 100%;
		overflow: hidden;
		transform: translate(-50%, -50%);
		border-top: 1.5px solid var(--line-strong);
		border-bottom: 1.5px solid var(--line-strong);
		background: var(--surface);
		padding: 9px 0;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.ticker span {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.ticker span:not(:last-child)::after {
		content: '';
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--ink);
	}

	h1,
	h2 {
		margin: 0;
	}

	h1 {
		max-width: 100%;
		font-size: clamp(56px, 12.5vw, 180px);
		font-weight: 500;
		line-height: 0.9;
		letter-spacing: 0;
		text-align: center;
		white-space: nowrap;
	}

	.lead-shell {
		margin-top: 48px;
	}

	.latest,
	.popular {
		padding: 56px 0 72px;
	}

	.section-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		border-bottom: 1px solid var(--line);
		padding-bottom: 18px;
	}

	.section-heading h2 {
		font-size: 40px;
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: 0;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	.section-heading a {
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		padding: 8px 14px;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
	}

	.section-heading a:hover {
		background: var(--ink);
		color: var(--surface);
	}

	.latest-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 24px;
		margin-top: 32px;
	}

	.popular-list {
		display: flex;
		flex-direction: column;
		margin-top: 32px;
	}

	@media (max-width: 1024px) {
		.masthead-inner,
		.section-inner {
			padding-right: 32px;
			padding-left: 32px;
		}
	}

	@media (max-width: 760px) {
		.masthead-inner,
		.section-inner {
			padding-right: 20px;
			padding-left: 20px;
		}

		.masthead-title {
			margin-top: 24px;
		}

		.ticker {
			justify-content: flex-start;
			gap: 14px;
			padding: 7px 0;
			font-size: 12px;
		}

		.ticker span {
			gap: 14px;
		}

		h1 {
			font-size: clamp(40px, 13vw, 72px);
		}

		.lead-shell {
			margin-top: 40px;
		}

		.latest-grid {
			grid-template-columns: 1fr;
		}

		.section-heading {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>

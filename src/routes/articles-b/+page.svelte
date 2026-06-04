<script lang="ts">
	import { resolve } from '$app/paths';
	import Footer from '$lib/components/newsroom/Footer.svelte';
	import Header from '$lib/components/newsroom/Header.svelte';
	import TextArticleCard from '$lib/components/newsroom/TextArticleCard.svelte';
	import { articles, articleTypes, categories } from '$lib/data/newsroomText';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const pageSize = 8;

	let filteredArticles = $derived.by(() =>
		articles.filter((article) => {
			const matchesCategory =
				data.filters.category === null || article.categoryCode === data.filters.category;
			const matchesType = data.filters.type === null || article.type === data.filters.type;

			return matchesCategory && matchesType;
		})
	);

	let totalPages = $derived(Math.max(1, Math.ceil(filteredArticles.length / pageSize)));
	let currentPage = $derived(Math.min(data.filters.page, totalPages));
	let visibleArticles = $derived(
		filteredArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);
	let selectedCategory = $derived(
		categories.find((category) => category.code === data.filters.category)?.name
	);
	let selectedType = $derived(articleTypes.find((type) => type.code === data.filters.type)?.name);
	let filterLabel = $derived(
		data.filters.hasQuery
			? [selectedCategory, selectedType, `Page ${currentPage}`].filter(Boolean).join(' / ')
			: 'All dispatches'
	);

	function articlePath(overrides: {
		category?: string | null;
		type?: string | null;
		page?: number | null;
	}): '/articles-b' | `/articles-b?${string}` {
		const params: string[] = [];
		const category = overrides.category === undefined ? data.filters.category : overrides.category;
		const type = overrides.type === undefined ? data.filters.type : overrides.type;
		const page = overrides.page === undefined ? data.filters.page : overrides.page;

		if (category) params.push(`category=${encodeURIComponent(category)}`);
		if (type) params.push(`type=${encodeURIComponent(type)}`);
		if (page && page > 1) params.push(`page=${page}`);

		const query = params.join('&');

		return query ? (`/articles-b?${query}` as `/articles-b?${string}`) : '/articles-b';
	}
</script>

<svelte:head>
	<title>Articles B | Newsroom</title>
	<meta
		name="description"
		content="A text-first article archive with category, type, and page query parameter handling."
	/>
</svelte:head>

<Header {categories} />
<main class="articles-b">
	<section class="archive-hero" aria-labelledby="articles-b-title">
		<div class="hero-inner">
			<p>Archive B</p>
			<h1 id="articles-b-title">Briefs with room to breathe</h1>
			<div class="hero-meta">
				<span>{filterLabel}</span>
				<span>{filteredArticles.length} articles</span>
			</div>
		</div>
	</section>

	<section class="filters" aria-label="Article filters">
		<div class="filter-inner">
			<div class="filter-group">
				<p>Category</p>
				<div class="filter-list">
					<a
						class:active={data.filters.category === null}
						href={resolve(articlePath({ category: null, page: 1 }))}
					>
						All
					</a>
					{#each categories as category (category.code)}
						<a
							class:active={data.filters.category === category.code}
							href={resolve(articlePath({ category: category.code, page: 1 }))}
						>
							{category.name}
						</a>
					{/each}
				</div>
			</div>
			<div class="filter-group">
				<p>Type</p>
				<div class="filter-list">
					<a
						class:active={data.filters.type === null}
						href={resolve(articlePath({ type: null, page: 1 }))}
					>
						All
					</a>
					{#each articleTypes as type (type.code)}
						<a
							class:active={data.filters.type === type.code}
							href={resolve(articlePath({ type: type.code, page: 1 }))}
						>
							{type.name}
						</a>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="article-section" aria-labelledby="articles-b-list-title">
		<div class="section-inner">
			<div class="section-heading">
				<h2 id="articles-b-list-title">Latest articles</h2>
				<a href={resolve(articlePath({ category: null, type: null, page: 1 }))}>Reset</a>
			</div>

			{#if visibleArticles.length}
				<div class="article-grid">
					{#each visibleArticles as article, index (article.title)}
						<TextArticleCard {article} {index} />
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>No articles match these filters.</p>
					<a href={resolve(articlePath({ category: null, type: null, page: 1 }))}>
						Show all articles
					</a>
				</div>
			{/if}

			<div class="pagination" aria-label="Pagination">
				<a
					class:disabled={currentPage === 1}
					aria-disabled={currentPage === 1}
					href={resolve(
						currentPage === 1 ? articlePath({ page: 1 }) : articlePath({ page: currentPage - 1 })
					)}
				>
					Previous
				</a>
				<span>Page {currentPage} of {totalPages}</span>
				<a
					class:disabled={currentPage === totalPages}
					aria-disabled={currentPage === totalPages}
					href={resolve(
						currentPage === totalPages
							? articlePath({ page: totalPages })
							: articlePath({ page: currentPage + 1 })
					)}
				>
					Next
				</a>
			</div>
		</div>
	</section>
</main>
<Footer />

<style>
	.articles-b {
		background: var(--surface);
		color: var(--ink);
	}

	.archive-hero {
		border-bottom: 1px solid var(--line-strong);
	}

	.hero-inner,
	.filter-inner,
	.section-inner {
		max-width: 1320px;
		margin: 0 auto;
	}

	.hero-inner {
		display: grid;
		grid-template-columns: 160px minmax(0, 1fr) 220px;
		gap: 36px;
		align-items: end;
		padding: 72px 0 56px;
	}

	p,
	h1,
	h2 {
		margin: 0;
	}

	.hero-inner > p,
	.filter-group p,
	.hero-meta,
	.pagination span {
		color: var(--ink-muted);
		font-size: 13px;
		font-weight: 500;
		line-height: 1.2;
		text-transform: uppercase;
	}

	h1 {
		max-width: 940px;
		font-size: clamp(54px, 9vw, 132px);
		font-weight: 500;
		line-height: 0.94;
		letter-spacing: 0;
	}

	.hero-meta {
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: flex-end;
		text-align: right;
	}

	.filters {
		border-bottom: 1px solid var(--line);
		background: var(--surface-elevated);
	}

	.filter-inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 40px;
		padding: 28px 0;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.filter-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	.filter-list a,
	.section-heading a,
	.empty-state a,
	.pagination a {
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		padding: 8px 14px;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
	}

	.filter-list a.active,
	.section-heading a:hover,
	.empty-state a,
	.pagination a:not(.disabled):hover {
		background: var(--ink);
		color: var(--surface);
	}

	.section-inner {
		padding: 56px 0 88px;
	}

	.section-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		border-bottom: 1px solid var(--line);
		padding-bottom: 18px;
	}

	h2 {
		font-size: 40px;
		font-weight: 500;
		line-height: 1.1;
	}

	.article-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 24px;
		margin-top: 32px;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		margin-top: 32px;
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 28px;
		color: var(--ink-soft);
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20px;
		margin-top: 56px;
	}

	.pagination a.disabled {
		pointer-events: none;
		border-color: var(--line);
		color: var(--ink-muted);
	}

	@media (max-width: 1024px) {
		.hero-inner,
		.filter-inner,
		.section-inner {
			padding-right: 32px;
			padding-left: 32px;
		}

		.hero-inner {
			grid-template-columns: 1fr;
			gap: 24px;
		}

		.hero-meta {
			align-items: flex-start;
			text-align: left;
		}

		.filter-inner {
			grid-template-columns: 1fr;
			gap: 24px;
		}
	}

	@media (max-width: 760px) {
		.hero-inner,
		.filter-inner,
		.section-inner {
			padding-right: 20px;
			padding-left: 20px;
		}

		h1 {
			font-size: 52px;
		}

		.article-grid {
			grid-template-columns: 1fr;
		}

		.section-heading,
		.empty-state,
		.pagination {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>

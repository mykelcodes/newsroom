<script lang="ts">
	import { resolve } from '$app/paths';
	import ArticleCard from '$lib/components/newsroom/ArticleCard.svelte';
	import Footer from '$lib/components/newsroom/Footer.svelte';
	import Header from '$lib/components/newsroom/Header.svelte';
	import type { PageProps } from './$types';

	type Category = {
		code: string;
		name: string;
	};

	type ArticleType = {
		code: string;
		name: string;
	};

	type Article = {
		title: string;
		summary: string;
		date: string;
		image: string;
		category: string;
		categoryCode: string;
		type: string;
		views: string;
		comments: string;
	};

	let { data }: PageProps = $props();

	const pageSize = 9;

	const categories: Category[] = [
		{ code: 'technology', name: 'Technology' },
		{ code: 'business', name: 'Business' },
		{ code: 'industry-insights', name: 'Industry Insights' },
		{ code: 'events', name: 'Events' },
		{ code: 'lifestyle', name: 'Lifestyle' },
		{ code: 'sport', name: 'Sport' }
	];

	const articleTypes: ArticleType[] = [
		{ code: 'news', name: 'News' },
		{ code: 'feature', name: 'Feature' },
		{ code: 'analysis', name: 'Analysis' }
	];

	const articles: Article[] = [
		{
			title: 'Championship final set after dramatic semi-final clash',
			summary:
				'A young talent impressed fans and analysts alike with a standout performance in their first professional league appearance.',
			date: 'Jan 13, 2026',
			image: '/newsroom/article-feature.jpg',
			category: 'Sport',
			categoryCode: 'sport',
			type: 'news',
			views: '11.0K',
			comments: '200'
		},
		{
			title: 'Interleague Advanced Analytics for Better Decision-Making',
			summary:
				'Teams are combining match data, fan sentiment, and operational signals to make faster editorial decisions.',
			date: 'Jan 13, 2026',
			image: '/newsroom/article-1.jpg',
			category: 'Technology',
			categoryCode: 'technology',
			type: 'analysis',
			views: '9.4K',
			comments: '128'
		},
		{
			title: 'Expanding Our Team to Support Rapid Growth',
			summary:
				'The newsroom is growing its editorial, operations, and audience teams to support a wider publishing cadence.',
			date: 'Jan 13, 2026',
			image: '/newsroom/article-2.jpg',
			category: 'Business',
			categoryCode: 'business',
			type: 'feature',
			views: '8.7K',
			comments: '96'
		},
		{
			title: 'National Team Secures Crucial Win in Qualifier Match',
			summary:
				'A late tactical shift helped the national side secure a critical result before the final qualifying round.',
			date: 'Jan 13, 2026',
			image: '/newsroom/article-3.jpg',
			category: 'Sport',
			categoryCode: 'sport',
			type: 'news',
			views: '12.6K',
			comments: '244'
		},
		{
			title: 'Creative Off-court Moments Fuel New Audience Growth',
			summary:
				'Behind-the-scenes stories are shaping how readers follow athletes, teams, and cultural moments beyond match day.',
			date: 'Jan 12, 2026',
			image: '/newsroom/video-1.jpg',
			category: 'Lifestyle',
			categoryCode: 'lifestyle',
			type: 'feature',
			views: '7.8K',
			comments: '83'
		},
		{
			title: 'Young Player Impresses in First League Appearance',
			summary:
				'Coaches and supporters praised the debut performance after a composed showing under pressure.',
			date: 'Jan 12, 2026',
			image: '/newsroom/video-2.jpg',
			category: 'Sport',
			categoryCode: 'sport',
			type: 'news',
			views: '6.9K',
			comments: '71'
		},
		{
			title: 'Flexible Contract Strategy Reshapes Front-office Planning',
			summary:
				'New commercial models are giving organizations more room to balance long-term planning with weekly volatility.',
			date: 'Jan 11, 2026',
			image: '/newsroom/video-3.jpg',
			category: 'Industry Insights',
			categoryCode: 'industry-insights',
			type: 'analysis',
			views: '5.2K',
			comments: '44'
		},
		{
			title: 'Star Player Sidelined After Training Injury',
			summary:
				'The team confirmed that their key player will miss upcoming fixtures after sustaining an injury during training.',
			date: 'Jan 11, 2026',
			image: '/newsroom/popular-2.jpg',
			category: 'Sport',
			categoryCode: 'sport',
			type: 'news',
			views: '10.3K',
			comments: '189'
		},
		{
			title: 'New Season Schedule Officially Announced',
			summary:
				'The full calendar introduces new rivalry fixtures, expanded weekend coverage, and a sharper broadcast rhythm.',
			date: 'Jan 10, 2026',
			image: '/newsroom/popular-3.jpg',
			category: 'Events',
			categoryCode: 'events',
			type: 'news',
			views: '9.8K',
			comments: '162'
		},
		{
			title: 'Coach Shares Strategy Ahead of Important Home Match',
			summary:
				'The head coach emphasized discipline, pace, and smarter transitions during the pre-match press conference.',
			date: 'Jan 10, 2026',
			image: '/newsroom/popular-4.jpg',
			category: 'Sport',
			categoryCode: 'sport',
			type: 'feature',
			views: '7.1K',
			comments: '58'
		},
		{
			title: 'Audience Tools Help Editors Spot Emerging Storylines',
			summary:
				'New dashboards are helping editors identify fast-rising reader interest before stories peak across channels.',
			date: 'Jan 9, 2026',
			image: '/newsroom/hero-right-small.jpg',
			category: 'Technology',
			categoryCode: 'technology',
			type: 'analysis',
			views: '4.9K',
			comments: '37'
		},
		{
			title: 'Community Event Series Returns With Expanded Lineup',
			summary:
				'The latest event program brings live conversations, workshops, and editorial showcases to more cities.',
			date: 'Jan 9, 2026',
			image: '/newsroom/hero-left-small.jpg',
			category: 'Events',
			categoryCode: 'events',
			type: 'feature',
			views: '4.1K',
			comments: '29'
		}
	];

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

	function articlePath(overrides: {
		category?: string | null;
		type?: string | null;
		page?: number | null;
	}): '/articles' | `/articles?${string}` {
		const params: string[] = [];
		const category = overrides.category === undefined ? data.filters.category : overrides.category;
		const type = overrides.type === undefined ? data.filters.type : overrides.type;
		const page = overrides.page === undefined ? data.filters.page : overrides.page;

		if (category) params.push(`category=${encodeURIComponent(category)}`);
		if (type) params.push(`type=${encodeURIComponent(type)}`);
		if (page && page > 1) params.push(`page=${page}`);

		const query = params.join('&');

		return query ? (`/articles?${query}` as `/articles?${string}`) : '/articles';
	}
</script>

<svelte:head>
	<title>Articles | Newsroom</title>
	<meta
		name="description"
		content="Browse all newsroom articles with static category, type, and page query parameter handling."
	/>
</svelte:head>

<Header {categories} />
<main class="articles-page">
	<section class="articles-hero" aria-labelledby="articles-title">
		<div class="hero-inner">
			<div class="hero-copy">
				<h1 id="articles-title" class="text-center">All articles</h1>
			</div>
		</div>
	</section>

	<section class="filter-section" aria-label="Article filters">
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

	<section class="article-results" aria-labelledby="article-results-title">
		<div class="results-inner">
			<div class="results-heading">
				<div>
					<h2 id="article-results-title">Latest from the archive</h2>
				</div>
				<a href={resolve(articlePath({ category: null, type: null, page: 1 }))}>Reset</a>
			</div>

			{#if visibleArticles.length}
				<div class="article-grid">
					{#each visibleArticles as article (article.title)}
						<ArticleCard {article} />
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>No articles match these static filters.</p>
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
<Footer categories={[]} />

<style>
	.articles-page {
		background: var(--surface);
		color: var(--ink);
	}

	.articles-hero {
		border-bottom: 1px solid var(--line-strong);
	}

	.hero-inner,
	.filter-inner,
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

	.filter-group p {
		margin: 0;
		color: var(--ink-muted);
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.hero-copy {
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
	}

	.filter-section {
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
	.pagination a,
	.empty-state a,
	.results-heading a {
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		padding: 8px 14px;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
	}

	.filter-list a.active,
	.pagination a:not(.disabled):hover,
	.empty-state a,
	.results-heading a:hover {
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

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20px;
		margin-top: 56px;
	}

	.pagination span {
		color: var(--ink-soft);
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
	}

	.pagination a.disabled {
		pointer-events: none;
		border-color: var(--line);
		color: var(--ink-muted);
	}

	@media (max-width: 1024px) {
		.hero-inner,
		.filter-inner,
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

		.filter-inner {
			grid-template-columns: 1fr;
			gap: 24px;
		}

		.article-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 40px 24px;
		}
	}

	@media (max-width: 640px) {
		.hero-inner,
		.filter-inner,
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
		.empty-state,
		.pagination {
			align-items: flex-start;
			flex-direction: column;
		}

		.article-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

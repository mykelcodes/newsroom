<script lang="ts">
	import type { Doc } from '$convex/_generated/dataModel';
	import dayjs from 'dayjs';
	import ArticleGrid from './ArticleGrid.svelte';
	import SectionHeader from './SectionHeader.svelte';

	type Props = {
		article?: Doc<'headlines'>;
		articles: Doc<'headlines'>[];
	};

	let { article, articles }: Props = $props();
</script>

<section class="featured-section" aria-labelledby="latest-title">
	<div class="section-inner">
		<SectionHeader id="latest-title" title="Latest news" />
		{#if article}
			<a href={article.url} target="_blank" rel="noopener noreferrer external" class="featured">
				<img class="featured-image" src={article.image} alt="" />
				<div class="featured-content">
					<div class="featured-copy">
						{#if article.category}
							<p class="tag uppercase">{article.category}</p>
						{/if}
						<div class="title-stack">
							<h2>{article.title}</h2>
							<div class="details">
								{#if article.description}
									<p class="summary">{article.description}</p>
								{/if}
								<p class="date">
									{#if article.sourceName}
										<span class="source">{article.sourceName}</span> &middot;
									{/if}
									{dayjs(article.publishedAt).format('MMM D, YYYY h:mm A')}
								</p>
							</div>
						</div>
					</div>
					<!-- <ArticleActions views={article.views} comments={article.comments} /> -->
				</div>
			</a>
		{/if}
		<div class="desktop-grid">
			<ArticleGrid {articles} showHeader={false} />
		</div>
	</div>
</section>

<style>
	.featured-section {
		background: var(--surface);
	}

	.section-inner {
		max-width: 1320px;
		margin: 0 auto;
		padding: 56px 0 72px;
	}

	.featured {
		display: grid;
		grid-template-columns: 560px minmax(0, 1fr);
		gap: 45px;
		align-items: stretch;
		padding-top: 40px;
		color: inherit;
		text-decoration: none;
	}

	.featured-image {
		width: 100%;
		height: 520px;
		border-radius: 12px;
		object-fit: cover;
	}

	.featured-content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
	}

	.featured-copy,
	.title-stack,
	.details {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.featured-copy {
		gap: 20px;
	}

	.title-stack {
		gap: 24px;
	}

	.details {
		gap: 16px;
	}

	h2,
	p {
		margin: 0;
	}

	h2 {
		color: var(--ink);
		font-size: 60px;
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: 0;
	}

	.summary {
		max-width: 681px;
		color: var(--ink-soft);
		font-size: 20px;
		line-height: 1.3;
	}

	.date {
		color: var(--ink-muted);
		font-size: 14px;
		line-height: 1.2;
	}

	.source {
		color: var(--ink-soft);
		font-weight: 500;
	}

	.tag {
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		padding: 4px 12px;
		color: var(--ink);
		font-size: 18px;
		line-height: 1.15;
	}

	.desktop-grid {
		margin-top: 56px;
		border-top: 1px solid var(--line);
		padding-top: 44px;
	}

	.desktop-grid :global(.latest-list) {
		display: block;
		padding: 0;
	}

	@media (max-width: 1024px) {
		.section-inner {
			padding: 21px 32px 64px;
		}

		.featured {
			grid-template-columns: minmax(0, 338px) minmax(0, 1fr);
			gap: 32px;
			padding-top: 56px;
		}

		.featured-image {
			height: 376px;
		}

		h2 {
			font-size: 44px;
		}

		.summary {
			font-size: 16px;
		}

		.tag {
			font-size: 14px;
		}

		.desktop-grid {
			margin-top: 56px;
			padding-top: 32px;
		}
	}

	@media (max-width: 640px) {
		.section-inner {
			padding: 12px 20px 32px;
		}

		.featured {
			display: flex;
			flex-direction: column;
			gap: 32px;
			padding-top: 32px;
		}

		.featured-image {
			height: 376px;
		}

		.featured-content {
			gap: 32px;
		}

		.desktop-grid {
			margin-top: 32px;
			padding-top: 32px;
		}

		h2 {
			font-size: 32px;
			line-height: 1.1;
		}
	}
</style>

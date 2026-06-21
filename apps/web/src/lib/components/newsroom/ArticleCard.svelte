<script lang="ts">
	import type { Doc } from '@newsroom/backend/dataModel';
	import dayjs from 'dayjs';

	type Article = Doc<'headlines'>;

	type Props = {
		article: Article;
		variant?: 'grid' | 'popular';
	};

	let { article, variant = 'grid' }: Props = $props();
</script>

<a
	href={article.url}
	target="_blank"
	rel="noopener noreferrer external"
	class:popular={variant === 'popular'}
	class="article-card"
>
	<img class="article-image" src={article.image} alt="" />
	<div class="article-body">
		{#if article.category}
			<p class="tag uppercase">{article.category}</p>
		{/if}
		<div class="article-copy">
			<h3>{article.title}</h3>
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
	<!-- <ArticleActions views={article.views} comments={article.comments} /> -->
</a>

<style>
	.article-card {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 24px;
		color: inherit;
		text-decoration: none;
	}

	.article-image {
		width: 100%;
		height: 273px;
		border-radius: 12px;
		object-fit: cover;
	}

	.article-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.article-copy {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	h3,
	p {
		margin: 0;
	}

	h3 {
		color: var(--ink);
		font-size: 20px;
		font-weight: 500;
		line-height: 1.2;
		letter-spacing: 0;
	}

	.summary {
		color: var(--ink-soft);
		font-size: 16px;
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
		width: fit-content;
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		padding: 4px 12px;
		color: var(--ink);
		font-size: 18px;
		line-height: 1.15;
	}

	.popular {
		display: grid;
		grid-template-columns: minmax(260px, 402px) minmax(0, 1fr);
		column-gap: 37px;
		align-items: stretch;
	}

	.popular .article-image {
		height: 304px;
	}

	.popular .article-body {
		min-height: 240px;
	}

	.popular h3 {
		max-width: 881px;
		font-size: 32px;
		line-height: 1.1;
		letter-spacing: 0;
	}

	.popular :global(.actions) {
		grid-column: 2;
		align-self: end;
	}

	@media (max-width: 1024px) {
		.article-card {
			gap: 16px;
		}

		.article-image {
			height: 273px;
			border-radius: 9px;
		}

		.popular {
			grid-template-columns: 300px minmax(0, 1fr);
			column-gap: 24px;
		}

		.popular .article-image {
			height: 304px;
		}

		.popular h3 {
			font-size: 28px;
		}

		.summary {
			font-size: 16px;
		}

		.tag {
			font-size: 16px;
		}
	}

	@media (max-width: 640px) {
		.article-card,
		.popular {
			display: flex;
			flex-direction: column;
			gap: 24px;
		}

		.article-image,
		.popular .article-image {
			height: 328px;
			border-radius: 9px;
		}

		h3,
		.popular h3 {
			font-size: 24px;
			line-height: 1.1;
		}

		.article-body,
		.article-copy {
			gap: 16px;
		}

		.popular :global(.actions) {
			grid-column: auto;
		}
	}
</style>

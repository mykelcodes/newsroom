<script lang="ts">
	import type { Doc } from '$convex/_generated/dataModel';

	type Props = {
		article: Doc<'headlines'>;
		variant?: 'compact' | 'feature' | 'list';
		index?: number;
	};

	let { article, variant = 'compact', index }: Props = $props();
</script>

<article class:feature={variant === 'feature'} class:list={variant === 'list'} class="text-card">
	<div class="card-topline">
		<span class="tag">{article.category}</span>
		<span>2 mins</span>
	</div>
	<div class="card-main">
		{#if index !== undefined}
			<span class="index">{String(index + 1).padStart(2, '0')}</span>
		{/if}
		<div class="copy">
			<h3>{article.title}</h3>
			<p>{article.description}</p>
		</div>
	</div>
	<div class="card-bottom">
		<time datetime="2026-01-13">{article.publishedAt}</time>
		<!-- <ArticleActions views={article.views} comments={article.comments} /> -->
	</div>
</article>

<style>
	.text-card {
		display: flex;
		min-width: 0;
		flex-direction: column;
		justify-content: space-between;
		gap: 28px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--surface);
		padding: 24px;
		color: var(--ink);
	}

	.card-topline,
	.card-bottom,
	.card-main {
		display: flex;
		gap: 16px;
	}

	.card-topline,
	.card-bottom {
		align-items: center;
		justify-content: space-between;
		color: var(--ink-muted);
		font-size: 13px;
		font-weight: 500;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.card-topline {
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	.tag {
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		padding: 4px 10px;
		color: var(--ink);
	}

	.card-main {
		align-items: flex-start;
	}

	.index {
		flex: 0 0 auto;
		color: var(--ink-muted);
		font-size: 28px;
		font-weight: 500;
		line-height: 1;
	}

	.copy {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 14px;
	}

	h3,
	p,
	time {
		margin: 0;
	}

	h3 {
		font-size: 26px;
		font-weight: 500;
		line-height: 1.08;
		letter-spacing: 0;
	}

	p {
		color: var(--ink-soft);
		font-size: 16px;
		line-height: 1.42;
	}

	time {
		flex: 0 0 auto;
	}

	.card-bottom {
		align-items: flex-end;
	}

	.card-bottom :global(.actions) {
		max-width: 220px;
	}

	.feature {
		min-height: 420px;
		border-color: var(--line-strong);
		padding: clamp(28px, 4vw, 52px);
	}

	.feature h3 {
		max-width: 920px;
		font-size: clamp(44px, 7vw, 104px);
		line-height: 0.95;
	}

	.feature p {
		max-width: 640px;
		font-size: 20px;
	}

	.list {
		border-right: 0;
		border-left: 0;
		border-radius: 0;
		padding: 24px 0;
	}

	.list h3 {
		font-size: 30px;
	}

	@media (max-width: 760px) {
		.text-card {
			padding: 20px;
		}

		.feature {
			min-height: 360px;
			padding: 24px;
		}

		.card-bottom,
		.card-main {
			flex-direction: column;
		}

		.card-bottom {
			align-items: stretch;
		}

		.card-bottom :global(.actions) {
			max-width: none;
		}

		h3,
		.list h3 {
			font-size: 24px;
		}
	}
</style>

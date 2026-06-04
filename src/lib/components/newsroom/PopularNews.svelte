<script lang="ts">
	import ArticleCard from './ArticleCard.svelte';
	import SectionHeader from './SectionHeader.svelte';

	type Article = {
		category: string;
		title: string;
		summary: string;
		date: string;
		image: string;
		views?: string;
		comments?: string;
	};

	type Props = {
		articles: Article[];
	};

	let { articles }: Props = $props();
</script>

<section class="popular-news" aria-labelledby="popular-title">
	<div class="section-inner">
		<SectionHeader id="popular-title" title="Popular news" />
		<div class="list">
			{#each articles as article (article.title)}
				<ArticleCard {article} variant="popular" />
			{/each}
		</div>
	</div>
</section>

<style>
	.popular-news {
		background: var(--surface);
	}

	.section-inner {
		max-width: 1320px;
		margin: 0 auto;
		padding: 56px 0 68px;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 28px;
		margin-top: 43px;
	}

	.list > :global(* + *) {
		border-top: 1px solid var(--line);
		padding-top: 28px;
	}

	@media (max-width: 1024px) {
		.section-inner {
			padding: 62px 32px 64px;
		}

		.list {
			gap: 32px;
			margin-top: 42px;
		}

		.list > :global(* + *) {
			padding-top: 32px;
		}
	}

	@media (max-width: 640px) {
		.section-inner {
			padding: 62px 20px 40px;
		}

		.list {
			margin-top: 32px;
		}
	}
</style>

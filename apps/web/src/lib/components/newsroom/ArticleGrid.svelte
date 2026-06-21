<script lang="ts">
	import type { Doc } from '@newsroom/backend/dataModel';
	import ArticleCard from './ArticleCard.svelte';
	import SectionHeader from './SectionHeader.svelte';

	type Article = Doc<'headlines'>;

	type Props = {
		articles: Article[];
		showHeader?: boolean;
	};

	let { articles, showHeader = true }: Props = $props();
</script>

<section
	class:headerless={!showHeader}
	class="latest-list"
	aria-label={showHeader ? undefined : 'Latest articles'}
	aria-labelledby={showHeader ? 'latest-grid-title' : undefined}
>
	{#if showHeader}
		<SectionHeader id="latest-grid-title" title="Latest news" />
	{/if}
	<div class="grid">
		{#each articles as article (article._id)}
			<ArticleCard {article} />
		{/each}
	</div>
</section>

<style>
	.latest-list {
		display: none;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 28px;
		margin-top: 40px;
	}

	.headerless .grid {
		margin-top: 0;
	}

	.grid > :global(* + *) {
		border-left: 1px solid var(--line);
		padding-left: 28px;
	}

	@media (max-width: 1024px) {
		.latest-list {
			display: block;
			padding: 0 32px 56px;
		}

		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 32px 24px;
			margin-top: 32px;
		}

		.headerless .grid {
			margin-top: 0;
		}

		.grid > :global(* + *) {
			border-left: 0;
			padding-left: 0;
		}
	}

	@media (max-width: 640px) {
		.latest-list {
			padding: 0 20px 50px;
		}

		.grid {
			grid-template-columns: 1fr;
			gap: 32px;
		}
	}
</style>

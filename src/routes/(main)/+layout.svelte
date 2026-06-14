<script lang="ts">
	import { api } from '$convex/_generated/api';
	import Footer from '$lib/components/newsroom/Footer.svelte';
	import Header from '$lib/components/newsroom/Header.svelte';
	import { useQuery } from 'convex-svelte';
	import { untrack } from 'svelte';

	let { children, data } = $props();

	const categories = useQuery(
		api.categories.getAll,
		{},
		{ initialData: untrack(() => data.initialCategories) }
	);
</script>

<Header categories={categories.data} />
<div id="top" class="layout-body">
	{@render children()}
	<Footer categories={categories.data} />
</div>

<style>
	.layout-body {
		/* topbar (79px) + nav (51px) = 130px; matches .topbar height + nav height */
		padding-top: 130px;
	}

	@media (max-width: 1024px) {
		.layout-body {
			/* topbar collapses to 72px, nav hidden */
			padding-top: 72px;
		}
	}
</style>

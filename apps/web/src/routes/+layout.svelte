<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import favicon from '$lib/assets/favicon.svg';
	import { setupConvex } from 'convex-svelte';
	import './layout.css';

	let { children } = $props();
	setupConvex(PUBLIC_CONVEX_URL);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

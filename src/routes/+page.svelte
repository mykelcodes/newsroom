<script lang="ts">
	import { api } from '$convex/_generated/api';
	import EditorialBand from '$lib/components/newsroom/EditorialBand.svelte';
	import FeaturedArticle from '$lib/components/newsroom/FeaturedArticle.svelte';
	import Footer from '$lib/components/newsroom/Footer.svelte';
	import Header from '$lib/components/newsroom/Header.svelte';
	import Hero from '$lib/components/newsroom/Hero.svelte';
	import PopularNews from '$lib/components/newsroom/PopularNews.svelte';
	import { useQuery } from 'convex-svelte';
	import { untrack } from 'svelte';

	const { data } = $props();

	const categories = useQuery(
		api.categories.getAll,
		{},
		{ initialData: untrack(() => data.initialCategories) }
	);

	const latestArticlesQuery = useQuery(
		api.headlines.getLatest,
		{ count: 4 },
		{ initialData: untrack(() => data.initialLatest) }
	);

	const otherNewsQuery = useQuery(
		api.headlines.getAll,
		{ paginationOpts: { numItems: 14, cursor: null } },
		{ initialData: untrack(() => data.otherNews) }
	);

	let featuredArticle = $derived(latestArticlesQuery.data?.[0]);
	let latestArticles = $derived(latestArticlesQuery.data?.slice(1) ?? []);
</script>

<svelte:head>
	<title>Newsroom — Breaking News, Analysis & More</title>
	<meta
		name="description"
		content="Stay informed with the latest breaking news, in-depth analysis, and top stories across politics, tech, sports, and culture."
	/>
	<link rel="canonical" href="https://newsroom.mykelcodes.com/" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Newsroom" />
	<meta property="og:title" content="Newsroom — Breaking News, Analysis & More" />
	<meta
		property="og:description"
		content="Stay informed with the latest breaking news, in-depth analysis, and top stories across politics, tech, sports, and culture."
	/>
	<meta property="og:url" content="https://newsroom.mykelcodes.com/" />
	<meta property="og:image" content="https://newsroom.mykelcodes.com/newsroom/hero-main.jpg" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Newsroom — Breaking News, Analysis & More" />
	<meta
		name="twitter:description"
		content="Stay informed with the latest breaking news, in-depth analysis, and top stories across politics, tech, sports, and culture."
	/>
	<meta name="twitter:image" content="https://newsroom.mykelcodes.com/newsroom/hero-main.jpg" />
</svelte:head>

<Header categories={categories.data} />
<main>
	<Hero categories={categories.data} />
	<FeaturedArticle article={featuredArticle} articles={latestArticles} />
	<EditorialBand />
	<!-- <VideoGrid {videos} /> -->
	<PopularNews articles={otherNewsQuery.data?.page.slice(4) ?? []} />
</main>
<Footer categories={categories.data} />

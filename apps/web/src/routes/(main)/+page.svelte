<script lang="ts">
	import { api } from '@newsroom/backend/api';
	import EditorialBand from '$lib/components/newsroom/EditorialBand.svelte';
	import FeaturedArticle from '$lib/components/newsroom/FeaturedArticle.svelte';
	import Hero from '$lib/components/newsroom/Hero.svelte';
	import PopularNews from '$lib/components/newsroom/PopularNews.svelte';
	import { buildHomeJsonLd, siteMeta, siteUrl } from '$lib/seo';
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

	// The featured/latest block and the wider feed come from separate queries
	// over the same ordered data, so drop overlap by id instead of assuming
	// the first N entries line up.
	let popularArticles = $derived.by(() => {
		const latestIds = new Set((latestArticlesQuery.data ?? []).map((article) => article._id));

		return (otherNewsQuery.data?.page ?? []).filter((article) => !latestIds.has(article._id));
	});

	let jsonLd = $derived.by(() => buildHomeJsonLd(latestArticlesQuery.data ?? [], featuredArticle));
</script>

<svelte:head>
	<title>{siteMeta.title}</title>
	<meta name="description" content={siteMeta.description} />
	<link rel="canonical" href={siteUrl} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Newsroom" />
	<meta property="og:title" content={siteMeta.title} />
	<meta property="og:description" content={siteMeta.description} />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:image" content={siteMeta.image} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={siteMeta.title} />
	<meta name="twitter:description" content={siteMeta.description} />
	<meta name="twitter:image" content={siteMeta.image} />

	<!-- JSON-LD structured data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + jsonLd + '</scr' + 'ipt>'}
</svelte:head>

<main>
	<Hero categories={categories.data} />
	<FeaturedArticle article={featuredArticle} articles={latestArticles} />
	<EditorialBand />
	<PopularNews articles={popularArticles} />
</main>

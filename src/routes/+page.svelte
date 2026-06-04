<script lang="ts">
	import EditorialBand from '$lib/components/newsroom/EditorialBand.svelte';
	import FeaturedArticle from '$lib/components/newsroom/FeaturedArticle.svelte';
	import Footer from '$lib/components/newsroom/Footer.svelte';
	import Header from '$lib/components/newsroom/Header.svelte';
	import Hero from '$lib/components/newsroom/Hero.svelte';
	import PopularNews from '$lib/components/newsroom/PopularNews.svelte';
	import VideoGrid from '$lib/components/newsroom/VideoGrid.svelte';

	const featuredArticle = {
		category: 'SPORT',
		title: 'Championship final set after dramatic semi-final clash',
		summary:
			'A young talent impressed fans and analysts a like with a standout performance in their first professional league appearance.',
		date: 'Jan 13, 2026',
		image: '/newsroom/article-feature.jpg',
		views: '11.0K',
		comments: '200'
	};

	const latestArticles = [
		{
			title: 'Interleague Advanced Analytics for Better Decision-Making',
			date: 'Jan 13, 2026',
			image: '/newsroom/article-1.jpg',
			views: '11.0K',
			comments: '200'
		},
		{
			title: 'Expanding Our Team to Support Rapid Growth',
			date: 'Jan 13, 2026',
			image: '/newsroom/article-2.jpg',
			views: '11.0K',
			comments: '200'
		},
		{
			title: 'National Team Secures Crucial Win in Qualifier Match',
			date: 'Jan 13, 2026',
			image: '/newsroom/article-3.jpg',
			views: '11.0K',
			comments: '200'
		}
	];

	const videos = [
		{
			title: 'Creative Off-court Moments National Team Qualification Hopes',
			image: '/newsroom/video-1.jpg'
		},
		{
			title: 'Young Player Impresses in First League Appearance',
			image: '/newsroom/video-2.jpg'
		},
		{
			title: 'Flexible Contract After Interview Before Semi-Finals',
			image: '/newsroom/video-3.jpg'
		}
	];

	const popularArticles = [
		{
			category: 'SPORT',
			title: 'Championship final set after dramatic semi-final clash',
			summary:
				'A young talent impressed fans and analysts a like with a standout performance in their first professional league appearance.',
			date: 'Jan 13, 2026',
			image: '/newsroom/popular-1.jpg',
			views: '11.0K',
			comments: '200'
		},
		{
			category: 'SPORT',
			title: 'Star Player Sidelined After Training Injury',
			summary:
				'The team confirmed that their key player will miss the upcoming fixtures after sustaining an injury during training.',
			date: 'Jan 13, 2026',
			image: '/newsroom/popular-2.jpg',
			views: '11.0K',
			comments: '200'
		},
		{
			category: 'SPORT',
			title: 'New Season Schedule Officially Announced',
			summary:
				'A young talent impressed fans and analysts a like with a standout performance in their first professional league appearance.',
			date: 'Jan 13, 2026',
			image: '/newsroom/popular-3.jpg',
			views: '11.0K',
			comments: '200'
		},
		{
			category: 'SPORT',
			title: 'Coach Shares Strategy Ahead of Important Home Match',
			summary:
				'The head coach revealed key tactical plans and emphasized team discipline during a press conference ahead of the upcoming match.',
			date: 'Jan 13, 2026',
			image: '/newsroom/popular-4.jpg',
			views: '11.0K',
			comments: '200'
		}
	];
</script>

<svelte:head>
	<title>Newsroom</title>
	<meta
		name="description"
		content="A responsive newsroom landing page with latest articles, videos, popular news, and newsletter sign-up."
	/>
</svelte:head>

<Header />
<main>
	<Hero />
	<FeaturedArticle article={featuredArticle} articles={latestArticles} />
	<EditorialBand />
	<VideoGrid {videos} />
	<PopularNews articles={popularArticles} />
</main>
<Footer />

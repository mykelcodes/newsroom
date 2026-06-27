<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteMeta, siteUrl } from '$lib/seo';

	const contactEmail = 'aymikey.olawale@gmail.com';

	const faqs = [
		{
			q: 'Do I need an account to use Newsroom?',
			a: 'No. Newsroom has no sign-up or login — just open the app and start reading.'
		},
		{
			q: 'Where do the headlines come from?',
			a: 'Headlines and summaries are aggregated from trusted third-party publishers. When you tap a story, it opens the full article on the original publisher’s website.'
		},
		{
			q: 'How often is the news updated?',
			a: 'Newsroom pulls in the top headlines published in the last 24 hours and adds them to each category throughout the day, with the newest stories always shown first.'
		},
		{
			q: 'Why can’t I open a particular article?',
			a: 'Articles open on the publisher’s own website. If a link won’t load, the publisher’s site may be down or the story may have been removed. Try again later or pick another story.'
		},
		{
			q: 'Is Newsroom free?',
			a: 'Yes. Newsroom is free to use, with no ads and no tracking.'
		},
		{
			q: 'How do I report a problem or share feedback?',
			a: 'Email us — we read every message and reply as soon as we can.'
		}
	];
</script>

<svelte:head>
	<title>Support | Newsroom</title>
	<meta
		name="description"
		content="Get help with Newsroom. Find answers to common questions or contact our team directly."
	/>
	<link rel="canonical" href="{siteUrl}/support" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Newsroom" />
	<meta property="og:title" content="Support | Newsroom" />
	<meta
		property="og:description"
		content="Get help with Newsroom. Find answers to common questions or contact our team directly."
	/>
	<meta property="og:url" content="{siteUrl}/support" />
	<meta property="og:image" content={siteMeta.image} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Support | Newsroom" />
	<meta
		name="twitter:description"
		content="Get help with Newsroom. Find answers to common questions or contact our team directly."
	/>
	<meta name="twitter:image" content={siteMeta.image} />
</svelte:head>

<main class="legal-page">
	<section class="legal-hero" aria-labelledby="support-title">
		<div class="legal-inner">
			<h1 id="support-title">Support</h1>
			<p class="updated">We’re here to help</p>
		</div>
	</section>

	<section class="legal-body">
		<div class="legal-inner prose">
			<p>
				Need a hand with Newsroom, found a bug, or have a suggestion? You’re in the right place. Check
				the common questions below, and if you still need help, reach out any time.
			</p>

			<div class="contact-card">
				<h2>Contact us</h2>
				<p>
					Email <a href="mailto:{contactEmail}">{contactEmail}</a> and we’ll get back to you as soon
					as we can.
				</p>
			</div>

			<h2>Frequently asked questions</h2>
			{#each faqs as faq (faq.q)}
				<div class="faq">
					<h3>{faq.q}</h3>
					<p>{faq.a}</p>
				</div>
			{/each}

			<h2>More</h2>
			<p>
				Read our <a href={resolve('/privacy')}>Privacy Policy</a> to learn how Newsroom handles your
				data. (Short version: we don’t collect personal information and we don’t track you.)
			</p>
		</div>
	</section>
</main>

<style>
	.legal-page {
		background: var(--surface);
		color: var(--ink);
	}

	.legal-inner {
		max-width: 820px;
		margin: 0 auto;
		padding-right: 24px;
		padding-left: 24px;
	}

	.legal-hero {
		border-bottom: 1px solid var(--line-strong);
	}

	.legal-hero .legal-inner {
		padding-top: 76px;
		padding-bottom: 40px;
	}

	h1 {
		margin: 0;
		font-size: clamp(48px, 8vw, 96px);
		font-weight: 500;
		line-height: 0.95;
		letter-spacing: 0;
	}

	.updated {
		margin: 18px 0 0;
		color: var(--ink-soft);
		font-size: 15px;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.legal-body .legal-inner {
		padding-top: 48px;
		padding-bottom: 96px;
	}

	.prose h2 {
		margin: 40px 0 12px;
		font-size: 24px;
		font-weight: 500;
		line-height: 1.2;
	}

	.prose h3 {
		margin: 0 0 6px;
		font-size: 18px;
		font-weight: 500;
		line-height: 1.3;
	}

	.prose p {
		margin: 0 0 16px;
		color: var(--ink-soft);
		font-size: 17px;
		line-height: 1.6;
	}

	.prose a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.contact-card {
		margin: 28px 0 8px;
		border: 1px solid var(--line-strong);
		border-radius: 6px;
		padding: 24px 28px;
	}

	.contact-card h2 {
		margin-top: 0;
	}

	.contact-card p {
		margin-bottom: 0;
	}

	.faq {
		border-top: 1px solid var(--line);
		padding: 20px 0;
	}

	.faq p {
		margin-bottom: 0;
	}

	@media (max-width: 640px) {
		.legal-hero .legal-inner {
			padding-top: 48px;
		}

		.legal-body .legal-inner {
			padding-top: 36px;
			padding-bottom: 64px;
		}
	}
</style>

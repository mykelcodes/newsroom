<script lang="ts">
	import { siteMeta, siteUrl } from '$lib/seo';

	const lastUpdated = 'June 27, 2026';
	const contactEmail = 'aymikey.olawale@gmail.com';
</script>

<svelte:head>
	<title>Privacy Policy | Newsroom</title>
	<meta
		name="description"
		content="How Newsroom handles your data: we don't require accounts and we don't collect personal information or track you."
	/>
	<link rel="canonical" href="{siteUrl}/privacy" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Newsroom" />
	<meta property="og:title" content="Privacy Policy | Newsroom" />
	<meta
		property="og:description"
		content="How Newsroom handles your data: we don't require accounts and we don't collect personal information or track you."
	/>
	<meta property="og:url" content="{siteUrl}/privacy" />
	<meta property="og:image" content={siteMeta.image} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Privacy Policy | Newsroom" />
	<meta
		name="twitter:description"
		content="How Newsroom handles your data: we don't require accounts and we don't collect personal information or track you."
	/>
	<meta name="twitter:image" content={siteMeta.image} />
</svelte:head>

<main class="legal-page">
	<section class="legal-hero" aria-labelledby="privacy-title">
		<div class="legal-inner">
			<h1 id="privacy-title">Privacy Policy</h1>
			<p class="updated">Last updated: {lastUpdated}</p>
		</div>
	</section>

	<section class="legal-body">
		<div class="legal-inner prose">
			<p>
				Newsroom (“we”, “us”, or “the app”) is a free news reader that brings you top headlines from
				around the world. This policy explains what data is and isn’t handled when you use the
				Newsroom mobile app or website (together, the “Service”). The short version: we don’t require
				an account, we don’t ask you for personal information, and we don’t track you.
			</p>

			<h2>Information we do not collect</h2>
			<p>
				The Service has no sign-up, login, or user accounts. We do not ask for, and you do not
				provide, personal information such as your name, email address, phone number, or contacts. We
				do not collect your precise location, and we do not access your camera, microphone, photos,
				or other device data.
			</p>

			<h2>Information processed automatically</h2>
			<p>
				To load news content, the app and website connect to our backend and hosting providers. As
				with virtually any internet service, those providers automatically process limited technical
				information in their server logs — such as your device’s IP address, device or browser type,
				operating system, and the date and time of a request. This data is used only to deliver
				content, keep the Service secure, and diagnose technical problems. We do not use it to
				identify you, build advertising profiles, or track you across other apps or websites.
			</p>

			<h2>No tracking, ads, or analytics SDKs</h2>
			<p>
				Newsroom does not include third-party advertising, analytics, or tracking software. We do not
				use cookies for advertising, and we do not sell, rent, or share your information with data
				brokers or advertisers.
			</p>

			<h2>Reading articles and external links</h2>
			<p>
				News headlines and summaries are sourced from third-party publishers via the
				<a href="https://gnews.io" target="_blank" rel="noopener noreferrer">GNews</a> news API. When
				you open a story, it loads the original publisher’s website in an in-app or external browser.
				Those websites are operated by third parties and have their own privacy practices, which we do
				not control. We encourage you to review the privacy policy of any site you visit.
			</p>

			<h2>Service providers</h2>
			<p>
				We rely on a small number of providers to operate the Service. They process data only to
				provide their service to us:
			</p>
			<ul>
				<li>
					<strong>Convex</strong> — backend and database that stores news content and serves it to
					the app.
				</li>
				<li><strong>Cloudflare</strong> — hosting and delivery of the website.</li>
				<li><strong>GNews</strong> — source of the news headlines and article metadata.</li>
				<li>
					<strong>Apple</strong> — distribution of the iOS app via the App Store, including any
					aggregated, anonymized analytics or crash reports Apple may provide to us by default.
				</li>
			</ul>

			<h2>Children’s privacy</h2>
			<p>
				The Service is a general news reader and is not directed to children under 13. We do not
				knowingly collect personal information from children. Because news covers real-world events,
				content may not be suitable for all ages.
			</p>

			<h2>Your choices</h2>
			<p>
				Since we don’t collect personal information or maintain accounts, there is no personal profile
				to access, correct, or delete. You can stop all data processing by us at any time by not using
				the Service or by uninstalling the app.
			</p>

			<h2>Changes to this policy</h2>
			<p>
				We may update this policy from time to time. When we do, we’ll revise the “Last updated” date
				above. Significant changes will be reflected on this page.
			</p>

			<h2>Contact us</h2>
			<p>
				If you have any questions about this policy or how the Service handles data, contact us at
				<a href="mailto:{contactEmail}">{contactEmail}</a>.
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

	.prose p,
	.prose li {
		color: var(--ink-soft);
		font-size: 17px;
		line-height: 1.6;
	}

	.prose p {
		margin: 0 0 16px;
	}

	.prose ul {
		margin: 0 0 16px;
		padding-left: 20px;
	}

	.prose li {
		margin-bottom: 8px;
	}

	.prose strong {
		color: var(--ink);
	}

	.prose a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 2px;
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

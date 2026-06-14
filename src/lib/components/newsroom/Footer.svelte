<script lang="ts">
	import { resolve } from '$app/paths';

	let { categories } = $props();
</script>

<footer class="site-footer">
	<div class="footer-inner">
		<div class="footer-content">
			<div class="newsletter">
				<p>Subscribe to our newsletter and receive the latest headlines directly in your inbox.</p>
				<form aria-label="Newsletter signup">
					<label>
						<span class="sr-only">Email address</span>
						<input type="email" placeholder="Enter your email address" />
					</label>
					<button type="submit">Get update</button>
				</form>
			</div>
			<nav class="footer-links" aria-label="Footer navigation">
				<div>
					<h2>News Categories</h2>
					{#each categories as category (category.code)}
						<a href={resolve(`/articles?category=${category.code}`)}>{category.name}</a>
					{/each}
				</div>
				<div>
					<h2>Socials</h2>
					<div class="socials">
						<a
							href="https://x.com/mykel_io"
							rel="noreferral external"
							target="_blank"
							aria-label="X"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 16M20 4 4 20" /></svg>
						</a>
						<a
							href="https://www.instagram.com/mykel_io/"
							rel="noreferral external"
							target="_blank"
							aria-label="Instagram"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<rect x="4" y="4" width="16" height="16" rx="5" />
								<circle cx="12" cy="12" r="3.2" />
								<circle cx="17" cy="7" r="0.8" />
							</svg>
						</a>
						<a
							href="https://www.linkedin.com/in/michaelolawale/"
							rel="noreferral external"
							target="_blank"
							aria-label="LinkedIn"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M6.5 10v8M6.5 6.5v.1M11 18v-8M11 13.5c0-2.1 1.2-3.7 3.3-3.7 2 0 3.2 1.3 3.2 3.8V18"
								/>
							</svg>
						</a>
					</div>
				</div>
			</nav>
		</div>
		<div class="footer-brand">
			<p>NEWSROOM</p>
			<div class="legal">
				<a href="#top">Back to top <span aria-hidden="true">&uarr;</span></a>
				<span>Copyright &copy; Newsroom 2026</span>
			</div>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		overflow: hidden;
		background: var(--footer-bg);
		color: var(--footer-ink);
	}

	.footer-inner {
		max-width: 1320px;
		margin: 0 auto;
		padding: 58px 0 24px;
	}

	.footer-content {
		display: grid;
		grid-template-columns: 552px minmax(0, 575px);
		gap: 181px;
		align-items: start;
	}

	.newsletter {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.newsletter p {
		width: min(100%, 469px);
		margin: 0;
		font-size: 18px;
		line-height: 1.4;
	}

	form {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		border-radius: 6px;
		background: var(--field-bg);
		padding: 6px 6px 6px 12px;
	}

	label {
		min-width: 0;
		flex: 1;
	}

	input {
		width: 100%;
		border: 0;
		background: transparent;
		color: var(--field-ink);
		font: inherit;
		font-size: 14px;
		line-height: 1.4;
		outline: 0;
	}

	input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}

	button {
		width: 106px;
		height: 38px;
		border: 0;
		border-radius: 4px;
		background: var(--button-bg);
		color: var(--button-ink);
		font-weight: 500;
		cursor: pointer;
	}

	.footer-links {
		display: flex;
		justify-content: space-evenly;
		gap: 32px;
	}

	.footer-links div {
		display: flex;
		flex-direction: column;
		gap: 13px;
	}

	h2 {
		margin: 0 0 3px;
		color: var(--footer-ink);
		font-size: 16px;
		font-weight: 500;
		line-height: 1.2;
	}

	a {
		color: var(--footer-link);
		font-size: 16px;
		line-height: 1.2;
		text-decoration: none;
	}

	.socials {
		flex-direction: row !important;
		gap: 16px !important;
	}

	.socials a {
		display: grid;
		width: 24px;
		height: 24px;
		place-items: center;
		color: var(--footer-ink);
	}

	svg {
		width: 24px;
		height: 24px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.6;
	}

	.footer-brand {
		margin-top: 104px;
	}

	.footer-brand p {
		margin: 0;
		font-size: 120px;
		font-weight: 500;
		line-height: 0.9;
		letter-spacing: 0;
	}

	.legal {
		display: flex;
		justify-content: flex-end;
		gap: 303px;
		margin-top: 22px;
		color: var(--footer-ink);
		font-size: 14px;
	}

	.legal a,
	.legal span {
		color: var(--footer-ink);
		font-size: 14px;
		line-height: 1.4;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	@media (max-width: 1024px) {
		.footer-inner {
			padding: 32px 32px 24px;
		}

		.footer-content {
			grid-template-columns: 1fr;
			gap: 78px;
			max-width: 665px;
		}

		.footer-links {
			max-width: 575px;
		}

		.footer-brand {
			margin-top: 60px;
		}

		.footer-brand p {
			font-size: 120px;
		}

		.legal {
			justify-content: flex-start;
			gap: 300px;
			margin-left: 10px;
		}
	}

	@media (max-width: 640px) {
		.footer-inner {
			padding: 32px 20px 30px;
		}

		.footer-content {
			gap: 76px;
		}

		.newsletter p {
			font-size: 16px;
		}

		form {
			width: 316px;
			max-width: 100%;
		}

		.footer-links {
			flex-direction: column;
			gap: 60px;
		}

		.footer-brand {
			margin-top: 86px;
		}

		.footer-brand p {
			font-size: 60px;
		}

		.legal {
			justify-content: space-between;
			gap: 16px;
			margin-left: 0;
			font-size: 14px;
		}
	}
</style>

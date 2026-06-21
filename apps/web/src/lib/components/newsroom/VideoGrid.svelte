<script lang="ts">
	import SectionHeader from './SectionHeader.svelte';

	type Video = {
		title: string;
		image: string;
	};

	type Props = {
		videos: Video[];
	};

	let { videos }: Props = $props();
</script>

<section class="videos" aria-labelledby="videos-title">
	<div class="section-inner">
		<SectionHeader id="videos-title" title="Videos" />
		<div class="video-grid">
			{#each videos as video (video.title)}
				<article class="video-card">
					<div class="thumb">
						<img src={video.image} alt="" />
						<button type="button" aria-label={`Play video: ${video.title}`}>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="m9 7 8 5-8 5V7Z" />
							</svg>
						</button>
					</div>
					<h3>{video.title}</h3>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.videos {
		background: var(--surface);
	}

	.section-inner {
		max-width: 1320px;
		margin: 0 auto;
		padding: 86px 0 86px;
	}

	.video-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 28px;
		margin-top: 41px;
	}

	.video-grid > :global(* + *) {
		border-left: 1px solid var(--line);
		padding-left: 28px;
	}

	.video-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.thumb {
		position: relative;
		height: 273px;
		overflow: hidden;
		border-radius: 12px;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	button {
		position: absolute;
		top: 50%;
		left: 50%;
		display: grid;
		width: 48px;
		height: 48px;
		place-items: center;
		transform: translate(-50%, -50%);
		border: 1px solid rgb(255 255 255 / 0.6);
		border-radius: 50%;
		background: rgb(21 21 21 / 0.38);
		color: #fff;
		cursor: pointer;
		backdrop-filter: blur(4px);
	}

	svg {
		width: 22px;
		height: 22px;
		fill: currentColor;
	}

	h3 {
		margin: 0;
		color: var(--ink);
		font-size: 20px;
		font-weight: 500;
		line-height: 1.2;
	}

	@media (max-width: 1024px) {
		.section-inner {
			padding: 64px 32px;
		}

		.video-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 32px 24px;
		}

		.video-grid > :global(* + *) {
			border-left: 0;
			padding-left: 0;
		}
	}

	@media (max-width: 640px) {
		.section-inner {
			padding: 54px 20px;
		}

		.video-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

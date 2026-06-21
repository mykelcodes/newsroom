<script lang="ts">
	let { categories } = $props();

	const images = [
		{ className: 'center', src: '/newsroom/hero-main.jpg' },
		{ className: 'left-top', src: '/newsroom/hero-left.jpg' },
		{ className: 'right-top', src: '/newsroom/hero-right.jpg' },
		{ className: 'left-bottom', src: '/newsroom/hero-left-small.jpg' },
		{ className: 'right-bottom', src: '/newsroom/hero-right-small.jpg' }
	];
</script>

<section class="hero" aria-label="Newsroom hero">
	<div class="headline-wrap">
		<h1>NEWSROOM</h1>
		<div class="ticker" aria-label="News categories">
			{#each categories as item (item.code)}
				<span class="uppercase">{item.name}</span>
			{/each}
		</div>
	</div>
	<div class="image-collage" aria-hidden="true">
		{#each images as image (image.src)}
			<img class={image.className} src={image.src} alt="" />
		{/each}
	</div>
</section>

<style>
	.hero {
		--masthead-top: 0px;
		--ticker-top: clamp(70px, 7.2vw, 104px);

		position: relative;
		height: 1008px;
		overflow: hidden;
		background: var(--surface);
	}

	.headline-wrap {
		position: absolute;
		top: -12px;
		left: 0;
		width: 100%;
		height: 340px;
	}

	h1 {
		position: absolute;
		top: var(--masthead-top);
		left: 50%;
		z-index: 1;
		width: 100%;
		max-width: 100vw;
		margin: 0;
		transform: translateX(-50%);
		color: var(--ink);
		font-size: clamp(46px, 14.6vw, 224px);
		font-weight: 500;
		line-height: 1.15;
		letter-spacing: 0;
		text-align: center;
		white-space: nowrap;
	}

	.ticker {
		position: absolute;
		top: var(--ticker-top);
		left: 50%;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20px;
		width: min(1631px, 100vw);
		overflow: hidden;
		transform: translateX(-50%);
		border-top: 1.5px solid var(--line-strong);
		border-bottom: 1.5px solid var(--line-strong);
		background: var(--surface);
		padding: 8px clamp(20px, 5.4vw, 78px);
		color: var(--ink);
		font-size: 14px;
		font-weight: 500;
		line-height: 1.2;
		white-space: nowrap;
	}

	.ticker span {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.ticker span:not(:last-child)::after {
		content: '';
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--ink);
	}

	.image-collage img {
		position: absolute;
		z-index: 3;
		border-radius: 10px;
		object-fit: cover;
	}

	.center {
		top: 281px;
		left: 50%;
		width: 477px;
		height: 657px;
		transform: translateX(-50%);
	}

	.left-top {
		top: 290px;
		left: 42px;
		width: 412px;
		height: 246px;
	}

	.right-top {
		top: 474px;
		right: 42px;
		width: 408px;
		height: 246px;
	}

	.left-bottom {
		top: 556px;
		left: 101px;
		width: 326px;
		height: 196px;
	}

	.right-bottom {
		top: 741px;
		right: 97px;
		width: 326px;
		height: 196px;
	}

	@media (max-width: 1024px) {
		.hero {
			--masthead-top: 20px;
			--ticker-top: 70px;

			height: 658px;
		}

		.headline-wrap {
			top: 0;
		}

		h1 {
			line-height: 1.12;
		}

		.ticker {
			font-size: 14px;
		}

		.center {
			top: 226px;
			width: 275px;
			height: 378px;
		}

		.left-top {
			top: 231px;
			left: 27px;
			width: 237px;
			height: 142px;
		}

		.right-top {
			top: 337px;
			right: 25px;
			width: 235px;
			height: 142px;
		}

		.left-bottom {
			top: 384px;
			left: 60px;
			width: 188px;
			height: 113px;
		}

		.right-bottom {
			top: 491px;
			right: 56px;
			width: 188px;
			height: 113px;
		}
	}

	@media (max-width: 640px) {
		.hero {
			--masthead-top: 44px;
			--ticker-top: 60px;

			height: 566px;
		}

		.headline-wrap {
			top: 0;
		}

		h1 {
			line-height: 1;
		}

		.ticker {
			width: 100vw;
			height: 24px;
			justify-content: center;
			font-size: 12px;
		}

		.center {
			top: 162px;
			left: 50%;
			width: 228px;
			height: 360px;
		}

		.left-top {
			top: 166px;
			left: -151px;
			width: 198px;
			height: 118px;
		}

		.right-top {
			top: 255px;
			right: -109px;
			width: 196px;
			height: 118px;
		}

		.left-bottom {
			top: 294px;
			left: -123px;
			width: 156px;
			height: 94px;
		}

		.right-bottom {
			top: 383px;
			right: -83px;
			width: 156px;
			height: 94px;
		}
	}
</style>

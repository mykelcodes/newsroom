<section class="editorial-band" aria-label="Editorial statement">
	<img src="/newsroom/editorial.jpg" alt="" />
	<div class="text essential">Essential.</div>
	<div class="text nothing">Nothing more.</div>
</section>

<style>
	.editorial-band {
		position: relative;
		height: 594px;
		overflow: hidden;
		background: #151515;
		color: #fff;
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.8;
	}

	.text {
		position: absolute;
		font-weight: 400;
		line-height: 0.95;
		letter-spacing: 0;
	}

	.essential {
		left: 17.7vw;
		top: 155px;
		font-size: 88px;
	}

	.nothing {
		right: 17.7vw;
		top: 320px;
		font-size: 56px;
	}

	@media (max-width: 1024px) {
		.editorial-band {
			height: 368px;
		}

		.essential {
			left: 32px;
			top: 133px;
			font-size: 60px;
		}

		.nothing {
			right: 64px;
			top: 226px;
			font-size: 34px;
		}
	}

	@media (max-width: 640px) {
		.editorial-band {
			height: 543px;
		}

		img {
			object-position: center;
		}

		.essential {
			left: 32px;
			top: 190px;
			font-size: 42px;
		}

		.nothing {
			right: 32px;
			top: 270px;
			font-size: 24px;
		}
	}
</style>

<script lang="ts">
	import { resolve } from '$app/paths';

	type Props = {
		id: string;
		title: string;
		action?: string;
	};

	let { id, title, action = 'See all' }: Props = $props();
</script>

<div class="section-header">
	<div class="header-row">
		<h2 {id}>{title}</h2>
		<a href={resolve('/')}>
			{action}
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 19V5M5 12l7-7 7 7" />
			</svg>
		</a>
	</div>
</div>

<style>
	.section-header {
		border-bottom: 1px solid var(--line);
		padding-bottom: 14px;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
	}

	h2 {
		margin: 0;
		color: var(--ink);
		font-size: 32px;
		font-weight: 500;
		line-height: 1.2;
	}

	a {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--ink);
		font-size: 20px;
		line-height: 1.2;
		text-decoration: none;
		white-space: nowrap;
	}

	svg {
		width: 24px;
		height: 24px;
		transform: rotate(90deg);
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	@media (max-width: 1024px) {
		h2 {
			font-size: 28px;
		}
	}

	@media (max-width: 640px) {
		h2 {
			font-size: 20px;
		}
	}
</style>

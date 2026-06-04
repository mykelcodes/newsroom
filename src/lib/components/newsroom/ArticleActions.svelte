<script lang="ts">
	type Props = {
		views?: string;
		comments?: string;
	};

	let { views = '11.0K', comments = '200' }: Props = $props();
</script>

<div class="actions">
	<div class="stat-group">
		<span class="stat" aria-label={`${views} views`}>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					fill="#ff6b00"
					d="M13.5 2.4c.4 3.2-1.4 4.8-3.1 6.2-1.5 1.2-2.9 2.4-2.9 4.8 0 2.7 2.1 4.6 4.5 4.6s4.5-1.9 4.5-4.4c0-1.8-.8-3.1-2.1-4.5.1 1.7-.6 2.9-1.8 3.5.4-2.7-.7-5.3-3-7.7 3.9 1.1 7 4.5 7 8.7 0 4.4-3.5 7.7-7.7 7.7s-7.6-3.2-7.6-7.6c0-3.8 2.3-5.8 4.4-7.6 1.6-1.3 3.1-2.6 3.5-4.9 1.8.6 3.3 1.8 4.3 3.2Z"
				/>
			</svg>
			{views}
		</span>
		<span class="stat" aria-label={`${comments} comments`}>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M7 8.5h10M7 12h7M5.8 18.7l-3 2.1V5.5A3.5 3.5 0 0 1 6.3 2h11.4a3.5 3.5 0 0 1 3.5 3.5v8.7a3.5 3.5 0 0 1-3.5 3.5H7.3c-.5 0-1 .1-1.5.4Z"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.6"
				/>
			</svg>
			{comments}
		</span>
	</div>
	<button class="save" type="button" aria-label="Save article">
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M6.5 4.8A2.3 2.3 0 0 1 8.8 2.5h6.4a2.3 2.3 0 0 1 2.3 2.3v16.1L12 17.7l-5.5 3.2V4.8Z"
				fill="none"
				stroke="currentColor"
				stroke-linejoin="round"
				stroke-width="1.6"
			/>
		</svg>
	</button>
</div>

<style>
	.actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		width: 100%;
		color: var(--ink-soft);
		font-size: 16px;
		line-height: 1.4;
	}

	.stat-group,
	.stat {
		display: flex;
		align-items: center;
	}

	.stat-group {
		gap: 20px;
	}

	.stat {
		gap: 8px;
		white-space: nowrap;
	}

	svg {
		width: 24px;
		height: 24px;
		flex: 0 0 auto;
	}

	.save {
		display: grid;
		width: 28px;
		height: 28px;
		place-items: center;
		border: 0;
		padding: 0;
		background: transparent;
		color: var(--ink-soft);
		cursor: pointer;
	}

	.save:focus-visible {
		outline: 2px solid var(--line-strong);
		outline-offset: 3px;
	}
</style>

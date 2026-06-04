<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	const { categories } = $props();

	let isSidebarOpen = $state(false);
	let isDarkMode = $state(false);

	onMount(() => {
		const storedTheme = getStoredTheme();
		const activeTheme = document.documentElement.dataset.theme;

		isDarkMode = (storedTheme ?? activeTheme) === 'dark';
		applyTheme(isDarkMode ? 'dark' : 'light');
	});

	function openSidebar() {
		isSidebarOpen = true;
	}

	function closeSidebar() {
		isSidebarOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeSidebar();
		}
	}

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		applyTheme(isDarkMode ? 'dark' : 'light');
	}

	function applyTheme(theme: 'dark' | 'light') {
		document.documentElement.dataset.theme = theme;

		try {
			localStorage.setItem('newsroom-theme', theme);
		} catch {
			// Some privacy modes block storage; the active document theme should still update.
		}
	}

	function getStoredTheme() {
		try {
			return localStorage.getItem('newsroom-theme');
		} catch {
			return null;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<header id="top" class="site-header">
	<div class="topbar">
		<div class="left-tools">
			<button
				type="button"
				aria-controls="category-sidebar"
				aria-expanded={isSidebarOpen}
				aria-label="Open category menu"
				onclick={openSidebar}
				class="menu-toggle"
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M4 7h16M4 12h16M4 17h16" />
				</svg>
			</button>
			<div class="socials" aria-label="Social links">
				<a href={resolve('/')} aria-label="X">
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" /></svg>
				</a>
				<a href={resolve('/')} aria-label="LinkedIn">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M6.5 10v8M6.5 6.5v.1M11 18v-8M11 13.5c0-2.1 1.2-3.7 3.3-3.7 2 0 3.2 1.3 3.2 3.8V18"
						/>
					</svg>
				</a>
				<a href={resolve('/')} aria-label="Instagram">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<rect x="4" y="4" width="16" height="16" rx="5" />
						<circle cx="12" cy="12" r="3.2" />
					</svg>
				</a>
			</div>
		</div>
		<a class="brand" href={resolve('/')}>NEWSROOM</a>
		<div class="right-tools">
			<!-- <button type="button" aria-label="Search">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<circle cx="10.5" cy="10.5" r="6.5" />
					<path d="m16 16 4 4" />
				</svg>
			</button> -->
			<button
				type="button"
				aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
				aria-pressed={isDarkMode}
				onclick={toggleTheme}
			>
				{#if isDarkMode}
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="12" r="4" />
						<path
							d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"
						/>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
	<nav aria-label="Primary navigation">
		{#each categories as item (item.code)}
			<a href={resolve('/')} class="uppercase">{item.name}</a>
		{/each}
	</nav>
</header>

{#if isSidebarOpen}
	<div class="drawer-layer" transition:fade={{ duration: 120 }}>
		<button
			class="drawer-overlay"
			type="button"
			aria-label="Close category menu"
			onclick={closeSidebar}
		></button>
		<div
			id="category-sidebar"
			class="category-drawer"
			role="dialog"
			aria-modal="true"
			aria-label="Category menu"
			transition:fly={{ x: -24, duration: 160 }}
		>
			<div class="drawer-header">
				<p>Categories</p>
				<button type="button" aria-label="Close category menu" onclick={closeSidebar}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M6 6l12 12M18 6 6 18" />
					</svg>
				</button>
			</div>
			<nav class="drawer-nav" aria-label="Category navigation">
				{#each categories as item (item.code)}
					<a href={resolve('/')} class="uppercase" onclick={closeSidebar}>{item.name}</a>
				{/each}
			</nav>
		</div>
	</div>
{/if}

<style>
	.site-header {
		position: relative;
		z-index: 5;
		background: var(--surface);
		border-bottom: 1px solid var(--line-strong);
		color: var(--ink);
	}

	.topbar {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 79px;
		padding: 20px 60px;
	}

	.left-tools,
	.right-tools,
	.socials {
		display: flex;
		align-items: center;
	}

	.left-tools {
		gap: 24px;
	}

	.right-tools {
		gap: 15px;
	}

	.socials {
		gap: 12px;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	.brand {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		font-size: 32px;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0;
	}

	.menu-toggle {
		display: none;
	}

	button,
	.socials a {
		display: grid;
		width: 24px;
		height: 24px;
		place-items: center;
		border: 0;
		padding: 0;
		background: transparent;
		color: var(--ink);
		cursor: pointer;
	}

	.socials a {
		width: 20px;
		height: 20px;
	}

	svg {
		width: 100%;
		height: 100%;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	nav {
		display: flex;
		justify-content: center;
		gap: 32px;
		height: 51px;
		padding-top: 10px;
		font-size: 16px;
		line-height: 1.2;
		white-space: nowrap;
	}

	.drawer-layer {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: none;
	}

	.drawer-overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
		background: var(--overlay);
		cursor: pointer;
	}

	.category-drawer {
		position: relative;
		z-index: 1;
		width: min(330px, 86vw);
		height: 100%;
		background: var(--surface-elevated);
		box-shadow: var(--shadow-elevated);
		color: var(--ink);
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--line-strong);
		padding: 24px 24px 20px;
	}

	.drawer-header p {
		margin: 0;
		font-size: 28px;
		font-weight: 700;
		line-height: 1;
	}

	.drawer-nav {
		display: flex;
		height: auto;
		flex-direction: column;
		align-items: stretch;
		gap: 0;
		padding: 8px 0;
		font-size: 18px;
		font-weight: 500;
	}

	.drawer-nav a {
		border-bottom: 1px solid var(--line-subtle);
		padding: 18px 24px;
	}

	.drawer-nav a:focus-visible,
	.drawer-header button:focus-visible,
	.drawer-overlay:focus-visible {
		outline: 2px solid var(--line-strong);
		outline-offset: -4px;
	}

	@media (max-width: 1024px) {
		.menu-toggle {
			display: grid;
		}

		.drawer-layer {
			display: block;
		}

		.topbar {
			height: 72px;
			padding: 20px 32px;
		}

		.brand {
			font-size: 28px;
		}

		nav {
			display: none;
		}
	}

	@media (max-width: 640px) {
		.topbar {
			padding: 20px;
		}

		.socials {
			display: none;
		}
	}
</style>

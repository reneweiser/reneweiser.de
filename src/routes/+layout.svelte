<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { PUBLIC_GOOGLE_SITE_VERIFICATION } from '$env/static/public';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if PUBLIC_GOOGLE_SITE_VERIFICATION}
		<meta name="google-site-verification" content={PUBLIC_GOOGLE_SITE_VERIFICATION} />
	{/if}
</svelte:head>
{@render children()}

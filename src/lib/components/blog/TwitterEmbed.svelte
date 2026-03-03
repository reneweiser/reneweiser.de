<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		url: string;
	}

	let { url }: Props = $props();

	let container: HTMLDivElement;

	onMount(() => {
		const win = window as Window & { twttr?: { widgets: { load: (el?: HTMLElement) => void } } };

		if (win.twttr) {
			win.twttr.widgets.load(container);
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://platform.twitter.com/widgets.js';
		script.async = true;
		script.onload = () => {
			win.twttr?.widgets.load(container);
		};
		document.head.appendChild(script);
	});
</script>

<div bind:this={container}>
	<blockquote class="twitter-tweet">
		<a href={url}>{url}</a>
	</blockquote>
</div>

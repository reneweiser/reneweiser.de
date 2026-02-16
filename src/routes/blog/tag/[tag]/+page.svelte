<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import BlogList from '$lib/components/blog/BlogList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Posts tagged "{data.tag}" — René Weiser</title>
	<meta name="description" content="Blog posts tagged with {data.tag}" />
</svelte:head>

<div class="grain min-h-screen">
	<Header />

	<main class="mx-auto max-w-6xl px-6 pt-32 pb-24 lg:px-8 lg:pt-40 lg:pb-32">
		<header class="mb-16">
			<a
				href="/blog"
				class="mb-6 inline-flex items-center gap-2 font-mono text-sm text-ink-muted transition-colors hover:text-copper"
			>
				<span>←</span>
				All posts
			</a>

			<h1 class="font-display text-4xl tracking-tight text-ink md:text-5xl">
				Posts tagged <span class="text-copper">"{data.tag}"</span>
			</h1>
			<p class="mt-4 text-ink-soft">
				{data.posts.length}
				{data.posts.length === 1 ? 'post' : 'posts'}
			</p>
		</header>

		<BlogList posts={data.posts} />
	</main>

	<Footer />
</div>

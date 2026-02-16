<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import BlogList from '$lib/components/blog/BlogList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const siteUrl = 'https://reneweiser.de';
	let title = $derived(`Posts tagged "${data.tag}" — René Weiser`);
	let description = $derived(
		`${data.posts.length} blog ${data.posts.length === 1 ? 'post' : 'posts'} tagged with ${data.tag}. Technical writing on web development.`
	);
	let tagUrl = $derived(`${siteUrl}/blog/tag/${encodeURIComponent(data.tag)}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />
	<link rel="canonical" href={tagUrl} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={tagUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{siteUrl}/og-default.png" />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{siteUrl}/og-default.png" />

	<link
		rel="alternate"
		type="application/rss+xml"
		title="René Weiser — Blog"
		href="/feed.xml"
	/>
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

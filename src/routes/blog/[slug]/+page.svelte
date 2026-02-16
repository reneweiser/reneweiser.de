<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { formatDate } from '$lib/utils/blog';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const siteUrl = 'https://reneweiser.de';

	let postUrl = $derived(`${siteUrl}/blog/${data.post.slug}`);

	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: data.post.title,
		description: data.post.description,
		datePublished: data.post.date,
		dateModified: data.post.updated || data.post.date,
		author: {
			'@type': 'Person',
			name: 'René Weiser',
			url: siteUrl
		},
		publisher: {
			'@type': 'Person',
			name: 'René Weiser'
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': postUrl
		},
		keywords: data.post.tags.join(', ')
	});
</script>

<svelte:head>
	<title>{data.post.title} — René Weiser</title>
	<meta name="title" content={data.post.title} />
	<meta name="description" content={data.post.description} />
	<link rel="canonical" href={postUrl} />

	<meta property="og:type" content="article" />
	<meta property="og:url" content={postUrl} />
	<meta property="og:title" content={data.post.title} />
	<meta property="og:description" content={data.post.description} />
	<meta property="article:published_time" content={data.post.date} />
	{#if data.post.updated}
		<meta property="article:modified_time" content={data.post.updated} />
	{/if}
	{#each data.post.tags as tag (tag)}
		<meta property="article:tag" content={tag} />
	{/each}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.post.title} />
	<meta name="twitter:description" content={data.post.description} />

	<link
		rel="alternate"
		type="application/rss+xml"
		title="René Weiser — Blog"
		href="/feed.xml"
	/>

	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="grain min-h-screen">
	<Header />

	<article class="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8 lg:pt-40 lg:pb-32">
		<!-- Post Header -->
		<header class="mb-12 border-b border-ink/10 pb-8">
			<div class="mb-6 flex flex-wrap items-center gap-4 font-mono text-sm text-ink-soft">
				<time datetime={data.post.date}>
					{formatDate(data.post.date)}
				</time>
				<span>·</span>
				<span>{data.post.readingTime}</span>
				{#if data.post.updated}
					<span>·</span>
					<span>Updated {formatDate(data.post.updated)}</span>
				{/if}
			</div>

			<h1
				class="mb-4 font-display text-4xl tracking-tight text-ink md:text-5xl lg:text-6xl"
			>
				{data.post.title}
			</h1>

			<p class="text-xl leading-relaxed text-ink-muted">
				{data.post.description}
			</p>

			<!-- Tags -->
			<div class="mt-6 flex flex-wrap gap-2">
				{#each data.post.tags as tag (tag)}
					<a
						href="/blog/tag/{encodeURIComponent(tag)}"
						class="rounded-full border border-ink/10 bg-paper-muted/50 px-3 py-1 font-mono text-xs text-ink-muted transition-all hover:border-copper/30 hover:bg-copper/5 hover:text-copper"
					>
						{tag}
					</a>
				{/each}
			</div>
		</header>

		<!-- Post Content (mdsvex component) -->
		<div class="blog-prose prose prose-lg max-w-none">
			<data.component />
		</div>

		<!-- Post Footer -->
		<footer class="mt-16 border-t border-ink/10 pt-8">
			<a
				href="/blog"
				class="inline-flex items-center gap-2 font-mono text-sm text-ink-muted transition-colors hover:text-copper"
			>
				<span>←</span>
				Back to blog
			</a>
		</footer>
	</article>

	<Footer />
</div>

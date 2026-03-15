<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import AuthorByline from '$lib/components/blog/AuthorByline.svelte';
	import { siteUrl } from '$lib/config';
	import { formatDate } from '$lib/utils/blog';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let postUrl = $derived(`${siteUrl}/blog/${data.post.slug}`);
	let ogImage = $derived(`${siteUrl}/og-blog-${data.post.slug}.webp`);

	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'BlogPosting',
				inLanguage: 'de',
				headline: data.post.title,
				description: data.post.description,
				...(data.post.image && { image: `${siteUrl}${data.post.image}` }),
				datePublished: data.post.date,
				dateModified: data.post.updated || data.post.date,
				author: {
					'@type': 'Person',
					name: 'René Weiser',
					url: siteUrl,
					image: `${siteUrl}/profile-avatar@2x.webp`
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
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Home',
						item: siteUrl
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Blog',
						item: `${siteUrl}/blog`
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: data.post.title,
						item: postUrl
					}
				]
			}
		]
	});
</script>

<svelte:head>
	<title>{data.post.title} — René Weiser</title>
	<meta name="title" content={data.post.title} />
	<meta name="description" content={data.post.description} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={postUrl} />

	<meta property="og:type" content="article" />
	<meta property="og:url" content={postUrl} />
	<meta property="og:title" content={data.post.title} />
	<meta property="og:description" content={data.post.description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:site_name" content="René Weiser" />
	<meta property="article:published_time" content={data.post.date} />
	{#if data.post.updated}
		<meta property="article:modified_time" content={data.post.updated} />
	{/if}
	{#each data.post.tags as tag (tag)}
		<meta property="article:tag" content={tag} />
	{/each}
	<meta property="article:author" content="René Weiser" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.post.title} />
	<meta name="twitter:description" content={data.post.description} />
	<meta name="twitter:image" content={ogImage} />

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
					<span>Aktualisiert {formatDate(data.post.updated)}</span>
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
						href="/blog/tag/{encodeURIComponent(tag.toLowerCase())}"
						class="rounded-full border border-ink/10 bg-paper-muted/50 px-3 py-1 font-mono text-xs text-ink-muted transition-all hover:border-copper/30 hover:bg-copper/5 hover:text-copper"
					>
						{tag}
					</a>
				{/each}
			</div>
		</header>

		<!-- Title Card Image -->
		{#if data.post.image}
			<img
				src={data.post.image}
				alt={data.post.imageAlt || data.post.title}
				width="1536"
				height="1024"
				class="mb-12 w-full rounded-lg border border-ink/10"
			/>
		{/if}

		<!-- Post Content (mdsvex component) -->
		<div class="blog-prose prose prose-lg max-w-none">
			<data.component />
		</div>

		<!-- Post Footer -->
		<footer class="mt-16 border-t border-ink/10 pt-8">
			<div class="mb-8">
				<AuthorByline />
			</div>

			<a
				href="/blog"
				class="inline-flex items-center gap-2 font-mono text-sm text-ink-muted transition-colors hover:text-copper"
			>
				<span>←</span>
				Zurück zum Blog
			</a>
		</footer>
	</article>

	<Footer />
</div>

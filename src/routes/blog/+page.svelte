<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import BlogList from '$lib/components/blog/BlogList.svelte';
	import { siteUrl } from '$lib/config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let activeTag = $state<string | null>(null);

	let filteredPosts = $derived(
		activeTag ? data.posts.filter((p) => p.tags.includes(activeTag!)) : data.posts
	);
	const title = 'Blog — René Weiser';
	const description =
		'Praxisnahe Artikel über Webentwicklung, Laravel, SvelteKit und DevOps. Technik mit Geschäftswert — von einem Full-Stack-Entwickler mit fast zehn Jahren Erfahrung.';

	const breadcrumbLd = {
		'@context': 'https://schema.org',
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
			}
		]
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{siteUrl}/blog" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="{siteUrl}/blog" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{siteUrl}/og-default.webp" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:site_name" content="René Weiser" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{siteUrl}/og-default.webp" />

	<link
		rel="alternate"
		type="application/rss+xml"
		title="René Weiser — Blog"
		href="/feed.xml"
	/>

	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`}
</svelte:head>

<div class="grain min-h-screen">
	<Header />

	<main class="mx-auto max-w-6xl px-6 pt-32 pb-24 lg:px-8 lg:pt-40 lg:pb-32">
		<!-- Page Header -->
		<header class="mb-16 border-b border-ink/10 pb-8">
			<h1 class="mb-4 font-display text-5xl tracking-tight text-ink md:text-6xl">Blog</h1>
			<p class="max-w-2xl text-xl text-ink-muted">
				Technik mit Geschäftswert — Webentwicklung, Architektur und Deployment.
			</p>
		</header>

		<!-- Tag Filter -->
		{#if data.tags.length > 0}
			<div class="mb-12">
				<h2 class="mb-4 font-mono text-sm uppercase tracking-wider text-ink-soft">
					Nach Thema filtern
				</h2>
				<div class="flex flex-wrap gap-2">
					<button
						onclick={() => (activeTag = null)}
						class="rounded-full border px-3 py-1 font-mono text-xs transition-all {activeTag === null
							? 'border-copper bg-copper/10 text-copper'
							: 'border-ink/10 bg-paper-muted/50 text-ink-muted hover:border-copper/30 hover:bg-copper/5 hover:text-copper'}"
					>
						Alle
					</button>
					{#each data.tags as tag (tag)}
						<button
							onclick={() => (activeTag = activeTag === tag ? null : tag)}
							class="rounded-full border px-3 py-1 font-mono text-xs transition-all {activeTag === tag
								? 'border-copper bg-copper/10 text-copper'
								: 'border-ink/10 bg-paper-muted/50 text-ink-muted hover:border-copper/30 hover:bg-copper/5 hover:text-copper'}"
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Blog Posts List -->
		<BlogList posts={filteredPosts} />
	</main>

	<Footer />
</div>

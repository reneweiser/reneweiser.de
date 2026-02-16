<script lang="ts">
	import { formatDate } from '$lib/utils/blog';
	import type { BlogPost } from '$lib/types/blog';

	let { posts }: { posts: BlogPost[] } = $props();
</script>

<div class="space-y-8">
	{#each posts as post (post.slug)}
		<article class="group border-b border-ink/10 pb-8 last:border-0">
			<a href="/blog/{post.slug}" class="block">
				<header class="mb-3">
					<h2
						class="font-display text-2xl text-ink transition-colors group-hover:text-copper md:text-3xl"
					>
						{post.title}
					</h2>
				</header>

				<p class="mb-4 leading-relaxed text-ink-muted">
					{post.description}
				</p>

				<div class="flex flex-wrap items-center gap-4 font-mono text-sm text-ink-soft">
					<time datetime={post.date}>
						{formatDate(post.date)}
					</time>
					<span>·</span>
					<span>{post.readingTime}</span>
					<span>·</span>
					<div class="flex flex-wrap gap-2">
						{#each post.tags as tag (tag)}
							<span class="text-copper/70">
								#{tag.toLowerCase().replace(/\s+/g, '')}
							</span>
						{/each}
					</div>
				</div>
			</a>
		</article>
	{/each}
</div>

{#if posts.length === 0}
	<div class="py-16 text-center">
		<p class="font-mono text-ink-soft">No posts found.</p>
	</div>
{/if}

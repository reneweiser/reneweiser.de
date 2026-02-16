<script lang="ts">
	import { formatDate } from '$lib/utils/blog';
	import type { BlogPost } from '$lib/types/blog';

	let { posts }: { posts: BlogPost[] } = $props();
</script>

{#if posts.length > 0}
	<section id="blog" class="relative px-6 py-24 lg:px-8 lg:py-32">
		<!-- Background accent -->
		<div
			class="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-paper-muted/30 to-transparent"
		></div>

		<div class="relative mx-auto max-w-6xl">
			<!-- Section header -->
			<div class="mb-16 flex items-baseline gap-4">
				<span class="font-mono text-sm text-copper">04.</span>
				<h2 class="font-display text-4xl tracking-tight text-ink md:text-5xl">Latest Writing</h2>
				<div class="hidden h-px flex-1 bg-ink/10 sm:block"></div>
			</div>

			<!-- Posts preview -->
			<div class="grid gap-8 lg:grid-cols-2">
				{#each posts.slice(0, 2) as post (post.slug)}
					<article
						class="group relative overflow-hidden rounded-lg border border-ink/10 bg-paper p-6 transition-all duration-300 hover:border-copper/30 hover:shadow-lg hover:shadow-copper/5 lg:p-8"
					>
						<a href="/blog/{post.slug}" class="block">
							<header class="mb-4">
								<h3
									class="font-display text-xl text-ink transition-colors group-hover:text-copper lg:text-2xl"
								>
									{post.title}
								</h3>
							</header>

							<p class="mb-4 text-sm leading-relaxed text-ink-muted">
								{post.description}
							</p>

							<div
								class="flex flex-wrap items-center gap-3 font-mono text-xs text-ink-soft"
							>
								<time datetime={post.date}>
									{formatDate(post.date)}
								</time>
								<span>·</span>
								<span>{post.readingTime}</span>
							</div>

							<!-- Tags -->
							<div class="mt-4 flex flex-wrap gap-2">
								{#each post.tags.slice(0, 3) as tag (tag)}
									<span
										class="rounded-full border border-ink/10 bg-paper-muted/50 px-2 py-0.5 font-mono text-xs text-ink-muted"
									>
										{tag}
									</span>
								{/each}
							</div>
						</a>

						<!-- Hover accent line -->
						<div
							class="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-copper to-copper-light transition-all duration-500 group-hover:w-full"
						></div>
					</article>
				{/each}
			</div>

			<!-- View all link -->
			<div class="mt-8 text-center">
				<a
					href="/blog"
					class="inline-flex items-center gap-2 font-mono text-sm text-ink-muted transition-colors hover:text-copper"
				>
					View all posts
					<span class="transition-transform group-hover:translate-x-1">→</span>
				</a>
			</div>
		</div>
	</section>
{/if}

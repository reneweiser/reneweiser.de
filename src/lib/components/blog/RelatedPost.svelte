<script lang="ts">
	interface Props {
		slug: string;
		description: string;
	}

	let { slug, description }: Props = $props();

	interface PostModule {
		metadata: { title: string; published: boolean };
	}

	const modules = import.meta.glob<PostModule>('/src/content/blog/*.md', { eager: true });

	function resolveTitle(postSlug: string): string {
		for (const [path, module] of Object.entries(modules)) {
			const fileSlug = path.split('/').pop()!.replace(/\.md$/, '');
			if (fileSlug === postSlug && module.metadata.published) {
				return module.metadata.title;
			}
		}
		return postSlug;
	}

	const title = $derived(resolveTitle(slug));
	const href = $derived(`/blog/${slug}`);
</script>

<aside class="not-prose my-8 border-l-[3px] border-copper bg-paper-muted/50 py-4 pr-5 pl-5 rounded-r-lg">
	<span class="text-xs font-medium tracking-wide text-ink-soft uppercase">Related</span>
	<p class="mt-1 mb-0">
		<a
			{href}
			class="font-medium text-ink no-underline hover:text-copper transition-colors duration-200"
		>
			{title}
		</a>
	</p>
	<p class="mt-1 mb-0 text-sm text-ink-soft leading-relaxed">{description}</p>
</aside>

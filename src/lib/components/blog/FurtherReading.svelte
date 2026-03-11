<script lang="ts">
	interface FurtherReadingItem {
		slug: string;
		description: string;
	}

	interface Props {
		posts: FurtherReadingItem[];
	}

	let { posts }: Props = $props();

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
</script>

<hr />

<h2>Further reading</h2>

{#each posts as post (post.slug)}

<p>
	<a href={`/blog/${post.slug}`}>{resolveTitle(post.slug)}</a> — {post.description}
</p>

{/each}

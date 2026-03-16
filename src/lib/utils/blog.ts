import type { BlogPost } from "$lib/types/blog";

interface PostModule {
  metadata: Omit<BlogPost, "slug" | "readingTime">;
  default: import("svelte").Component;
}

function estimateReadingTime(text: string): string {
  // Strip markdown syntax for a rough word count
  const stripped = text
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!?\[.*?\]\(.*?\)/g, "") // links/images
    .replace(/#{1,6}\s/g, "") // headings
    .replace(/[*_~]+/g, "") // emphasis
    .replace(/---+/g, "") // frontmatter fences
    .replace(/^---[\s\S]*?---/m, ""); // frontmatter block

  const words = stripped.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} Min. Lesezeit`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function loadBlogPosts(): BlogPost[] {
  const modules = import.meta.glob<PostModule>("/src/content/blog/*.md", {
    eager: true,
  });
  const rawModules = import.meta.glob<string>("/src/content/blog/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  });

  const posts: BlogPost[] = [];

  for (const [path, module] of Object.entries(modules)) {
    const metadata = module.metadata;
    if (!metadata.published) continue;

    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const raw = rawModules[path] ?? metadata.description;

    posts.push({
      ...metadata,
      slug,
      readingTime: estimateReadingTime(
        typeof raw === "string" ? raw : metadata.description,
      ),
    });
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getPostBySlug(
  slug: string,
): { post: BlogPost; component: import("svelte").Component } | null {
  const modules = import.meta.glob<PostModule>("/src/content/blog/*.md", {
    eager: true,
  });
  const rawModules = import.meta.glob<string>("/src/content/blog/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  });

  for (const [path, module] of Object.entries(modules)) {
    const fileSlug = path.split("/").pop()!.replace(/\.md$/, "");

    if (fileSlug === slug && module.metadata.published) {
      const raw = rawModules[path] ?? module.metadata.description;
      return {
        post: {
          ...module.metadata,
          slug: fileSlug,
          readingTime: estimateReadingTime(
            typeof raw === "string" ? raw : module.metadata.description,
          ),
        },
        component: module.default,
      };
    }
  }

  return null;
}

export function getAllTags(): string[] {
  const posts = loadBlogPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export function getAllSlugs(): string[] {
  return loadBlogPosts().map((post) => post.slug);
}

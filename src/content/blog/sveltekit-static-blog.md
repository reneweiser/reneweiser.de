---
title: Building a Static Blog with SvelteKit and mdsvex
description: "Step-by-step guide to adding a fully static, prerendered blog to a SvelteKit site using mdsvex. Covers Markdown processing, dynamic routing, syntax highlighting with Shiki, and type-safe post loading."
date: "2026-02-17"
tags:
  - SvelteKit
  - TypeScript
published: true
---

I recently added a blog to my portfolio site. The site uses SvelteKit with `adapter-static`, and I wanted the blog to be fully prerendered — no server, no runtime JavaScript for content.

Here's how it works.

## The Stack

- **SvelteKit** with `adapter-static` for static site generation
- **mdsvex** to process Markdown as Svelte components
- **Shiki** for syntax highlighting
- **Tailwind CSS Typography** for prose styling

## Content Lives in the Repo

Each post is a Markdown file with YAML frontmatter:

```markdown
---
title: "Your Post Title"
description: "Brief excerpt"
date: "2026-02-17"
tags: ["SvelteKit", "Svelte"]
published: true
---

Your content here...
```

No CMS, no database. Content is version-controlled alongside the code.

## Posts Are Loaded at Build Time

Using Vite's `import.meta.glob` with `eager: true`:

```typescript
const modules = import.meta.glob<PostModule>("/src/content/blog/*.md", {
  eager: true,
});
```

This loads all posts during the build, making them available for static generation. Each module exposes the frontmatter as `metadata` and the rendered content as a Svelte component.

## Routes Follow REST Conventions

```
/blog             → Index of all posts
/blog/[slug]      → Individual post
/blog/tag/[tag]   → Posts filtered by tag
/feed.xml         → RSS feed
```

Each route exports `prerender = true` for static generation. Dynamic routes use an `entries()` function to tell SvelteKit which paths to generate.

## Syntax Highlighting with Shiki

mdsvex supports custom highlighters. I'm using Shiki, which uses the same grammar engine as VS Code:

```javascript
const mdsvexOptions = {
  highlight: {
    highlighter: (code, lang) => {
      return escapeSvelte(
        highlighter.codeToHtml(code, { lang, theme: "github-light" }),
      );
    },
  },
};
```

The highlighting happens at build time, so there's zero runtime cost.

## The Result

A fully static blog with fast load times, no server requests, and full control over styling. Adding a new post is as simple as creating a Markdown file and pushing to git.

---
title: Hello, World
description: "First post on the new blog. Why I'm writing, what topics to expect, and the tech stack behind this site — SvelteKit, Tailwind CSS, and static deployment."
date: "2026-02-16"
tags:
  - Meta
  - SvelteKit
published: true
---

<script>
  import RelatedPost from '$lib/components/blog/RelatedPost.svelte';
</script>

This is the inaugural post of my blog. I built this portfolio site with SvelteKit and decided to add a blog section for longer-form technical writing.

## Why Write?

Writing forces clarity. It's one thing to understand a concept well enough to use it; it's another to explain it clearly enough for someone else to follow along. Writing is a forcing function for deeper understanding.

Beyond that, I've lost count of the times a well-written blog post saved me hours of debugging. Time to give back.

## What to Expect

Technical posts on topics I work with daily:

- **Web development** — Laravel, SvelteKit, Vue.js
- **DevOps** — Docker, CI/CD, deployment patterns
- **Architecture** — Design decisions, trade-offs, lessons learned

No hot takes, no fluff, no "5 ways to..." listicles. Just technical writing that I wish I'd found when solving the problem myself.

## How This Site Is Built

This site is a static SvelteKit app with:

- **Markdown processing** via mdsvex
- **Syntax highlighting** via Shiki
- **Static generation** via adapter-static
- **Typography** via Tailwind CSS

```typescript
// All blog posts are loaded at build time
const modules = import.meta.glob("/src/content/blog/*.md", { eager: true });
```

The entire blog is prerendered at build time. No server, no database, no JavaScript required for reading. Just HTML and CSS.

<RelatedPost
  slug="sveltekit-static-blog"
  description="I walk through the full build process step by step — from mdsvex setup to static deployment."
/>

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

German portfolio website for a full-stack web developer. Single-page static site with anchor navigation.

**Stack:** SvelteKit 2 (Svelte 5) · TypeScript (strict) · Tailwind CSS 4 · Vite 7 · Bun

## Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run preview      # Preview production build
bun run check        # TypeScript/Svelte type checking
bun run check:watch  # Type checking in watch mode
bun run lint         # Check formatting (Prettier)
bun run format       # Auto-format code
```

## Architecture

- **Single-page layout** with anchor navigation (no SvelteKit routing)
- **Static deployment** via adapter-auto (Vercel/Netlify)
- **Global styles** in `src/routes/layout.css` (Tailwind imports)
- **`$lib` alias** resolves to `src/lib/`

### Site Sections

Header → Hero → Über mich → Tech-Stack → Projekte (3-4) → Kontakt → Footer

See `STRUCTURE_AND_CONTENT.md` for detailed content specifications and German copy.

## Content Guidelines

- **Language:** German (target market is German employers)
- **Tone:** Professional, specific, no fluff — competence over confidence
- **Skip:** Blog, testimonials, skill bars, elaborate animations, dark mode toggle
- **Show, don't tell:** Clean code, fast loads, accessibility basics (semantic HTML, good contrast, keyboard nav)

## Svelte MCP Tools

When working with Svelte/SvelteKit topics:

1. **list-sections** — Use FIRST to discover available documentation sections
2. **get-documentation** — Fetch relevant docs based on use_cases from list-sections
3. **svelte-autofixer** — MUST run on all Svelte code before finalizing; repeat until no issues
4. **playground-link** — Only offer after code is complete; never use if code was written to project files

---
title: Über diesen Blog
description: "Dieser Blog behandelt Webentwicklung aus unternehmerischer Perspektive — für Freelancer und Kleinstunternehmen im DACH-Raum, die mit weniger Budget mehr erreichen wollen."
date: "2026-02-16"
tags:
  - Meta
  - SvelteKit
published: true
---

<script>
  import RelatedPost from '$lib/components/blog/RelatedPost.svelte';
</script>

Dieser Blog richtet sich an Freelancer und Kleinstunternehmen im DACH-Raum, die Webentwicklung nicht als Selbstzweck betreiben, sondern als Mittel zum Zweck: mehr Sichtbarkeit, bessere Conversion, weniger manuelle Arbeit.

## Worum es hier geht

Die meisten Entwicklerblogs schreiben für Entwickler. Das ist legitim — aber es ist nicht mein Fokus.

Mein Fokus ist der Schnittpunkt zwischen technischer Umsetzung und geschäftlichem Nutzen. Was bringt eine schnellere Website konkret? Wann lohnt sich ein CMS, wann nicht? Welche technischen Entscheidungen zahlen sich langfristig aus — und welche erzeugen nur unnötige Komplexität?

Das sind die Fragen, die ich hier beantworte.

## Themen

Konkret schreibe ich über:

- **Performance & Core Web Vitals** — Ladezeiten, die Conversions kosten, und wie man sie behebt
- **Moderne Frontend-Entwicklung** — SvelteKit, Vue.js, und wann welcher Ansatz passt
- **Backend & Deployment** — Laravel, Docker, CI/CD ohne Overengineering
- **Freelance-Praxis im DACH-Raum** — Marktpreise, Projektstruktur, Kundenkommunikation

Kein Hype, keine generischen Tutorials, keine Listicles. Nur Inhalte, die ich selbst gesucht hätte, bevor ich das Problem gelöst habe.

## Wie diese Seite gebaut ist

Diese Website ist eine statisch generierte SvelteKit-App:

- **Markdown-Verarbeitung** via mdsvex
- **Syntax-Highlighting** via Shiki
- **Statisches Rendering** via adapter-static
- **Typografie** via Tailwind CSS

```typescript
// Alle Blog-Posts werden zur Build-Zeit geladen
const modules = import.meta.glob("/src/content/blog/*.md", { eager: true });
```

Kein Server, keine Datenbank, kein JavaScript fürs Lesen. Nur HTML und CSS — schnell, zuverlässig, und günstig zu hosten.

<RelatedPost
  slug="sveltekit-static-blog"
  description="Ich zeige den vollständigen Aufbau Schritt für Schritt — von der mdsvex-Konfiguration bis zum statischen Deployment."
/>

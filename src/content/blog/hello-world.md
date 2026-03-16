---
title: "Webentwicklung für Freelancer und KMU im DACH-Raum"
description: "Technik-Entscheidungen, Kosten und Performance aus Unternehmersicht. Ein Blog für Freelancer und KMU, die Web-Projekte ohne Fehlinvestition umsetzen wollen."
date: "2026-02-16"
lang: de
tags:
  - Meta
  - Freelance
published: true
---

<script>
  import RelatedPost from '$lib/components/blog/RelatedPost.svelte';
</script>

Dieser Blog richtet sich an Freelancer und Kleinstunternehmen im DACH-Raum, die Webentwicklung nicht als Selbstzweck betreiben, sondern als Werkzeug für ihr Geschäft. Ich schreibe aus der Perspektive von jemandem, der seit 2018 Web-Projekte umsetzt, die meisten davon im Budgetrahmen zwischen 2.000 und 15.000 Euro.

## Was Freelancer und KMU hier finden

Die meisten Entwicklerblogs schreiben für Entwickler. Das ist legitim — aber es ist nicht mein Fokus.

Mein Fokus ist der Schnittpunkt zwischen technischer Umsetzung und geschäftlichem Nutzen. Was bringt eine schnellere Website konkret? Wann lohnt sich ein CMS, wann nicht? Welche technischen Entscheidungen zahlen sich langfristig aus, und welche erzeugen nur unnötige Komplexität?

## Themen: Technik, Kosten und Entscheidungen

- **Performance & Core Web Vitals:** Laut [Google-Daten](https://web.dev/vitals/) korrelieren gute Core Web Vitals mit deutlich weniger Seitenabbrüchen (Google nennt 24 % als Referenzwert). Ich zeige, wo die typischen Bremsen sitzen und wie du sie loswirst.
- **Moderne Frontend-Entwicklung:** SvelteKit, Vue.js, und wann welcher Ansatz passt
- **Backend & Deployment:** z. B. [Laravel mit Coolify deployen](/blog/deploy-laravel-coolify), Docker, CI/CD ohne Overengineering
- **Freelance-Praxis im DACH-Raum:** [aktuelle Marktpreise](/blog/freelancer-market-rates-2026), Projektstruktur, Kundenkommunikation

Jeder Artikel behandelt ein konkretes Problem, das mir in der Praxis begegnet ist, mit der Lösung, die funktioniert hat.

## Warum diese Website unter 0,5 Sekunden lädt

Diese Website ist eine statisch generierte [SvelteKit](https://svelte.dev/docs/kit)-App. Kein Server, keine Datenbank. Das Ergebnis: Ladezeiten unter 0,5 Sekunden und Hosting-Kosten von 0 Euro pro Monat (statisches Hosting bei Cloudflare Pages).

Blogartikel schreibe ich in Markdown. SvelteKit generiert daraus zur Build-Zeit fertiges HTML.

```typescript
// Alle Blog-Posts werden zur Build-Zeit geladen
const modules = import.meta.glob("/src/content/blog/*.md", { eager: true });
```

Der Ansatz hat Grenzen: Kein CMS, keine Kommentarfunktion, Änderungen erfordern einen neuen Build. Für einen persönlichen Blog reicht das. Für einen Unternehmensblog mit mehreren Autoren wäre ein Headless CMS die bessere Wahl.

Du hast eine konkrete Frage zu deinem Webprojekt? [Schreib mir direkt](/#kontakt).

<RelatedPost
  slug="sveltekit-static-blog"
  description="Ich zeige den vollständigen Aufbau Schritt für Schritt — von der mdsvex-Konfiguration bis zum statischen Deployment."
/>

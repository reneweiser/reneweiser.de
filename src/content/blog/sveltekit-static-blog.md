---
title: Statischen Blog mit SvelteKit bauen – ohne Server
description: "Ein statischer SvelteKit-Blog mit mdsvex kostet 0 Euro Hosting im Monat. Aufbau, Code-Beispiele und ehrliche Einschätzung, wann sich das lohnt."
date: "2026-02-17"
lang: de
tags:
  - Hintergrundwissen
  - Digitale Werkzeuge
published: true
---

Nicht jeder Blog braucht einen Server. Wer auf WordPress, ein Headless-CMS oder gemanagte Hosting-Pläne setzt, zahlt monatlich für Infrastruktur, die ein statisch generierter Blog nicht benötigt. Der Blog, den du gerade liest, ist prerendered: kein Node-Prozess, kein Datenbank-Query, keine laufenden Serverkosten.

Der Aufwand für diesen Aufbau lag bei etwa zwei Arbeitstagen (mit SvelteKit-Erfahrung). Ohne Vorkenntnisse wäre es deutlich mehr.

## Kein Server, keine Hostingkosten

- [**SvelteKit**](https://svelte.dev/docs/kit/introduction) mit `adapter-static` für statische Site-Generierung
- [**mdsvex**](https://mdsvex.pngwn.io/docs) zur Verarbeitung von Markdown als Svelte-Komponenten
- [**Shiki**](https://shiki.style/) für Syntax-Highlighting
- **Tailwind CSS Typography** für Prose-Styling

Hosting läuft auf einem CDN wie Cloudflare Pages oder Netlify. Cloudflare Pages erlaubt 500 Builds pro Monat kostenlos, Netlify 300 Build-Minuten. Für einen Blog mit ein bis zwei neuen Beiträgen pro Woche reicht das. Die laufenden Hostingkosten: 0 Euro pro Monat. Domain-Kosten fallen trotzdem an (ca. 10-15 Euro pro Jahr).

## Inhalte versioniert im Git-Repository

Jeder Beitrag ist eine Markdown-Datei mit YAML-Frontmatter:

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

Kein CMS, keine Datenbank. Inhalte liegen im Git-Repository und werden zusammen mit dem Code deployt. Ein neuer Beitrag ist ein neuer Commit, kein Admin-Interface, kein separates System, das gewartet werden muss.

## Posts laden zur Build-Zeit

Über Vites `import.meta.glob` mit `eager: true`:

```typescript
const modules = import.meta.glob<PostModule>("/src/content/blog/*.md", {
  eager: true,
});
```

SvelteKit liest alle Posts während des Builds ein. Jedes Modul liefert die Frontmatter-Daten als `metadata` und den gerenderten Inhalt als Svelte-Komponente. Zur Laufzeit gibt es nichts mehr zu berechnen, der Browser bekommt fertiges HTML.

## Vier Routen für den gesamten Blog

```
/blog             → Index aller Beiträge
/blog/[slug]      → Einzelner Beitrag
/blog/tag/[tag]   → Beiträge gefiltert nach Tag
/feed.xml         → RSS-Feed
```

Jede Route exportiert `prerender = true`. Dynamische Routen nutzen eine `entries()`-Funktion, damit SvelteKit weiß, welche Pfade es zur Build-Zeit generieren soll. Das Ergebnis sind statische HTML-Dateien, die direkt vom CDN ausgeliefert werden, ohne Roundtrip zu einem Origin-Server.

## Syntax-Highlighting zur Build-Zeit

[mdsvex](https://mdsvex.pngwn.io/docs) unterstützt benutzerdefinierte Highlighter. Shiki verwendet dieselbe Grammar-Engine wie VS Code:

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

Das Highlighting läuft zur Build-Zeit. Im Browser landet fertiges, tokenisiertes HTML, kein JavaScript, das zur Laufzeit Code parst.

## Was du damit bekommst (und was nicht)

Ein statischer Blog mit schnellen Ladezeiten und voller Kontrolle über Styling und Struktur. Dieser Blog erreicht im Lighthouse-Test (Stand Februar 2026, getestet mit realen Beiträgen) einen Performance-Score von 100, weil der Browser nur statisches HTML und CSS laden muss.

Die Wartung beschränkt sich auf das Schreiben von Markdown-Dateien. Kein CMS-Update, kein Plugin-Konflikt, keine Datenbank-Migration.

Aber: Framework-Updates (SvelteKit, mdsvex, Shiki) fallen trotzdem an. Du brauchst ein funktionierendes Dev-Setup mit Node oder Bun, und du musst mit Git umgehen können. Für jemanden ohne Entwickler-Hintergrund ist das keine praktikable Lösung. In dem Fall ist ein gemanagtes CMS wie WordPress oder ein Baukasten die bessere Wahl.

Wenn du eine Website oder einen Blog brauchst und nicht sicher bist, welcher Ansatz für dich passt, [melde dich](/#kontakt).

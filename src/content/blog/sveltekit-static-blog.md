---
title: Statischen Blog mit SvelteKit bauen — schnell, günstig, wartungsarm
description: "Statische SvelteKit-Blogs mit mdsvex, adapter-static und Shiki: kein Server, minimale Hostingkosten, maximale Performance — so funktioniert der Aufbau."
date: "2026-02-17"
tags:
  - SvelteKit
  - TypeScript
published: true
---

Ein Blog braucht keinen Server. Wer auf WordPress, ein Headless-CMS oder gemanagte Hosting-Pläne setzt, zahlt monatlich für Infrastruktur, die ein statisch generierter Blog schlicht nicht benötigt. Der Blog, den Sie gerade lesen, ist vollständig prerendered — kein Node-Prozess, kein Datenbank-Query, keine laufenden Serverkosten.

Hier ist der Aufbau dahinter.

## Der Tech-Stack

- **SvelteKit** mit `adapter-static` für statische Site-Generierung
- **mdsvex** zur Verarbeitung von Markdown als Svelte-Komponenten
- **Shiki** für Syntax-Highlighting
- **Tailwind CSS Typography** für Prose-Styling

Hosting läuft auf einem CDN wie Cloudflare Pages oder Netlify — beide haben großzügige Free-Tiers für statische Seiten. Die laufenden Kosten für diesen Blog betragen null Euro.

## Inhalte liegen im Repository

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

Kein CMS, keine Datenbank. Inhalte sind versioniert, liegen im Git-Repository und werden zusammen mit dem Code deployt. Ein neuer Beitrag ist ein neuer Commit — kein Admin-Interface, kein separates System, das gewartet werden muss.

## Posts werden zur Build-Zeit geladen

Über Vites `import.meta.glob` mit `eager: true`:

```typescript
const modules = import.meta.glob<PostModule>("/src/content/blog/*.md", {
  eager: true,
});
```

SvelteKit liest alle Posts während des Builds ein. Jedes Modul liefert die Frontmatter-Daten als `metadata` und den gerenderten Inhalt als Svelte-Komponente. Zur Laufzeit gibt es nichts mehr zu berechnen — der Browser bekommt fertiges HTML.

## Routen folgen REST-Konventionen

```
/blog             → Index aller Beiträge
/blog/[slug]      → Einzelner Beitrag
/blog/tag/[tag]   → Beiträge gefiltert nach Tag
/feed.xml         → RSS-Feed
```

Jede Route exportiert `prerender = true`. Dynamische Routen nutzen eine `entries()`-Funktion, damit SvelteKit weiß, welche Pfade es zur Build-Zeit generieren soll. Das Ergebnis sind statische HTML-Dateien, die direkt vom CDN ausgeliefert werden — ohne Roundtrip zu einem Origin-Server.

## Syntax-Highlighting mit Shiki

mdsvex unterstützt benutzerdefinierte Highlighter. Shiki verwendet dieselbe Grammar-Engine wie VS Code:

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

Das Highlighting läuft vollständig zur Build-Zeit. Im Browser landet fertiges, tokenisiertes HTML — kein JavaScript, das zur Laufzeit Code parst.

## Was dabei herauskommt

Ein vollständig statischer Blog mit schnellen Ladezeiten, null Serveranfragen und voller Kontrolle über Styling und Struktur. Core Web Vitals im grünen Bereich, weil es schlicht nichts zu optimieren gibt — statisches HTML ist von Haus aus schnell.

Die Wartung beschränkt sich auf das Schreiben von Markdown-Dateien. Kein CMS-Update, kein Plugin-Konflikt, keine Datenbank-Migration. Wer einen neuen Beitrag veröffentlichen will, erstellt eine `.md`-Datei und pusht in den Hauptbranch.

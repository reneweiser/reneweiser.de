# Portfolio Website — Structure & Content

## Technical Decisions

- **Framework:** SvelteKit (static adapter for zero-server deployment)
- **Styling:** Vanilla CSS or Tailwind — your call, both are fine. Vanilla CSS is a stronger signal of fundamentals.
- **Deployment:** Vercel or Netlify, auto-deploy from GitHub
- **Language:** German — your target market is German employers. English version is optional and low priority.
- **Layout:** Single page, anchor navigation to sections. No routing needed.

---

## Site Structure

```
┌─────────────────────────────────────┐
│  Header / Navigation                │
│  [Name] [Über mich] [Stack] [Projekte] [Kontakt]
├─────────────────────────────────────┤
│  Hero Section                       │
├─────────────────────────────────────┤
│  Über mich                          │
├─────────────────────────────────────┤
│  Tech-Stack                         │
├─────────────────────────────────────┤
│  Projekte (3–4 highlights)          │
├─────────────────────────────────────┤
│  Kontakt                            │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

---

## Section Content

### 1. Header / Navigation

Sticky, minimal. Your name (or logo if you have one — plain text is fine) on the left, anchor links on the right. On mobile: hamburger menu or just skip the nav entirely and let people scroll — it's a single page.

Links: **Über mich** · **Stack** · **Projekte** · **Kontakt**

---

### 2. Hero Section

This is your headline — the first thing anyone reads. Keep it tight.

#### Headline:
```
Full-Stack Webentwickler.
Vom Frontend bis zum Server.
```

#### Subline:
```
Ich entwickle und betreibe Webanwendungen end-to-end — von der 
Benutzeroberfläche über die Backend-Architektur bis zum Deployment. 
Seit fast zehn Jahren, mit eigenem Unternehmen und dem Anspruch, 
Software zu liefern, die im echten Betrieb funktioniert.
```

#### CTA:
A single button or text link: **Projekte ansehen ↓** (anchor to projects section)

**Design note:** Clean, lots of whitespace. No hero image needed — you're not a designer, you're a developer. A subtle code-themed background element or a monospace accent font can set the tone without trying too hard.

---

### 3. Über mich

This section bridges who you are with why someone should hire you. Not a biography — a value proposition with context.

```
Ich bin Full-Stack-Webentwickler mit knapp zehn Jahren Berufserfahrung 
und einem Hintergrund als selbstständiger Unternehmer. In dieser Zeit 
habe ich Projekte von der ersten Anforderungsanalyse bis zum produktiven 
Betrieb verantwortet — und dabei gelernt, dass gute Software nicht nur 
technisch sauber sein muss, sondern auch unter realen Bedingungen 
zuverlässig funktionieren muss.

Mein Schwerpunkt liegt auf dem Laravel-Ökosystem im Backend, Vue.js 
und Svelte im Frontend sowie Linux-basierter Infrastruktur mit Docker 
und CI/CD. Was mich von vielen Entwicklern unterscheidet: Ich kann — 
und will — Verantwortung für den gesamten Stack übernehmen. Ob 
Frontend-Bug, Datenbankoptimierung oder Serverkonfiguration — ich 
übergebe Probleme nicht, ich löse sie.

Aktuell suche ich eine Festanstellung in einem Team, das Handwerk, 
Pragmatismus und Eigenverantwortung schätzt. Ich ziehe 2025 innerhalb 
Deutschlands um und bin offen für Vor-Ort- und Hybrid-Modelle.
```

**Design note:** Two or three short paragraphs, left-aligned. No icons, no grid — just well-written text. Maybe a small professional photo if you have one (optional, not critical).

---

### 4. Tech-Stack

Visual, scannable. A clean grid showing your core technologies, grouped by area. No self-assessment bars or percentage ratings — those are meaningless and everyone knows it.

#### Structure:

**Frontend**
- HTML · CSS · JavaScript
- Vue.js · Svelte

**Backend**
- PHP · Laravel
- REST APIs · Relationale Datenbanken · Eloquent ORM

**Infrastruktur**
- Linux · Docker
- CI/CD (GitHub Actions)
- Server-Administration · Monitoring

**Workflow**
- Git · Code Review
- Agile Entwicklung · Technische Dokumentation

**Design note:** Use simple cards or a grid layout. Technology logos are fine here — they add visual recognition. Keep it clean. No hover animations, no "experience since 2016" timelines. The section should take about 5 seconds to scan.

---

### 5. Projekte

This is the most important section for credibility. Show 3–4 projects max. Quality over quantity. Each project should demonstrate something specific about your abilities.

#### Per project, include:

- **Project title** (can be generic if client work is under NDA: "E-Commerce-Plattform" is fine)
- **One-sentence description** of what it is
- **Your role / what you built** — be specific
- **Tech stack used** as tags
- **Link** to live project and/or GitHub repo (if available)
- **Optional:** One screenshot or mockup

#### Template for each project card:

```
[Screenshot / Visual]

Projektname
Kurzbeschreibung in einem Satz.

Mein Beitrag: Was genau ich gebaut, entworfen oder verantwortet habe. 
Konkret und spezifisch — keine Floskeln.

Stack: Vue.js · Laravel · Docker · GitHub Actions

[Live ansehen →]  [GitHub →]
```

#### Project selection guidance:

Pick projects that cover your range. Ideally:

1. **A frontend-heavy project** — showcasing Vue or Svelte, responsive design, UI polish
2. **A full-stack project** — Laravel backend + frontend, showing architectural decisions
3. **Something with DevOps visibility** — a project where you can point to the Docker setup, CI/CD pipeline, or deployment configuration
4. **The job search scraper** (once built) — a small, self-contained tool that shows initiative and practical thinking

**Important:** If projects are client work under NDA, describe them generically but specifically. "E-Commerce-Plattform für einen mittelständischen Händler" with a description of what you built is far better than omitting the project entirely. Just don't name the client or show their branding without permission.

---

### 6. Kontakt

Simple and direct. No contact form with a backend — a mailto link is perfectly fine. Formspree or Netlify Forms if you really want a form without a backend.

```
Interesse geweckt?

Ich freue mich über eine Nachricht — ob konkrete Stelle, 
Initiativgespräch oder einfach ein fachlicher Austausch.
```

**Links:**
- ✉ E-Mail (mailto link)
- GitHub (icon + link)
- LinkedIn (icon + link)

**Design note:** Keep it clean. The email should be the primary action. GitHub and LinkedIn as secondary links. No phone number on a public website.

---

### 7. Footer

Minimal. Your name, current year, maybe "Gebaut mit SvelteKit" as a subtle tech signal.

```
© 2025 [Dein Name] · Gebaut mit SvelteKit
```

---

## Content Principles

1. **Concise over comprehensive.** Every sentence should earn its place. If a paragraph doesn't help convince someone to contact you, cut it.

2. **Specific over generic.** "Ich habe eine REST API mit Laravel entwickelt, die 50.000 Anfragen pro Tag verarbeitet" beats "Ich habe Erfahrung mit API-Entwicklung" every time.

3. **No self-assessment inflation.** Don't call yourself a "passionate developer" or claim to be an "expert" in everything. Your work should speak for itself. Competence is more convincing than confidence.

4. **Professional, not corporate.** Write like a competent adult, not like a LinkedIn influencer and not like an HR department. The tone in your employee profile nails this — carry it through.

5. **Show, don't tell.** The site itself is a portfolio piece. Clean code, fast load times, accessibility basics (semantic HTML, good contrast, keyboard navigability) — these say more about your skills than any text could.

---

## What to Skip

- **Blog section.** You won't maintain it during an active job search, and an empty blog is worse than no blog.
- **Testimonials.** Unless you have strong, specific quotes ready to go. Generic praise doesn't move the needle.
- **"About me" trivia.** No one hiring you cares about your hobbies. Keep it professional.
- **Skill percentage bars.** "JavaScript: 85%" means nothing. Everyone knows this.
- **Elaborate animations.** A smooth scroll and maybe a subtle fade-in on scroll is the ceiling. The site should feel fast and professional, not like a CSS demo.
- **Dark/light toggle.** I mentioned this earlier as a "maybe" — honestly, skip it unless you implement it in under an hour. It's nice-to-have at best, and getting the theming right across all elements takes longer than expected. Ship the site, then add it if you want.

---

## Implementation Priority

1. **Get the structure and content live first.** Plain HTML rendered by SvelteKit with basic CSS. No project screenshots yet — placeholder text is fine temporarily.
2. **Style it.** Clean typography, good spacing, responsive. Doesn't need to be award-winning — it needs to look professional and load fast.
3. **Add project content.** Screenshots, descriptions, links. This is the part worth spending time on.
4. **Deploy.** Push to GitHub, connect to Vercel/Netlify. This should take 10 minutes.
5. **Refine.** Accessibility check, performance check (Lighthouse), meta tags for social sharing, favicon.

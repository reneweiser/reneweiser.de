---
title: "KI-Skills zu Produkten machen — was dazugehört"
description: "Warum KI-Generierung allein kein Produkt ergibt: Scheduling, persistenter Zustand und strukturierte Interfaces machen den Unterschied."
date: "2026-02-19"
lang: de
image: "/blog/wrapping-ai-skills/title.webp"
imageAlt: "Diagramm zeigt die Lücke zwischen einem rohen KI-Skill und einem vollständigen Produkt-Workflow"
tags:
  - Digitale Werkzeuge
  - Architecture
  - Hintergrundwissen
slug: wrapping-ai-skills
published: true
---

<script>
	import TwitterEmbed from '$lib/components/blog/TwitterEmbed.svelte';
	import FurtherReading from '$lib/components/blog/FurtherReading.svelte';
</script>

Jeder KI-Skill, egal wie gut, erledigt genau einen Schritt in einem Workflow. Der Produktwert liegt nicht in der Generierung. Er liegt in allem, was davor und danach passiert: Workflow-Orchestrierung, persistenter Zustand und strukturierte Interfaces, die die Ausgabe des KI-Skills konsistent nützlich machen.

Mit "Skill" meine ich jede eigenständige KI-Fähigkeit: ein Prompt-Template, ein Plugin, ein Agent-Tool. Alles, was eine Eingabe entgegennimmt, Domänenwissen anwendet und eine Ausgabe erzeugt.

"SaaS is dead" kursiert derzeit überall. Satya Nadella [sagte gegenüber The Register](https://www.theregister.com/2026/02/04/ai_replace_saas), dass Business-Applikationen "im Wesentlichen CRUD-Datenbanken mit einer Menge Business-Logik" seien und dass Agenten die Logikschicht vollständig übernehmen werden. Edmundo Ortega bei Section AI [geht noch weiter](https://www.sectionai.com/blog/is-ai-the-end-of-saas): Traditionelle Software-Interfaces (Dashboards, Dropdowns, GUIs) werden obsolet, sobald Nutzer ihre Absicht durch Sprache ausdrücken statt sich durch schrittweise Workflows zu klicken.

Diese Vorhersagen verwechseln, was die KI beiträgt (Generierung, Analyse, Entscheidungslogik), mit dem, was ein Produkt beiträgt. Nicht jede KI-Fähigkeit braucht eine Produktschicht. Wenn ein Entwickler einen einmaligen Code-Review durch einen Agenten laufen lässt oder ein Texter sich Formulierungsvorschläge holt, reicht der Skill allein. Aber wenn der Workflow über die Generierung hinausgeht, wenn die Zielgruppe nicht technisch ist, wenn Konsistenz wichtiger ist als Flexibilität, und wenn Best Practices in einer Domäne nicht selbstverständlich sind — dann ist die Produktschicht keine Option, sondern Voraussetzung. In der Praxis erfüllen die meisten professionellen Anwendungsfälle mindestens zwei dieser Kriterien.

<TwitterEmbed url="https://twitter.com/PR0GRAMMERHUM0R/status/2028213723412775295" />

## Der Skill übernimmt die Generierung — nicht den Workflow

Nehmen wir einen Social-Media-Content-Skill als Beispiel. Er kennt die Best Practices der Plattformen, versteht Engagement-Muster und kann Posts für LinkedIn, X oder Instagram erstellen. Mit dem richtigen Modell stellt er sogar strukturierte Fragen zu Zielen, Zielgruppe und Markenstimme, sodass auch jemand ohne Prompt-Erfahrung den nötigen Kontext liefern kann. Das zugrundeliegende Fachwissen ist real, und das Interaction Design entwickelt sich weiter (strukturierte Fragen statt freier Prompt-Eingabe, etwa bei Claude Projects oder ChatGPT-Custom-GPTs).

Aber "generiere einen guten LinkedIn-Post" ist ein Schritt in einem Workflow, der etliche weitere Schritte umfasst. Vor der Generierung muss jemand entscheiden, welcher Plattform diese Woche Aufmerksamkeit gebührt. Nach der Generierung muss jemand zum richtigen Zeitpunkt posten, das Engagement beobachten, auf Kommentare antworten und nachfassen. Nächste Woche muss jemand entscheiden, ob man das Erfolgreiche verdoppelt oder einen anderen Ansatz versucht.

Strukturierte Fragen lösen das Eingabeproblem. Das Entscheidungsproblem lösen sie nicht. Ein nicht-technischer Nutzer bekommt einen ordentlichen Post, muss aber immer noch herausfinden: Soll ich heute überhaupt auf LinkedIn posten? Wie erkenne ich, ob das langfristig funktioniert? Das sind Workflow-, Scheduling- und Entscheidungssupport-Probleme. Der Skill übernimmt die Generierung. Alles andere liegt beim Nutzer.

<figure>
  <img src="/blog/wrapping-ai-skills/figure-1-workflow-gap.svg" alt="Diagramm: KI-Skill übernimmt nur den Generierungsschritt, während Scheduling, Posting und Analyse manuell bleiben" />
  <figcaption>Abbildung 1: Ein KI-Skill deckt die Generierung ab — einen Schritt in einem mehrstufigen Workflow. Alles davor und danach bleibt beim Nutzer.</figcaption>
</figure>

## Warum strukturierte Interfaces die Ergebnisse verbessern

Ein SaaS-Produkt, das um einen KI-Skill herum gebaut ist, macht die Ausgabe des Skills konsistent gut — indem es einschränkt, wie er genutzt wird.

Betrachten wir den Unterschied:

**Roher Skill:** Der Nutzer tippt "Schreib mir einen LinkedIn-Post über unseren neuen Produktlaunch" und bekommt ein brauchbares Ergebnis. Vielleicht gut, vielleicht mittelmäßig, je nachdem, wie viel Kontext er geliefert hat.

<figure>
  <img src="/blog/wrapping-ai-skills/figure-2-raw-vs-wrapped.svg" alt="Vergleich: Roher KI-Skill mit minimalem Kontext versus eingebettetes Produkt mit gespeicherter Markenstimme, Historie und Scheduling" />
  <figcaption>Abbildung 2: Ein roher Skill ist auf das angewiesen, woran der Nutzer zu denken erinnert. Ein eingebettetes Produkt liefert den Kontext automatisch.</figcaption>
</figure>

**Eingebettetes Produkt:** Die Produktdetails des Nutzers sind bereits gespeichert. Das Produkt kennt die Markenstimme, die Posting-Historie, die demografischen Daten der Zielgruppe. Es schlägt vor, den Launch am Dienstagmorgen zu veröffentlichen, weil das der aktivste Zeitpunkt der Zielgruppe ist. Es generiert den Post mit dem gesamten verfügbaren Kontext, nicht nur mit dem, was der Nutzer in seinem Prompt erwähnt hat. Nach dem Posting plant es eine Follow-up-Erinnerung für Donnerstag.

Das zweite Szenario liefert bessere Ergebnisse. Nicht weil die KI intelligenter ist, sondern weil das Interface sicherstellt, dass die KI bekommt, was sie braucht. Das strukturierte Interface erledigt die Arbeit, die der Nutzer sonst manuell leisten müsste. Und es tut das konsistenter.

## Welche Infrastruktur KI-Skills nicht mitbringen

<figure>
  <img src="/blog/wrapping-ai-skills/figure-3-layer-stack.svg" alt="Schichtendiagramm: KI-Skill im Zentrum, umgeben von Scheduling, Persistenz, Benachrichtigungen und Domänenlogik" />
  <figcaption>Abbildung 3: Der Infrastruktur-Stack, der aus einem KI-Skill ein Produkt macht — Scheduling, Persistenz, Benachrichtigungen und domänenspezifische Logik.</figcaption>
</figure>

Skills laufen nicht von selbst. Sie brauchen Scheduling, Persistenz und Benachrichtigungen. Diese Infrastruktur liegt außerhalb des Generierungsschritts. Open-Source-Agent-Frameworks belegen das. [OpenClaw](https://github.com/openclaw/openclaw), mit über 145k GitHub-Stars, existiert genau deshalb, weil Entwickler erkannt haben, dass Skills allein nicht ausreichen. Es bietet einen persistenten Daemon mit Cron-Scheduling, dateibasiertem Speicher über `MEMORY.md` und Multi-Channel-Benachrichtigungen über Telegram, Slack, Discord und ein Dutzend weiterer Plattformen. Die "langweilige Infrastruktur" musste erst gebaut werden.

Aber Infrastruktur zu haben und ein Produkt zu haben sind zwei verschiedene Dinge. Ein Entwickler kann in OpenClaw Cron-Jobs verdrahten, um zu optimalen Zeiten zu posten, und Memory-Dateien konfigurieren, um Engagement zu tracken. Ein Marketing-Manager, der drei Kundenaccounts betreut, kann das nicht. Und sollte es nicht müssen. Die Frage ist nicht, ob Scheduling, Memory und Benachrichtigungen als Bausteine existieren. Sondern wer die domänenspezifischen Designentscheidungen trifft, die diese Bausteine in einen Workflow verwandeln.

Zwei Bereiche zeigen das besonders deutlich.

### Memory über Sessions hinweg

OpenClaw liefert eine `MEMORY.md`-Datei, einen Ort, um Fakten zwischen Konversationen zu persistieren. Ein Social-Media-Produkt entscheidet, *was* gespeichert wird (Engagement-Raten nach Plattform, Zielgruppendemografie, tatsächlich funktionierende Posting-Kadenz) und *wie* es genutzt wird (automatische Anpassung des Schedulings, Verfeinerung der Content-Strategie, Aufdecken von Mustern, die der Nutzer nicht bemerken würde). Die Designentscheidungen sind der Wert, nicht der Speichermechanismus.

<figure>
  <img src="/blog/wrapping-ai-skills/figure-4-memory-comparison.svg" alt="Vergleich: Dateibasiertes Memory in einem Agent-Framework versus strukturiertes, akkumulierendes Memory in einem domänenspezifischen Produkt" />
  <figcaption>Abbildung 4: Agent-Frameworks persistieren rohe Fakten. Produkte strukturieren Memory um domänenspezifische Muster und akkumulieren es über die Zeit.</figcaption>
</figure>

Jede Konversation mit einem General-Purpose-Agenten startet aus dessen Memory-Datei heraus. Ein Produkt pflegt strukturierte Historie und akkumuliert sie über Zeit. Monat drei ist intelligenter als Monat eins, weil das Produkt domänenspezifische Daten und Logik hat, nicht nur eine Persistenzschicht. Selbst Analysen, die der "Unbundling"-These nahestehen, [erkennen diese Lücke an](https://www.uncoveralpha.com/p/the-great-saas-unbundling-why-ai): LLMs fehlt die deterministische Konsistenz, die persistente, zustandsbehaftete Systeme bieten.

### Feedback-Schleifen

Ein General-Purpose-Framework kann Ergebnisse speichern. Ein Produkt interpretiert sie. Der Post, der am Dienstag doppelt so viel Engagement hatte? Ein Framework loggt ihn. Ein Produkt erinnert sich, passt seine Scheduling-Empfehlungen an und verfeinert die Content-Strategie, ohne dass der Nutzer das Muster selbst erkennen muss. Diese Feedback-Schleifen erfordern domänenspezifische Logik: Was gilt als Erfolg, was wird angepasst, wie aggressiv wird der Kurs geändert. Ein Framework liefert die Leitungen. Ein Produkt trifft die Entscheidungen.

<figure>
  <img src="/blog/wrapping-ai-skills/figure-5-feedback-loop.svg" alt="Zirkuläres Feedback-Schleifen-Diagramm: Aktion, Ergebnismessung, Interpretation durch Domänenlogik und angepasste Strategie" />
  <figcaption>Abbildung 5: Produkte schließen die Feedback-Schleife — messen Ergebnisse, interpretieren sie durch Domänenlogik und passen die Strategie automatisch an.</figcaption>
</figure>

Die [Analyse von Bain & Company zu agentischer KI und SaaS](https://www.bain.com/insights/will-agentic-ai-disrupt-saas-technology-report-2025/) kommt von der Enterprise-Seite zum gleichen Schluss. Systems of Record (Datenschicht, Zugriffskontrollen, Compliance-Regeln) bleiben fundamental, weil Agenten persistenten Zustand brauchen, um zu funktionieren. Ihre Empfehlung an Unternehmen: die Erfassung proprietärer Daten und die Kodierung von Domänenlogik, die Außenstehende nicht replizieren können, konsequent ausbauen.

## Was das für Investitionsentscheidungen bedeutet

Bevor du ein KI-Produkt baust oder [bauen lässt](/#kontakt), lohnt es sich zu verstehen, was du da eigentlich baust. Die KI ist eine Komponente, nicht das Produkt. Die Generierungsfähigkeit steht jedem mit einem API-Key oder einem Skill-Plugin offen. Das Differenzierungsmerkmal ist alles drumherum: das Interface-Design, das Nutzer zu besseren Eingaben führt, die Workflow-Orchestrierung, die Timing und Follow-ups übernimmt, und die Datenschicht, die Lernen über Zeit ermöglicht.

Bei KI-Projekten ist die verlockende Aufgabe die Modellintegration. In meiner Erfahrung macht sie selten mehr als 20 % des Entwicklungsaufwands aus. Die wertvolle Aufgabe ist die langweilige Infrastruktur darum herum: Datenbankdesign für persistenten Kontext, Scheduling-Systeme für zeitbasierte Aktionen, Benachrichtigungsinfrastruktur für Engagement, Analytics-Pipelines für Feedback-Schleifen. Open-Source-Frameworks machen die Leitungen zur Commodity. Was sie nicht zur Commodity machen können, sind die domänenspezifischen Entscheidungen: was gespeichert wird, wann gehandelt wird und wie interpretiert wird, was passiert ist. Diese Designentscheidungen sind dieselben Fähigkeiten, die SaaS-Produkte vor der KI wertvoll gemacht haben. Sie sind es auch, die KI-gestützte Produkte heute wertvoll machen.

Dieses Muster zeigt sich auf jeder Ebene. Ein Solo-Entwickler, der ein Content-Tool baut, muss immer noch entscheiden, wie Nutzerpräferenzen gespeichert werden, wann Benachrichtigungen ausgelöst werden und welche Metriken angezeigt werden. Ein Team, das ein KI-gestütztes Analytics-Produkt ausliefert, stellt dieselben Fragen mit höheren Einsätzen: Datenaufbewahrungsrichtlinien, Audit-Trails, graceful Degradation wenn das Modell Unsinn zurückgibt. Das architektonische Denken ist identisch, egal ob du [einen Static Site Generator wählst](/blog/sveltekit-static-blog) oder eine mandantenfähige KI-Plattform entwirfst. Das KI-Modell ist eine Abhängigkeit, wie eine Datenbank oder eine API. Die Architektur darum herum ist das Produkt.

Der Unterschied zwischen einem KI-Feature und einem KI-Produkt sind keine besseren Prompts. Es sind besseres Scheduling, besseres Memory und bessere Feedback-Schleifen. Das ist Software-Engineering, dieselbe Arbeit, die Produkte wertvoll gemacht hat, bevor KI beteiligt war.

<FurtherReading
  posts={[
    { slug: "hexagonal-architecture-in-laravel", description: "Architekturgrenzen sind genauso wichtig, wenn KI-Agenten den Code schreiben — hexagonale Struktur hält sie im Rahmen." }
  ]}
/>

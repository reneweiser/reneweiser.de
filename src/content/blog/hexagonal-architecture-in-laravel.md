---
title: "Hexagonale Architektur in Laravel: Wann sie sich lohnt"
description: "Wann sich hexagonale Architektur in Laravel rechnet, was sie für Wartbarkeit bedeutet und wie KI-Agenten die Kalkulation verändern."
date: "2026-02-23"
lang: de
tags:
  - Laravel
  - Architecture
  - PHP
published: true
readingTime: 8
image: "/blog/hexagonal-architecture-in-laravel/hexagonal-architecture-title.webp"
imageAlt: "Hexagonale Architektur in Laravel: Domänenstruktur mit Ports und Adaptern"
---

<script>
  import RelatedPost from '$lib/components/blog/RelatedPost.svelte';
  import FurtherReading from '$lib/components/blog/FurtherReading.svelte';
</script>

Deine Laravel-Applikation hat über 40 Models, Features überschneiden sich in Controllern, und jede Änderung zieht sechs Dateien nach sich, die du eigentlich nicht anfassen wolltest. Du kennst das Argument für hexagonale Architektur: saubere Domänengrenzen, austauschbare Infrastruktur, testbare Geschäftslogik. Und du kennst [Taylor Otwells Gegenargument](https://www.theregister.com/2025/09/01/laravel_inventor_clever_devs/): Hör auf, „Kathedralen der Komplexität" zu bauen. Beide Seiten haben einen Punkt.

Aber es gibt eine Variable, die es vor zwei Jahren noch nicht gab: KI-Agenten, die deinen Code schreiben. Das verschiebt die Kosten-Nutzen-Rechnung.

Keine Einführung in hexagonale Architektur, sondern eine Entscheidungshilfe: Passt das Muster zu deiner Laravel-Applikation? Wie sieht eine Migration konkret aus? Und wo kippt KI-Tooling die Waagschale?

## Wie sich die zwei Ansätze im Alltag unterscheiden

### Convention-First (der Standard)

Alles liegt dort, wo das Framework es erwartet: `app/Models`, `app/Http/Controllers`, `app/Services`. Generatoren funktionieren sofort. Neue Entwickler finden sich in Minuten zurecht. Pakete lassen sich ohne Konfiguration einbinden.

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── InvoiceController.php
│   │   └── CustomerController.php
│   └── Requests/
├── Models/
│   ├── Invoice.php
│   └── Customer.php
├── Services/
│   └── InvoiceService.php
└── Observers/
    └── InvoiceObserver.php
```

Der Kompromiss zeigt sich, wenn die Codebasis wächst. Die Verzeichnisstruktur spiegelt technische Schichten wider (Controller, Models, Jobs), sagt aber nichts über fachliche Domänen aus (Abrechnung, Terminplanung, Reporting). Eine neue Steuerregel erfordert Änderungen in Controllern, Form Requests, Observers und Service-Klassen, verteilt über die gesamte Applikation. Technische und fachliche Topologie driften auseinander.

### Hexagonale Architektur (Ports und Adapter)

Die Kerndomänenlogik lebt außerhalb des Frameworks. **Ports** definieren die Interfaces, die die Domäne benötigt (Repositories, Benachrichtigungen, Zahlungs-Gateways). **Adapter** implementieren diese Interfaces mit Laravel-Mitteln (Eloquent, Mail, Stripe SDK). Eine Applikationsschicht orchestriert die Use Cases.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/hexagonal-concept.svg" alt="Hexagonale Architektur: Domänenkern umgeben von Port-Interfaces und Infrastruktur-Adaptern" />
  <figcaption>Hexagonale Architektur: Adapter hängen von Ports ab, Ports von der Domäne — nie umgekehrt.</figcaption>
</figure>

```text
app/
├── Domain/
│   ├── Billing/
│   │   ├── Entities/
│   │   │   └── Invoice.php
│   │   ├── ValueObjects/
│   │   │   └── TaxRate.php
│   │   ├── Ports/
│   │   │   ├── InvoiceRepositoryInterface.php
│   │   │   └── PdfGeneratorInterface.php
│   │   ├── Exceptions/
│   │   │   └── InvoiceNotFinalizedException.php
│   │   └── UseCases/
│   │       └── GenerateInvoicePdf.php
│   └── Scheduling/
│       ├── Entities/
│       ├── Ports/
│       └── UseCases/
├── Infrastructure/
│   └── Billing/
│       ├── EloquentInvoiceRepository.php
│       ├── DompdfGenerator.php
│       └── Http/
│           └── Controllers/
│               └── InvoiceController.php
├── Models/
│   ├── Invoice.php
│   └── Customer.php
└── Providers/
    └── BillingServiceProvider.php
```

Controller, API-Resources, Middleware und Form Requests können alle in domänenspezifische Verzeichnisse unter `app/Domain/` und `app/Infrastructure/` verschoben werden. Laravel schreibt ihre Pfade nicht fest. Autoloading und Routen-Registrierung sind konfigurierbar.

### Models: Der eine Punkt, der Widerstand leistet

Models sind die Komponente mit dem größten Convention-Reibungspotenzial, wenn sie verschoben werden. Eloquent löst per FQCN auf, nicht per Dateipfad. Mechanisch funktioniert das. Aber es gibt echte Reibung:

```php
// app/Models/Invoice.php — bleibt bewusst hier
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Database\Factories\Billing\InvoiceFactory;

#[UseFactory(InvoiceFactory::class)]
class Invoice extends Model
{
    use HasFactory;
}
```

Seit Laravel 11.39 verweist das `#[UseFactory]`-Attribut `HasFactory` auf die richtige Factory-Klasse, unabhängig vom Namespace. Vor 11.39 würde man stattdessen `newFactory()` überschreiben. Beide Varianten funktionieren.

Über die Factory-Auflösung hinaus gibt es weitere Reibungspunkte: Policies müssen manuell registriert werden statt auf Auto-Discovery zu setzen. `Relation::enforceMorphMap()` muss aufgerufen werden, damit polymorphe `morphable_type`-Werte stabil bleiben. Pakete wie Nova, Filament oder Spatie Permission setzen standardmäßig den `App\Models`-Namespace voraus. Laravel 12 verbesserte die verschachtelte Policy-Erkennung innerhalb von `App\Models\*`, aber Models außerhalb dieses Namespaces benötigen nach wie vor manuelle Registrierung. Keines dieser Probleme ist ein K.O.-Kriterium, aber sie addieren sich.

Die pragmatische Entscheidung: Models in `app/Models/` belassen und den Zugriff hinter Repository-Interfaces kapseln, die in der Domänenschicht definiert sind. Das ist ein Kompromiss, keine Regel. Manche Teams haben Models erfolgreich verschoben, und ihre Gründe sind nachvollziehbar. Für die meisten Projekte lohnt sich der Aufwand durch den Gewinn an Reinheit aber nicht.

<RelatedPost
  slug="eloquent-eager-loading-n-plus-1"
  description="Wenn deine Models Dutzende Beziehungen laden, verhindert Eager Loading die N+1-Falle, bevor sie entsteht."
/>

## Hexagonal vs. Convention: Der praktische Vergleich

| Kriterium | Convention-First | Hexagonal |
|-----------|-----------------|-----------|
| **Einarbeitungszeit** | Niedrig — bekannte Struktur | Mittel — Domänenkarte muss gelernt werden |
| **Feature-Geschwindigkeit (neue Domäne)** | Anfangs niedrig, steigt mit der Codebasis | Konstant — auf eine Domäne beschränkt |
| **Testbarkeit der Geschäftslogik** | An das Framework gekoppelt | Unit-testbar mit gemockten Ports |
| **KI-Agenten-Effizienz** | Höhere Token-Kosten — verstreute Änderungen | Niedrigere Token-Kosten — eingegrenzter Kontext |
| **Paket-Kompatibilität** | Vollständig | Gelegentliche Reibung (Model-Position) |

Zur **Testbarkeit**: Wenn dein Use Case von Interfaces statt von konkreten Eloquent-Abfragen abhängt, kannst du Domänenlogik testen, ohne das Framework zu starten.

```php
// tests/Unit/Billing/GenerateInvoicePdfTest.php
it('generates a PDF for a finalized invoice', function () {
    $invoiceRepo = Mockery::mock(InvoiceRepositoryInterface::class);
    $pdfGenerator = Mockery::mock(PdfGeneratorInterface::class);

    $invoiceRepo->expects('findOrFail')
        ->with(42)
        ->andReturn(new InvoiceData(id: 42, status: 'finalized'));

    $pdfGenerator->expects('generate')
        ->once();

    $useCase = new GenerateInvoicePdf($invoiceRepo, $pdfGenerator);
    $useCase->execute(invoiceId: 42);
});
```

Dieser Test läuft in Millisekunden. Keine Datenbank, kein HTTP-Kernel, kein Service-Container.

Zur **Feature-Geschwindigkeit**: Eine neue Steuerregel in einem 40-Model-Monolithen erfordert das Durchsuchen von Controllern, Form Requests und Observers, die über `app/` verteilt sind. In einer hexagonalen Billing-Domäne liegt die Steuerregel in `app/Domain/Billing/`: ein Use Case, ein Port. Du änderst zwei Dateien, nicht sechs.

Konkret: Wenn dein Entwickler den Zahlungsanbieter wechseln muss, ändert er den `StripeAdapter`. Nichts sonst. Die Geschäftslogik, die Rechnungserstellung, die Validierung: alles bleibt unangetastet. Bei einer sauberen Adapter-Trennung ist das ein Aufwand von Stunden, nicht Wochen.

## Warum KI die Gleichung verändert hat

KI-Agenten arbeiten besser, wenn die Architektur sie einschränkt: weniger berührte Dateien pro Änderung und ein kleineres Kontextfenster.

Nehmen wir die Rechnungs-PDF-Generierung. In der konventionellen Struktur benötigt ein KI-Agent, der dieses Feature bearbeitet, den Kontext aus `InvoiceController`, `InvoiceService`, `InvoiceObserver`, `InvoiceMailable`, dem Blade-Template und der Routen-Datei. Sechs Dateien in vier Verzeichnissen. In der hexagonalen Struktur braucht der Agent nur `GenerateInvoicePdf` (den Use Case) und `DompdfGenerator` (den Adapter). Zwei Dateien in derselben Domäne. Das Kontextfenster bleibt klein, und der Agent hat weniger Gelegenheit, Code an der falschen Stelle zu ändern.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/blast-radius-comparison.svg" alt="Änderungsradius im Vergleich: konventionelle Struktur berührt 6 verteilte Dateien, hexagonal berührt 2 Dateien in einer Domäne" />
  <figcaption>Änderungsumfang pro Feature: Convention-First berührt 6 Dateien in 4 Verzeichnissen; hexagonal berührt 2 Dateien in 1 Domäne.</figcaption>
</figure>

Es geht um weniger *berührte Dateien pro Änderung*, nicht um weniger Dateien insgesamt. Eine hexagonale Codebasis hat durch Interfaces, Adapter und DTOs mehr Dateien. Aber der Änderungsumfang pro Feature schrumpft. Wenn du einem KI-Agenten sagst „Implementiere Use Case X in der Billing-Domäne, respektiere die Port-Interfaces", ist die Anweisung eingegrenzt und überprüfbar:

```text
Implement the ApplyLateFee use case in app/Domain/Billing/UseCases/.
Use the InvoiceRepositoryInterface port — do not query Eloquent directly.
Follow the existing GenerateInvoicePdf use case as a structural reference.
```

Der Agent wandert nicht durch die gesamte Codebasis. Die Interfaces wirken als Leitplanken.

Wie [Muthu in „The Architecture is the Prompt" argumentiert](https://notes.muthu.co/2025/11/the-architecture-is-the-prompt-guiding-ai-with-hexagonal-design/), ist strukturelle Durchsetzung zuverlässiger als Prompt-Engineering beim Leiten von KI. PHPs Typsystem wird zur Einschränkungsschicht. Die KI kann Architektur-Grenzen schwerer verletzen, wenn Ports und Adapter der einzige Weg in und aus der Domäne sind. PHPStan mit strikten Regeln fängt den Rest ab.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/parallel-agents-worktrees.svg" alt="Drei KI-Agenten arbeiten parallel in Git-Worktrees, jeder auf ein eigenes Domänenverzeichnis beschränkt, Merge in main" />
  <figcaption>Domänengrenzen begrenzen jeden Agenten auf seinen Git-Worktree, was Merge-Konflikte reduziert.</figcaption>
</figure>

Teams lassen bereits mehrere KI-Agenten parallel über Git-Worktrees laufen. [incident.io führt täglich 4–5 gleichzeitige Claude-Code-Sessions](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees) als Teil des Standardworkflows durch. Der Engpass sind Merge-Konflikte: Agenten in separaten Worktrees sehen die Änderungen des anderen nicht, bis Branches gemergt werden. Domänengrenzen verringern die Häufigkeit dieser Konflikte, indem sie die Änderungen jedes Agenten auf bestimmte Dateien eingrenzen.

Ein Agent, der an Billing arbeitet, berührt `app/Domain/Billing/` und `app/Infrastructure/Billing/`. Ein Agent, der an Scheduling arbeitet, berührt seine eigenen Verzeichnisse. Die Überschneidung schrumpft. Wie [Addy Osmani beobachtet](https://addyosmani.com/blog/coding-agents-manager/), verschlechtern sich die Ergebnisse von LLMs, wenn der Kontext wächst — hexagonale Domänen halten den Kontext jedes Agenten klein und die Ausgabe vorhersehbar. Das eliminiert Konflikte nicht vollständig (Tools wie [Clash](https://clash.sh/) existieren genau deshalb), aber es verbessert die Ausgangslage.

### Der Bootstrap-Einwand

Ein berechtigter Einwand: KI kann eine bestehende hexagonale Struktur *pflegen*, sicher. Aber kann sie eine solche *aufbauen*? Kann sie die schwierigen Entscheidungen über Domänengrenzen treffen?

Teilweise. KI-Skills und System-Prompts können das vollständige hexagonale Regelwerk kodieren: Namenskonventionen, Verzeichnisstruktur, Port/Adapter-Muster, wo Domänengrenzen zu ziehen sind. Ein [praktisches Experiment von Notch](https://wearenotch.com/blog/claude-code-meets-hexagonal-architecture/) zeigte, dass Claude Code korrekten hexagonalen Code generiert, wenn explizite Anweisungen in CLAUDE.md vorhanden sind, aber Belange vermengt, wenn diese fehlen. Mit der richtigen Konfiguration hält sich die KI an die Muster.

Der ehrliche Vorbehalt: Das Schreiben dieser Konfiguration erfordert Architekturwissen. Du musst hexagonale Architektur gut genug verstehen, um ihre Regeln zu kodieren. Die Einstiegshürde sank von „monatelang Erfahrung aufbauen" auf „den richtigen KI-Skill konfigurieren und die Ausgabe prüfen". Auf null sank sie nicht.

## Wann welche Variante wählen

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/decision-flowchart.svg" alt="Entscheidungsbaum: Convention-First, Mittelweg oder hexagonale Architektur in Laravel" />
  <figcaption>Wann Convention-First, Mittelweg oder hexagonale Architektur die richtige Wahl ist.</figcaption>
</figure>

**Convention-First** bei Projekten mit weniger als etwa 15 Models oder drei Bounded Contexts. Wenn das Team aus ein oder zwei Entwicklern besteht, die die gesamte Codebasis im Kopf haben, fügt hexagonale Architektur Zeremonie hinzu, ohne Klarheit zu bringen. Prototypen, Admin-Panels und CRUD-lastige Apps mit wenig Geschäftslogik gehören hierher.

Dasselbe gilt, wenn die Infrastruktur einfach und stabil ist: Wenn die App mit einer Datenbank und einem Mailer kommuniziert und nichts weiter, erzeugt das Einwickeln hinter Ports Dateien ohne Mehrwert.

**Hexagonal** ab vier oder mehr eigenständigen Geschäftsdomänen, die sich unabhängig voneinander weiterentwickeln. Das Muster zahlt sich in dieser Größenordnung aus, besonders bei mehreren Entwicklern oder KI-Agenten, die parallel über Git-Worktrees arbeiten. Es passt auch, wenn Geschäftslogik komplex genug ist, um Unit-Tests ohne Framework zu rechtfertigen, oder wenn du die KI-Agenten-Effizienz maximieren willst.

**Der Mittelweg** ist real und wird unterschätzt. Du musst nicht von Beginn an alles umstrukturieren. Extrahiere eine Domäne — die komplexeste oder am schnellsten wachsende — in eine hexagonale Struktur, während der Rest konventionell bleibt. [Victor Rentea nennt das „Relaxed Hexagonal"](https://victorrentea.ro/blog/overengineering-in-onion-hexagonal-architectures/): das Muster dort anwenden, wo es sich rentiert, und Zeremonie überall sonst weglassen. Laravels [Service Container](https://laravel.com/docs/12.x/container) macht diesen inkrementellen Ansatz natürlich. Interfaces in einem domänenspezifischen Service Provider binden, Implementierungen austauschen, ohne Consumer anzufassen.

<!-- internal link: service classes vs actions post (pipeline/2-outline/260331) — insert once published -->
<!-- internal link: laravel service container post (pipeline/2-outline/260512) — insert once published -->

## Was ich tatsächlich verwende und warum

Convention-First für die meisten Freelance-Kundenprojekte. Einarbeitungskosten sind relevant, wenn der nächste Entwickler des Kunden die Codebasis ohne ausführliches Briefing übernehmen muss. Hexagonal für Domänen mit echter Komplexität in länger laufenden Produkten.

Die praktische Umsetzung: Models bleiben in `app/Models/`. Domänenlogik zieht in `app/Domain/{Name}/` mit `Entities`, `ValueObjects`, `Ports`, `Exceptions` und `UseCases` als Unterverzeichnisse. Infrastruktur (Eloquent-Repositories, HTTP-Controller, Drittanbieter-Adapter) lebt in `app/Infrastructure/{Name}/`, getrennt von den Domänenverzeichnissen.

```php
// app/Providers/BillingServiceProvider.php
class BillingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            InvoiceRepositoryInterface::class,
            EloquentInvoiceRepository::class
        );

        $this->app->bind(
            PdfGeneratorInterface::class,
            DompdfGenerator::class
        );
    }
}
```

Routen registrieren Controller aus `app/Infrastructure/`:

```php
// routes/billing.php
use App\Infrastructure\Billing\Http\Controllers\InvoiceController;

Route::middleware(['auth', 'verified'])
    ->prefix('billing')
    ->group(function () {
        Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);
        Route::post('/invoices/{invoice}/late-fee', [InvoiceController::class, 'applyLateFee']);
    });
```

Der KI-Faktor hat meine persönliche Kalkulation verändert. Früher war der Aufwand für hexagonale Architektur bei einem Solo-Projekt schwer zu rechtfertigen. Heute, mit KI-Agenten bei der Implementierung, zahlen sich die sauberen Interfaces und eingegrenzten Domänen aus. Die Diffs bleiben klein genug für ein schnelles Review, weil der Agent nur die Dateien einer Domäne anfasst.

Ehrlicher Vorbehalt: Die erste Domänen-Extraktion hat mich bei einem 30-Model-Projekt einen vollen Arbeitstag gekostet. Jede weitere Domäne danach etwa eine Stunde. Der ROI hängt davon ab, ob das Projekt lange genug läuft, um diesen ersten Tag zu amortisieren.

## Der Kompromiss, klar benannt

Hexagonale Architektur geht nicht um Reinheit. Es geht darum, eine Codebasis für Menschen und KI-Agenten gleichermaßen navigierbar zu machen. Für Projekte mit echter Domänenkomplexität amortisiert sich die Investition schneller als früher. Für Projekte ohne diese Komplexität ist es Overhead, den du nicht brauchst.

Die Schwelle für „lohnt sich" ist gesunken. Verschwunden ist sie nicht.

Wenn du vor einer konkreten Architektur-Entscheidung stehst: [Schreib mir](/#kontakt).

<!-- internal link: service classes vs actions post (pipeline/2-outline/260331) — insert once published -->

<FurtherReading
  posts={[
    { slug: "eloquent-eager-loading-n-plus-1", description: "Sobald der Datenzugriff hinter Repository-Interfaces liegt, hält Eager Loading die Abfragen schnell." },
    { slug: "deploy-laravel-coolify", description: "Die gesamte Applikation auf einem 5-Dollar-VPS mit Coolify und Nixpacks deployen." }
  ]}
/>

---

**Quellen:**

- [Bardia Khosravi, „Backend Coding Rules for AI Coding Agents"](https://medium.com/@bardia.khosravi/backend-coding-rules-for-ai-coding-agents-ddd-and-hexagonal-architecture-ecafe91c753f)
- [vFunction, „The Rise of Vibe Coding: Why Architecture Still Matters"](https://vfunction.com/blog/vibe-coding-architecture-ai-agents/)
- [Martin Joo, „DDD with Laravel"](https://martinjoo.dev/domain-driven-design-with-laravel-domains-and-applications)
- [Loris Leiva, „Conciliating Laravel and DDD"](https://lorisleiva.com/conciliating-laravel-and-ddd)
- [Metacircuits, „AI Coding Agents: Architecture Matters"](https://metacircuits.substack.com/) — 14.000 Zeilen in 62 Dateien in einer Stunde mit einem Architecture-First-Ansatz
- [Nick Mitchinson, „Worktrees for Parallel AI Development"](https://nickmitchinson.com/worktrees-parallel-ai/)

---
title: "Saubere Architektur in Laravel: Warum sich das jetzt lohnt"
description: "Wann sich hexagonale Architektur in Laravel rechnet, was sie für Wartbarkeit und langfristige Entwicklungskosten bedeutet — und wie KI die Kalkulation verändert."
date: "2026-02-23"
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

Ihre Laravel-Applikation hat über 40 Models, Features überschneiden sich in Controllern, und jede Änderung zieht sechs Dateien nach sich, die Sie eigentlich nicht anfassen wollten. Sie kennen das Argument für hexagonale Architektur: saubere Domänengrenzen, austauschbare Infrastruktur, testbare Geschäftslogik. Und Sie kennen [Taylor Otwells Gegenargument](https://www.theregister.com/2025/09/01/laravel_inventor_clever_devs/): Hören Sie auf, „Kathedralen der Komplexität" zu bauen. Beide Seiten haben einen Punkt.

Aber es gibt eine Variable, die es vor zwei Jahren noch nicht gab: KI-Agenten, die Ihren Code schreiben. Das verändert die Kosten-Nutzen-Rechnung grundlegend.

Dieser Artikel ist kein Tutorial, sondern eine Entscheidungshilfe. Am Ende wissen Sie, ob hexagonale Architektur zu Ihrer Laravel-Applikation passt, wie eine Migration konkret aussieht — und wo KI-Tooling die Waagschale kippt.

## Zwei Wege, eine Laravel-Applikation zu strukturieren

### Convention-First (der Standard)

Alles liegt dort, wo das Framework es erwartet: `app/Models`, `app/Http/Controllers`, `app/Services`. Generatoren funktionieren sofort. Neue Entwickler finden sich in Minuten zurecht. Pakete lassen sich reibungslos einbinden.

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

Der Kompromiss zeigt sich, wenn die Codebasis wächst. Die Verzeichnisstruktur spiegelt technische Schichten wider (Controller, Models, Jobs), sagt aber nichts über fachliche Domänen aus (Abrechnung, Terminplanung, Reporting). Eine neue Steuerregel erfordert Änderungen in Controllern, Form Requests, Observers und Service-Klassen — verteilt über die gesamte Applikation. Technische und fachliche Topologie driften auseinander.

### Hexagonale Architektur (Ports und Adapter)

Die Kerndomänenlogik lebt außerhalb des Frameworks. **Ports** definieren die Interfaces, die die Domäne benötigt (Repositories, Benachrichtigungen, Zahlungs-Gateways). **Adapter** implementieren diese Interfaces mit Laravel-Mitteln (Eloquent, Mail, Stripe SDK). Eine Applikationsschicht orchestriert die Use Cases.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/hexagonal-concept.svg" alt="Hexagonal architecture diagram showing domain core surrounded by port interfaces and infrastructure adapters" />
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

Models sind die Komponente mit dem größten Convention-Reibungspotenzial, wenn sie verschoben werden. Eloquent löst per FQCN auf, nicht per Dateipfad — mechanisch funktioniert das. Aber es gibt echte Reibung:

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

Über die Factory-Auflösung hinaus müssen Policies manuell registriert werden statt auf Auto-Discovery zu setzen, `Relation::enforceMorphMap()` muss aufgerufen werden, damit polymorphe `morphable_type`-Werte stabil bleiben, und `make:model`-Scaffolding sowie Pakete wie Nova, Filament oder Spatie Permission setzen standardmäßig den `App\Models`-Namespace voraus. Laravel 12 verbesserte die verschachtelte Policy-Erkennung innerhalb von `App\Models\*`, aber Models außerhalb dieses Namespaces benötigen nach wie vor manuelle Registrierung. Keines dieser Probleme ist ein K.O.-Kriterium, aber sie addieren sich.

Die pragmatische Entscheidung: Models in `app/Models/` belassen und den Zugriff hinter Repository-Interfaces kapseln, die in der Domänenschicht definiert sind. Das ist ein Kompromiss, keine Regel. Manche Teams haben Models erfolgreich verschoben, und ihre Gründe sind nachvollziehbar. Für die meisten Projekte lohnt sich der Aufwand durch den Gewinn an Reinheit aber nicht.

<RelatedPost
  slug="eloquent-eager-loading-n-plus-1"
  description="Wenn Ihre Models Dutzende Beziehungen laden, verhindert Eager Loading die N+1-Falle, bevor sie entsteht."
/>

## Hexagonal vs. Convention: Der praktische Vergleich

| Kriterium | Convention-First | Hexagonal |
|-----------|-----------------|-----------|
| **Einarbeitungszeit** | Niedrig — bekannte Struktur | Mittel — Domänenkarte muss gelernt werden |
| **Feature-Geschwindigkeit (neue Domäne)** | Anfangs niedrig, steigt mit der Codebasis | Konstant — auf eine Domäne beschränkt |
| **Testbarkeit der Geschäftslogik** | An das Framework gekoppelt | Unit-testbar mit gemockten Ports |
| **KI-Agenten-Effizienz** | Höhere Token-Kosten — verstreute Änderungen | Niedrigere Token-Kosten — eingegrenzter Kontext |
| **Paket-Kompatibilität** | Vollständig | Gelegentliche Reibung (Model-Position) |

Zur **Testbarkeit**: Wenn Ihr Use Case von Interfaces statt von konkreten Eloquent-Abfragen abhängt, können Sie Domänenlogik testen, ohne das Framework zu starten.

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

Dieser Test läuft in Millisekunden. Keine Datenbank, kein HTTP-Kernel, kein Service-Container. Die Domänenlogik wird isoliert getestet.

Zur **Feature-Geschwindigkeit**: Eine neue Steuerregel in einem 40-Model-Monolithen erfordert das Durchsuchen von Controllern, Form Requests und Observers, die über `app/` verteilt sind. In einer hexagonalen Billing-Domäne liegt die Steuerregel in `app/Domain/Billing/` — ein Use Case, ein Port. Sie ändern zwei Dateien, nicht sechs.

Das hat direkte wirtschaftliche Konsequenzen: Wenn Ihr Entwickler den Zahlungsanbieter wechseln muss, ändert er den `StripeAdapter` — und nichts sonst. Die Geschäftslogik, die Rechnungserstellung, die Validierung: alles bleibt unangetastet. Dieser Aufwand beläuft sich auf Stunden, nicht auf Wochen.

## Warum KI die Gleichung verändert hat

Hier ist das Argument, das die meisten Artikel über hexagonale Architektur noch nicht machen: KI-Agenten arbeiten besser, wenn die Architektur sie einschränkt. Weniger berührte Dateien, kleinere Kontextfenster, vorhersehbarere Ergebnisse.

Nehmen wir die Rechnungs-PDF-Generierung. In der konventionellen Struktur benötigt ein KI-Agent, der dieses Feature bearbeitet, den Kontext aus `InvoiceController`, `InvoiceService`, `InvoiceObserver`, `InvoiceMailable`, dem Blade-Template und der Routen-Datei. Sechs Dateien in vier Verzeichnissen. In der hexagonalen Struktur braucht der Agent nur `GenerateInvoicePdf` (den Use Case) und `DompdfGenerator` (den Adapter). Zwei Dateien in derselben Domäne. Das Kontextfenster bleibt klein. Token-Kosten sinken. Genauigkeit steigt.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/blast-radius-comparison.svg" alt="Blast radius comparison — conventional structure touches 6 scattered files, hexagonal touches 2 files in one domain" />
  <figcaption>Änderungsumfang pro Feature: Convention-First berührt 6 Dateien in 4 Verzeichnissen; hexagonal berührt 2 Dateien in 1 Domäne.</figcaption>
</figure>

Es geht um weniger *berührte Dateien pro Änderung*, nicht um weniger Dateien insgesamt. Eine hexagonale Codebasis hat durch Interfaces, Adapter und DTOs mehr Dateien. Aber der Änderungsumfang pro Feature schrumpft. Wenn Sie einem KI-Agenten sagen „Implementiere Use Case X in der Billing-Domäne, respektiere die Port-Interfaces", ist die Anweisung eingegrenzt und überprüfbar:

```text
Implement the ApplyLateFee use case in app/Domain/Billing/UseCases/.
Use the InvoiceRepositoryInterface port — do not query Eloquent directly.
Follow the existing GenerateInvoicePdf use case as a structural reference.
```

Der Agent wandert nicht durch die gesamte Codebasis. Die Interfaces wirken als Leitplanken.

Wie [Muthu in „The Architecture is the Prompt" argumentiert](https://notes.muthu.co/2025/11/the-architecture-is-the-prompt-guiding-ai-with-hexagonal-design/), schlägt strukturelle Durchsetzung Prompt-Engineering beim Leiten von KI. PHPs Typsystem wird zur Einschränkungsschicht. Die KI kann Architektur-Grenzen physisch nicht verletzen, wenn Ports und Adapter der einzige Weg in und aus der Domäne sind.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/parallel-agents-worktrees.svg" alt="Three AI agents working in parallel git worktrees, each scoped to a separate domain directory, merging into main" />
  <figcaption>Domänengrenzen begrenzen jeden Agenten auf seinen Git-Worktree, was Merge-Konflikte reduziert.</figcaption>
</figure>

Teams lassen bereits mehrere KI-Agenten parallel über Git-Worktrees laufen. [incident.io führt täglich 4–5 gleichzeitige Claude-Code-Sessions](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees) als Teil des Standardworkflows durch. Der Engpass sind Merge-Konflikte: Agenten in separaten Worktrees sehen die Änderungen des anderen nicht, bis Branches gemergt werden. Domänengrenzen verringern die Häufigkeit dieser Konflikte, indem sie die Änderungen jedes Agenten auf bestimmte Dateien eingrenzen.

Ein Agent, der an Billing arbeitet, berührt `app/Domain/Billing/` und `app/Infrastructure/Billing/`. Ein Agent, der an Scheduling arbeitet, berührt seine eigenen Verzeichnisse. Die Überschneidung schrumpft. Wie [Addy Osmani beobachtet](https://addyosmani.com/blog/coding-agents-manager/), verschlechtern sich die Ergebnisse von LLMs, wenn der Kontext wächst — hexagonale Domänen halten den Kontext jedes Agenten klein und seine Ausgabe vorhersehbar. Das eliminiert Konflikte nicht vollständig (Tools wie [Clash](https://clash.sh/) existieren genau deshalb), aber die Architektur verbessert die Ausgangslage.

### Der Bootstrap-Einwand

Ein berechtigter Einwand: KI kann eine bestehende hexagonale Struktur *pflegen*, sicher — aber kann sie eine solche *aufbauen*? Kann sie die schwierigen Entscheidungen über Domänengrenzen treffen?

Teilweise. KI-Skills und System-Prompts können das vollständige hexagonale Regelwerk kodieren: Namenskonventionen, Verzeichnisstruktur, Port/Adapter-Muster, wo Domänengrenzen zu ziehen sind. Ein [praktisches Experiment von Notch](https://wearenotch.com/blog/claude-code-meets-hexagonal-architecture/) zeigte, dass Claude Code korrekten hexagonalen Code generiert, wenn explizite Anweisungen in CLAUDE.md vorhanden sind — aber Belange vermengt, wenn diese fehlen. Mit der richtigen Konfiguration etabliert die KI die Muster selbst.

Der ehrliche Vorbehalt: Das Schreiben dieser Konfiguration erfordert Architekturwissen. Sie müssen hexagonale Architektur gut genug verstehen, um ihre Regeln zu kodieren. Die Einstiegshürde sank von „monatelang Erfahrung aufbauen" auf „den richtigen KI-Skill konfigurieren und die Ausgabe prüfen". Auf null sank sie nicht.

## Wann welche Variante wählen

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/decision-flowchart.svg" alt="Decision flowchart for choosing between convention-first, middle ground, and hexagonal architecture in Laravel" />
  <figcaption>Wann Convention-First, Mittelweg oder hexagonale Architektur die richtige Wahl ist.</figcaption>
</figure>

**Convention-First** bei Projekten mit weniger als etwa 15 Models oder drei Bounded Contexts. Wenn das Team aus ein oder zwei Entwicklern besteht, die die gesamte Codebasis im Kopf haben, fügt hexagonale Architektur Zeremonie hinzu, ohne Klarheit zu bringen. Prototypen, Admin-Panels und CRUD-lastige Apps mit wenig Geschäftslogik gehören hierher.

Dasselbe gilt, wenn die Infrastruktur einfach und stabil ist: Wenn die App mit einer Datenbank und einem Mailer kommuniziert und nichts weiter, erzeugt das Einwickeln hinter Ports Dateien ohne Mehrwert.

**Hexagonal** ab vier oder mehr eigenständigen Geschäftsdomänen, die sich unabhängig voneinander weiterentwickeln. Das Muster zahlt sich in dieser Größenordnung aus — besonders bei mehreren Entwicklern oder KI-Agenten, die parallel über Git-Worktrees arbeiten. Es passt auch, wenn Geschäftslogik komplex genug ist, um Unit-Tests ohne Framework zu rechtfertigen, oder wenn Sie die KI-Agenten-Effizienz maximieren wollen.

**Der Mittelweg** ist real und wird unterschätzt. Sie müssen nicht von Beginn an alles umstrukturieren. Extrahieren Sie eine Domäne — die komplexeste oder am schnellsten wachsende — in eine hexagonale Struktur, während der Rest konventionell bleibt. [Victor Rentea nennt das „Relaxed Hexagonal"](https://victorrentea.ro/blog/overengineering-in-onion-hexagonal-architectures/): das Muster dort anwenden, wo es sich rentiert, und Zeremonie überall sonst weglassen. Laravels [Service Container](https://laravel.com/docs/12.x/container) macht diesen inkrementellen Ansatz natürlich. Interfaces in einem domänenspezifischen Service Provider binden, Implementierungen austauschen, ohne Consumer anzufassen.

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

Der KI-Faktor hat meine persönliche Kalkulation verändert. Früher war der Aufwand für hexagonale Architektur bei einem Solo-Projekt schwer zu rechtfertigen. Heute, mit KI-Agenten bei der Implementierung, zahlen sich die sauberen Interfaces und eingegrenzten Domänen unmittelbar aus: schnellere Code-Generierung, kleine Diffs, schnelle Reviews.

Ehrlicher Vorbehalt: Die erste Domänen-Extraktion dauert einen vollen Tag. Jede weitere Domäne danach etwa eine Stunde. Der ROI hängt davon ab, ob das Projekt lange genug läuft, um diesen ersten Tag zu amortisieren.

## Der Kompromiss, klar benannt

Hexagonale Architektur geht nicht um Reinheit. Es geht darum, eine Codebasis für Menschen und KI-Agenten gleichermaßen navigierbar zu machen. Für Projekte mit echter Domänenkomplexität amortisiert sich die Investition schneller als früher. Für Projekte ohne diese Komplexität ist es Overhead, den Sie nicht brauchen.

Die Schwelle für „lohnt sich" ist gesunken. Verschwunden ist sie nicht.

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

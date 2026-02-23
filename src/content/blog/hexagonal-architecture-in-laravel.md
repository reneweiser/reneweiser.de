---
title: "Hexagonal Architecture in Laravel: Worth It Now"
description: "When hexagonal architecture fits a Laravel project, what to move out of conventions, what to keep, and why AI agents make the investment pay off faster."
date: "2026-02-23"
tags:
  - Laravel
  - Architecture
  - PHP
published: true
readingTime: 8
image: "/blog/hexagonal-architecture-in-laravel/hexagonal-architecture-title.webp"
imageAlt: "Hexagonal Architecture in Laravel"
---

Your Laravel app has 40+ models, features bleed across controllers, and every change touches six files you did not plan on opening. You have heard the hexagonal architecture pitch before: clean domain boundaries, swappable infrastructure, testable business logic. And you have heard [Taylor Otwell's counter](https://www.theregister.com/2025/09/01/laravel_inventor_clever_devs/): stop building "cathedrals of complexity." Both sides have a point.

But there is a variable that did not exist two years ago: AI agents writing your code. That changes the cost-benefit math.

This post is a decision guide, not a tutorial. By the end you should know whether hexagonal architecture fits your Laravel project structure, what the migration actually looks like, and where AI tooling tips the scale.

## Two Ways to Structure a Laravel App

### Convention-First (The Default)

Everything lives where the framework expects it: `app/Models`, `app/Http/Controllers`, `app/Services`. Generators work out of the box. New developers orient themselves in minutes. Packages slot in without friction.

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

The trade-off surfaces as the codebase grows. The directory tree tells you about technical layers (controllers, models, jobs) but nothing about business domains (billing, scheduling, reporting). Adding a new tax rule means grepping across controllers, form requests, observers, and service classes. The technical topology and the business topology diverge.

### Hexagonal Architecture (Ports and Adapters)

Core domain logic lives outside the framework. **Ports** define the interfaces the domain needs (repositories, notifiers, payment gateways). **Adapters** implement those interfaces using Laravel's tools (Eloquent, Mail, Stripe SDK). An application layer orchestrates use cases.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/hexagonal-concept.svg" alt="Hexagonal architecture diagram showing domain core surrounded by port interfaces and infrastructure adapters" />
  <figcaption>Hexagonal architecture: adapters depend on ports, ports depend on domain — never the reverse.</figcaption>
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

Controllers, API resources, middleware, and form requests can all move into domain-specific directories under `app/Domain/` and `app/Infrastructure/`. Laravel does not hard-code their paths. Autoloading and route registration are configurable.

### Models: The One Thing That Fights Back

Models are the component with the most convention friction when moved. Eloquent resolves by FQCN, not file path, so it works mechanically. But you will run into real friction:

```php
// app/Models/Invoice.php — stays here on purpose
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Database\Factories\Billing\InvoiceFactory;

#[UseFactory(InvoiceFactory::class)]
class Invoice extends Model
{
    use HasFactory;
}
```

Since Laravel 11.39, the `#[UseFactory]` attribute points `HasFactory` to the right factory class regardless of namespace. Before 11.39, you would override `newFactory()` instead. Both work.

Beyond factory resolution, you need to register policies manually instead of relying on auto-discovery, call `Relation::enforceMorphMap()` so polymorphic `morphable_type` values stay stable, and accept that `make:model` scaffolding and packages like Nova, Filament, and Spatie Permission default to the `App\Models` namespace. Laravel 12 improved nested policy discovery within `App\Models\*`, but models outside that namespace still need manual registration. None of these are blockers, but they add up.

The pragmatic choice: keep models in `app/Models/` and wrap access behind repository interfaces defined in your domain layer. This is a trade-off, not a rule. Some teams have moved models successfully, and their reasons are valid. But for most projects, the convention friction is not worth the purity.

## Hexagonal vs. Convention: The Practical Comparison

| Criterion | Convention-first | Hexagonal |
|-----------|-----------------|-----------|
| **Onboarding time** | Low — familiar structure | Medium — must learn domain map |
| **Feature velocity (new domain)** | Low early, grows with codebase | Consistent — scoped to one domain |
| **Testability of business logic** | Coupled to framework | Unit-testable with mocked ports |
| **AI agent efficiency** | Higher token cost — scattered changes | Lower token cost — scoped context |
| **Package compatibility** | Full | Occasional friction (model location) |

On **testability**: when your use case depends on interfaces instead of concrete Eloquent queries, you can test domain logic without booting the framework.

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

This test runs in milliseconds. No database, no HTTP kernel, no service container. You test the domain logic in isolation.

On **feature velocity**: adding a new tax rule in a 40-model monolith means hunting through controllers, form requests, and observers scattered across `app/`. In a hexagonal Billing domain, the tax rule lives in `app/Domain/Billing/` with one use case and one port. You touch two files, not six.

## Why AI Shifted the Equation

Here is the argument most hexagonal-architecture posts do not make yet: AI agents perform better when the architecture constrains them. Fewer files touched, smaller context windows, more predictable output.

Consider invoice PDF generation. In the conventional structure, an AI agent editing this feature needs context from `InvoiceController`, `InvoiceService`, `InvoiceObserver`, `InvoiceMailable`, the Blade template, and the route file. Six files across four directories. In the hexagonal structure, the agent needs `GenerateInvoicePdf` (the use case) and `DompdfGenerator` (the adapter). Two files in the same domain. The context window stays small. Token cost drops. Accuracy goes up.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/blast-radius-comparison.svg" alt="Blast radius comparison — conventional structure touches 6 scattered files, hexagonal touches 2 files in one domain" />
  <figcaption>Blast radius per feature change: convention-first touches 6 files across 4 directories; hexagonal touches 2 files in 1 domain.</figcaption>
</figure>

This is about fewer files *touched per change*, not fewer files total. A hexagonal codebase has more files overall because of interfaces, adapters, and DTOs. But the blast radius per feature change shrinks. When you tell an AI agent "implement use case X in the Billing domain, respecting the port interfaces," the instruction is scoped and verifiable:

```text
Implement the ApplyLateFee use case in app/Domain/Billing/UseCases/.
Use the InvoiceRepositoryInterface port — do not query Eloquent directly.
Follow the existing GenerateInvoicePdf use case as a structural reference.
```

The agent does not wander across the codebase. The interfaces act as guardrails.

As [Muthu argues in "The Architecture is the Prompt"](https://notes.muthu.co/2025/11/the-architecture-is-the-prompt-guiding-ai-with-hexagonal-design/), structural enforcement beats prompt engineering for guiding AI. PHP's type system becomes your constraint layer. The AI physically cannot violate architectural boundaries when ports and adapters are the only way in and out of the domain.

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/parallel-agents-worktrees.svg" alt="Three AI agents working in parallel git worktrees, each scoped to a separate domain directory, merging into main" />
  <figcaption>Domain boundaries scope each agent's worktree to distinct files, reducing merge conflicts.</figcaption>
</figure>

Teams are already running multiple AI agents concurrently using git worktrees. [incident.io runs 4-5 concurrent Claude Code sessions daily](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees) as part of their standard workflow. The bottleneck is merge conflicts: agents working in separate worktrees do not see each other's changes until branches merge. Domain boundaries reduce the frequency of those conflicts by scoping each agent's changes to distinct files.

An agent working on Billing touches `app/Domain/Billing/` and `app/Infrastructure/Billing/`. An agent working on Scheduling touches its own directories. The overlap shrinks. As [Addy Osmani observes](https://addyosmani.com/blog/coding-agents-manager/), LLMs perform worse as context expands, and hexagonal domains keep each agent's context small and its output predictable. This does not eliminate conflicts entirely (tools like [Clash](https://clash.sh/) exist specifically because worktrees make conflicts invisible between branches), but the architecture tilts the odds.

### The Bootstrap Objection

A reasonable pushback: AI can *maintain* an existing hexagonal structure, sure, but can it *bootstrap* one? Can it make the hard domain boundary decisions?

Partly. AI skills and system prompts can encode the full hexagonal playbook: naming conventions, directory structure, port/adapter patterns, where to draw domain boundaries. A [practical experiment by Notch](https://wearenotch.com/blog/claude-code-meets-hexagonal-architecture/) showed that Claude Code generates correct hexagonal code with explicit guidance in CLAUDE.md, but tangles concerns without it. With the right skill configuration, the AI establishes the patterns itself.

The honest caveat: writing that skill configuration requires architectural knowledge. You need to understand hexagonal architecture well enough to encode its rules. The barrier to adoption dropped from "spend months building the muscle memory" to "configure the right AI skill and review the output." But it did not drop to zero.

## When to Choose Each

<figure>
  <img src="/blog/hexagonal-architecture-in-laravel/decision-flowchart.svg" alt="Decision flowchart for choosing between convention-first, middle ground, and hexagonal architecture in Laravel" />
  <figcaption>When to choose convention-first, middle ground, or hexagonal architecture.</figcaption>
</figure>

**Stay convention-first** for projects under roughly 15 models or three bounded contexts. If the team is one or two developers who hold the full codebase in their heads, hexagonal architecture adds ceremony without adding clarity. Prototypes, admin panels, and CRUD-heavy apps with little business logic belong here.

The same applies when your infrastructure is simple and stable: if the app talks to a database and a mailer and nothing else, wrapping those behind ports adds files without adding value.

**Move to hexagonal** when the codebase has four or more distinct business domains that change independently. The pattern earns its keep at that scale, especially with multiple developers or AI agents working in parallel via git worktrees. Domain boundaries scope each agent's changes and reduce merge conflicts. It also fits when business logic is complex enough to warrant unit-testing without the framework, or when you want to maximize AI agent efficiency.

**The middle ground** is real and underrated. You do not have to go all-in on day one. Extract one domain, the most complex or fastest-changing one, into a hexagonal structure while keeping the rest conventional. [Victor Rentea calls this "relaxed hexagonal"](https://victorrentea.ro/blog/overengineering-in-onion-hexagonal-architectures/): apply the pattern where it earns its keep, skip the ceremony everywhere else. Laravel's [service container](https://laravel.com/docs/12.x/container) makes this incremental approach natural. Bind interfaces in a domain-specific service provider, swap implementations without touching consumers.

<!-- internal link: service classes vs actions post (pipeline/2-outline/260331) — insert once published -->
<!-- internal link: laravel service container post (pipeline/2-outline/260512) — insert once published -->

## What I Actually Use and Why

Convention-first for most freelance client projects. Onboarding cost matters when a client's next developer needs to pick up the codebase without a walkthrough. Hexagonal for domains with real complexity in longer-running products.

The practical setup: models stay in `app/Models/`. Domain logic moves into `app/Domain/{Name}/` with `Entities`, `ValueObjects`, `Ports`, `Exceptions`, and `UseCases` subdirectories. Infrastructure (Eloquent repos, HTTP controllers, third-party adapters) lives in `app/Infrastructure/{Name}/`, separate from the domain directories.

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

Routes register controllers from `app/Infrastructure/`:

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

The AI angle changed the math for me personally. Before, the upfront cost of hexagonal architecture was hard to justify on a solo project. Now, with AI agents doing the implementation, the clean interfaces and scoped domains pay back immediately in faster code generation. The agent stays within the domain boundary, the diffs are small, and the review is fast.

Honest caveat: the first domain extraction takes a full day of restructuring. After that, each new domain takes about an hour. The ROI depends on whether the project lives long enough to amortize that first day.

## The Trade-Off, Plainly

Hexagonal architecture is not about purity. It is about making a codebase navigable by humans and AI agents alike. For projects with real domain complexity, the investment pays off faster than it used to. For projects without that complexity, it is overhead you do not need.

The threshold for "worth it" has lowered. It has not disappeared.

<!-- internal link: service classes vs actions post (pipeline/2-outline/260331) — insert once published -->

---

**Further reading:**

- [Bardia Khosravi, "Backend Coding Rules for AI Coding Agents"](https://medium.com/@bardia.khosravi/backend-coding-rules-for-ai-coding-agents-ddd-and-hexagonal-architecture-ecafe91c753f)
- [vFunction, "The Rise of Vibe Coding: Why Architecture Still Matters"](https://vfunction.com/blog/vibe-coding-architecture-ai-agents/)
- [Martin Joo, "DDD with Laravel"](https://martinjoo.dev/domain-driven-design-with-laravel-domains-and-applications)
- [Loris Leiva, "Conciliating Laravel and DDD"](https://lorisleiva.com/conciliating-laravel-and-ddd)
- [Metacircuits, "AI Coding Agents: Architecture Matters"](https://metacircuits.substack.com/) — 14,000 lines across 62 files in one hour with an architecture-first approach
- [Nick Mitchinson, "Worktrees for Parallel AI Development"](https://nickmitchinson.com/worktrees-parallel-ai/)

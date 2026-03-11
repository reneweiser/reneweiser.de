---
title: "Eloquent Eager Loading: Fix N+1 Queries in Laravel"
description: "Identify and fix N+1 query problems in Laravel with eager loading. Includes Debugbar analysis, with/withCount strategies, and before-after benchmarks."
date: "2026-02-27"
slug: eloquent-eager-loading-n-plus-one
tags:
  - Laravel
  - Performance
  - Database
published: true
readingTime: 7
image: "/blog/eloquent-eager-loading-n-plus-one/title.webp"
imageAlt: "Split cartoon scene contrasting N+1 query chaos with eager loading calm"
---

<script>
  import FurtherReading from '$lib/components/blog/FurtherReading.svelte';
</script>

Your project dashboard loads in 800 ms. You open Laravel Debugbar and the Queries tab shows 51 queries for a list of 50 clients — one query to fetch the clients, then one per client to load their invoices. That is the N+1 query problem. It is the most common performance bottleneck in Eloquent applications, and eager loading fixes it with a single method call that cuts query count by 95% or more.

This post uses a realistic client-and-invoices dashboard to walk through identifying N+1 queries, fixing them with four eager loading strategies plus Laravel 12.8's automatic eager loading, and measuring the results with Debugbar.

## The Example App

The example runs on **Laravel 12**, **MySQL 8.4**, and **[Laravel Debugbar](https://github.com/barryvdh/laravel-debugbar)**. If Debugbar is not installed yet: `composer require barryvdh/laravel-debugbar --dev`.

The data model: a `Client` has many `Invoice` records, and each `Invoice` belongs to a `Client` and a `Status`. The dashboard view lists every client with their invoice count and the most recent invoice amount, a common pattern in project management and billing applications. The database is seeded with 50 clients and roughly 500 invoices, spread unevenly across clients, which makes query counts obvious in Debugbar.

```php
// app/Models/Client.php
class Client extends Model
{
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}

// app/Models/Invoice.php
class Invoice extends Model
{
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }
}
```

## Spotting the N+1 Problem

### What the N+1 Pattern Looks Like

A naive controller fetches all clients and passes them to a Blade view:

```php
// app/Http/Controllers/ClientController.php
public function index()
{
    $clients = Client::all();

    return view('clients.index', compact('clients'));
}
```

The view loops through clients and accesses the invoices relationship on each iteration:

```blade
@foreach ($clients as $client)
    <tr>
        <td>{{ $client->name }}</td>
        <td>{{ $client->invoices->count() }}</td>
        <td>{{ $client->invoices->last()?->amount }}</td>
    </tr>
@endforeach
```

Eloquent loads relationships lazily by default. When a model is retrieved without specifying relations to load, those relations are left empty. The first time code accesses `$client->invoices`, Eloquent intercepts the property access and runs a query to fetch the related invoices for that specific client: `SELECT * FROM invoices WHERE client_id = ?`.

This works fine for a single model. The problem appears in loops. With 50 clients, Eloquent executes 50 separate queries (one per client) to load their invoices. Add the initial `SELECT * FROM clients` query, and the total is 51. That is the "N+1" pattern: 1 query for the parent records, plus N queries for their relationships.

### Reading the Debugbar Output

Open the Queries tab in Debugbar. The count reads 51. Scroll through the list and the pattern jumps out: the same `select * from invoices where invoices.client_id = ?` query repeats 50 times with a different bound parameter each time. Debugbar's duplicate query indicator flags them all.

Beyond the raw query count, look at the time column. Individual queries may be fast (0.5 ms each), but they add up. 50 queries at 0.5 ms is 25 ms of query time alone. On a production server with 2–5 ms of network latency per round-trip to the database, those 50 queries become 100–250 ms just in network overhead. That is where N+1 becomes a measurable performance problem.

Debugbar's timeline tab visualizes this: a wall of thin bars representing individual queries, each one a separate round-trip to the database.

<figure>
  <img src="/blog/eloquent-eager-loading-n-plus-one/n-plus-one-vs-eager-loading.svg" alt="Timeline comparison showing 51 serial queries with lazy loading versus 2 batch queries with eager loading" />
  <figcaption>Lazy loading fires 51 serial queries; eager loading batches them into 2.</figcaption>
</figure>

Laravel provides a built-in safety net. Add this to `AppServiceProvider` to throw an exception whenever a relationship is lazy-loaded during development:

```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    Model::preventLazyLoading(! app()->isProduction());
}
```

This catches N+1 problems before they reach production. Nuno Maduro's [`essentials`](https://github.com/nunomaduro/essentials) package takes this further. It calls `Model::shouldBeStrict()` by default, which enables `preventLazyLoading` alongside `preventSilentlyDiscardingAttributes` and `preventAccessingMissingAttributes`. One `composer require` and you get stricter Eloquent defaults out of the box.

<!-- internal link: laravel debugbar / performance tooling post -->

## Fixing It with Eager Loading

### `with()` — Load Relations Up Front

Replace `Client::all()` with an eager-loaded query:

```php
$clients = Client::with('invoices')->get();
```

Eloquent now runs two queries instead of 51:

```sql
SELECT * FROM clients;
SELECT * FROM invoices WHERE client_id IN (1, 2, 3, ...50);
```

The first query fetches all clients. Eloquent then collects every client ID and runs a single second query with a `WHERE IN` clause to fetch all invoices belonging to any of those clients. It maps each invoice back to its parent model and populates the relationship collection in memory. This is called "eager loading" because the relations are fetched eagerly, at query time, rather than lazily on first access. No changes needed in the Blade view. `$client->invoices` is already loaded when the loop accesses it.

### `withCount()` — When You Only Need the Number

If the view only displays the invoice count and never touches the actual invoice records, skip loading the full models:

```php
$clients = Client::withCount('invoices')->get();
// Access via: $client->invoices_count
```

`withCount` adds an `invoices_count` attribute to each model using a subselect: one query total, no related models in memory. This is the most efficient option when you need the number but not the data itself. You can also combine strategies: `Client::with('invoices')->withCount('invoices')` loads both the full relation and the count attribute, useful when the view needs the collection for display and a pre-computed count for sorting.

### Nested Eager Loading

For deeper relationships, dot notation chains the eager loads. To load each invoice's status alongside the invoices themselves, useful when the view displays a status badge on each row:

```php
$clients = Client::with(['invoices.status'])->get();
```

You can also constrain the eager load with a closure:

```php
$clients = Client::with(['invoices' => fn ($q) => $q->latest()->limit(5)])->get();
```

One gotcha: `limit()` inside a constrained eager load applies to the entire query, not per parent. This query returns the five most recent invoices across all clients, not five per client. For one latest record per parent, use `latestOfMany` or `oldestOfMany`. Limiting to N records per parent requires a subquery or application-level grouping.

<figure>
  <img src="/blog/eloquent-eager-loading-n-plus-one/constrained-eager-load-limit-gotcha.svg" alt="Comparison showing limit in constrained eager loading returns 5 invoices total instead of 5 per client" />
  <figcaption>limit() inside a constrained eager load caps the entire query, not each parent.</figcaption>
</figure>

<!-- internal link: eloquent scopes post -->

### Lazy Eager Loading with `load()`

When the collection is already retrieved (from a cache, a service method, or an earlier processing step), you can batch-load a relation after the fact:

```php
$clients->load('invoices');
```

This triggers the same batch query as `with()`. The difference is timing: `load()` runs after retrieval, `with()` runs during the initial query. Prefer `with()` when you control the query from the start. Use `load()` when you receive a collection you did not build yourself. A common real-world case: a service method returns a collection of clients, and the calling controller discovers it needs invoices for display. Rather than refactoring the service, `$clients->load('invoices')` solves the immediate problem.

### Automatic Eager Loading — Laravel 12.8+

Laravel 12.8 introduced automatic relationship eager loading. When a relation is accessed on a model that belongs to a collection, Laravel calls `loadMissing()` on the entire collection, producing the same batch query as `with()` but triggered on access rather than declared up front. Every model in the collection gets its relation populated in one round-trip. Subsequent accesses on other models in the loop find the relation already loaded and skip the query entirely.

Two practical ways to enable it:

```php
// Per collection — opt in where needed
$clients = Client::all()->withRelationshipAutoloading();

// Global — enable for all models
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    Model::automaticallyEagerLoadRelationships();
}
```

There is also a per-model-instance method (`$model->withRelationshipAutoloading()`), but the collection and global approaches are the practical choices for solving N+1 across the board.

The `essentials` package mentioned earlier also enables automatic eager loading globally. When both features are active, auto-loading satisfies the relation on first access — before `preventLazyLoading` gets a chance to throw. Strict mode catches lazy loads on standalone models outside a collection, while auto-loading handles the common case of iterating over collections.

The feature [shipped in Laravel 12.8](https://github.com/laravel/framework/releases/tag/v12.8.0) and received fixes through 12.9+ for edge cases around serialization with queued models and global-mode behavior. Stay on the latest 12.x patch. The [Laravel documentation on lazy eager loading](https://laravel.com/docs/12.x/eloquent-relationships#lazy-eager-loading) covers the current API.

When to prefer auto-loading over explicit `with()`: it works best when you do not control data fetching tightly — API resources, Blade components receiving collections from multiple sources, or iterative development where relation usage shifts frequently. For code you own end to end, explicit `with()` remains clearer about intent and makes query behavior visible at the call site.

<!-- internal link: DTOs / data structuring post -->

## Before and After: Eager Loading Benchmarks

The table below compares the four approaches on the example dataset of 50 clients with roughly 500 invoices. All measurements were taken locally with Debugbar. Your absolute numbers will differ, but the ratios hold.

| Metric | Before (lazy) | After (`with`) | After (`withCount`) | After (auto) |
|--------|---------------|-----------------|---------------------|--------------|
| Queries | 51 | 2 | 1 | 2 |
| Query time | ~38 ms | ~4 ms | ~2 ms | ~4 ms |
| Memory | ~6 MB | ~5.8 MB | ~4.2 MB | ~5.8 MB |

Note that memory barely changes between lazy and eager loading. Both approaches load the same invoice models into memory. The difference is how many database round-trips it takes to get them there. The `withCount` strategy is the outlier: it returns only the count via a subselect and avoids hydrating invoice models entirely, which is why memory drops to 4.2 MB.

The automatic eager loading column matches `with()` exactly: same mechanism, same query count. The difference is ergonomics, not speed.

<figure>
  <img src="/blog/eloquent-eager-loading-n-plus-one/eager-loading-strategy-decision.svg" alt="Flowchart for choosing between with, withCount, load, and automatic eager loading strategies" />
  <figcaption>Decision flowchart: pick the right eager loading strategy for your use case.</figcaption>
</figure>

As the dataset scales (500 clients, 5,000 invoices), the lazy approach grows to 501 queries while eager loading stays at two. Debugbar's timeline view makes this comparison trivial to verify during development.

## Eager Loading Trade-offs

- **Over-eager loading:** loading every relation "just in case" wastes memory and query time. Only eager load what the current view actually uses.
- **Huge relations:** if a client has 10,000 invoices, eager loading all of them into memory creates its own performance problem: high memory usage and a slow `WHERE IN` query. Paginate the relationship at the database level, use `withCount` for totals, or aggregate with `withSum` and `withAvg` when you need numbers rather than records.
- **API resources and JSON:** when using `JsonResource`, declaring `$with` on the model runs the eager load on every query involving that model. Prefer explicit `with()` in the controller or request handler to keep control over what gets loaded.
- **`preventLazyLoading` in production:** this post enables it in development only. In production, it throws `LazyLoadingViolationException`, which crashes requests. That is useful during development but too risky for real users. Use `handleLazyLoadingViolationUsing()` to log violations instead:

```php
// Log lazy-loading violations instead of throwing in production
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    logger()->warning("Lazy loading {$relation} on {$model::class}");
});
```

- **Automatic eager loading and intent:** auto-loading solves N+1 passively, but it can mask which relations a controller actually needs. If code accidentally accesses a relation, the query fires silently. `with()` remains the better choice when data requirements are known at query time.

---

Eager loading is the single highest-impact query optimization in Eloquent. Enable `preventLazyLoading` in development, check Debugbar after every feature, and default to `with()` whenever you access a relation in a loop. For projects on Laravel 12.8+, automatic eager loading adds a safety net that catches the N+1 queries you miss. Consider enabling it globally or through the [`essentials`](https://github.com/nunomaduro/essentials) package.

The strategy is straightforward: use `with()` when you know which relations the view needs, `withCount()` when you only need numbers, and let automatic eager loading cover the gaps.

<!-- internal link: laravel query optimization patterns post -->

<FurtherReading
  posts={[
    { slug: "hexagonal-architecture-in-laravel", description: "How to structure a Laravel app so eager loading decisions stay in the infrastructure layer." },
    { slug: "deploy-laravel-coolify", description: "Once your queries are fast, deploy the whole thing to a $5 VPS." }
  ]}
/>

---
title: "Warum deine Web-App langsam lädt — und was es dich kostet"
description: "Das N+1-Query-Problem kostet dich Conversions. Hier siehst du, wie du es in Laravel mit Eager Loading in Minuten behebst — mit echten Benchmarks."
date: "2026-02-27"
slug: eloquent-eager-loading-n-plus-one
tags:
  - Laravel
  - Performance
  - Database
published: true
readingTime: 7
image: "/blog/eloquent-eager-loading-n-plus-one/title.webp"
imageAlt: "Geteilte Cartoon-Szene: N+1-Query-Chaos auf der einen Seite, ruhiges Eager Loading auf der anderen"
---

<script>
  import FurtherReading from '$lib/components/blog/FurtherReading.svelte';
</script>

Dein Projekt-Dashboard lädt in 800 ms. Du öffnest Laravel Debugbar, schaust in den Queries-Tab — und siehst 51 Datenbankabfragen für eine Liste von 50 Kunden. Eine Query für die Kunden, dann eine pro Kunde für deren Rechnungen. Das ist das N+1-Query-Problem. Es ist der häufigste Performance-Engpass in Eloquent-Anwendungen, und er ist teurer als er aussieht.

Google misst, dass [jede zusätzliche Sekunde Ladezeit die Conversion-Rate um 7 % senkt](https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/). Eine App, die 3 Sekunden statt 0,5 Sekunden braucht, verliert messbar Nutzer — bevor sie auch nur eine einzige Zeile Content gesehen haben. Eager Loading behebt dieses Problem mit einem einzigen Methodenaufruf und reduziert die Query-Anzahl um 95 % oder mehr.

Dieser Beitrag verwendet ein realistisches Kunden-und-Rechnungen-Dashboard, um N+1-Queries zu identifizieren, mit vier Eager-Loading-Strategien plus Laravels automatischem Eager Loading (seit 12.8) zu beheben und die Ergebnisse mit Debugbar zu messen.

## Die Beispiel-App

Das Beispiel läuft auf **Laravel 12**, **MySQL 8.4** und **[Laravel Debugbar](https://github.com/barryvdh/laravel-debugbar)**. Falls Debugbar noch nicht installiert ist: `composer require barryvdh/laravel-debugbar --dev`.

Das Datenmodell: Ein `Client` hat viele `Invoice`-Datensätze, jede `Invoice` gehört zu einem `Client` und einem `Status`. Die Dashboard-Ansicht listet alle Kunden mit ihrer Rechnungsanzahl und dem letzten Rechnungsbetrag — ein klassisches Muster in Projektmanagement- und Billing-Anwendungen. Die Datenbank enthält 50 Kunden und rund 500 Rechnungen, ungleichmäßig verteilt, damit Query-Zahlen in Debugbar sofort auffallen.

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

## Das N+1-Problem erkennen

### Wie das N+1-Muster entsteht

Ein naiver Controller lädt alle Kunden und gibt sie an eine Blade-View weiter:

```php
// app/Http/Controllers/ClientController.php
public function index()
{
    $clients = Client::all();

    return view('clients.index', compact('clients'));
}
```

Die View iteriert über die Kunden und greift in jedem Durchlauf auf die `invoices`-Relation zu:

```blade
@foreach ($clients as $client)
    <tr>
        <td>{{ $client->name }}</td>
        <td>{{ $client->invoices->count() }}</td>
        <td>{{ $client->invoices->last()?->amount }}</td>
    </tr>
@endforeach
```

Eloquent lädt Relationen standardmäßig lazy. Wenn ein Model ohne explizit angegebene Relationen abgerufen wird, bleiben diese leer. Beim ersten Zugriff auf `$client->invoices` fängt Eloquent den Property-Zugriff ab und führt eine Query aus, um die zugehörigen Rechnungen dieses Kunden zu laden: `SELECT * FROM invoices WHERE client_id = ?`.

Für ein einzelnes Model kein Problem. In Schleifen wird daraus ein teures Muster. Mit 50 Kunden führt Eloquent 50 separate Queries aus — eine pro Kunde. Dazu kommt der initiale `SELECT * FROM clients`. Gesamtsumme: 51 Queries. Das ist das „N+1"-Muster: 1 Query für die übergeordneten Datensätze, plus N Queries für deren Relationen.

### Den Debugbar-Output lesen

Öffne den Queries-Tab in Debugbar. Der Zähler zeigt 51. Scrolle durch die Liste, und das Muster springt sofort ins Auge: dieselbe Query `select * from invoices where invoices.client_id = ?` wiederholt sich 50 Mal mit jeweils einem anderen gebundenen Parameter. Debugbars Duplikat-Indikator markiert sie alle.

Über die reine Query-Anzahl hinaus: Schau auf die Zeitspalte. Einzelne Queries können schnell sein (0,5 ms), aber sie addieren sich. 50 Queries à 0,5 ms sind 25 ms reine Query-Zeit. Auf einem Produktionsserver mit 2–5 ms Netzwerklatenz pro Round-Trip zur Datenbank werden aus diesen 50 Queries 100–250 ms allein durch Netzwerk-Overhead. Genau hier wird N+1 zu einem messbaren Performance-Problem — und zu einem Business-Problem.

Debugbars Timeline-Tab visualisiert das: eine Wand dünner Balken, jeder ein separater Round-Trip zur Datenbank. Für Nutzer sieht das aus wie eine App, die „einfach langsam ist".

<figure>
  <img src="/blog/eloquent-eager-loading-n-plus-one/n-plus-one-vs-eager-loading.svg" alt="Timeline-Vergleich: 51 serielle Queries beim Lazy Loading versus 2 Batch-Queries beim Eager Loading" />
  <figcaption>Lazy Loading feuert 51 serielle Queries; Eager Loading bündelt sie in 2.</figcaption>
</figure>

Laravel bietet ein eingebautes Sicherheitsnetz. Diesen Code in `AppServiceProvider` einfügen, um während der Entwicklung eine Exception zu werfen, sobald eine Relation lazy geladen wird:

```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    Model::preventLazyLoading(! app()->isProduction());
}
```

Das fängt N+1-Probleme, bevor sie Produktion erreichen. Nuno Maduros [`essentials`](https://github.com/nunomaduro/essentials)-Paket geht weiter: Es ruft `Model::shouldBeStrict()` standardmäßig auf, was `preventLazyLoading` zusammen mit `preventSilentlyDiscardingAttributes` und `preventAccessingMissingAttributes` aktiviert. Ein `composer require` — und du bekommst strengere Eloquent-Defaults out of the box.

<!-- internal link: laravel debugbar / performance tooling post -->

## Das Problem mit Eager Loading beheben

### `with()` — Relationen von Anfang an laden

Ersetze `Client::all()` durch eine Eager-loaded Query:

```php
$clients = Client::with('invoices')->get();
```

Eloquent führt jetzt zwei Queries statt 51 aus:

```sql
SELECT * FROM clients;
SELECT * FROM invoices WHERE client_id IN (1, 2, 3, ...50);
```

Die erste Query lädt alle Kunden. Eloquent sammelt dann alle Client-IDs und führt eine einzige zweite Query mit einer `WHERE IN`-Klausel aus, um alle Rechnungen dieser Kunden zu laden. Jede Rechnung wird ihrem übergeordneten Model zugeordnet, und die Relation wird im Speicher befüllt. Das nennt sich „Eager Loading": Relationen werden eifrig, zur Query-Zeit, statt lazy beim ersten Zugriff geladen. Die Blade-View braucht keine Änderungen. `$client->invoices` ist bereits geladen, wenn die Schleife darauf zugreift.

### `withCount()` — Wenn nur die Anzahl zählt

Zeigt die View nur die Rechnungsanzahl und greift nie auf die tatsächlichen Rechnungsdatensätze zu, lade die vollen Models gar nicht erst:

```php
$clients = Client::withCount('invoices')->get();
// Zugriff über: $client->invoices_count
```

`withCount` fügt jedem Model ein `invoices_count`-Attribut über ein Subselect hinzu: eine Query insgesamt, keine verwandten Models im Speicher. Das ist die effizienteste Option, wenn du die Zahl, aber nicht die Daten brauchst. Strategien lassen sich auch kombinieren: `Client::with('invoices')->withCount('invoices')` lädt sowohl die vollständige Relation als auch das Count-Attribut — nützlich, wenn die View die Collection für die Anzeige und einen vorberechneten Zähler fürs Sortieren braucht.

### Verschachteltes Eager Loading

Für tiefere Relationen verknüpft Dot-Notation die Eager Loads. Um den Status jeder Rechnung mitzuladen — nützlich, wenn die View ein Status-Badge in jeder Zeile anzeigt:

```php
$clients = Client::with(['invoices.status'])->get();
```

Der Eager Load lässt sich auch mit einem Closure einschränken:

```php
$clients = Client::with(['invoices' => fn ($q) => $q->latest()->limit(5)])->get();
```

Ein wichtiger Fallstrick: `limit()` innerhalb eines eingeschränkten Eager Loads gilt für die gesamte Query, nicht pro Parent. Diese Query gibt die fünf neuesten Rechnungen über alle Kunden hinweg zurück — nicht fünf pro Kunde. Für einen neuesten Datensatz pro Parent `latestOfMany` oder `oldestOfMany` verwenden. N Datensätze pro Parent erfordern ein Subquery oder gruppierende Logik auf Anwendungsebene.

<figure>
  <img src="/blog/eloquent-eager-loading-n-plus-one/constrained-eager-load-limit-gotcha.svg" alt="Vergleich zeigt: limit() im eingeschränkten Eager Load gibt 5 Rechnungen insgesamt zurück, nicht 5 pro Kunde" />
  <figcaption>limit() innerhalb eines eingeschränkten Eager Loads begrenzt die gesamte Query, nicht jeden Parent.</figcaption>
</figure>

<!-- internal link: eloquent scopes post -->

### Lazy Eager Loading mit `load()`

Wenn die Collection bereits abgerufen wurde — aus einem Cache, einer Service-Methode oder einem früheren Verarbeitungsschritt — kann eine Relation nachträglich batch-geladen werden:

```php
$clients->load('invoices');
```

Das löst dieselbe Batch-Query wie `with()` aus. Der Unterschied liegt im Timing: `load()` läuft nach dem Abruf, `with()` während der initialen Query. Bevorzuge `with()`, wenn du die Query von Anfang an kontrollierst. Verwende `load()`, wenn du eine Collection erhältst, die du nicht selbst gebaut hast. Ein häufiger Praxisfall: Eine Service-Methode gibt eine Kunden-Collection zurück, und der aufrufende Controller stellt fest, dass er Rechnungen für die Anzeige braucht. Statt den Service umzubauen, löst `$clients->load('invoices')` das unmittelbare Problem.

### Automatisches Eager Loading — ab Laravel 12.8

Laravel 12.8 hat automatisches Eager Loading für Relationen eingeführt. Wenn auf einem Model, das zu einer Collection gehört, eine Relation zugegriffen wird, ruft Laravel `loadMissing()` auf der gesamten Collection auf — das erzeugt dieselbe Batch-Query wie `with()`, aber ausgelöst beim Zugriff statt vorab deklariert. Jedes Model in der Collection bekommt seine Relation in einem einzigen Round-Trip befüllt. Nachfolgende Zugriffe auf andere Models in der Schleife finden die Relation bereits geladen und überspringen die Query.

Zwei praktische Wege, das zu aktivieren:

```php
// Pro Collection — dort aktivieren, wo nötig
$clients = Client::all()->withRelationshipAutoloading();

// Global — für alle Models aktivieren
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    Model::automaticallyEagerLoadRelationships();
}
```

Es gibt auch eine Methode pro Model-Instanz (`$model->withRelationshipAutoloading()`), aber der Collection- und der globale Ansatz sind die praktischen Optionen, um N+1 flächendeckend zu lösen.

Das erwähnte `essentials`-Paket aktiviert automatisches Eager Loading ebenfalls global. Wenn beide Features aktiv sind, befriedigt Auto-Loading die Relation beim ersten Zugriff — bevor `preventLazyLoading` eine Exception werfen kann. Der Strict-Modus fängt Lazy Loads auf eigenständigen Models außerhalb einer Collection; Auto-Loading übernimmt den häufigen Fall des Iterierens über Collections.

Das Feature [erschien in Laravel 12.8](https://github.com/laravel/framework/releases/tag/v12.8.0) und erhielt Fixes in 12.9+ für Edge Cases rund um Serialisierung bei Queue-Models und globales Verhalten. Immer auf dem aktuellen 12.x-Patch bleiben. Die [Laravel-Dokumentation zum Lazy Eager Loading](https://laravel.com/docs/12.x/eloquent-relationships#lazy-eager-loading) beschreibt die aktuelle API.

Wann Auto-Loading gegenüber explizitem `with()` bevorzugen: Es funktioniert am besten, wenn der Datenabruf nicht eng kontrolliert wird — API-Resources, Blade-Komponenten, die Collections aus mehreren Quellen erhalten, oder iterative Entwicklung, bei der sich der Relationsgebrauch häufig ändert. Für Code, den man vollständig kontrolliert, bleibt explizites `with()` klarer in der Absicht und macht das Query-Verhalten an der Aufrufstelle sichtbar.

<!-- internal link: DTOs / data structuring post -->

## Vorher und nachher: Eager-Loading-Benchmarks

Die Tabelle unten vergleicht die vier Ansätze auf dem Beispieldatensatz mit 50 Kunden und rund 500 Rechnungen. Alle Messungen wurden lokal mit Debugbar durchgeführt. Absolute Zahlen werden abweichen; die Verhältnisse bleiben gleich.

| Kennzahl | Vorher (lazy) | Nachher (`with`) | Nachher (`withCount`) | Nachher (auto) |
|----------|---------------|------------------|-----------------------|----------------|
| Queries | 51 | 2 | 1 | 2 |
| Query-Zeit | ~38 ms | ~4 ms | ~2 ms | ~4 ms |
| Speicher | ~6 MB | ~5,8 MB | ~4,2 MB | ~5,8 MB |

Der Speicherbedarf ändert sich zwischen Lazy und Eager Loading kaum. Beide Ansätze laden dieselben Invoice-Models in den Speicher. Der Unterschied liegt in der Anzahl der Datenbank-Round-Trips. Die `withCount`-Strategie ist der Ausreißer: Sie gibt nur die Anzahl über ein Subselect zurück und vermeidet das Hydrisieren von Invoice-Models vollständig — daher der Rückgang auf 4,2 MB.

Die Spalte „automatisches Eager Loading" entspricht `with()` exakt: gleicher Mechanismus, gleiche Query-Anzahl. Der Unterschied liegt in der Ergonomie, nicht in der Geschwindigkeit.

<figure>
  <img src="/blog/eloquent-eager-loading-n-plus-one/eager-loading-strategy-decision.svg" alt="Entscheidungsflussdiagramm zur Wahl zwischen with, withCount, load und automatischem Eager Loading" />
  <figcaption>Entscheidungsflussdiagramm: die richtige Eager-Loading-Strategie für den eigenen Anwendungsfall wählen.</figcaption>
</figure>

Wenn der Datensatz wächst (500 Kunden, 5.000 Rechnungen), steigt die Lazy-Variante auf 501 Queries, während Eager Loading bei zwei bleibt. Debugbars Timeline-Ansicht macht diesen Vergleich während der Entwicklung trivial nachvollziehbar.

Zur Einordnung der Business-Relevanz: Auf einem Produktionsserver mit typischen Datenbanklatenzzeiten bedeuten 50 zusätzliche Queries leicht 200–500 ms extra Ladezeit pro Request. Das ist der Unterschied zwischen einer App, die sich schnell anfühlt, und einer, die sich träge anfühlt — und der direkte Weg zu einem messbaren Conversion-Verlust.

## Trade-offs beim Eager Loading

- **Over-eager Loading:** Jede Relation „auf Vorrat" zu laden verschwendet Speicher und Query-Zeit. Nur eager loaden, was die aktuelle View tatsächlich braucht.
- **Große Relationen:** Hat ein Kunde 10.000 Rechnungen, erzeugt Eager Loading seiner eigenes Performance-Problem: hoher Speicherbedarf und eine langsame `WHERE IN`-Query. Die Relation auf Datenbankebene paginieren, `withCount` für Summen verwenden oder mit `withSum` und `withAvg` aggregieren, wenn Zahlen statt Datensätze gebraucht werden.
- **API-Resources und JSON:** Bei Verwendung von `JsonResource` führt die Deklaration von `$with` im Model den Eager Load bei jeder Query mit diesem Model aus. Explizites `with()` im Controller oder Request-Handler bevorzugen, um die Kontrolle darüber zu behalten, was geladen wird.
- **`preventLazyLoading` in Produktion:** In diesem Beitrag wird es nur in der Entwicklung aktiviert. In Produktion wirft es `LazyLoadingViolationException`, was Requests zum Absturz bringt. Nützlich während der Entwicklung, aber zu riskant für echte Nutzer. `handleLazyLoadingViolationUsing()` nutzen, um Verstöße stattdessen zu loggen:

```php
// Lazy-Loading-Verstöße loggen statt in Produktion werfen
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    logger()->warning("Lazy loading {$relation} on {$model::class}");
});
```

- **Automatisches Eager Loading und Absicht:** Auto-Loading löst N+1 passiv, kann aber verschleiern, welche Relationen ein Controller tatsächlich braucht. Greift Code versehentlich auf eine Relation zu, feuert die Query still. `with()` bleibt die bessere Wahl, wenn Datenanforderungen zur Query-Zeit bekannt sind.

---

Eager Loading ist die einzeln wirkungsvollste Query-Optimierung in Eloquent — und eine der wenigen, bei der ein Einzeiler direkt in weniger Ladezeit und mehr Conversions übersetzt. `preventLazyLoading` in der Entwicklung aktivieren, Debugbar nach jedem Feature prüfen und standardmäßig `with()` verwenden, wann immer in einer Schleife auf eine Relation zugegriffen wird. Für Projekte auf Laravel 12.8+ bietet automatisches Eager Loading ein Sicherheitsnetz, das die N+1-Queries abfängt, die man verpasst. Es global oder über das [`essentials`](https://github.com/nunomaduro/essentials)-Paket aktivieren.

Die Strategie ist klar: `with()` verwenden, wenn bekannt ist, welche Relationen die View braucht; `withCount()`, wenn nur Zahlen gefragt sind; automatisches Eager Loading die Lücken schließen lassen.

<!-- internal link: laravel query optimization patterns post -->

<FurtherReading
  posts={[
    { slug: "hexagonal-architecture-in-laravel", description: "Wie eine Laravel-App strukturiert wird, damit Eager-Loading-Entscheidungen in der Infrastrukturschicht bleiben." },
    { slug: "deploy-laravel-coolify", description: "Wenn die Queries schnell sind, kommt das Deployment auf einen 5-Dollar-VPS." }
  ]}
/>

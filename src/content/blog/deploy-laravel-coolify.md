---
title: "Laravel mit Coolify deployen — VPS statt Forge"
description: "Laravel auf einem 5-€-VPS mit Coolify deployen: Nixpacks, Datenbank, Queues, SSL und kein Vendor Lock-in. Schritt für Schritt erklärt."
date: "2026-03-10"
lang: de
tags:
  - Laravel
  - Deployment
  - DevOps
image: "/blog/deploy-laravel-coolify/title.webp"
imageAlt: "Isometrisches Server-Rack mit Förderband, Git-Logo und Laravel-Containern als Illustration einer Deploy-Pipeline"
published: true
readingTime: 12
---

<script>
  import RelatedPost from '$lib/components/blog/RelatedPost.svelte';
  import FurtherReading from '$lib/components/blog/FurtherReading.svelte';
</script>

Forge kostet 20 €/Monat, zuzüglich VPS. Railway und Render starten ebenfalls bei 20 €/Monat und skalieren schnell nach oben, sobald Datenbank und Queue-Worker dazukommen. Für ein einzelnes Projekt oder ein kleines Portfolio summiert sich das auf 300–500 € pro Jahr, ohne dass sich der Mehrwert gegenüber einer selbst verwalteten Lösung klar rechnet.

Ein 5-€-VPS mit Coolify deckt dieselben Kernfunktionen ab: Push-to-Deploy, verwaltete Datenbanken, Queue-Worker und automatisches SSL. Wer mehrere Projekte betreibt, spart noch mehr: Auf einem VPS mit 4 GB RAM laufen drei bis fünf kleine Laravel-Apps parallel, solange keine davon dauerhaft hohe Last erzeugt.

Ich habe zwei Tage damit verbracht, eine Laravel-App auf Coolify mit einem eigenen Dockerfile zum Laufen zu bringen, dann mit Docker Compose. Beide Ansätze haben auf unterschiedliche Arten versagt: Build-Context-Probleme, falsche Berechtigungen, Services die sich nicht verbinden ließen. Als ich auf [Nixpacks](https://nixpacks.com) umgestiegen bin (den Ansatz, den Coolify in der eigenen Dokumentation empfiehlt), funktionierte das Deployment beim ersten Versuch.

Diese Anleitung deckt den Nixpacks-Ansatz von der Server-Einrichtung bis zu Datenbankprovisionierung, Queue-Workern, geplanten Tasks und SSL ab. Am Ende läuft Laravel produktiv auf einem VPS, den du vollständig kontrollierst, ohne monatliche Lizenzgebühren oder Abhängigkeit von einem Drittanbieter.

## Stack: Coolify, Nixpacks und ein günstiger VPS

- **[Laravel 12](https://laravel.com/docs/12.x)** auf PHP 8.5
- **Coolify v4** (selbst gehostetes PaaS, Open Source)
- **Nixpacks** Build Pack (Coolify's empfohlener Ansatz für Laravel)
- **VPS**: 5–6 €/Monat bei Hetzner, DigitalOcean oder Contabo (2 vCPU, 2–4 GB RAM)
- **Ubuntu 22.04 oder 24.04 LTS**
- **MySQL 8.0** via Coolify
- **Redis** via Coolify

Coolify unterstützt auch PostgreSQL, MariaDB und weitere Datenbanken. Der Wechsel ist eine Dropdown-Auswahl im Dashboard.

### Warum nicht Dockerfile oder Docker Compose?

Coolify unterstützt technisch alle drei Build-Methoden: Nixpacks, Dockerfile und Docker Compose. In der Praxis ist Nixpacks der Weg des geringsten Widerstands. Der Dockerfile-Ansatz erfordert, dass du PHP-Extensions, Nginx-Konfiguration, Prozessverwaltung und Dateirechte selbst handhabst. Nixpacks löst diese Probleme automatisch. Docker Compose fügt eine weitere Komplexitätsebene hinzu, mit Networking zwischen Services und Build-Context-Konfiguration, die Coolify's eigenes Container-Management stört. Das Debugging spart man sich, wenn man das nimmt, wofür Coolify gebaut wurde.

## Coolify auf einem VPS einrichten

Drei Dinge werden vorab benötigt: ein frischer VPS mit öffentlicher IP, SSH-Root-Zugang und eine Domain mit einem A-Record, der auf diese IP zeigt.

Die Installation ist ein einzelner Befehl. SSH einloggen und ausführen:

```bash
ssh root@your-server-ip
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 8000/tcp
```

Das Skript installiert Docker, Docker Compose und die Coolify-Container. Es dauert zwei bis drei Minuten auf einem frischen Server. Danach öffnet man `http://<server-ip>:8000` im Browser und legt ein Admin-Konto an. Dann den Server als "localhost"-Ziel in der Coolify-UI hinzufügen.

Coolify ist im Wesentlichen eine UI- und Automatisierungsschicht auf Docker Compose. Jede Ressource, die man erstellt, wird intern als Container über Compose-Dateien verwaltet.

Coolify selbst belegt rund 500 MB RAM, daher sind 2 GB das praktische Minimum. Die Ports 80, 443 und 8000 müssen während der Einrichtung geöffnet sein. Nach der initialen Konfiguration sollte Port 8000 auf die eigene IP beschränkt oder vollständig geschlossen werden. Coolify dann über eine Domain mit SSL erreichbar machen.

<figure>
  <img src="/blog/deploy-laravel-coolify/coolify-stack-architecture.svg" alt="Architekturdiagramm: VPS mit Coolify, Traefik als Reverse Proxy, ein Laravel-Container mit Supervisor sowie MySQL- und Redis-Container" />
  <figcaption>Der vollständige Stack: Traefik übernimmt SSL, Supervisor verwaltet Nginx, PHP-FPM und Queue-Worker innerhalb eines einzelnen Laravel-Containers, MySQL und Redis laufen als separate Services.</figcaption>
</figure>

## Datenbank und Redis provisionieren

Im Coolify-Dashboard eine neue MySQL-8.0-Ressource anlegen. Coolify generiert automatisch ein Root-Passwort und eine Verbindungs-URL. Eine Redis-Instanz zu erstellen funktioniert genauso und dauert etwa 30 Sekunden.

Beide Services laufen als Docker-Container mit persistenten Volumes. Die Laravel-App verbindet sich über interne Docker-Container-Namen, nicht über `127.0.0.1` oder externe IPs. Coolify stellt die Verbindungsdetails bereit:

```bash
DB_CONNECTION=mysql
DB_HOST=your-mysql-container-name
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=coolify-generated-password

REDIS_HOST=your-redis-container-name
REDIS_PORT=6379
```

Coolify verwaltet die Volume-Persistenz über Container-Neustarts und Rebuilds hinweg. Port 3306 sollte nur dann extern geöffnet werden, wenn man sich während der Entwicklung von einem lokalen Datenbank-Client verbinden muss. Coolify unterstützt auch geplante Backups auf jeden S3-kompatiblen Speicher. Das sollte vor dem Go-Live konfiguriert werden.

## Das Laravel-Repository verbinden

Im Coolify-Dashboard eine "Application"-Ressource erstellen und die Git-Quelle auswählen. Coolify unterstützt GitHub, GitLab, Bitbucket und beliebige Git-URLs über SSH oder HTTPS. Die GitHub-App-Integration spart am meisten Aufwand: automatische Deployments bei Push, ohne Deploy-Keys manuell zu verwalten.

Repository und Branch auswählen (typischerweise `main`). Coolify erkennt PHP/Laravel-Projekte automatisch und weist das **[Nixpacks](https://nixpacks.com)**-Build-Pack zu, eine Open-Source-Alternative zu Heroku Buildpacks. Es übernimmt die Installation von PHP, Composer-Abhängigkeiten und Node, wenn nötig.

Für mehr Kontrolle über PHP-Version, Extensions und Prozessverwaltung eine `nixpacks.toml` zum Projekt-Root hinzufügen. Die [Coolify-Laravel-Dokumentation](https://coolify.io/docs/applications/laravel) empfiehlt Supervisor, um Nginx, PHP-FPM und Queue-Worker innerhalb eines einzelnen Containers zu verwalten:

```toml
[phases.setup]
nixPkgs = ["php85", "php85Extensions.pdo_mysql", "php85Extensions.redis", "php85Extensions.gd", "php85Extensions.intl", "php85Extensions.mbstring", "php85Extensions.xml", "php85Extensions.zip", "nginx", "python312Packages.supervisor"]

[phases.install]
cmds = ["composer install --no-dev --optimize-autoloader"]

[phases.build]
cmds = [
    "npm ci",
    "npm run build",
    "mkdir -p /etc/supervisor/conf.d",
    "cp .deploy/supervisord.conf /etc/supervisor/conf.d/",
    "cp .deploy/nginx.conf /etc/nginx/nginx.conf"
]

[start]
cmd = "supervisord -c /etc/supervisor/conf.d/supervisord.conf"
```

Die Supervisor-Konfiguration (`.deploy/supervisord.conf`) startet drei Prozesse: Nginx auf Port 80, PHP-FPM für die Anwendung und einen Queue-Worker. Jeder Prozess hat `autorestart=true`, sodass Supervisor nach Abstürzen automatisch neu startet.

Damit wird PHP 8.5 fest eingestellt und Extensions explizit deklariert, sodass Builds reproduzierbar sind. Ohne diese Datei wählt Nixpacks sinnvolle Standardwerte, übersieht aber möglicherweise Extensions, von denen die App abhängt (wie `gd` oder `intl`). Der Supervisor-Ansatz hält alles in einem Container, der von Coolify verwaltet wird. Das ist einfacher zu deployen und zu überwachen als separate Container für jeden Prozess.

Die Domain in den Coolify-Anwendungseinstellungen setzen. Coolify konfiguriert den Reverse Proxy automatisch und leitet Traffic von dieser Domain an den Laravel-Container weiter.

<figure>
  <img src="/blog/deploy-laravel-coolify/deploy-flow.svg" alt="Deploy-Ablauf: Git-Push auf main, Coolify-Webhook, Nixpacks-Build, Post-Deploy-Befehle und Traffic-Wechsel zum neuen Container" />
  <figcaption>Push-to-Deploy: Ein Git-Push löst die gesamte Pipeline aus, vom Build über die Migration bis zum Traffic-Swap.</figcaption>
</figure>

<!-- internal link: Laravel CI/CD with GitHub Actions post -->

## Umgebungsvariablen und Laravel-Konfiguration

In den Coolify-Anwendungseinstellungen die Laravel-Umgebungsvariablen eintragen. Coolify injiziert diese zur Laufzeit in den Container. Nichts davon wird ins Image gebacken.

Die Produktionswerte, die gesetzt werden müssen (nur die, die vom Standard-`.env.example` abweichen):

```bash
APP_NAME="Your App Name"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-mysql-container-name
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=coolify-generated-password

REDIS_HOST=your-redis-container-name
REDIS_PORT=6379

QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=redis

LOG_CHANNEL=stderr
```

`APP_KEY` lokal generieren mit `php artisan key:generate --show` und die Ausgabe in Coolify einfügen.

Zwei häufige Fehlerquellen: `APP_URL` muss `https://` enthalten und exakt mit der tatsächlichen Domain übereinstimmen. `DB_HOST` und `REDIS_HOST` sind Docker-Container-Namen, nicht `127.0.0.1`. Coolify verschlüsselt sensible Werte im Ruhezustand, sodass Zugangsdaten nicht im Klartext auf dem Server gespeichert werden.

## Migrationen und Build-Commands ausführen

Coolify unterstützt Pre-Deploy- und Post-Deploy-Befehle, die nach jedem Build innerhalb des Containers ausgeführt werden. Diese als Post-Deploy-Commands setzen:

```bash
php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize
php artisan migrate --force
php artisan storage:link
```

Die `optimize:clear`- und einzelnen `clear`-Befehle löschen veraltete Caches des vorherigen Deployments, bevor `optimize` sie neu aufbaut. In der Produktion ist das `--force`-Flag bei `migrate` erforderlich, da Artisan Migrationen ohne es verweigert, wenn `APP_ENV=production` gesetzt ist.

Beim ersten Deployment das Deployment manuell aus dem Coolify-Dashboard auslösen und das Build-Log beobachten. Schlägt eine Migration fehl, schlägt das Deployment fehl und der vorherige Container bedient weiterhin den Traffic.

Wenn die App Vite verwendet, übernimmt der Schritt `npm ci && npm run build` in `nixpacks.toml` die Frontend-Asset-Kompilierung während der Build-Phase, bevor der Container startet.

## Queue-Worker und Task-Scheduling

Die Supervisor-Konfiguration in `nixpacks.toml` übernimmt das bereits. Der `[start]`-Abschnitt startet Supervisor, das drei Prozesse verwaltet: Nginx für HTTP-Anfragen, PHP-FPM für den Anwendungscode und einen Queue-Worker, der Jobs aus Redis verarbeitet. Alle drei laufen im selben Container.

Der Queue-Worker-Befehl in der Supervisor-Konfiguration verwendet `--max-time=3600`, um stündlich neu zu starten und so Memory Leaks durch lang laufende Prozesse zu verhindern. `--max-jobs=1000` fügt ein zweites Sicherheitsventil hinzu. Stürzt ein Worker ab, startet Supervisor ihn automatisch neu (`autorestart=true`).

Für Task-Scheduling einen Cron-Eintrag zur Supervisor-Konfiguration hinzufügen oder das integrierte Cron-Job-Feature von Coolify im Dashboard verwenden. In beiden Fällen lautet der Befehl `php artisan schedule:run`, ausgeführt jede Minute.

Die `failed_jobs`-Tabelle überwachen. Ein Queue-Setup ohne Monitoring ist eines, das Aufgaben stillschweigend fallen lässt.

## SSL und Domain-Konfiguration

Coolify wird mit **Traefik** als Standard-Reverse-Proxy ausgeliefert, alternativ ist Caddy möglich. Beide provisionieren automatisch [Let's-Encrypt](https://letsencrypt.org)-Zertifikate, sobald einer Ressource eine Domain zugewiesen wird.

Die Einrichtung besteht aus drei Schritten: A-Record auf den Server zeigen lassen, Domain in den Coolify-Anwendungseinstellungen setzen und HTTPS aktivieren. Coolify übernimmt Zertifikatsanforderung, Erneuerung und HTTPS-Weiterleitung automatisch.

Jede zugewiesene Domain oder Subdomain erhält ein eigenes Zertifikat. Für Wildcard-Zertifikate auf Caddy wechseln und DNS-Challenge-Validierung mit der API des DNS-Anbieters konfigurieren.

DNS-Propagation dauert in der Regel Minuten, nicht Stunden. Wenn das Zertifikat nicht automatisch ausgestellt wird, liegt es fast immer daran, dass der A-Record noch nicht greift oder Port 80 blockiert ist.

## Was dieses Setup bringt

Laravel läuft produktiv auf einem 5–6-€-VPS mit Push-to-Deploy aus Git. Datenbank, Redis, Queue-Worker, Scheduler und SSL werden über ein einziges Dashboard verwaltet.

Der Deploy-Flow: Push auf `main`, Coolify baut einen neuen Container, führt Post-Deploy-Commands inklusive Migrationen aus und tauscht den Traffic auf den neuen Container. Coolify behält den alten Container als Rollback-Ziel, bis der nächste erfolgreiche Build ihn ersetzt.

Alles ist Open Source und portabel. Der Server läuft mit Standard-Docker-Containern. Verschwindet Coolify morgen, bleibt ein VPS mit Docker-Compose-Dateien, der direkt weiterverwaltet werden kann.

**Kostenvergleich:** Dieses Setup kostet ca. 5 €/Monat für den VPS. Forge kostet 20 €/Monat zuzüglich 5+ € für den VPS. Railway oder Render starten bei 20 €/Monat und skalieren mit Datenbank- und Worker-Add-ons schnell nach oben. Bei mehreren Projekten auf einem VPS vervielfacht sich die Ersparnis. Was die Rechnung nicht enthält: Die eigene Zeit für Server-Wartung, Updates und Debugging. Wer diese Aufgaben nicht routiniert erledigt, sollte den Zeitaufwand (anfangs 2-4 Stunden pro Monat) einkalkulieren.

<RelatedPost
  slug="eloquent-eager-loading-n-plus-1"
  description="Vor dem Deployment sicherstellen, dass Queries optimiert sind. Eager Loading ist die wirkungsvollste einzelne Verbesserung."
/>

## Abwägungen und wann dieser Ansatz nicht passt

Du bist das Ops-Team. Server-Updates, Sicherheits-Patches und Firewall-Regeln liegen in deiner Verantwortung. Coolify verwaltet die Anwendungsebene gut, aber das darunterliegende Betriebssystem liegt bei dir.

Das ist ein Single-Server-Setup. Wenn die App horizontales Skalieren über mehrere Server hinweg benötigt, unterstützt Coolify das, aber die Komplexität steigt erheblich. Ab diesem Punkt ist managed Kubernetes oder eine Plattform wie Fly.io möglicherweise besser geeignet.

Coolify v4 ist stabil und wird aktiv weiterentwickelt, hat aber weniger Produktionsjahre hinter sich als Forge oder Ploi. Bei Updates kann es vorkommen, dass sich UI-Elemente verschieben oder Konfigurationsoptionen umbenannt werden.

Integriertes Application-Monitoring ist nicht enthalten. **Uptime Kuma** (ebenfalls über Coolify deploybar) für Uptime-Checks hinzufügen oder **Oh Dear** als verwaltete Lösung nutzen.

Alle Services teilen sich Ressourcen auf einem einzelnen VPS. Ein 2-GB-Server verarbeitet moderaten Traffic (ca. 50-100 gleichzeitige Nutzer). Wird es enger, ist ein Upgrade auf 4 oder 8 GB bei den meisten Anbietern in Minuten erledigt, kostet dann aber 10-20 €/Monat.

<!-- internal link: Laravel Docker local dev post -->
<!-- internal link: Coolify advanced configuration post -->

<FurtherReading
  posts={[
    { slug: "hexagonal-architecture-in-laravel", description: "Die App strukturieren, die du deployst. Hexagonale Architektur hält Domains sauber, während die Codebasis wächst." }
  ]}
/>

---

Laravel produktiv auf einem eigenen Server: Push-to-Deploy, verwaltete Datenbanken, Queue-Worker, SSL, ab 5 € im Monat. Die Einrichtung dauert etwa eine Stunde von einem frischen VPS bis zum laufenden Deployment.

Im nächsten Artikel: CI-Pipeline mit GitHub Actions, sodass Tests laufen, bevor Coolify deployed.

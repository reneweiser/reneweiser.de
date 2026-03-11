---
title: "Deploy Laravel to a VPS with Coolify"
description: "Deploy Laravel on a $5 VPS with Coolify and Nixpacks — the approach that actually works. Database, queues, SSL, and zero vendor lock-in."
date: "2026-03-10"
tags:
  - Laravel
  - Deployment
  - DevOps
image: "/blog/deploy-laravel-coolify/title.webp"
imageAlt: "Isometric server rack with conveyor belt, Git logo, and Laravel containers illustrating a deploy pipeline"
published: true
---

<script>
  import RelatedPost from '$lib/components/blog/RelatedPost.svelte';
  import FurtherReading from '$lib/components/blog/FurtherReading.svelte';
</script>

I spent two days trying to deploy a Laravel app on Coolify with a custom Dockerfile. Then with Docker Compose. Both approaches broke in different ways — build context issues, permission mismatches, services failing to connect. When I finally switched to [Nixpacks](https://nixpacks.com), which is what Coolify actually recommends in their docs, the deployment worked on the first try.

This walkthrough covers the Nixpacks approach from server setup through database provisioning, queue workers, scheduled tasks, and SSL. By the end you will have a production Laravel deployment on a $5 VPS that you own completely — Forge or Render developer experience without the monthly tax or vendor dependency.

## The Coolify and Laravel Stack

- **[Laravel 12](https://laravel.com/docs/12.x)** on PHP 8.5
- **Coolify v4** (self-hosted PaaS, open source)
- **Nixpacks** build pack (Coolify's recommended approach for Laravel)
- **VPS**: $5-6/month from Hetzner, DigitalOcean, or Contabo (2 vCPU, 2-4 GB RAM)
- **Ubuntu 22.04 or 24.04 LTS**
- **MySQL 8.0** via Coolify
- **Redis** via Coolify

Coolify supports PostgreSQL, MariaDB, and others. Swapping databases is a dropdown change in the dashboard.

### Why Not Dockerfile or Docker Compose?

Coolify technically supports all three build methods: Nixpacks, Dockerfile, and Docker Compose. In practice, Nixpacks is the path of least resistance. The Dockerfile approach requires you to handle PHP extensions, Nginx configuration, process management, and file permissions yourself — all problems Nixpacks solves automatically. Docker Compose adds another layer of complexity with networking between services and build context configuration that fights Coolify's own container management. Save yourself the debugging and use what Coolify is built around.

## Setting Up Coolify on a VPS

You need three things before starting: a fresh VPS with a public IP, SSH root access, and a domain with an A record pointing to that IP.

The install is a single command. SSH in and run:

```bash
ssh root@your-server-ip
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 8000/tcp
```

The script installs Docker, Docker Compose, and the Coolify containers. It takes two to three minutes on a fresh server. Once it finishes, open `http://<server-ip>:8000` in your browser and create an admin account. Then add your server as a "localhost" destination in the Coolify UI.

Coolify is essentially a UI and automation layer on top of Docker Compose. Every resource you create becomes a container managed through compose files under the hood.

A few things to keep in mind: Coolify itself uses around 500 MB of RAM, so 2 GB is the practical minimum. You need ports 80, 443, and 8000 open during setup. After the initial configuration, restrict port 8000 to your IP or close it entirely and access Coolify through a domain with SSL.

<figure>
  <img src="/blog/deploy-laravel-coolify/coolify-stack-architecture.svg" alt="Architecture diagram showing a VPS running Coolify with Traefik reverse proxy, a Laravel container managed by Supervisor, and MySQL and Redis database containers" />
  <figcaption>The full stack: Traefik handles SSL, Supervisor manages Nginx, PHP-FPM, and queue workers inside a single Laravel container, with MySQL and Redis as separate services.</figcaption>
</figure>

## Provisioning the Database and Redis

In the Coolify dashboard, create a new MySQL 8.0 resource. Coolify generates a root password and connection URL automatically. Creating a Redis instance works the same way and takes about 30 seconds.

Both services run as Docker containers with persistent volumes. Your Laravel app connects to them via internal Docker container names, not `127.0.0.1` or external IPs. Coolify provides the connection details:

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

Coolify handles volume persistence across container restarts and rebuilds. Only expose port 3306 externally if you need to connect from a local database client during development. Coolify also supports scheduled backups to any S3-compatible storage, which you should configure before going live.


## Connecting Your Laravel Repository

Create an "Application" resource in Coolify and select your Git source. Coolify supports GitHub, GitLab, Bitbucket, and any Git URL over SSH or HTTPS. The GitHub App integration is the cleanest option because it enables automatic deployments on push without managing deploy keys.

Select your repository and branch (typically `main`). Coolify auto-detects PHP/Laravel projects and assigns the **[Nixpacks](https://nixpacks.com)** build pack, which is an open-source alternative to Heroku buildpacks. It handles installing PHP, Composer dependencies, and Node if needed.

For more control over the PHP version, extensions, and process management, add a `nixpacks.toml` to your project root. The [Coolify Laravel docs](https://coolify.io/docs/applications/laravel) recommend using Supervisor to manage Nginx, PHP-FPM, and queue workers inside a single container:

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

The Supervisor config (`.deploy/supervisord.conf`) runs three processes: Nginx on port 80, PHP-FPM for the application, and a queue worker. Each process gets `autorestart=true` so Supervisor recovers from crashes automatically.

This pins PHP 8.5 and declares extensions explicitly so builds are reproducible. Without it, Nixpacks picks sensible defaults but might miss extensions your app depends on (like `gd` or `intl`). The Supervisor approach keeps everything in one container managed by Coolify, which is simpler to deploy and monitor than running separate containers for each process.

Set your domain in Coolify's application settings. Coolify configures the reverse proxy automatically, routing traffic from that domain to your Laravel container.

<figure>
  <img src="/blog/deploy-laravel-coolify/deploy-flow.svg" alt="Deploy flow diagram showing the steps from git push to production: push to main, Coolify webhook, Nixpacks build, post-deploy commands, and traffic swap" />
  <figcaption>Push-to-deploy: a git push triggers the full pipeline from build through migration to traffic swap, with automatic rollback if anything fails.</figcaption>
</figure>

<!-- internal link: Laravel CI/CD with GitHub Actions post -->

## Environment Variables and Laravel Configuration

In the Coolify application settings, add your Laravel environment variables. Coolify injects these into the container at runtime, so nothing gets baked into the image.

Here are the production values you need to set (only the ones that differ from a standard `.env.example`):

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

Generate `APP_KEY` locally with `php artisan key:generate --show` and paste the output into Coolify.

Two things that trip people up: `APP_URL` must include `https://` and match your actual domain exactly, and `DB_HOST` / `REDIS_HOST` are Docker container names, not `127.0.0.1`. Coolify encrypts sensitive values at rest, so credentials are not stored in plaintext on the server.

## Running Migrations and Build Commands

Coolify supports pre-deploy and post-deploy commands that run inside the container after each build. Set these as your post-deploy commands:

```bash
php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize
php artisan migrate --force
php artisan storage:link
```

The `optimize:clear` and individual `clear` commands wipe stale caches from the previous deployment before `optimize` rebuilds them fresh. Production requires the `--force` flag on `migrate` because Artisan refuses to run migrations without it when `APP_ENV=production`.

For the first deployment, trigger it manually from the Coolify dashboard and watch the build log. If a migration fails, the deployment fails and the previous container keeps serving traffic. This gives you a basic zero-downtime safety net out of the box.

If your app uses Vite, the `npm ci && npm run build` step in `nixpacks.toml` handles frontend asset compilation during the build phase, before the container starts.

## Queue Workers and Task Scheduling

The Supervisor configuration in `nixpacks.toml` already handles this. The `[start]` section launches Supervisor, which manages three processes: Nginx serving HTTP requests, PHP-FPM handling application code, and a queue worker processing jobs from Redis. All three run inside the same container.

The queue worker command in the Supervisor config uses `--max-time=3600` to restart every hour, preventing memory leaks from long-running processes. `--max-jobs=1000` adds a second safety valve. If a worker crashes, Supervisor restarts it automatically — that is what `autorestart=true` does.

For task scheduling, add a cron entry to the Supervisor config or use Coolify's built-in cron job feature from the dashboard. Either way, the command is `php artisan schedule:run`, executed every minute.

Monitor the `failed_jobs` table. A queue setup without monitoring is a queue setup that silently drops work.

## SSL and Domain Configuration

Coolify ships with **Traefik** as the default reverse proxy, though you can switch to Caddy. Both auto-provision [Let's Encrypt](https://letsencrypt.org) certificates when you assign a domain to a resource.

The setup is three steps: point your A record to the server, set the domain in Coolify's application settings, and toggle HTTPS on. Coolify handles the certificate request, renewal, and HTTPS redirect automatically.

Each domain or subdomain you assign gets its own certificate. If you need wildcard certificates, switch to Caddy and configure DNS challenge validation with your DNS provider's API.

DNS propagation usually takes minutes, not hours.

## What This Coolify Deployment Gets You

Production Laravel running on a $5-6/month VPS with push-to-deploy from Git. Database, Redis, queue workers, scheduler, and SSL all managed from a single dashboard.

The deploy flow works like this: push to `main`, Coolify builds a new container, runs post-deploy commands including migrations, and swaps traffic to the new container. The old container stays around briefly as a rollback target.

Everything is open source and portable. Your server runs standard Docker containers. If Coolify disappears tomorrow, you still have a VPS with Docker Compose files you can manage directly.

Cost comparison: this setup runs about $5/month for the VPS. Forge costs $20/month plus $5+ for the VPS. Railway or Render start at $20/month and scale up quickly with database and worker add-ons.

<RelatedPost
  slug="eloquent-eager-loading-n-plus-1"
  description="Before deploying, make sure your queries are optimized — eager loading is the single highest-impact fix."
/>

## Trade-offs and When This Does Not Fit

You are the ops team. Server updates, security patches, and firewall rules are your responsibility. Coolify handles the application layer well, but the underlying OS is on you.

This is a single-server setup. If your app needs horizontal scaling across multiple servers, Coolify supports it but the complexity goes up significantly. At that point, managed Kubernetes or a platform like Fly.io might be a better fit.

Coolify v4 is stable and actively maintained, but it has fewer years of production mileage than Forge or Ploi. Expect the occasional rough edge.

There is no built-in application monitoring. Add **Uptime Kuma** (also deployable through Coolify) for uptime checks, or **Oh Dear** for a managed solution.

All services share resources on a single VPS. A 2 GB server handles moderate traffic, and upgrading to 4 or 8 GB is a slider change at your hosting provider.

<!-- internal link: Laravel Docker local dev post -->
<!-- internal link: Coolify advanced configuration post -->

<FurtherReading
  posts={[
    { slug: "hexagonal-architecture-in-laravel", description: "Structure the app you're deploying — hexagonal architecture keeps domains clean as the codebase grows." }
  ]}
/>

---

A production Laravel deployment on a server you own: push-to-deploy, managed databases, queue workers, SSL, all for the cost of a coffee per month. Setup takes about an hour from a fresh VPS to a working deployment, and the savings pay for themselves immediately.

Next time, I will cover adding a CI pipeline with GitHub Actions so tests run before Coolify deploys.

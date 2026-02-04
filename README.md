# reneweiser.de

German portfolio website for a full-stack web developer. Single-page static site with anchor navigation.

**Stack:** SvelteKit 2 (Svelte 5) · TypeScript · Tailwind CSS 4 · Bun

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)

### Setup

```bash
# Clone the repository
git clone https://github.com/reneweiser/reneweiser.de.git
cd reneweiser.de

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Edit .env with your Impressum details
```

### Commands

```bash
bun run dev       # Start dev server at http://localhost:5173
bun run build     # Production build to ./build
bun run preview   # Preview production build
bun run check     # TypeScript/Svelte type checking
bun run lint      # Check formatting (Prettier)
bun run format    # Auto-format code
```

## Docker

### Build locally

```bash
docker build \
  --build-arg PUBLIC_IMPRESSUM_NAME="Your Name" \
  --build-arg PUBLIC_IMPRESSUM_STREET="Your Street" \
  --build-arg PUBLIC_IMPRESSUM_CITY="12345 Your City" \
  --build-arg PUBLIC_IMPRESSUM_EMAIL="your@email.de" \
  -t reneweiser.de .
```

### Run locally

```bash
docker run -p 8080:8080 reneweiser.de
```

### Using docker-compose

```bash
# Uses values from .env file
docker compose up --build
```

## Deployment

### GitHub Actions

The repository includes a GitHub Actions workflow that automatically builds and pushes the Docker image to GitHub Container Registry on every push to `main`.

**Image:** `ghcr.io/reneweiser/reneweiser.de:main`

#### Required Secrets

Configure these in your repository settings under *Settings → Secrets and variables → Actions*:

| Secret | Description |
|--------|-------------|
| `PUBLIC_IMPRESSUM_NAME` | Legal name for Impressum |
| `PUBLIC_IMPRESSUM_STREET` | Street address |
| `PUBLIC_IMPRESSUM_CITY` | City with postal code |
| `PUBLIC_IMPRESSUM_EMAIL` | Contact email |

#### Versioned Releases

```bash
git tag v1.0.0
git push origin v1.0.0
```

This creates additional image tags: `1.0.0`, `1.0`

### Pull and Run

```bash
docker pull ghcr.io/reneweiser/reneweiser.de:main
docker run -p 8080:8080 ghcr.io/reneweiser/reneweiser.de:main
```

The container runs nginx on port 8080 as a non-root user.

## Project Structure

```
src/
├── lib/
│   ├── assets/        # Images, favicon
│   └── components/    # Svelte components
└── routes/
    ├── +layout.svelte # Root layout
    ├── +layout.ts     # Prerender config
    ├── +page.svelte   # Main page
    ├── +error.svelte  # 404 page
    └── layout.css     # Global styles (Tailwind)
```

## License

All rights reserved.

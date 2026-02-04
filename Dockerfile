# Stage 1: Build with Bun
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build arguments for environment variables (baked into static build)
ARG PUBLIC_IMPRESSUM_NAME
ARG PUBLIC_IMPRESSUM_STREET
ARG PUBLIC_IMPRESSUM_CITY
ARG PUBLIC_IMPRESSUM_EMAIL

# Expose ARGs as ENV for the build process
ENV PUBLIC_IMPRESSUM_NAME=$PUBLIC_IMPRESSUM_NAME
ENV PUBLIC_IMPRESSUM_STREET=$PUBLIC_IMPRESSUM_STREET
ENV PUBLIC_IMPRESSUM_CITY=$PUBLIC_IMPRESSUM_CITY
ENV PUBLIC_IMPRESSUM_EMAIL=$PUBLIC_IMPRESSUM_EMAIL

# Build the static site
RUN bun run build

# Stage 2: Serve with nginx (unprivileged, non-root)
FROM nginxinc/nginx-unprivileged:1.27-alpine AS production

# Copy built static files
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (nginx-unprivileged default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

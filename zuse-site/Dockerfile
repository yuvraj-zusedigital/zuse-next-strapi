# syntax=docker/dockerfile:1
#
# Multi-stage build for the Zuse Digital Next.js site.
#
#   deps     -> install node_modules from the lockfile (cached layer)
#   builder  -> generate Tailwind CSS + `STATIC_EXPORT=1 next build` -> /app/out
#   runtime  -> optional: serve the static export with nginx (for container hosting)
#
# CI builds the `builder` stage and copies /app/out out of it for the S3 deploy,
# so no npm cache is needed in .gitlab-ci.yml. See DEPLOYMENT.md.

# ---- deps: install dependencies ---------------------------------------------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: produce the static export in /app/out -------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time configuration. NEXT_PUBLIC_* values are inlined into the output,
# so this build is environment-specific (staging vs production). Pass overrides
# with --build-arg. These are not secret.
ARG NEXT_PUBLIC_SITE_URL="https://staging.zusedigital.com"
ARG STRAPI_API_URL="https://stagingadmin.zusedigital.com"
ARG NEXT_PUBLIC_STRAPI_API_URL="https://stagingadmin.zusedigital.com"
ENV STATIC_EXPORT=1 \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    STRAPI_API_URL=$STRAPI_API_URL \
    NEXT_PUBLIC_STRAPI_API_URL=$NEXT_PUBLIC_STRAPI_API_URL

# STRAPI_TOKEN is a secret: mounted only for this RUN so it never persists in an
# image layer or history. `npm run build` does NOT run Tailwind on its own.
RUN --mount=type=secret,id=strapi_token \
    export STRAPI_TOKEN="$(cat /run/secrets/strapi_token 2>/dev/null || true)"; \
    npm run tailwind:build && npm run build

# ---- runtime: serve the static files with nginx (optional) ------------------
# Not used by the S3/CloudFront deploy, but lets you `docker run` the site.
FROM nginx:alpine AS runtime
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

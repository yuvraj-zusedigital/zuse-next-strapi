# Zuse CMS (Next.js). Build from this folder:  docker build -t zuse-cms .
# Runtime env: STRAPI_URL, SESSION_SECRET, CMS_PROXY_SECRET (see .env.example).

FROM node:24.15.0-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_OUTPUT_STANDALONE=1
RUN npm run build

FROM node:24.15.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3100

# Standalone output: a minimal server plus only the node_modules it needs.
COPY --chown=node:node --from=build /app/.next/standalone ./
COPY --chown=node:node --from=build /app/.next/static ./.next/static
COPY --chown=node:node --from=build /app/public ./public

USER node
EXPOSE 3100
CMD ["node", "server.js"]

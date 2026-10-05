FROM node:24.15.0-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package.json ./

RUN npm i

FROM deps AS build

COPY . .

RUN npm run build

FROM node:24.15.0-alpine AS runtime

WORKDIR /app

RUN chown node:node /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337

COPY --chown=node:node --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/config ./config
COPY --chown=node:node --from=build /app/src ./src
# CMS maintenance: npm run cms:create-editor / cms:smoke-test
COPY --chown=node:node --from=build /app/scripts ./scripts
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/database ./database
COPY --chown=node:node --from=build /app/favicon.png ./favicon.png
COPY --chown=node:node --from=build /app/data.db ./data.db

USER node

EXPOSE 1337

CMD ["npm", "run", "start"]
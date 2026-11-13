# syntax=docker/dockerfile:1.7

# Plugins usa pnpm (pnpm-lock.yaml y pnpm-workspace.yaml versionados).
FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@11.22.0

FROM base AS deps
ENV NODE_ENV=development
COPY plugins/package.json plugins/pnpm-lock.yaml plugins/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
ENV NODE_ENV=production
COPY plugins/ ./
RUN pnpm run build

FROM build AS prod-deps
RUN pnpm prune --prod

# La migracion SQL versionada esta vacia y no coincide con el schema actual
# (plugins/workspace_plugins). `push` crea el esquema real de forma idempotente.
FROM deps AS migrate
COPY plugins/ ./
CMD ["pnpm", "exec", "drizzle-kit", "push", "--force"]

FROM base AS runner
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY plugins/package.json ./
USER node
EXPOSE 4005
CMD ["node", "dist/main.js"]

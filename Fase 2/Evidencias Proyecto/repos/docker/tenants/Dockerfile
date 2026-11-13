# syntax=docker/dockerfile:1.7

# Tenants usa pnpm (pnpm-lock.yaml y pnpm-workspace.yaml versionados).
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
COPY tenants/package.json tenants/pnpm-lock.yaml tenants/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
ENV NODE_ENV=production
COPY tenants/ ./
RUN pnpm run build

FROM build AS prod-deps
RUN pnpm prune --prod

# El journal de Drizzle del repositorio no incluye la migracion 0005 y el
# esquema actual sí la requiere. `push` alinea la base con el schema real y
# es idempotente en arranques posteriores.
FROM deps AS migrate
COPY tenants/ ./
CMD ["pnpm", "exec", "drizzle-kit", "push", "--force"]

FROM base AS runner
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY tenants/package.json ./
USER node
EXPOSE 4004
# tsconfig.build.json de Tenants incluye drizzle.config.ts y emite dist/src.
CMD ["node", "dist/src/main.js"]

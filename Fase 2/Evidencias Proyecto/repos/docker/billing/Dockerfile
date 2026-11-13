# syntax=docker/dockerfile:1.7

# Imagen compartida por la API y el job de migraciones de Billing.
FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

# Dependencias completas (incluye devDependencies para compilar y migrar).
FROM base AS deps
ENV NODE_ENV=development
COPY billing/package.json billing/package-lock.json ./
RUN npm ci

# Compilacion de NestJS y generacion del cliente Prisma.
FROM deps AS build
ENV NODE_ENV=production
COPY billing/ ./
RUN npx prisma generate \
    && npm run build

# Dependencias de produccion + cliente Prisma ya generado.
FROM build AS prod-deps
RUN npm prune --omit=dev

# Job de migraciones: usa el CLI de Prisma (devDependency).
FROM deps AS migrate
COPY billing/ ./
CMD ["npx", "prisma", "migrate", "deploy"]

# Imagen final de ejecucion.
FROM base AS runner
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY billing/package.json ./
USER node
EXPOSE 4001
CMD ["node", "dist/main"]

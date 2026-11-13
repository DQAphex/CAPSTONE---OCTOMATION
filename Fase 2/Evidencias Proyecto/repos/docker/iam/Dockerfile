# syntax=docker/dockerfile:1.7

# IAM usa npm (package-lock.json versionado en el repositorio).
FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
ENV NODE_ENV=development
COPY iam-service/package.json iam-service/package-lock.json ./
RUN npm ci

FROM deps AS build
ENV NODE_ENV=production
COPY iam-service/ ./
RUN npm run build

FROM build AS prod-deps
RUN npm prune --omit=dev

# IAM no tiene carpeta de migraciones Drizzle; el proyecto administra el
# esquema con `drizzle-kit push` (script db:push). El job es idempotente.
FROM deps AS migrate
COPY iam-service/ ./
CMD ["npx", "drizzle-kit", "push", "--force"]

FROM base AS runner
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY iam-service/package.json ./
USER node
EXPOSE 4002
CMD ["node", "dist/main"]

# syntax=docker/dockerfile:1.7

# OCTO_TRANSACTIONS es una aplicacion Express (Webpay Oneclick) sin etapa de
# compilacion. Persiste pedidos en /app/data/pedidos.json.
FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY OCTO_TRANSACTIONS/package.json OCTO_TRANSACTIONS/package-lock.json ./
# El package-lock versionado esta desactualizado (no incluye dotenv), por lo
# que `npm ci` falla. Se instala desde package.json sin reescribir el lockfile
# del repositorio.
RUN npm install --omit=dev --no-package-lock

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY OCTO_TRANSACTIONS/server.js ./
COPY OCTO_TRANSACTIONS/admin ./admin
COPY OCTO_TRANSACTIONS/public ./public
COPY OCTO_TRANSACTIONS/package.json ./
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 4003
CMD ["node", "server.js"]

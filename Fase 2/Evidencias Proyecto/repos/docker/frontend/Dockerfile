# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
ENV NODE_ENV=development
COPY octomation-frontend/package.json octomation-frontend/package-lock.json ./
RUN npm ci

FROM deps AS build
# `next build` debe ejecutarse con NODE_ENV=production. Si se hereda
# NODE_ENV=development (necesario en deps para instalar devDependencies),
# Next.js falla al prerenderizar /_global-error con un error de useContext.
ENV NODE_ENV=production
# Las variables NEXT_PUBLIC_* se incrustan en el bundle del navegador.
ARG NEXT_PUBLIC_BILLING_URL=http://localhost:4001
ARG NEXT_PUBLIC_IAM_SERVICE_URL=http://localhost:4002
ARG NEXT_PUBLIC_TRANSACTIONS_URL=http://localhost:4003
ARG NEXT_PUBLIC_TENANTS_URL=http://localhost:4004
ARG NEXT_PUBLIC_PLUGINS_URL=http://localhost:4005
ENV NEXT_PUBLIC_BILLING_URL=$NEXT_PUBLIC_BILLING_URL \
    NEXT_PUBLIC_IAM_SERVICE_URL=$NEXT_PUBLIC_IAM_SERVICE_URL \
    NEXT_PUBLIC_TRANSACTIONS_URL=$NEXT_PUBLIC_TRANSACTIONS_URL \
    NEXT_PUBLIC_TENANTS_URL=$NEXT_PUBLIC_TENANTS_URL \
    NEXT_PUBLIC_PLUGINS_URL=$NEXT_PUBLIC_PLUGINS_URL
COPY octomation-frontend/ ./
RUN npm run build

FROM build AS prod-deps
RUN npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]

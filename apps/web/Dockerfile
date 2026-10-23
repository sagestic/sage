FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate

FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@^2
COPY . .
RUN turbo prune @sage/web --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.base.json tsconfig.base.json

ARG NEXT_DEPLOYMENT_ID
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WEBAPP_URL
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY

ENV NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_WEBAPP_URL=$NEXT_PUBLIC_WEBAPP_URL
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV SKIP_ENV_VALIDATION=1
ENV NODE_ENV=production

RUN pnpm --filter @sage/db db:generate
RUN pnpm --filter @sage/web build

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apt-get update && apt-get install -y openssl ca-certificates python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/sage-python && /opt/sage-python/bin/pip install --no-cache-dir "ortools>=9.10,<10"
ENV PATH="/opt/sage-python/bin:$PATH"
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# The API spawns this script from the monorepo-relative path.
COPY --from=builder --chown=nextjs:nodejs /app/packages/ai-engine/src/or-tools/vrp_solver.py ./packages/ai-engine/src/or-tools/vrp_solver.py
USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

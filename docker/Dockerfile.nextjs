# ── Stage 1: Install deps ────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (DATABASE_URL only needed at runtime, not build time)
ENV SKIP_ENV_VALIDATION=true
ENV NODE_OPTIONS="--max-old-space-size=4096"
# Generate Prisma client without any DATABASE_URL so it stays URL-agnostic
RUN npx prisma generate
# Build with a dummy URL only for the build process (force-dynamic prevents actual DB calls)
RUN DATABASE_URL="postgresql://x:x@localhost/x" NEXTAUTH_SECRET="build" JWT_SECRET="build" npm run build

# ── Stage 3: Production runtime ──────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

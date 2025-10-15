# Multi-stage Dockerfile for Express API (Node 20 Alpine)

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install all deps (including dev) for build
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client and build Express app
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
# Copy package manifests first for clarity
COPY package*.json ./
# Bring built node_modules then prune dev deps
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev
# Copy compiled app and prisma schema (for runtime prisma client)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Default port used by the Express app
EXPOSE 8080

# Copy entrypoint to run migrations before starting
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]



# Multi-stage build for Telegram bot

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json ./packages/common/
COPY packages/telegram-bot/package.json ./packages/telegram-bot/

# Install pnpm
RUN npm install -g pnpm@8

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/common ./packages/common
COPY packages/telegram-bot ./packages/telegram-bot

# Build common package
RUN pnpm --filter @theWallProject/common build

# Build bot package
RUN pnpm --filter @theWallProject/telegram-bot build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json ./packages/common/
COPY packages/telegram-bot/package.json ./packages/telegram-bot/

# Install pnpm
RUN npm install -g pnpm@8

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/
COPY --from=builder /app/packages/telegram-bot/dist ./packages/telegram-bot/dist
COPY --from=builder /app/packages/telegram-bot/db ./packages/telegram-bot/db
COPY --from=builder /app/packages/telegram-bot/package.json ./packages/telegram-bot/

# Validate required files exist
RUN test -f packages/telegram-bot/db/ALL.json || (echo "Database file missing" && exit 1)
RUN test -f packages/telegram-bot/dist/index.js || (echo "Built index.js missing" && exit 1)

WORKDIR /app/packages/telegram-bot

# Port from environment variable (required)
ARG PORT
ENV PORT=${PORT}

# Validate PORT is set
RUN test -n "$PORT" || (echo "PORT environment variable is required" && exit 1)

# Expose port
EXPOSE ${PORT}

# Start server
CMD ["node", "dist/index.js"]


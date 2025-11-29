# Runtime-only image for Telegram bot
# Assumes project is built locally before Docker build
# Build context: repo root

FROM node:20-alpine

# Declare build arguments for required environment variables
ARG NODE_ENV
ARG BOT_TOKEN
ARG BOT_USERNAME
ARG WEBHOOK_URL

# Validate that all required environment variables are provided
RUN if [ -z "$NODE_ENV" ]; then echo "ERROR: NODE_ENV build argument is required" && exit 1; fi
RUN if [ "$NODE_ENV" != "production" ]; then echo "ERROR: NODE_ENV must be 'production' for Docker build" && exit 1; fi
RUN if [ -z "$BOT_TOKEN" ]; then echo "ERROR: BOT_TOKEN build argument is required" && exit 1; fi
RUN if [ -z "$BOT_USERNAME" ]; then echo "ERROR: BOT_USERNAME build argument is required" && exit 1; fi
RUN if [ -z "$WEBHOOK_URL" ]; then echo "ERROR: WEBHOOK_URL build argument is required" && exit 1; fi

# Set as environment variables (can be overridden at runtime via --env-file)
ENV NODE_ENV=$NODE_ENV
ENV BOT_TOKEN=$BOT_TOKEN
ENV BOT_USERNAME=$BOT_USERNAME
ENV WEBHOOK_URL=$WEBHOOK_URL

WORKDIR /app

# Install pnpm (match local version to avoid lockfile compatibility issues)
RUN npm install -g pnpm@10

# Copy package files needed for production dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json ./packages/common/
COPY packages/telegram-bot/package.json ./packages/telegram-bot/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files (must exist from local build)
COPY packages/common/dist ./packages/common/dist
COPY packages/common/package.json ./packages/common/
COPY packages/telegram-bot/dist ./packages/telegram-bot/dist
COPY packages/telegram-bot/db ./packages/telegram-bot/db
COPY packages/telegram-bot/package.json ./packages/telegram-bot/

# Validate required files exist
RUN test -f packages/telegram-bot/db/ALL.json || (echo "Database file missing" && exit 1)
RUN test -f packages/telegram-bot/dist/index.js || (echo "Built index.js missing - run 'pnpm build' first" && exit 1)
RUN test -d packages/common/dist || (echo "Common package not built - run 'pnpm build' first" && exit 1)

WORKDIR /app/packages/telegram-bot

# Expose port (hardcoded to 3333)
EXPOSE 3333

# Start server
CMD ["node", "dist/index.js"]


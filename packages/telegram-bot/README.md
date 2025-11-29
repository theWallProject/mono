# Telegram Bot Package

Telegram bot that checks URLs against The Wall database to determine if links are safe or flagged.

## Features

- **Inline queries**: Check URLs by typing `@theWallBoycott_bot <url>` in any chat
- **Direct messages**: Send URLs directly to the bot in private chat
- **Group mentions**: Mention the bot in groups with a URL to check it

## Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Telegram bot token(s) from [@BotFather](https://t.me/botfather)

### Development vs Production

This bot supports separate development and production environments:

- **Development**: Runs locally via `pnpm dev` (no Docker, lightweight)
- **Production**: Runs in Docker container on VPS server

You can run both simultaneously - dev locally for testing new features, prod on server for users.

### Manual Setup Steps

1. **Create Telegram Bot(s)**:
   - Open [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` command
   - Choose a name for your bot
   - Choose a username (must end in `bot`, e.g., `theWallBoycott_bot`)
   - **Save the BOT_TOKEN** provided by BotFather
   - Note your bot's username (e.g., `theWallBoycott_bot`)
   - **Optional**: Create a separate dev bot for testing (`/newbot` again)

2. **Configure Environment Variables**:
   - Create `.env.dev` and `.env.prod` files in `packages/telegram-bot/` directory
   - Fill in your values:

   **`.env.dev`** (for development):

   ```env
   BOT_TOKEN_DEV=your_dev_bot_token_here
   BOT_USERNAME_DEV=your_dev_bot_username_here
   PORT=3005
   NODE_ENV=development
   ```

   **`.env.prod`** (for production):

   ```env
   BOT_TOKEN=your_production_bot_token_here
   BOT_USERNAME=your_production_bot_username_here
   PORT=3009
   NODE_ENV=production
   WEBHOOK_URL=https://your-public-bot-url.example.com
   ```

   **Note**: The bot automatically loads the correct file based on `NODE_ENV`. If `NODE_ENV` is not set externally, it defaults to `development` and loads `.env.dev`. The bot will fail-fast if the required file is missing or variables are not set.

3. **Install Dependencies**:

   ```bash
   pnpm install
   ```

4. **Build**:

   ```bash
   pnpm build
   ```

5. **Run**:

   ```bash
   # Development (local, polling mode)
   pnpm dev

   # Production (requires build first)
   pnpm start
   ```

## Environment Variables

### Production (Required)

- `BOT_TOKEN` - Telegram bot token from BotFather (production bot)
- `BOT_USERNAME` - Your bot's username (for mention detection, production bot)
- `PORT` - Server port (no default, must be set, e.g., 3009 for prod, 3005 for dev)

### Development (Required when NODE_ENV=development)

- `BOT_TOKEN_DEV` - Telegram bot token for development/testing (required in dev mode)
- `BOT_USERNAME_DEV` - Development bot username (required in dev mode)
  - Bot will fail-fast if not set in development mode
  - Use separate dev bot for testing new features

### Common (Required)

- `NODE_ENV` - Environment: `development` or `production` (required, no default)
- `WEBHOOK_URL` - Public **HTTPS base URL** for your bot server in production.
  - This value is used as `${WEBHOOK_URL}/webhook` in the code:
    - Express mounts the handler at `/webhook`
    - Telegraf sets the webhook to `${WEBHOOK_URL}/webhook`
  - In **development**, you can omit `WEBHOOK_URL` and the bot will run in **polling** mode.
  - In **production**, `WEBHOOK_URL` is **required**; otherwise the server will throw.

### Environment-Based Behavior

- **Development** (`NODE_ENV=development`):
  - Requires `BOT_TOKEN_DEV` and `BOT_USERNAME_DEV` (fail-fast if missing)
  - Runs in polling mode if `WEBHOOK_URL` is not set
  - Typically runs locally via `pnpm dev`

- **Production** (`NODE_ENV=production`):
  - Requires `BOT_TOKEN` and `BOT_USERNAME` (no fallback)
  - Requires `WEBHOOK_URL` (HTTPS)
  - Typically runs in Docker container on VPS

## Usage

### Inline Queries

Type `@theWallBoycott_bot <url>` in any chat to get instant results.

### Direct Messages

Send a URL directly to the bot in a private chat.

### Group Mentions

Mention the bot (`@theWallBoycott_bot`) in a group message containing a URL.

## Error Handling Philosophy

This bot follows a **fail-fast** philosophy:

- **No fallbacks**: If something fails, an error is thrown immediately
- **No silent failures**: All errors are logged and propagated
- **Strict validation**: Invalid inputs throw errors, no default values
- **Explicit errors**: Error messages clearly indicate what went wrong

## Development

### Local Development (No Docker)

Development runs locally with hot reload - no Docker needed:

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build

# Run in development mode (with hot reload, polling mode)
pnpm dev
```

### Development Bot Setup

1. Create a separate dev bot via [@BotFather](https://t.me/botfather) (required)
2. Set `BOT_TOKEN_DEV` and `BOT_USERNAME_DEV` in `.env`
3. Set `NODE_ENV=development` (required)
4. Run `pnpm dev` - bot will use dev token

This allows you to test new features without affecting production users.

## Docker (Production Only)

Docker is used for production deployment only. Development runs locally via `pnpm dev` (no Docker).

### Quick Start

```bash
# Build production image (from monorepo root)
pnpm docker:bot:build

# Or from telegram-bot directory
cd packages/telegram-bot
pnpm docker:build

# Run production container
pnpm docker:run

# View logs
pnpm docker:logs

# Stop container
pnpm docker:stop

# Clean up
pnpm docker:clean
```

### Docker Compose

The project uses `docker-compose.yml` which automatically reads `PORT` and other variables from `.env.prod`:

```bash
# From packages/telegram-bot directory:

# Build and run
docker compose up -d --build

# Or separately:
docker compose build
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose stop

# Stop and remove
docker compose down
```

**Note**: Docker Compose automatically reads `.env.prod` and substitutes `${PORT}` in the compose file. No manual PORT extraction needed!

### Docker Deployment Guide

For detailed VPS deployment instructions, including Docker installation, reverse proxy setup with lighttpd/Apache, and troubleshooting, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md).

## Troubleshooting

- **Bot not responding**: Check that `BOT_TOKEN` is correct and bot is started
- **Database errors**: Ensure `packages/telegram-bot/db/ALL.json` exists and is valid
- **Webhook errors**: Verify `WEBHOOK_URL` is accessible and HTTPS is enabled
- **Port conflicts**: Change `PORT` in your `.env.dev` or `.env.prod` file if the port is already in use

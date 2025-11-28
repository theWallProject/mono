# Telegram Bot Package

Telegram bot that checks URLs against The Wall database to determine if links are safe or flagged.

## Features

- **Inline queries**: Check URLs by typing `@botname <url>` in any chat
- **Direct messages**: Send URLs directly to the bot in private chat
- **Group mentions**: Mention the bot in groups with a URL to check it

## Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Telegram bot token from [@BotFather](https://t.me/botfather)

### Manual Setup Steps

1. **Create Telegram Bot**:

   - Open [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` command
   - Choose a name for your bot
   - Choose a username (must end in `bot`, e.g., `thewall_bot`)
   - **Save the BOT_TOKEN** provided by BotFather
   - Note your bot's username (e.g., `thewall_bot`)

2. **Configure Environment Variables**:

   - Copy `.env.example` to `.env` (if not blocked by gitignore)
   - Fill in your values:
     ```env
     BOT_TOKEN=your_bot_token_here
     BOT_USERNAME=your_bot_username_here
     PORT=3004
     NODE_ENV=development
     ```

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
   pnpm start
   ```

## Environment Variables

### Required

- `BOT_TOKEN` - Telegram bot token from BotFather
- `BOT_USERNAME` - Your bot's username (for mention detection)

### Optional

- `NODE_ENV` - Environment: `development` or `production` (default: `development`)
- `WEBHOOK_URL` - Webhook URL for production (if not set, uses polling in development)

### Required

- `PORT` - Server port (no default, must be set)

## Usage

### Inline Queries

Type `@your_bot_name <url>` in any chat to get instant results.

### Direct Messages

Send a URL directly to the bot in a private chat.

### Group Mentions

Mention the bot (`@your_bot_name`) in a group message containing a URL.

## Error Handling Philosophy

This bot follows a **fail-fast** philosophy:

- **No fallbacks**: If something fails, an error is thrown immediately
- **No silent failures**: All errors are logged and propagated
- **Strict validation**: Invalid inputs throw errors, no default values
- **Explicit errors**: Error messages clearly indicate what went wrong

## Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build

# Run in development (with hot reload)
pnpm dev
```

## Docker

```bash
# Build (PORT must be provided as build arg)
docker build --build-arg PORT=3004 -t telegram-bot .

# Run (PORT must be set in .env file or via -e flag)
docker run -p 3004:3004 --env-file .env telegram-bot

# Or specify port explicitly
docker run -p 3004:3004 -e PORT=3004 --env-file .env telegram-bot
```

## Troubleshooting

- **Bot not responding**: Check that `BOT_TOKEN` is correct and bot is started
- **Database errors**: Ensure `packages/telegram-bot/db/ALL.json` exists and is valid
- **Webhook errors**: Verify `WEBHOOK_URL` is accessible and HTTPS is enabled
- **Port conflicts**: Change `PORT` if 3004 is already in use

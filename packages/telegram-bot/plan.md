# Telegram Bot Package Implementation Plan

## Overview

Create a new `packages/telegram-bot` package that supports inline queries, direct messages, and group mentions. The bot uses shared URL checking logic from common package to validate URLs and return bot-friendly results. All bot-specific code uses "Bot" suffix in naming.

**Coding Style Requirements:**

- **STRICT TypeScript**: No `any`, strict null checks, explicit types everywhere
- **FAIL FAST AND HARD**: Throw errors immediately, no silent failures, no fallbacks
- **NO HACKY FALLBACKS**: If something fails, throw an error. No default values, no try-catch swallowing errors

## Package Structure

```
packages/telegram-bot/
├── src/
│   ├── index.ts              # Main entry point (Express + Telegraf)
│   ├── bot.ts                # Telegram bot setup and handlers
│   ├── urlCheckerBot.ts      # Bot-specific URL checking wrapper
│   ├── urlExtractorBot.ts    # Extract URLs from message text
│   ├── formattersBot.ts      # Format results for Telegram messages
│   ├── messagesBot.ts        # Bot message templates
│   └── typesBot.ts           # Bot-specific TypeScript types
├── db/
│   └── ALL.json              # Database file (copied from addon)
├── Dockerfile
├── .dockerignore
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Implementation Steps (Committable Order)

### Step 1: Manual Setup - Environment Variables

**Commit**: `setup: add telegram-bot package structure and env setup`

**Manual Steps Required:**

1. Create Telegram bot via [@BotFather](https://t.me/botfather):

   - Send `/newbot` command
   - Choose a name for your bot
   - Choose a username (must end in `bot`, e.g., `thewall_bot`)
   - **Save the BOT_TOKEN** provided by BotFather
   - Get bot username (e.g., `thewall_bot`) for mention detection

2. Create `.env` file in `packages/telegram-bot/`:

   ```env
   BOT_TOKEN=your_bot_token_here
   BOT_USERNAME=your_bot_username_here
   PORT=3000
   NODE_ENV=development
   ```

3. Verify environment variables are set (will be validated in code)

**Files to create:**

- `packages/telegram-bot/.env.example` - Template with all required vars
- `packages/telegram-bot/.gitignore` - Ignore `.env` file

### Step 2: Package Structure and TypeScript Config

**Commit**: `feat: setup telegram-bot package with strict TypeScript config`

- Create `packages/telegram-bot/package.json` with dependencies
- Create `packages/telegram-bot/tsconfig.json` with strict settings:

  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      "noUncheckedIndexedAccess": true
    }
  }
  ```

- Create basic folder structure
- Update root `package.json` with build script

### Step 3: Environment Validation

**Commit**: `feat: add strict environment variable validation`

- Create `src/configBot.ts` with fail-fast validation:

  ```typescript
  // Throw immediately if env vars are missing
  export const BOT_TOKEN: string =
    process.env.BOT_TOKEN ??
    (() => {
      throw new Error("BOT_TOKEN environment variable is required");
    })();

  export const BOT_USERNAME: string =
    process.env.BOT_USERNAME ??
    (() => {
      throw new Error("BOT_USERNAME environment variable is required");
    })();
  ```

- No defaults, no fallbacks - fail immediately if missing

### Step 4: Extract Core Logic to Common Package

**Commit**: `refactor: extract checkUrl and getSelectorKey to common package`

**In `packages/common/src/index.ts`:**

- Extract `checkUrl(url: string, database: FinalDBFileType[]): UrlCheckResult | undefined`
- Move `getSelectorKey()` function from addon
- Create `UrlCheckResult` type (platform-agnostic, no `isDismissed`)
- Update addon to use shared `checkUrl()` (separate commit in addon)

### Step 5: Bot Types

**Commit**: `feat: add strict TypeScript types for bot`

- Create `src/typesBot.ts` with strict types
- No `any` types allowed
- Explicit return types on all functions

### Step 6: URL Extractor

**Commit**: `feat: implement URL extraction with strict validation`

- Create `src/urlExtractorBot.ts`
- Function: `extractUrlFromTextBot(text: string): string | null`
- Strict regex patterns, no fallbacks
- If URL format is invalid, return `null` (don't try to fix it)
- Throw on unexpected errors (no silent failures)

### Step 7: URL Checker Wrapper

**Commit**: `feat: implement bot URL checker wrapper`

- Create `src/urlCheckerBot.ts`
- Function: `checkUrlForBot(url: string): UrlCheckResult | undefined`
- Load ALL.json at startup, throw if file missing
- Cache database in memory, throw if database is empty
- No fallbacks - fail if database can't be loaded

### Step 8: Message Formatters

**Commit**: `feat: implement message formatters with strict types`

- Create `src/formattersBot.ts`
- Functions: `formatResultForBot()`, `formatReasonsForBot()`, `formatHintForBot()`, `formatInlineResultForBot()`, `formatMessageReplyForBot()`
- Strict type checking on all inputs
- Throw if result type is unexpected (exhaustive checks)
- No default messages - every case must be handled explicitly

### Step 9: Message Templates

**Commit**: `feat: add bot message templates`

- Create `src/messagesBot.ts`
- Define all message strings as constants
- Type-safe message templates
- No string concatenation without validation

### Step 10: Bot Handlers - Inline Queries

**Commit**: `feat: implement inline query handler`

- Create `src/bot.ts` with `handleInlineQueryBot()`
- Extract URL from query (fail if invalid)
- Check URL, format result
- Return inline result or throw on error
- No silent failures

### Step 11: Bot Handlers - Direct Messages

**Commit**: `feat: implement direct message handler`

- Add `handleMessageBot()` to `src/bot.ts`
- Extract URL from message text
- If no URL found, send help message (explicit, not fallback)
- Check URL and reply with formatted result
- Throw on errors, don't catch and ignore

### Step 12: Bot Handlers - Group Mentions

**Commit**: `feat: implement group mention handler`

- Add `handleMentionBot()` to `src/bot.ts`
- Detect bot mention in group messages
- Extract URL, check, and reply
- Fail fast if bot username doesn't match

### Step 13: Bot Setup and Initialization

**Commit**: `feat: setup Telegraf bot with all handlers`

- Create `createBot()` function
- Create `setupBotHandlers()` function
- Register all handlers
- Validate bot token before creating bot instance
- Throw if bot creation fails

### Step 14: Express Server

**Commit**: `feat: implement Express server with webhook support`

- Create `src/index.ts`
- Set up Express with strict error handling
- Health check endpoint (`/health`)
- Webhook endpoint for Telegram
- Polling fallback only if webhook URL not provided (explicit, not hacky)
- Throw on server startup errors

### Step 15: Database Integration

**Commit**: `feat: load and validate database file`

- Copy `ALL.json` from addon to `packages/telegram-bot/db/`
- Load database at startup in `urlCheckerBot.ts`
- Validate database structure (throw if invalid)
- Cache in memory, throw if empty
- Add build script to copy database file

### Step 16: Docker Configuration

**Commit**: `feat: add Docker configuration`

- Create `Dockerfile` with multi-stage build
- Create `.dockerignore`
- Environment variable validation in Docker
- Fail build if required files missing

### Step 17: Documentation

**Commit**: `docs: add README with setup instructions`

- Create `README.md` with:
  - Setup instructions
  - Environment variable requirements
  - Usage examples
  - Error handling expectations
  - Fail-fast philosophy

### Step 18: Root Package Updates

**Commit**: `chore: update root package.json with bot build script`

- Add build script for telegram-bot
- Verify workspace configuration

## Error Handling Philosophy

### Fail Fast Examples:

**BAD (Fallback):**

```typescript
const token = process.env.BOT_TOKEN || "default-token"; // NO!
const url = extractUrl(text) || "https://example.com"; // NO!
try {
  checkUrl(url);
} catch {
  return "Error occurred"; // NO!
}
```

**GOOD (Fail Fast):**

```typescript
const token: string =
  process.env.BOT_TOKEN ??
  (() => {
    throw new Error("BOT_TOKEN is required");
  })();

const url = extractUrl(text);
if (!url) {
  throw new Error(`No valid URL found in text: ${text}`);
}

const result = checkUrl(url); // Let it throw if it fails
```

## Testing Strategy

- Unit tests for each function with strict type checking
- Test error cases - verify errors are thrown, not swallowed
- Test edge cases - verify no fallbacks are used
- Integration tests for bot handlers
- Fail tests if any `any` types are found

## Shared Code Architecture

### Extract to `@theWallProject/common`:

- `checkUrl(url: string, database: FinalDBFileType[]): UrlCheckResult | undefined`
- `getSelectorKey(domain: SpecialDomains, url?: string): LinkField`
- `UrlCheckResult` type (platform-agnostic)

### In `packages/telegram-bot/src/urlCheckerBot.ts`:

```typescript
import {checkUrl} from "@theWallProject/common";
import ALL from "../db/ALL.json";
import type {FinalDBFileType, UrlCheckResult} from "@theWallProject/common";

// Load database at module level, throw if missing
const database: FinalDBFileType[] = ALL as FinalDBFileType[];
if (database.length === 0) {
  throw new Error("Database is empty");
}

export function checkUrlForBot(url: string): UrlCheckResult | undefined {
  if (!url || typeof url !== "string") {
    throw new Error(`Invalid URL: ${url}`);
  }
  return checkUrl(url, database);
}
```

## Key Files to Reference

### From Addon Package:

- `packages/addon/src/storage.ts` - URL checking logic (reference for extraction)
- `packages/addon/src/types.ts` - UrlTestResult type (reference)
- `packages/addon/locales/en/messages.json` - Message templates (reference)

### From Common Package:

- `packages/common/src/index.ts` - CONFIG, getMainDomain, APIListOfReasons, types

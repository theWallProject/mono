# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Wall is a monorepo containing a browser extension, Telegram bot, data scraper, and shared common library. The project uses pnpm workspaces with packages under `@theWallProject/*` scope.

## What This Project Does

The Wall helps users identify companies with Israeli connections through:

1. **Database of companies categorized by relationship to Israel:**
   - `h` (HeadQuarter), `f` (Founder), `i` (Investor), `u` (URL)
   - BDS categories: `BDS_PRIO` (Consumer boycott priority), `BDS_GRASS` (Grassroots organic), `BDS_PRESSURE` (Pressure targets)

2. **Browser Extension**: Monitors websites, social media profiles (LinkedIn, Facebook, Twitter/X, Instagram, GitHub, YouTube, TikTok, Threads), and job listings. Shows visual warnings and suggests alternatives.

3. **Telegram Bot**: URL/company checking via inline queries

4. **Data Pipeline**: Aggregates from Crunchbase, BuyIsraeliTech, and manual sources

The extension uses different strategies: full-page overlays for direct visits, inline filtering for feeds (e.g., LinkedIn jobs), dismissible notifications.

## Essential Commands

```bash
# Build (must follow dependency order: common → scrapper → addon → telegram-bot)
pnpm build                      # All packages
pnpm build:common              # Must build first
pnpm build:chrome              # Chrome-specific addon

# Development
pnpm dev                       # Addon dev mode

# Testing
pnpm test:addon                # All addon tests (requires built extension)
pnpm test:addon:e2e            # E2E tests only

# Data Pipeline
pnpm data                      # Regenerate database + format + manual overrides (interactive)
# For non-interactive regeneration (useful after editing MANUAL.json or manualAdditions.ts):
cd packages/scrapper && pnpm exec ts-node src/tasks/regenerate_db.ts

# Linting & Commits
pnpm lint                      # Check all
pnpm lint:fix                  # Auto-fix
pnpm commit                    # VibElint commit workflow (required by hooks)

# Telegram Bot
pnpm bot:dev                   # Development (polling)
pnpm bot:deploy                # Deploy to production
```

## Architecture

### Package Dependencies

```
common (base - pure functions, schemas)
  ↑
  ├── addon (Plasmo browser extension)
  ├── scrapper (data pipeline)
  └── telegram-bot (Telegraf + Express)
```

All use `workspace:*` dependencies. Common must build first.

### Common Package

**Core responsibility:** Platform-agnostic business logic and type definitions.

**Key exports:**

- `FinalDBFileSchema` - Zod schema (source of truth for ALL.json)
- URL matching: `findMatchingRule()`, `extractSelector()`, `findInDatabaseBySelector/Domain()`
- Link field types: `ws`, `li`, `fb`, `tw`, `ig`, `gh`, `ytp`, `ytc`, `tt`, `th`

**Pattern:** Pure functions only, no I/O. Build generates JSON schema from Zod, validates ALL.json against it.

### Addon Package

**Framework:** Plasmo (Chrome/Firefox/Edge)

**Entry points:**

- `background.ts` - Service worker, message routing, tab events
- `content.tsx` - Content script, rule-based routing to processors

**Rule-based processing (discriminated union):**

- `urlOnly` - Banner overlay (default)
- `urlDomFull` - Full page blocking (YouTube channels)
- `urlDomInline` - Inline scanning (LinkedIn job feeds)

Rules in `src/rules/config.ts`, processors in `src/rules/processors/`.

**DOM Scanner:** MutationObserver + IntersectionObserver for dynamic content. Queues with 1s debounce, sequential checking (100ms delays), caches results.

**Storage:**

- `chrome.storage.session` - Temporary dismissals (1 month)
- `chrome.storage.local` - Persistent settings
- Abstraction: `storageHelpers.ts`

**Data:** `src/db/ALL.json` (2.8MB)

**Testing:** Serial execution (prevents storage race conditions). E2E requires `pnpm build:chrome` first. Test mode: `window.TEST_MODE` or `process.env.TEST_MODE`.

### Scrapper Package

**Purpose:** Generate ALL.json from Crunchbase, BuyIsraeliTech, manual additions/overrides.

**Pipeline:** 10 stages in `src/index.ts` - scrap, merge, extract social/websites, validate schema. Manual data in `/manual_resolve/manualAdditions` and `/manual_resolve/manualOverrides`.

**Output:** `results/4_final/ALL.json` (copied to addon's `src/db/`)

### Telegram Bot

**Framework:** Telegraf + Express

**Modes:** Webhook (production, needs `WEBHOOK_URL`) or Polling (dev)

**Handlers:** `urlCheckerBot()`, `handleInlineQueryBot()`, `urlExtractorBot()`

## Translations

The addon supports multiple languages: English, Arabic, Indonesian, Malay, Bengali, French, Dutch, Simplified Chinese, Traditional Chinese.

**Workflow for adding/updating translations:**

1. Edit `packages/addon/TRANSLATIONS/DB.ts` - Add new translation keys with all language variants
2. Run `pnpm run trans` (in addon package) or `cd packages/addon && pnpm run trans`
3. This generates locale files in `packages/addon/locales/{lang}/messages.json`

**Key files:**

- `packages/addon/TRANSLATIONS/DB.ts` - Source of truth for all translations
- `packages/addon/TRANSLATIONS/generate.ts` - Script that generates locale files
- `packages/addon/src/helpers/i18n-keys.ts` - TypeScript types for translation keys

**Using translations in code:**

```typescript
import { getI18nMessage } from "~/helpers/i18n-keys"

// Type-safe: getI18nMessage("modalShowAlternatives")
// With substitutions: getI18nMessage("reasonFounder", [companyName])
```

## Hints System

Softer warnings for companies/services without Israeli connections (e.g., media bias).

**Hints vs. Regular:**

- Regular: Israeli connections (h/f/i/b/u reasons)
- Hints: Alternative suggestions (news sites, AI tools), empty reasons array

**Database fields:**

- `isHint: true` - Flag
- `hintText` - Display message
- `hintUrl` - Alternative link (supports `{{url}}` placeholder)
- `hintCompanyId` - Company ID for company-level dismissal (e.g., "newscord_media_bias", "thaura_ai_chat")
- `hint_android_id` / `android_app_ids` - Android apps
- Link fields (`ws`, `li`, `fb`, etc.) - Strings in ALL.json, arrays in source

**Multi-value hints - Split Design:**

- **Source format** (`hints/*.ts`): Arrays for compression (e.g., `ws: ["bbc.com", "bbc.co.uk"]`)
- **Pipeline processing** (`gen_static.ts`): Splits arrays into separate entries
- **Final ALL.json**: Each domain/profile gets its own entry with string values
- **Why**: Simplifies intermediate pipeline, each entry maps 1:1 to a URL
- **Schema/Functions**: Support both strings and arrays for flexibility

**Special case:** All `.il` domains auto-generate hints in `storage.ts:createIlHint()`

**UI:** Less aggressive, dismissible notifications, permanently dismissible via storage.

**Common use cases:** News sites → Newscord, AI chat → Thaura.ai

**Type safety:** `UrlCheckResult` is discriminated union based on `isHint` property.

**Hint Dismissal Behavior:**

- **Company-Level Dismissal**: Hints with `hintCompanyId` are dismissed company-wide. Dismissing BBC also dismisses CNN, NYT, etc. (all share "newscord_media_bias")
  - Storage key: `hint_company_dismissed_perm_{hintCompanyId}`
  - Example: `hint_company_dismissed_perm_newscord_media_bias`
- **Per-Hint-ID Dismissal**: Hints without `hintCompanyId` (e.g., .il domains) are dismissed individually
  - Storage key: `hint_dismissed_perm_{hintId}`
  - Example: `hint_dismissed_perm_hint_ws_BBC_0`
- **Backward Compatibility**: Check both storage keys - per-hint-ID first (for old dismissals), then company-level
- **Company Groupings**:
  - `newscord_media_bias`: All news site hints (BBC, CNN, Fox News, NYT, WSJ, etc.)
  - `thaura_ai_chat`: All AI chat hints (ChatGPT, Claude, Grok)
  - `microsoft_bds_prio`: Microsoft BDS consumer boycott priority hint

## Important Patterns

### Schema-Driven Development

Zod schema is source of truth. Edit in `packages/common/src/index.ts` → build runs `generate-schema` → `validate-schema` checks ALL.json → build fails if invalid.

### Adding New URL Rules

1. Add regex to `packages/common/src/index.ts` API endpoint rules
2. Add rule config to `packages/addon/src/rules/config.ts`
3. Create processor in `packages/addon/src/rules/processors/`
4. Add tests to `packages/common/src/index.test.ts`

### Content Script Lifecycle

1.5s delay before scanner start (prevents blocking page render). Debounced navigation (1.5s). Cleanup on navigation.

### Exhaustive Type Checking with Discriminated Unions

```typescript
switch (rule.type) {
  case "urlOnly":
    return processUrlOnly(rule)
  case "urlDomFull":
    return processUrlDomFull(rule)
  case "urlDomInline":
    return processUrlDomInline(rule)
  default:
    const _exhaustive: never = rule // Compile error if case missed
}
```

### Code Quality

No hacks. No random fallbacks. Only highest quality TypeScript. Ask questions if unsure.

### Always Update Tests, Docs, and Fix Issues

**CRITICAL:** After making ANY code changes:

1. Update tests to cover new functionality
2. Update JSDoc comments and inline documentation
3. Run `pnpm test` (or package-specific tests) to ensure all tests pass
4. Run `pnpm lint` and fix any linting errors
5. Fix any TypeScript errors
6. If schema changed: run `pnpm build:common` to regenerate schema and validate

Never skip these steps. Broken tests, lint errors, or TypeScript errors are unacceptable.

### Path Aliases

Addon uses `~*` → `./src/*`

## Key Files

- `packages/common/src/index.ts` - Schemas, URL matching logic
- `packages/addon/src/rules/config.ts` - Rule definitions
- `packages/addon/src/background.ts` - Service worker
- `packages/addon/src/content.tsx` - Content script entry
- `packages/scrapper/src/index.ts` - Pipeline orchestration
- `packages/scrapper/results/4_final/ALL.json` - Master database

Welcome to theWall.
This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Why?

The plugin is a simple black-list based detector of websites enabeling the worlds worst killing machine - the Israeli government.
This is not a tool to spread hate, it aims to spread knowledge. Users are free to proceed to those websites after knowing.

## How it works

The plugin checks the URL of the current tab against a verified list of domains. If the domain is found in the list, the plugin displays a popup.

For most domains, a simple check against the domain is enough. However, for "special" websites like Facebook, LinkedIn, Twitter, Instagram, and GitHub. We check page Ids.
The source of this data is crunchbase so it's 100% accurate.

## Getting Started

First, run the development server:

```bash
npm i
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

## Making production build

Run the following:

```bash
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Testing

The extension includes comprehensive end-to-end tests using Playwright and Vitest.

### Prerequisites

1. Build the extension first:

   ```bash
   pnpm build:chrome
   ```

2. Ensure you have internet connection (tests use real URLs from database)

### Running Tests

```bash
# Run all tests
pnpm test

# Run only E2E tests
pnpm test:e2e

# Watch mode
pnpm test:watch

# Test UI (interactive)
pnpm test:ui

# Debug mode
pnpm test:debug

# Coverage report
pnpm test:coverage-report
```

### Test Structure

Tests are located in `tests/e2e/` and cover:

- Popup functionality
- Banner display on flagged URLs
- Hints system (toast notifications)
- Content script injection
- Background script functionality
- Storage operations
- Multi-tab scenarios
- Fresh install vs settings persistence
- All rule types

### Test Mode

All tracking code is automatically disabled during tests. The `track()` function logs instead of sending analytics when `TEST_MODE=true`.

### Random URL Selection

Tests use random URLs from the database to ensure comprehensive coverage over multiple runs. Coverage tracking ensures all unique cases are tested.

### Storage Management

Tests handle both fresh install scenarios (empty storage) and existing user scenarios (with settings). See `tests/utils/storage.ts` for utilities.

For detailed testing documentation, see [tests/README.md](tests/README.md).

## Internationalization (i18n)

### Translation Keys

**⚠️ IMPORTANT: ALL translation keys in the addon package MUST use the `I18nMessageKey` type.**

- **Never use plain strings** for `chrome.i18n.getMessage()` calls
- **Always use** the typed `getI18nMessage()` helper function from `src/helpers/i18n-keys.ts`
- The `I18nMessageKey` type is automatically derived from `locales/en/messages.json`, ensuring type safety

### Usage

```typescript
import { getI18nMessage } from "~helpers/i18n-keys"

// ✅ Correct - uses typed I18nMessageKey
const message = getI18nMessage("extensionName")
const messageWithSubs = getI18nMessage("reasonFounder", [companyName])

// ❌ Wrong - plain string, no type safety
const message = chrome.i18n.getMessage("extensionName")
```

### Reason Keys

For reason-related translations, use `getReasonI18nKey()` to map reason codes to i18n keys:

```typescript
import { getI18nMessage } from "~helpers/i18n-keys"
import { getReasonI18nKey } from "~helpers/reasonMap"

const reasonKey = getReasonI18nKey(reason) // Returns ReasonI18nKey
const message = getI18nMessage(reasonKey, [companyName])
```

### Adding New Translation Keys

1. Add the key to `TRANSLATIONS/DB.ts`
2. Run `pnpm run trans` to regenerate locale files
3. The `I18nMessageKey` type will automatically include the new key (no code changes needed)
4. Use `getI18nMessage()` with the new key - TypeScript will ensure it exists

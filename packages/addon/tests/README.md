# E2E Testing

End-to-end tests for The Wall browser extension using Playwright and Vitest.

## Quick Start

```bash
# Build extension first
pnpm build:chrome

# Run all tests
pnpm test

# Run E2E tests only
pnpm test:e2e

# Watch mode
pnpm test:watch

# Interactive UI
pnpm test:ui
```

## Prerequisites

- Extension built: `pnpm build:chrome`
- Internet connection (tests use real URLs from database)

## Test Structure

```
tests/
├── e2e/              # Test suites
├── fixtures/         # Test data (test-urls.ts, coverage-data.json)
└── utils/            # Utilities (browser, extension, storage, test-mode)
```

## Writing Tests

### Basic Template

```typescript
import type { BrowserContext } from "playwright"
import { afterAll, beforeAll, describe, it } from "vitest"

import { getRandomUrls } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"

describe("My Feature", () => {
  let context: BrowserContext
  let extensionId: string

  beforeAll(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
    extensionId = result.extensionId
  })

  // Browser cleanup is handled globally in test-mode.ts

  it("should work", async () => {
    const testUrl = getRandomUrls({ count: 1 })[0]
    const page = await context.newPage()
    try {
      await page.goto(testUrl.url)
      // Test code
    } finally {
      await page.close()
    }
  })
})
```

### Common Utilities

**Random URLs:**

```typescript
const urls = getRandomUrls({
  count: 5,
  ruleType: "urlOnly",
  isHint: false
})
```

**Storage:**

```typescript
import { simulateExistingUser, simulateFreshInstall } from "../utils/storage"

await simulateFreshInstall(context, extensionId)
await simulateExistingUser(context, extensionId, {
  hintsDisabled: true,
  dismissedHints: ["hint1"]
})
```

**Extension Interaction:**

```typescript
import { isBannerDisplayed, isHintsToastShown, navigateToUrl } from "../utils/extension"

const success = await navigateToUrl(page, url)
const hasBanner = await isBannerDisplayed(page)
const hasHint = await isHintsToastShown(page)
```

## Debugging

- **Test UI**: `pnpm test:ui` - Interactive browser UI
- **Debug mode**: `pnpm test:debug` - Node.js inspector
- **Browser visible**: Tests run non-headless by default
- **Pause execution**: Add `await page.pause()` in test
- **Browser stays open on failure**: If any test fails, the browser remains open for debugging - press Ctrl+C to stop

## Troubleshooting

| Issue                 | Solution                                    |
| --------------------- | ------------------------------------------- |
| Extension not loading | Run `pnpm build:chrome` first               |
| Tests timing out      | Increase timeout in `vitest.config.ts`      |
| Storage issues        | Verify extension ID and Chrome storage APIs |
| URL selection fails   | Check `src/db/ALL.json` exists              |

## Test Mode

Tracking is automatically disabled during tests. The `track()` function logs instead of sending analytics when `TEST_MODE=true`.

## Coverage

Coverage data in `tests/fixtures/coverage-data.json` tracks tested URLs by rule type and reason. Generate report:

```bash
pnpm test:coverage-report
```

## Best Practices

1. Always clean up pages/browsers in `afterAll`
2. Use random URLs for comprehensive coverage
3. Test both fresh install and existing user scenarios
4. Fail fast with clear error messages
5. Keep tests independent and isolated

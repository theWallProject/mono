---
name: Addon E2E Testing Setup
overview: Set up comprehensive end-to-end testing for the Plasmo-based browser extension using Playwright and Vitest, testing all functionality in real Chrome instances with multiple tabs. Includes test mode configuration (tracking disabled), random URL selection with coverage tracking, storage management for fresh install vs settings scenarios, and improved ESLint setup.
todos:
  - id: install-deps
    content: Install Playwright and Vitest dependencies in addon package
    status: pending
  - id: setup-test-mode
    content: Set up test mode configuration to disable tracking (log instead) in helpers.ts
    status: pending
    dependencies:
      - install-deps
  - id: create-config
    content: Create Vitest configuration for E2E tests with Playwright integration and test mode setup
    status: pending
    dependencies:
      - install-deps
  - id: create-browser-utils
    content: Create browser utility functions using Playwright launchPersistentContext for Chrome extension
    status: pending
    dependencies:
      - install-deps
  - id: create-extension-utils
    content: Create extension utility functions for interacting with popup and content
    status: pending
    dependencies:
      - create-browser-utils
  - id: create-storage-utils
    content: Create storage utility functions for managing fresh install vs settings scenarios
    status: pending
    dependencies:
      - create-extension-utils
  - id: create-test-fixtures
    content: Create test fixtures with random URL selection from database ensuring coverage
    status: pending
  - id: create-coverage-tracking
    content: Create coverage tracking system for URL testing with persistence
    status: pending
    dependencies:
      - create-test-fixtures
  - id: update-eslint
    content: Update ESLint configuration for test files and improve setup
    status: pending
    dependencies:
      - install-deps
  - id: implement-popup-tests
    content: Implement popup functionality tests with test mode verification
    status: pending
    dependencies:
      - create-extension-utils
      - create-test-fixtures
      - setup-test-mode
  - id: implement-banner-tests
    content: Implement banner display tests with random URLs
    status: pending
    dependencies:
      - create-extension-utils
      - create-test-fixtures
      - setup-test-mode
  - id: implement-hints-tests
    content: Implement hints system tests with random URLs
    status: pending
    dependencies:
      - create-extension-utils
      - create-test-fixtures
      - setup-test-mode
  - id: implement-content-script-tests
    content: Implement content script tests
    status: pending
    dependencies:
      - create-extension-utils
      - create-test-fixtures
      - setup-test-mode
  - id: implement-background-tests
    content: Implement background script tests including fresh install scenarios
    status: pending
    dependencies:
      - create-extension-utils
      - create-test-fixtures
      - setup-test-mode
      - create-storage-utils
  - id: implement-multi-tab-tests
    content: Implement multi-tab scenario tests with random URLs
    status: pending
    dependencies:
      - create-extension-utils
      - create-test-fixtures
      - setup-test-mode
  - id: implement-storage-tests
    content: Implement storage operation tests with fresh install and persistence scenarios
    status: pending
    dependencies:
      - create-extension-utils
      - create-test-fixtures
      - create-storage-utils
      - setup-test-mode
  - id: implement-fresh-install-tests
    content: Implement fresh install test suite
    status: pending
    dependencies:
      - create-storage-utils
      - create-extension-utils
  - id: implement-settings-persistence-tests
    content: Implement settings persistence test suite
    status: pending
    dependencies:
      - create-storage-utils
      - create-extension-utils
  - id: implement-rules-tests
    content: Implement rule type tests with random URL selection
    status: pending
    dependencies:
      - create-extension-utils
      - create-test-fixtures
      - setup-test-mode
  - id: update-package-scripts
    content: Update package.json scripts for test commands including coverage reporting
    status: pending
    dependencies:
      - implement-popup-tests
      - implement-banner-tests
      - implement-hints-tests
      - create-coverage-tracking
  - id: update-documentation
    content: Update README files with comprehensive testing documentation including test mode, random URLs, storage management, and ESLint
    status: pending
    dependencies:
      - update-package-scripts
      - update-eslint
---

# Browser Extension E2E Testing Implementation Plan

## Overview

Implement end-to-end testing for the Plasmo-based browser extension using Playwright (with Vitest as test runner) to test all functionality in real Chrome instances with multiple tabs. The testing framework will verify popup UI, banner display, hints system, content script behavior, background script functionality, and storage operations. Includes test mode configuration to disable tracking, random URL selection from database with coverage tracking, and proper handling of fresh install vs settings persistence scenarios.

## Research Summary

Based on deep research and Plasmo framework analysis:

- **Playwright** is selected as the best test runner for 2024:
  - Superior TypeScript support (native, no additional types needed)
  - Better debugging tools and test UI
  - Excellent Vitest integration (already used in project)
  - More modern API and better error messages
  - Active development and strong community support
  - Works excellently with Chrome extensions via `chromium.launchPersistentContext()`
- **Vitest** is selected as the test runner (already used in common package, excellent TypeScript support, fast, modern)
- **Itero TestBed** (Plasmo's service) is for staging/manual testing, not automated E2E testing
- Extensions require non-headless mode (`headless: false`)
- Must load unpacked extension from build directory (`build/chrome-mv3-prod`)
- Supports multi-tab testing natively via `browser.newPage()` or `context.newPage()`
- Playwright's `launchPersistentContext()` is ideal for extension testing

## User Requirements

- Test all functionality (popup, banner, hints, content script, background, storage, multi-tab)
- Use real flagged URLs from the database (requires internet connection)
- Test runner: Playwright + Vitest (selected as most suitable - modern, TypeScript-native, excellent debugging)
- **Disable tracking code in test mode** (log instead of sending analytics)
- **Random URL selection** from database every run, ensuring coverage of all unique cases
- **Handle storage-dependent features** (fresh install vs settings persistence)
- **Improve ESLint setup** and update documentation

## Implementation Steps

### 1. Install Testing Dependencies

**File**: `packages/addon/package.json`

- Add `@playwright/test` as dev dependency
- Add `vitest` (if not already present) for test runner integration
- Add `@vitest/ui` for test UI (optional)
- Note: Playwright includes TypeScript types, no need for `@types/playwright`

### 2. Set Up Test Mode Configuration

**File**: `packages/addon/src/helpers.ts` (modify)

- Add test mode detection (via `process.env.TEST_MODE` or global flag)
- Modify `track()` function to check test mode and log instead of sending analytics
- Ensure all tracking calls are disabled during tests
- Add test mode logging for debugging (log tracking calls with details)
- Example: `if (process.env.TEST_MODE) { console.log('[TEST] Track:', ...); return; }`

**File**: `packages/addon/tests/utils/test-mode.ts` (new)

- Set up test mode environment variable before tests run
- Configure test mode flags
- Ensure tracking is disabled globally
- Provide test mode helpers and utilities
- Set `process.env.TEST_MODE = 'true'` in test setup

### 3. Create Test Configuration

**File**: `packages/addon/vitest.config.ts`

- Configure Vitest to work with Playwright
- Set up test environment (node environment for E2E tests)
- Configure test file patterns (`tests/e2e/**/*.test.ts`)
- Add extended timeout settings for E2E tests (30-60 seconds per test)
- Configure test setup files to enable test mode
- Set `process.env.TEST_MODE = 'true'` in setupFiles

**File**: `packages/addon/playwright.config.ts` (optional, if using Playwright's test runner directly)

- Configure Playwright for Chrome extension testing
- Set up extension path
- Configure browser context options

### 4. Create Test Utilities

**File**: `packages/addon/tests/utils/browser.ts`

- Helper function to launch Chrome with extension loaded using `chromium.launchPersistentContext()`
- Function to get extension ID from loaded extension
- Helper to wait for extension to be ready
- Cleanup utilities for browser instances
- Helper to get extension popup page URL
- Ensure test mode is enabled before launching

**File**: `packages/addon/tests/utils/extension.ts`

- Helper to get extension popup page
- Helper to interact with extension popup
- Helper to check if banner is displayed
- Helper to check if hints toast is shown
- Helper to interact with storage (via extension context)
- Helper to wait for content script injection

**File**: `packages/addon/tests/utils/storage.ts` (new)

- Helper to backup current storage state
- Helper to restore storage state
- Helper to clear all storage (fresh install simulation)
- Helper to set specific settings (hints disabled, dismissed hints, etc.)
- Helper to verify storage state
- Helper to simulate fresh install (clear all storage)
- Helper to simulate existing user (set common settings)

### 5. Create Test Fixtures with Random URL Selection

**File**: `packages/addon/tests/fixtures/test-urls.ts`

- Load URLs dynamically from database (`src/db/ALL.json`)
- Implement random URL selection for each test run
- Ensure coverage of all unique cases:
  - Different rule types (urlOnly, urlDomFull, urlDomInline)
  - Different domains (social media, regular websites)
  - Different reasons (founder, investor, headquarters, BDS, .il)
  - Hint URLs vs banner URLs
  - Clean URLs (for negative tests)
- Track which URLs have been tested to ensure comprehensive coverage
- Provide helper functions to get random URLs by category/rule type
- Implement coverage tracking to ensure all unique cases are tested over time

**File**: `packages/addon/tests/utils/coverage.ts` (new)

- Track which URLs from database have been tested
- Ensure all unique cases are covered over multiple runs
- Generate coverage report showing tested vs untested URLs
- Implement random selection with coverage tracking
- Log coverage statistics after test runs
- Store coverage data in JSON file for persistence across runs
- Prioritize untested URLs in random selection

### 6. Implement Core Test Suites

**File**: `packages/addon/tests/e2e/popup.test.ts`

Test popup functionality:

- Popup opens correctly
- Settings section displays
- Toggle hints system button works
- Reset dismissed hints button works
- Share buttons work (open correct URLs)
- Donate button works
- Contact button works
- Success messages display correctly
- Verify tracking is disabled (check logs instead of analytics)

**File**: `packages/addon/tests/e2e/banner.test.ts`

Test banner display:

- Banner appears on flagged URLs (random selection)
- Banner shows correct company information
- Banner shows correct reasons
- Share button on banner works
- Dismiss session button works
- Show alternatives button works (if applicable)
- Support Palestine button works
- Report mistake button works
- Donate button on banner works
- Banner dismisses correctly after session dismiss
- Test with random URLs covering all rule types

**File**: `packages/addon/tests/e2e/hints.test.ts`

Test hints system:

- Hints toast appears on hint URLs (random selection)
- Hints toast shows correct text
- Hints toast can be dismissed temporarily
- Hints toast can be dismissed permanently
- Hints system can be disabled globally
- Hints don't show when system is disabled
- Hints don't show when dismissed permanently
- Hints don't show again within 3 days
- Test with random URLs covering different hint scenarios

**File**: `packages/addon/tests/e2e/content-script.test.ts`

Test content script:

- Content script injects correctly
- DOM scanner initializes for urlDomInline rules
- Banner component renders
- URL testing triggers on page load
- URL testing triggers on navigation (SPA)
- Content script handles special URLs correctly

**File**: `packages/addon/tests/e2e/background.test.ts`

Test background script:

- Background script loads correctly
- Tab updates trigger URL testing
- Tab activation triggers URL testing
- Messages are handled correctly
- Storage operations work
- Session storage is cleared on install/startup
- "What's new" page opens on first install (fresh start)
- "What's new" page doesn't open on subsequent runs (with storage)

**File**: `packages/addon/tests/e2e/multi-tab.test.ts`

Test multi-tab scenarios:

- Open multiple tabs with different URLs (random selection)
- Each tab shows correct banner/hint independently
- Tab switching doesn't break functionality
- Dismissal in one tab doesn't affect others
- Storage is shared correctly across tabs

**File**: `packages/addon/tests/e2e/storage.test.ts`

Test storage operations:

- Dismissal storage works correctly
- Hints system state persists
- Dismissed hints tracking works
- Storage cleanup works (old dismissals expire)
- Session storage is cleared appropriately
- Fresh install behavior (no storage)
- Settings persistence across sessions
- Storage isolation between test runs

**File**: `packages/addon/tests/e2e/fresh-install.test.ts` (new)

Test fresh install scenarios:

- Extension behaves correctly on first install (no storage)
- "What's new" page opens on install
- "What's new" page doesn't open on update if already shown
- Default settings are applied correctly
- No dismissed hints exist
- Hints system is enabled by default
- Storage is empty initially
- All features work with default settings

**File**: `packages/addon/tests/e2e/settings-persistence.test.ts` (new)

Test settings-dependent features:

- Hints system toggle persists across sessions
- Dismissed hints persist across sessions
- Dismissal timestamps persist correctly
- Settings changes reflect immediately
- Settings survive browser restart (simulated)
- "What's new" doesn't show again after being shown
- Storage state is maintained correctly

**File**: `packages/addon/tests/e2e/rules.test.ts`

Test different rule types:

- urlOnly rules work correctly (random URLs)
- urlDomFull rules extract URLs correctly (random URLs)
- urlDomInline rules trigger DOM scanning (random URLs)
- Special domains (.il) show hints (random URLs)
- Social media rules (Facebook, LinkedIn, etc.) work (random URLs)
- Ensure coverage of all rule types over multiple runs

### 7. Update ESLint Configuration

**File**: `packages/addon/eslint.config.mjs` (create or update)

- Ensure test files are properly configured
- Add rules for test files (allow console.log in tests)
- Configure import rules for test utilities
- Ensure proper TypeScript support for test files
- Add Playwright-specific linting if needed
- Configure test file patterns (`tests/**/*.test.ts`)
- Allow `describe`, `it`, `expect` globals from Vitest
- Allow `test`, `expect` from Playwright if used

**File**: `packages/addon/.eslintignore` (create or update)

- Ignore test build artifacts
- Ignore Playwright cache directories
- Ensure test files are linted properly
- Ignore coverage reports

### 8. Update Package Scripts

**File**: `packages/addon/package.json`

Add scripts:

- `"test": "vitest"` - Run all tests
- `"test:e2e": "vitest run tests/e2e"` - Run only E2E tests
- `"test:watch": "vitest watch"` - Watch mode
- `"test:ui": "vitest --ui"` - Test UI
- `"test:coverage": "vitest run --coverage"` - Coverage report
- `"test:debug": "vitest --inspect-brk"` - Debug mode
- `"test:coverage-report": "vitest run --coverage && node tests/utils/coverage.ts"` - Generate coverage report

**File**: `package.json` (root)

Add scripts:

- `"test:addon": "pnpm --filter @theWallProject/addon test"` - Run addon tests from root
- `"test:addon:e2e": "pnpm --filter @theWallProject/addon test:e2e"` - Run addon E2E tests

### 9. Update Documentation

**File**: `packages/addon/README.md`

Add testing section:

- Prerequisites for running tests (build extension first)
- How to run tests
- Test structure explanation
- How to write new tests
- Troubleshooting common issues
- Note about requiring internet connection for real URLs
- Test mode configuration explanation
- Random URL selection and coverage tracking
- Storage management (fresh install vs settings)

**File**: `README.md` (root)

Update with testing information:

- Add testing section
- Link to addon testing docs

**File**: `packages/addon/tests/README.md` (new)

Create comprehensive testing documentation:

- Test architecture overview
- How to run tests
- Test file organization
- Writing new tests guide
- Debugging tests
- Playwright + Vitest integration details
- Test mode configuration (tracking disabled)
- Random URL selection and coverage tracking
- Storage management (fresh install vs settings persistence)
- ESLint configuration for tests
- CI/CD integration notes

## File Structure

```
packages/addon/
├── tests/
│   ├── e2e/
│   │   ├── popup.test.ts
│   │   ├── banner.test.ts
│   │   ├── hints.test.ts
│   │   ├── content-script.test.ts
│   │   ├── background.test.ts
│   │   ├── multi-tab.test.ts
│   │   ├── storage.test.ts
│   │   ├── fresh-install.test.ts
│   │   ├── settings-persistence.test.ts
│   │   └── rules.test.ts
│   ├── fixtures/
│   │   ├── test-urls.ts
│   │   └── coverage-data.json (generated)
│   ├── utils/
│   │   ├── browser.ts
│   │   ├── extension.ts
│   │   ├── storage.ts
│   │   ├── test-mode.ts
│   │   └── coverage.ts
│   └── README.md
├── vitest.config.ts
├── playwright.config.ts (optional)
├── eslint.config.mjs (updated)
├── .eslintignore (updated)
└── package.json (updated)
```

## Key Implementation Details

1. **Extension Loading**: Use Playwright's `chromium.launchPersistentContext()` with `args: ['--disable-extensions-except=<extension-path>', '--load-extension=<extension-path>']`
2. **Extension Path**: Load from `build/chrome-mv3-prod` directory (production build)
3. **Extension ID**: Extract from `chrome://extensions` page or from manifest after loading
4. **Popup Access**: Use `chrome-extension://<id>/popup.html` URL
5. **Content Script Testing**: Test in regular web pages, extension injects automatically
6. **Background Script**: Test via message passing and storage APIs
7. **Multi-tab**: Use `context.newPage()` to create multiple tabs within same context
8. **Wait Strategies**: Use Playwright's built-in auto-waiting and custom waits for extension initialization
9. **Vitest Integration**: Use Vitest's `describe` and `it` with Playwright's browser APIs
10. **Test Mode**: Set `process.env.TEST_MODE=true` in test setup, modify `track()` to log instead
11. **Random URL Selection**: Load database, categorize URLs, randomly select ensuring coverage over time
12. **Storage Management**: Clear storage for fresh install tests, set specific values for settings tests
13. **Tracking Disable**: Modify `track()` function in `helpers.ts` to check test mode and log instead
14. **Coverage Tracking**: Track tested URLs in JSON file, prioritize untested URLs in selection
15. **ESLint**: Configure properly for test files, allow console.log in tests, ensure proper globals

## Testing Coverage Goals

- Popup UI: 100% of buttons and interactions
- Banner display: All rule types and scenarios (random URLs)
- Hints system: All states and interactions (random URLs)
- Content script: Injection and DOM scanning
- Background script: Tab monitoring and messaging
- Storage: All operations and edge cases
- Multi-tab: Concurrent scenarios
- Rules: All rule types (urlOnly, urlDomFull, urlDomInline) - random URLs
- Fresh install: All first-run behaviors
- Settings persistence: All settings-dependent features

## Notes

- Tests require a built extension (`pnpm build:chrome` must run first)
- Tests run in non-headless mode for extension compatibility (`headless: false`)
- Tests require internet access for real URLs from database
- Playwright provides excellent debugging with `--debug` flag and UI mode
- Fail-fast philosophy: Tests should fail clearly with helpful error messages
- Playwright's auto-waiting reduces flakiness compared to Puppeteer
- **Tracking**: All tracking code must be disabled in test mode (log instead of send analytics)
- **Random URLs**: Each test run selects random URLs from database, ensuring coverage over time
- **Storage Management**: Tests must handle both fresh install and existing settings scenarios
- **ESLint**: Test files should be properly linted, console.log allowed in tests, proper globals configured
- **Coverage**: Track which URLs have been tested to ensure comprehensive coverage over multiple runs

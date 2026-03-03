# AGENTS.md

This file provides guidance to AI Agents when working with code in this repository.

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
pnpm data                      # Unified data menu (validate, add, delete, quick-verify, AI extract, apply, full pipeline)
# For non-interactive regeneration (useful after editing MANUAL.json or manualAdditions.ts):
cd packages/scrapper && pnpm exec ts-node src/tasks/regenerate_db.ts

# Linting & Commits
pnpm lint                      # Check all
pnpm lint:fix                  # Auto-fix
pnpm commit                    # VibElint commit workflow (required by hooks)

# Telegram Bot
pnpm bot:dev                   # Development (polling)
pnpm bot:deploy                # Deploy to production

# Android App
cd packages/android
pnpm build                     # Debug APK
pnpm build:release             # Release APK (unsigned)
pnpm release                   # Full release workflow (signed APK)
pnpm release:patch             # Bump patch version + release
pnpm release:minor             # Bump minor version + release
pnpm release:major             # Bump major version + release
pnpm clean                     # Clean build artifacts
pnpm lint                      # Run Android lint (MUST pass with zero errors)
pnpm test                      # Run all tests + record screenshots + lint (no emulator needed)
pnpm test:update               # Update screenshot baselines
pnpm test:verify               # Verify screenshots match baselines (CI mode)
pnpm test:compare              # Generate HTML diff report for screenshot changes
pnpm test:screenshots          # Generate fastlane Play Store screenshots for ALL supported languages
pnpm install:prod              # Install release APK to connected device via USB
pnpm validate:metadata         # Validate Play Store metadata
pnpm screenshots               # Alias for test:screenshots
pnpm adb:trigger_scan          # Force trigger background scan
pnpm adb:logcat                # View app logs
```

### Android Build Requirements

The Android app requires:

- **Bash**: Git Bash on Windows, or native bash on macOS/Linux
- **Java 17+**: Auto-detected from Android Studio's bundled JDK, or set `JAVA_HOME`
- **Gradle 9.1.0**: Configured in `gradle/wrapper/gradle-wrapper.properties`
- **Android SDK**: Set `ANDROID_HOME` or configure in `local.properties`

The build scripts auto-detect Android Studio's JDK on Windows (`C:\Program Files\Android\Android Studio\jbr`).

**IMPORTANT**: Always use `pnpm build` from `packages/android` directory instead of running gradlew directly. The pnpm scripts handle environment setup (JAVA_HOME, paths) automatically.

### Android Release Workflow

The Android app uses a streamlined release workflow:

1. **Version management**: `version.properties` tracks VERSION_CODE and VERSION_NAME
2. **Signing**: Configure `keystore.properties` (see `keystore.properties.template`)
3. **Screenshots**: Automatically generated during release (JVM-based, no emulator needed). Can also be run manually with `pnpm test:screenshots`
4. **Release**: Run `pnpm release:patch` (or minor/major) to bump version, generate screenshots, and build signed APK
5. **Output**: Signed APK is placed in `release-output/thewall-v{version}.apk`

**Screenshot generation (JVM-based, all languages):**

- `pnpm test:screenshots` generates 4 phone + 4 tablet screenshots per language
- Auto-discovers languages from `SupportedLanguage.entries` — adding a new language to the enum automatically generates screenshots for it
- Output: `fastlane/metadata/android/{locale}/images/{phone|tablet}Screenshots/{1-4}.png`
- Uses Robolectric + Roborazzi (no emulator needed)
- If the fastlane locale code differs from the Android tag (e.g., `en` → `en-US`), add a mapping to `FASTLANE_LOCALE_MAP` in `FastlaneScreenshotTest.kt`

**First-time setup:**

```bash
# Generate keystore (store safely, NOT in repo)
keytool -genkey -v -keystore ~/.android/thewall-release.keystore -alias thewall -keyalg RSA -keysize 2048 -validity 10000

# Configure project
cp keystore.properties.template keystore.properties
# Edit keystore.properties with your values
```

### Android Strict Linting (MANDATORY)

**CRITICAL: Android lint MUST pass with ZERO errors before any commit or release.**

The Android build is configured with strict linting:

- `abortOnError = true` - Build fails on any lint error
- `checkAllWarnings = true` - All warnings are checked
- **NO lint baselines** - All issues must be fixed, not suppressed

**Rules:**

1. **NEVER** add `@SuppressLint` annotations without explicit user approval
2. **NEVER** create lint baselines (`lint-baseline.xml`)
3. **NEVER** disable lint checks in build.gradle.kts
4. **ALWAYS** fix the root cause of lint errors
5. Run `pnpm lint` after any Android code changes

If lint fails, fix the actual issue. Do not work around it.

## Architecture

### Package Dependencies

```
common (base - pure functions, schemas)
  ↑
  ├── addon (Plasmo browser extension)
  ├── scrapper (data pipeline)
  ├── telegram-bot (Telegraf + Express)
  └── android (Jetpack Compose app - standalone)
```

All use `workspace:*` dependencies. Common must build first. Android is standalone (no workspace deps).

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

### Android Package

**Framework:** Jetpack Compose with Material 3

**Key screens:**

- `StartScreen` - Entry point with shield icon and CTA
- `AppListScreen` - Scans installed apps against database
- `UrlLookupScreen` - Manual URL checking

**Design system:** Dark mode first with brand colors defined in:

- `ui/theme/Color.kt` - Color palette (burnt orange primary, status colors)
- `ui/theme/Theme.kt` - Material 3 color scheme mappings

**Status card colors (dark mode):**

- Error: `#2D1A17` background, `#FF6B4D` accent
- Warning: `#2D2617` background, `#FFD54F` accent
- Success: `#172D1F` background, `#4CAF50` accent
- Hint: `#172A33` background, `#4FC3F7` accent

**Data:** Embeds same `ALL.json` database, parsed at runtime

**Architecture for testability:**

- `DatabaseProvider` interface — loads ALL.json; `AssetDatabaseProvider` for production, fake impls for tests
- `PackageScanner` interface — lists installed packages; `SystemPackageScanner` for production
- `AppScanner` — core scanning logic using DatabaseProvider + PackageScanner
- `AppListViewModel` — ViewModel for AppListScreen, delegates to AppScanner
- `Clock` interface — injectable time source for `NotificationPreferences` and `SharePreferences`

**Testing stack (JVM-based, no emulator):**

- Robolectric 4.16.1 + Roborazzi 1.59.0 + Compose UI Test
- 118 tests across 16 test classes, all JVM-only
- Visual regression snapshots generated to `app/src/test/snapshots/`
- Fastlane Play Store screenshots generated to `fastlane/metadata/android/{locale}/images/` for all supported languages
- See `TEST_PLAN.md` for full details

**In-App Billing:**

- Uses Google Play Billing Library 7.x for $1/month supporter subscription
- Product ID: `supporter_monthly` (must be configured in Play Console)
- `BillingManager` in `data/billing/` handles connection, purchases, and acknowledgment
- Ko-fi available as fallback for users outside Play Store ecosystem

### Android Localization

**Currently Supported Languages:** English (default/fallback), Arabic (ar)

The app uses the system language by default. If the device is set to Arabic, the user sees Arabic. Otherwise, English is the fallback. No custom locale logic — this is standard Android locale resolution.

All user-facing strings MUST be in `res/values/strings.xml` and referenced via string resources. No hardcoded strings in Kotlin source files.

**In Composables:** Use `stringResource(R.string.xxx)` (Compose-native, auto-recomposes on locale change). Import: `import androidx.compose.ui.res.stringResource`

**In non-Composable code** (ScanWorker, ShareContent, ShareManager, etc.): Use `context.getString(R.string.xxx)` since no Compose scope is available.

**Plurals:** Use `pluralStringResource(R.plurals.xxx, count, count)` in Composables, `context.resources.getQuantityString(R.plurals.xxx, count, count)` outside.

**Rules:**

1. Every user-visible string (labels, buttons, descriptions, notifications, content descriptions, share text) goes in `strings.xml`
2. Do NOT use `formatted="false"` when the string has format arguments (`%s`, `%d`, `%1$s`)
3. Do NOT add `formatted="false"` to strings that have no format arguments (it's the default)
4. Use `%s` for single args, `%1$s`/`%2$s` for multiple args in the same string
5. Use `<plurals>` for count-dependent strings
6. Technical strings (log messages, package IDs, URLs, channel IDs) stay in code
7. Content descriptions (`contentDescription`) should use string resources too
8. Escape apostrophes as `\'` or wrap the string in `"double quotes"` in XML

**Key files:**

- `packages/android/app/src/main/res/values/strings.xml` — English (default)
- `packages/android/app/src/main/res/values-ar/strings.xml` — Arabic

### Adding a New Android Language

All locations below must be updated when adding a new language. The build and validation scripts enforce completeness — missing any step will cause failures.

1. Create `res/values-{lang}/strings.xml` with ALL translatable strings (copy from `values/strings.xml` as template, translate every string except those marked `translatable="false"`)
2. Add the language code to `localeFilters` in `app/build.gradle.kts` (e.g., `localeFilters += setOf("en", "ar", "fr")`)
3. Add a new entry to the `SupportedLanguage` enum in `data/AppPreferences.kt` with the BCP-47 tag, native name, and English name (e.g., `FRENCH("fr", "Fran\u00e7ais", "French")`)
4. Add a `<locale android:name="{lang}"/>` entry to `res/xml/locales_config.xml` so Android 13+ shows the language in system per-app language settings
5. Create `fastlane/metadata/android/{locale}/` directory with:
   - `title.txt` (max 30 chars)
   - `short_description.txt` (max 80 chars)
   - `full_description.txt` (max 4000 chars)
   - `changelogs/{versionCode}.txt` (max 500 chars)
   - `images/phoneScreenshots/` (auto-generated by `pnpm test:screenshots`)
   - `images/tabletScreenshots/` (auto-generated by `pnpm test:screenshots`)
6. Add the fastlane locale code to `REQUIRED_LOCALES` in `scripts/validate-metadata.sh`
7. If the fastlane locale code differs from the Android tag (e.g., `en` → `en-US`), add a mapping to `FASTLANE_LOCALE_MAP` in `FastlaneScreenshotTest.kt`
8. Run `pnpm test:screenshots` to generate Play Store screenshots for the new language
9. Run `pnpm lint` — will FAIL if any translations are missing or extra
10. Run `pnpm validate:metadata` — will FAIL if fastlane files are missing
11. For RTL languages (Arabic, Hebrew, Persian, Urdu): use all required plural forms (zero/one/two/few/many/other for Arabic)

### Build Enforcement (Translations & Metadata)

- **`androidResources.localeFilters`** in `app/build.gradle.kts` whitelists supported locales — only these are included from dependencies
- **`MissingTranslation`** lint rule is an error — build fails if any translatable string in `values/strings.xml` is missing from any `values-{lang}/strings.xml`
- **`ExtraTranslation`** lint rule is an error — build fails if any locale has strings not present in the default `values/strings.xml`
- **`validate-metadata.sh`** checks all locales in `REQUIRED_LOCALES` array — fails if fastlane text files are missing or exceed character limits
- ALL of these must be updated when adding or removing a language

### RTL Support

The app fully supports RTL layouts (Arabic). All Compose layouts are RTL-aware by default.

**Layout rules:**

- NEVER use `left`/`right` padding — use `start`/`end` or symmetric values (e.g., `horizontal`)
- NEVER use `TextAlign.Left`/`TextAlign.Right` — use `TextAlign.Start`/`TextAlign.End` or `TextAlign.Center`
- NEVER use `Arrangement.Start` with hardcoded left assumption — Compose `Row` auto-reverses in RTL
- Use `Icons.AutoMirrored.Filled.*` for directional icons (arrows, chevrons)
- `Modifier.padding(horizontal = X.dp)` is always safe (symmetric, no directionality)

**Font:** Inter (Latin script) + Noto Sans Arabic (Arabic script) via composite `AppFontFamily` in `Type.kt`. Compose picks the correct font per glyph automatically.

**Canvas rendering (ShareImageGenerator):** Detects RTL via `context.resources.configuration.layoutDirection` and mirrors icon+text row positioning. Most text uses `Paint.Align.CENTER` (symmetric), only the flagged apps template has directional layout.

**Testing RTL:** In Android emulator, enable "Force RTL layout direction" in Developer Options, or set device language to Arabic.

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
  - `thaura_ai_chat`: All AI chat hints
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
- `packages/android/app/src/main/java/com/thewall/android/ui/theme/Color.kt` - Android color palette
- `packages/android/app/src/main/java/com/thewall/android/ui/screens/AppListScreen.kt` - App scanner UI
- `packages/android/app/build.gradle.kts` - Android build config (signing, ProGuard, lint)
- `packages/android/app/src/main/java/com/thewall/android/data/AppPreferences.kt` - App settings store, SupportedLanguage enum, locale resolution
- `packages/android/version.properties` - Version tracking (VERSION_CODE, VERSION_NAME)
- `packages/android/app/proguard-rules.pro` - R8/ProGuard rules for release builds
- `packages/android/fastlane/metadata/android/` - Play Store metadata

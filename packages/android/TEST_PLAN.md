# Android Test Plan

## Overview

Comprehensive test suite for The Wall Android app using modern JVM-based testing.
No emulator required — all tests run locally via Robolectric + Roborazzi.

### Technology Stack

| Tool | Version | Purpose |
|---|---|---|
| Roborazzi | 1.59.0 | JVM-based screenshot/visual regression testing |
| Robolectric | 4.16.1 | JVM-based Android runtime (no emulator) |
| Compose UI Test | BOM 2026.01.00 | Official Compose interaction testing |
| WorkManager Testing | 2.9.0 | ScanWorker / periodic work testing |
| JDK | 21 | Required by Robolectric for SDK 36 |

### How to Run

```bash
# All unit tests (includes screenshot generation)
cd packages/android && pnpm test

# Record baseline screenshots (first time or after intentional UI changes)
cd packages/android && pnpm test:record

# Verify screenshots match baseline (CI mode — fails on visual diff)
cd packages/android && pnpm test:verify

# Compare and generate HTML diff report
cd packages/android && pnpm test:compare

# Generate fastlane screenshots only
cd packages/android && pnpm test:screenshots
```

### Data Integrity

Tests use the **real production `ALL.json`** database from `app/src/main/assets/`.
No fake/duplicate test databases — this ensures:
- Schema changes break tests immediately
- Data integrity is validated on every test run
- Test scenarios use real entries (Wix, Fiverr, Airbnb, etc.)

The `TestDatabase` utility extracts entries from the real database by ID, name,
or android package ID for use in test scenarios.

### SDK Alignment

Tests run against the same SDK as the production app (compileSdk 36).
No separate `robolectric.properties` override — Robolectric uses the app's
actual SDK target. JDK 21 is required for SDK 36 support.

### Directory Structure

```
app/src/test/java/com/thewallboycott/android/
  testutil/
    TestClock.kt                          # Controllable clock for time tests
    TestDatabase.kt                       # Real DB extraction utility
    TestDevices.kt                        # Device qualifier constants
  smoke/
    SmokeTest.kt                          # Phase 1: Toolchain verification
  data/
    OnboardingPreferencesTest.kt          # Phase 3: Preferences
    NotificationPreferencesTest.kt        # Phase 3: Time-dependent logic
    AppPreferencesTest.kt                 # Phase 3: Language switching
  data/logic/
    UrlCheckerTest.kt                     # Phase 3: Core business logic
    AppScannerTest.kt                     # Phase 3: Package scanning
  ui/screens/
    StartScreenTest.kt                    # Phase 4: Screenshot + interaction
    AppListScreenTest.kt                  # Phase 4: Screenshot + scan results
    UrlLookupScreenTest.kt               # Phase 4: Screenshot + results
    SettingsScreenTest.kt                 # Phase 4: Language UI
    SupportScreenTest.kt                  # Phase 4: Billing/donation UI
    OnboardingScreenTest.kt              # Phase 4: Pager flow
  background/
    ScanWorkerTest.kt                     # Phase 5: Background scanning
    NotificationActionReceiverTest.kt     # Phase 5: Ignore/Snooze actions
  share/
    ShareImageGeneratorTest.kt            # Phase 4: Visual regression
  screenshots/
    FastlaneScreenshotTest.kt            # Phase 6: Replaces screenshots.sh

app/src/test/snapshots/                   # Roborazzi baseline images (git-tracked)
  images/                                 # Share image snapshots (git-tracked)
```

### Key Abstractions Introduced for Testability

| Interface | Replaces | Used By |
|---|---|---|
| `Clock` | `System.currentTimeMillis()` | NotificationPreferences, SharePreferences |
| `PackageScanner` | `PackageManager.getInstalledPackages()` | AppScanner, ScanWorker |
| `DatabaseProvider` | `readFile(assets, "ALL.json")` + Gson | AppScanner, UrlChecker |
| `AppListViewModel` | Inline composable state | AppListScreen |

---

## Phase 0: Infrastructure Setup

Set up build dependencies, test configuration, and shared test utilities.

### Tasks

- [x] Add Roborazzi plugin to root `build.gradle.kts`
- [x] Add Robolectric, Roborazzi, coroutines-test, work-testing to `libs.versions.toml`
- [x] Add test dependencies to `app/build.gradle.kts`
- [x] Enable `isIncludeAndroidResources = true` in `testOptions`
- [x] Add pnpm test scripts to `package.json`
- [x] Create `Clock` interface and `SystemClock` / `TestClock` implementations
- [x] Delete template `ExampleUnitTest.kt` and `ExampleInstrumentedTest.kt`
- [x] Create `TestDatabase` utility for real DB extraction (no fake data)
- [x] Create `TestDevices` device qualifier constants
- [x] Create shared test snapshots directory with `.gitkeep`

---

## Phase 1: Smoke Test

Prove the entire toolchain works end-to-end: Robolectric boots, Compose renders,
Roborazzi captures a screenshot, and the image file is written to disk.

### Tasks

- [x] Create `SmokeTest.kt` that renders `StartScreen` and captures a screenshot
- [x] Run test and verify screenshot output file exists
- [x] Verify test passes in CI-like mode (no emulator)

### Success Criteria

- `./gradlew testDebugUnitTest --tests "*.SmokeTest"` passes
- A `.png` file appears in `app/src/test/snapshots/`

---

## Phase 2: Refactoring for Testability

Introduce minimal abstractions to decouple hard dependencies without changing behavior.

### Tasks

- [x] Create `Clock` interface in `data/` with `SystemClock` default implementation
- [x] Refactor `NotificationPreferences` to accept `Clock` parameter (default `SystemClock`)
- [x] Refactor `SharePreferences` to accept `Clock` parameter
- [x] Create `PackageScanner` interface + `SystemPackageScanner` implementation
- [x] Create `DatabaseProvider` interface + `AssetDatabaseProvider` implementation
- [x] Create `AppScanner` class extracting `performAppScan()` logic from `AppListScreen.kt`
- [x] Create `AppListViewModel` using `AppScanner`, managing scan state
- [x] Update `AppListScreen` to use `AppListViewModel`
- [x] Update `ScanWorker` to use `DatabaseProvider` and `PackageScanner`
- [x] Update `UrlChecker` to use `DatabaseProvider`
- [x] Verify app still builds + lint passes + all tests pass after refactoring

### Design: Clock Interface

```kotlin
// data/Clock.kt
interface Clock {
    fun currentTimeMillis(): Long
}

object SystemClock : Clock {
    override fun currentTimeMillis(): Long = System.currentTimeMillis()
}

// For tests
class TestClock(var timeMillis: Long = 0L) : Clock {
    override fun currentTimeMillis(): Long = timeMillis
    fun advanceBy(millis: Long) { timeMillis += millis }
}
```

### Design: PackageScanner Interface

```kotlin
// data/PackageScanner.kt
interface PackageScanner {
    fun getInstalledPackages(): List<PackageInfo>
}

class RealPackageScanner(private val context: Context) : PackageScanner {
    override fun getInstalledPackages(): List<PackageInfo> =
        context.packageManager.getInstalledPackages(PackageManager.GET_META_DATA)
}
```

### Design: DatabaseProvider Interface

```kotlin
// data/DatabaseProvider.kt
interface DatabaseProvider {
    fun loadDatabase(): List<AllItem>
}

class AssetDatabaseProvider(private val context: Context) : DatabaseProvider {
    override fun loadDatabase(): List<AllItem> {
        val json = readFile(context.assets, "ALL.json")
        val type = object : TypeToken<List<AllItem>>() {}.type
        return Gson().fromJson(json, type)
    }
}
```

---

## Phase 3: Unit Tests

Test business logic with no UI rendering. Fast, deterministic, focused.

### Tasks

- [x] `OnboardingPreferencesTest` — set/get/reset (4 tests)
- [x] `NotificationPreferencesTest` — known apps, ignored apps, snooze with clock control, reminder intervals, clear (23 tests)
- [x] `AppPreferencesTest` — language storage, effective language resolution, system default fallback (15 tests)
- [x] `TestDatabaseTest` — validates real ALL.json loads correctly (10 tests)
- [x] `UrlCheckerTest` — domain match, social media URLs, .il domains, autocomplete (10 tests)
- [x] `AppScannerTest` — empty database, matching by appId/devId, BDS separation, hints, priority, real DB integration (12 tests)

---

## Phase 4: UI / Screenshot Tests

Render each screen in isolation and capture Roborazzi screenshots.
Phone (Pixel 5) and tablet (Pixel C) device qualifiers.

### Tasks

- [x] `StartScreenTest` — phone + tablet screenshots, button interaction (3 tests)
- [x] `AppListScreenTest` — clean scan, flagged apps, mixed results (4 tests)
- [x] `UrlLookupScreenTest` — idle state phone + tablet (2 tests)
- [x] `SettingsScreenTest` — phone + tablet (2 tests)
- [x] `SupportScreenTest` — default state phone + tablet (2 tests)
- [x] `OnboardingScreenTest` — first page phone + tablet (2 tests)
- [ ] `ShareImageGeneratorTest` — each template with visual snapshots (future)

### Device Qualifiers

```kotlin
// Phone: Pixel 5 (1080x2340, 440dpi)
@Config(qualifiers = "w393dp-h851dp-xxhdpi")

// Tablet: Pixel C (2560x1800, 308dpi)
@Config(qualifiers = "w900dp-h1264dp-xhdpi")
```

### Snapshot Storage for Share Images

Share image test outputs are stored in `app/src/test/snapshots/images/` and committed to git.
Any changes to share image rendering will show up as git diffs, enabling visual review in PRs.

---

## Phase 5: Worker / Notification Tests

Test background scanning, notification logic, and user actions.

### Tasks

- [x] `ScanWorkerTest` — scans installed apps, tracks known apps, respects ignored/snoozed, hints excluded, multiple apps (10 tests)
- [x] `NotificationActionReceiverTest` — intent factory, ignore/snooze persistence, null safety, unknown action (10 tests)

---

## Phase 6: Fastlane Screenshots (replaces `screenshots.sh`)

Automated screenshot generation for Play Store metadata.
Outputs directly to `fastlane/metadata/android/{locale}/images/{type}Screenshots/`.

### Tasks

- [x] `FastlaneScreenshotTest` — generates 4 screenshots per device type (8 tests)
- [x] Phone screenshots: 1-StartScreen, 2-ScanResults, 3-UrlLookup, 4-CleanScan
- [x] Tablet screenshots: same set with tablet qualifiers
- [x] English (en-US) screenshots generated to `fastlane/metadata/android/en-US/images/`
- [x] `package.json` test scripts updated (`pnpm test` runs tests + screenshots + lint)
- [ ] Arabic (ar) screenshot generation (add when Arabic UI testing is needed)
- [ ] Delete `scripts/screenshots.sh` (keep until emulator screenshots are confirmed unnecessary)
- [ ] Update `release.sh` to use new screenshot generation

### Screenshot Mapping

| # | Screen | State |
|---|---|---|
| 1 | StartScreen | Idle, ready to scan |
| 2 | AppListScreen | Scan results with flagged apps |
| 3 | UrlLookupScreen | Empty state with help examples |
| 4 | AppListScreen | Clean scan (no flagged apps) |

---

## Preparing for Future Expansion

### Multiple Languages

All screenshot tests accept a locale parameter. Adding a new language:

1. Add locale to `SupportedLanguage` enum
2. Add `values-{lang}/strings.xml`
3. Add locale entry to `FastlaneScreenshotTest.LOCALES` list
4. Run `pnpm test:screenshots` — new locale screenshots auto-generated

### Multiple Device Sizes

Device qualifiers are defined in a shared `TestDevices` object:

```kotlin
object TestDevices {
    val PHONE = "w393dp-h851dp-xxhdpi"   // Pixel 5
    val TABLET = "w900dp-h1264dp-xhdpi"  // Pixel C
    // Future: FOLDABLE, SMALL_PHONE, etc.
}
```

### Default Settings Variations

Tests can set different initial preferences before rendering:

```kotlin
// Test with onboarding completed
onboardingPrefs.setOnboardingCompleted()

// Test with Arabic language
appPrefs.setLanguage(SupportedLanguage.ARABIC)

// Test with specific notification state
notificationPrefs.ignoreApp("com.example.ignored")
```

### Debug vs Release Builds

Both build types share the same test suite. The `testDebugUnitTest` task runs all tests
against the debug build variant. Release-specific behavior (ProGuard, signing) is validated
by the existing `pnpm build:release` workflow, not by unit tests.

---

## Progress Summary

| Phase | Status | Tests |
|---|---|---|
| 0: Infrastructure | Complete | — |
| 1: Smoke Test | Complete | 1 |
| 2: Refactoring | Complete | — |
| 3: Unit Tests | Complete | 74 |
| 4: UI/Screenshots | Complete | 15 |
| 5: Worker/Notification | Complete | 20 |
| 6: Fastlane Screenshots | Complete | 8 |
| **Total** | | **118 passing, 0 failing** |

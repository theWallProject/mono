# The Wall iOS

iOS Safari Web Extension for The Wall boycott assistance tool.

## Overview

This package contains the native iOS host app and Safari Web Extension. The extension is built using Plasmo in the `addon` package and wrapped in a SwiftUI host app that provides:

- **Onboarding flow**: 4-page guided setup
- **Company database browser**: Searchable native interface for 19K+ companies
- **Extension status monitoring**: Detects if the extension is active via App Groups
- **Settings**: Re-show onboarding, report issues, donate, about

## Architecture

```
TheWall/
  TheWall/           -- SwiftUI host app
  TheWallExtension/  -- Safari Web Extension (Plasmo build output)
  TheWallTests/      -- Unit tests
  TheWallUITests/    -- UI tests
```

### Key iOS Safari Constraints

1. **Service worker death**: Safari kills service workers after 30-60s (iOS 17) or ~1 day (iOS 18). Solution: Use `scripts` + `persistent: false` instead of `service_worker` via manifest patching.

2. **WebGL memory crashes**: iOS has 256MB canvas memory limit. Solution: CSS-only fallback animation (no Three.js) for Safari builds.

3. **3MB background script**: ALL.json inlined in bundle causes memory pressure. Solution: Externalize and lazy-load via `fetch(chrome.runtime.getURL())`.

4. **Volatile storage.session**: Cleared when Safari quits. Solution: Use `storage.local` for 30-day dismissals.

5. **App Store Guideline 4.2**: Extension-only apps risk rejection. Solution: Add searchable company database, test extension flow, settings.

6. **No extension state detection**: `SFSafariExtensionManager` unavailable on iOS. Solution: Extension writes activity to App Groups shared UserDefaults.

## Prerequisites

- macOS with Xcode 15.0+
- iOS 17.0+ SDK
- XcodeGen (`brew install xcodegen`)
- Fastlane (`brew install fastlane`)
- Valid Apple Developer account (Team ID: FR6DUF5C3C)
- Provisioning profiles for both app and extension targets

## Setup

1. **Generate Xcode project**:
   ```bash
   pnpm run generate-project
   ```

2. **Build Safari extension**:
   ```bash
   cd ../addon
   pnpm run build:safari
   cd ../ios
   ```

3. **Sync extension resources**:
   ```bash
   pnpm run sync-extension
   ```

4. **Open in Xcode**:
   ```bash
   open TheWall.xcodeproj
   ```

## Building

### Debug build
```bash
pnpm run build:debug
```

### Release build
```bash
pnpm run build:release
```

### Full build (from scratch)
```bash
pnpm run clean
pnpm run generate-project
pnpm run sync-extension
pnpm run build
```

## Testing

### Run all tests
```bash
pnpm run test
```

### Unit tests only
```bash
pnpm run test:unit
```

### UI tests only
```bash
pnpm run test:ui
```

### Manual testing on device
1. Build and run on physical device (simulator won't load extension)
2. Open Settings > Safari > Extensions
3. Enable "The Wall" extension
4. Grant "All Websites" permission
5. Navigate to facebook.com or any .il domain
6. Verify overlay renders (CSS fallback, no WebGL)
7. Test "Allow for a month" persists across Safari restarts

## Release Pipeline

### Overview

The iOS release is a 6-step local pipeline orchestrated by `scripts/release.sh`:

```
┌─────────────────────────────────────────────────────────────────────┐
│  release.sh beta|release                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 1: validate-metadata.sh                                       │
│          Checks fastlane/metadata/{en-US,ar}/ for required files    │
│          (name, subtitle, description, keywords, privacy_url)       │
│                                                                     │
│  Step 2: pnpm run build:safari  (in ../addon)                      │
│          Builds Plasmo output → addon/build/safari-mv3-prod/        │
│                                                                     │
│  Step 3: sync-extension-resources.sh                                │
│          Copies addon output → TheWallExtension/Resources/          │
│          Flattens directories, patches manifest for iOS Safari      │
│                                                                     │
│  Step 4: xcodegen generate                                          │
│          Regenerates TheWall.xcodeproj from project.yml             │
│                                                                     │
│  Step 5: xcodebuild test                                            │
│          Runs unit + UI tests on simulator                          │
│                                                                     │
│  Step 6: fastlane beta|release                                      │
│          Builds .ipa → uploads to TestFlight or App Store Connect   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Fastlane Lanes

| Lane | Command | What it does |
|------|---------|-------------|
| `beta` | `fastlane beta` | Increment build number → build → upload to TestFlight → git tag `ios/beta/{N}` → push |
| `release` | `fastlane release` | Build → upload to App Store Connect (manual submission required) → git tag `ios/v{version}` → push |
| `test` | `fastlane test` | Run all tests with code coverage |
| `build_only` | `fastlane build_only` | CI validation build (no signing) |
| `screenshots` | `fastlane screenshots` | Capture screenshots for en-US + ar on multiple devices → upload to ASC |
| `validate_metadata` | `fastlane validate_metadata` | Verify App Store metadata files |

### Commands

```bash
# Full release (runs all 6 steps)
pnpm run release              # defaults to beta
pnpm run release beta         # TestFlight
pnpm run release release      # App Store Connect

# Individual steps
pnpm run release:beta         # Fastlane only (skip steps 1-5)
pnpm run release:store        # Fastlane only (skip steps 1-5)
pnpm run bump-version 1.2.0   # Update version in Xcode + package.json
pnpm run validate-metadata    # Check App Store metadata
```

### Monorepo Integration

From the monorepo root:

```bash
pnpm run release:ios:beta     # TestFlight via pnpm --filter @thewall/ios
pnpm run release:ios:store    # App Store via pnpm --filter @thewall/ios
pnpm run build:ios            # Debug build
pnpm run test:ios             # Run tests
```

### Addon → iOS Build Chain

The Safari extension is built separately and synced into the iOS project:

```
../addon/build/safari-mv3-prod/     (Plasmo output)
        │
        ▼  sync-extension-resources.sh
TheWallExtension/Resources/          (Flattened + patched)
        │
        ▼  patch-manifest.sh
        ├── manifest.json            (service_worker → scripts, iOS fixes)
        ├── background.js            (flattened from static/background/)
        ├── content.css
        ├── popup.html
        └── ...
```

Key manifest patches for iOS Safari:
- `service_worker` → `"scripts": ["background.js"], "persistent": false`
- Removes `default_locale` (i18n handled by JS fallback)
- Adds `host_permissions` for content script injection
- Fixes `web_accessible_resources` paths for flattened structure

### Browser Extension Release (Standalone)

The standalone `theWallAddon` repo has its own GitHub Actions pipeline:

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `create-release.yml` | Manual dispatch | `npm run package` → create GitHub Release with all platform .zip files |
| `submit.yml` | Manual dispatch | `pnpm run package` → upload Chrome build to Chrome Web Store via PlasmoHQ/bpp |

This pipeline produces Chrome, Firefox, Edge, and Opera builds. Safari builds are handled separately through the iOS pipeline above.

### App Store Metadata

Metadata lives in `fastlane/metadata/` with locale directories:

```
fastlane/metadata/
  en-US/
    name.txt          (≤30 chars)
    subtitle.txt      (≤30 chars)
    description.txt   (≤4000 chars)
    keywords.txt      (≤100 chars)
    privacy_url.txt
  ar/
    name.txt
    subtitle.txt
    description.txt
    keywords.txt
    privacy_url.txt
```

The `validate-metadata.sh` script checks all files exist and respect length limits before every release.

## Localization

The app supports **English** and **Arabic** (with RTL) using iOS 17 String Catalogs.

### Architecture

| File | Purpose |
|------|---------|
| `Localizable.xcstrings` | Main string catalog — 112 en/ar string pairs |
| `InfoPlist.xcstrings` | App display name ("The Wall" / "الجدار") |
| `LocaleAwareFont.swift` | Auto-selects Inter vs NotoSansArabic per locale |

All user-facing strings use the `String(localized:defaultValue:)` API with the key convention `{screen}.{element}`:

```swift
Text(String(localized: "welcome.title", defaultValue: "The Wall"))
```

### String Catalogs (.xcstrings)

We use String Catalogs (not legacy `.strings` files) because:
- iOS 17+ deployment target — full support
- Single JSON file, visual Xcode editor
- Auto-extraction with `String(localized:)` API
- Native pluralization support

### RTL Support

SwiftUI handles most RTL automatically (HStack order, leading/trailing, navigation). Manual fixes:
- External link arrow icons (`arrow.up.right`) use `.flipsForRightToLeftLayoutDirection(false)` to stay pointing outward
- Navigation arrows in setup steps ("Apps → Safari → Extensions") use `←` in Arabic
- SettingsGuide imageset has locale variants for en/ar screenshots

### Terminology Consistency

Key terms reuse translations from the addon's `TRANSLATIONS/DB.ts`:
- "The Wall" → "الجدار"
- "Boycott Assistance" → "مساعد المقاطعة"
- "Report a Mistake" → "أبلغ عن مشكلة"
- Western Arabic numerals (19,000+) used in both locales

### Adding a New String

1. Add the key + en/ar translations to `Localizable.xcstrings`
2. Use `String(localized: "key", defaultValue: "English text")` in Swift code
3. Build to verify

### Adding a New Language

1. Add the locale code to `knownRegions` in `project.yml`
2. Add translations for all 112 keys in `Localizable.xcstrings`
3. Add app name translation in `InfoPlist.xcstrings`
4. Add App Store metadata in `fastlane/metadata/{locale}/`
5. Add locale to `languages` array in Fastlane screenshots lane
6. Regenerate project: `pnpm run generate-project`

## App Groups

Both targets use the App Group `group.com.techforpalestine.thewalladdon` for shared data:
- Extension writes `extensionLastActive` timestamp
- Host app reads timestamp to display extension status
- Must be registered in Apple Developer Portal

## Design System

### Colors
11 semantic color tokens with light/dark variants:
- `WallPrimary`: #B72B00
- `WallSecondary`: #2E7D32
- `WallBackground`: #FFFFFF / #0F0F0F
- `WallSurface`: #FFFFFF / #1A1A1A
- And 7 more...

### Typography
- **Latin**: Inter (Regular/Medium/SemiBold/Bold)
- **Arabic**: Noto Sans Arabic (Regular/Medium/SemiBold/Bold)
- **Sizes**: heading1 (28pt), heading2 (22pt), heading3 (18pt), body (16pt), caption (14pt), button (16pt)
- **Locale-aware**: `LocaleAwareFont` auto-selects Inter vs NotoSansArabic based on `Locale.current`

### App Icon
Reuses universal-icon-1024@1x.png from existing Safari extension assets, configured for light/dark/tinted variants.

## Project Structure

```
TheWall/
  TheWall/
    TheWallApp.swift              -- @main entry point
    Localizable.xcstrings         -- Main string catalog (112 en/ar pairs)
    InfoPlist.xcstrings           -- App name localization
    Theme/
      WallColors.swift
      WallTypography.swift        -- Locale-aware typography scale
      LocaleAwareFont.swift       -- Inter / NotoSansArabic auto-selection
    Views/
      Onboarding/                 -- 4-page onboarding
      Database/                   -- Company search
      Settings/                   -- App settings
      Components/                 -- Reusable UI
    Models/
      Company.swift
      CompanyReason.swift         -- Localized reason descriptions
      OnboardingPage.swift
    Services/
      OnboardingPreferences.swift
      ExtensionActivityChecker.swift
      CompanyDatabase.swift
    Data/
      ALL.json                    -- 19K+ companies
    Resources/
      Fonts/                      -- Inter + Noto Sans Arabic
    Assets.xcassets/
      AppIcon.appiconset/
      SettingsGuide.imageset/     -- Locale variants (en/ar)
      Colors/
```

## Monorepo Integration

From the monorepo root, all iOS commands are available via pnpm filters:

```bash
pnpm run build:ios            # Debug build
pnpm run test:ios             # All tests
pnpm run test:ios:unit        # Unit tests only
pnpm run test:ios:ui          # UI tests only
pnpm run release:ios:beta     # Upload to TestFlight
pnpm run release:ios:store    # Upload to App Store Connect
```

The iOS package depends on `../addon` (relative path) for Safari extension builds. The addon must be built before the iOS app — this is handled automatically by `release.sh` (step 2).

## Troubleshooting

### Extension doesn't load
- Verify `sync-extension` script completed successfully
- Check `TheWallExtension/Resources/` contains manifest.json and other files
- Verify manifest uses `scripts` array, not `service_worker`

### Build fails
- Run `pnpm run clean` and regenerate project
- Verify provisioning profiles are valid
- Check code signing settings in project.yml

### Tests fail
- Ensure simulator is booted: `xcrun simctl boot "iPhone 15"`
- Reset test data: launch with `--reset-onboarding`
- Check test database fixture exists

### Extension crashes on device
- Check memory usage (Settings > Developer > Memory)
- Verify CSS fallback is used (no Three.js in Safari build)
- Test on iPhone SE 3rd gen (4GB RAM minimum)

## Related Documentation

- [iOS Safari Web Extension Implementation Plan](https://github.com/theWallProject/mono/blob/main/docs/ios-implementation-plan.md)
- [Safari Manifest Patching Strategy](./scripts/patch-manifest.sh)
- [Extension Resource Sync Workflow](./scripts/sync-extension-resources.sh)
- [App Store Metadata](./fastlane/metadata/)

## License

MIT

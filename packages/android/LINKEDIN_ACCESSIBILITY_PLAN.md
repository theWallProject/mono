# LinkedIn Accessibility Feature Implementation Plan

## Overview

Implement an accessibility service that monitors LinkedIn and detects flagged companies from theboycott database, showing a persistent overlay when flagged companies are found in the feed.

## Status

**Current Phase:** Phase 4 (Overlay Service) - ✅ COMPLETE
**Completed:** Phase 1 (Core Infrastructure), Phase 2 (Settings UI), Phase 3 (Tree Analysis - Feed Profile), Phase 4 (Overlay Service)

---

## Phase 1: Core Infrastructure ✅ COMPLETE

### 1.1 Node Query DSL ✅
- [x] Create `NodeQuery.kt` - CSS-like query builder for AccessibilityNodeInfo
- [x] Support: withText, withViewId, withClassName, withClickable, etc.
- [x] Support: findAllIn, findFirstIn, existsIn, countIn
- [x] Proper node recycling guidance

**File:** `app/src/main/java/com/thewallboycott/android/accessibility/NodeQuery.kt`

### 1.2 Tree Logger ✅
- [x] Create `TreeLogger.kt` - Structured tree dump utility
- [x] Output format: `[depth] className | viewId | text | contentDesc | flags | bounds`
- [x] Statistics: node counts, TextView counts, unique IDs
- [x] Log all text content and view IDs

**File:** `app/src/main/java/com/thewallboycott/android/accessibility/TreeLogger.kt`

### 1.3 Company Name Matcher ✅
- [x] Create `CompanyNameMatcher.kt` - Index ALL.json for fast lookups
- [x] Build lowercase name index from database
- [x] Support alternative names (alt field)
- [x] `find()`, `findAll()`, `search()` methods

**File:** `app/src/main/java/com/thewallboycott/android/accessibility/CompanyNameMatcher.kt`

### 1.4 Accessibility Preferences ✅
- [x] Create `AccessibilityPreferences.kt`
- [x] Store enabled/disabled state
- [x] Permission check helpers (hasAccessibilityPermission, hasOverlayPermission)
- [x] Settings intent creators

**File:** `app/src/main/java/com/thewallboycott/android/accessibility/AccessibilityPreferences.kt`

### 1.5 Screen Profiles ✅ (Placeholder)
- [x] Create `ScreenProfile.kt` - Sealed class for screen types
- [x] Defined: Feed, CompanyPage, Jobs, Search, Unknown
- [x] Placeholder implementations (throw NotImplementedError)

**File:** `app/src/main/java/com/thewallboycott/android/accessibility/ScreenProfile.kt`

### 1.6 LinkedIn Accessibility Service ✅
- [x] Create `LinkedInAccessibilityService.kt`
- [x] Service lifecycle (onServiceConnected, onAccessibilityEvent, onDestroy)
- [x] 5-second polling when LinkedIn in foreground
- [x] Extensive logging: full tree dump, summary, view IDs, text content
- [x] Naive text extraction and matching
- [x] Event logging (WINDOW_STATE_CHANGED, etc.)

**File:** `app/src/main/java/com/thewallboycott/android/accessibility/LinkedInAccessibilityService.kt`

### 1.7 Manifest & Configuration ✅
- [x] Add `SYSTEM_ALERT_WINDOW` permission
- [x] Declare accessibility service in AndroidManifest.xml
- [x] Create `res/xml/accessibility_service_config.xml`
- [x] Package filter: `com.linkedin.android`

### 1.8 Strings ✅
- [x] Add English strings in `res/values/strings.xml`
- [x] Add Arabic translations in `res/values-ar/strings.xml`

---

## Phase 2: Settings UI Integration ✅ COMPLETE

### 2.1 Settings Screen Updates ✅
- [x] Add "LinkedIn Detection" section
- [x] Add enable/disable toggle
- [x] Show permission status indicators
- [x] Add "Enable" button for accessibility permission
- [x] Add "Enable" button for overlay permission

**File updated:** `app/src/main/java/com/thewallboycott/android/ui/screens/SettingsScreen.kt`

### 2.2 Permission State Management ✅
- [x] Check accessibility service enabled status
- [x] Check overlay permission status
- [x] Show disabled state when permissions missing
- [x] Persist enabled preference

### 2.3 Settings UI Flow ✅
- [x] User opens Settings
- [x] Sees "LinkedIn Detection" toggle
- [x] If permissions missing, sees "Enable" buttons that open system settings
- [x] After both granted, toggle becomes functional
- [x] Permission states refresh when returning to app

---

## Phase 3: Tree Analysis & Extraction (IN PROGRESS)

### 3.1 Collect Real Tree Data ✅
- [x] Install app on device
- [x] Enable accessibility permission
- [x] Open LinkedIn and capture feed screen
- [x] Collect Logcat output with `LinkedInTree` tag
- [x] Document view ID patterns

**Key Findings:**
- Activity: `com.linkedin.android.infra.navigation.MainActivity`
- Feed container: `ComposeView` with id `sdui_compose_view`
- Posts are in: `View` with id `lazyColumn` (Jetpack Compose LazyColumn)
- Company names appear in:
  - Button with `contentDescription="View company: Company Name"`
  - TextView with "Promoted" sibling + "followers" sibling
  - Post author TextView (person names)

### 3.2 Implement FeedProfile ✅
- [x] Analyze feed tree structure
- [x] Identify key view IDs (`sdui_compose_view`, `lazyColumn`)
- [x] Implement `matches()` method
- [x] Implement `extractCompanyNames()` with 3 strategies:
  - Strategy 1: "View company:" button content descriptions
  - Strategy 2: Promoted posts with followers count
  - Strategy 3: Posts with followers sibling

**File updated:** `app/src/main/java/com/thewallboycott/android/accessibility/ScreenProfile.kt`

### 3.3 Extraction Strategies

**Strategy 1: Company Buttons**
```
Button | contentDesc="View company: LinkedIn for Marketing"
→ Extract: "LinkedIn for Marketing"
```

**Strategy 2: Promoted Posts**
```
TextView | "LinkedIn for Marketing"
TextView | "5,266,485 followers"
TextView | "Promoted"
→ Extract: "LinkedIn for Marketing"
```

**Strategy 3: Followers Count**
```
TextView | "Company Name"
TextView | "X followers"
→ Extract: "Company Name"
```

### 3.4 Next Steps
- [x] Test extraction on real LinkedIn feeds
- [ ] Add detection for CompanyPage profile (TODO - not MVP)
- [ ] Add detection for Jobs profile (TODO - not MVP)
- [ ] Optimize: reduce logging verbosity in production
- [x] Implement overlay service (Phase 4)

---

## Phase 4: Overlay Service - ✅ COMPLETE

### 4.1 Overlay Service ✅
- [x] Create `LinkedInOverlayService.kt`
- [x] Foreground service with notification channel
- [x] `WindowManager.addView()` for overlay
- [x] Type `APPLICATION_OVERLAY` (API26+)

**File created:** `app/src/main/java/com/thewallboycott/android/accessibility/LinkedInOverlayService.kt`

### 4.2 Overlay UI ✅
- [x] Create overlay View (LinearLayout + TextViews)
- [x] Top-left positioning with rounded corners
- [x] Display list of flagged companies
- [x] Click → open LinkedIn company page (if URL available)
- [x] Dismiss button (× in header)

### 4.3 Service Binding ✅
- [x] Show overlay when companies detected
- [x] Hide overlay when no matches
- [x] Hide overlay when LinkedIn goes to background

---

## Phase 5: Testing & Optimization (TODO)

### 5.1 Testing
- [ ] Test on multiple LinkedIn versions
- [ ] Test on different Android versions
- [ ] Test permission denial scenarios
- [ ] Test memory usage and battery impact

### 5.2 Performance Optimization
- [ ] Implement node recycling properly
- [ ] Limit tree traversal depth
- [ ] Cache company name index
- [ ] Debounce rapid updates

### 5.3 Edge Cases
- [ ] Handle LinkedIn not installed
- [ ] Handle LinkedIn logged out state
- [ ] Handle LinkedIn app updates
- [ ] Handle service crashes and restarts

---

## Architecture Decisions

### Why AccessibilityService?
- Only way to get XML node tree from other apps
- Works without root
- Google-approved API for accessibility use cases

### Why 5-Second Polling?
- Balance between responsiveness and battery
- LinkedIn feed doesn't change frequently
- Can be reduced after initial implementation

### Why Separate Overlay Service?
- AccessibilityService runs in system process
- Overlay needs to be managed independently
- Can survive app backgrounding

### Why Name Index Instead of URL Lookup?
- LinkedIn feed contains names, not URLs
- URL extraction from LinkedIn requires additional parsing
- Name matching is more direct

---

## Known Limitations

1. **Accessibility Permission Required**: User must manually enable in settings
2. **Overlay Permission Required**: User must manually enable "Draw over other apps"
3. **No Background Data**: Only processes visible content
4. **LinkedIn Updates**: View IDs may change with app updates
5. **Name Ambiguity**: Same company name may refer to different entities

---

## Testing Commands

### Enable Accessibility Service
```bash
adb shell settings put secure enabled_accessibility_services com.thewallboycott.android/com.thewallboycott.android.accessibility.LinkedInAccessibilityService
```

### Enable Overlay Permission
```bash
adb shell appops set com.thewallboycott.android SYSTEM_ALERT_WINDOW allow
```

### View Logs
```bash
adb logcat -s LinkedInAccessibility:I LinkedInTree:I NodeQuery:D
```

### Trigger Service Restart
```bash
adb shell am force-stop com.thewallboycott.android
adb shell am start com.thewallboycott.android/.MainActivity
```

---

## Resources

- [AccessibilityService Guide](https://developer.android.com/reference/android/accessibilityservice/AccessibilityService)
- [AccessibilityNodeInfo API](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo)
- [Draw Over Other Apps](https://developer.android.com/reference/android/permission/Manifest.permission#SYSTEM_ALERT_WINDOW)

---

## Changelog

### 2026-04-02 - Phase 4 Bug Fixes
- Fixed race condition with `isLinkedInForeground` - changed from plain `Boolean` to `AtomicBoolean`
- Background polling thread was reading stale value before main thread update was visible
- Updated all usages to use `.get()` / `.set()` for thread-safe access
- Added `hideOverlay()` call when polling detects LinkedIn not in foreground (Android doesn't always send WINDOW_STATE_CHANGED for home button)
- Reduced polling interval from 5 seconds to 3 seconds for faster response
- Added `checkForLinkedInExit()` to monitor ALL accessibility events for faster exit detection

### 2026-04-02 - Jobs Profile Implementation
- Implemented `ScreenProfile.Jobs` to detect LinkedIn Jobs page
- Detection: `job_collections_discovery_search_bar_container` or `job_search_collection_list_fragment_recycler_view`
- Company extraction: `ad_entity_lockup_subtitle` contains company names
- Companies extracted: "Arvato Systems Malaysia", "Salt", "Great Pyramid", "Nicoll Curtin"

### 2026-04-02 - Phase 4 Complete (Overlay Service)
- Created `LinkedInOverlayService.kt` - foreground service with notification
- Implemented overlay UI with LinearLayout + TextViews (rounded corners, styled)
- Added `FOREGROUND_SERVICE_SPECIAL_USE` permission for API 34+
- Added overlay notification strings (EN/AR)
- Integrated overlay visibility with accessibility service detections
- Show overlay when flagged companies detected
- Hide overlay when no matches found
- Hide overlay when LinkedIn goes to background
- Added clickable company names (if URL available)
- Added dismiss button (× in header)
- Updated `FlaggedCompany` to include LinkedIn URL

### 2026-04-02 - Phase 4 Started (Overlay Service)
- Created `LinkedInOverlayService.kt` - foreground service with notification
- Implemented basic overlay View (FrameLayout + TextView)
- Added `FOREGROUND_SERVICE_SPECIAL_USE` permission for API 34+
- Added overlay notification strings (EN/AR)
- Integrated overlay visibility with accessibility service detections
- Show overlay when flagged companies detected
- Hide overlay when no matches found

### 2026-04-01 - Phase 3 Progress (Feed Profile Implemented)
- Analyzed LinkedIn feed tree from real device data
- Identified key view IDs: `sdui_compose_view`, `lazyColumn`
- Implemented FeedProfile.matches() with activity + view ID detection
- Implemented FeedProfile.extractCompanyNames() with 3 extraction strategies:
  1. "View company:" content descriptions
  2. Promoted posts with followers count
  3. Posts with followers sibling
- Added constant definitions for LinkedIn view IDs and markers
- Added @Suppress("DEPRECATION") for AccessibilityNodeInfo.recycle()

### 2026-04-01 - Phase 2 Complete
- Added LinkedIn Detection section to Settings screen
- Implemented permission status indicators (accessibility + overlay)
- Added "Enable" buttons that open system settings
- Toggle activates only when both permissions granted
- Permission states refresh when returning to app (lifecycle observer)

### 2026-04-01 - Phase 1 Complete
- Created core accessibility infrastructure
- Implemented NodeQuery DSL for tree queries
- Added extensive tree logging
- Created CompanyNameMatcher for database lookups
- Added ScreenProfile hierarchy (placeholders)
- Configured manifest and permissions
- Added strings for EN/AR
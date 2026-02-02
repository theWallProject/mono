# The Wall - Android App

A consumer transparency tool that helps you understand the companies behind the apps on your device.

## Features

- **App Scanner**: Scan installed apps to discover company information including headquarters, founders, and investors
- **URL Lookup**: Check any website for company details
- **Privacy-First**: All scanning performed locally on device - your app list is never transmitted
- **Dark Mode**: Modern Material 3 interface optimized for dark mode

## Requirements

- **Java 17+**: Auto-detected from Android Studio's bundled JDK, or set `JAVA_HOME`
- **Android SDK**: Set `ANDROID_HOME` or configure in `local.properties`
- **Git Bash** (Windows): Required for running pnpm scripts. Install via [Git for Windows](https://git-scm.com/download/win)
- **Bash** (macOS/Linux): Native bash shell

> **Note**: All `pnpm` commands must be run from Git Bash on Windows, not Command Prompt or PowerShell.
>
> If JAVA_HOME errors occur in Git Bash, set it manually first:
>
> ```bash
> export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
> ```

## Development

```bash
# Build debug APK
pnpm build

# Run lint checks (must pass with zero errors)
pnpm lint

# Clean build artifacts
pnpm clean
```

## Release

### First-Time Setup

1. Generate a release keystore:

   **Windows (PowerShell):**

   ```powershell
   & "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkey -v -keystore "$env:USERPROFILE\.android\thewall-release.keystore" -alias thewall -keyalg RSA -keysize 2048 -validity 10000
   ```

   **Windows (Command Prompt):**

   ```cmd
   "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkey -v -keystore %USERPROFILE%\.android\thewall-release.keystore -alias thewall -keyalg RSA -keysize 2048 -validity 10000
   ```

   **macOS/Linux:**

   ```bash
   keytool -genkey -v -keystore ~/.android/thewall-release.keystore -alias thewall -keyalg RSA -keysize 2048 -validity 10000
   ```

   > If Android Studio is installed elsewhere, find keytool in `<Android Studio path>/jbr/bin/`

2. Configure signing:

   **Windows (Command Prompt):**

   ```cmd
   copy keystore.properties.template keystore.properties
   ```

   **Windows (PowerShell) / macOS / Linux:**

   ```bash
   cp keystore.properties.template keystore.properties
   ```

3. Edit `keystore.properties` with your keystore path and passwords:

   ```properties
   storeFile=C:/Users/yourname/.android/thewall-release.keystore
   storePassword=your_password
   keyAlias=thewall
   keyPassword=your_password
   ```

   > **Important**: Use forward slashes `/` in paths, not backslashes.

**Important**: Back up your keystore file! If lost, you cannot update the app on Play Store.

### Building Releases

```bash
# Build with version bump
pnpm release:patch    # 1.0.0 -> 1.0.1
pnpm release:minor    # 1.0.0 -> 1.1.0
pnpm release:major    # 1.0.0 -> 2.0.0

# Build without version bump
pnpm release
```

Output:

- `release-output/thewall-v{version}.aab` - **Upload this to Play Store**
- `release-output/thewall-v{version}.apk` - For testing/sideloading

### Version Management

Version is tracked in `version.properties`:

- `VERSION_CODE`: Integer that increments with each release
- `VERSION_NAME`: Semantic version (e.g., 1.0.0)

## Publishing to Google Play Store

### Prerequisites

1. **Google Play Developer Account** ($25 one-time fee)
   - Sign up at [play.google.com/console](https://play.google.com/console)

2. **Signed Release APK**
   - Run `pnpm release` to generate `release-output/thewall-v{version}.apk`

3. **Store Assets Ready**
   - App icon (512x512) ✓ Already in `fastlane/metadata/android/en-US/images/`
   - Screenshots (min 2, 1080x1920 recommended)
   - Feature graphic (1024x500, optional but recommended)

### Step-by-Step Upload

1. **Create App in Play Console**
   - Go to [Play Console](https://play.google.com/console) → "Create app"
   - Enter app name: "The Wall - App Transparency"
   - Select "App" (not game), "Free"
   - Accept policies

2. **Set Up Store Listing**
   - Go to "Main store listing"
   - Copy content from `fastlane/metadata/android/en-US/`:
     - **App name**: Content of `title.txt`
     - **Short description**: Content of `short_description.txt`
     - **Full description**: Content of `full_description.txt`
   - Upload graphics from `fastlane/metadata/android/en-US/images/`

3. **Upload AAB**
   - Go to "Production" → "Create new release"
   - Upload `release-output/thewall-v{version}.aab` (Play Store requires AAB, not APK)
   - Add release notes from `fastlane/metadata/android/en-US/changelogs/{versionCode}.txt`

4. **Complete App Content**
   - **Privacy policy**: Add URL to your privacy policy
   - **App access**: Select "All functionality is available without special access"
   - **Ads**: Select "No, my app does not contain ads"
   - **Content rating**: Complete the questionnaire (select "Utility" category)
   - **Target audience**: Select "18 and over" (simplest option)
   - **Data safety**: Declare that no user data is collected or shared

5. **QUERY_ALL_PACKAGES Declaration**
   - Go to "App content" → "Sensitive app permissions"
   - For QUERY_ALL_PACKAGES, provide justification:
     > "The Wall scans installed packages to cross-reference them against a database of company information. This is core functionality - scanning only occurs when the user explicitly taps 'Scan Apps'. All processing is on-device; no app list is transmitted to servers."

6. **Submit for Review**
   - Go to "Publishing overview"
   - Click "Send for review"
   - Review typically takes 1-3 days

### Updating the App

1. Bump version: `pnpm release:patch`
2. Upload new AAB to Play Console
3. Add changelog from `fastlane/metadata/android/en-US/changelogs/{newVersionCode}.txt`
4. Submit for review

### Troubleshooting

| Error                               | Solution                                                             |
| ----------------------------------- | -------------------------------------------------------------------- |
| `JAVA_HOME is not set`              | Run `export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"` |
| `Keystore file not found`           | Use forward slashes in path: `C:/Users/...` not `C:\Users\...`       |
| `Package name already exists`       | Change `applicationId` in `app/build.gradle.kts`                     |
| Release command fails in PowerShell | Run from Git Bash instead                                            |

## Play Store Metadata

Store listing content is in `fastlane/metadata/android/en-US/`:

```
en-US/
├── title.txt              # App title (max 30 chars)
├── short_description.txt  # Short description (max 80 chars)
├── full_description.txt   # Full description (max 4000 chars)
├── changelogs/
│   └── {versionCode}.txt  # Changelog per version (max 500 chars)
└── images/
    ├── icon.png           # 512x512
    ├── featureGraphic.png # 1024x500
    └── phoneScreenshots/  # Min 2 screenshots
```

Validate metadata before release:

```bash
pnpm validate:metadata
```

## Project Structure

```
app/
├── src/main/
│   ├── java/com/thewall/android/
│   │   ├── MainActivity.kt
│   │   ├── data/
│   │   │   ├── billing/      # Google Play Billing
│   │   │   └── models/       # Data models
│   │   ├── share/            # Share functionality
│   │   └── ui/
│   │       ├── components/   # Reusable UI components
│   │       ├── screens/      # App screens
│   │       └── theme/        # Colors, typography
│   ├── assets/
│   │   └── ALL.json          # Company database
│   └── res/
│       └── xml/              # Backup rules, file paths
├── build.gradle.kts          # Build config
└── proguard-rules.pro        # R8/ProGuard rules

scripts/
├── build.sh                  # Build with JAVA_HOME setup
├── release.sh                # Full release workflow
├── bump-version.sh           # Version incrementing
└── validate-metadata.sh      # Metadata validation

fastlane/
└── metadata/android/         # Play Store metadata
```

## Code Quality

- **Strict Linting**: `pnpm lint` must pass with zero errors
- **No Baselines**: All lint issues must be fixed, not suppressed
- **ProGuard**: Release builds are minified with R8
- **Log Stripping**: Debug logs removed in release builds

## License

See repository root for license information.

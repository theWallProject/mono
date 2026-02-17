package com.thewallboycott.android.screenshots

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import com.thewallboycott.android.R
import com.thewallboycott.android.Screen
import com.thewallboycott.android.ScanState
import com.thewallboycott.android.data.AppPreferences.SupportedLanguage
import com.thewallboycott.android.data.AppScanner
import com.thewallboycott.android.data.DatabaseProvider
import com.thewallboycott.android.data.PackageScanner
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.data.models.Alternative
import com.thewallboycott.android.testutil.TestDevices
import com.thewallboycott.android.ui.AppScaffold
import com.thewallboycott.android.ui.screens.AppListScreen
import com.thewallboycott.android.ui.screens.AppListViewModel
import com.thewallboycott.android.ui.screens.StartScreen
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import com.thewallboycott.android.ui.urllookup.UrlLookupScreen
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Generates fastlane Play Store screenshots for ALL supported locales and device types.
 *
 * Output: `fastlane/metadata/android/{locale}/images/{phone|tablet}Screenshots/{1-4}.png`
 *
 * Screenshot mapping:
 * 1. StartScreen — idle, ready to scan
 * 2. AppListScreen — scan results with flagged apps
 * 3. UrlLookupScreen — empty state with help text
 * 4. AppListScreen — clean scan (no flagged apps)
 *
 * Locales are auto-discovered from [SupportedLanguage.entries]. When a new language is
 * added to the enum, screenshots will automatically be generated for it on the next run.
 *
 * Run with: `pnpm test:screenshots` or as part of `pnpm test`
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class FastlaneScreenshotTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    companion object {
        /** Base path relative to app/ module root */
        private const val FASTLANE_BASE = "../fastlane/metadata/android"

        /**
         * Maps Android BCP-47 language tags to fastlane locale directory names.
         *
         * Fastlane uses IETF-like locale codes (e.g., "en-US") while Android uses
         * BCP-47 tags (e.g., "en"). This map handles the translation.
         *
         * When adding a new language to [SupportedLanguage], also add its fastlane
         * locale code here if it differs from the Android tag. Languages not in this
         * map will use their Android tag as-is (which works for most non-English locales).
         */
        private val FASTLANE_LOCALE_MAP = mapOf(
            "en" to "en-US"
            // Most languages use the same code in both systems:
            // "ar" -> "ar", "fr" -> "fr-FR" (add override only when needed)
        )

        /** Convert an Android language tag to a fastlane locale code. */
        private fun fastlaneLocale(androidTag: String): String =
            FASTLANE_LOCALE_MAP[androidTag] ?: androidTag

        /** All device configurations to generate screenshots for. */
        private val DEVICES = listOf(
            DeviceConfig("phone", TestDevices.PHONE, "phoneScreenshots"),
            DeviceConfig("tablet", TestDevices.TABLET, "tabletScreenshots")
        )
    }

    private data class DeviceConfig(
        val name: String,
        val qualifiers: String,
        val screenshotDir: String
    )

    // ==================== Test Data ====================

    private val fakeIsraeliApp = AllItem(
        id = "test_wix",
        r = listOf("h"),
        n = "Wix",
        ws = "wix.com",
        androidDevId = "com.wix",
        alt = listOf(
            Alternative("Jimdo", "https://www.jimdo.com"),
            Alternative("Webnode", "https://www.webnode.com")
        )
    )

    private val fakeBdsApp = AllItem(
        id = "test_bds",
        r = listOf("BDS_PRIO"),
        n = "SodaStream",
        androidAppIds = listOf("com.sodastream.app")
    )

    private val fakeHintApp = AllItem(
        id = "test_hint",
        r = emptyList(),
        n = "News Reader",
        isHint = true,
        hintText = "Try Newscord for less biased news",
        hintAndroidId = "com.newscord.app",
        androidAppIds = listOf("com.newsreader.app")
    )

    private fun fakePackage(packageName: String): PackageInfo {
        return PackageInfo().apply {
            this.packageName = packageName
            applicationInfo = ApplicationInfo().apply {
                this.packageName = packageName
                this.flags = 0
            }
        }
    }

    private fun createViewModel(
        dbItems: List<AllItem>,
        installedPackages: List<PackageInfo>
    ): AppListViewModel {
        val dbProvider = object : DatabaseProvider {
            override suspend fun getAllItems(): List<AllItem> = dbItems
        }
        val pkgScanner = object : PackageScanner {
            override fun getInstalledPackages(): List<PackageInfo> = installedPackages
        }
        return AppListViewModel(AppScanner(dbProvider, pkgScanner))
    }

    /**
     * Apply Robolectric qualifiers for a given device and locale.
     *
     * `RuntimeEnvironment.setQualifiers()` accepts additive qualifiers prefixed with `+`.
     * The `+` tells Robolectric to merge these qualifiers with the current configuration
     * rather than replacing it entirely. We apply device and locale as separate calls
     * to avoid qualifier ordering issues.
     */
    private fun applyQualifiers(device: DeviceConfig, language: SupportedLanguage) {
        RuntimeEnvironment.setQualifiers("+${language.tag}-${device.qualifiers}")
    }

    /** Get the output path for a screenshot. */
    private fun screenshotPath(device: DeviceConfig, language: SupportedLanguage, index: Int): String {
        val locale = fastlaneLocale(language.tag)
        return "$FASTLANE_BASE/$locale/images/${device.screenshotDir}/$index.png"
    }

    // ==================== Screenshot Generators ====================

    /**
     * Screenshot 1: StartScreen — idle, ready to scan.
     *
     * Generates for all locales and device types.
     */
    @Test
    @Config(qualifiers = TestDevices.PHONE)
    fun screenshot_1_startScreen() {
        for (language in SupportedLanguage.entries) {
            for (device in DEVICES) {
                applyQualifiers(device, language)
                composeTestRule.setContent {
                    TheWallBoycottAssistantTheme {
                        AppScaffold(currentScreen = Screen.List, scanState = ScanState.Idle) {
                            StartScreen(onScanClicked = {}, onDebugTrigger = {})
                        }
                    }
                }
                composeTestRule.onRoot().captureRoboImage(
                    screenshotPath(device, language, 1)
                )
            }
        }
    }

    /**
     * Screenshot 2: AppListScreen — scan results with flagged apps.
     *
     * Generates for all locales and device types.
     * Waits for the locale-specific "Israeli Apps" section header to appear.
     */
    @Test
    @Config(qualifiers = TestDevices.PHONE)
    fun screenshot_2_scanResults() {
        for (language in SupportedLanguage.entries) {
            for (device in DEVICES) {
                applyQualifiers(device, language)
                val viewModel = createViewModel(
                    dbItems = listOf(fakeIsraeliApp, fakeBdsApp, fakeHintApp),
                    installedPackages = listOf(
                        fakePackage("com.wix.android"),
                        fakePackage("com.sodastream.app"),
                        fakePackage("com.newsreader.app"),
                        fakePackage("com.safe.app")
                    )
                )
                composeTestRule.setContent {
                    TheWallBoycottAssistantTheme {
                        AppScaffold(currentScreen = Screen.List, scanState = ScanState.Scanning) {
                            AppListScreen(viewModel = viewModel)
                        }
                    }
                }
                val sectionHeader = composeTestRule.activity.getString(R.string.section_israeli_apps)
                composeTestRule.waitUntil(timeoutMillis = 10_000) {
                    try {
                        composeTestRule.onNodeWithText(sectionHeader, substring = true).assertExists()
                        true
                    } catch (_: AssertionError) { false }
                }
                composeTestRule.onRoot().captureRoboImage(
                    screenshotPath(device, language, 2)
                )
            }
        }
    }

    /**
     * Screenshot 3: UrlLookupScreen — empty state with help text.
     *
     * Generates for all locales and device types.
     */
    @Test
    @Config(qualifiers = TestDevices.PHONE)
    fun screenshot_3_urlLookup() {
        for (language in SupportedLanguage.entries) {
            for (device in DEVICES) {
                applyQualifiers(device, language)
                composeTestRule.setContent {
                    TheWallBoycottAssistantTheme {
                        AppScaffold(currentScreen = Screen.UrlLookup) {
                            UrlLookupScreen()
                        }
                    }
                }
                composeTestRule.onRoot().captureRoboImage(
                    screenshotPath(device, language, 3)
                )
            }
        }
    }

    /**
     * Screenshot 4: AppListScreen — clean scan (no flagged apps).
     *
     * Generates for all locales and device types.
     * Waits for the locale-specific "clean scan" status text to appear.
     */
    @Test
    @Config(qualifiers = TestDevices.PHONE)
    fun screenshot_4_cleanScan() {
        for (language in SupportedLanguage.entries) {
            for (device in DEVICES) {
                applyQualifiers(device, language)
                val viewModel = createViewModel(
                    dbItems = emptyList(),
                    installedPackages = listOf(fakePackage("com.safe.app1"), fakePackage("com.safe.app2"))
                )
                composeTestRule.setContent {
                    TheWallBoycottAssistantTheme {
                        AppScaffold(currentScreen = Screen.List, scanState = ScanState.Scanning) {
                            AppListScreen(viewModel = viewModel)
                        }
                    }
                }
                val cleanStatus = composeTestRule.activity.getString(R.string.status_clean)
                composeTestRule.waitUntil(timeoutMillis = 10_000) {
                    try {
                        composeTestRule.onNodeWithText(cleanStatus, substring = true).assertExists()
                        true
                    } catch (_: AssertionError) { false }
                }
                composeTestRule.onRoot().captureRoboImage(
                    screenshotPath(device, language, 4)
                )
            }
        }
    }
}

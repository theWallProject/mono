package com.thewallboycott.android.screenshots

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import com.thewallboycott.android.Screen
import com.thewallboycott.android.ScanState
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
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Generates fastlane Play Store screenshots for all locales and device types.
 *
 * Output: `fastlane/metadata/android/{locale}/images/{phone|tablet}Screenshots/{1-4}.png`
 *
 * Screenshot mapping:
 * 1. StartScreen — idle, ready to scan
 * 2. AppListScreen — scan results with flagged apps
 * 3. UrlLookupScreen — empty state with help text
 * 4. AppListScreen — clean scan (no flagged apps)
 *
 * Run with: `pnpm test:screenshots` or as part of `pnpm test:record`
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class FastlaneScreenshotTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    companion object {
        /** Base path relative to app/ module root */
        private const val FASTLANE_BASE = "../fastlane/metadata/android"
    }

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

    // ==================== en-US Phone Screenshots ====================

    @Test
    @Config(qualifiers = TestDevices.PHONE)
    fun enUS_phone_1_startScreen() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.List, scanState = ScanState.Idle) {
                    StartScreen(onScanClicked = {}, onDebugTrigger = {})
                }
            }
        }
        composeTestRule.onRoot().captureRoboImage(
            "$FASTLANE_BASE/en-US/images/phoneScreenshots/1.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.PHONE)
    fun enUS_phone_2_scanResults() {
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
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Israeli", substring = true).assertExists()
                true
            } catch (_: AssertionError) { false }
        }
        composeTestRule.onRoot().captureRoboImage(
            "$FASTLANE_BASE/en-US/images/phoneScreenshots/2.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.PHONE)
    fun enUS_phone_3_urlLookup() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.UrlLookup) {
                    UrlLookupScreen()
                }
            }
        }
        composeTestRule.onRoot().captureRoboImage(
            "$FASTLANE_BASE/en-US/images/phoneScreenshots/3.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.PHONE)
    fun enUS_phone_4_cleanScan() {
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
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Making a Difference", substring = true).assertExists()
                true
            } catch (_: AssertionError) { false }
        }
        composeTestRule.onRoot().captureRoboImage(
            "$FASTLANE_BASE/en-US/images/phoneScreenshots/4.png"
        )
    }

    // ==================== en-US Tablet Screenshots ====================

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun enUS_tablet_1_startScreen() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.List, scanState = ScanState.Idle) {
                    StartScreen(onScanClicked = {}, onDebugTrigger = {})
                }
            }
        }
        composeTestRule.onRoot().captureRoboImage(
            "$FASTLANE_BASE/en-US/images/tabletScreenshots/1.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun enUS_tablet_2_scanResults() {
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
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Israeli", substring = true).assertExists()
                true
            } catch (_: AssertionError) { false }
        }
        composeTestRule.onRoot().captureRoboImage(
            "$FASTLANE_BASE/en-US/images/tabletScreenshots/2.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun enUS_tablet_3_urlLookup() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.UrlLookup) {
                    UrlLookupScreen()
                }
            }
        }
        composeTestRule.onRoot().captureRoboImage(
            "$FASTLANE_BASE/en-US/images/tabletScreenshots/3.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun enUS_tablet_4_cleanScan() {
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
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Making a Difference", substring = true).assertExists()
                true
            } catch (_: AssertionError) { false }
        }
        composeTestRule.onRoot().captureRoboImage(
            "$FASTLANE_BASE/en-US/images/tabletScreenshots/4.png"
        )
    }
}

package com.thewallboycott.android.ui.screens

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
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Screenshot tests for [AppListScreen] with various scan states.
 *
 * Uses [AppListViewModel] with fake [AppScanner] data to render
 * realistic UI states without requiring installed apps or real database loading.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = TestDevices.PHONE)
class AppListScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

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
        n = "BDS Target Corp",
        androidAppIds = listOf("com.bdstarget.app")
    )

    private val fakeHintApp = AllItem(
        id = "test_hint",
        r = emptyList(),
        n = "News App",
        isHint = true,
        hintText = "Try Newscord for less biased news",
        hintAndroidId = "com.newscord.app",
        androidAppIds = listOf("com.newsapp.main")
    )

    private fun fakePackage(packageName: String, label: String): PackageInfo {
        return PackageInfo().apply {
            this.packageName = packageName
            applicationInfo = ApplicationInfo().apply {
                this.flags = 0
                // Note: loadLabel() won't return the custom label in Robolectric
                // unless we use ShadowPackageManager. For screenshots, the package name is shown.
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

    // ==================== Clean Scan (No Flagged Apps) ====================

    @Test
    fun appListScreen_cleanScan_phone() {
        val viewModel = createViewModel(
            dbItems = emptyList(),
            installedPackages = listOf(
                fakePackage("com.safe.app1", "Safe App 1"),
                fakePackage("com.safe.app2", "Safe App 2")
            )
        )

        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(
                    currentScreen = Screen.List,
                    scanState = ScanState.Scanning
                ) {
                    AppListScreen(viewModel = viewModel)
                }
            }
        }

        // Wait for the "You're Making a Difference!" success card to appear
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Making a Difference", substring = true).assertExists()
                true
            } catch (_: AssertionError) {
                false
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/AppListScreen_clean_phone.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun appListScreen_cleanScan_tablet() {
        val viewModel = createViewModel(
            dbItems = emptyList(),
            installedPackages = listOf(
                fakePackage("com.safe.app1", "Safe App 1"),
                fakePackage("com.safe.app2", "Safe App 2")
            )
        )

        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(
                    currentScreen = Screen.List,
                    scanState = ScanState.Scanning
                ) {
                    AppListScreen(viewModel = viewModel)
                }
            }
        }

        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Making a Difference", substring = true).assertExists()
                true
            } catch (_: AssertionError) {
                false
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/AppListScreen_clean_tablet.png"
        )
    }

    // ==================== Flagged Apps ====================

    @Test
    fun appListScreen_flaggedApps_phone() {
        val viewModel = createViewModel(
            dbItems = listOf(fakeIsraeliApp, fakeBdsApp),
            installedPackages = listOf(
                fakePackage("com.wix.android", "Wix"),
                fakePackage("com.bdstarget.app", "BDS Target"),
                fakePackage("com.safe.app", "Safe App")
            )
        )

        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(
                    currentScreen = Screen.List,
                    scanState = ScanState.Scanning
                ) {
                    AppListScreen(viewModel = viewModel)
                }
            }
        }

        // Wait for Israeli apps section to appear
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Israeli", substring = true).assertExists()
                true
            } catch (_: AssertionError) {
                false
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/AppListScreen_flagged_phone.png"
        )
    }

    // ==================== Mixed Results (Israeli + BDS + Hints) ====================

    @Test
    fun appListScreen_mixedResults_phone() {
        val viewModel = createViewModel(
            dbItems = listOf(fakeIsraeliApp, fakeBdsApp, fakeHintApp),
            installedPackages = listOf(
                fakePackage("com.wix.android", "Wix"),
                fakePackage("com.bdstarget.app", "BDS Target"),
                fakePackage("com.newsapp.main", "News App"),
                fakePackage("com.safe.app", "Safe App")
            )
        )

        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(
                    currentScreen = Screen.List,
                    scanState = ScanState.Scanning
                ) {
                    AppListScreen(viewModel = viewModel)
                }
            }
        }

        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Israeli", substring = true).assertExists()
                true
            } catch (_: AssertionError) {
                false
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/AppListScreen_mixed_phone.png"
        )
    }
}

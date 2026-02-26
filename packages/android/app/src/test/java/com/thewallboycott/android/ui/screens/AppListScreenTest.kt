package com.thewallboycott.android.ui.screens

import android.content.pm.PackageInfo
import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import com.thewallboycott.android.Screen
import com.thewallboycott.android.ScanState
import com.thewallboycott.android.data.AppScanner
import com.thewallboycott.android.data.DatabaseProvider
import com.thewallboycott.android.data.OfferPreferences
import com.thewallboycott.android.data.PackageScanner
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.data.models.Alternative
import com.thewallboycott.android.testutil.FakePackages
import com.thewallboycott.android.testutil.TestDevices
import com.thewallboycott.android.ui.AppScaffold
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import org.junit.Before
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

    @Before
    fun setup() {
        // Clear offer preferences before each test to avoid cross-test contamination
        OfferPreferences(ApplicationProvider.getApplicationContext()).clear()
    }

    // ==================== Test Data ====================

    private val fakeIsraeliApp = AllItem(
        id = "wix",
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
        id = "manual_ws_booking_com",
        r = listOf("BDS_PRESSURE"),
        n = "Booking",
        androidAppIds = listOf("com.booking")
    )

    private val fakeHintApp = AllItem(
        id = "hint_ws_CNN_0",
        r = emptyList(),
        n = "CNN",
        isHint = true,
        hintText = "Hey, CNN is biased. Use Newscord for more balanced news.",
        hintAndroidId = "com.newscord.newscord",
        androidAppIds = listOf("com.cnn.mobile.android.phone")
    )

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
                FakePackages.safeApp1(),
                FakePackages.safeApp2()
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
                FakePackages.safeApp1(),
                FakePackages.safeApp2()
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
                FakePackages.wix(),
                FakePackages.booking(),
                FakePackages.safeApp()
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
                FakePackages.wix(),
                FakePackages.booking(),
                FakePackages.cnn(),
                FakePackages.safeApp()
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

    // ==================== Replacement Offer Cards ====================

    @Test
    fun appListScreen_replacementOffers_phone() {
        // Pre-populate saved offers (simulating previously uninstalled apps)
        val offerPrefs = OfferPreferences(ApplicationProvider.getApplicationContext())
        offerPrefs.saveOffer(
            packageName = "com.wix.android",
            appName = "Wix",
            entityName = "Wix",
            alternatives = listOf(
                Alternative("Jimdo", "https://www.jimdo.com"),
                Alternative("Webnode", "https://www.webnode.com")
            )
        )

        val viewModel = createViewModel(
            dbItems = emptyList(),
            installedPackages = listOf(
                FakePackages.safeApp1()
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

        // Wait for the replacement section to appear
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Alternatives for Removed Apps", substring = true).assertExists()
                true
            } catch (_: AssertionError) {
                false
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/AppListScreen_replacement_phone.png"
        )
    }

    // ==================== Flagged Apps with Alternatives ====================

    @Test
    fun appListScreen_flaggedWithAlternatives_phone() {
        val appWithAlternatives = AllItem(
            id = "test_wix_alt",
            r = listOf("h"),
            n = "Wix",
            ws = "wix.com",
            androidDevId = "com.wix",
            alt = listOf(
                Alternative("Jimdo", "https://www.jimdo.com"),
                Alternative("Webnode", "https://www.webnode.com"),
                Alternative("Squarespace", "https://www.squarespace.com")
            )
        )

        val viewModel = createViewModel(
            dbItems = listOf(appWithAlternatives),
            installedPackages = listOf(
                FakePackages.wix(),
                FakePackages.safeApp()
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

        // Wait for the alternatives sub-card to appear
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            try {
                composeTestRule.onNodeWithText("Jimdo", substring = true).assertExists()
                true
            } catch (_: AssertionError) {
                false
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/AppListScreen_flagged_alternatives_phone.png"
        )
    }
}

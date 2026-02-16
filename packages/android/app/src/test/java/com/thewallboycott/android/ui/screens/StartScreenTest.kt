package com.thewallboycott.android.ui.screens

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import com.thewallboycott.android.Screen
import com.thewallboycott.android.ScanState
import com.thewallboycott.android.testutil.TestDevices
import com.thewallboycott.android.ui.AppScaffold
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Screenshot and interaction tests for [StartScreen].
 * Renders inside [AppScaffold] for full-app screenshots.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = TestDevices.PHONE)
class StartScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun startScreen_phone_screenshot() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(
                    currentScreen = Screen.List,
                    scanState = ScanState.Idle
                ) {
                    StartScreen(
                        onScanClicked = {},
                        onDebugTrigger = {}
                    )
                }
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/StartScreen_phone.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun startScreen_tablet_screenshot() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(
                    currentScreen = Screen.List,
                    scanState = ScanState.Idle
                ) {
                    StartScreen(
                        onScanClicked = {},
                        onDebugTrigger = {}
                    )
                }
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/StartScreen_tablet.png"
        )
    }

    @Test
    fun startScreen_scanButton_triggersCallback() {
        var scanClicked = false
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                StartScreen(
                    onScanClicked = { scanClicked = true },
                    onDebugTrigger = {}
                )
            }
        }

        composeTestRule
            .onNodeWithText("Scan Installed Apps", substring = true)
            .performClick()

        assertTrue("Scan button should trigger callback", scanClicked)
    }
}

package com.thewallboycott.android.smoke

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import com.thewallboycott.android.Screen
import com.thewallboycott.android.ScanState
import com.thewallboycott.android.testutil.TestDevices
import com.thewallboycott.android.ui.AppScaffold
import com.thewallboycott.android.ui.screens.StartScreen
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Smoke test that verifies the entire test toolchain works:
 * Robolectric boots, Compose renders the full app shell (top bar + bottom nav),
 * and Roborazzi captures a screenshot.
 *
 * If this test passes, the infrastructure is correctly configured.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = TestDevices.PHONE)
class SmokeTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun startScreen_renders_with_full_scaffold() {
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

        // Verify key UI elements are present
        composeTestRule
            .onNodeWithText("Scan Installed Apps", substring = true)
            .assertExists()

        // Capture full-app screenshot with header and bottom navigation.
        // Path is relative to the module root (app/).
        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/smoke_StartScreen_phone.png"
        )
    }
}

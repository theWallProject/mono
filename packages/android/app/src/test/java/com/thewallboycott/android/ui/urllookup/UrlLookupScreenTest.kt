package com.thewallboycott.android.ui.urllookup

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onRoot
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import com.thewallboycott.android.Screen
import com.thewallboycott.android.testutil.TestDevices
import com.thewallboycott.android.ui.AppScaffold
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Screenshot tests for [UrlLookupScreen].
 * Renders the empty/idle state inside the full app scaffold.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = TestDevices.PHONE)
class UrlLookupScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun urlLookupScreen_idle_phone() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.UrlLookup) {
                    UrlLookupScreen()
                }
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/UrlLookupScreen_idle_phone.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun urlLookupScreen_idle_tablet() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.UrlLookup) {
                    UrlLookupScreen()
                }
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/UrlLookupScreen_idle_tablet.png"
        )
    }
}

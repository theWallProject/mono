package com.thewallboycott.android.ui.screens

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
 * Screenshot tests for [SettingsScreen].
 * Renders the settings UI with language selection inside the full app scaffold.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = TestDevices.PHONE)
class SettingsScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun settingsScreen_phone() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.Settings) {
                    SettingsScreen()
                }
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/SettingsScreen_phone.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun settingsScreen_tablet() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.Settings) {
                    SettingsScreen()
                }
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/SettingsScreen_tablet.png"
        )
    }
}

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
 * Screenshot tests for [SupportScreen].
 * Renders the support/donation UI inside the full app scaffold.
 *
 * Note: BillingManager interactions are not available in Robolectric,
 * so the screen renders in its default (not subscribed) state.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = TestDevices.PHONE)
class SupportScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun supportScreen_phone() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.Support) {
                    SupportScreen()
                }
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/SupportScreen_phone.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun supportScreen_tablet() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                AppScaffold(currentScreen = Screen.Support) {
                    SupportScreen()
                }
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/SupportScreen_tablet.png"
        )
    }
}

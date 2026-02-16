package com.thewallboycott.android.ui.onboarding

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onRoot
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import com.thewallboycott.android.testutil.TestDevices
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Screenshot tests for [OnboardingScreen].
 * Captures the first page of the onboarding pager.
 *
 * Note: OnboardingScreen is a full-screen experience (no AppScaffold)
 * since it appears before the main app.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = TestDevices.PHONE)
class OnboardingScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun onboardingScreen_firstPage_phone() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                OnboardingScreen(onComplete = {})
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/OnboardingScreen_phone.png"
        )
    }

    @Test
    @Config(qualifiers = TestDevices.TABLET)
    fun onboardingScreen_firstPage_tablet() {
        composeTestRule.setContent {
            TheWallBoycottAssistantTheme {
                OnboardingScreen(onComplete = {})
            }
        }

        composeTestRule.onRoot().captureRoboImage(
            filePath = "src/test/snapshots/OnboardingScreen_tablet.png"
        )
    }
}

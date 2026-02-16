package com.thewallboycott.android.data

import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [OnboardingPreferences] — tracks whether onboarding is completed.
 * Uses Robolectric's isolated SharedPreferences per test.
 */
@RunWith(AndroidJUnit4::class)
class OnboardingPreferencesTest {

    private lateinit var prefs: OnboardingPreferences

    @Before
    fun setup() {
        prefs = OnboardingPreferences(ApplicationProvider.getApplicationContext())
        prefs.reset()
    }

    @Test
    fun defaultState_isNotCompleted() {
        assertFalse(prefs.isOnboardingCompleted())
    }

    @Test
    fun setCompleted_persistsState() {
        prefs.setOnboardingCompleted()
        assertTrue(prefs.isOnboardingCompleted())
    }

    @Test
    fun reset_clearsCompletedState() {
        prefs.setOnboardingCompleted()
        assertTrue(prefs.isOnboardingCompleted())

        prefs.reset()
        assertFalse(prefs.isOnboardingCompleted())
    }

    @Test
    fun completedState_survivesNewInstance() {
        prefs.setOnboardingCompleted()

        // Create a new instance pointing to the same SharedPreferences
        val prefs2 = OnboardingPreferences(ApplicationProvider.getApplicationContext())
        assertTrue(prefs2.isOnboardingCompleted())
    }
}

package com.thewallboycott.android.data

import android.content.Context
import android.content.SharedPreferences

/**
 * Handles persistence for onboarding state.
 * Tracks whether the user has completed the onboarding flow.
 */
class OnboardingPreferences(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "onboarding_prefs"
        private const val KEY_ONBOARDING_COMPLETED = "onboarding_completed"
    }

    /**
     * Check if the user has completed the onboarding flow.
     */
    fun isOnboardingCompleted(): Boolean {
        return prefs.getBoolean(KEY_ONBOARDING_COMPLETED, false)
    }

    /**
     * Mark the onboarding as completed.
     */
    fun setOnboardingCompleted() {
        prefs.edit().putBoolean(KEY_ONBOARDING_COMPLETED, true).apply()
    }

    /**
     * Reset onboarding state (for testing).
     */
    fun reset() {
        prefs.edit().remove(KEY_ONBOARDING_COMPLETED).apply()
    }
}

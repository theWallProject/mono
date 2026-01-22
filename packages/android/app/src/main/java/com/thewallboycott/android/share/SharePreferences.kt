package com.thewallboycott.android.share

import android.content.Context
import android.content.SharedPreferences

/**
 * Manages share-related preferences including cooldowns, frequency caps,
 * and tracking for gamification features.
 */
class SharePreferences(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(
        PREFS_NAME,
        Context.MODE_PRIVATE
    )

    companion object {
        private const val PREFS_NAME = "share_preferences"

        // Cooldown keys
        private const val KEY_LAST_DISMISS_NO_APPS = "last_dismiss_no_apps"
        private const val KEY_LAST_DISMISS_APPS_FOUND = "last_dismiss_apps_found"
        private const val KEY_LAST_DISMISS_APP_REMOVED = "last_dismiss_app_removed"

        // Session keys
        private const val KEY_SESSION_ID = "session_id"
        private const val KEY_SHOWN_NO_APPS_SESSION = "shown_no_apps_session"
        private const val KEY_SHOWN_APPS_FOUND_SESSION = "shown_apps_found_session"

        // One-time flags
        private const val KEY_SUPPORTER_SHARE_SHOWN = "supporter_share_shown"

        // Gamification tracking
        private const val KEY_TOTAL_SHARES = "total_shares"
        private const val KEY_LAST_MILESTONE_SHOWN = "last_milestone_shown"

        // Cooldown durations (in milliseconds)
        private const val COOLDOWN_7_DAYS = 7L * 24 * 60 * 60 * 1000
        private const val COOLDOWN_24_HOURS = 24L * 60 * 60 * 1000
    }

    // ========================================================================
    // Session Management
    // ========================================================================

    /**
     * Get or create a session ID. A new session starts when the app is opened.
     */
    private var currentSessionId: String? = null

    fun startNewSession(): String {
        val newSessionId = System.currentTimeMillis().toString()
        currentSessionId = newSessionId
        prefs.edit().putString(KEY_SESSION_ID, newSessionId).apply()
        // Reset session-specific flags
        prefs.edit()
            .remove(KEY_SHOWN_NO_APPS_SESSION)
            .remove(KEY_SHOWN_APPS_FOUND_SESSION)
            .apply()
        return newSessionId
    }

    private fun getSessionId(): String {
        return currentSessionId ?: prefs.getString(KEY_SESSION_ID, "") ?: ""
    }

    // ========================================================================
    // Frequency Caps - NO_APPS_FOUND
    // ========================================================================

    /**
     * Check if we should show the "no apps found" share prompt.
     * Rules: 1x per session, 7-day cooldown after dismiss.
     */
    fun shouldShowNoAppsPrompt(): Boolean {
        // Check session cap
        val shownSession = prefs.getString(KEY_SHOWN_NO_APPS_SESSION, null)
        if (shownSession == getSessionId()) {
            return false
        }

        // Check cooldown from last dismiss
        val lastDismiss = prefs.getLong(KEY_LAST_DISMISS_NO_APPS, 0)
        if (System.currentTimeMillis() - lastDismiss < COOLDOWN_7_DAYS) {
            return false
        }

        return true
    }

    /**
     * Mark that the "no apps found" prompt was shown this session.
     */
    fun markNoAppsPromptShown() {
        prefs.edit()
            .putString(KEY_SHOWN_NO_APPS_SESSION, getSessionId())
            .apply()
    }

    /**
     * Record that the user dismissed the "no apps found" prompt.
     */
    fun recordNoAppsDismiss() {
        prefs.edit()
            .putLong(KEY_LAST_DISMISS_NO_APPS, System.currentTimeMillis())
            .apply()
    }

    // ========================================================================
    // Frequency Caps - APPS_FOUND
    // ========================================================================

    /**
     * Check if we should show the "apps found" share prompt.
     * Rules: 1x per session, 7-day cooldown after dismiss.
     */
    fun shouldShowAppsFoundPrompt(): Boolean {
        // Check session cap
        val shownSession = prefs.getString(KEY_SHOWN_APPS_FOUND_SESSION, null)
        if (shownSession == getSessionId()) {
            return false
        }

        // Check cooldown from last dismiss
        val lastDismiss = prefs.getLong(KEY_LAST_DISMISS_APPS_FOUND, 0)
        if (System.currentTimeMillis() - lastDismiss < COOLDOWN_7_DAYS) {
            return false
        }

        return true
    }

    /**
     * Mark that the "apps found" prompt was shown this session.
     */
    fun markAppsFoundPromptShown() {
        prefs.edit()
            .putString(KEY_SHOWN_APPS_FOUND_SESSION, getSessionId())
            .apply()
    }

    /**
     * Record that the user dismissed the "apps found" prompt.
     */
    fun recordAppsFoundDismiss() {
        prefs.edit()
            .putLong(KEY_LAST_DISMISS_APPS_FOUND, System.currentTimeMillis())
            .apply()
    }

    // ========================================================================
    // Frequency Caps - APP_REMOVED
    // ========================================================================

    /**
     * Check if we should show the "app removed" share prompt.
     * Rules: Every removal, 24-hour cooldown after dismiss.
     */
    fun shouldShowAppRemovedPrompt(): Boolean {
        val lastDismiss = prefs.getLong(KEY_LAST_DISMISS_APP_REMOVED, 0)
        return System.currentTimeMillis() - lastDismiss >= COOLDOWN_24_HOURS
    }

    /**
     * Record that the user dismissed the "app removed" prompt.
     */
    fun recordAppRemovedDismiss() {
        prefs.edit()
            .putLong(KEY_LAST_DISMISS_APP_REMOVED, System.currentTimeMillis())
            .apply()
    }

    // ========================================================================
    // One-Time Flags - NEW_SUPPORTER
    // ========================================================================

    /**
     * Check if we should show the supporter share prompt.
     * Rules: 1x ever, never show again.
     */
    fun shouldShowSupporterPrompt(): Boolean {
        return !prefs.getBoolean(KEY_SUPPORTER_SHARE_SHOWN, false)
    }

    /**
     * Mark that the supporter prompt was shown (never show again).
     */
    fun markSupporterPromptShown() {
        prefs.edit()
            .putBoolean(KEY_SUPPORTER_SHARE_SHOWN, true)
            .apply()
    }

    // ========================================================================
    // Gamification Tracking
    // ========================================================================

    /**
     * Get the total number of shares.
     */
    fun getTotalShares(): Int {
        return prefs.getInt(KEY_TOTAL_SHARES, 0)
    }

    /**
     * Increment the share count and return the new total.
     */
    fun incrementShareCount(): Int {
        val newTotal = getTotalShares() + 1
        prefs.edit().putInt(KEY_TOTAL_SHARES, newTotal).apply()
        return newTotal
    }

    /**
     * Get the milestone tier for a share count.
     * Returns: 0 = none, 1 = Voice of Change (1), 5 = Advocate (5), 10 = Champion (10), 25 = Legend (25)
     */
    fun getMilestoneTier(shareCount: Int): Int = when {
        shareCount >= 25 -> 25
        shareCount >= 10 -> 10
        shareCount >= 5 -> 5
        shareCount >= 1 -> 1
        else -> 0
    }

    /**
     * Get the milestone name for a tier.
     */
    fun getMilestoneName(tier: Int): String = when (tier) {
        1 -> "First Share"
        5 -> "Voice of Change"
        10 -> "Advocate"
        25 -> "Champion"
        else -> ""
    }

    /**
     * Check if a new milestone was reached and should be shown.
     * Returns the milestone tier if new, null otherwise.
     */
    fun checkNewMilestone(shareCount: Int): Int? {
        val currentTier = getMilestoneTier(shareCount)
        val lastShownTier = prefs.getInt(KEY_LAST_MILESTONE_SHOWN, 0)

        return if (currentTier > lastShownTier) {
            prefs.edit().putInt(KEY_LAST_MILESTONE_SHOWN, currentTier).apply()
            currentTier
        } else {
            null
        }
    }

    // ========================================================================
    // Utility
    // ========================================================================

    /**
     * Clear all share preferences (for testing/debugging).
     */
    fun clearAll() {
        prefs.edit().clear().apply()
        currentSessionId = null
    }
}

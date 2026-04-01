package com.thewallboycott.android.accessibility

import android.content.Context
import android.provider.Settings
import android.content.Intent
import android.net.Uri

/**
 * Manages LinkedIn accessibility feature preferences and permissions.
 * 
 * Stores:
 * - Feature enabled/disabled state
 * - Last detection timestamp
 * 
 * Also provides helpers for checking permission states.
 */
class AccessibilityPreferences(private val context: Context) {
    
    companion object {
        private const val PREFS_NAME = "linkedin_accessibility"
        private const val KEY_ENABLED = "enabled"
        private const val KEY_LAST_DETECTION = "last_detection_timestamp"
        private const val KEY_LAST_FLAGGED_COUNT = "last_flagged_count"
        
        /**
         * Check if this app has accessibility permission.
         */
        fun hasAccessibilityPermission(context: Context): Boolean {
            val expectedService = "${context.packageName}/${LinkedInAccessibilityService::class.java.name}"
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            
            return enabledServices.contains(expectedService)
        }
        
        /**
         * Check if this app has overlay permission (draw over other apps).
         */
        fun hasOverlayPermission(context: Context): Boolean {
            return Settings.canDrawOverlays(context)
        }
        
        /**
         * Create intent to open accessibility settings.
         */
        fun createAccessibilitySettingsIntent(): Intent {
            return Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        }
        
        /**
         * Create intent to open overlay settings.
         */
        fun createOverlaySettingsIntent(context: Context): Intent {
            return Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        }
    }
    
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    
    /**
     * Check if the feature is enabled by user.
     */
    fun isEnabled(): Boolean = prefs.getBoolean(KEY_ENABLED, false)
    
    /**
     * Set feature enabled state.
     */
    fun setEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_ENABLED, enabled).apply()
    }
    
    /**
     * Get timestamp of last detection.
     */
    fun getLastDetectionTime(): Long = prefs.getLong(KEY_LAST_DETECTION, 0)
    
    /**
     * Update last detection timestamp.
     */
    fun setLastDetectionTime(timestamp: Long = System.currentTimeMillis()) {
        prefs.edit().putLong(KEY_LAST_DETECTION, timestamp).apply()
    }
    
    /**
     * Get count of flagged companies from last detection.
     */
    fun getLastFlaggedCount(): Int = prefs.getInt(KEY_LAST_FLAGGED_COUNT, 0)
    
    /**
     * Update last flagged count.
     */
    fun setLastFlaggedCount(count: Int) {
        prefs.edit().putInt(KEY_LAST_FLAGGED_COUNT, count).apply()
    }
    
    /**
     * Clear all preferences (for debugging/testing).
     */
    fun clear() {
        prefs.edit().clear().apply()
    }
}
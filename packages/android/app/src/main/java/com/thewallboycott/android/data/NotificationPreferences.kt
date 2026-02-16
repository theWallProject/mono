package com.thewallboycott.android.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Handles persistence for notification-related state.
 * Stores:
 * - Previously seen apps (to detect new installations)
 * - Permanently ignored apps (won't be counted or notified)
 * - Snoozed apps (ignored for 1 month, then back to normal)
 * - Last notification timestamp (for 2-week reminder interval)
 *
 * @param clock Injectable clock for deterministic time-based testing.
 */
class NotificationPreferences(
    context: Context,
    private val clock: Clock = SystemClock
) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    companion object {
        private const val PREFS_NAME = "notification_prefs"
        private const val KEY_KNOWN_APPS = "known_apps"
        private const val KEY_IGNORED_APPS = "ignored_apps"
        private const val KEY_SNOOZED_APPS = "snoozed_apps"
        private const val KEY_LAST_NOTIFICATION_TIME = "last_notification_time"
        private const val KEY_LAST_NOTIFIED_APPS = "last_notified_apps"

        /** Duration for "remind later" snooze: 1 month in milliseconds */
        const val SNOOZE_DURATION_MS = 30L * 24 * 60 * 60 * 1000

        /** Interval for showing unchanged results: 2 weeks in milliseconds */
        const val REMINDER_INTERVAL_MS = 14L * 24 * 60 * 60 * 1000
    }

    /**
     * Data class for snoozed app with expiry time.
     */
    data class SnoozedApp(
        val packageName: String,
        val expiryTime: Long
    )

    /**
     * Get set of package names that were previously detected.
     * Used to determine which apps are "new".
     */
    fun getKnownApps(): Set<String> {
        val json = prefs.getString(KEY_KNOWN_APPS, null) ?: return emptySet()
        val type = object : TypeToken<Set<String>>() {}.type
        return try {
            gson.fromJson(json, type) ?: emptySet()
        } catch (e: Exception) {
            emptySet()
        }
    }

    /**
     * Save the current set of detected apps as "known".
     */
    fun setKnownApps(apps: Set<String>) {
        val json = gson.toJson(apps)
        prefs.edit().putString(KEY_KNOWN_APPS, json).apply()
    }

    /**
     * Add new apps to the known set.
     */
    fun addToKnownApps(apps: Set<String>) {
        val current = getKnownApps().toMutableSet()
        current.addAll(apps)
        setKnownApps(current)
    }

    /**
     * Get set of package names that are permanently ignored.
     */
    fun getIgnoredApps(): Set<String> {
        val json = prefs.getString(KEY_IGNORED_APPS, null) ?: return emptySet()
        val type = object : TypeToken<Set<String>>() {}.type
        return try {
            gson.fromJson(json, type) ?: emptySet()
        } catch (e: Exception) {
            emptySet()
        }
    }

    /**
     * Permanently ignore an app - will not be counted or shown in notifications.
     */
    fun ignoreApp(packageName: String) {
        val current = getIgnoredApps().toMutableSet()
        current.add(packageName)
        val json = gson.toJson(current)
        prefs.edit().putString(KEY_IGNORED_APPS, json).apply()

        // Also remove from snoozed if present
        unsnoozApp(packageName)
    }

    /**
     * Check if an app is permanently ignored.
     */
    fun isIgnored(packageName: String): Boolean {
        return getIgnoredApps().contains(packageName)
    }

    /**
     * Remove an app from the ignored list (restore notifications for it).
     */
    fun unignoreApp(packageName: String) {
        val current = getIgnoredApps().toMutableSet()
        if (current.contains(packageName)) {
            current.remove(packageName)
            val json = gson.toJson(current)
            prefs.edit().putString(KEY_IGNORED_APPS, json).apply()
        }
    }

    /**
     * Get map of snoozed apps with their expiry times.
     * Automatically cleans up expired snoozes.
     */
    fun getSnoozedApps(): Map<String, Long> {
        val json = prefs.getString(KEY_SNOOZED_APPS, null) ?: return emptyMap()
        val type = object : TypeToken<Map<String, Long>>() {}.type
        val all: Map<String, Long> = try {
            gson.fromJson(json, type) ?: emptyMap()
        } catch (e: Exception) {
            emptyMap()
        }

        // Filter out expired snoozes
        val now = clock.currentTimeMillis()
        val active = all.filter { it.value > now }

        // If some expired, update storage
        if (active.size != all.size) {
            val activeJson = gson.toJson(active)
            prefs.edit().putString(KEY_SNOOZED_APPS, activeJson).apply()
        }

        return active
    }

    /**
     * Snooze an app for the configured duration (1 month).
     */
    fun snoozeApp(packageName: String) {
        val current = getSnoozedApps().toMutableMap()
        current[packageName] = clock.currentTimeMillis() + SNOOZE_DURATION_MS
        val json = gson.toJson(current)
        prefs.edit().putString(KEY_SNOOZED_APPS, json).apply()
    }

    /**
     * Remove an app from snoozed list.
     */
    fun unsnoozApp(packageName: String) {
        val current = getSnoozedApps().toMutableMap()
        if (current.containsKey(packageName)) {
            current.remove(packageName)
            val json = gson.toJson(current)
            prefs.edit().putString(KEY_SNOOZED_APPS, json).apply()
        }
    }

    /**
     * Check if an app is currently snoozed (and not expired).
     */
    fun isSnoozed(packageName: String): Boolean {
        return getSnoozedApps().containsKey(packageName)
    }

    /**
     * Check if an app should be excluded from notifications (ignored or snoozed).
     */
    fun shouldExcludeFromNotification(packageName: String): Boolean {
        return isIgnored(packageName) || isSnoozed(packageName)
    }

    /**
     * Get timestamp of last notification.
     */
    fun getLastNotificationTime(): Long {
        return prefs.getLong(KEY_LAST_NOTIFICATION_TIME, 0)
    }

    /**
     * Update last notification timestamp to now.
     */
    fun setLastNotificationTime() {
        prefs.edit().putLong(KEY_LAST_NOTIFICATION_TIME, clock.currentTimeMillis()).apply()
    }

    /**
     * Check if enough time has passed since last notification for a reminder.
     * Returns true if 2 weeks have passed.
     */
    fun shouldShowReminder(): Boolean {
        val lastTime = getLastNotificationTime()
        if (lastTime == 0L) return true
        return clock.currentTimeMillis() - lastTime >= REMINDER_INTERVAL_MS
    }

    /**
     * Get the set of apps that were included in the last notification.
     * Used to detect what's "new".
     */
    fun getLastNotifiedApps(): Set<String> {
        val json = prefs.getString(KEY_LAST_NOTIFIED_APPS, null) ?: return emptySet()
        val type = object : TypeToken<Set<String>>() {}.type
        return try {
            gson.fromJson(json, type) ?: emptySet()
        } catch (e: Exception) {
            emptySet()
        }
    }

    /**
     * Save the apps that were just notified about.
     */
    fun setLastNotifiedApps(apps: Set<String>) {
        val json = gson.toJson(apps)
        prefs.edit().putString(KEY_LAST_NOTIFIED_APPS, json).apply()
    }

    /**
     * Clear all preferences (for testing).
     */
    fun clear() {
        prefs.edit().clear().apply()
    }
}

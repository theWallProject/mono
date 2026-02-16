package com.thewallboycott.android.data

import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.thewallboycott.android.testutil.TestClock
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [NotificationPreferences] — manages notification state with
 * injectable [Clock] for deterministic time-dependent tests.
 */
@RunWith(AndroidJUnit4::class)
class NotificationPreferencesTest {

    private lateinit var clock: TestClock
    private lateinit var prefs: NotificationPreferences

    @Before
    fun setup() {
        clock = TestClock(initialTimeMillis = 1_000_000_000_000L) // ~Sep 2001, arbitrary fixed start
        prefs = NotificationPreferences(ApplicationProvider.getApplicationContext(), clock)
        prefs.clear()
    }

    // ==================== Known Apps ====================

    @Test
    fun knownApps_defaultEmpty() {
        assertEquals(emptySet<String>(), prefs.getKnownApps())
    }

    @Test
    fun setKnownApps_persistsSet() {
        val apps = setOf("com.wix.android", "com.fiverr.fiverr")
        prefs.setKnownApps(apps)
        assertEquals(apps, prefs.getKnownApps())
    }

    @Test
    fun addToKnownApps_mergesWithExisting() {
        prefs.setKnownApps(setOf("com.wix.android"))
        prefs.addToKnownApps(setOf("com.fiverr.fiverr"))
        assertEquals(setOf("com.wix.android", "com.fiverr.fiverr"), prefs.getKnownApps())
    }

    // ==================== Ignored Apps ====================

    @Test
    fun ignoredApps_defaultEmpty() {
        assertEquals(emptySet<String>(), prefs.getIgnoredApps())
    }

    @Test
    fun ignoreApp_addsToIgnoredSet() {
        prefs.ignoreApp("com.wix.android")
        assertTrue(prefs.isIgnored("com.wix.android"))
        assertFalse(prefs.isIgnored("com.fiverr.fiverr"))
    }

    @Test
    fun unignoreApp_removesFromIgnoredSet() {
        prefs.ignoreApp("com.wix.android")
        prefs.unignoreApp("com.wix.android")
        assertFalse(prefs.isIgnored("com.wix.android"))
    }

    @Test
    fun ignoreApp_alsoRemovesFromSnoozed() {
        prefs.snoozeApp("com.wix.android")
        assertTrue(prefs.isSnoozed("com.wix.android"))

        prefs.ignoreApp("com.wix.android")
        assertTrue(prefs.isIgnored("com.wix.android"))
        assertFalse(prefs.isSnoozed("com.wix.android"))
    }

    // ==================== Snoozed Apps ====================

    @Test
    fun snoozedApps_defaultEmpty() {
        assertEquals(emptyMap<String, Long>(), prefs.getSnoozedApps())
    }

    @Test
    fun snoozeApp_addsSnoozedWithExpiryInFuture() {
        prefs.snoozeApp("com.wix.android")
        assertTrue(prefs.isSnoozed("com.wix.android"))

        val snoozed = prefs.getSnoozedApps()
        assertEquals(1, snoozed.size)
        val expiryTime = snoozed["com.wix.android"]!!
        assertEquals(clock.currentTimeMillis() + NotificationPreferences.SNOOZE_DURATION_MS, expiryTime)
    }

    @Test
    fun snoozeApp_expiresAfterDuration() {
        prefs.snoozeApp("com.wix.android")
        assertTrue(prefs.isSnoozed("com.wix.android"))

        // Advance time past snooze duration
        clock.advanceBy(NotificationPreferences.SNOOZE_DURATION_MS + 1)
        assertFalse(prefs.isSnoozed("com.wix.android"))
        assertEquals(emptyMap<String, Long>(), prefs.getSnoozedApps())
    }

    @Test
    fun snoozeApp_stillActiveBeforeExpiry() {
        prefs.snoozeApp("com.wix.android")

        // Advance time just before snooze expires
        clock.advanceBy(NotificationPreferences.SNOOZE_DURATION_MS - 1)
        assertTrue(prefs.isSnoozed("com.wix.android"))
    }

    @Test
    fun unsnoozApp_removesFromSnoozed() {
        prefs.snoozeApp("com.wix.android")
        prefs.unsnoozApp("com.wix.android")
        assertFalse(prefs.isSnoozed("com.wix.android"))
    }

    // ==================== Exclusion ====================

    @Test
    fun shouldExcludeFromNotification_trueForIgnored() {
        prefs.ignoreApp("com.wix.android")
        assertTrue(prefs.shouldExcludeFromNotification("com.wix.android"))
    }

    @Test
    fun shouldExcludeFromNotification_trueForSnoozed() {
        prefs.snoozeApp("com.wix.android")
        assertTrue(prefs.shouldExcludeFromNotification("com.wix.android"))
    }

    @Test
    fun shouldExcludeFromNotification_falseForUnknown() {
        assertFalse(prefs.shouldExcludeFromNotification("com.example.unknown"))
    }

    @Test
    fun shouldExcludeFromNotification_falseAfterSnoozeExpires() {
        prefs.snoozeApp("com.wix.android")
        clock.advanceBy(NotificationPreferences.SNOOZE_DURATION_MS + 1)
        assertFalse(prefs.shouldExcludeFromNotification("com.wix.android"))
    }

    // ==================== Reminder Timing ====================

    @Test
    fun shouldShowReminder_trueWhenNeverNotified() {
        assertTrue(prefs.shouldShowReminder())
    }

    @Test
    fun shouldShowReminder_falseImmediatelyAfterNotification() {
        prefs.setLastNotificationTime()
        assertFalse(prefs.shouldShowReminder())
    }

    @Test
    fun shouldShowReminder_trueAfterReminderInterval() {
        prefs.setLastNotificationTime()
        clock.advanceBy(NotificationPreferences.REMINDER_INTERVAL_MS)
        assertTrue(prefs.shouldShowReminder())
    }

    @Test
    fun shouldShowReminder_falseJustBeforeReminderInterval() {
        prefs.setLastNotificationTime()
        clock.advanceBy(NotificationPreferences.REMINDER_INTERVAL_MS - 1)
        assertFalse(prefs.shouldShowReminder())
    }

    // ==================== Last Notified Apps ====================

    @Test
    fun lastNotifiedApps_defaultEmpty() {
        assertEquals(emptySet<String>(), prefs.getLastNotifiedApps())
    }

    @Test
    fun setLastNotifiedApps_persistsSet() {
        val apps = setOf("com.wix.android", "com.fiverr.fiverr")
        prefs.setLastNotifiedApps(apps)
        assertEquals(apps, prefs.getLastNotifiedApps())
    }

    // ==================== Clear ====================

    @Test
    fun clear_removesAllState() {
        prefs.setKnownApps(setOf("com.wix.android"))
        prefs.ignoreApp("com.fiverr.fiverr")
        prefs.snoozeApp("com.example.app")
        prefs.setLastNotificationTime()
        prefs.setLastNotifiedApps(setOf("com.wix.android"))

        prefs.clear()

        assertEquals(emptySet<String>(), prefs.getKnownApps())
        assertEquals(emptySet<String>(), prefs.getIgnoredApps())
        assertEquals(emptyMap<String, Long>(), prefs.getSnoozedApps())
        assertEquals(0L, prefs.getLastNotificationTime())
        assertEquals(emptySet<String>(), prefs.getLastNotifiedApps())
    }
}

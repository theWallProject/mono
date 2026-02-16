package com.thewallboycott.android.background

import android.content.Context
import android.content.Intent
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.thewallboycott.android.data.NotificationPreferences
import com.thewallboycott.android.testutil.TestClock
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [NotificationActionReceiver] — the broadcast receiver
 * that handles "Ignore" and "Snooze" notification actions.
 */
@RunWith(AndroidJUnit4::class)
class NotificationActionReceiverTest {

    private lateinit var context: Context
    private lateinit var clock: TestClock
    private lateinit var prefs: NotificationPreferences
    private lateinit var receiver: NotificationActionReceiver

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        clock = TestClock(System.currentTimeMillis())
        prefs = NotificationPreferences(context, clock)
        receiver = NotificationActionReceiver()
    }

    // ==================== Intent Factory ====================

    @Test
    fun createIgnoreIntent_hasCorrectAction() {
        val intent = NotificationActionReceiver.createIgnoreIntent(context, "com.example.app", 123)
        assertTrue(
            "Intent should have IGNORE action",
            intent.action == NotificationActionReceiver.ACTION_IGNORE
        )
    }

    @Test
    fun createIgnoreIntent_hasCorrectExtras() {
        val intent = NotificationActionReceiver.createIgnoreIntent(context, "com.example.app", 123)
        assertTrue(
            "Intent should contain package name",
            intent.getStringExtra(NotificationActionReceiver.EXTRA_PACKAGE_NAME) == "com.example.app"
        )
        assertTrue(
            "Intent should contain notification ID",
            intent.getIntExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, 0) == 123
        )
    }

    @Test
    fun createSnoozeIntent_hasCorrectAction() {
        val intent = NotificationActionReceiver.createSnoozeIntent(context, "com.example.app", 456)
        assertTrue(
            "Intent should have SNOOZE action",
            intent.action == NotificationActionReceiver.ACTION_SNOOZE
        )
    }

    @Test
    fun createSnoozeIntent_hasCorrectExtras() {
        val intent = NotificationActionReceiver.createSnoozeIntent(context, "com.example.app", 456)
        assertTrue(
            "Intent should contain package name",
            intent.getStringExtra(NotificationActionReceiver.EXTRA_PACKAGE_NAME) == "com.example.app"
        )
        assertTrue(
            "Intent should contain notification ID",
            intent.getIntExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, 0) == 456
        )
    }

    // ==================== Ignore Action ====================

    @Test
    fun ignoreAction_persistsToPreferences() {
        val intent = NotificationActionReceiver.createIgnoreIntent(context, "com.flagged.app", 100)
        receiver.onReceive(context, intent)

        // The receiver creates its own NotificationPreferences, so read with a fresh one
        val freshPrefs = NotificationPreferences(context)
        assertTrue(
            "Ignored app should be excluded from notifications",
            freshPrefs.shouldExcludeFromNotification("com.flagged.app")
        )
    }

    @Test
    fun ignoreAction_doesNotAffectOtherApps() {
        val intent = NotificationActionReceiver.createIgnoreIntent(context, "com.flagged.app", 100)
        receiver.onReceive(context, intent)

        val freshPrefs = NotificationPreferences(context)
        assertFalse(
            "Other apps should not be affected",
            freshPrefs.shouldExcludeFromNotification("com.other.app")
        )
    }

    @Test
    fun ignoreAction_nullPackageName_doesNotCrash() {
        // Intent with action but no package name extra
        val intent = Intent(NotificationActionReceiver.ACTION_IGNORE)
        receiver.onReceive(context, intent)
        // Should not throw — the receiver guards against null
    }

    // ==================== Snooze Action ====================

    @Test
    fun snoozeAction_persistsToPreferences() {
        val intent = NotificationActionReceiver.createSnoozeIntent(context, "com.snoozed.app", 200)
        receiver.onReceive(context, intent)

        val freshPrefs = NotificationPreferences(context)
        assertTrue(
            "Snoozed app should be excluded from notifications",
            freshPrefs.shouldExcludeFromNotification("com.snoozed.app")
        )
    }

    @Test
    fun snoozeAction_nullPackageName_doesNotCrash() {
        val intent = Intent(NotificationActionReceiver.ACTION_SNOOZE)
        receiver.onReceive(context, intent)
        // Should not throw
    }

    // ==================== Unknown Action ====================

    @Test
    fun unknownAction_doesNotCrash() {
        val intent = Intent("com.thewallboycott.android.UNKNOWN_ACTION")
        receiver.onReceive(context, intent)
        // Should not throw — the when block simply doesn't match
    }
}

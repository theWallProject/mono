package com.thewallboycott.android.background

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import com.thewallboycott.android.data.NotificationPreferences

/**
 * BroadcastReceiver that handles notification action buttons.
 * Supports:
 * - IGNORE: Permanently ignore an app (never notify or count it again)
 * - SNOOZE: Temporarily ignore an app for 1 month
 * - DISMISS_ALL: Dismiss all notifications without any state changes
 */
class NotificationActionReceiver : BroadcastReceiver() {

    companion object {
        const val TAG = "NotificationAction"

        const val ACTION_IGNORE = "com.thewallboycott.android.ACTION_IGNORE"
        const val ACTION_SNOOZE = "com.thewallboycott.android.ACTION_SNOOZE"
        const val ACTION_DISMISS_ALL = "com.thewallboycott.android.ACTION_DISMISS_ALL"

        const val EXTRA_PACKAGE_NAME = "extra_package_name"
        const val EXTRA_NOTIFICATION_ID = "extra_notification_id"

        /**
         * Create an intent to ignore an app.
         */
        fun createIgnoreIntent(context: Context, packageName: String, notificationId: Int): Intent {
            return Intent(context, NotificationActionReceiver::class.java).apply {
                action = ACTION_IGNORE
                putExtra(EXTRA_PACKAGE_NAME, packageName)
                putExtra(EXTRA_NOTIFICATION_ID, notificationId)
            }
        }

        /**
         * Create an intent to snooze an app (remind later).
         */
        fun createSnoozeIntent(context: Context, packageName: String, notificationId: Int): Intent {
            return Intent(context, NotificationActionReceiver::class.java).apply {
                action = ACTION_SNOOZE
                putExtra(EXTRA_PACKAGE_NAME, packageName)
                putExtra(EXTRA_NOTIFICATION_ID, notificationId)
            }
        }

        /**
         * Create an intent to dismiss all notifications.
         */
        fun createDismissAllIntent(context: Context): Intent {
            return Intent(context, NotificationActionReceiver::class.java).apply {
                action = ACTION_DISMISS_ALL
            }
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d(TAG, "Received action: $action")

        val prefs = NotificationPreferences(context)
        val notificationManager = NotificationManagerCompat.from(context)

        when (action) {
            ACTION_IGNORE -> {
                val packageName = intent.getStringExtra(EXTRA_PACKAGE_NAME)
                val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, 0)

                if (packageName != null) {
                    Log.d(TAG, "Ignoring app: $packageName")
                    prefs.ignoreApp(packageName)

                    // Cancel this specific notification
                    notificationManager.cancel(notificationId)

                    // Update summary notification if needed
                    updateSummaryAfterAction(context, prefs, notificationManager)
                }
            }

            ACTION_SNOOZE -> {
                val packageName = intent.getStringExtra(EXTRA_PACKAGE_NAME)
                val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, 0)

                if (packageName != null) {
                    Log.d(TAG, "Snoozing app for 1 month: $packageName")
                    prefs.snoozeApp(packageName)

                    // Cancel this specific notification
                    notificationManager.cancel(notificationId)

                    // Update summary notification if needed
                    updateSummaryAfterAction(context, prefs, notificationManager)
                }
            }

            ACTION_DISMISS_ALL -> {
                Log.d(TAG, "Dismissing all notifications")
                // Cancel all notifications from our app
                notificationManager.cancelAll()
            }
        }
    }

    /**
     * Updates the summary notification after an action is taken on a child notification.
     * If no more apps remain to notify about, cancels the summary too.
     */
    private fun updateSummaryAfterAction(
        context: Context,
        prefs: NotificationPreferences,
        notificationManager: NotificationManagerCompat
    ) {
        // Get current notified apps and filter out ignored/snoozed
        val lastNotified = prefs.getLastNotifiedApps()
        val stillActive = lastNotified.filter { !prefs.shouldExcludeFromNotification(it) }

        if (stillActive.isEmpty()) {
            // No more apps to show - cancel summary
            notificationManager.cancel(ScanWorker.SUMMARY_NOTIFICATION_ID)
        }

        // Update the last notified apps to reflect current state
        prefs.setLastNotifiedApps(stillActive.toSet())
    }
}

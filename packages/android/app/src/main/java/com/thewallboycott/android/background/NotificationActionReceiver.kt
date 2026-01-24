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
 */
class NotificationActionReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "NotificationAction"

        const val ACTION_IGNORE = "com.thewallboycott.android.ACTION_IGNORE"
        const val ACTION_SNOOZE = "com.thewallboycott.android.ACTION_SNOOZE"

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
                    notificationManager.cancel(notificationId)
                }
            }

            ACTION_SNOOZE -> {
                val packageName = intent.getStringExtra(EXTRA_PACKAGE_NAME)
                val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, 0)

                if (packageName != null) {
                    Log.d(TAG, "Snoozing app for 1 month: $packageName")
                    prefs.snoozeApp(packageName)
                    notificationManager.cancel(notificationId)
                }
            }
        }
    }
}

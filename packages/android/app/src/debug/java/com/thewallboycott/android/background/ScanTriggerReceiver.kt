package com.thewallboycott.android.background

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

/**
 * Debug-only entry point that lets ADB enqueue a one-shot ScanWorker without
 * launching MainActivity. Registered via app/src/debug/AndroidManifest.xml so
 * it is stripped entirely from release builds.
 *
 * Trigger:
 *   adb shell am broadcast \
 *     -a com.thewallboycott.android.action.TRIGGER_SCAN \
 *     -p com.thewallboycott.android \
 *     --ez force_notify true
 *
 * The `force_notify=true` extra bypasses the dedup/recently-notified guard in
 * ScanWorker so the notification fires every time, which is what manual
 * testing wants.
 */
class ScanTriggerReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_TRIGGER_SCAN) {
            Log.d(TAG, "Ignoring non-trigger action: ${intent.action}")
            return
        }

        val forceNotify = intent.getBooleanExtra(EXTRA_FORCE_NOTIFY, true)
        Log.d(TAG, "Trigger received. forceNotify=$forceNotify — enqueuing ScanWorker")

        val scanRequest = OneTimeWorkRequestBuilder<ScanWorker>()
            .setInputData(
                Data.Builder()
                    .putBoolean(ScanWorker.INPUT_FORCE_NOTIFY, forceNotify)
                    .build()
            )
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            UNIQUE_WORK_NAME,
            ExistingWorkPolicy.REPLACE,
            scanRequest
        )
    }

    companion object {
        private const val TAG = "ScanTriggerReceiver"
        const val ACTION_TRIGGER_SCAN = "com.thewallboycott.android.action.TRIGGER_SCAN"
        const val EXTRA_FORCE_NOTIFY = "force_notify"
        private const val UNIQUE_WORK_NAME = "adb_trigger_scan"
    }
}

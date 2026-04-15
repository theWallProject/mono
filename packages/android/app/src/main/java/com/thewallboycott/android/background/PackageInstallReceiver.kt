package com.thewallboycott.android.background

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

/**
 * Receives [Intent.ACTION_PACKAGE_ADDED] broadcasts for near-instant detection
 * of newly installed boycotted apps.
 *
 * Registered programmatically in [com.thewallboycott.android.TheWallApp] because
 * ACTION_PACKAGE_ADDED is NOT on Android 8.0+'s implicit broadcast exemption list.
 * A manifest-declared receiver would be silently ignored on API 26+.
 *
 * Detection only works while the app process is alive. The existing 6-hour periodic
 * scan covers the gap when the process is dead.
 */
class PackageInstallReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "PackageInstallReceiver"
        internal const val REACTIVE_SCAN_WORK_NAME = "reactive_scan"
        internal const val INITIAL_DELAY_SECONDS = 3L
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_PACKAGE_ADDED) {
            Log.d(TAG, "Ignoring non-PACKAGE_ADDED action: ${intent.action}")
            return
        }

        val packageUri = intent.data
        if (packageUri == null) {
            Log.d(TAG, "No package data in intent, skipping.")
            return
        }

        val installedPackage = packageUri.schemeSpecificPart
        if (installedPackage == null) {
            Log.d(TAG, "Could not extract package name from URI, skipping.")
            return
        }

        // Skip self-installs (our own app updates)
        if (installedPackage == context.packageName) {
            Log.d(TAG, "Ignoring self-install: $installedPackage")
            return
        }

        // Skip the ADDED phase of an update — REPLACED will follow
        if (intent.getBooleanExtra(Intent.EXTRA_REPLACING, false)) {
            Log.d(TAG, "Ignoring ADDED for update (EXTRA_REPLACING): $installedPackage")
            return
        }

        Log.d(TAG, "New app installed: $installedPackage. Enqueuing reactive scan.")

        val scanRequest = OneTimeWorkRequestBuilder<ScanWorker>()
            .setInitialDelay(INITIAL_DELAY_SECONDS, TimeUnit.SECONDS)
            .build()

        WorkManager.getInstance(context)
            .enqueueUniqueWork(
                REACTIVE_SCAN_WORK_NAME,
                ExistingWorkPolicy.KEEP,
                scanRequest
            )
    }
}

package com.thewallboycott.android

import android.app.Application
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import androidx.core.content.ContextCompat
import com.thewallboycott.android.background.PackageInstallReceiver

/**
 * Custom Application class that registers a [PackageInstallReceiver] programmatically.
 *
 * This enables near-instant detection of newly installed boycotted apps while the
 * app process is alive. Context-registered receivers are required because
 * ACTION_PACKAGE_ADDED is not on Android 8.0+'s implicit broadcast exemption list.
 */
class TheWallApp : Application() {

    companion object {
        private const val TAG = "TheWallApp"
    }

    override fun onCreate() {
        super.onCreate()
        registerPackageInstallReceiver()
    }

    private fun registerPackageInstallReceiver() {
        val receiver = PackageInstallReceiver()
        val filter = IntentFilter(Intent.ACTION_PACKAGE_ADDED).apply {
            addDataScheme("package")
        }

        ContextCompat.registerReceiver(
            this,
            receiver,
            filter,
            ContextCompat.RECEIVER_EXPORTED
        )

        Log.d(TAG, "PackageInstallReceiver registered.")
    }
}

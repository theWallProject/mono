package com.thewall.android.background

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewall.android.MainActivity
import com.thewall.android.R
import com.thewall.android.data.BlacklistItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ScanWorker(private val appContext: Context, workerParams: WorkerParameters) :
    CoroutineWorker(appContext, workerParams) {

    companion object {
        const val NAVIGATE_TO_SCREEN_EXTRA = "NAVIGATE_TO_SCREEN"
        const val APP_SCAN_SCREEN = "APP_SCAN"

        private const val CHANNEL_ID = "BACKGROUND_SCAN_CHANNEL"
        private const val PROGRESS_NOTIFICATION_ID = 42
        private const val RESULT_NOTIFICATION_ID = 43
        private const val TAG = "ScanWorker"
    }

    override suspend fun doWork(): Result {
        Log.d(TAG, "Periodic scan worker started.")
        val progressNotification = createNotification("Background Scan", "Scanning apps for matches...")
        val foregroundInfo = ForegroundInfo(PROGRESS_NOTIFICATION_ID, progressNotification)
        setForeground(foregroundInfo)

        return withContext(Dispatchers.IO) {
            try {
                val blacklistedApps = findBlacklistedApps()

                if (blacklistedApps.isNotEmpty()) {
                    Log.d(TAG, "${blacklistedApps.size} blacklisted apps found. Sending result notification.")
                    sendResultNotification(blacklistedApps)
                } else {
                    Log.d(TAG, "No blacklisted apps found. Work finished cleanly.")
                }

                NotificationManagerCompat.from(appContext).cancel(PROGRESS_NOTIFICATION_ID)
                Result.success()
            } catch (e: Exception) {
                Log.e(TAG, "An error occurred during periodic scan.", e)
                NotificationManagerCompat.from(appContext).cancel(PROGRESS_NOTIFICATION_ID)
                Result.failure()
            }
        }
    }

    private fun findBlacklistedApps(): List<String> {
        val pm = appContext.packageManager
        val assetManager = appContext.assets
        val blacklistJson = MainActivity.readFile(assetManager, "blacklist.json")
        val blacklistType = object : TypeToken<List<BlacklistItem>>() {}.type
        val blacklist: List<BlacklistItem> = Gson().fromJson(blacklistJson, blacklistType)

        val installedApps = pm.getInstalledPackages(PackageManager.GET_META_DATA)
        Log.d(TAG, "Found ${installedApps.size} installed apps to scan.")

        return installedApps.mapNotNull { app ->
            val appInfo = app.applicationInfo
            // Check if appInfo is valid and not a system app
            if (appInfo != null && (appInfo.flags and (ApplicationInfo.FLAG_SYSTEM or ApplicationInfo.FLAG_UPDATED_SYSTEM_APP)) == 0) {
                val isBlacklisted = blacklist.any { item ->
                    val appIdsMatch = item.androidAppIds?.contains(app.packageName) == true
                    val devIdMatch = item.androidDevId?.let { app.packageName.startsWith(it) } == true
                    appIdsMatch || devIdMatch
                }

                if (isBlacklisted) {
                    appInfo.loadLabel(pm).toString()
                } else {
                    null // Not blacklisted, filter this out
                }
            } else {
                null // System app or no appInfo, filter this out
            }
        }
    }

    private fun sendResultNotification(foundApps: List<String>) {
        val intent = Intent(appContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra(NAVIGATE_TO_SCREEN_EXTRA, APP_SCAN_SCREEN)
        }

        val pendingIntent = PendingIntent.getActivity(
            appContext, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val contentText = if (foundApps.size == 1) {
            "Found 1 boycotted app: ${foundApps.first()}"
        } else {
            "Found ${foundApps.size} boycotted apps, including ${foundApps.first()}."
        }

        val notification = createNotification("Boycotted Apps Detected", contentText, pendingIntent, isOngoing = true)

        if (ActivityCompat.checkSelfPermission(appContext, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "Cannot send result notification: POST_NOTIFICATIONS permission not granted.")
            return
        }
        Log.d(TAG, "Sending result notification.")
        NotificationManagerCompat.from(appContext).notify(RESULT_NOTIFICATION_ID, notification)
    }

    private fun createNotification(
        title: String,
        text: String,
        intent: PendingIntent? = null,
        isOngoing: Boolean = false
    ): android.app.Notification {
        createNotificationChannel()
        val builder = NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_launcher_foreground) // Ensure this exists
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setOngoing(isOngoing)

        if (intent != null) {
            builder.setContentIntent(intent)
        }

        return builder.build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Background Scans"
            val descriptionText = "Notifications for periodic app scans."
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager =
                appContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}

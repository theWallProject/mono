package com.thewallboycott.android.background

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import com.thewallboycott.android.MainActivity
import com.thewallboycott.android.R
import com.thewallboycott.android.data.AssetDatabaseProvider
import com.thewallboycott.android.data.DatabaseProvider
import com.thewallboycott.android.data.NotificationPreferences
import com.thewallboycott.android.data.PackageScanner
import com.thewallboycott.android.data.SystemPackageScanner
import com.thewallboycott.android.data.models.AllItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Background worker that scans installed apps against the boycott database.
 *
 * Notification behavior:
 * - Only shows notifications when NEW apps are detected
 * - Shows a reminder every 2 weeks if there are still boycotted apps (even if not new)
 * - Respects ignored and snoozed apps (won't count or notify about them)
 * - Uses grouped notifications with per-app actions (Ignore, Remind Later)
 */
class ScanWorker @JvmOverloads constructor(
    private val appContext: Context,
    workerParams: WorkerParameters,
    private val databaseProvider: DatabaseProvider = AssetDatabaseProvider(appContext),
    private val packageScanner: PackageScanner = SystemPackageScanner(appContext),
    private val prefs: NotificationPreferences = NotificationPreferences(appContext)
) : CoroutineWorker(appContext, workerParams) {

    companion object {
        const val NAVIGATE_TO_SCREEN_EXTRA = "NAVIGATE_TO_SCREEN"
        const val APP_SCAN_SCREEN = "APP_SCAN"

        /** Input key to force notifications regardless of timing/new app logic */
        const val INPUT_FORCE_NOTIFY = "force_notify"

        private const val CHANNEL_ID = "BACKGROUND_SCAN_CHANNEL"
        private const val PROGRESS_CHANNEL_ID = "BACKGROUND_SCAN_PROGRESS_CHANNEL"
        private const val PROGRESS_NOTIFICATION_ID = 42

        /**
         * Notification ID and PendingIntent request code ranges:
         * - Content intent:  [1000, 11000)
         * - Ignore action:   [21000, 31000)
         * - Snooze action:   [41000, 51000)
         */
        private const val APP_NOTIFICATION_BASE_ID = 1000
        private const val APP_NOTIFICATION_RANGE = 10000
        private const val IGNORE_REQUEST_CODE_OFFSET = 20000
        private const val SNOOZE_REQUEST_CODE_OFFSET = 40000

        private const val TAG = "ScanWorker"

        /** Stable notification ID that never collides with [PROGRESS_NOTIFICATION_ID]. */
        fun appNotificationId(packageName: String): Int {
            return APP_NOTIFICATION_BASE_ID + (packageName.hashCode() and 0x7FFFFFFF) % APP_NOTIFICATION_RANGE
        }
    }

    override suspend fun doWork(): Result {
        val forceNotify = inputData.getBoolean(INPUT_FORCE_NOTIFY, false)
        Log.d(TAG, "Scan worker started. forceNotify=$forceNotify")

        // Try to promote to foreground service for progress notification.
        // This will fail when the app is in the background on API 31+ — that's fine,
        // the scan still runs as a regular background worker.
        try {
            val progressNotification = createProgressNotification()
            val foregroundInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                ForegroundInfo(PROGRESS_NOTIFICATION_ID, progressNotification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE)
            } else {
                ForegroundInfo(PROGRESS_NOTIFICATION_ID, progressNotification)
            }
            setForeground(foregroundInfo)
        } catch (e: Exception) {
            Log.d(TAG, "Could not start foreground service (app in background), continuing as background work.")
        }

        return withContext(Dispatchers.IO) {
            try {
                val scanResult = scanInstalledApps()
                processAndNotify(scanResult, forceNotify)
                NotificationManagerCompat.from(appContext).cancel(PROGRESS_NOTIFICATION_ID)
                Result.success()
            } catch (e: Exception) {
                Log.e(TAG, "An error occurred during periodic scan.", e)
                NotificationManagerCompat.from(appContext).cancel(PROGRESS_NOTIFICATION_ID)
                Result.failure()
            }
        }
    }

    /**
     * Data class holding scan results separated by category.
     */
    private data class ScanResult(
        /** Apps on the boycott list (non-hints) */
        val blacklistedApps: List<DetectedApp>,
        /** Apps with hints/suggestions */
        val hintedApps: List<DetectedApp>
    )

    /**
     * Info about a detected app.
     */
    data class DetectedApp(
        val packageName: String,
        val displayName: String,
        val isHint: Boolean,
        val itemInfo: AllItem
    )

    /**
     * Scans installed apps and returns categorized results.
     * Uses [DatabaseProvider] and [PackageScanner] for data access.
     * Excludes ignored/snoozed apps for notification purposes.
     */
    private suspend fun scanInstalledApps(): ScanResult {
        val pm = appContext.packageManager
        val allItems = databaseProvider.getAllItems()

        // Separate hints from regular blacklist items
        val (hints, blacklist) = allItems.partition { it.isHint == true }

        // Filter to only items with Android identifiers
        val blacklistWithAndroid = blacklist.filter { it.androidDevId != null || it.androidAppIds != null }
        val hintsWithAndroid = hints.filter { it.androidAppIds != null }

        // PackageScanner already filters out system apps
        val installedApps = packageScanner.getInstalledPackages()
        Log.d(TAG, "Found ${installedApps.size} installed non-system apps to scan.")

        val blacklistedApps = mutableListOf<DetectedApp>()
        val hintedApps = mutableListOf<DetectedApp>()

        installedApps.forEach { app ->
            val appInfo = app.applicationInfo ?: return@forEach

            // Skip ignored and snoozed apps
            if (prefs.shouldExcludeFromNotification(app.packageName)) {
                return@forEach
            }

            // Check against blacklist first (takes priority)
            val matchingBlacklistItem = blacklistWithAndroid.find { item ->
                val appIdsMatch = item.androidAppIds?.contains(app.packageName) == true
                val devIdMatch = item.androidDevId?.let { app.packageName.startsWith("$it.") || app.packageName == it } == true
                appIdsMatch || devIdMatch
            }

            if (matchingBlacklistItem != null) {
                blacklistedApps.add(DetectedApp(
                    packageName = app.packageName,
                    displayName = appInfo.loadLabel(pm).toString(),
                    isHint = false,
                    itemInfo = matchingBlacklistItem
                ))
                return@forEach
            }

            // Check against hints
            val matchingHintItem = hintsWithAndroid.find { item ->
                item.androidAppIds?.contains(app.packageName) == true
            }

            if (matchingHintItem != null) {
                hintedApps.add(DetectedApp(
                    packageName = app.packageName,
                    displayName = appInfo.loadLabel(pm).toString(),
                    isHint = true,
                    itemInfo = matchingHintItem
                ))
            }
        }

        Log.d(TAG, "Scan complete: ${blacklistedApps.size} blacklisted, ${hintedApps.size} hinted")
        return ScanResult(blacklistedApps, hintedApps)
    }

    /**
     * Determines if and what notifications to show based on scan results.
     *
     * Logic:
     * 1. If there are NEW apps (not seen before) -> notify immediately
     * 2. If no new apps but 2 weeks passed since last notification -> show reminder
     * 3. Otherwise -> don't notify
     *
     * @param forceNotify If true, skip timing checks and always notify (for debug trigger)
     */
    private fun processAndNotify(scanResult: ScanResult, forceNotify: Boolean = false) {
        // Only notify about blacklisted apps (not hints)
        val currentApps = scanResult.blacklistedApps.map { it.packageName }.toSet()
        val knownApps = prefs.getKnownApps()

        // First run: seed known apps without notifying
        val isFirstRun = knownApps.isEmpty() && currentApps.isNotEmpty()
        if (isFirstRun && !forceNotify) {
            Log.d(TAG, "First scan: seeding ${currentApps.size} known apps without notifying.")
            prefs.setKnownApps(currentApps)
            prefs.setLastNotificationTime()
            return
        }

        // Find truly new apps (installed since last scan)
        val newApps = currentApps - knownApps

        // Update known apps
        prefs.setKnownApps(currentApps)

        if (currentApps.isEmpty()) {
            Log.d(TAG, "No boycotted apps found. Clearing notifications.")
            clearAllNotifications()
            return
        }

        val shouldNotify = if (forceNotify) {
            Log.d(TAG, "Force notify enabled. Sending notifications.")
            true
        } else when {
            // New apps detected - always notify
            newApps.isNotEmpty() -> {
                Log.d(TAG, "${newApps.size} new boycotted apps detected. Sending notifications.")
                true
            }
            // No new apps, but 2 weeks since last notification - show reminder
            prefs.shouldShowReminder() -> {
                Log.d(TAG, "2 weeks since last notification. Showing reminder.")
                true
            }
            // No new apps, recently notified - skip
            else -> {
                Log.d(TAG, "No new apps and recently notified. Skipping notification.")
                false
            }
        }

        if (shouldNotify) {
            // Only notify for new apps, unless it's a reminder or force (then notify all)
            val appsToNotify = if (newApps.isNotEmpty() && !forceNotify) {
                scanResult.blacklistedApps.filter { it.packageName in newApps }
            } else {
                scanResult.blacklistedApps
            }
            val sent = sendNotifications(appsToNotify)
            if (sent) {
                prefs.setLastNotificationTime()
                prefs.setLastNotifiedApps(currentApps)
            }
        }
    }

    /**
     * Sends individual notifications for each detected app.
     */
    private fun sendNotifications(apps: List<DetectedApp>): Boolean {
        if (ActivityCompat.checkSelfPermission(appContext, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "Cannot send notifications: POST_NOTIFICATIONS permission not granted.")
            return false
        }

        createNotificationChannel()
        val notificationManager = NotificationManagerCompat.from(appContext)

        apps.forEach { app ->
            val notificationId = appNotificationId(app.packageName)
            val notification = createAppNotification(app, notificationId)
            notificationManager.notify(notificationId, notification)
        }

        Log.d(TAG, "Sent ${apps.size} notifications")
        return true
    }

    /**
     * Creates a notification for a single app with Ignore/Snooze actions.
     */
    private fun createAppNotification(app: DetectedApp, notificationId: Int): android.app.Notification {
        // Content intent - open app to scan screen
        val contentIntent = Intent(appContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra(NAVIGATE_TO_SCREEN_EXTRA, APP_SCAN_SCREEN)
        }
        val contentPendingIntent = PendingIntent.getActivity(
            appContext, notificationId, contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Ignore action
        val ignoreIntent = NotificationActionReceiver.createIgnoreIntent(appContext, app.packageName, notificationId)
        val ignorePendingIntent = PendingIntent.getBroadcast(
            appContext, notificationId + IGNORE_REQUEST_CODE_OFFSET, ignoreIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Snooze action (Remind Later)
        val snoozeIntent = NotificationActionReceiver.createSnoozeIntent(appContext, app.packageName, notificationId)
        val snoozePendingIntent = PendingIntent.getBroadcast(
            appContext, notificationId + SNOOZE_REQUEST_CODE_OFFSET, snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = app.displayName
        val text = appContext.getString(R.string.scan_worker_notification, app.itemInfo.n)

        return NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(contentPendingIntent)
            .addAction(0, appContext.getString(R.string.notif_action_ignore), ignorePendingIntent)
            .addAction(0, appContext.getString(R.string.notif_action_remind_later), snoozePendingIntent)
            .build()
    }

    /**
     * Clears all notifications and resets notification state.
     */
    private fun clearAllNotifications() {
        val notificationManager = NotificationManagerCompat.from(appContext)
        notificationManager.cancelAll()
        prefs.setLastNotifiedApps(emptySet())
    }

    private fun createProgressNotification(): android.app.Notification {
        createProgressNotificationChannel()
        return NotificationCompat.Builder(appContext, PROGRESS_CHANNEL_ID)
            .setContentTitle(appContext.getString(R.string.notif_progress_title))
            .setContentText(appContext.getString(R.string.notif_progress_text))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = appContext.getString(R.string.notif_channel_name)
            val descriptionText = appContext.getString(R.string.notif_channel_description)
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager =
                appContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createProgressNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                PROGRESS_CHANNEL_ID,
                appContext.getString(R.string.notif_progress_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = appContext.getString(R.string.notif_progress_channel_description)
                setShowBadge(false)
            }
            val notificationManager: NotificationManager =
                appContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}

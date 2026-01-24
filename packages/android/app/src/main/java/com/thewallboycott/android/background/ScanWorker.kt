package com.thewallboycott.android.background

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
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
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewallboycott.android.MainActivity
import com.thewallboycott.android.R
import com.thewallboycott.android.data.NotificationPreferences
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.util.readFile
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
class ScanWorker(private val appContext: Context, workerParams: WorkerParameters) :
    CoroutineWorker(appContext, workerParams) {

    companion object {
        const val NAVIGATE_TO_SCREEN_EXTRA = "NAVIGATE_TO_SCREEN"
        const val APP_SCAN_SCREEN = "APP_SCAN"

        private const val CHANNEL_ID = "BACKGROUND_SCAN_CHANNEL"
        private const val PROGRESS_NOTIFICATION_ID = 42

        /** Base ID for individual app notifications. Actual ID = BASE + hash of package name */
        private const val APP_NOTIFICATION_BASE_ID = 1000

        /** ID for the summary/group notification */
        const val SUMMARY_NOTIFICATION_ID = 43

        /** Group key for bundling app notifications */
        private const val NOTIFICATION_GROUP = "com.thewallboycott.android.BOYCOTTED_APPS"

        private const val TAG = "ScanWorker"
    }

    private val prefs = NotificationPreferences(appContext)

    override suspend fun doWork(): Result {
        Log.d(TAG, "Periodic scan worker started.")
        val progressNotification = createProgressNotification()
        val foregroundInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ForegroundInfo(PROGRESS_NOTIFICATION_ID, progressNotification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            ForegroundInfo(PROGRESS_NOTIFICATION_ID, progressNotification)
        }
        setForeground(foregroundInfo)

        return withContext(Dispatchers.IO) {
            try {
                val scanResult = scanInstalledApps()
                processAndNotify(scanResult)
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
     * Excludes system apps and respects ignored/snoozed preferences.
     */
    private fun scanInstalledApps(): ScanResult {
        val pm = appContext.packageManager
        val assetManager = appContext.assets
        val allJson = readFile(assetManager, "ALL.json")
        val allItemsType = object : TypeToken<List<AllItem>>() {}.type
        val allItems: List<AllItem> = Gson().fromJson(allJson, allItemsType)

        // Separate hints from regular blacklist items
        val (hints, blacklist) = allItems.partition { it.isHint == true }

        // Filter to only items with Android identifiers
        val blacklistWithAndroid = blacklist.filter { it.androidDevId != null || it.androidAppIds != null }
        val hintsWithAndroid = hints.filter { it.androidAppIds != null }

        val installedApps = pm.getInstalledPackages(PackageManager.GET_META_DATA)
        Log.d(TAG, "Found ${installedApps.size} installed apps to scan.")

        val blacklistedApps = mutableListOf<DetectedApp>()
        val hintedApps = mutableListOf<DetectedApp>()

        installedApps.forEach { app ->
            val appInfo = app.applicationInfo ?: return@forEach

            // Skip system apps
            if ((appInfo.flags and (ApplicationInfo.FLAG_SYSTEM or ApplicationInfo.FLAG_UPDATED_SYSTEM_APP)) != 0) {
                return@forEach
            }

            // Skip ignored and snoozed apps
            if (prefs.shouldExcludeFromNotification(app.packageName)) {
                return@forEach
            }

            // Check against blacklist first (takes priority)
            val matchingBlacklistItem = blacklistWithAndroid.find { item ->
                val appIdsMatch = item.androidAppIds?.contains(app.packageName) == true
                val devIdMatch = item.androidDevId?.let { app.packageName.startsWith(it) } == true
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
     */
    private fun processAndNotify(scanResult: ScanResult) {
        // Only notify about blacklisted apps (not hints)
        val currentApps = scanResult.blacklistedApps.map { it.packageName }.toSet()
        val knownApps = prefs.getKnownApps()

        // Find truly new apps (installed since last scan)
        val newApps = currentApps - knownApps

        // Update known apps
        prefs.setKnownApps(currentApps)

        if (currentApps.isEmpty()) {
            Log.d(TAG, "No boycotted apps found. Clearing notifications.")
            clearAllNotifications()
            return
        }

        val shouldNotify = when {
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
            sendGroupedNotifications(scanResult.blacklistedApps, newApps)
            prefs.setLastNotificationTime()
            prefs.setLastNotifiedApps(currentApps)
        }
    }

    /**
     * Sends grouped notifications with individual per-app notifications
     * and a summary notification.
     */
    private fun sendGroupedNotifications(apps: List<DetectedApp>, newApps: Set<String>) {
        if (ActivityCompat.checkSelfPermission(appContext, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "Cannot send notifications: POST_NOTIFICATIONS permission not granted.")
            return
        }

        createNotificationChannel()
        val notificationManager = NotificationManagerCompat.from(appContext)

        // Send individual notifications for each app
        apps.forEach { app ->
            val notificationId = APP_NOTIFICATION_BASE_ID + app.packageName.hashCode()
            val notification = createAppNotification(app, isNew = newApps.contains(app.packageName))
            notificationManager.notify(notificationId, notification)
        }

        // Send summary notification
        val summaryNotification = createSummaryNotification(apps, newApps)
        notificationManager.notify(SUMMARY_NOTIFICATION_ID, summaryNotification)

        Log.d(TAG, "Sent ${apps.size} individual notifications + summary")
    }

    /**
     * Creates a notification for a single app with Ignore/Snooze actions.
     */
    private fun createAppNotification(app: DetectedApp, isNew: Boolean): android.app.Notification {
        val notificationId = APP_NOTIFICATION_BASE_ID + app.packageName.hashCode()

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
            appContext, notificationId * 2, ignoreIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Snooze action (Remind Later)
        val snoozeIntent = NotificationActionReceiver.createSnoozeIntent(appContext, app.packageName, notificationId)
        val snoozePendingIntent = PendingIntent.getBroadcast(
            appContext, notificationId * 2 + 1, snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = if (isNew) "New: ${app.displayName}" else app.displayName
        val text = app.itemInfo.n // Company/entity name

        return NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setGroup(NOTIFICATION_GROUP)
            .setAutoCancel(true)
            .setContentIntent(contentPendingIntent)
            .addAction(0, "Ignore", ignorePendingIntent)
            .addAction(0, "Remind Later", snoozePendingIntent)
            .build()
    }

    /**
     * Creates the summary notification that groups all app notifications.
     */
    private fun createSummaryNotification(apps: List<DetectedApp>, newApps: Set<String>): android.app.Notification {
        val contentIntent = Intent(appContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra(NAVIGATE_TO_SCREEN_EXTRA, APP_SCAN_SCREEN)
        }
        val contentPendingIntent = PendingIntent.getActivity(
            appContext, SUMMARY_NOTIFICATION_ID, contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Dismiss all action
        val dismissIntent = NotificationActionReceiver.createDismissAllIntent(appContext)
        val dismissPendingIntent = PendingIntent.getBroadcast(
            appContext, SUMMARY_NOTIFICATION_ID * 2, dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Build title based on new vs existing
        val newCount = newApps.size
        val totalCount = apps.size
        val title = when {
            newCount == totalCount && newCount == 1 -> "1 New Boycotted App"
            newCount == totalCount -> "$newCount New Boycotted Apps"
            newCount > 0 -> "$newCount New, $totalCount Total Boycotted Apps"
            else -> "$totalCount Boycotted Apps Detected"
        }

        // Build inbox style for expanded view
        val inboxStyle = NotificationCompat.InboxStyle()
            .setBigContentTitle(title)

        // Add lines for up to 6 apps
        apps.take(6).forEach { app ->
            val prefix = if (newApps.contains(app.packageName)) "[NEW] " else ""
            inboxStyle.addLine("$prefix${app.displayName}")
        }

        if (apps.size > 6) {
            inboxStyle.setSummaryText("+${apps.size - 6} more")
        }

        return NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText("Tap to view all detected apps")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setStyle(inboxStyle)
            .setGroup(NOTIFICATION_GROUP)
            .setGroupSummary(true)
            .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_SUMMARY)
            .setAutoCancel(true)
            .setContentIntent(contentPendingIntent)
            .addAction(0, "Dismiss All", dismissPendingIntent)
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
        createNotificationChannel()
        return NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setContentTitle("Background Scan")
            .setContentText("Scanning apps for matches...")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Background Scans"
            val descriptionText = "Notifications for periodic app scans and detected boycotted apps."
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

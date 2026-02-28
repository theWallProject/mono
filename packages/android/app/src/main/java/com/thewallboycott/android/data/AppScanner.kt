package com.thewallboycott.android.data

import android.content.pm.PackageInfo
import android.util.Log
import com.thewallboycott.android.data.models.AllItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Results of scanning installed apps against the boycott database.
 */
data class AppScanResults(
    /** Apps on the boycott list with Israeli connections (non-BDS, non-hint) */
    val blacklisted: List<Pair<PackageInfo, AllItem>>,
    /** Apps on the BDS boycott list only (no direct Israeli connection) */
    val bdsApps: List<Pair<PackageInfo, AllItem>>,
    /** Apps with hint suggestions (better alternatives available) */
    val hinted: List<Pair<PackageInfo, AllItem>>,
    /** Apps not on any list */
    val other: List<PackageInfo>
)

private val BDS_REASONS = setOf("BDS_PRIO", "BDS_GRASS", "BDS_PRESSURE")

private fun AllItem.isBdsOnly(): Boolean {
    return r.isNotEmpty() && r.all { it in BDS_REASONS }
}

/**
 * Scans installed apps against the boycott database.
 *
 * Extracted from `AppListScreen.performAppScan()` and `ScanWorker.scanInstalledApps()`
 * to enable unit testing and share logic between UI and background scanning.
 *
 * @param databaseProvider Provides the ALL.json database entries
 * @param packageScanner Provides the list of installed packages
 */
class AppScanner(
    private val databaseProvider: DatabaseProvider,
    private val packageScanner: PackageScanner
) {
    companion object {
        private const val TAG = "AppScanner"
    }

    /**
     * Performs a full app scan, categorizing all installed apps.
     * Runs database loading on IO dispatcher for performance.
     */
    suspend fun scan(): AppScanResults = withContext(Dispatchers.Default) {
        val allItems = databaseProvider.getAllItems()
        Log.d(TAG, "Database loaded with ${allItems.size} items")

        val (hints, blacklist) = allItems.partition { it.isHint == true }
        Log.d(TAG, "Separated ${hints.size} hints and ${blacklist.size} blacklist items")

        val installedApps = packageScanner.getInstalledPackages()
        Log.d(TAG, "Found ${installedApps.size} installed non-system apps")

        val blacklistedApps = mutableListOf<Pair<PackageInfo, AllItem>>()
        val bdsApps = mutableListOf<Pair<PackageInfo, AllItem>>()
        val hintedApps = mutableListOf<Pair<PackageInfo, AllItem>>()
        val otherApps = mutableListOf<PackageInfo>()

        installedApps.forEach { app ->
            val matchingBlacklistItem = blacklist.find { item ->
                matchesPackage(item, app.packageName)
            }
            val matchingHintItem = hints.find { item ->
                matchesPackage(item, app.packageName)
            }

            when {
                matchingBlacklistItem != null -> {
                    if (matchingBlacklistItem.isBdsOnly()) {
                        bdsApps.add(app to matchingBlacklistItem)
                    } else {
                        blacklistedApps.add(app to matchingBlacklistItem)
                    }
                }
                matchingHintItem != null -> hintedApps.add(app to matchingHintItem)
                else -> otherApps.add(app)
            }
        }

        Log.d(TAG, "Scan complete: ${blacklistedApps.size} blacklisted, ${bdsApps.size} BDS, ${hintedApps.size} hinted, ${otherApps.size} other")
        AppScanResults(blacklistedApps, bdsApps, hintedApps, otherApps)
    }

    /**
     * Checks if a database item matches a given package name.
     * Matches by exact app ID or developer ID prefix.
     */
    private fun matchesPackage(item: AllItem, packageName: String): Boolean {
        return (item.androidAppIds?.contains(packageName) == true) ||
            (item.androidDevId?.let { packageName.startsWith("$it.") || packageName == it } == true)
    }
}

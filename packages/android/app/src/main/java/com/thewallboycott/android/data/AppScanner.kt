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
     *
     * Three matching strategies, all of which only ever see packages enumerated
     * in the build-time-generated <queries> manifest (we no longer hold
     * QUERY_ALL_PACKAGES, so the OS will not surface anything else):
     *  1. Exact match against `android_app_ids` (curated by the scrapper).
     *  2. Exact match against `android_curated_app_ids` (the schema field that
     *     expands a developer prefix into concrete package IDs at build time).
     *  3. Prefix match against `android_dev_id`. Under <queries> this branch is
     *     largely redundant — the OS only returns packages we already
     *     enumerated — but it remains as a defensive catch in case a curated
     *     entry happens to share a dev_id namespace (e.g. dev_id="com.wix",
     *     curated app "com.wix.admin" is correctly attributed to Wix without
     *     us listing the dev_id mapping in two places).
     *
     * Developer ID prefix matching requires a dot separator to prevent false
     * positives: devId="com.wix" matches "com.wix.android" and "com.wix" but
     * NOT "com.wixsite.builder".
     */
    private fun matchesPackage(item: AllItem, packageName: String): Boolean {
        return (item.androidAppIds?.contains(packageName) == true) ||
            (item.androidCuratedAppIds?.contains(packageName) == true) ||
            (item.androidDevId?.let { packageName.startsWith("$it.") || packageName == it } == true)
    }
}

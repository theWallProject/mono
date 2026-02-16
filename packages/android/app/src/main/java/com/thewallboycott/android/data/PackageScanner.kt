package com.thewallboycott.android.data

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager

/**
 * Abstraction over the Android PackageManager for listing installed packages.
 * Enables testing without a real device by providing fake package lists.
 */
interface PackageScanner {
    /** Returns all installed non-system packages. */
    fun getInstalledPackages(): List<PackageInfo>
}

/**
 * Real implementation that queries the system PackageManager.
 * Filters out system apps and updated system apps.
 */
class SystemPackageScanner(private val context: Context) : PackageScanner {
    override fun getInstalledPackages(): List<PackageInfo> {
        return context.packageManager
            .getInstalledPackages(PackageManager.GET_META_DATA)
            .filter { pkg ->
                val flags = pkg.applicationInfo?.flags ?: 0
                (flags and (ApplicationInfo.FLAG_SYSTEM or ApplicationInfo.FLAG_UPDATED_SYSTEM_APP)) == 0
            }
    }
}

package com.thewallboycott.android.testutil

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.util.readFile

/**
 * Test utility that loads entries from the real ALL.json database.
 *
 * This ensures tests always validate against the actual production data and schema.
 * Any schema changes or data corruption will cause test failures immediately,
 * rather than being masked by a separate fake dataset.
 */
object TestDatabase {

    private val gson = Gson()
    private var cachedItems: List<AllItem>? = null

    /**
     * Load the full production database from assets.
     * Results are cached across calls within the same test run.
     */
    fun loadAll(context: Context = ApplicationProvider.getApplicationContext()): List<AllItem> {
        cachedItems?.let { return it }
        val json = readFile(context.assets, "ALL.json")
        val type = object : TypeToken<List<AllItem>>() {}.type
        val items: List<AllItem> = gson.fromJson(json, type)
        cachedItems = items
        return items
    }

    /** Find entries by ID (exact match). */
    fun findById(id: String, context: Context = ApplicationProvider.getApplicationContext()): AllItem? =
        loadAll(context).find { it.id == id }

    /** Find entries by name (case-insensitive contains). */
    fun findByName(name: String, context: Context = ApplicationProvider.getApplicationContext()): List<AllItem> =
        loadAll(context).filter { it.n.contains(name, ignoreCase = true) }

    /** Find entries that have android_app_ids containing [packageName]. */
    fun findByAndroidAppId(
        packageName: String,
        context: Context = ApplicationProvider.getApplicationContext()
    ): AllItem? =
        loadAll(context).find { it.androidAppIds?.contains(packageName) == true }

    /** Find entries that have android_dev_id matching [devIdPrefix]. */
    fun findByAndroidDevId(
        devIdPrefix: String,
        context: Context = ApplicationProvider.getApplicationContext()
    ): List<AllItem> =
        loadAll(context).filter { it.androidDevId == devIdPrefix }

    /** Get all entries with android_app_ids or android_dev_id (relevant for app scanning). */
    fun getAllWithAndroidIds(context: Context = ApplicationProvider.getApplicationContext()): List<AllItem> =
        loadAll(context).filter { !it.androidAppIds.isNullOrEmpty() || it.androidDevId != null }

    /** Get all hint entries. */
    fun getHints(context: Context = ApplicationProvider.getApplicationContext()): List<AllItem> =
        loadAll(context).filter { it.isHint == true }

    /** Get all hint entries that have a hint_android_id. */
    fun getAndroidHints(context: Context = ApplicationProvider.getApplicationContext()): List<AllItem> =
        loadAll(context).filter { it.isHint == true && it.hintAndroidId != null }

    /** Get all non-hint (blacklisted) entries. */
    fun getBlacklist(context: Context = ApplicationProvider.getApplicationContext()): List<AllItem> =
        loadAll(context).filter { it.isHint != true }

    /** Reset the cache (call between test classes if needed). */
    fun resetCache() {
        cachedItems = null
    }
}

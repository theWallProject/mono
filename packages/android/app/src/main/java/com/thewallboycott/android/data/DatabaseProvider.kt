package com.thewallboycott.android.data

import android.content.Context
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.util.readFile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

/**
 * Provides access to the ALL.json database.
 * Implementations can cache or provide test data as needed.
 */
interface DatabaseProvider {
    /** Returns all items from the database. Thread-safe and may cache. */
    suspend fun getAllItems(): List<AllItem>
}

/**
 * Loads the database from Android assets (ALL.json).
 * Caches the result after first load. Thread-safe via [Mutex].
 */
class AssetDatabaseProvider(private val context: Context) : DatabaseProvider {
    private var cached: List<AllItem>? = null
    private val mutex = Mutex()

    override suspend fun getAllItems(): List<AllItem> {
        cached?.let { return it }
        return mutex.withLock {
            // Double-check after acquiring lock
            cached?.let { return it }
            withContext(Dispatchers.IO) {
                val jsonString = readFile(context.assets, "ALL.json")
                val items: List<AllItem> = Json.decodeFromString(jsonString)
                cached = items
                items
            }
        }
    }
}

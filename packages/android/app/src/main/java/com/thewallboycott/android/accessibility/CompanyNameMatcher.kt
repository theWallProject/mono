package com.thewallboycott.android.accessibility

import android.util.Log
import com.thewallboycott.android.data.DatabaseProvider
import com.thewallboycott.android.data.models.AllItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Matches company names against the boycott database.
 * 
 * Builds a lowercase name index from ALL.json for fast lookups.
 * Only indexes non-hint items with reasons (actual flagged companies).
 * 
 * Usage:
 * ```kotlin
 * val matcher = CompanyNameMatcher(databaseProvider)
 * matcher.initialize()
 * 
 * val matches = matcher.findAll(listOf("Google", "Microsoft", "Unknown Company"))
 * // Returns: [(Google, AllItem), (Microsoft, AllItem)]
 * ```
 */
class CompanyNameMatcher(private val databaseProvider: DatabaseProvider) {
    
    companion object {
        private const val TAG = "CompanyNameMatcher"
    }
    
    // Lowercase name → AllItem mapping
    private var nameIndex: Map<String, AllItem>? = null
    
    // Alternative name lowercase → main name mapping
    private var altNameIndex: Map<String, String>? = null
    
    // Whether initialization has been attempted
    private var initialized = false
    
    /**
     * Initialize the matcher by loading and indexing the database.
     * Safe to call multiple times - will only initialize once.
     * 
     * @return true if initialization succeeded, false if failed
     */
    suspend fun initialize(): Boolean = withContext(Dispatchers.IO) {
        if (initialized) {
            Log.d(TAG, "Already initialized, nameIndex size: ${nameIndex?.size ?: 0}")
            return@withContext nameIndex != null
        }
        
        initialized = true
        
        try {
            Log.i(TAG, "Initializing CompanyNameMatcher...")
            val items = databaseProvider.getAllItems()
            Log.d(TAG, "Loaded ${items.size} items from database")
            
            // Index non-hint items with reasons (actual flagged companies)
            val mainIndex = mutableMapOf<String, AllItem>()
            val altIndex = mutableMapOf<String, String>()
            
            items.filter { it.isHint != true && it.r.isNotEmpty() }.forEach { item ->
                // Index main name
                val mainName = item.n.lowercase().trim()
                if (mainName.isNotEmpty()) {
                    mainIndex[mainName] = item
                }
                
                // Index alternative names
                item.alt?.forEach { alt ->
                    val altName = alt.n.lowercase().trim()
                    if (altName.isNotEmpty()) {
                        altIndex[altName] = item.n
                    }
                }
            }
            
            nameIndex = mainIndex
            altNameIndex = altIndex
            
            Log.i(TAG, "Initialized: ${mainIndex.size} company names, ${altIndex.size} alternative names")
            
            // Log sample names for debugging
            mainIndex.keys.take(20).forEach { name ->
                Log.v(TAG, "  Sample: '$name'")
            }
            
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize CompanyNameMatcher", e)
            nameIndex = null
            altNameIndex = null
            false
        }
    }
    
    /**
     * Find a company by exact name match (case-insensitive).
     * 
     * @param name Company name to search for
     * @return matched item and matched name, or null if not found
     */
    fun find(name: String): MatchResult? {
        val index = nameIndex ?: run {
            Log.w(TAG, "Matcher not initialized, call initialize() first")
            return null
        }
        
        val normalizedName = name.lowercase().trim()
        if (normalizedName.isEmpty()) return null
        
        // Try main name index
        index[normalizedName]?.let { item ->
            Log.d(TAG, "Found exact match: '$name' → ${item.id}")
            return MatchResult(name, item)
        }
        
        // Try alternative names
        altNameIndex?.get(normalizedName)?.let { mainName ->
            index[mainName]?.let { item ->
                Log.d(TAG, "Found alt name match: '$name' → ${item.id} (via $mainName)")
                return MatchResult(name, item)
            }
        }
        
        Log.v(TAG, "No match for: '$name'")
        return null
    }
    
    /**
     * Find all matching companies from a list of names.
     * 
     * @param names List of company names to search for
     * @return List of match results for found companies
     */
    fun findAll(names: List<String>): List<MatchResult> {
        return names.mapNotNull { name -> find(name) }.also { results ->
            Log.d(TAG, "Matched ${results.size}/${names.size} names")
        }
    }
    
    /**
     * Check if a name exists in the database (without returning the item).
     */
    fun contains(name: String): Boolean {
        val normalizedName = name.lowercase().trim()
        return nameIndex?.containsKey(normalizedName) == true || 
               altNameIndex?.containsKey(normalizedName) == true
    }
    
    /**
     * Get total number of indexed company names.
     */
    fun size(): Int = nameIndex?.size ?: 0
    
    /**
     * Check if the matcher has been initialized.
     */
    fun isInitialized(): Boolean = nameIndex != null
    
    /**
     * Clear the index (for memory management or reload).
     */
    fun clear() {
        nameIndex = null
        altNameIndex = null
        initialized = false
        Log.d(TAG, "Matcher cleared")
    }
    
    /**
     * Get all company names in the index (for debugging/testing).
     * Returns a copy to prevent modification.
     */
    fun getAllNames(): Set<String> {
        return nameIndex?.keys?.toSet() ?: emptySet()
    }
    
    /**
     * Search for companies by partial name match (for autocomplete).
     * Only returns names containing the query (case-insensitive).
     * 
     * @param query Partial name to search for
     * @param maxResults Maximum number of results to return
     * @return List of matching company names (up to maxResults)
     */
    fun search(query: String, maxResults: Int = 10): List<String> {
        val index = nameIndex ?: return emptyList()
        val normalizedQuery = query.lowercase().trim()
        if (normalizedQuery.isEmpty()) return emptyList()
        
        return index.keys
            .filter { it.contains(normalizedQuery) }
            .take(maxResults)
            .toList()
    }
    
    /**
     * Result of a company name match.
     */
    data class MatchResult(
        /** The name as it appeared in the source (original case) */
        val matchedName: String,
        /** The database entry that was matched */
        val item: AllItem
    )
}
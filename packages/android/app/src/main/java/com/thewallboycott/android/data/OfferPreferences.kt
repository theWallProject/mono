package com.thewallboycott.android.data

import android.content.Context
import android.content.SharedPreferences
import com.thewallboycott.android.data.models.Alternative
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * Persists saved offers from apps that had alternatives.
 * When a user installs an app that's on our list and has alternatives,
 * the offer is saved here for later viewing in the Support tab.
 */
class OfferPreferences(
    context: Context,
    private val clock: Clock = SystemClock
) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "offer_prefs"
        private const val KEY_SAVED_OFFERS = "saved_offers"
        private const val KEY_PENDING_OFFER_DIALOG = "pending_offer_dialog"
    }

    /**
     * Represents a saved offer from an app that was detected.
     */
    @Serializable
    data class SavedOffer(
        /** Package name of the detected app */
        val packageName: String,
        /** Display name of the detected app */
        val appName: String,
        /** Name of the entity from the database */
        val entityName: String,
        /** List of alternatives offered */
        val alternatives: List<Alternative>,
        /** Timestamp when this offer was saved */
        val savedAt: Long
    )

    /**
     * Get all saved offers, sorted by most recent first.
     */
    fun getSavedOffers(): List<SavedOffer> {
        val json = prefs.getString(KEY_SAVED_OFFERS, null) ?: return emptyList()
        return try {
            val offers: List<SavedOffer> = Json.decodeFromString(json)
            offers.sortedByDescending { it.savedAt }
        } catch (e: Exception) {
            emptyList()
        }
    }

    /**
     * Save an offer for later viewing.
     * If an offer for this package already exists, it will be updated.
     */
    fun saveOffer(
        packageName: String,
        appName: String,
        entityName: String,
        alternatives: List<Alternative>
    ) {
        val current = getSavedOffers().toMutableList()

        // Remove existing offer for this package if any
        current.removeAll { it.packageName == packageName }

        // Add new offer
        current.add(
            SavedOffer(
                packageName = packageName,
                appName = appName,
                entityName = entityName,
                alternatives = alternatives,
                savedAt = clock.currentTimeMillis()
            )
        )

        val json = Json.encodeToString(current)
        prefs.edit().putString(KEY_SAVED_OFFERS, json).apply()
    }

    /**
     * Remove an offer (e.g., when user dismisses it).
     */
    fun removeOffer(packageName: String) {
        val current = getSavedOffers().toMutableList()
        current.removeAll { it.packageName == packageName }
        val json = Json.encodeToString(current)
        prefs.edit().putString(KEY_SAVED_OFFERS, json).apply()
    }

    /**
     * Check if there are any saved offers.
     */
    fun hasOffers(): Boolean {
        return getSavedOffers().isNotEmpty()
    }

    /**
     * Set a pending offer to show in a dialog when the app opens.
     */
    fun setPendingOfferDialog(
        packageName: String,
        appName: String,
        entityName: String,
        alternatives: List<Alternative>
    ) {
        val offer = SavedOffer(
            packageName = packageName,
            appName = appName,
            entityName = entityName,
            alternatives = alternatives,
            savedAt = clock.currentTimeMillis()
        )
        val json = Json.encodeToString(offer)
        prefs.edit().putString(KEY_PENDING_OFFER_DIALOG, json).apply()
    }

    /**
     * Get and clear the pending offer dialog.
     * Returns null if no pending dialog.
     */
    fun consumePendingOfferDialog(): SavedOffer? {
        val json = prefs.getString(KEY_PENDING_OFFER_DIALOG, null) ?: return null
        prefs.edit().remove(KEY_PENDING_OFFER_DIALOG).apply()
        return try {
            Json.decodeFromString<SavedOffer>(json)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Check if there's a pending offer dialog.
     */
    fun hasPendingOfferDialog(): Boolean {
        return prefs.getString(KEY_PENDING_OFFER_DIALOG, null) != null
    }

    /**
     * Clear all preferences (for testing).
     */
    fun clear() {
        prefs.edit().clear().apply()
    }
}

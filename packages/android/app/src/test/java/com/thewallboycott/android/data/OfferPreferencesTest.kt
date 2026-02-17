package com.thewallboycott.android.data

import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.thewallboycott.android.data.models.Alternative
import com.thewallboycott.android.testutil.TestClock
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [OfferPreferences] — persists saved offers from uninstalled apps
 * that had alternatives.
 *
 * Uses [TestClock] for deterministic timestamps.
 */
@RunWith(AndroidJUnit4::class)
class OfferPreferencesTest {

    private lateinit var clock: TestClock
    private lateinit var prefs: OfferPreferences

    private val alt1 = Alternative("Jimdo", "https://www.jimdo.com")
    private val alt2 = Alternative("Webnode", "https://www.webnode.com")
    private val alt3 = Alternative("Squarespace", "https://www.squarespace.com")

    @Before
    fun setup() {
        clock = TestClock(initialTimeMillis = 1_000_000_000_000L)
        prefs = OfferPreferences(ApplicationProvider.getApplicationContext(), clock)
        prefs.clear()
    }

    // ==================== getSavedOffers ====================

    @Test
    fun getSavedOffers_defaultEmpty() {
        assertEquals(emptyList<OfferPreferences.SavedOffer>(), prefs.getSavedOffers())
    }

    @Test
    fun getSavedOffers_returnsEmptyOnCorruptedJson() {
        // Corrupt the underlying SharedPreferences
        val sharedPrefs = ApplicationProvider.getApplicationContext<android.content.Context>()
            .getSharedPreferences("offer_prefs", android.content.Context.MODE_PRIVATE)
        sharedPrefs.edit().putString("saved_offers", "not valid json!!!").apply()

        val result = prefs.getSavedOffers()
        assertEquals(emptyList<OfferPreferences.SavedOffer>(), result)
    }

    // ==================== saveOffer ====================

    @Test
    fun saveOffer_persistsSingleOffer() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1, alt2))

        val offers = prefs.getSavedOffers()
        assertEquals(1, offers.size)
        assertEquals("com.wix.android", offers[0].packageName)
        assertEquals("Wix", offers[0].appName)
        assertEquals("Wix", offers[0].entityName)
        assertEquals(2, offers[0].alternatives.size)
        assertEquals("Jimdo", offers[0].alternatives[0].n)
        assertEquals("https://www.webnode.com", offers[0].alternatives[1].ws)
        assertEquals(clock.currentTimeMillis(), offers[0].savedAt)
    }

    @Test
    fun saveOffer_multipleOffers_sortedByMostRecent() {
        prefs.saveOffer("com.first.app", "First App", "First", listOf(alt1))
        clock.advanceBy(5000)
        prefs.saveOffer("com.second.app", "Second App", "Second", listOf(alt2))
        clock.advanceBy(5000)
        prefs.saveOffer("com.third.app", "Third App", "Third", listOf(alt3))

        val offers = prefs.getSavedOffers()
        assertEquals(3, offers.size)
        // Most recent first
        assertEquals("com.third.app", offers[0].packageName)
        assertEquals("com.second.app", offers[1].packageName)
        assertEquals("com.first.app", offers[2].packageName)
    }

    @Test
    fun saveOffer_updatesExistingOffer() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1))
        clock.advanceBy(5000)
        prefs.saveOffer("com.wix.android", "Wix Updated", "Wix Ltd", listOf(alt1, alt2, alt3))

        val offers = prefs.getSavedOffers()
        assertEquals(1, offers.size)
        assertEquals("Wix Updated", offers[0].appName)
        assertEquals("Wix Ltd", offers[0].entityName)
        assertEquals(3, offers[0].alternatives.size)
        // Timestamp should be the updated one
        assertEquals(clock.currentTimeMillis(), offers[0].savedAt)
    }

    @Test
    fun saveOffer_updatesExisting_preservesOtherOffers() {
        prefs.saveOffer("com.first.app", "First", "First", listOf(alt1))
        clock.advanceBy(1000)
        prefs.saveOffer("com.second.app", "Second", "Second", listOf(alt2))
        clock.advanceBy(1000)
        // Update the first offer
        prefs.saveOffer("com.first.app", "First Updated", "First", listOf(alt3))

        val offers = prefs.getSavedOffers()
        assertEquals(2, offers.size)
        // Updated first offer should be most recent now
        assertEquals("com.first.app", offers[0].packageName)
        assertEquals("First Updated", offers[0].appName)
        assertEquals("com.second.app", offers[1].packageName)
    }

    @Test
    fun saveOffer_withEmptyAlternatives() {
        prefs.saveOffer("com.test.app", "Test", "Test Co", emptyList())

        val offers = prefs.getSavedOffers()
        assertEquals(1, offers.size)
        assertEquals(emptyList<Alternative>(), offers[0].alternatives)
    }

    // ==================== removeOffer ====================

    @Test
    fun removeOffer_removesExistingOffer() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1))
        prefs.saveOffer("com.other.app", "Other", "Other", listOf(alt2))

        prefs.removeOffer("com.wix.android")

        val offers = prefs.getSavedOffers()
        assertEquals(1, offers.size)
        assertEquals("com.other.app", offers[0].packageName)
    }

    @Test
    fun removeOffer_nonExistentPackage_noEffect() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1))

        prefs.removeOffer("com.nonexistent.app")

        val offers = prefs.getSavedOffers()
        assertEquals(1, offers.size)
    }

    @Test
    fun removeOffer_lastOffer_resultsInEmpty() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1))
        prefs.removeOffer("com.wix.android")

        assertTrue(prefs.getSavedOffers().isEmpty())
    }

    // ==================== hasOffers ====================

    @Test
    fun hasOffers_falseWhenEmpty() {
        assertFalse(prefs.hasOffers())
    }

    @Test
    fun hasOffers_trueWhenOffersExist() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1))
        assertTrue(prefs.hasOffers())
    }

    @Test
    fun hasOffers_falseAfterRemovingAll() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1))
        prefs.removeOffer("com.wix.android")
        assertFalse(prefs.hasOffers())
    }

    // ==================== Pending Offer Dialog ====================

    @Test
    fun pendingOfferDialog_defaultNone() {
        assertFalse(prefs.hasPendingOfferDialog())
        assertNull(prefs.consumePendingOfferDialog())
    }

    @Test
    fun setPendingOfferDialog_makesItAvailable() {
        prefs.setPendingOfferDialog("com.wix.android", "Wix", "Wix", listOf(alt1, alt2))

        assertTrue(prefs.hasPendingOfferDialog())
    }

    @Test
    fun consumePendingOfferDialog_returnsAndClears() {
        prefs.setPendingOfferDialog("com.wix.android", "Wix", "Wix", listOf(alt1, alt2))

        val consumed = prefs.consumePendingOfferDialog()
        assertNotNull(consumed)
        assertEquals("com.wix.android", consumed!!.packageName)
        assertEquals("Wix", consumed.appName)
        assertEquals("Wix", consumed.entityName)
        assertEquals(2, consumed.alternatives.size)
        assertEquals(clock.currentTimeMillis(), consumed.savedAt)

        // Should be cleared after consuming
        assertFalse(prefs.hasPendingOfferDialog())
        assertNull(prefs.consumePendingOfferDialog())
    }

    @Test
    fun consumePendingOfferDialog_returnsNullOnCorruptedJson() {
        val sharedPrefs = ApplicationProvider.getApplicationContext<android.content.Context>()
            .getSharedPreferences("offer_prefs", android.content.Context.MODE_PRIVATE)
        sharedPrefs.edit().putString("pending_offer_dialog", "invalid json").apply()

        assertNull(prefs.consumePendingOfferDialog())
    }

    @Test
    fun setPendingOfferDialog_overwritesPrevious() {
        prefs.setPendingOfferDialog("com.first.app", "First", "First", listOf(alt1))
        prefs.setPendingOfferDialog("com.second.app", "Second", "Second", listOf(alt2))

        val consumed = prefs.consumePendingOfferDialog()
        assertNotNull(consumed)
        assertEquals("com.second.app", consumed!!.packageName)
    }

    // ==================== Pending dialog is independent of saved offers ====================

    @Test
    fun pendingDialog_independentOfSavedOffers() {
        prefs.saveOffer("com.saved.app", "Saved", "Saved", listOf(alt1))
        prefs.setPendingOfferDialog("com.pending.app", "Pending", "Pending", listOf(alt2))

        // Clearing saved offers should not affect pending dialog
        prefs.removeOffer("com.saved.app")
        assertTrue(prefs.hasPendingOfferDialog())

        // Consuming pending should not affect saved offers
        prefs.saveOffer("com.saved.app", "Saved", "Saved", listOf(alt1))
        prefs.consumePendingOfferDialog()
        assertEquals(1, prefs.getSavedOffers().size)
    }

    // ==================== Clear ====================

    @Test
    fun clear_removesAllState() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1))
        prefs.setPendingOfferDialog("com.pending.app", "Pending", "Pending", listOf(alt2))

        prefs.clear()

        assertFalse(prefs.hasOffers())
        assertFalse(prefs.hasPendingOfferDialog())
        assertEquals(emptyList<OfferPreferences.SavedOffer>(), prefs.getSavedOffers())
    }

    // ==================== Persistence ====================

    @Test
    fun savedOffers_survivesNewInstance() {
        prefs.saveOffer("com.wix.android", "Wix", "Wix", listOf(alt1))

        val prefs2 = OfferPreferences(ApplicationProvider.getApplicationContext(), clock)
        val offers = prefs2.getSavedOffers()
        assertEquals(1, offers.size)
        assertEquals("com.wix.android", offers[0].packageName)
    }

    @Test
    fun pendingDialog_survivesNewInstance() {
        prefs.setPendingOfferDialog("com.wix.android", "Wix", "Wix", listOf(alt1))

        val prefs2 = OfferPreferences(ApplicationProvider.getApplicationContext(), clock)
        assertTrue(prefs2.hasPendingOfferDialog())
    }
}

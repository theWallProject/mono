package com.thewallboycott.android.testutil

import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [TestDatabase] — validates the real production database loads
 * correctly and the extraction utilities work.
 *
 * These tests double as schema integrity checks: if the ALL.json format changes
 * in a way that breaks deserialization, these tests will fail.
 */
@RunWith(AndroidJUnit4::class)
class TestDatabaseTest {

    @Test
    fun loadAll_returnsNonEmptyList() {
        val items = TestDatabase.loadAll()
        assertTrue("Database should have entries", items.isNotEmpty())
        assertTrue("Database should have at least 1000 entries", items.size > 1000)
    }

    @Test
    fun findById_wix_returnsCorrectEntry() {
        val wix = TestDatabase.findById("wix")
        assertNotNull("Wix should exist in database", wix)
        assertEquals("Wix", wix!!.n)
        assertTrue("Wix should have reasons", wix.r.isNotEmpty())
    }

    @Test
    fun findByName_fiverr_returnsResults() {
        val results = TestDatabase.findByName("Fiverr")
        assertTrue("Fiverr should exist in database", results.isNotEmpty())
    }

    @Test
    fun findByAndroidAppId_returnsEntry() {
        val item = TestDatabase.findByAndroidAppId("com.airbnb.android")
        assertNotNull("Airbnb android app should exist", item)
    }

    @Test
    fun findByAndroidDevId_returnsEntries() {
        val items = TestDatabase.findByAndroidDevId("com.fiverr")
        assertTrue("Fiverr dev ID should return entries", items.isNotEmpty())
    }

    @Test
    fun getAllWithAndroidIds_returnsNonEmpty() {
        val items = TestDatabase.getAllWithAndroidIds()
        assertTrue("Should have entries with Android IDs", items.isNotEmpty())
    }

    @Test
    fun getHints_returnsNonEmpty() {
        val hints = TestDatabase.getHints()
        assertTrue("Should have hint entries", hints.isNotEmpty())
        assertTrue("All hints should have isHint=true", hints.all { it.isHint == true })
    }

    @Test
    fun getAndroidHints_returnsEntriesWithHintAndroidId() {
        val hints = TestDatabase.getAndroidHints()
        assertTrue("Should have Android hint entries", hints.isNotEmpty())
        assertTrue(
            "All Android hints should have hintAndroidId",
            hints.all { it.hintAndroidId != null }
        )
    }

    @Test
    fun getBlacklist_excludesHints() {
        val blacklist = TestDatabase.getBlacklist()
        assertTrue("Blacklist should be non-empty", blacklist.isNotEmpty())
        assertTrue(
            "Blacklist should not contain hints",
            blacklist.none { it.isHint == true }
        )
    }

    @Test
    fun allEntries_haveRequiredFields() {
        val items = TestDatabase.loadAll()
        for (item in items) {
            assertTrue("Entry ${item.id} must have an id", item.id.isNotEmpty())
            assertTrue("Entry ${item.id} must have a name", item.n.isNotEmpty())
            assertNotNull("Entry ${item.id} must have reasons list", item.r)
        }
    }
}

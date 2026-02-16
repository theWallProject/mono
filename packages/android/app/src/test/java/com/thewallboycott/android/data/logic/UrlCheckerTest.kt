package com.thewallboycott.android.data.logic

import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.thewallboycott.android.data.models.UrlCheckResult
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [UrlChecker] — the core URL matching engine.
 * Uses the real ALL.json database from assets to ensure schema integrity.
 */
@RunWith(AndroidJUnit4::class)
class UrlCheckerTest {

    private lateinit var checker: UrlChecker

    @Before
    fun setup() {
        checker = UrlChecker(ApplicationProvider.getApplicationContext())
    }

    // ==================== Direct Domain Matching ====================

    @Test
    fun checkUrl_wixDotCom_returnsMatch() = runTest {
        val result = checker.checkUrl("wix.com")
        assertTrue("Expected Match for wix.com", result is UrlCheckResult.Match)
        val match = result as UrlCheckResult.Match
        assertEquals("Wix", match.name)
        assertTrue("Wix should have 'h' reason", match.reasons.any { it == "h" })
    }

    @Test
    fun checkUrl_wixWithHttps_returnsMatch() = runTest {
        val result = checker.checkUrl("https://www.wix.com")
        assertTrue("Expected Match for https://www.wix.com", result is UrlCheckResult.Match)
    }

    @Test
    fun checkUrl_fiverrDotCom_returnsMatch() = runTest {
        val result = checker.checkUrl("fiverr.com")
        assertTrue("Expected Match for fiverr.com", result is UrlCheckResult.Match)
        val match = result as UrlCheckResult.Match
        assertEquals("Fiverr", match.name)
    }

    @Test
    fun checkUrl_unknownDomain_returnsNull() = runTest {
        val result = checker.checkUrl("example.com")
        assertTrue("Expected null for unknown domain", result == null)
    }

    // ==================== .il Domain Detection ====================

    @Test
    fun checkUrl_ilDomain_returnsHint() = runTest {
        val result = checker.checkUrl("https://www.example.co.il")
        // .il domains should produce a hint result
        assertNotNull("Expected non-null for .il domain", result)
    }

    // ==================== Social Media URL Matching ====================

    @Test
    fun checkUrl_linkedinProfile_returnsMatch() = runTest {
        // Wix has li: "wix-com" in the database (not "wix")
        val result = checker.checkUrl("https://www.linkedin.com/company/wix-com")
        assertTrue("Expected Match for LinkedIn/wix-com", result is UrlCheckResult.Match)
        val match = result as UrlCheckResult.Match
        assertEquals("Wix", match.name)
    }

    // ==================== Autocomplete ====================

    @Test
    fun searchAutocomplete_wix_returnsSuggestions() = runTest {
        // searchAutocomplete requires query.length >= 4, so "wix" (3 chars) is too short
        val suggestions = checker.searchAutocomplete("fiver")
        assertTrue("Expected at least one suggestion for 'fiver'", suggestions.isNotEmpty())
        assertTrue(
            "Expected Fiverr in suggestions",
            suggestions.any { it.companyName == "Fiverr" }
        )
    }

    @Test
    fun searchAutocomplete_shortQuery_returnsEmpty() = runTest {
        // searchAutocomplete requires query.length >= 4
        val suggestions = checker.searchAutocomplete("wix")
        assertTrue("Expected empty for query under 4 chars", suggestions.isEmpty())
    }

    @Test
    fun searchAutocomplete_nonsense_returnsEmpty() = runTest {
        val suggestions = checker.searchAutocomplete("zzzzxyzxyz")
        assertTrue("Expected empty for nonsense query", suggestions.isEmpty())
    }

    // ==================== Schema Integrity ====================

    @Test
    fun database_loadsSuccessfully() = runTest {
        // Trigger a check to force database loading — should not throw
        checker.checkUrl("test-load.com")
    }
}

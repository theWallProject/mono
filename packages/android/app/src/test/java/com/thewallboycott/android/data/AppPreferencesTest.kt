package com.thewallboycott.android.data

import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.thewallboycott.android.data.AppPreferences.SupportedLanguage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [AppPreferences] — language storage and locale resolution.
 *
 * Note: [AppCompatDelegate.setApplicationLocales] is a global side effect
 * that triggers Activity recreation. We test the preference storage and
 * resolution logic, not the runtime locale application.
 */
@RunWith(AndroidJUnit4::class)
class AppPreferencesTest {

    private lateinit var prefs: AppPreferences

    @Before
    fun setup() {
        prefs = AppPreferences(ApplicationProvider.getApplicationContext())
        // Reset to system default before each test
        prefs.setLanguage("")
    }

    // ==================== Storage ====================

    @Test
    fun defaultState_isSystemDefault() {
        assertTrue(prefs.isSystemDefault())
        assertEquals("", prefs.getStoredLanguageTag())
    }

    @Test
    fun setLanguage_storesTag() {
        prefs.setLanguage("ar")
        assertEquals("ar", prefs.getStoredLanguageTag())
    }

    @Test
    fun setLanguage_emptyStringResetsToSystemDefault() {
        prefs.setLanguage("ar")
        prefs.setLanguage("")
        assertTrue(prefs.isSystemDefault())
    }

    // ==================== SupportedLanguage enum ====================

    @Test
    fun findByTag_findsEnglish() {
        assertEquals(SupportedLanguage.ENGLISH, SupportedLanguage.findByTag("en"))
    }

    @Test
    fun findByTag_findsArabic() {
        assertEquals(SupportedLanguage.ARABIC, SupportedLanguage.findByTag("ar"))
    }

    @Test
    fun findByTag_caseInsensitive() {
        assertEquals(SupportedLanguage.ENGLISH, SupportedLanguage.findByTag("EN"))
    }

    @Test
    fun findByTag_returnsNullForUnsupported() {
        assertNull(SupportedLanguage.findByTag("fr"))
    }

    // ==================== Locale Resolution ====================

    @Test
    fun resolveFromLocale_exactMatch() {
        val arabic = java.util.Locale.forLanguageTag("ar")
        assertEquals(SupportedLanguage.ARABIC, SupportedLanguage.resolveFromLocale(arabic))
    }

    @Test
    fun resolveFromLocale_dialectFallback() {
        // ar-SA (Saudi Arabic) should fall back to ARABIC ("ar")
        val saudiArabic = java.util.Locale.forLanguageTag("ar-SA")
        assertEquals(SupportedLanguage.ARABIC, SupportedLanguage.resolveFromLocale(saudiArabic))
    }

    @Test
    fun resolveFromLocale_unsupportedFallsToEnglish() {
        // French is not supported, should fall back to ENGLISH
        val french = java.util.Locale.forLanguageTag("fr")
        assertEquals(SupportedLanguage.ENGLISH, SupportedLanguage.resolveFromLocale(french))
    }

    @Test
    fun resolveFromLocale_englishUS() {
        val englishUS = java.util.Locale.forLanguageTag("en-US")
        assertEquals(SupportedLanguage.ENGLISH, SupportedLanguage.resolveFromLocale(englishUS))
    }

    // ==================== Effective Language ====================

    @Test
    fun getEffectiveLanguage_explicitChoice() {
        prefs.setLanguage("ar")
        assertEquals(SupportedLanguage.ARABIC, prefs.getEffectiveLanguage())
    }

    @Test
    fun getEffectiveLanguage_unknownTagFallsToEnglish() {
        prefs.setLanguage("zz")
        assertEquals(SupportedLanguage.ENGLISH, prefs.getEffectiveLanguage())
    }

    @Test
    fun getEffectiveLanguage_systemDefaultResolvesLanguage() {
        // When set to system default, effective language is derived from system locale.
        // Robolectric defaults to en-US, so this should resolve to English.
        prefs.setLanguage("")
        assertNotNull(prefs.getEffectiveLanguage())
    }

    // ==================== All Supported Languages have required fields ====================

    @Test
    fun allSupportedLanguages_haveNonEmptyFields() {
        for (lang in SupportedLanguage.entries) {
            assertTrue("${lang.name} tag is empty", lang.tag.isNotEmpty())
            assertTrue("${lang.name} nativeName is empty", lang.nativeName.isNotEmpty())
            assertTrue("${lang.name} englishName is empty", lang.englishName.isNotEmpty())
        }
    }
}

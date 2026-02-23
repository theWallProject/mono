package com.thewallboycott.android.data

import android.app.Activity
import android.content.Context
import android.content.SharedPreferences
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import java.util.Locale

/**
 * Centralized preferences store for app-wide settings.
 * Uses SharedPreferences for persistence (consistent with existing pattern).
 *
 * Currently manages:
 * - Language preference with dialect-aware fallback chain
 *
 * Extend this class when adding new app-wide settings.
 */
class AppPreferences(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "app_preferences"
        private const val KEY_LANGUAGE_TAG = "language_tag"

        /** Empty string means "follow system language with fallback chain". */
        private const val SYSTEM_DEFAULT_TAG = ""

        /**
         * Apply the stored locale preference at app startup.
         * Must be called in Activity.onCreate() BEFORE setContent() to ensure
         * the correct locale is active before any UI renders.
         *
         * If no preference is stored (or set to system default), this passes
         * an empty LocaleList to AppCompat, which defers to the system locale.
         * Android's resource resolution then picks the best match from our
         * supported locales automatically.
         */
        fun applyStoredLocale(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val storedTag = prefs.getString(KEY_LANGUAGE_TAG, SYSTEM_DEFAULT_TAG) ?: SYSTEM_DEFAULT_TAG

            if (storedTag == SYSTEM_DEFAULT_TAG) {
                // Follow system: pass empty locale list so AppCompat defers to system
                AppCompatDelegate.setApplicationLocales(LocaleListCompat.getEmptyLocaleList())
            } else {
                AppCompatDelegate.setApplicationLocales(
                    LocaleListCompat.forLanguageTags(storedTag)
                )
            }
        }
    }

    /**
     * All languages the app has complete translations for.
     * When adding a new language, add an entry here AND update:
     * - res/values-{lang}/strings.xml (complete translations)
     * - res/xml/locales_config.xml (locale entry)
     * - build.gradle.kts localeFilters
     * - fastlane metadata directory
     *
     * @property tag BCP-47 language tag (e.g., "en", "ar", "zh-Hans")
     * @property nativeName Language name displayed in its own script
     * @property englishName Language name in English (for accessibility/subtitle)
     */
    enum class SupportedLanguage(
        val tag: String,
        val nativeName: String,
        val englishName: String
    ) {
        ENGLISH("en", "English", "English"),
        ARABIC("ar", "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", "Arabic");

        companion object {
            /**
             * Find a supported language by exact tag match.
             * @return The matching [SupportedLanguage], or null if not found.
             */
            fun findByTag(tag: String): SupportedLanguage? =
                entries.find { it.tag.equals(tag, ignoreCase = true) }

            /**
             * Resolve a locale to the best matching supported language using
             * a dialect-aware fallback chain:
             *
             * 1. Exact tag match (e.g., "ar" matches ARABIC)
             * 2. Full locale tag match (e.g., "ar-SA" checked first)
             * 3. Base language match (e.g., "ar-SA" falls back to "ar")
             * 4. English as ultimate fallback
             *
             * @param locale The locale to resolve
             * @return The best matching [SupportedLanguage]
             */
            fun resolveFromLocale(locale: Locale): SupportedLanguage {
                val fullTag = locale.toLanguageTag() // e.g., "ar-SA", "zh-Hans-CN"
                val baseLanguage = locale.language    // e.g., "ar", "zh"

                // 1. Try exact full tag match (handles dialect-specific entries)
                findByTag(fullTag)?.let { return it }

                // 2. Try base language match
                findByTag(baseLanguage)?.let { return it }

                // 3. Try matching against just the language part of each supported tag
                //    This handles cases like supported "zh-Hans" matching locale "zh"
                entries.find { supported ->
                    Locale.forLanguageTag(supported.tag).language.equals(baseLanguage, ignoreCase = true)
                }?.let { return it }

                // 4. Ultimate fallback
                return ENGLISH
            }
        }
    }

    /**
     * Get the currently stored language tag.
     * @return The stored BCP-47 tag, or empty string for system default.
     */
    fun getStoredLanguageTag(): String =
        prefs.getString(KEY_LANGUAGE_TAG, SYSTEM_DEFAULT_TAG) ?: SYSTEM_DEFAULT_TAG

    /**
     * Check if the user is using system default language (no explicit override).
     */
    fun isSystemDefault(): Boolean =
        getStoredLanguageTag() == SYSTEM_DEFAULT_TAG

    /**
     * Resolve the system's default locale through our fallback chain.
     * Used to display what language "System Default" actually resolves to.
     *
     * @return The [SupportedLanguage] that the system locale maps to.
     */
    fun resolveSystemLanguage(): SupportedLanguage {
        val systemLocale = Locale.getDefault()
        return SupportedLanguage.resolveFromLocale(systemLocale)
    }

    /**
     * Get the effective language — either the explicit user choice or the
     * resolved system language.
     *
     * @return The [SupportedLanguage] currently in effect.
     */
    fun getEffectiveLanguage(): SupportedLanguage {
        val storedTag = getStoredLanguageTag()
        if (storedTag == SYSTEM_DEFAULT_TAG) {
            return resolveSystemLanguage()
        }
        return SupportedLanguage.findByTag(storedTag) ?: SupportedLanguage.ENGLISH
    }

    /**
     * Set the active language, apply it via AppCompat, and recreate the activity.
     *
     * On Android 13+ with `singleTask` launch mode, `setApplicationLocales()`
     * can deliver `onConfigurationChanged` instead of recreating the activity.
     * When that happens the configuration's layout direction updates (RTL kicks in)
     * but the activity's base context resources still resolve strings from the
     * old locale — causing the "RTL layout but English text" flicker.
     *
     * To guarantee a clean slate we use `commit()` (synchronous write) so the
     * preference is persisted before recreation, then explicitly call
     * `activity.recreate()` as a safety net. If `setApplicationLocales()`
     * already triggered recreation, the second `recreate()` is a no-op because
     * the activity is already finishing.
     *
     * @param tag BCP-47 language tag from [SupportedLanguage.tag], or empty string
     *            for system default.
     * @param activity The current activity — required to force recreation when
     *                 AppCompat's implicit recreation is unreliable.
     */
    fun setLanguage(tag: String, activity: Activity? = null) {
        // Synchronous write: the tag must be on disk before the activity
        // recreates and applyStoredLocale() reads it back in onCreate().
        prefs.edit().putString(KEY_LANGUAGE_TAG, tag).commit()

        if (tag == SYSTEM_DEFAULT_TAG) {
            AppCompatDelegate.setApplicationLocales(LocaleListCompat.getEmptyLocaleList())
        } else {
            AppCompatDelegate.setApplicationLocales(
                LocaleListCompat.forLanguageTags(tag)
            )
        }

        // Explicit recreation: guards against singleTask swallowing the
        // implicit recreation that setApplicationLocales() normally triggers.
        activity?.recreate()
    }
}

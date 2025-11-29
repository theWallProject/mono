/**
 * Type-safe translation helpers for Telegram bot.
 * Provides compile-time key validation and language detection.
 */

import type { Context } from "telegraf"

import {
  TRANSLATIONS,
  type LanguageCode,
  type TranslationKey
} from "./TRANSLATIONS/DB.js"

/**
 * Gets a translation for a given key and language.
 * Fully type-safe with compile-time key validation.
 * @param key - Translation key (must exist in TRANSLATIONS)
 * @param language - Language code (must be supported)
 * @param fallback - Optional fallback language (defaults to "en")
 * @returns Translated string (never undefined)
 * @throws Error if translation key or language is missing
 */
export function getTranslation<K extends TranslationKey>(
  key: K,
  language: LanguageCode,
  fallback: LanguageCode = "en"
): string {
  const translation = TRANSLATIONS[key]
  if (!translation) {
    throw new Error(`Translation key "${String(key)}" not found`)
  }

  const text = translation[language]
  if (text) {
    return text
  }

  // Try fallback language
  const fallbackText = translation[fallback]
  if (fallbackText) {
    return fallbackText
  }

  // Last resort: try English
  const englishText = translation.en
  if (englishText) {
    return englishText
  }

  throw new Error(
    `Translation missing for key "${String(key)}" in language "${language}" and fallback "${fallback}"`
  )
}

/**
 * Normalizes Telegram language code to our supported format.
 * Handles variations like "zh-CN" -> "zh_CN", "en-US" -> "en"
 */
function normalizeLanguageCode(code: string | undefined): LanguageCode {
  if (!code || typeof code !== "string") {
    return "en"
  }

  // Normalize common variations
  const normalized = code.toLowerCase().replace(/-/g, "_").trim()

  // Map known variations
  const languageMap: Record<string, LanguageCode> = {
    zh_cn: "zh_CN",
    zh_tw: "zh_TW",
    "zh-cn": "zh_CN",
    "zh-tw": "zh_TW",
    en_us: "en",
    "en-us": "en",
    en: "en",
    ar: "ar",
    id: "id",
    fr: "fr",
    nl: "nl",
    ms: "ms",
    bn: "bn"
  }

  const mapped = languageMap[normalized]
  if (mapped) {
    return mapped
  }

  // Check if it's a direct match (case-insensitive)
  const supportedLanguages: LanguageCode[] = [
    "en",
    "ar",
    "id",
    "fr",
    "nl",
    "zh_CN",
    "zh_TW",
    "ms",
    "bn"
  ]

  const directMatch = supportedLanguages.find(
    (lang) => lang.toLowerCase() === normalized
  )
  if (directMatch) {
    return directMatch
  }

  // Extract base language (e.g., "en" from "en-US")
  const parts = normalized.split("_")
  const baseLang = parts[0]?.split("-")[0]
  if (baseLang) {
    const baseMatch = supportedLanguages.find(
      (lang) => lang.toLowerCase() === baseLang
    )
    if (baseMatch) {
      return baseMatch
    }
  }

  // Default to English if no match found
  return "en"
}

/**
 * Extracts user language from Telegram context.
 * Uses ctx.from.language_code if available, defaults to "en".
 * @param ctx - Telegram bot context
 * @returns Language code (always valid, defaults to "en")
 */
export function getUserLanguage(ctx: Context): LanguageCode {
  if (!("from" in ctx) || !ctx.from) {
    return "en"
  }

  const languageCode = ctx.from.language_code
  return normalizeLanguageCode(languageCode)
}

/**
 * Type-safe translation function bound to a specific language.
 * Shorter alias: use `t` instead of `getTranslation`.
 */
export type TFunction = <K extends TranslationKey>(key: K) => string

/**
 * Creates a context-aware translation function.
 * Automatically extracts language from Telegram context.
 * @param ctx - Telegram bot context
 * @returns Translation function `t` bound to user's language
 * @example
 * ```typescript
 * const t = getT(ctx);
 * const message = t("safe"); // Automatically uses user's language
 * ```
 */
export function getT(ctx: Context): TFunction {
  const language = getUserLanguage(ctx)
  return <K extends TranslationKey>(key: K): string => {
    return getTranslation(key, language)
  }
}

/**
 * Creates a translation function bound to a specific language.
 * Useful when context is not available (e.g., in urlCheckerBot).
 * @param language - Language code (defaults to "en")
 * @returns Translation function `t` bound to specified language
 * @example
 * ```typescript
 * const t = getTByLanguage("ar");
 * const message = t("safe"); // Uses Arabic
 * ```
 */
export function getTByLanguage(language: LanguageCode = "en"): TFunction {
  return <K extends TranslationKey>(key: K): string => {
    return getTranslation(key, language)
  }
}

// Re-export types for convenience
export type { TranslationKey, LanguageCode }

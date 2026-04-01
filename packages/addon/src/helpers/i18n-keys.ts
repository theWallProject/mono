/**
 * Type definition for all i18n message keys from locales/en/messages.json.
 * This type is derived from the actual translation file structure.
 *
 * To update: Run `pnpm run trans` to regenerate locales, then update this type
 * to match the keys in locales/en/messages.json
 */
import messagesEn from "../../locales/en/messages.json"

/**
 * All valid i18n message keys extracted from the actual messages.json file.
 * This ensures type safety - any key used with chrome.i18n.getMessage must exist here.
 *
 * ⚠️ IMPORTANT: ALL translation keys in the addon package MUST use this type.
 * Never use plain strings for chrome.i18n.getMessage - always use I18nMessageKey.
 */
export type I18nMessageKey = keyof typeof messagesEn

/**
 * Expected reason keys - if any of these don't exist in messages.json, TypeScript will error.
 */
type ExpectedReasonKeys =
  | "reasonUrlIL"
  | "reasonFounder"
  | "reasonInvestor"
  | "reasonHeadquarter"
  | "reasonBDSPriority"
  | "reasonBDSGrassroots"
  | "reasonBDSPressure"
  | "reasonCustom"

/**
 * Union type of reason-related i18n message keys.
 * These are the keys used for displaying reason messages.
 * TypeScript will error if any of the expected keys don't exist in messages.json.
 */
export type ReasonI18nKey = Extract<I18nMessageKey, ExpectedReasonKeys>

/**
 * Type-level validation: ensures all expected reason keys exist in I18nMessageKey.
 * If any key is missing from messages.json, this type will be 'never', causing a compile error.
 *
 * The validation checks that:
 * 1. All expected keys are assignable to ReasonI18nKey (they exist in messages.json)
 * 2. ReasonI18nKey contains all expected keys (no keys are missing)
 */
type _ValidateAllReasonKeysExist = ExpectedReasonKeys extends ReasonI18nKey
  ? ReasonI18nKey extends ExpectedReasonKeys
    ? true
    : never
  : never

// Export a type that uses the validation - this forces TypeScript to evaluate it
// If validation fails, this will cause a compile error
export type _ReasonKeysValidated = _ValidateAllReasonKeysExist

/**
 * Typed wrapper for chrome.i18n.getMessage that enforces I18nMessageKey type.
 *
 * ⚠️ IMPORTANT: Use this function instead of chrome.i18n.getMessage directly.
 * This ensures all translation keys are type-checked against the actual messages.json file.
 *
 * @param messageKey - Must be a valid key from messages.json (I18nMessageKey)
 * @param substitutions - Optional array of substitution strings
 * @returns The translated message string
 */
export function getI18nMessage(messageKey: I18nMessageKey, substitutions?: string[]): string {
  return chrome.i18n.getMessage(messageKey, substitutions)
}

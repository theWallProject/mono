import { ManualOverrideFields } from "../../types"

// ────────────────────────────────────────────────────────────────────────────
// _meta: structured metadata replacing the old _processed flag
// ────────────────────────────────────────────────────────────────────────────

/** Metadata flags for manual override/addition entries */
export type EntryMeta = {
  /** true = entry was auto-extracted by Homepage AI Extractor */
  readonly isHomepage?: boolean
  /** true = human reviewed the data via the quick-verify script (data:verify) or browser workflow */
  readonly isVerified?: boolean
  /** true = human verified URLs live in the browser workflow (validate_urls.ts) */
  readonly isBrowserVerified?: boolean
}

/** An entry that carries structured metadata */
export type MetaState = { readonly _meta: EntryMeta }

// ────────────────────────────────────────────────────────────────────────────
// ManualOverrideValue — the union of all valid shapes for override entries
// ────────────────────────────────────────────────────────────────────────────

export type ManualOverrideValue =
  | (ManualOverrideFields & MetaState)
  | MetaState
  | ManualOverrideFields

// ────────────────────────────────────────────────────────────────────────────
// URL-related types (unchanged)
// ────────────────────────────────────────────────────────────────────────────

export type OverrideWithUrls = {
  ws?: string | string[]
  li?: string | string[]
  fb?: string | string[]
  tw?: string | string[]
  ig?: string | string[]
  gh?: string | string[]
  ytp?: string | string[]
  ytc?: string | string[]
  tt?: string | string[]
  th?: string | string[]
  urls?: string[]
  android_app_ids?: string[]
}

export type CategorizedUrls = {
  ws?: string[]
  li?: string[]
  fb?: string[]
  tw?: string[]
  ig?: string[]
  gh?: string[]
  ytp?: string[]
  ytc?: string[]
  tt?: string[]
  th?: string[]
  urls?: string[] // Unsupported URLs only
  android_app_ids?: string[] // Android app package IDs extracted from Play Store URLs
}

// ────────────────────────────────────────────────────────────────────────────
// Type guards
// ────────────────────────────────────────────────────────────────────────────

/** Returns true if the entry has a _meta object */
export const hasMeta = (
  value: ManualOverrideValue
): value is MetaState | (ManualOverrideFields & MetaState) => {
  return typeof value === "object" && value !== null && "_meta" in value && typeof value._meta === "object"
}

/** Returns true if the entry has been quick-verified (data:verify or browser workflow) */
export const isVerified = (value: ManualOverrideValue): boolean => {
  return hasMeta(value) && value._meta.isVerified === true
}

/** Returns true if the entry was auto-extracted by Homepage AI Extractor */
export const isHomepage = (value: ManualOverrideValue): boolean => {
  return hasMeta(value) && value._meta.isHomepage === true
}

/** Returns true if the entry was fully verified via the browser workflow */
export const isBrowserVerified = (value: ManualOverrideValue): boolean => {
  return hasMeta(value) && value._meta.isBrowserVerified === true
}

// ────────────────────────────────────────────────────────────────────────────
// Meta constructors — convenience helpers for creating _meta objects
// ────────────────────────────────────────────────────────────────────────────

/** _meta for auto-extracted entries (Homepage AI Extractor) */
export const homepageMeta: EntryMeta = { isHomepage: true } as const

/** _meta for browser-verified entries (implies quick-verified too) */
export const browserVerifiedMeta: EntryMeta = { isVerified: true, isBrowserVerified: true } as const

// ────────────────────────────────────────────────────────────────────────────
// Legacy guard — fail fast if old _processed flag is found
// ────────────────────────────────────────────────────────────────────────────

/**
 * Throws immediately if the entry contains the legacy `_processed` field.
 * Call this at load time for every entry to ensure complete migration.
 */
export const assertNoLegacyProcessed = (value: object, key: string): void => {
  if ("_processed" in value) {
    throw new Error(
      `Legacy _processed field found on entry "${key}". ` +
        "All entries must use _meta instead. Run the migration first."
    )
  }
}



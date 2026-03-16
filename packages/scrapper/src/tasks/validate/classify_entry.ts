/**
 * Pure classification logic for manual override entries.
 *
 * Compares each override entry against the final ALL.json database to determine
 * whether verifying it would produce any change. Entries that are pure duplicates
 * (all link field selectors already exist in ALL.json) can be auto-verified,
 * saving the human reviewer from wasting time on them.
 *
 * Also detects LinkedIn/YouTube resolver artifacts — entries whose "new" data
 * is solely the result of the redirect-resolution pipeline (numerical LinkedIn
 * IDs → slugs, YouTube channel IDs → @handles). These resolver fields are
 * treated as "no new data" when their resolved values already exist in ALL.json.
 *
 * IMPORTANT: All comparisons are scoped to the same company (matched by name).
 * A selector existing under a different company does NOT count as a duplicate,
 * because the merge pipeline applies overrides per-company (by name match).
 * A company may have multiple rows in ALL.json (from array-URL splitting in
 * merge_static.ts), so we filter by name and search the company's own rows.
 */

import {
  type FinalDBFileType,
  type LinkField,
  type SpecialDomains,
  findInDatabaseByDomain,
  findInDatabaseBySelector
} from "@theWallProject/common"

import { extractIdentifier } from "../merge_static"
import { isNumericalLinkedInUrl } from "../homepage_ai_extractor/linkedin_resolver"
import type { ManualOverrideValue } from "./types"

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type EntryClassification = "duplicate" | "new"

/**
 * Per-field classification result. Maps field keys to whether they are
 * "new" (not in ALL.json for this company) or "duplicate" (already present).
 * Fields in IGNORED_FIELDS are omitted entirely.
 */
export type FieldClassification = Record<string, EntryClassification>

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

/** Fields that never affect ALL.json during merge (excluded from comparison). */
const IGNORED_FIELDS = new Set(["_meta", "urls", "name", "alt"])

/**
 * All link fields that carry social/website data.
 * Constructed as Set<LinkField> for strict membership, annotated as ReadonlySet<string>
 * so .has() accepts string keys (safe widening since every LinkField is a string).
 */
const LINK_FIELDS_SET: ReadonlySet<string> = new Set<LinkField>(["ws", "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"])

/** Type guard: checks if a string key is a LinkField. */
const isLinkField = (key: string): key is LinkField => LINK_FIELDS_SET.has(key)

/** Map from LinkField to the SpecialDomains value used by findInDatabaseBySelector. */
const FIELD_TO_DOMAIN: Record<Exclude<LinkField, "ws" | "il">, SpecialDomains> = {
  li: "linkedin.com",
  fb: "facebook.com",
  tw: "twitter.com",
  ig: "instagram.com",
  gh: "github.com",
  ytp: "youtube.com",
  ytc: "youtube.com",
  tt: "tiktok.com",
  th: "threads.com"
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Extract a domain from a full URL for website comparison. */
const extractDomain = (url: string): string => {
  const domain = url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]
  if (!domain) throw new Error(`Failed to extract domain from: ${url}`)
  return domain
}

/**
 * Normalize a URL array from an override field value.
 * Fields can be string | string[] | undefined.
 */
const toUrlArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string")
  if (typeof value === "string") return [value]
  return []
}

/**
 * Extract the raw selector from a URL for a given field, suitable for
 * database lookup (without the _-substitution that extractIdentifier does).
 */
const extractRawSelector = (url: string, field: Exclude<LinkField, "ws" | "il">): string | null => {
  try {
    const identifier = extractIdentifier(url, field)
    // extractIdentifier replaces / with _ — reverse that for DB lookup
    return identifier.replace(/_/g, "/")
  } catch {
    return null
  }
}

/**
 * Check if a LinkedIn li field is a resolver artifact where all non-numerical
 * slugs already exist in ALL.json under the same company.
 *
 * A resolver artifact is when the li array contains both a numerical ID
 * (found on the homepage by the AI extractor) and a non-numerical slug
 * (added by the LinkedIn resolver via browser redirect).
 *
 * Returns true if:
 * - The li array has at least one numerical ID AND at least one non-numerical slug
 * - ALL non-numerical slugs already exist in ALL.json under the same company
 *
 * This means the numerical IDs are just intermediate redirect sources,
 * and the resolved slugs are already known — no new data.
 */
export const isLinkedInResolverDuplicate = (liUrls: string[], companyRows: FinalDBFileType[]): boolean => {
  const numerical = liUrls.filter(isNumericalLinkedInUrl)
  const nonNumerical = liUrls.filter((u) => !isNumericalLinkedInUrl(u))

  // Must have both numerical and non-numerical to be a resolver artifact
  if (numerical.length === 0 || nonNumerical.length === 0) return false

  // All non-numerical slugs must already exist in ALL.json under this company
  return nonNumerical.every((url) => {
    const selector = extractRawSelector(url, "li")
    if (!selector) return false
    return findInDatabaseBySelector(selector, "li", "linkedin.com", companyRows) !== null
  })
}

/**
 * Check if a YouTube ytc+ytp combination is a resolver artifact where the
 * resolved @handle already exists in ALL.json under the same company.
 *
 * The YouTube resolver takes ytc (channel ID) URLs and produces ytp (@handle)
 * URLs. If the resolved ytp handle already exists in ALL.json, the resolver
 * output is just confirming known data.
 *
 * Returns true if ALL ytp handles and ALL ytc channel IDs already exist
 * in ALL.json under the same company.
 */
export const isYouTubeResolverDuplicate = (
  ytpUrls: string[],
  ytcUrls: string[],
  companyRows: FinalDBFileType[]
): boolean => {
  // Must have both ytc and ytp to be a resolver artifact
  if (ytcUrls.length === 0 || ytpUrls.length === 0) return false

  // All ytp handles must already exist in ALL.json under this company
  const allYtpExist = ytpUrls.every((url) => {
    const selector = extractRawSelector(url, "ytp")
    if (!selector) return false
    return findInDatabaseBySelector(selector, "ytp", "youtube.com", companyRows) !== null
  })

  if (!allYtpExist) return false

  // All ytc channel IDs must also already exist in ALL.json under this company
  return ytcUrls.every((url) => {
    const selector = extractRawSelector(url, "ytc")
    if (!selector) return false
    return findInDatabaseBySelector(selector, "ytc", "youtube.com", companyRows) !== null
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

/**
 * Classify each field of an override entry against the final ALL.json database.
 *
 * Returns a per-field map: `"new"` if the field's data is not in ALL.json for
 * this company, `"duplicate"` if it already exists. Fields in IGNORED_FIELDS
 * are omitted entirely.
 *
 * When a company has no rows in ALL.json, all fields are classified as "new".
 *
 * All comparisons are scoped to the company's own ALL.json rows. A selector
 * existing under a different company does NOT count as a duplicate — because
 * the merge pipeline applies overrides per-company by name match.
 *
 * LinkedIn resolver artifacts (numerical ID + resolved slug pairs) and YouTube
 * resolver artifacts (ytc + resolved ytp pairs) receive special treatment:
 * their resolved values are checked against ALL.json, and if already present,
 * the entire field is considered duplicate.
 *
 * @param name - The company name (key in manualOverrides)
 * @param value - The override entry value
 * @param db - The final ALL.json database array
 * @returns Per-field classification map
 */
export const classifyEntryFields = (
  name: string,
  value: ManualOverrideValue,
  db: FinalDBFileType[]
): FieldClassification => {
  const result: FieldClassification = {}

  // Collect override fields, excluding ones that don't affect ALL.json
  const fields = Object.entries(value).filter(([key]) => !IGNORED_FIELDS.has(key))

  // If no meaningful fields, return empty map
  if (fields.length === 0) return result

  // Find ALL rows for this company in ALL.json
  const companyRows = db.filter((row) => row.n === name)
  const companyNotFound = companyRows.length === 0

  // If company not in ALL.json, all fields are new
  if (companyNotFound) {
    for (const [key, val] of fields) {
      if (val !== undefined) result[key] = "new"
    }
    return result
  }

  // Use the first row for direct field comparisons (android, stock, etc.)
  const primaryRow = companyRows[0]
  if (!primaryRow) {
    for (const [key, val] of fields) {
      if (val !== undefined) result[key] = "new"
    }
    return result
  }

  // Prepare resolver artifact state (scoped to this company's rows)
  const liUrls = toUrlArray("li" in value ? value.li : undefined)
  const ytpUrls = toUrlArray("ytp" in value ? value.ytp : undefined)
  const ytcUrls = toUrlArray("ytc" in value ? value.ytc : undefined)

  const liIsResolverDuplicate = liUrls.length > 0 && isLinkedInResolverDuplicate(liUrls, companyRows)
  const ytIsResolverDuplicate =
    ytpUrls.length > 0 && ytcUrls.length > 0 && isYouTubeResolverDuplicate(ytpUrls, ytcUrls, companyRows)

  for (const [key, val] of fields) {
    if (val === undefined) continue

    // ── Link fields ─────────────────────────────────────────────────────
    if (isLinkField(key)) {
      const field = key

      // LinkedIn resolver artifact: skip if all resolved slugs are in ALL.json
      if (field === "li" && liIsResolverDuplicate) {
        result[key] = "duplicate"
        continue
      }

      // YouTube resolver artifacts: skip ytc and ytp together if resolved handles are in ALL.json
      if ((field === "ytp" || field === "ytc") && ytIsResolverDuplicate) {
        result[key] = "duplicate"
        continue
      }

      const urls = toUrlArray(val)
      let fieldIsNew = false
      for (const url of urls) {
        if (field === "ws") {
          const domain = extractDomain(url)
          if (findInDatabaseByDomain(domain, companyRows) === null) {
            fieldIsNew = true
            break
          }
        } else if (field !== "il") {
          const selector = extractRawSelector(url, field)
          if (!selector) {
            fieldIsNew = true
            break
          }
          const domain = FIELD_TO_DOMAIN[field]
          if (findInDatabaseBySelector(selector, field, domain, companyRows) === null) {
            fieldIsNew = true
            break
          }
        }
      }
      result[key] = fieldIsNew ? "new" : "duplicate"
      continue
    }

    // ── Android fields ──────────────────────────────────────────────────
    if (key === "android_app_ids") {
      const overrideIds = toUrlArray(val)
      const dbIds = primaryRow.android_app_ids ?? []
      const hasNew = overrideIds.some((id) => !dbIds.includes(id))
      result[key] = hasNew ? "new" : "duplicate"
      continue
    }

    if (key === "android_dev_id") {
      result[key] = typeof val === "string" && primaryRow.android_dev_id !== val ? "new" : "duplicate"
      continue
    }

    // ── Other known fields ──────────────────────────────────────────────
    if (key === "stock_symbol" || key === "stock_exchange_symbol") {
      result[key] = typeof val === "string" && primaryRow.s !== val ? "new" : "duplicate"
      continue
    }

    // Unknown field — conservative: treat as new
    result[key] = "new"
  }

  return result
}

/**
 * Classify an override entry by comparing it against the final ALL.json database.
 *
 * - `"duplicate"`: Every meaningful field's selector already exists in ALL.json
 *   **under the same company** (matched by name). Verifying this entry would
 *   produce zero changes to the final database.
 *
 * - `"new"`: At least one field contains a selector not present in ALL.json
 *   under this company. This entry needs human review.
 *
 * Delegates to `classifyEntryFields()` for per-field classification, then
 * returns the aggregate: "duplicate" if all fields are duplicate, "new" if
 * any field is new.
 *
 * @param name - The company name (key in manualOverrides)
 * @param value - The override entry value
 * @param db - The final ALL.json database array
 * @returns The classification
 */
export const classifyEntry = (
  name: string,
  value: ManualOverrideValue,
  db: FinalDBFileType[]
): EntryClassification => {
  const fieldResults = classifyEntryFields(name, value, db)
  const values = Object.values(fieldResults)
  // No meaningful fields → duplicate (meta-only or urls-only entry)
  if (values.length === 0) return "duplicate"
  // Any field is new → entire entry is new
  return values.some((v) => v === "new") ? "new" : "duplicate"
}

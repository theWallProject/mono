import {
  API_ENDPOINT_RULE_FACEBOOK,
  API_ENDPOINT_RULE_GITHUB,
  API_ENDPOINT_RULE_INSTAGRAM,
  API_ENDPOINT_RULE_LINKEDIN_COMPANY,
  API_ENDPOINT_RULE_THREADS,
  API_ENDPOINT_RULE_TIKTOK,
  API_ENDPOINT_RULE_TWITTER,
  API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
  API_ENDPOINT_RULE_YOUTUBE_PROFILE
} from "@theWallProject/common"

import { error, log, warn } from "../helper"
import { manualOverrides } from "./manual_resolve/manualOverrides"
import { manualAdditions } from "./manual_resolve/manualAdditions"

/**
 * All API endpoint rules with their corresponding link field names.
 * URLs in the `urls` field should NOT match any of these — if they do,
 * they belong in the proper link field instead (unless the extracted
 * selector is already present in the link field, making it a known duplicate).
 */
const RULES_WITH_FIELDS = [
  { field: "li", rule: API_ENDPOINT_RULE_LINKEDIN_COMPANY, flags: "i" },
  { field: "fb", rule: API_ENDPOINT_RULE_FACEBOOK, flags: undefined },
  { field: "tw", rule: API_ENDPOINT_RULE_TWITTER, flags: "i" },
  { field: "ig", rule: API_ENDPOINT_RULE_INSTAGRAM, flags: undefined },
  { field: "gh", rule: API_ENDPOINT_RULE_GITHUB, flags: undefined },
  { field: "ytp", rule: API_ENDPOINT_RULE_YOUTUBE_PROFILE, flags: "i" },
  { field: "ytc", rule: API_ENDPOINT_RULE_YOUTUBE_CHANNEL, flags: "i" },
  { field: "tt", rule: API_ENDPOINT_RULE_TIKTOK, flags: undefined },
  { field: "th", rule: API_ENDPOINT_RULE_THREADS, flags: undefined }
] as const

/** Link field names derived from the rules array */
type RuleLinkField = (typeof RULES_WITH_FIELDS)[number]["field"]

type Violation = {
  source: "manualOverrides" | "manualAdditions"
  companyName: string
  url: string
  matchedField: RuleLinkField
  extractedSelector: string
}

type Duplicate = Violation

/**
 * Tests a URL against all API endpoint regexes.
 * Returns the matched field and extracted selector if any regex matches, null otherwise.
 */
function testUrlAgainstRules(
  url: string
): { field: RuleLinkField; selector: string; flags: string | undefined } | null {
  for (const { field, rule, flags } of RULES_WITH_FIELDS) {
    const regex = new RegExp(rule.regex, flags)
    const match = regex.exec(url)
    if (match) {
      // For YouTube profile, check all capture groups
      const selector = match[1] || match[2] || match[3] || match[4] || "unknown"
      return { field, selector, flags }
    }
  }
  return null
}

/**
 * Type-safe accessor for link field values from a manual override/addition entry.
 * Uses an explicit switch over known fields to avoid dynamic string indexing.
 * Accepts any object because callers pass union types where some members lack
 * link fields entirely (e.g., { _processed: true }). The switch safely returns
 * undefined for entries that don't have the requested field.
 */
function getLinkFieldValue<T extends object>(entry: T, field: RuleLinkField): unknown {
  switch (field) {
    case "li":
      return "li" in entry ? entry.li : undefined
    case "fb":
      return "fb" in entry ? entry.fb : undefined
    case "tw":
      return "tw" in entry ? entry.tw : undefined
    case "ig":
      return "ig" in entry ? entry.ig : undefined
    case "gh":
      return "gh" in entry ? entry.gh : undefined
    case "ytp":
      return "ytp" in entry ? entry.ytp : undefined
    case "ytc":
      return "ytc" in entry ? entry.ytc : undefined
    case "tt":
      return "tt" in entry ? entry.tt : undefined
    case "th":
      return "th" in entry ? entry.th : undefined
    default: {
      const _exhaustive: never = field
      throw new Error(`Unexpected link field: ${_exhaustive}`)
    }
  }
}

/**
 * Extracts all selectors from existing link field values for a given entry.
 * For example, if `li: ["linkedin.com/company/cellebrite", "linkedin.com/company/100045"]`,
 * this returns a case-normalized set of the extracted selectors: {"cellebrite", "100045"}.
 */
function getExistingSelectors<T extends object>(
  entry: T,
  field: RuleLinkField,
  flags: string | undefined
): Set<string> {
  const selectors = new Set<string>()
  const values = getLinkFieldValue(entry, field)
  if (!values) return selectors

  const urls = Array.isArray(values) ? values : [values]
  const ruleEntry = RULES_WITH_FIELDS.find((r) => r.field === field)
  if (!ruleEntry) return selectors

  for (const url of urls) {
    if (typeof url !== "string") continue
    const regex = new RegExp(ruleEntry.rule.regex, flags)
    const match = regex.exec(url)
    if (match) {
      const selector = match[1] || match[2] || match[3] || match[4] || ""
      if (selector) {
        // Case-insensitive fields should compare case-insensitively
        selectors.add(flags?.includes("i") ? selector.toLowerCase() : selector)
      }
    }
  }
  return selectors
}

/**
 * Validates that no URL in the `urls` field of manualOverrides or manualAdditions
 * matches any API endpoint regex, unless the extracted selector already exists
 * in the proper link field (making it a known duplicate).
 *
 * - **Duplicates** (selector already in link field): Reported as warnings, kept as-is
 * - **Violations** (selector NOT in link field): Reported as errors, pipeline fails
 *
 * Runs after all pipeline steps complete (changes are already applied).
 * Fails hard if violations are found so the developer can fix and re-run.
 */
export function validateUrlsField(): Violation[] {
  const violations: Violation[] = []
  const duplicates: Duplicate[] = []

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Validating urls fields against API endpoint regexes...")

  // Check manualOverrides
  for (const [companyName, overrideValue] of Object.entries(manualOverrides)) {
    if (!overrideValue || typeof overrideValue !== "object") continue
    if (!("urls" in overrideValue) || !Array.isArray(overrideValue.urls)) continue
    const { urls } = overrideValue

    for (const url of urls) {
      if (!url || typeof url !== "string") continue
      const match = testUrlAgainstRules(url)
      if (match) {
        const existingSelectors = getExistingSelectors(overrideValue, match.field, match.flags)
        const normalizedSelector = match.flags?.includes("i") ? match.selector.toLowerCase() : match.selector
        const isDuplicate = existingSelectors.has(normalizedSelector)

        const item = {
          source: "manualOverrides" as const,
          companyName,
          url,
          matchedField: match.field,
          extractedSelector: match.selector
        }

        if (isDuplicate) {
          duplicates.push(item)
        } else {
          violations.push(item)
        }
      }
    }
  }

  // Check manualAdditions
  for (const addition of manualAdditions) {
    if (!("urls" in addition) || !Array.isArray(addition.urls)) continue
    const { urls } = addition

    for (const url of urls) {
      if (!url || typeof url !== "string") continue
      const match = testUrlAgainstRules(url)
      if (match) {
        const existingSelectors = getExistingSelectors(addition, match.field, match.flags)
        const normalizedSelector = match.flags?.includes("i") ? match.selector.toLowerCase() : match.selector
        const isDuplicate = existingSelectors.has(normalizedSelector)

        const item = {
          source: "manualAdditions" as const,
          companyName: addition.name,
          url,
          matchedField: match.field,
          extractedSelector: match.selector
        }

        if (isDuplicate) {
          duplicates.push(item)
        } else {
          violations.push(item)
        }
      }
    }
  }

  // Report duplicates (informational only)
  if (duplicates.length > 0) {
    warn(`Found ${duplicates.length} duplicate URL(s) in urls fields (selector already in link field — keeping as-is):`)
    for (const d of duplicates) {
      warn(`  ${d.source} → "${d.companyName}" — ${d.url} (${d.matchedField}: "${d.extractedSelector}")`)
    }
  }

  // Report violations (errors)
  if (violations.length === 0) {
    log("✅ All urls field entries are clean — no misplaced social/profile URLs found.")
  } else {
    error(`Found ${violations.length} misplaced URL(s) in urls fields that should be in proper link fields:`)
    error("")
    for (const v of violations) {
      error(`  ${v.source} → "${v.companyName}"`)
      error(`    URL:      ${v.url}`)
      error(`    Should be in: ${v.matchedField} field (extracted selector: "${v.extractedSelector}")`)
      error("")
    }
    error("Fix: Move these URLs from the 'urls' array to the appropriate link field (gh, li, fb, etc.),")
    error("or if the URL doesn't represent a profile/org, update the regex to exclude it.")
  }

  return violations
}

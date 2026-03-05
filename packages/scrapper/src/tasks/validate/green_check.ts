/**
 * Shared "green check" logic: determines whether all link-type fields in an
 * override entry contain the company name.
 *
 * A link is "green" when any name candidate (derived from the company name)
 * appears as a substring of the normalized URL, or vice-versa.
 *
 * Extracted from verify_overrides.ts so it can be reused by the Homepage AI
 * Extractor batch mode (and anywhere else that needs the same check).
 */

import { API_ENDPOINT_RULE_LINKEDIN_COMPANY } from "@theWallProject/common"

import type { ManualOverrideValue } from "./types"

// ────────────────────────────────────────────────────────────────────────────
// LinkedIn numerical ID detection
// ────────────────────────────────────────────────────────────────────────────

const LINKEDIN_REGEX = new RegExp(API_ENDPOINT_RULE_LINKEDIN_COMPANY.regex, "i")

/** Extract the selector (slug or ID) from a LinkedIn company URL. */
const extractLinkedInSelector = (url: string): string | null => {
  const match = LINKEDIN_REGEX.exec(url)
  return match?.[1] ?? null
}

/** True if the selector is entirely digits (a numerical ID). */
const isNumericalLinkedInSelector = (selector: string): boolean => /^\d+$/.test(selector)

/**
 * For the `li` field: if any string-slug (non-numerical) LinkedIn URL is green,
 * then all numerical-ID URLs in the same array are considered green too.
 *
 * This handles the case where a numerical ID (e.g., /company/12345) has been
 * resolved to its string slug (e.g., /company/acme-corp) and both are kept.
 * The numerical URL can never contain the company name, but since the resolved
 * slug does, we trust that the numerical ID is the same company.
 */
const liFieldAllGreen = (name: string, liUrls: string[]): boolean => {
  if (liUrls.length === 0) return true // no URLs → vacuously green

  // Check if any string-slug URL is green
  const hasGreenSlug = liUrls.some((url) => {
    const selector = extractLinkedInSelector(url)
    if (!selector) return nameAppearsInLink(name, url)
    // Only count non-numerical selectors as potential green sources
    if (isNumericalLinkedInSelector(selector)) return false
    return nameAppearsInLink(name, url)
  })

  for (const url of liUrls) {
    const selector = extractLinkedInSelector(url)
    // Numerical ID: green only if a green slug sibling exists
    if (selector && isNumericalLinkedInSelector(selector)) {
      if (!hasGreenSlug) return false
      continue // This numerical URL is "covered" by the green slug
    }
    // String slug or non-matching URL: check directly
    if (!nameAppearsInLink(name, url)) return false
  }

  return true
}

// ────────────────────────────────────────────────────────────────────────────
// Name-in-link matching
// ────────────────────────────────────────────────────────────────────────────

/** Lowercase + strip non-alphanumeric for fuzzy comparison. */
export const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "")

/**
 * Extract name candidates from a company name like "Acclym (formerly Agritask)".
 * Returns normalized tokens to check: the full name, the part before parens,
 * the part inside parens (without noise words), and individual words (≥3 chars).
 */
const NOISE_WORDS = new Set(["formerly", "now", "part", "of", "acquired", "aquired", "by"])

export const extractNameCandidates = (companyName: string): string[] => {
  const candidates: string[] = []

  // Full name normalized
  const full = normalize(companyName)
  if (full.length > 0) candidates.push(full)

  // Part before parenthetical: "Acclym (formerly Agritask)" → "Acclym"
  const parenIdx = companyName.indexOf("(")
  if (parenIdx > 0) {
    const before = normalize(companyName.slice(0, parenIdx))
    if (before.length >= 3) candidates.push(before)

    // Words inside parenthetical, minus noise
    const inside = companyName.slice(parenIdx + 1).replace(/\).*$/, "")
    for (const word of inside.split(/\s+/)) {
      const nw = normalize(word)
      if (nw.length >= 3 && !NOISE_WORDS.has(nw)) {
        candidates.push(nw)
      }
    }
  }

  // Individual words from the full name (≥3 chars, minus noise)
  for (const word of companyName.split(/[\s\-_/]+/)) {
    const nw = normalize(word)
    if (nw.length >= 3 && !NOISE_WORDS.has(nw)) {
      candidates.push(nw)
    }
  }

  // Deduplicate
  return [...new Set(candidates)]
}

/**
 * True when any name candidate appears inside the link, OR the link
 * appears inside a candidate (handles link slugs shorter than the full name).
 */
export const nameAppearsInLink = (companyName: string, linkValue: string): boolean => {
  const link = normalize(linkValue)
  if (link.length === 0) return false
  return extractNameCandidates(companyName).some((c) => link.includes(c) || c.includes(link))
}

/** Fields that are not checked for "all green" (non-link or dimmed). */
const NON_LINK_FIELDS = new Set(["_meta", "urls", "alt"])

/**
 * Returns true when every link-type field value contains the company name.
 * Fields in NON_LINK_FIELDS are excluded. android_app_ids are checked as
 * Play Store display URLs. ytc inherits green from ytp (same as render logic).
 */
export const allLinksGreen = (name: string, value: ManualOverrideValue): boolean => {
  // Check if any ytp URL matches — ytc inherits green from ytp
  const ytpGreen = (() => {
    const ytp = "ytp" in value ? value.ytp : undefined
    if (!ytp) return false
    const urls = Array.isArray(ytp) ? ytp : [ytp]
    return urls.some((u) => typeof u === "string" && nameAppearsInLink(name, u))
  })()

  let hasLinks = false

  for (const [key, val] of Object.entries(value)) {
    if (NON_LINK_FIELDS.has(key) || val === undefined) continue

    // ytc inherits green from ytp
    if (key === "ytc" && ytpGreen) continue

    // li: special handling for numerical LinkedIn IDs
    if (key === "li" && Array.isArray(val)) {
      const liUrls = val.filter((v): v is string => typeof v === "string")
      if (liUrls.length > 0) {
        hasLinks = true
        if (!liFieldAllGreen(name, liUrls)) return false
      }
      continue
    }

    if (key === "android_app_ids" && Array.isArray(val)) {
      for (const pkg of val) {
        hasLinks = true
        const displayUrl = `https://play.google.com/store/apps/details?id=${String(pkg)}`
        if (!nameAppearsInLink(name, displayUrl)) return false
      }
      continue
    }

    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "string") {
          hasLinks = true
          if (!nameAppearsInLink(name, item)) return false
        }
      }
    } else if (typeof val === "string") {
      hasLinks = true
      if (!nameAppearsInLink(name, val)) return false
    }
  }

  return hasLinks
}

/**
 * Returns a human-readable description of which fields are NOT green.
 * Used for retry list error messages so users know exactly what to review.
 */
export const describeNonGreenFields = (name: string, value: ManualOverrideValue): string => {
  const nonGreen: string[] = []

  // Check if any ytp URL matches — ytc inherits green from ytp
  const ytpGreen = (() => {
    const ytp = "ytp" in value ? value.ytp : undefined
    if (!ytp) return false
    const urls = Array.isArray(ytp) ? ytp : [ytp]
    return urls.some((u) => typeof u === "string" && nameAppearsInLink(name, u))
  })()

  for (const [key, val] of Object.entries(value)) {
    if (NON_LINK_FIELDS.has(key) || val === undefined) continue
    if (key === "ytc" && ytpGreen) continue

    // li: special handling for numerical LinkedIn IDs
    if (key === "li" && Array.isArray(val)) {
      const liUrls = val.filter((v): v is string => typeof v === "string")
      if (liUrls.length > 0 && !liFieldAllGreen(name, liUrls)) {
        // Report only the URLs that are genuinely non-green (excluding numerical IDs
        // that are covered by a green slug sibling)
        const hasGreenSlug = liUrls.some((url) => {
          const selector = extractLinkedInSelector(url)
          return selector !== null && !isNumericalLinkedInSelector(selector) && nameAppearsInLink(name, url)
        })
        const bad = liUrls.filter((url) => {
          const selector = extractLinkedInSelector(url)
          // Numerical IDs are only bad if there's no green slug sibling
          if (selector && isNumericalLinkedInSelector(selector)) return !hasGreenSlug
          return !nameAppearsInLink(name, url)
        })
        if (bad.length > 0) {
          nonGreen.push(`${key}=[${bad.join(", ")}]`)
        }
      }
      continue
    }

    if (key === "android_app_ids" && Array.isArray(val)) {
      for (const pkg of val) {
        const displayUrl = `https://play.google.com/store/apps/details?id=${String(pkg)}`
        if (!nameAppearsInLink(name, displayUrl)) {
          nonGreen.push(`${key}=[${displayUrl}]`)
        }
      }
      continue
    }

    if (Array.isArray(val)) {
      const bad = val.filter((item) => typeof item === "string" && !nameAppearsInLink(name, item))
      if (bad.length > 0) {
        nonGreen.push(`${key}=[${bad.join(", ")}]`)
      }
    } else if (typeof val === "string") {
      if (!nameAppearsInLink(name, val)) {
        nonGreen.push(`${key}=[${val}]`)
      }
    }
  }

  return nonGreen.length > 0 ? `Non-green links: ${nonGreen.join(", ")}` : "No link fields found"
}

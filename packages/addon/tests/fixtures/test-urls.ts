import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import type { FinalDBFileType } from "@theWallProject/common"
import { findInDatabaseByDomain, findInDatabaseBySelector, getMainDomain, getSelectorKey } from "@theWallProject/common"

import { findMatchingRule } from "../../src/rules"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load database
const dbPath = path.resolve(__dirname, "../../src/db/ALL.json")
const database: FinalDBFileType[] = JSON.parse(readFileSync(dbPath, "utf-8"))

/**
 * URL categorization for test coverage
 */
export interface CategorizedUrl {
  url: string
  ruleType: "urlOnly" | "urlDomFull" | "urlDomInline"
  reasons: string[]
  isHint: boolean
  domain: string
  hasSocialMedia: boolean
}

/**
 * Extract all results from database entry
 * Extracts all fields (ws, fb, li, tw, ig, gh, ytp, ytc, tt, th) that exist in the entry
 */
async function extractResults(entry: FinalDBFileType): Promise<CategorizedUrl[]> {
  const results: CategorizedUrl[] = []
  const isHint = !!(entry.isHint && entry.hintText)

  // Extract website URL
  if (entry.ws) {
    const url = `https://${entry.ws}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"

    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: getMainDomain(url),
      hasSocialMedia: false
    })
  }

  // Extract social media URLs from database fields
  if (entry.fb) {
    const url = `https://www.facebook.com/${entry.fb}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "facebook.com",
      hasSocialMedia: true
    })
  }

  if (entry.li) {
    const url = `https://www.linkedin.com/company/${entry.li}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "linkedin.com",
      hasSocialMedia: true
    })
  }

  if (entry.tw) {
    const url = `https://www.twitter.com/${entry.tw}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "twitter.com",
      hasSocialMedia: true
    })
  }

  if (entry.ig) {
    const url = `https://www.instagram.com/${entry.ig}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "instagram.com",
      hasSocialMedia: true
    })
  }

  if (entry.gh) {
    const url = `https://www.github.com/${entry.gh}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "github.com",
      hasSocialMedia: true
    })
  }

  if (entry.ytp) {
    const url = `https://www.youtube.com/@${entry.ytp}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "youtube.com",
      hasSocialMedia: true
    })
  }

  if (entry.ytc) {
    const url = `https://www.youtube.com/@${entry.ytc}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "youtube.com",
      hasSocialMedia: true
    })
  }

  if (entry.tt) {
    const url = `https://www.tiktok.com/@${entry.tt}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "tiktok.com",
      hasSocialMedia: true
    })
  }

  if (entry.th) {
    const url = `https://www.threads.net/@${entry.th}`
    const rule = await findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"
    results.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: "threads.net",
      hasSocialMedia: true
    })
  }

  return results
}

/**
 * Get a random result from the database using filters
 * Returns the exact same result for the same filters (deterministic)
 */
export async function getRandomResult(options?: {
  ruleType?: "urlOnly" | "urlDomFull" | "urlDomInline"
  isHint?: boolean
  hasSocialMedia?: boolean
  reason?: string
  excludeLoginRequired?: boolean
}): Promise<CategorizedUrl> {
  const { ruleType, isHint, hasSocialMedia, reason, excludeLoginRequired = false } = options || {}

  // Filter database entries directly
  const filtered: CategorizedUrl[] = []

  for (const entry of database) {
    const results = await extractResults(entry)

    for (const result of results) {
      // Exclude LinkedIn URLs if excludeLoginRequired is true (but keep other URLs from same entry)
      if (excludeLoginRequired && result.domain === "linkedin.com") {
        continue
      }

      // Apply filters
      if (ruleType && result.ruleType !== ruleType) {
        continue
      }
      if (isHint !== undefined && result.isHint !== isHint) {
        continue
      }
      if (hasSocialMedia !== undefined && result.hasSocialMedia !== hasSocialMedia) {
        continue
      }
      if (reason && !result.reasons.includes(reason)) {
        continue
      }

      // ALWAYS exclude bad links (URLs that fail to navigate) - applies to hints and all other URLs
      const badLinks = getBadLinks()
      const normalizedUrl = normalizeUrl(result.url)
      if (badLinks.has(normalizedUrl)) {
        continue
      }

      filtered.push(result)
    }
  }

  // Sort by URL for deterministic selection, then pick based on a consistent index
  // Using a simple hash of filter options to determine which result to pick
  const sorted = filtered.sort((a, b) => a.url.localeCompare(b.url))
  const filterHash = JSON.stringify(options || {})
  let hash = 0
  for (let i = 0; i < filterHash.length; i++) {
    const char = filterHash.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % sorted.length
  return sorted[index]!
}

/**
 * Get random URLs by category
 * Returns deterministic results (same filters = same results)
 */
export async function getRandomUrls(options: {
  count?: number
  ruleType?: "urlOnly" | "urlDomFull" | "urlDomInline"
  isHint?: boolean
  hasSocialMedia?: boolean
  reason?: string
  excludeLoginRequired?: boolean
}): Promise<CategorizedUrl[]> {
  const { count = 1, ruleType, isHint, hasSocialMedia, reason, excludeLoginRequired = false } = options

  // Filter database entries directly (same logic as getRandomResult)
  const filtered: CategorizedUrl[] = []

  for (const entry of database) {
    const results = await extractResults(entry)

    for (const result of results) {
      // Exclude LinkedIn URLs if excludeLoginRequired is true (but keep other URLs from same entry)
      if (excludeLoginRequired && result.domain === "linkedin.com") {
        continue
      }

      // Apply filters
      if (ruleType && result.ruleType !== ruleType) {
        continue
      }
      if (isHint !== undefined && result.isHint !== isHint) {
        continue
      }
      if (hasSocialMedia !== undefined && result.hasSocialMedia !== hasSocialMedia) {
        continue
      }
      if (reason && !result.reasons.includes(reason)) {
        continue
      }

      // ALWAYS exclude bad links (URLs that fail to navigate) - applies to hints and all other URLs
      const badLinks = getBadLinks()
      const normalizedUrl = normalizeUrl(result.url)
      if (badLinks.has(normalizedUrl)) {
        continue
      }

      filtered.push(result)
    }
  }

  // Sort by URL for deterministic selection
  const sorted = filtered.sort((a, b) => a.url.localeCompare(b.url))
  const result = sorted.slice(0, Math.min(count, sorted.length))

  // Fail fast if we don't have enough URLs
  if (result.length < count) {
    const filters = Object.entries({ ruleType, isHint, hasSocialMedia, reason, excludeLoginRequired })
      .filter(([, value]) => value !== undefined && value !== false)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ")
    throw new Error(`Not enough URLs found: requested ${count}, found ${result.length}. Filters: ${filters || "none"}`)
  }

  return result
}

/**
 * Get a random URL with specific conditions for testing
 * Ensures the URL matches the expected behavior for the rule type
 * Excludes LinkedIn URLs (requires login)
 */
export async function getTestUrlWithConditions(options: {
  ruleType: "urlOnly" | "urlDomFull" | "urlDomInline"
  expectBanner?: boolean
  expectHint?: boolean
}): Promise<CategorizedUrl> {
  const { ruleType, expectBanner, expectHint } = options

  let url: CategorizedUrl

  // urlOnly rules should ALWAYS show banners, never hints
  if (ruleType === "urlOnly") {
    url = await getRandomResult({
      ruleType: "urlOnly",
      isHint: false, // urlOnly rules are never hints
      excludeLoginRequired: true // Exclude LinkedIn URLs (requires login)
    })
  } else if (expectBanner !== undefined || expectHint !== undefined) {
    // urlDomFull and urlDomInline can be either banners or hints
    const isHint = expectHint === true
    url = await getRandomResult({
      ruleType,
      isHint,
      excludeLoginRequired: true
    })
  } else {
    // No specific expectation, return any URL of this rule type
    url = await getRandomResult({
      ruleType,
      excludeLoginRequired: true
    })
  }

  console.log(
    `[TEST] Selected URL: ${url.url} (ruleType: ${url.ruleType}, isHint: ${url.isHint}, reasons: ${url.reasons.join(",")})`
  )

  return url
}

/**
 * Normalize URL for comparison (remove www, trailing slash, etc.)
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove www prefix from hostname
    let hostname = urlObj.hostname
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4)
    }
    // Reconstruct URL without www and trailing slash
    return `${urlObj.protocol}//${hostname}${urlObj.pathname.replace(/\/$/, "")}${urlObj.search}${urlObj.hash}`
  } catch {
    // If URL parsing fails, return original
    return url
  }
}

/**
 * Get bad links (URLs that fail to navigate) from badlinks.json
 * These URLs are excluded from all test URL selection, including hints
 * URLs are normalized (www removed) for comparison
 */
function getBadLinks(): Set<string> {
  try {
    const badLinksPath = path.resolve(__dirname, "badlinks.json")
    const badLinks: string[] = JSON.parse(readFileSync(badLinksPath, "utf-8"))
    // Normalize all bad links for comparison
    return new Set(badLinks.map(normalizeUrl))
  } catch {
    return new Set()
  }
}

/**
 * Add a URL to bad links file
 * FAILS HARD if file cannot be written
 * URL is normalized before adding
 */
export function addBadLink(url: string): void {
  console.log(`[TEST] Adding bad link: ${url}`)
  const badLinksPath = path.resolve(__dirname, "badlinks.json")
  const normalizedUrl = normalizeUrl(url)
  const badLinks = getBadLinks()

  // Don't add duplicates (check normalized)
  if (badLinks.has(normalizedUrl)) {
    console.log(`[TEST] URL already in bad links: ${normalizedUrl}`)
    return
  }

  // Add normalized URL to set and write back
  badLinks.add(normalizedUrl)
  const badLinksArray = Array.from(badLinks).sort()

  try {
    writeFileSync(badLinksPath, JSON.stringify(badLinksArray, null, 2) + "\n", "utf-8")
    console.log(`[TEST] Successfully added bad link: ${normalizedUrl}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to write bad links file: ${errorMessage}`)
  }
}

/**
 * Get hint name (database entry name) for a URL
 * This is used as the hint ID for storage tracking
 * Uses the same lookup logic as storage.ts
 */
export async function getHintNameForUrl(url: string): Promise<string | null> {
  const domain = getMainDomain(url)

  // Handle .il domains separately
  if (domain.endsWith(".il")) {
    return domain // For .il domains, the domain itself is used
  }

  // Use shared pure functions for rule matching (same logic as storage.ts)
  const rule = await findMatchingRule(url)

  if (rule && rule.type !== "urlOnly") {
    // For urlDomFull and urlDomInline rules, we need to extract selector differently
    // The addon's Rule type doesn't have domain, so we extract from URL pattern
    // Extract selector from URL using the rule's urlPattern
    const urlMatch = url.match(rule.urlPattern)
    if (!urlMatch || urlMatch.length < 2) {
      // Fall back to domain lookup
      const findResult = findInDatabaseByDomain(domain, database)
      if (findResult && findResult.isHint && findResult.hintText) {
        return findResult.n
      }
      return null
    }

    // Get selector from regex match (first capture group)
    const selector = urlMatch[1] || null
    if (!selector) {
      // Fall back to domain lookup
      const findResult = findInDatabaseByDomain(domain, database)
      if (findResult && findResult.isHint && findResult.hintText) {
        return findResult.n
      }
      return null
    }

    // Determine selectorKey from domain
    // Map domain to selectorKey (same logic as getSelectorKey but we need to handle it here)
    let selectorKey: string
    if (domain === "youtube.com") {
      // YouTube needs URL to determine ytp vs ytc
      selectorKey = url.includes("/channel/") ? "ytc" : "ytp"
    } else if (domain === "linkedin.com") {
      selectorKey = "li"
    } else if (domain === "facebook.com") {
      selectorKey = "fb"
    } else if (domain === "twitter.com" || domain === "x.com") {
      selectorKey = "tw"
    } else if (domain === "instagram.com") {
      selectorKey = "ig"
    } else if (domain === "github.com") {
      selectorKey = "gh"
    } else if (domain === "tiktok.com") {
      selectorKey = "tt"
    } else if (domain === "threads.com") {
      selectorKey = "th"
    } else {
      // Unknown domain, fall back to domain lookup
      const findResult = findInDatabaseByDomain(domain, database)
      if (findResult && findResult.isHint && findResult.hintText) {
        return findResult.n
      }
      return null
    }

    // "il" is not a database field, skip database lookup
    if (selectorKey === "il") {
      return null
    }

    // Use shared pure function for database lookup
    // We need to cast domain to SpecialDomains for the function call
    const specialDomain = domain as Parameters<typeof getSelectorKey>[0]
    const findResult = findInDatabaseBySelector(
      selector,
      selectorKey as Parameters<typeof findInDatabaseBySelector>[1],
      specialDomain,
      database
    )

    if (findResult && findResult.isHint && findResult.hintText) {
      return findResult.n // Return the name field which is used as hint ID
    }
  }

  // For urlOnly rules or no matching rule, check by domain (website lookup)
  const findResult = findInDatabaseByDomain(domain, database)

  if (findResult && findResult.isHint && findResult.hintText) {
    return findResult.n // Return the name field which is used as hint ID
  }

  return null
}

/**
 * Get a URL that HAS alternatives in the database
 * EXPLICIT: Returns a URL that will show the alternatives button
 * FAILS HARD if no such URL exists
 */
export async function getUrlWithAlternatives(options?: { excludeLoginRequired?: boolean }): Promise<CategorizedUrl> {
  const { excludeLoginRequired = false } = options || {}

  // Find entries in database that have alternatives
  const entriesWithAlternatives = database.filter(
    (entry) => entry.alt && Array.isArray(entry.alt) && entry.alt.length > 0 && !entry.isHint
  )

  if (entriesWithAlternatives.length === 0) {
    throw new Error("No entries with alternatives found in database. Cannot test alternatives button.")
  }

  // Get URLs from entries with alternatives
  const allUrlsWithAlternatives: CategorizedUrl[] = []
  for (const entry of entriesWithAlternatives) {
    allUrlsWithAlternatives.push(...(await extractResults(entry)))
  }

  // Filter based on options
  let filtered = allUrlsWithAlternatives.filter((url) => !url.isHint)

  if (excludeLoginRequired) {
    filtered = filtered.filter((u) => !u.url.includes("linkedin.com"))
  }

  // ALWAYS exclude bad links (URLs that fail to navigate)
  const badLinks = getBadLinks()
  filtered = filtered.filter((u) => {
    const normalizedUrl = normalizeUrl(u.url)
    return !badLinks.has(normalizedUrl)
  })

  if (filtered.length === 0) {
    throw new Error(`No URLs with alternatives found matching criteria. excludeLoginRequired=${excludeLoginRequired}`)
  }

  // Return random one
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled[0]!
}

/**
 * Get a URL that DOES NOT have alternatives in the database
 * EXPLICIT: Returns a URL that will show the Support Palestine button
 * FAILS HARD if no such URL exists
 */
export async function getUrlWithoutAlternatives(options?: { excludeLoginRequired?: boolean }): Promise<CategorizedUrl> {
  const { excludeLoginRequired = false } = options || {}

  // Find entries in database that DON'T have alternatives
  const entriesWithoutAlternatives = database.filter(
    (entry) => (!entry.alt || !Array.isArray(entry.alt) || entry.alt.length === 0) && !entry.isHint
  )

  if (entriesWithoutAlternatives.length === 0) {
    throw new Error("No entries without alternatives found in database. Cannot test Support Palestine button.")
  }

  // Get URLs from entries without alternatives
  const allUrlsWithoutAlternatives: CategorizedUrl[] = []
  for (const entry of entriesWithoutAlternatives) {
    allUrlsWithoutAlternatives.push(...(await extractResults(entry)))
  }

  // Filter based on options
  let filtered = allUrlsWithoutAlternatives.filter((url) => !url.isHint)

  if (excludeLoginRequired) {
    filtered = filtered.filter((u) => !u.url.includes("linkedin.com"))
  }

  // ALWAYS exclude bad links (URLs that fail to navigate)
  const badLinks = getBadLinks()
  filtered = filtered.filter((u) => {
    const normalizedUrl = normalizeUrl(u.url)
    return !badLinks.has(normalizedUrl)
  })

  if (filtered.length === 0) {
    throw new Error(
      `No URLs without alternatives found matching criteria. excludeLoginRequired=${excludeLoginRequired}`
    )
  }

  // Return random one
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled[0]!
}

/**
 * Clean URLs for negative tests (not in database)
 */
export const CLEAN_URLS = [
  "https://example.com",
  "https://www.google.com",
  "https://github.com",
  "https://stackoverflow.com"
]

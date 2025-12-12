import { readFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import type { FinalDBFileType } from "@theWallProject/common"
import { getMainDomain } from "@theWallProject/common"

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
 * Categorize a URL from database entry
 * IMPORTANT: isHint is determined by entry.isHint && entry.hintText (same logic as formatResult in common package)
 * NOT by reason "h" in the reasons array
 */
function categorizeUrl(entry: FinalDBFileType): CategorizedUrl[] {
  const urls: CategorizedUrl[] = []

  // Determine if this entry is a hint (same logic as formatResult in common package)
  const isHint = !!(entry.isHint && entry.hintText)

  // Website URL
  if (entry.ws) {
    const url = `https://${entry.ws}`
    const rule = findMatchingRule(url)
    const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
      ? rule.type === "urlDomFull"
        ? "urlDomFull"
        : "urlDomInline"
      : "urlOnly"

    urls.push({
      url,
      ruleType,
      reasons: entry.r,
      isHint,
      domain: getMainDomain(url),
      hasSocialMedia: false
    })
  }

  // Social media URLs
  const socialMediaFields: Array<keyof FinalDBFileType> = ["fb", "li", "tw", "ig", "gh", "ytp", "ytc"]
  for (const field of socialMediaFields) {
    const value = entry[field]
    if (typeof value === "string" && value) {
      let url = ""
      let domain = ""

      switch (field) {
        case "fb":
          url = `https://www.facebook.com/${value}`
          domain = "facebook.com"
          break
        case "li":
          url = `https://www.linkedin.com/company/${value}`
          domain = "linkedin.com"
          break
        case "tw":
          url = `https://www.twitter.com/${value}`
          domain = "twitter.com"
          break
        case "ig":
          url = `https://www.instagram.com/${value}`
          domain = "instagram.com"
          break
        case "gh":
          url = `https://www.github.com/${value}`
          domain = "github.com"
          break
        case "ytp":
        case "ytc":
          url = `https://www.youtube.com/@${value}`
          domain = "youtube.com"
          break
      }

      if (url) {
        const rule = findMatchingRule(url)
        const ruleType: "urlOnly" | "urlDomFull" | "urlDomInline" = rule
          ? rule.type === "urlDomFull"
            ? "urlDomFull"
            : "urlDomInline"
          : "urlOnly"

        urls.push({
          url,
          ruleType,
          reasons: entry.r,
          isHint,
          domain,
          hasSocialMedia: true
        })
      }
    }
  }

  return urls
}

/**
 * All categorized URLs
 */
let categorizedUrls: CategorizedUrl[] | null = null

function getCategorizedUrls(): CategorizedUrl[] {
  if (!categorizedUrls) {
    categorizedUrls = []
    for (const entry of database) {
      categorizedUrls.push(...categorizeUrl(entry))
    }
  }
  return categorizedUrls
}

/**
 * Get random URLs by category
 * Uses getRandomUrl internally when count > 1 to ensure consistency
 */
export function getRandomUrls(options: {
  count?: number
  ruleType?: "urlOnly" | "urlDomFull" | "urlDomInline"
  isHint?: boolean
  hasSocialMedia?: boolean
  reason?: string
  excludeTested?: boolean
  excludeLoginRequired?: boolean
}): CategorizedUrl[] {
  const {
    count = 1,
    ruleType,
    isHint,
    hasSocialMedia,
    reason,
    excludeTested = false,
    excludeLoginRequired = false
  } = options

  // For single URL, use getRandomUrl which guarantees a result
  if (count === 1) {
    return [getRandomUrl({ ruleType, isHint, hasSocialMedia, reason, excludeTested, excludeLoginRequired })]
  }

  // For multiple URLs, use the original logic but ensure we have enough
  let filtered = getCategorizedUrls()

  // Apply filters
  if (ruleType) {
    filtered = filtered.filter((u) => u.ruleType === ruleType)
  }
  if (isHint !== undefined) {
    filtered = filtered.filter((u) => u.isHint === isHint)
  }
  if (hasSocialMedia !== undefined) {
    filtered = filtered.filter((u) => u.hasSocialMedia === hasSocialMedia)
  }
  if (reason) {
    filtered = filtered.filter((u) => u.reasons.includes(reason))
  }

  // Exclude URLs that require login (LinkedIn, Facebook, etc.)
  if (excludeLoginRequired) {
    const loginRequiredDomains = ["linkedin.com", "facebook.com", "twitter.com", "instagram.com"]
    filtered = filtered.filter((u) => !loginRequiredDomains.some((domain) => u.url.includes(domain)))
  }

  // Exclude tested URLs if requested
  if (excludeTested) {
    const testedUrls = getTestedUrls()
    filtered = filtered.filter((u) => !testedUrls.has(u.url))
  }

  // Shuffle and take count
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  const result = shuffled.slice(0, Math.min(count, shuffled.length))

  // Fail fast if we don't have enough URLs
  if (result.length < count) {
    const filters = Object.entries({ ruleType, isHint, hasSocialMedia, reason, excludeTested, excludeLoginRequired })
      .filter(([, value]) => value !== undefined && value !== false)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ")
    throw new Error(`Not enough URLs found: requested ${count}, found ${result.length}. Filters: ${filters || "none"}`)
  }

  return result
}

/**
 * Get a single random URL
 * Throws an error if no URL matches the criteria (fail fast)
 */
export function getRandomUrl(options?: {
  ruleType?: "urlOnly" | "urlDomFull" | "urlDomInline"
  isHint?: boolean
  hasSocialMedia?: boolean
  reason?: string
  excludeTested?: boolean
  excludeLoginRequired?: boolean
}): CategorizedUrl {
  const urls = getRandomUrls({ ...options, count: 1 })
  if (urls.length === 0) {
    const filterEntries: string[] = []
    if (options) {
      for (const [key, value] of Object.entries(options)) {
        // Only include defined values in filter string
        if (typeof value !== "undefined") {
          filterEntries.push(`${key}=${value}`)
        }
      }
    }
    const filters = filterEntries.length > 0 ? filterEntries.join(", ") : "none"
    throw new Error(`No URLs found matching criteria: ${filters}`)
  }
  // TypeScript doesn't narrow array access, but we've checked length > 0
  return urls[0]!
}

/**
 * Get a random URL with specific conditions for testing
 * Ensures the URL matches the expected behavior for the rule type
 * Excludes URLs that require login (LinkedIn, Facebook, etc.)
 */
export function getTestUrlWithConditions(options: {
  ruleType: "urlOnly" | "urlDomFull" | "urlDomInline"
  expectBanner?: boolean
  expectHint?: boolean
  excludeTested?: boolean
}): CategorizedUrl {
  const { ruleType, expectBanner, expectHint, excludeTested = false } = options

  let url: CategorizedUrl

  // urlOnly rules should ALWAYS show banners, never hints
  if (ruleType === "urlOnly") {
    url = getRandomUrl({
      ruleType: "urlOnly",
      isHint: false, // urlOnly rules are never hints
      excludeTested,
      excludeLoginRequired: true // Exclude social media URLs that require login
    })
  } else if (expectBanner !== undefined || expectHint !== undefined) {
    // urlDomFull and urlDomInline can be either banners or hints
    const isHint = expectHint === true
    url = getRandomUrl({
      ruleType,
      isHint,
      excludeTested,
      excludeLoginRequired: true
    })
  } else {
    // No specific expectation, return any URL of this rule type
    url = getRandomUrl({
      ruleType,
      excludeTested,
      excludeLoginRequired: true
    })
  }

  console.log(
    `[TEST] Selected URL: ${url.url} (ruleType: ${url.ruleType}, isHint: ${url.isHint}, reasons: ${url.reasons.join(",")})`
  )

  return url
}

/**
 * Get URLs covering all unique cases
 */
export function getUrlsForCoverage(): {
  urlOnly: CategorizedUrl[]
  urlDomFull: CategorizedUrl[]
  urlDomInline: CategorizedUrl[]
  hints: CategorizedUrl[]
  banners: CategorizedUrl[]
  socialMedia: CategorizedUrl[]
  regularWebsites: CategorizedUrl[]
  reasons: Record<string, CategorizedUrl[]>
} {
  const all = getCategorizedUrls()

  return {
    urlOnly: all.filter((u) => u.ruleType === "urlOnly").slice(0, 10),
    urlDomFull: all.filter((u) => u.ruleType === "urlDomFull").slice(0, 10),
    urlDomInline: all.filter((u) => u.ruleType === "urlDomInline").slice(0, 10),
    hints: all.filter((u) => u.isHint).slice(0, 10),
    banners: all.filter((u) => !u.isHint).slice(0, 10),
    socialMedia: all.filter((u) => u.hasSocialMedia).slice(0, 10),
    regularWebsites: all.filter((u) => !u.hasSocialMedia).slice(0, 10),
    reasons: {
      f: all.filter((u) => u.reasons.includes("f")).slice(0, 5),
      i: all.filter((u) => u.reasons.includes("i")).slice(0, 5),
      h: all.filter((u) => u.reasons.includes("h")).slice(0, 5),
      b: all.filter((u) => u.reasons.includes("b")).slice(0, 5),
      u: all.filter((u) => u.reasons.includes("u")).slice(0, 5)
    }
  }
}

/**
 * Get tested URLs from coverage tracking
 */
function getTestedUrls(): Set<string> {
  try {
    const coveragePath = path.resolve(__dirname, "coverage-data.json")
    const coverage = JSON.parse(readFileSync(coveragePath, "utf-8"))
    return new Set(coverage.testedUrls || [])
  } catch {
    return new Set()
  }
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

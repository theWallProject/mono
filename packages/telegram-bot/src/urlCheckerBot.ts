/**
 * Bot-specific URL checking wrapper.
 * Loads database and provides checkUrlForBot function.
 * Fails fast if database is missing or empty.
 */

import { createRequire } from "node:module"
import {
  extractSelector,
  findHintByDomain,
  findInDatabaseByDomain,
  findInDatabaseBySelector,
  findMatchingRule,
  formatDomainHint,
  formatResult,
  getMainDomain,
  getSelectorKey,
  type DomainHint,
  type FinalDBFileType,
  type UrlCheckResult
} from "@theWallProject/common"
import type { Context } from "telegraf"

import { getT, getTByLanguage, type TFunction } from "./translations.js"

// Re-export DomainHint for use by formattersBot
export type { DomainHint }

/**
 * Extended result type that includes optional domain hint.
 */
export type UrlCheckResultWithDomainHint = (UrlCheckResult & { domainHint?: DomainHint }) | undefined

const require = createRequire(import.meta.url)
// Use CommonJS-style require to load JSON without import assertions (works in Node 20 ESM)

const ALL = require("../db/ALL.json")

// Validate database at module level - fail immediately if invalid
if (!Array.isArray(ALL)) {
  throw new Error("Database file is not an array")
}

if (ALL.length === 0) {
  throw new Error("Database is empty")
}

// Type guard to ensure all items match FinalDBFileType
const typedDatabase: FinalDBFileType[] = ALL.filter((item): item is FinalDBFileType => {
  return typeof item === "object" && item !== null && "id" in item && "n" in item && "r" in item
})

/**
 * Find a domain hint for the given domain and return it formatted as DomainHint.
 * Used to show platform hints when viewing flagged companies on hint-enabled domains.
 */
function getDomainHintForUrl(domain: string): DomainHint | undefined {
  return formatDomainHint(findHintByDomain(domain, typedDatabase))
}

/**
 * Creates an .il domain hint result (platform-specific, not shared).
 * Each package can customize the hint text (e.g., with i18n).
 */
function createIlHint(domain: string, t: TFunction): UrlCheckResult {
  return {
    isHint: true,
    name: t("hint.israeliWebsiteName"),
    hintText: t("hint.israeliWebsite"),
    hintUrl: "https://the-wall.win",
    rule: {
      selector: domain,
      key: "il"
    }
  }
}

/**
 * Core URL checking logic (platform-agnostic).
 * Checks if a URL is flagged in the database.
 * Uses pure functions from common package.
 * Also checks for domain hints to show platform alternatives.
 * @param url - The URL to check
 * @param database - The database array to search
 * @param t - Translation function
 * @returns UrlCheckResultWithDomainHint or undefined if URL is safe
 */
function checkUrl(url: string, database: FinalDBFileType[], t: TFunction): UrlCheckResultWithDomainHint {
  if (!url || typeof url !== "string") {
    throw new Error(`Invalid URL: ${url}`)
  }

  const domain = getMainDomain(url)

  // Handle .il domains separately (platform-specific concern)
  if (domain.endsWith(".il")) {
    return createIlHint(domain, t)
  }

  // Use shared pure functions for rule matching
  const rule = findMatchingRule(url)

  if (rule) {
    const selector = extractSelector(url, rule)
    if (!selector) {
      // No flagged company, but check for standalone domain hint
      const domainHint = getDomainHintForUrl(domain)
      if (domainHint) {
        return {
          isHint: true,
          name: domainHint.name,
          hintText: domainHint.hintText,
          hintUrl: domainHint.hintUrl,
          hintCompanyId: domainHint.hintCompanyId,
          rule: { selector: domain, key: "ws" }
        }
      }
      return undefined
    }

    const selectorKey = getSelectorKey(rule.domain, url)
    const findResult = findInDatabaseBySelector(selector, selectorKey, rule.domain, database)

    if (findResult) {
      const result = formatResult(findResult, selector, selectorKey)
      // Check for domain hint to include with flagged result
      if (result && !result.isHint) {
        const domainHint = getDomainHintForUrl(domain)
        if (domainHint) {
          return { ...result, domainHint }
        }
      }
      return result
    }

    // No flagged company found, but check for standalone domain hint
    const domainHint = getDomainHintForUrl(domain)
    if (domainHint) {
      return {
        isHint: true,
        name: domainHint.name,
        hintText: domainHint.hintText,
        hintUrl: domainHint.hintUrl,
        hintCompanyId: domainHint.hintCompanyId,
        rule: { selector: domain, key: "ws" }
      }
    }
    return undefined
  } else {
    // No matching rule, check by domain (website lookup)
    const findResult = findInDatabaseByDomain(domain, database)
    if (findResult) {
      const result = formatResult(findResult, domain, "ws")
      // Check for domain hint to include with flagged result
      if (result && !result.isHint) {
        const domainHint = getDomainHintForUrl(domain)
        if (domainHint) {
          return { ...result, domainHint }
        }
      }
      return result
    }

    // No flagged company, but check for standalone domain hint
    const domainHint = getDomainHintForUrl(domain)
    if (domainHint) {
      return {
        isHint: true,
        name: domainHint.name,
        hintText: domainHint.hintText,
        hintUrl: domainHint.hintUrl,
        hintCompanyId: domainHint.hintCompanyId,
        rule: { selector: domain, key: "ws" }
      }
    }
  }

  return undefined
}

/**
 * Checks a URL against the bot's database.
 * @param url - URL to check
 * @param ctx - Telegram context (optional, defaults to English if not provided)
 * @returns UrlCheckResultWithDomainHint or undefined if safe
 * @throws Error if URL is invalid
 */
export function checkUrlForBot(url: string, ctx?: Context): UrlCheckResultWithDomainHint {
  if (!url || typeof url !== "string") {
    throw new Error(`Invalid URL: ${url}`)
  }

  const t = ctx ? getT(ctx) : getTByLanguage("en")
  return checkUrl(url, typedDatabase, t)
}

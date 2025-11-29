import { log } from "../helpers"
import type { Rule } from "./types"

/**
 * Unified configuration for all rule types
 * Single source of truth with discriminated unions for type safety
 */
export const RULES: Rule[] = [
  // URL-only rules (can be added later)
  // Example:
  // {
  //   type: 'urlOnly',
  //   urlPattern: /^https?:\/\/example\.com\/blocked/
  // },

  // URL + DOM + full block (YouTube)
  {
    type: "urlDomFull",
    urlPattern: /^https?:\/\/(www\.)?youtube\.com\/(watch|shorts)/,
    linkSelector: "ytd-channel-name a",
    linkAttribute: "href"
  },

  // URL + DOM + inline block (LinkedIn)
  {
    type: "urlDomInline",
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/jobs\/search/,
    itemSelector: ".job-details-jobs-unified-top-card__container--two-pane",
    linkSelector: ".job-details-jobs-unified-top-card__company-name a",
    linkAttribute: "href"
  }
]

/**
 * Find matching rule for a URL
 * Returns first matching specific rule (urlDomFull or urlDomInline) or null
 * If null, the URL should be treated as urlOnly (default fallback)
 */
export const findMatchingRule = (url: string): Rule | null => {
  for (const rule of RULES) {
    if (rule.urlPattern.test(url)) {
      log(`[Rules] Found matching rule for URL: ${url}`)
      return rule
    }
  }
  // No specific rule found - URL-only is the default fallback
  return null
}

/**
 * Check if a URL should be treated as URL-only (default fallback)
 * This is true when no specific DOM-based rule matches
 */
export const isUrlOnlyRule = (url: string): boolean => {
  return findMatchingRule(url) === null
}

/**
 * Find rule of a specific type
 * Type-safe helper that narrows the return type
 */
export function findRuleOfType<T extends Rule["type"]>(
  url: string,
  type: T
): Extract<Rule, { type: T }> | null {
  const rule = findMatchingRule(url)
  return rule?.type === type ? (rule as Extract<Rule, { type: T }>) : null
}

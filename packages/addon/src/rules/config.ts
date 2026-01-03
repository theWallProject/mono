import { log } from "../helpers"
import { getLocalStorageItem, LINKEDIN_JOB_PROCESSING_ENABLED_KEY } from "../storageHelpers"
import type { Rule, RuleIds, RuleOfType } from "./types"

/**
 * Unified configuration for all rule types
 * Single source of truth with discriminated unions for type safety
 */
export const RULES = [
  // URL-only rules (can be added later)
  // Example:
  // {
  //   type: 'urlOnly',
  //   urlPattern: /^https?:\/\/example\.com\/blocked/
  // },

  // URL + DOM + full block (YouTube)
  {
    type: "urlDomFull",
    id: "youtube_channel",
    urlPattern: /^https?:\/\/(www\.)?youtube\.com\/(watch|shorts)/,
    linkSelector: "ytd-channel-name a",
    linkAttribute: "href"
  },

  // URL + DOM + inline block (LinkedIn)
  {
    type: "urlDomInline",
    id: "linkedin_job_processing",
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/jobs\/search/,
    itemSelector: ".job-details-jobs-unified-top-card__container--two-pane",
    linkSelector: ".job-details-jobs-unified-top-card__company-name a",
    linkAttribute: "href"
  }
] satisfies Rule[]

/**
 * Type-safe mapping of rule IDs to their corresponding setting keys
 * Rules not in this mapping are enabled by default
 */
type RuleSettingKeys = {
  linkedin_job_processing: typeof LINKEDIN_JOB_PROCESSING_ENABLED_KEY
  // Add more rule-to-setting mappings here as needed
}

const RULE_SETTING_KEYS: RuleSettingKeys = {
  linkedin_job_processing: LINKEDIN_JOB_PROCESSING_ENABLED_KEY
}

/**
 * Type guard to check if a rule ID has a setting key mapping
 */
function hasSettingKey(ruleId: RuleIds): ruleId is keyof RuleSettingKeys {
  return ruleId in RULE_SETTING_KEYS
}

/**
 * Check if a rule is enabled based on its ID
 * Rules without a setting key mapping are enabled by default
 * Returns true if enabled, false if disabled
 */
async function isRuleEnabled(ruleId: RuleIds): Promise<boolean> {
  if (hasSettingKey(ruleId)) {
    const settingKey = RULE_SETTING_KEYS[ruleId]
    const enabled = await getLocalStorageItem(settingKey)
    // Default to false (disabled) when setting is null/undefined
    return enabled === true
  }
  // Rule has no setting, enabled by default
  return true
}

/**
 * Find matching rule for a URL
 * Returns first matching specific rule (urlDomFull or urlDomInline) or null
 * If null, the URL should be treated as urlOnly (default fallback)
 * Checks rule enabled state before returning
 */
export const findMatchingRule = async (url: string): Promise<Rule | null> => {
  for (const rule of RULES) {
    if (rule.urlPattern.test(url)) {
      log(`[Rules] Found matching rule for URL: ${url}`)
      // Check if rule is enabled
      const enabled = await isRuleEnabled(rule.id)
      if (!enabled) {
        log(`[Rules] Rule ${rule.id} is disabled, skipping`)
        continue
      }
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
export const isUrlOnlyRule = async (url: string): Promise<boolean> => {
  const rule = await findMatchingRule(url)
  return rule === null
}

/**
 * Type guard to check if a rule matches a specific type
 */
function isRuleOfType<T extends Rule["type"]>(rule: Rule | null, type: T): rule is RuleOfType<T> {
  return rule !== null && rule.type === type
}

/**
 * Find rule of a specific type
 * Type-safe helper that narrows the return type
 */
export async function findRuleOfType<T extends Rule["type"]>(url: string, type: T): Promise<RuleOfType<T> | null> {
  const rule = await findMatchingRule(url)
  return isRuleOfType(rule, type) ? rule : null
}

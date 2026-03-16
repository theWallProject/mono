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
  type UrlCheckResult
} from "@theWallProject/common"

import ALL from "./db/ALL.json"
import { error, log } from "./helpers"
import { getI18nMessage } from "./helpers/i18n-keys"
import { getStorageItem } from "./storageHelpers"
import { type UrlTestResult } from "./types"

const ONE_MIN = 60 * 1000
const ONE_MONTH = 30 * 24 * 60 * ONE_MIN

/**
 * Convert UrlCheckResult to UrlTestResult by adding dismissal tracking and optional domain hint
 */
function toUrlTestResult(baseResult: UrlCheckResult, isDismissed: boolean, domainHint?: DomainHint): UrlTestResult {
  if (!baseResult) {
    return undefined
  }

  if (baseResult.isHint) {
    return {
      ...baseResult,
      isDismissed
    }
  }

  return {
    ...baseResult,
    isDismissed,
    ...(domainHint ? { domainHint } : {})
  }
}

/**
 * Find a domain hint for the given domain and return it formatted as DomainHint.
 * Used to show platform hints as toasts when viewing flagged companies on hint-enabled domains.
 */
function getDomainHintForUrl(domain: string): DomainHint | undefined {
  return formatDomainHint(findHintByDomain(domain, ALL))
}

const checkIsDissmissed = async (testKey: string) => {
  let isDismissed: boolean

  try {
    const dismissedTS = await getStorageItem(testKey)

    if (dismissedTS && typeof dismissedTS === "number") {
      //compare dismissedTS which is a timestamp to see if it is older than 1 month
      const now = new Date()
      const difference = new Date(now.getTime() - dismissedTS)

      if (difference.getTime() < ONE_MONTH) {
        log(`${testKey} was dismissed less than 1 month ago, keep dissmissed`)
        isDismissed = true
      } else {
        log(`${testKey} was dismissed longer than a month ago, not dismissing anymore`)
        isDismissed = false
      }
    } else {
      isDismissed = false
    }
  } catch {
    error(`isUrlFlagged getStorageItem failed for key ${testKey}`)
    isDismissed = false
  }

  return isDismissed
}

/**
 * Creates an .il domain hint result with i18n (addon-specific).
 * Used as a last-resort fallback when no database match or hint is found.
 * Uses chrome.i18n for internationalization.
 */
function createIlHint(domain: string): UrlTestResult {
  return {
    isHint: true,
    name: "Israeli Website",
    hintText: getI18nMessage("hintIsraeliWebsite"),
    hintUrl: "https://the-wall.win",
    isDismissed: false,
    rule: {
      selector: domain,
      key: "il" as const
    }
  }
}

export const isUrlFlagged = async (url: string): Promise<UrlTestResult> => {
  log(`storage: isUrlFlagged ${url}`)

  const domain = getMainDomain(url)

  return new Promise((resolve) => {
    const executeAsync = async () => {
      // Use shared pure functions for rule matching
      const rule = findMatchingRule(url)

      if (rule) {
        log("storage: isUrlFlagged [rule]", { rule })

        const selector = extractSelector(url, rule)
        if (!selector) {
          log("storage: isUrlFlagged [rule] no selector extracted", {
            rule,
            url
          })
          resolve(undefined)
          return
        }

        const selectorKey = getSelectorKey(rule.domain, url)

        const localTestKey = `${selectorKey}_${selector}`
        const isDismissed = await checkIsDissmissed(localTestKey)

        // Check dismissal first (addon-specific concern)
        if (isDismissed) {
          resolve({
            isDismissed: true,
            reasons: [],
            name: domain,
            rule: {
              selector,
              key: selectorKey
            }
          })
          return
        }

        log(`storage: isUrlFlagged testing for id ${selector} in field ${selectorKey}`)

        // Use shared pure function for database lookup
        const findResult = findInDatabaseBySelector(selector, selectorKey, rule.domain, ALL)

        log("isUrlFlagged findResult:", findResult)

        if (findResult) {
          // Use shared pure function to format result
          const baseResult = formatResult(findResult, selector, selectorKey)

          // Add dismissal tracking (addon-specific extension)
          if (baseResult && baseResult.isHint === true) {
            resolve({
              isHint: true,
              name: baseResult.name,
              hintText: baseResult.hintText,
              hintUrl: baseResult.hintUrl,
              isDismissed: false, // Hints don't support dismissing
              rule: baseResult.rule
            })
          } else if (baseResult) {
            // Check for a domain hint to show as toast
            const domainHint = getDomainHintForUrl(domain)
            resolve(toUrlTestResult(baseResult, false, domainHint))
          } else {
            resolve(undefined)
          }
        } else {
          // No flagged company found, but check for a standalone domain hint
          const hint = findHintByDomain(domain, ALL)
          if (hint && hint.hintText && hint.hintUrl) {
            resolve({
              isHint: true,
              name: hint.n,
              hintText: hint.hintText,
              hintUrl: hint.hintUrl,
              hintCompanyId: hint.hintCompanyId,
              isDismissed: false,
              rule: {
                selector: domain,
                key: "ws"
              }
            })
          } else {
            // Last resort: check if domain ends with .il (Israeli TLD)
            if (domain.endsWith(".il")) {
              resolve(createIlHint(domain))
              return
            }
            resolve(undefined)
          }
        }
      } else {
        // No matching rule, check by domain (website lookup)

        const findResult = findInDatabaseByDomain(domain, ALL)

        log("storage: isUrlFlagged onsuccess", findResult)

        if (findResult) {
          const localTestKey = `ws_${domain}`
          const isDismissed = await checkIsDissmissed(localTestKey)

          // Use shared pure function to format result
          const baseResult = formatResult(findResult, domain, "ws")

          // Add dismissal tracking (addon-specific extension)
          if (baseResult && baseResult.isHint === true) {
            resolve({
              isHint: true,
              name: baseResult.name,
              hintText: baseResult.hintText,
              hintUrl: baseResult.hintUrl,
              isDismissed: false, // Hints don't support dismissing
              rule: baseResult.rule
            })
          } else if (baseResult) {
            // Check for a domain hint to show as toast
            const domainHint = getDomainHintForUrl(domain)
            resolve(toUrlTestResult(baseResult, isDismissed, domainHint))
          } else {
            resolve(undefined)
          }
        } else {
          // No flagged company found, but check for a standalone domain hint
          const hint = findHintByDomain(domain, ALL)
          if (hint && hint.hintText && hint.hintUrl) {
            resolve({
              isHint: true,
              name: hint.n,
              hintText: hint.hintText,
              hintUrl: hint.hintUrl,
              hintCompanyId: hint.hintCompanyId,
              isDismissed: false,
              rule: {
                selector: domain,
                key: "ws"
              }
            })
          } else {
            // Last resort: check if domain ends with .il (Israeli TLD)
            if (domain.endsWith(".il")) {
              resolve(createIlHint(domain))
              return
            }
            resolve(undefined)
          }
        }
      }
    }
    void executeAsync()
  })
}

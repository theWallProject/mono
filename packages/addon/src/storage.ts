import {
  extractSelector,
  findInDatabaseByDomain,
  findInDatabaseBySelector,
  findMatchingRule,
  formatResult,
  getMainDomain,
  getSelectorKey,
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
 * Convert UrlCheckResult to UrlTestResult by adding dismissal tracking
 */
function toUrlTestResult(baseResult: UrlCheckResult, isDismissed: boolean): UrlTestResult {
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
    isDismissed
  }
}

const checkIsDissmissed = async (testKey: string) => {
  let isDismissed: boolean

  try {
    const dismissedTS = await getStorageItem<number>(testKey)

    if (dismissedTS) {
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

  // Handle .il domains separately with i18n (addon-specific concern)
  if (domain.endsWith(".il")) {
    return Promise.resolve(createIlHint(domain))
  }

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

        // "il" is not a database field, skip database lookup
        if (selectorKey === "il") {
          resolve(undefined)
          return
        }

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
            resolve(toUrlTestResult(baseResult, false))
          } else {
            resolve(undefined)
          }
        } else {
          resolve(undefined)
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
            resolve(toUrlTestResult(baseResult, isDismissed))
          } else {
            resolve(undefined)
          }
        } else {
          resolve(undefined)
        }
      }
    }
    executeAsync()
  })
}

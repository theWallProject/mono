import {
  CONFIG,
  getMainDomain,
  type FinalDBFileType,
  type SpecialDomains
} from "@theWallProject/common"

import ALL from "./db/ALL.json"
import { error, log } from "./helpers"
import { getStorageItem } from "./storageHelpers"
import { type UrlTestResult } from "./types"

const ONE_MIN = 60 * 1000
const ONE_MONTH = 30 * 24 * 60 * ONE_MIN

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
        log(
          `${testKey} was dismissed longer than a month ago, not dismissing anymore`
        )
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

export const isUrlFlagged = async (url: string): Promise<UrlTestResult> => {
  log(`storage: isUrlFlagged ${url}`)

  const domain = getMainDomain(url)

  if (domain.endsWith(".il")) {
    // Hints don't support dismissing - always set to false
    return new Promise((resolve) => {
      resolve({
        isHint: true,
        name: "Israeli Website",
        hintText: chrome.i18n.getMessage("hintIsraeliWebsite"),
        hintUrl: "https://the-wall.win",
        isDismissed: false,
        rule: {
          selector: domain,
          key: "il" as const
        }
      })
    })
  }

  return new Promise((resolve) => {
    const executeAsync = async () => {
      // Normalize URL by removing www. prefix for regex matching
      const normalizedUrl = url.replace(/^(https?:\/\/)www\./i, "$1")

      const ruleForDomain = CONFIG.rules.find((rule) => {
        // Use case-insensitive flag for YouTube, Twitter, LinkedIn (as per common package comments)
        const flags =
          rule.domain === "youtube.com" ||
          rule.domain === "twitter.com" ||
          rule.domain === "linkedin.com"
            ? "i"
            : ""
        const ruleRegex = new RegExp(rule.regex, flags)
        const regexResult = ruleRegex.test(normalizedUrl)

        if (regexResult) {
          log({ url, normalizedUrl, rule, regexResult })
        }
        return regexResult
      })

      if (ruleForDomain) {
        log("storage: isUrlFlagged [rule]", { ruleForDomain })

        // Use case-insensitive flag for YouTube, Twitter, LinkedIn
        const flags =
          ruleForDomain.domain === "youtube.com" ||
          ruleForDomain.domain === "twitter.com" ||
          ruleForDomain.domain === "linkedin.com"
            ? "i"
            : ""
        const regex = new RegExp(ruleForDomain.regex, flags)
        const results = regex.exec(normalizedUrl)
        // For YouTube, the regex has multiple capture groups - use the first non-undefined one
        // Groups: 1=user/, 2=c/@?, 3=@, 4=direct
        const selector =
          results &&
          (results[1] || results[2] || results[3] || results[4] || results[1])

        if (selector) {
          const selectorKey = getSelectorKey(
            ruleForDomain.domain,
            normalizedUrl
          )
          const localTestKey = `${selectorKey}_${selector}`

          const isDismissed = await checkIsDissmissed(localTestKey)

          if (isDismissed) {
            resolve({
              isDismissed: true,
              // reasons and name dont matter here
              reasons: [],
              name: domain,
              rule: {
                selector,
                key: getSelectorKey(ruleForDomain.domain, normalizedUrl)
              }
            })
          }

          log(
            `storage: isUrlFlagged testing for id ${selector} in field ${selectorKey}`
          )

          const findResult = (ALL as FinalDBFileType[]).find((row) => {
            const dbValue = row[selectorKey]
            if (!dbValue) return false

            // Normalize: strip @ prefix from both values
            // For YouTube, Twitter, LinkedIn: also compare case-insensitively
            const normalizedDbValue =
              typeof dbValue === "string" ? dbValue.replace(/^@/i, "") : dbValue
            const normalizedSelector = selector.replace(/^@/i, "")

            // Case-insensitive comparison for YouTube, Twitter, LinkedIn
            const isCaseInsensitive =
              ruleForDomain.domain === "youtube.com" ||
              ruleForDomain.domain === "twitter.com" ||
              ruleForDomain.domain === "linkedin.com"

            const matches = isCaseInsensitive
              ? normalizedDbValue.toLowerCase() ===
                normalizedSelector.toLowerCase()
              : normalizedDbValue === normalizedSelector

            if (matches) {
              log(
                `storage: isUrlFlagged found match: dbValue="${dbValue}", selector="${selector}"`
              )
            }
            return matches
          })

          log("isUrlFlagged findResult:", findResult)

          if (findResult) {
            // Check if this is a hint entry
            const result = findResult as FinalDBFileType & {
              hint?: boolean
              hintText?: string
              hintUrl?: string
            }
            if (result.hint && result.hintText) {
              // Hints don't support dismissing - always set to false
              const hintResult: UrlTestResult = {
                isHint: true,
                name: findResult.n,
                hintText: result.hintText,
                hintUrl: result.hintUrl || "",
                isDismissed: false,
                rule: {
                  selector,
                  key: getSelectorKey(ruleForDomain.domain, normalizedUrl)
                }
              }
              resolve(hintResult)
              return
            }

            resolve({
              reasons: findResult.r,
              name: findResult.n,
              alt: findResult.alt,
              stockSymbol: findResult.s,
              rule: {
                selector,
                key: getSelectorKey(ruleForDomain.domain, normalizedUrl)
              }
            })
          } else {
            resolve(undefined)
          }
        } else {
          log("storage: isUrlFlagged [rule] no result!!", {
            ruleForDomain,
            regex
          })

          resolve(undefined)
        }
      } else {
        const findResult = (ALL as FinalDBFileType[]).find(
          (row) => row.ws === domain
        )

        log("storage: isUrlFlagged onsuccess", findResult)

        if (findResult) {
          const localTestKey = `ws_${domain}`

          const isDismissed = await checkIsDissmissed(localTestKey)

          // Check if this is a hint entry
          const result = findResult as FinalDBFileType & {
            hint?: boolean
            hintText?: string
            hintUrl?: string
          }
          if (result.hint && result.hintText) {
            // Hints don't support dismissing - always set to false
            const hintResult_obj: UrlTestResult = {
              isHint: true,
              name: findResult.n,
              hintText: result.hintText,
              hintUrl: result.hintUrl || "",
              isDismissed: false,
              rule: {
                selector: domain,
                key: "ws" as const
              }
            }
            resolve(hintResult_obj)
            return
          }

          resolve({
            isDismissed,
            reasons: findResult.r,
            name: findResult.n,
            alt: findResult.alt,
            stockSymbol: findResult.s,
            rule: {
              selector: domain,
              key: "ws" as const
            }
          })
        }
      }
    }
    executeAsync()
  })
}

function getSelectorKey(domain: SpecialDomains, url?: string) {
  switch (domain) {
    case "facebook.com":
      return "fb" as const
    case "twitter.com":
    case "x.com":
      return "tw" as const
    case "linkedin.com":
      return "li" as const
    case "instagram.com":
      return "ig" as const
    case "github.com":
      return "gh" as const
    case "youtube.com": {
      // Determine if it's a Profile (@) or Channel (/channel/) URL
      // Check the URL directly - Profile URLs have /@, Channel URLs have /channel/
      if (!url) {
        throw new Error(
          `getSelectorKey: url is required for youtube.com domain`
        )
      }
      if (url.includes("/channel/")) {
        return "ytc" as const
      }
      if (url.includes("/@")) {
        return "ytp" as const
      }
      // Default to ytp for other YouTube URLs (shouldn't happen with proper rules)
      return "ytp" as const
    }
    case "tiktok.com":
      return "tt" as const
    case "threads.com":
      return "th" as const

    default: {
      throw new Error(`getSelectorKey: unexpected domain ${domain}`)
    }
  }
}

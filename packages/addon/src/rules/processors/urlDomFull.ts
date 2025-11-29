import { error, log } from "../../helpers"
import type { RuleOfType } from "../types"

/**
 * Process URL + DOM + full block rule
 * Extracts a single URL from DOM element
 * Includes retry logic for dynamic content (implementation detail)
 */
export const processUrlDomFull = async (
  rule: RuleOfType<"urlDomFull">,
  retryCount: number = 0,
  maxRetries: number = 5
): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const element = document.querySelector(rule.linkSelector)

      if (!element) {
        // Retry logic for dynamic content (implementation detail, not in config)
        if (retryCount < maxRetries) {
          log(
            `[UrlDomFullProcessor] Element not found, retrying... (${retryCount + 1}/${maxRetries})`
          )
          setTimeout(() => {
            resolve(processUrlDomFull(rule, retryCount + 1, maxRetries))
          }, 500) // 500ms delay between retries
          return
        }
        log(
          `[UrlDomFullProcessor] Element not found after retries: ${rule.linkSelector}`
        )
        resolve(null)
        return
      }

      const attribute = rule.linkAttribute || "href"
      const urlAttribute = element.getAttribute(attribute)

      if (!urlAttribute) {
        log(
          `[UrlDomFullProcessor] Element found but has no ${attribute} attribute: ${rule.linkSelector}`
        )
        resolve(null)
        return
      }

      // Resolve relative URLs to absolute
      let url: string | null = null
      try {
        if (
          urlAttribute.startsWith("http://") ||
          urlAttribute.startsWith("https://")
        ) {
          url = urlAttribute
        } else {
          // Resolve relative URL
          url = new URL(urlAttribute, window.location.href).href
        }
      } catch (e) {
        error(`[UrlDomFullProcessor] Failed to resolve URL: ${urlAttribute}`, e)
        resolve(null)
        return
      }

      log(`[UrlDomFullProcessor] Successfully extracted URL: ${url}`)
      resolve(url)
    } catch (e) {
      error(`[UrlDomFullProcessor] Failed to extract URL`, e)
      resolve(null)
    }
  })
}

// eslint-disable-next-line import/order
import { error, log } from "../helpers"
import type { DomScanRule, ExtractedItem } from "./types"

/**
 * Extract URLs from DOM elements based on rule configuration
 * Finds item containers first, then extracts links from each container
 */
export const extractItems = (rule: DomScanRule): ExtractedItem[] => {
  try {
    if (!rule || !rule.itemSelector || !rule.linkSelector) {
      error(`[Extractor] Invalid rule configuration`)
      return []
    }

    const items: ExtractedItem[] = []

    // Find all item containers
    const itemElements = document.querySelectorAll(rule.itemSelector)
    log(`[Extractor] Found ${itemElements.length} item containers`)

    // Fail-safe: limit processing to prevent performance issues
    const maxItems = 500
    const elementsToProcess =
      itemElements.length > maxItems
        ? Array.from(itemElements).slice(0, maxItems)
        : Array.from(itemElements)

    if (itemElements.length > maxItems) {
      log(
        `[Extractor] Limiting processing to ${maxItems} items (found ${itemElements.length})`
      )
    }

    elementsToProcess.forEach((itemElement) => {
      try {
        // Find link within this item container
        const linkElement = itemElement.querySelector(
          rule.linkSelector
        ) as globalThis.HTMLElement | null

        if (!linkElement) {
          log(
            `[Extractor] No link found in item container using selector: ${rule.linkSelector}. Item element:`,
            itemElement
          )
          return
        }

        // Extract URL from link element
        const linkAttribute = rule.linkAttribute || "href"
        const urlAttribute = linkElement.getAttribute(linkAttribute)

        if (!urlAttribute) {
          log(
            `[Extractor] Link element found but has no ${linkAttribute} attribute. Link element:`,
            linkElement
          )
          return
        }

        // Resolve relative URLs to absolute
        let url: string | null = null
        try {
          // If it's already absolute, use as-is
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
          error(`[Extractor] Failed to resolve URL: ${urlAttribute}`, e)
          return
        }

        log(
          `[Extractor] Successfully extracted URL from item: ${url} (from ${urlAttribute})`
        )
        items.push({
          itemElement,
          linkElement,
          url
        })
      } catch (e) {
        error(`[Extractor] Error processing item container`, e)
        // Continue processing other items
      }
    })

    log(`[Extractor] Successfully extracted ${items.length} items with URLs`)
    return items
  } catch (e) {
    error(`[Extractor] Failed to extract items`, e)
    return []
  }
}

/**
 * Extract URL from a single item element
 */
export const extractUrlFromItem = (
  itemElement: globalThis.Element,
  rule: DomScanRule
): ExtractedItem | null => {
  try {
    const linkElement = itemElement.querySelector(
      rule.linkSelector
    ) as globalThis.HTMLElement | null

    if (!linkElement) {
      log(
        `[Extractor] No link element found in item container using selector: ${rule.linkSelector}`
      )
      return null
    }

    const linkAttribute = rule.linkAttribute || "href"
    const urlAttribute = linkElement.getAttribute(linkAttribute)

    if (!urlAttribute) {
      log(
        `[Extractor] Link element found but has no ${linkAttribute} attribute. Element:`,
        linkElement
      )
      return null
    }

    let url: string | null = null
    try {
      if (
        urlAttribute.startsWith("http://") ||
        urlAttribute.startsWith("https://")
      ) {
        url = urlAttribute
      } else {
        url = new URL(urlAttribute, window.location.href).href
      }
    } catch (e) {
      error(`[Extractor] Failed to resolve URL: ${urlAttribute}`, e)
      return null
    }

    log(
      `[Extractor] extractUrlFromItem: Successfully extracted URL: ${url} (from ${urlAttribute})`
    )
    log(
      `[Extractor] extractUrlFromItem: Successfully extracted URL: ${url} (from ${urlAttribute})`
    )
    return {
      itemElement,
      linkElement,
      url
    }
  } catch (e) {
    error(`[Extractor] Error extracting item`, e)
    return null
  }
}

import type { APIListOfReasonsValues } from "@theWallProject/common"

import { error, log } from "../helpers"
import type { UrlTestResult } from "../types"
import type { ExtractedItem } from "./types"

export const PROCESSED_ATTR = "data-wall-processed"
export const FLAGGED_ATTR = "data-wall-flagged"
export const PASSED_ATTR = "data-wall-passed"
// CSS module classes are hashed, so we use data attributes for styling instead
export const OVERLAY_CLASS = "wall-dom-overlay"
export const BADGE_CLASS = "wall-dom-badge"

// Debug flag: set to true to show green border on passed items
const DEBUG_SHOW_PASSED_BORDER = true

/**
 * Apply visual treatment to a flagged item
 */
export const applyVisualTreatment = (
  item: ExtractedItem,
  checkResult: UrlTestResult
): void => {
  try {
    if (!checkResult || checkResult.isDismissed) {
      return
    }

    const itemElement = item.itemElement as globalThis.HTMLElement

    // Mark as processed and flagged
    itemElement.setAttribute(PROCESSED_ATTR, "true")
    itemElement.setAttribute(FLAGGED_ATTR, "true")

    // Store check result data for tooltip
    if (checkResult.name) {
      itemElement.setAttribute("data-wall-name", checkResult.name)
    }
    if (
      "reasons" in checkResult &&
      checkResult.reasons &&
      checkResult.reasons.length > 0
    ) {
      itemElement.setAttribute(
        "data-wall-reasons",
        checkResult.reasons.join(",")
      )
    }
    // Store URL and rule info for dismissal
    if (item.url) {
      itemElement.setAttribute("data-wall-url", item.url)
    }
    if (checkResult.rule) {
      itemElement.setAttribute("data-wall-selector", checkResult.rule.selector)
      itemElement.setAttribute("data-wall-key", checkResult.rule.key)
    }

    // Ensure item container has position relative for overlay positioning
    const computedStyle = window.getComputedStyle(itemElement)
    if (computedStyle.position === "static") {
      itemElement.style.position = "relative"
    }

    // Create overlay if it doesn't exist
    let overlay = itemElement.querySelector(
      `.${OVERLAY_CLASS}`
    ) as globalThis.HTMLElement
    if (!overlay) {
      overlay = document.createElement("div")
      overlay.className = OVERLAY_CLASS
      overlay.setAttribute("aria-hidden", "true")
      // Ensure overlay is visible with inline styles as fallback
      overlay.style.position = "absolute"
      overlay.style.top = "-4px"
      overlay.style.left = "-4px"
      overlay.style.right = "-4px"
      overlay.style.bottom = "-4px"
      overlay.style.backgroundColor = "rgba(239, 68, 68, 0.25)" // Modern red overlay
      overlay.style.zIndex = "9999"
      overlay.style.pointerEvents = "none" // Will be enabled for dismiss button area
      overlay.style.borderRadius = "6px"
      itemElement.appendChild(overlay)

      // Create dismiss button on overlay
      const dismissButton = document.createElement("button")
      dismissButton.className = "wall-overlay-dismiss"
      dismissButton.setAttribute("aria-label", "Dismiss")
      dismissButton.innerHTML = "×"
      dismissButton.style.position = "absolute"
      dismissButton.style.top = "6px"
      dismissButton.style.right = "6px"
      dismissButton.style.width = "24px"
      dismissButton.style.height = "24px"
      dismissButton.style.borderRadius = "4px"
      dismissButton.style.border = "none"
      dismissButton.style.background = "rgba(15, 23, 42, 0.8)"
      dismissButton.style.color = "#f1f5f9"
      dismissButton.style.fontSize = "18px"
      dismissButton.style.fontWeight = "600"
      dismissButton.style.cursor = "pointer"
      dismissButton.style.display = "flex"
      dismissButton.style.alignItems = "center"
      dismissButton.style.justifyContent = "center"
      dismissButton.style.pointerEvents = "auto"
      dismissButton.style.transition = "all 0.15s ease"
      dismissButton.style.zIndex = "10001"
      dismissButton.style.lineHeight = "1"
      dismissButton.style.padding = "0"
      dismissButton.style.margin = "0"

      // Hover effect
      dismissButton.addEventListener("mouseenter", () => {
        dismissButton.style.background = "rgba(15, 23, 42, 0.95)"
        dismissButton.style.transform = "scale(1.1)"
      })
      dismissButton.addEventListener("mouseleave", () => {
        dismissButton.style.background = "rgba(15, 23, 42, 0.8)"
        dismissButton.style.transform = "scale(1)"
      })

      // Dismiss handler - persists dismissal like Banner component
      dismissButton.addEventListener("click", (e) => {
        e.stopPropagation()
        e.preventDefault()
        const selector = itemElement.getAttribute("data-wall-selector")
        const key = itemElement.getAttribute("data-wall-key")
        if (selector && key) {
          const message = {
            action: "DissmissUrl" as const,
            key,
            selector
          }
          chrome.runtime.sendMessage(message, (response) => {
            if (!chrome.runtime.lastError && response) {
              // Dispatch event to hide tooltip
              itemElement.dispatchEvent(
                new globalThis.CustomEvent("wall:dismiss", { bubbles: true })
              )
              // Remove visual treatment - dismissal is now persisted in storage
              // Future checks will return isDismissed: true
              removeVisualTreatment(itemElement)
              markItemProcessed(itemElement)
              log(
                `[VisualTreatment] Dismissed ${key}_${selector} - will persist for 1 month`
              )
            }
          })
        }
      })

      overlay.appendChild(dismissButton)
      log(`[VisualTreatment] Created overlay element with dismiss button`)
    }

    // Badge removed - tooltip shows on hover instead

    log(`[VisualTreatment] Applied treatment to item with URL: ${item.url}`)
  } catch (e) {
    error(`[VisualTreatment] Failed to apply visual treatment`, e)
  }
}

/**
 * Remove visual treatment from an item
 */
export const removeVisualTreatment = (
  itemElement: globalThis.Element
): void => {
  try {
    const element = itemElement as globalThis.HTMLElement
    element.removeAttribute(FLAGGED_ATTR)
    element.removeAttribute("data-wall-name")
    element.removeAttribute("data-wall-reasons")

    const overlay = element.querySelector(`.${OVERLAY_CLASS}`)
    if (overlay) {
      overlay.remove()
    }

    const badge = element.querySelector(`.${BADGE_CLASS}`)
    if (badge) {
      badge.remove()
    }
  } catch (e) {
    error(`[VisualTreatment] Failed to remove visual treatment`, e)
  }
}

/**
 * Check if an item has been processed
 */
export const isItemProcessed = (itemElement: globalThis.Element): boolean => {
  return itemElement.hasAttribute(PROCESSED_ATTR)
}

/**
 * Mark an item as processed (without visual treatment)
 */
export const markItemProcessed = (itemElement: globalThis.Element): void => {
  itemElement.setAttribute(PROCESSED_ATTR, "true")
}

/**
 * Mark an item as passed (not flagged) - adds green border for debugging
 */
export const markItemPassed = (itemElement: globalThis.Element): void => {
  // Check if element is still in the DOM
  if (!itemElement.isConnected) {
    return
  }

  itemElement.setAttribute(PROCESSED_ATTR, "true")
  itemElement.setAttribute(PASSED_ATTR, "true")

  if (DEBUG_SHOW_PASSED_BORDER) {
    const element = itemElement as globalThis.HTMLElement
    element.style.border = "2px solid #22c55e" // green-500
    element.style.borderRadius = "4px"
  }
}

/**
 * Clear green border from an item (for debugging)
 */
export const clearPassedBorder = (itemElement: globalThis.Element): void => {
  if (!DEBUG_SHOW_PASSED_BORDER) {
    return
  }

  try {
    if (!itemElement.isConnected) {
      return
    }

    const element = itemElement as globalThis.HTMLElement
    // Only clear border if it was set by us (has the passed attribute)
    if (itemElement.hasAttribute(PASSED_ATTR)) {
      element.style.border = ""
      element.style.borderRadius = ""
      itemElement.removeAttribute(PASSED_ATTR)
    }
  } catch {
    // Element might have been removed from DOM
  }
}

/**
 * Clear all green borders from items with the passed attribute
 */
export const clearAllPassedBorders = (): void => {
  if (!DEBUG_SHOW_PASSED_BORDER) {
    return
  }

  try {
    const items = document.querySelectorAll(`[${PASSED_ATTR}="true"]`)
    items.forEach((item) => {
      clearPassedBorder(item)
    })
  } catch (e) {
    error(`[VisualTreatment] Failed to clear all passed borders`, e)
  }
}

/**
 * Reset all modifications from all elements (used when URL changes)
 * Removes all data attributes, overlays, badges, and style changes
 * Note: This does NOT remove event listeners - that's handled by DomScanner
 */
export const resetAllModifications = (): void => {
  try {
    log(`[VisualTreatment] Resetting all modifications`)

    // Find all elements with any wall-related attributes
    const selectors = [
      `[${PROCESSED_ATTR}]`,
      `[${FLAGGED_ATTR}]`,
      `[${PASSED_ATTR}]`,
      `[data-wall-name]`,
      `[data-wall-reasons]`
    ]

    const allModifiedElements = new Set<globalThis.Element>()

    selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector)
        elements.forEach((el) => allModifiedElements.add(el))
      } catch {
        // Selector might fail if element was removed, ignore
      }
    })

    // Also find all overlay elements
    try {
      const overlays = document.querySelectorAll(`.${OVERLAY_CLASS}`)
      overlays.forEach((overlay) => {
        if (overlay.parentElement) {
          allModifiedElements.add(overlay.parentElement)
        }
      })
    } catch {
      // Ignore errors
    }

    // Reset each element
    allModifiedElements.forEach((element) => {
      try {
        if (!element.isConnected) {
          return // Element no longer in DOM, skip
        }

        const htmlElement = element as globalThis.HTMLElement

        // Remove all data attributes
        htmlElement.removeAttribute(PROCESSED_ATTR)
        htmlElement.removeAttribute(FLAGGED_ATTR)
        htmlElement.removeAttribute(PASSED_ATTR)
        htmlElement.removeAttribute("data-wall-name")
        htmlElement.removeAttribute("data-wall-reasons")
        htmlElement.removeAttribute("data-wall-url")
        htmlElement.removeAttribute("data-wall-selector")
        htmlElement.removeAttribute("data-wall-key")

        // Remove overlay element
        const overlay = htmlElement.querySelector(`.${OVERLAY_CLASS}`)
        if (overlay) {
          overlay.remove()
        }

        // Reset style changes (only if we modified them)
        // Check if position was changed from static to relative
        // We can't perfectly track this, so we'll reset position if it's relative
        // and the element has our attributes (but we already removed them)
        // Instead, we'll check if there's an overlay/badge as a signal
        // Actually, since we're removing all attributes, we can't tell
        // For safety, we'll only reset position if it's currently relative
        // and there's no other reason for it (this is a best-effort approach)
        // Actually, let's be more conservative - only reset if we're sure we set it
        // Since we can't be 100% sure, we'll leave position as-is to avoid breaking layouts
        // But we should reset border styles if they were set by us
        if (DEBUG_SHOW_PASSED_BORDER) {
          // Only reset border if it was set by our debug code
          // We check this by looking for the green color
          const computedStyle = window.getComputedStyle(htmlElement)
          const borderColor = computedStyle.borderColor
          // Check if border color matches our green (#22c55e)
          if (borderColor === "rgb(34, 197, 94)" || borderColor === "#22c55e") {
            htmlElement.style.border = ""
            htmlElement.style.borderRadius = ""
          }
        }
      } catch (e) {
        // Element might have been removed or modified, continue with next
        error(`[VisualTreatment] Error resetting element`, e)
      }
    })

    log(`[VisualTreatment] Reset ${allModifiedElements.size} modified elements`)
  } catch (e) {
    error(`[VisualTreatment] Failed to reset all modifications`, e)
  }
}

/**
 * Valid reason codes for type checking
 */
const VALID_REASON_CODES: readonly APIListOfReasonsValues[] = [
  "h",
  "f",
  "i",
  "u",
  "b"
] as const

/**
 * Check if a string is a valid reason code
 */
const isValidReasonCode = (code: string): code is APIListOfReasonsValues => {
  return VALID_REASON_CODES.includes(code as APIListOfReasonsValues)
}

/**
 * Get check result data from element attributes
 */
export const getCheckResultData = (
  itemElement: globalThis.Element
): {
  name?: string
  reasons?: APIListOfReasonsValues[]
  url?: string
  selector?: string
  key?: string
} | null => {
  const name = itemElement.getAttribute("data-wall-name")
  const reasonsStr = itemElement.getAttribute("data-wall-reasons")
  const url = itemElement.getAttribute("data-wall-url")
  const selector = itemElement.getAttribute("data-wall-selector")
  const key = itemElement.getAttribute("data-wall-key")

  if (!name && !reasonsStr && !url) {
    return null
  }

  const reasons: APIListOfReasonsValues[] | undefined = reasonsStr
    ? reasonsStr.split(",").filter(isValidReasonCode)
    : undefined

  return {
    name: name || undefined,
    reasons,
    url: url || undefined,
    selector: selector || undefined,
    key: key || undefined
  }
}

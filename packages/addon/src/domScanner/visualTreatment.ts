import { APIListOfReasonsSchema, type valuesOfListOfReasons } from "@theWallProject/common"

import { error, log } from "../helpers"
import type { UrlTestResult } from "../types"
import type { ExtractedItem } from "./types"

/**
 * Data attribute to mark DOM elements that have been processed by the DOM scanner.
 * Used to prevent re-processing the same elements.
 */
export const PROCESSED_ATTR = "data-wall-processed"

/**
 * Data attribute to mark DOM elements that are flagged (contain URLs that match the database).
 * Elements with this attribute have visual treatment applied (overlay, tooltip on hover).
 */
export const FLAGGED_ATTR = "data-wall-flagged"

/**
 * Data attribute to mark DOM elements that passed the URL check (not flagged).
 * Used for debugging to show green borders on non-flagged items.
 */
export const PASSED_ATTR = "data-wall-passed"

/**
 * Data attribute to store the company/entity name from the database check result.
 */
export const DATA_WALL_NAME_ATTR = "data-wall-name"

/**
 * Data attribute to store the reasons (comma-separated) from the database check result.
 */
export const DATA_WALL_REASONS_ATTR = "data-wall-reasons"

/**
 * Data attribute to store the URL that was checked.
 */
export const DATA_WALL_URL_ATTR = "data-wall-url"

/**
 * Data attribute to store the CSS selector used to find the element.
 */
export const DATA_WALL_SELECTOR_ATTR = "data-wall-selector"

/**
 * Data attribute to store the unique key for the rule that matched.
 */
export const DATA_WALL_KEY_ATTR = "data-wall-key"

/**
 * CSS class name for the overlay element that covers flagged DOM items.
 * CSS module classes are hashed, so we use plain class names for dynamic elements.
 */
export const OVERLAY_CLASS = "wall-dom-overlay"

/**
 * CSS class name for the badge element on flagged DOM items.
 * Currently unused (badges removed in favor of hover tooltips).
 */
export const BADGE_CLASS = "wall-dom-badge"

/**
 * CSS class name for the dismiss button on overlay elements.
 * Used to identify dismiss buttons when handling click events.
 */
const DISMISS_BUTTON_CLASS = "wall-overlay-dismiss"

/**
 * Custom event type name for wall dismiss events
 */
export const WALL_DISMISS_EVENT_TYPE = "wall:dismiss"

/**
 * Typed custom event for wall:dismiss
 */
export interface WallDismissEvent extends globalThis.CustomEvent {
  type: typeof WALL_DISMISS_EVENT_TYPE
  detail: Record<string, never>
}

/**
 * Type guard to check if an event is a WallDismissEvent
 */
export function isWallDismissEvent(event: globalThis.Event): event is WallDismissEvent {
  return event.type === WALL_DISMISS_EVENT_TYPE && event instanceof globalThis.CustomEvent
}

// Debug flag: set to true to show green border on passed items
const DEBUG_SHOW_PASSED_BORDER = true

/**
 * Apply visual treatment to a flagged item
 */
export const applyVisualTreatment = (item: ExtractedItem, checkResult: UrlTestResult): void => {
  if (!checkResult) {
    throw new Error("applyVisualTreatment: checkResult is required")
  }
  if (checkResult.isDismissed) {
    return
  }

  if (!item.itemElement) {
    throw new Error("applyVisualTreatment: item.itemElement is required")
  }
  if (!(item.itemElement instanceof globalThis.HTMLElement)) {
    throw new Error("applyVisualTreatment: item.itemElement must be an HTMLElement")
  }
  const itemElement = item.itemElement

  // Mark as processed and flagged
  itemElement.setAttribute(PROCESSED_ATTR, "true")
  itemElement.setAttribute(FLAGGED_ATTR, "true")

  // Store check result data for tooltip
  if (!checkResult.name) {
    throw new Error("applyVisualTreatment: checkResult.name is required")
  }
  itemElement.setAttribute(DATA_WALL_NAME_ATTR, checkResult.name)

  if (!("reasons" in checkResult)) {
    throw new Error("applyVisualTreatment: checkResult must have reasons property")
  }
  if (!checkResult.reasons || checkResult.reasons.length === 0) {
    throw new Error("applyVisualTreatment: checkResult.reasons must be a non-empty array")
  }
  itemElement.setAttribute(DATA_WALL_REASONS_ATTR, checkResult.reasons.join(","))

  // Store URL and rule info for dismissal
  if (!item.url) {
    throw new Error("applyVisualTreatment: item.url is required")
  }
  itemElement.setAttribute(DATA_WALL_URL_ATTR, item.url)

  if (!checkResult.rule) {
    throw new Error("applyVisualTreatment: checkResult.rule is required")
  }
  if (!checkResult.rule.selector) {
    throw new Error("applyVisualTreatment: checkResult.rule.selector is required")
  }
  if (!checkResult.rule.key) {
    throw new Error("applyVisualTreatment: checkResult.rule.key is required")
  }
  itemElement.setAttribute(DATA_WALL_SELECTOR_ATTR, checkResult.rule.selector)
  itemElement.setAttribute(DATA_WALL_KEY_ATTR, checkResult.rule.key)

  // Ensure item container has position relative for overlay positioning
  const computedStyle = window.getComputedStyle(itemElement)
  if (computedStyle.position === "static") {
    itemElement.style.position = "relative"
  }

  // Create overlay if it doesn't exist
  const existingOverlay = itemElement.querySelector(`.${OVERLAY_CLASS}`)
  let overlay: globalThis.HTMLElement
  if (existingOverlay && existingOverlay instanceof globalThis.HTMLElement) {
    overlay = existingOverlay
  } else {
    overlay = document.createElement("div")
    overlay.className = OVERLAY_CLASS
    overlay.setAttribute("aria-hidden", "true")
    // Ensure overlay is visible with inline styles
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
    dismissButton.className = DISMISS_BUTTON_CLASS
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
      const selector = itemElement.getAttribute(DATA_WALL_SELECTOR_ATTR)
      const key = itemElement.getAttribute(DATA_WALL_KEY_ATTR)
      if (!selector) {
        throw new Error("Dismiss handler: selector is required")
      }
      if (!key) {
        throw new Error("Dismiss handler: key is required")
      }
      const message = {
        action: "DissmissUrl" as const,
        key,
        selector
      }
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          throw new Error(`Failed to dismiss URL: ${chrome.runtime.lastError.message}`)
        }
        if (!response) {
          throw new Error("Failed to dismiss URL: no response from background script")
        }
        // Dispatch event to hide tooltip
        itemElement.dispatchEvent(
          new globalThis.CustomEvent(WALL_DISMISS_EVENT_TYPE, {
            bubbles: true,
            detail: {}
          })
        )
        // Remove visual treatment - dismissal is now persisted in storage
        // Future checks will return isDismissed: true
        removeVisualTreatment(itemElement)
        markItemProcessed(itemElement)
        log(`[VisualTreatment] Dismissed ${key}_${selector} - will persist for 1 month`)
      })
    })

    overlay.appendChild(dismissButton)
    log(`[VisualTreatment] Created overlay element with dismiss button`)
  }

  // Badge removed - tooltip shows on hover instead

  log(`[VisualTreatment] Applied treatment to item with URL: ${item.url}`)
}

/**
 * Remove visual treatment from an item
 */
export const removeVisualTreatment = (itemElement: globalThis.Element): void => {
  if (!(itemElement instanceof globalThis.HTMLElement)) {
    throw new Error("removeVisualTreatment: itemElement must be an HTMLElement")
  }

  itemElement.removeAttribute(FLAGGED_ATTR)
  itemElement.removeAttribute(DATA_WALL_NAME_ATTR)
  itemElement.removeAttribute(DATA_WALL_REASONS_ATTR)

  const overlay = itemElement.querySelector(`.${OVERLAY_CLASS}`)
  if (overlay) {
    overlay.remove()
  }

  const badge = itemElement.querySelector(`.${BADGE_CLASS}`)
  if (badge) {
    badge.remove()
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
    // Only apply styles to HTMLElement (not SVGElement, etc.)
    if (itemElement instanceof globalThis.HTMLElement) {
      itemElement.style.border = "2px solid #22c55e" // green-500
      itemElement.style.borderRadius = "4px"
    } else {
      throw new Error("markItemPassed: itemElement must be an HTMLElement")
    }
  }
}

/**
 * Clear green border from an item (for debugging)
 */
export const clearPassedBorder = (itemElement: globalThis.Element): void => {
  if (!DEBUG_SHOW_PASSED_BORDER) {
    return
  }

  if (!itemElement.isConnected) {
    return
  }

  // Only apply styles to HTMLElement (not SVGElement, etc.)
  if (itemElement instanceof globalThis.HTMLElement) {
    // Only clear border if it was set by us (has the passed attribute)
    if (itemElement.hasAttribute(PASSED_ATTR)) {
      itemElement.style.border = ""
      itemElement.style.borderRadius = ""
      itemElement.removeAttribute(PASSED_ATTR)
    }
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
      `[${DATA_WALL_NAME_ATTR}]`,
      `[${DATA_WALL_REASONS_ATTR}]`
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

        // Remove all data attributes (removeAttribute is available on Element)
        element.removeAttribute(PROCESSED_ATTR)
        element.removeAttribute(FLAGGED_ATTR)
        element.removeAttribute(PASSED_ATTR)
        element.removeAttribute(DATA_WALL_NAME_ATTR)
        element.removeAttribute(DATA_WALL_REASONS_ATTR)
        element.removeAttribute(DATA_WALL_URL_ATTR)
        element.removeAttribute(DATA_WALL_SELECTOR_ATTR)
        element.removeAttribute(DATA_WALL_KEY_ATTR)

        // Remove overlay element
        const overlay = element.querySelector(`.${OVERLAY_CLASS}`)
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
          // Only apply styles to HTMLElement (not SVGElement, etc.)
          if (element instanceof globalThis.HTMLElement) {
            // We check this by looking for the green color
            const computedStyle = window.getComputedStyle(element)
            const borderColor = computedStyle.borderColor
            // Check if border color matches our green (#22c55e)
            if (borderColor === "rgb(34, 197, 94)" || borderColor === "#22c55e") {
              element.style.border = ""
              element.style.borderRadius = ""
            }
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
 * Parse and validate reason codes from a comma-separated string using Zod schema.
 *
 * Note: reasonsStr is a string because HTML data attributes can only store strings.
 * The reasons array is serialized as a comma-separated string when stored (line 111)
 * and must be parsed back into an array when retrieved (line 472).
 *
 * Fails hard if any code is invalid.
 */
const parseReasonCodes = (reasonsStr: string): valuesOfListOfReasons[] => {
  return reasonsStr.split(",").map((code): valuesOfListOfReasons => {
    const trimmedCode = code.trim()
    // Validate using Zod schema
    const result = APIListOfReasonsSchema.safeParse(trimmedCode)
    if (!result.success) {
      throw new Error(`Invalid reason code: ${trimmedCode}. Valid codes are: h, f, i, u, b`)
    }
    // After successful Zod validation, result.data is guaranteed to be one of the enum values.
    // However, TypeScript's type narrowing for Zod enums can be problematic.
    // We use a type guard function to properly narrow the type.
    const validatedValue: unknown = result.data
    // Type guard: check if value is a valid reason code
    if (
      validatedValue === "h" ||
      validatedValue === "f" ||
      validatedValue === "i" ||
      validatedValue === "u" ||
      validatedValue === "b"
    ) {
      return validatedValue
    }
    // This should never happen after successful Zod validation
    throw new Error(`Invalid reason code after validation: ${String(validatedValue)}`)
  })
}

/**
 * Get check result data from element attributes
 */
export const getCheckResultData = (
  itemElement: globalThis.Element
): {
  name?: string
  reasons?: valuesOfListOfReasons[]
  url?: string
  selector?: string
  key?: string
} | null => {
  const name = itemElement.getAttribute(DATA_WALL_NAME_ATTR)
  const reasonsStr = itemElement.getAttribute(DATA_WALL_REASONS_ATTR)
  const url = itemElement.getAttribute(DATA_WALL_URL_ATTR)
  const selector = itemElement.getAttribute(DATA_WALL_SELECTOR_ATTR)
  const key = itemElement.getAttribute(DATA_WALL_KEY_ATTR)

  // Return null if no data exists (element not flagged)
  if (!name && !reasonsStr && !url) {
    return null
  }

  // If any data exists, all required fields must be present
  if (!name) {
    throw new Error("getCheckResultData: name is required when element has wall data")
  }
  if (!reasonsStr) {
    throw new Error("getCheckResultData: reasonsStr is required when element has wall data")
  }
  if (!url) {
    throw new Error("getCheckResultData: url is required when element has wall data")
  }
  if (!selector) {
    throw new Error("getCheckResultData: selector is required when element has wall data")
  }
  if (!key) {
    throw new Error("getCheckResultData: key is required when element has wall data")
  }

  const reasons = parseReasonCodes(reasonsStr)

  return {
    name,
    reasons,
    url,
    selector,
    key
  }
}

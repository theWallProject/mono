import { error, log } from "../helpers"
// eslint-disable-next-line import/order
import type { UrlTestResult } from "../types"
import type { ExtractedItem } from "./types"

const PROCESSED_ATTR = "data-wall-processed"
const FLAGGED_ATTR = "data-wall-flagged"
// CSS module classes are hashed, so we use data attributes for styling instead
const OVERLAY_CLASS = "wall-dom-overlay"
const BADGE_CLASS = "wall-dom-badge"

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
      itemElement.appendChild(overlay)
    }

    // Create badge if it doesn't exist
    let badge = itemElement.querySelector(
      `.${BADGE_CLASS}`
    ) as globalThis.HTMLElement
    if (!badge) {
      badge = document.createElement("div")
      badge.className = BADGE_CLASS
      badge.setAttribute("aria-label", "Flagged by The Wall")
      badge.innerHTML = "🧱"
      itemElement.appendChild(badge)
    }

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
 * Get check result data from element attributes
 */
export const getCheckResultData = (
  itemElement: globalThis.Element
): { name?: string; reasons?: string[] } | null => {
  const name = itemElement.getAttribute("data-wall-name")
  const reasonsStr = itemElement.getAttribute("data-wall-reasons")

  if (!name && !reasonsStr) {
    return null
  }

  return {
    name: name || undefined,
    reasons: reasonsStr ? reasonsStr.split(",") : undefined
  }
}

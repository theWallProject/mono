import type { APIListOfReasonsValues } from "@theWallProject/common"
import React from "react"
import { createRoot, type Root } from "react-dom/client"

import { error, log } from "../helpers"
import { findRuleOfType } from "../rules"
import type { RuleOfType } from "../rules/types"
import {
  MessageTypes,
  type Message,
  type MessageResponseMap,
  type UrlTestResult
} from "../types"
import { extractItems, extractUrlFromItem } from "./extractor"
import { HoverTooltip } from "./HoverTooltip"
import {
  applyVisualTreatment,
  clearAllPassedBorders,
  getCheckResultData,
  isItemProcessed,
  markItemPassed,
  markItemProcessed,
  OVERLAY_CLASS,
  resetAllModifications
} from "./visualTreatment"

const PROCESSING_DELAY_MS = 1000 // 1 second delay after mutations
const SEQUENTIAL_CHECK_DELAY_MS = 100 // 100ms delay between sequential URL checks

type QueuedItem = {
  itemElement: globalThis.Element
  url: string
}

export class DomScanner {
  private rule: RuleOfType<"urlDomInline"> | null = null
  private intersectionObserver: globalThis.IntersectionObserver | null = null
  private mutationObserver: globalThis.MutationObserver | null = null
  private processingQueue: Set<globalThis.Element> = new Set()
  private processingTimeout: number | null = null
  private processedUrls: Map<string, UrlTestResult> = new Map()
  private isProcessingSequentially = false
  private tooltipRoot: Root | null = null
  private tooltipContainer: globalThis.HTMLElement | null = null
  private isActive = false
  private initTimeout: number | null = null
  // Track event listeners for cleanup
  private eventListeners: Map<
    globalThis.Element,
    {
      handleMouseEnter: () => void
      handleMouseLeave: () => void
    }
  > = new Map()
  private readonly MAX_PROCESSED_URLS_CACHE = 1000 // Limit cache size to prevent unbounded growth

  /**
   * Initialize scanner for current page
   */
  public initialize(): void {
    try {
      const url = window.location.href
      log(`[Scanner] Initializing for URL: ${url}`)

      // Get urlDomInline rule for this page
      const inlineRule = findRuleOfType(url, "urlDomInline")
      if (!inlineRule) {
        // Silently return if no rule found (expected for many pages)
        return
      }

      this.rule = inlineRule

      log(`[Scanner] Found matching rule: ${this.rule.urlPattern.toString()}`)

      // Clear any existing init timeout
      if (this.initTimeout) {
        clearTimeout(this.initTimeout)
        this.initTimeout = null
      }

      // Wait 1 second after page load before starting
      this.initTimeout = window.setTimeout(() => {
        this.initTimeout = null
        // Only start if we still have a rule (wasn't stopped during delay)
        if (this.rule) {
          log(`[Scanner] Starting scanner after delay`)
          this.start()
        }
      }, PROCESSING_DELAY_MS)
    } catch (e) {
      error(`[Scanner] Failed to initialize`, e)
    }
  }

  /**
   * Start scanning
   */
  private start(): void {
    if (!this.rule) {
      return
    }

    try {
      this.isActive = true

      // Create tooltip container
      this.createTooltipContainer()

      // Setup observers
      this.setupIntersectionObserver()
      this.setupMutationObserver()

      // Initial scan of visible items
      this.scanVisibleItems()

      log(`[Scanner] Started scanning`)
    } catch (e) {
      error(`[Scanner] Failed to start`, e)
      this.isActive = false
    }
  }

  /**
   * Stop scanning and cleanup
   */
  public stop(): void {
    log(`[Scanner] Stopping scanner`)

    this.isActive = false

    // Cancel init timeout if pending
    if (this.initTimeout) {
      clearTimeout(this.initTimeout)
      this.initTimeout = null
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }

    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout)
      this.processingTimeout = null
    }

    // Remove all event listeners
    this.removeAllEventListeners()

    this.processingQueue.clear()
    this.hideTooltip()
    this.removeTooltipContainer()

    // Reset all visual modifications when stopping
    resetAllModifications()

    // Clear processed URLs cache
    this.processedUrls.clear()

    log(`[Scanner] Stopped`)
  }

  /**
   * Setup IntersectionObserver to track visible items
   */
  private setupIntersectionObserver(): void {
    if (!this.rule) return

    this.intersectionObserver = new globalThis.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Item became visible - queue for processing
            this.queueItemForProcessing(entry.target)
          }
        })
      },
      {
        rootMargin: "50px" // Start processing slightly before items enter viewport
      }
    )

    // Removed observer.observe() calls - items are now processed via initial scan only
  }

  /**
   * Setup MutationObserver to detect new/changed items
   */
  private setupMutationObserver(): void {
    if (!this.rule) return

    this.mutationObserver = new globalThis.MutationObserver((mutations) => {
      let hasNewItems = false

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === globalThis.Node.ELEMENT_NODE) {
            const element = node as globalThis.Element

            // Check if the added node is an item container
            if (element.matches && element.matches(this.rule!.itemSelector)) {
              // Removed observer.observe() call
              this.queueItemForProcessing(element)
              hasNewItems = true
            }

            // Check if any item containers were added within this node
            const items = element.querySelectorAll?.(this.rule!.itemSelector)
            items?.forEach((item) => {
              // Removed observer.observe() call
              this.queueItemForProcessing(item)
              hasNewItems = true
            })
          }
        })
      })

      if (hasNewItems) {
        this.scheduleProcessing()
      }
    })

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  /**
   * Queue an item for processing
   */
  private queueItemForProcessing(itemElement: globalThis.Element): void {
    if (!this.isActive || !this.rule) return

    // Skip if already processed
    if (isItemProcessed(itemElement)) {
      return
    }

    this.processingQueue.add(itemElement)
    this.scheduleProcessing()
  }

  /**
   * Schedule processing after delay
   */
  private scheduleProcessing(): void {
    if (this.processingTimeout) {
      return // Already scheduled
    }

    this.processingTimeout = window.setTimeout(() => {
      this.processingTimeout = null
      this.processQueue()
    }, PROCESSING_DELAY_MS)
  }

  /**
   * Process queued items
   */
  private async processQueue(): Promise<void> {
    if (!this.isActive || !this.rule || this.processingQueue.size === 0) {
      return
    }

    try {
      // Clear old green borders before processing new items
      clearAllPassedBorders()

      // Get visible items from queue
      const visibleItems: QueuedItem[] = []
      const itemsToRemove: globalThis.Element[] = []

      this.processingQueue.forEach((itemElement) => {
        // Check if element is still in the DOM
        if (!itemElement.isConnected) {
          itemsToRemove.push(itemElement)
          return
        }

        // Check if item is visible
        const rect = itemElement.getBoundingClientRect()
        const isVisible =
          rect.top < window.innerHeight + 100 &&
          rect.bottom > -100 &&
          rect.left < window.innerWidth + 100 &&
          rect.right > -100

        if (!isVisible) {
          return // Skip invisible items
        }

        // Extract URL from item
        const extracted = extractUrlFromItem(itemElement, this.rule!)
        if (extracted && extracted.url) {
          visibleItems.push({
            itemElement,
            url: extracted.url
          })
          itemsToRemove.push(itemElement)
        } else {
          // Mark as processed even if no URL found (to avoid re-processing)
          markItemProcessed(itemElement)
          itemsToRemove.push(itemElement)
        }
      })

      // Remove processed items from queue
      itemsToRemove.forEach((item) => {
        this.processingQueue.delete(item)
      })

      if (visibleItems.length === 0) {
        return
      }

      log(`[Scanner] Processing ${visibleItems.length} visible items`)

      // Check URLs sequentially
      await this.checkUrlsSequentially(visibleItems)
    } catch (e) {
      error(`[Scanner] Error processing queue`, e)
      // Fail-safe: mark all items as processed to prevent infinite retry
      this.processingQueue.forEach((item) => {
        markItemProcessed(item)
      })
      this.processingQueue.clear()
    }
  }

  /**
   * Check URLs sequentially with 100ms delay between each, without blocking the page
   */
  private async checkUrlsSequentially(items: QueuedItem[]): Promise<void> {
    if (this.isProcessingSequentially) {
      // Already processing, queue will be handled by existing process
      return
    }

    this.isProcessingSequentially = true

    try {
      // Process items one by one with delay
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // Skip if already processed
        if (isItemProcessed(item.itemElement)) {
          continue
        }

        // Check if URL was already checked (cached)
        if (this.processedUrls.has(item.url)) {
          const result = this.processedUrls.get(item.url)!
          // If dismissed, skip it
          if (result && result.isDismissed) {
            markItemProcessed(item.itemElement)
            continue
          }
          const extracted = extractUrlFromItem(item.itemElement, this.rule!)
          if (extracted && result) {
            applyVisualTreatment(extracted, result)
            if (result && result !== undefined && !result.isDismissed) {
              // Setup hover handler for all flagged items (to show tooltip)
              this.setupHoverHandler(item.itemElement)
            }
          }
          markItemProcessed(item.itemElement)
          continue
        }

        // Wait before processing next item (non-blocking)
        if (i > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, SEQUENTIAL_CHECK_DELAY_MS)
          )
        }

        // Check single URL
        await this.checkSingleUrl(item)
      }
    } catch (e) {
      error(`[Scanner] Error in sequential URL checking`, e)
      // Fail-safe: mark remaining items as processed
      items.forEach((item) => {
        if (!isItemProcessed(item.itemElement)) {
          markItemProcessed(item.itemElement)
        }
      })
    } finally {
      this.isProcessingSequentially = false
    }
  }

  /**
   * Check a single URL and apply treatment
   */
  private async checkSingleUrl(item: QueuedItem): Promise<void> {
    return new Promise((resolve) => {
      try {
        const message: Message = {
          action: MessageTypes.TestUrl,
          url: item.url
        }

        chrome.runtime.sendMessage<Message>(
          message,
          (result: MessageResponseMap[MessageTypes.TestUrl]) => {
            try {
              if (chrome.runtime.lastError) {
                error(
                  `[Scanner] URL check error for ${item.url}:`,
                  chrome.runtime.lastError.message
                )
                markItemProcessed(item.itemElement)
                resolve()
                return
              }

              // Cache result (with size limit to prevent unbounded growth)
              if (result !== undefined) {
                // If cache is too large, remove oldest entries (simple FIFO)
                if (this.processedUrls.size >= this.MAX_PROCESSED_URLS_CACHE) {
                  const firstKey = this.processedUrls.keys().next().value
                  if (firstKey) {
                    this.processedUrls.delete(firstKey)
                  }
                }
                this.processedUrls.set(item.url, result)
              }

              // Check if element is still in the DOM before applying treatment
              if (!item.itemElement.isConnected) {
                resolve()
                return
              }

              // If dismissed, mark as processed and don't show anything
              if (result && result.isDismissed) {
                markItemProcessed(item.itemElement)
                resolve()
                return
              }

              // Apply visual treatment if flagged
              if (result && result !== undefined && !result.isDismissed) {
                const extracted = extractUrlFromItem(
                  item.itemElement,
                  this.rule!
                )
                if (extracted) {
                  applyVisualTreatment(extracted, result)
                  // Setup hover handler for all flagged items (to show tooltip)
                  this.setupHoverHandler(item.itemElement)
                }
              } else {
                // Item passed (not flagged) - mark as passed for debugging
                markItemPassed(item.itemElement)
              }
              resolve()
            } catch (e) {
              error(`[Scanner] Error processing URL check response`, e)
              markItemProcessed(item.itemElement)
              resolve()
            }
          }
        )
      } catch (e) {
        error(`[Scanner] Error checking single URL`, e)
        markItemProcessed(item.itemElement)
        resolve()
      }
    })
  }

  /**
   * Scan currently visible items
   */
  private scanVisibleItems(): void {
    if (!this.rule) return

    const items = extractItems(this.rule)
    const visibleItems = items.filter((item) => {
      const rect = item.itemElement.getBoundingClientRect()
      return (
        rect.top < window.innerHeight + 100 &&
        rect.bottom > -100 &&
        rect.left < window.innerWidth + 100 &&
        rect.right > -100
      )
    })

    if (visibleItems.length > 0) {
      const queuedItems: QueuedItem[] = visibleItems
        .filter((item) => item.url)
        .map((item) => ({
          itemElement: item.itemElement,
          url: item.url!
        }))

      if (queuedItems.length > 0) {
        this.checkUrlsSequentially(queuedItems)
      }
    }
  }

  /**
   * Setup hover handler for flagged item
   */
  private setupHoverHandler(itemElement: globalThis.Element): void {
    try {
      const element = itemElement as globalThis.HTMLElement
      if (!element) {
        return
      }

      // Remove existing handlers if any (to prevent duplicates)
      const existing = this.eventListeners.get(itemElement)
      if (existing) {
        element.removeEventListener("mouseenter", existing.handleMouseEnter)
        element.removeEventListener("mouseleave", existing.handleMouseLeave)
      }

      const handleMouseEnter = () => {
        try {
          if (!this.isActive) {
            return // Don't show tooltip if scanner is stopped
          }
          const data = getCheckResultData(itemElement)
          // Show tooltip if there are reasons (name is no longer needed)
          if (data && data.reasons && data.reasons.length > 0) {
            this.showTooltip(element, data.name, data.reasons)
          }
        } catch (e) {
          error(`[Scanner] Error in mouseenter handler`, e)
        }
      }

      const handleMouseLeave = (e: globalThis.MouseEvent) => {
        try {
          // Don't hide tooltip if mouse is moving to tooltip or overlay
          const relatedTarget = e.relatedTarget as globalThis.Node | null
          if (
            relatedTarget &&
            (this.tooltipContainer?.contains(relatedTarget) ||
              element
                .querySelector(`.${OVERLAY_CLASS}`)
                ?.contains(relatedTarget))
          ) {
            return
          }
          this.hideTooltip()
        } catch (err) {
          error(`[Scanner] Error in mouseleave handler`, err)
        }
      }

      // Store handlers for cleanup
      this.eventListeners.set(itemElement, {
        handleMouseEnter,
        handleMouseLeave: handleMouseLeave as () => void
      })

      // Add new handlers
      element.addEventListener("mouseenter", handleMouseEnter)
      element.addEventListener(
        "mouseleave",
        handleMouseLeave as (e: globalThis.Event) => void
      )
    } catch (e) {
      error(`[Scanner] Error setting up hover handler`, e)
    }
  }

  /**
   * Remove all event listeners to prevent memory leaks
   */
  private removeAllEventListeners(): void {
    try {
      this.eventListeners.forEach((handlers, element) => {
        try {
          if (element.isConnected) {
            const htmlElement = element as globalThis.HTMLElement
            htmlElement.removeEventListener(
              "mouseenter",
              handlers.handleMouseEnter
            )
            htmlElement.removeEventListener(
              "mouseleave",
              handlers.handleMouseLeave
            )
          }
        } catch {
          // Element might have been removed, ignore
        }
      })
      this.eventListeners.clear()
    } catch (e) {
      error(`[Scanner] Error removing event listeners`, e)
    }
  }

  /**
   * Create tooltip container
   */
  private createTooltipContainer(): void {
    if (this.tooltipContainer) return

    this.tooltipContainer = document.createElement("div")
    this.tooltipContainer.id = "wall-dom-tooltip-container"
    this.tooltipContainer.style.position = "fixed"
    this.tooltipContainer.style.top = "0"
    this.tooltipContainer.style.left = "0"
    this.tooltipContainer.style.pointerEvents = "none"
    this.tooltipContainer.style.zIndex = "10000"
    document.body.appendChild(this.tooltipContainer)

    this.tooltipRoot = createRoot(this.tooltipContainer)
  }

  /**
   * Remove tooltip container
   */
  private removeTooltipContainer(): void {
    if (this.tooltipRoot) {
      this.tooltipRoot.unmount()
      this.tooltipRoot = null
    }

    if (this.tooltipContainer) {
      this.tooltipContainer.remove()
      this.tooltipContainer = null
    }
  }

  /**
   * Show tooltip
   */
  private showTooltip(
    targetElement: globalThis.HTMLElement,
    name?: string,
    reasons?: APIListOfReasonsValues[]
  ): void {
    try {
      if (!this.tooltipRoot || !this.tooltipContainer || !targetElement) {
        return
      }

      this.tooltipRoot.render(
        React.createElement(HoverTooltip, {
          name,
          reasons,
          targetElement,
          onClose: () => this.hideTooltip()
        })
      )
    } catch (e) {
      error(`[Scanner] Error showing tooltip`, e)
    }
  }

  /**
   * Hide tooltip
   */
  private hideTooltip(): void {
    try {
      if (this.tooltipRoot) {
        this.tooltipRoot.render(null)
      }
    } catch (e) {
      error(`[Scanner] Error hiding tooltip`, e)
    }
  }
}

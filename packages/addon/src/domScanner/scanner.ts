import React from "react"
import { createRoot, type Root } from "react-dom/client"

import { error, log } from "../helpers"
import {
  MessageTypes,
  type Message,
  type MessageResponseMap,
  type UrlTestResult
} from "../types"
import { findMatchingRule } from "./config"
import { extractItems, extractUrlFromItem } from "./extractor"
import { HoverTooltip } from "./HoverTooltip"
import type { DomScanRule } from "./types"
import {
  applyVisualTreatment,
  getCheckResultData,
  isItemProcessed,
  markItemProcessed
} from "./visualTreatment"

const PROCESSING_DELAY_MS = 1000 // 1 second delay after mutations
const SEQUENTIAL_CHECK_DELAY_MS = 100 // 100ms delay between sequential URL checks

type QueuedItem = {
  itemElement: globalThis.Element
  url: string
}

export class DomScanner {
  private rule: DomScanRule | null = null
  private intersectionObserver: globalThis.IntersectionObserver | null = null
  private mutationObserver: globalThis.MutationObserver | null = null
  private processingQueue: Set<globalThis.Element> = new Set()
  private processingTimeout: number | null = null
  private processedUrls: Map<string, UrlTestResult> = new Map()
  private isProcessingSequentially = false
  private tooltipRoot: Root | null = null
  private tooltipContainer: globalThis.HTMLElement | null = null
  private isActive = false

  /**
   * Initialize scanner for current page
   */
  public initialize(): void {
    try {
      const url = window.location.href
      log(`[Scanner] Initializing for URL: ${url}`)

      this.rule = findMatchingRule(url)

      if (!this.rule) {
        log(`[Scanner] No matching rule found for URL`)
        return
      }

      log(`[Scanner] Found matching rule: ${this.rule.urlPattern}`)

      // Wait 1 second after page load before starting
      setTimeout(() => {
        this.start()
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

    this.processingQueue.clear()
    this.hideTooltip()
    this.removeTooltipContainer()

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

    // Observe all existing items
    const items = document.querySelectorAll(this.rule.itemSelector)
    items.forEach((item) => {
      this.intersectionObserver?.observe(item)
    })
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
              this.intersectionObserver?.observe(element)
              this.queueItemForProcessing(element)
              hasNewItems = true
            }

            // Check if any item containers were added within this node
            const items = element.querySelectorAll?.(this.rule!.itemSelector)
            items?.forEach((item) => {
              this.intersectionObserver?.observe(item)
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
      // Get visible items from queue
      const visibleItems: QueuedItem[] = []
      const itemsToRemove: globalThis.Element[] = []

      this.processingQueue.forEach((itemElement) => {
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
          const extracted = extractUrlFromItem(item.itemElement, this.rule!)
          if (extracted && result) {
            applyVisualTreatment(extracted, result)
            if (result && result !== undefined && !result.isDismissed) {
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

              // Cache result
              if (result !== undefined) {
                this.processedUrls.set(item.url, result)
              }

              // Apply visual treatment if flagged
              if (result && result !== undefined) {
                const extracted = extractUrlFromItem(
                  item.itemElement,
                  this.rule!
                )
                if (extracted) {
                  applyVisualTreatment(extracted, result)

                  // Setup hover handler if flagged
                  if (!result.isDismissed) {
                    this.setupHoverHandler(item.itemElement)
                  }
                }
              }

              markItemProcessed(item.itemElement)
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

      const handleMouseEnter = () => {
        try {
          const data = getCheckResultData(itemElement)
          if (data && (data.name || data.reasons)) {
            this.showTooltip(element, data.name, data.reasons)
          }
        } catch (e) {
          error(`[Scanner] Error in mouseenter handler`, e)
        }
      }

      const handleMouseLeave = () => {
        try {
          this.hideTooltip()
        } catch (e) {
          error(`[Scanner] Error in mouseleave handler`, e)
        }
      }

      // Remove existing handlers if any
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)

      // Add new handlers
      element.addEventListener("mouseenter", handleMouseEnter)
      element.addEventListener("mouseleave", handleMouseLeave)
    } catch (e) {
      error(`[Scanner] Error setting up hover handler`, e)
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
    reasons?: string[]
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

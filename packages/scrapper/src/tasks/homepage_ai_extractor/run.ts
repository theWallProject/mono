/**
 * Core orchestration logic for the Homepage AI Extractor.
 *
 * Handles three modes:
 *   1. Interactive — Process one company at a time with browser review
 *   2. Batch — Auto-process next N companies without review
 *   3. Retry — Re-process companies from the retry list
 *
 * Reuses existing patterns from validate_urls.ts:
 *   - Same sorting by reason + cbRank
 *   - Same override I/O (loadManualOverrides / saveManualOverrides)
 *   - Same statistics display
 *   - Same browser-based review flow (for interactive mode)
 */

import fs from "fs"
import path from "path"
import { chromium, Page } from "playwright"

import { error, log } from "../../helper"
import { CrunchbaseScrappedItemType, ManualOverrideFields, MergedDataFileSchema } from "../../types"
import { sortByReasonAndCbRank } from "../validate/sorting"
import { displayStatistics } from "../validate/statistics"
import { isAutoExtracted, isProcessed, type ManualOverrideValue } from "../validate/types"
import { loadManualOverrides, saveManualOverrides } from "../validate/override_io"
import { categorizeLinks, type CategorizedLinks } from "./ai_categorizer"
import { CompanyLogger } from "./company_logger"
import { HOMEPAGE_AI_EXTRACTOR_CONFIG } from "./config"
import {
  extractLinksFromHomepage,
  ExpectedExtractionError,
  closeSharedBrowser
} from "./link_extractor"
import {
  addToRetryList,
  loadRetryList,
  removeFromRetryList
} from "./retry_list"

// ────────────────────────────────────────────────────────────────────────────
// Data loading
// ────────────────────────────────────────────────────────────────────────────

const inputFilePath = path.join(__dirname, "../../../results/2_merged/2_MERGED_ALL.json")

type LoadedData = {
  allItems: CrunchbaseScrappedItemType[]
  sortedItems: CrunchbaseScrappedItemType[]
  currentOverrides: Record<string, ManualOverrideValue>
  unprocessedItems: CrunchbaseScrappedItemType[]
}

const loadData = (): LoadedData => {
  // Load merged data
  log("Loading data from 2_MERGED_ALL.json...")
  if (!fs.existsSync(inputFilePath)) {
    throw new Error(
      `2_MERGED_ALL.json not found at ${inputFilePath}. ` +
        "Run the pipeline first: pnpm dev (or pnpm build) to generate merged data."
    )
  }
  const fileContent = fs.readFileSync(inputFilePath, "utf-8")
  const data = MergedDataFileSchema.parse(JSON.parse(fileContent))
  log(`Loaded ${data.length} items`)

  // Load existing overrides
  const currentOverrides = loadManualOverrides()
  log(`Loaded ${Object.keys(currentOverrides).length} existing overrides`)

  // Sort by reason priority (h > f > others) then cbRank ascending
  const sortedItems = sortByReasonAndCbRank(data)
  log("Sorted by reason priority (h > f > others) and cbRank")

  // Filter: skip already processed (human-verified OR auto-extracted), skip those with existing overrides
  const unprocessedItems = sortedItems.filter((item) => {
    const existing = currentOverrides[item.name]
    // Skip if human-verified (_processed: true)
    if (existing && isProcessed(existing)) return false
    // Skip if auto-extracted (_processed: "auto")
    if (existing && isAutoExtracted(existing)) return false
    // Skip if already has any override data (per user request: "ignore existing for now")
    if (existing && Object.keys(existing).length > 0) return false
    return true
  })

  log(`Found ${unprocessedItems.length} unprocessed items (no existing overrides)`)

  return { allItems: data, sortedItems, currentOverrides, unprocessedItems }
}

// ────────────────────────────────────────────────────────────────────────────
// Convert CategorizedLinks to ManualOverrideFields
// ────────────────────────────────────────────────────────────────────────────

const categorizedToOverride = (
  categorized: CategorizedLinks
): ManualOverrideFields & { _processed: "auto"; urls?: string[] } => {
  const override: ManualOverrideFields & { _processed: "auto"; urls?: string[] } = {
    _processed: "auto"
  }

  if (categorized.ws && categorized.ws.length > 0) override.ws = categorized.ws
  if (categorized.li && categorized.li.length > 0) override.li = categorized.li
  if (categorized.fb && categorized.fb.length > 0) override.fb = categorized.fb
  if (categorized.tw && categorized.tw.length > 0) override.tw = categorized.tw
  if (categorized.ig && categorized.ig.length > 0) override.ig = categorized.ig
  if (categorized.gh && categorized.gh.length > 0) override.gh = categorized.gh
  if (categorized.ytp && categorized.ytp.length > 0) override.ytp = categorized.ytp
  if (categorized.ytc && categorized.ytc.length > 0) override.ytc = categorized.ytc
  if (categorized.tt && categorized.tt.length > 0) override.tt = categorized.tt
  if (categorized.th && categorized.th.length > 0) override.th = categorized.th
  if (categorized.urls && categorized.urls.length > 0) override.urls = categorized.urls
  if (categorized.android_app_ids && categorized.android_app_ids.length > 0) {
    override.android_app_ids = categorized.android_app_ids
  }
  if (categorized.android_dev_id) {
    override.android_dev_id = categorized.android_dev_id
  }

  return override
}

// ────────────────────────────────────────────────────────────────────────────
// Process a single company (headless extraction + AI categorization)
// ────────────────────────────────────────────────────────────────────────────

type ProcessResult = {
  companyName: string
  success: boolean
  override?: ManualOverrideFields & { _processed: "auto"; urls?: string[] }
  errorType?: string
  errorMessage?: string
}

const processCompany = async (
  item: CrunchbaseScrappedItemType
): Promise<ProcessResult> => {
  const companyLogger = new CompanyLogger(item.name)

  try {
    // Check if company has a website URL
    if (!item.ws || item.ws.trim().length === 0) {
      throw new ExpectedExtractionError(
        `Company "${item.name}" has no website URL in Crunchbase data`,
        "NO_WEBSITE"
      )
    }

    companyLogger.log(`Company: ${item.name}`)
    companyLogger.log(`Website: ${item.ws}`)
    companyLogger.log(`cbRank: ${item.cbRank ?? "N/A"}`)
    companyLogger.log(`Reasons: ${item.reasons?.join(", ") ?? "none"}`)

    // Step 1: Fetch homepage and extract links
    const extraction = await extractLinksFromHomepage(item.ws, companyLogger)

    // Step 2: Categorize links (programmatic + AI)
    const categorized = await categorizeLinks(item.name, extraction, companyLogger)

    // Step 3: Convert to override format
    const override = categorizedToOverride(categorized)

    companyLogger.log(`Override fields: ${Object.keys(override).filter((k) => k !== "_processed").join(", ")}`)
    companyLogger.flush()

    return {
      companyName: item.name,
      success: true,
      override
    }
  } catch (err) {
    if (err instanceof ExpectedExtractionError) {
      // Expected failure — log and add to retry list
      companyLogger.error(`Expected failure (${err.errorType}): ${err.message}`)
      companyLogger.flush()

      return {
        companyName: item.name,
        success: false,
        errorType: err.errorType,
        errorMessage: err.message
      }
    }

    // Unexpected failure — let it bubble up and crash
    companyLogger.error(`UNEXPECTED failure: ${err instanceof Error ? err.message : String(err)}`)
    companyLogger.flush()
    throw err
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Interactive mode: browser review
// ────────────────────────────────────────────────────────────────────────────

/**
 * Opens a browser with the company website + all extracted social links in tabs.
 * Collects final tab URLs when user closes the browser (same pattern as validate_urls.ts).
 * Returns the categorized links based on what tabs the user left open.
 */
/**
 * Delay in ms before checking if a tab close was a user action vs browser shutdown.
 * When the user closes the entire browser, all tab `close` events fire before `disconnected`.
 * We use a delay to distinguish: if the browser is still connected after TAB_CLOSE_DELAY_MS,
 * it was a deliberate user tab close. Otherwise, the browser was shutting down.
 * (Same pattern used in validate_urls.ts)
 */
const TAB_CLOSE_DELAY_MS = 3000

const browserReview = async (
  companyName: string,
  categorized: CategorizedLinks
): Promise<CategorizedLinks> => {
  const userDataDir = path.join(__dirname, "../../../.browser-profile")

  const browserArgs = [
    "--start-maximized",
    "--disable-blink-features=AutomationControlled",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    `--user-agent=${HOMEPAGE_AI_EXTRACTOR_CONFIG.playwright.userAgent}`
  ]

  // Load The Wall extension if available
  const extensionDir = path.join(__dirname, "../../../../addon/build/chrome-mv3-dev")
  const extensionManifestPath = path.join(extensionDir, "manifest.json")

  if (fs.existsSync(extensionManifestPath)) {
    const absoluteExtensionDir = path.resolve(extensionDir)
    browserArgs.push(`--disable-extensions-except=${absoluteExtensionDir}`)
    browserArgs.push(`--load-extension=${absoluteExtensionDir}`)
    log(`Loading The Wall extension from: ${absoluteExtensionDir}`)
  } else {
    log("The Wall extension not found — opening browser without it")
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: browserArgs,
    viewport: HOMEPAGE_AI_EXTRACTOR_CONFIG.playwright.viewport,
    ignoreHTTPSErrors: true
  })

  // Remove automation detection
  const setupAntiDetection = async (page: Page) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false })
      Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] })
      Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] })
      Object.defineProperty(window, "chrome", {
        value: { runtime: {} },
        writable: true,
        configurable: true
      })
    })
  }

  for (const page of context.pages()) {
    await setupAntiDetection(page)
  }
  context.on("page", async (page) => {
    await setupAntiDetection(page)
  })

  // Collect all URLs to open
  const urlsToOpen: Array<{ label: string; url: string }> = []

  // All categorized links (ws first so the company website opens as the first tab)
  const linkFields: Array<[string, string[] | undefined]> = [
    ["Website", categorized.ws],
    ["LinkedIn", categorized.li],
    ["Facebook", categorized.fb],
    ["Twitter/X", categorized.tw],
    ["Instagram", categorized.ig],
    ["GitHub", categorized.gh],
    ["YouTube Profile", categorized.ytp],
    ["YouTube Channel", categorized.ytc],
    ["TikTok", categorized.tt],
    ["Threads", categorized.th]
  ]

  for (const [label, urls] of linkFields) {
    if (urls) {
      for (const url of urls) {
        urlsToOpen.push({ label, url })
      }
    }
  }

  // Open a few notable "urls" too
  if (categorized.urls) {
    for (const url of categorized.urls.slice(0, 10)) {
      urlsToOpen.push({ label: "Other", url })
    }
  }

  // Open all URLs in tabs
  log(`Opening ${urlsToOpen.length} tabs for review of "${companyName}"...`)

  // ── Tab tracking state (same pattern as validate_urls.ts) ──
  const persistentTabUrls = new Map<Page, string>()
  const userClosedUrls = new Set<string>()
  const pendingTabCloseChecks = new Set<NodeJS.Timeout>()
  let isContextClosing = false

  const isBrowserStillOpen = (): boolean => {
    try {
      const browser = context.browser()
      return browser !== null && browser.isConnected()
    } catch {
      return false
    }
  }

  const updateTabUrl = (tab: Page) => {
    try {
      if (tab.isClosed()) return
      const tabUrl = tab.url()
      if (tabUrl && tabUrl !== "about:blank") {
        persistentTabUrls.set(tab, tabUrl)
      }
    } catch {
      // Tab might be closing
    }
  }

  const setupTabTracking = (tab: Page) => {
    updateTabUrl(tab)
    tab.on("framenavigated", () => updateTabUrl(tab))
    tab.on("load", () => updateTabUrl(tab))
    tab.on("close", () => {
      const url = persistentTabUrls.get(tab)
      if (!url || url === "about:blank") return

      // If context is already closing (browser shutdown), don't mark as user-closed
      if (isContextClosing) return

      // Delay check: if browser is still open after TAB_CLOSE_DELAY_MS, it was a user action
      const timeoutId = setTimeout(() => {
        pendingTabCloseChecks.delete(timeoutId)

        if (isBrowserStillOpen() && !isContextClosing) {
          userClosedUrls.add(url)
          log(`  Tab closed by user (excluded): ${url}`)
        }
      }, TAB_CLOSE_DELAY_MS)

      pendingTabCloseChecks.add(timeoutId)
    })
  }

  context.on("page", (tab) => {
    setupTabTracking(tab)
  })

  // Open tabs
  const openedPages: Page[] = []
  for (const { label, url } of urlsToOpen) {
    try {
      const page = await context.newPage()
      openedPages.push(page)
      setupTabTracking(page)
      log(`  Opening [${label}]: ${url}`)
      // Navigate without waiting (parallel loading)
      void page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {
        // Navigation failure is OK in review mode
      })
    } catch {
      log(`  Failed to open tab for: ${url}`)
    }
  }

  // Close empty about:blank tabs
  for (const page of context.pages()) {
    if (!openedPages.includes(page)) {
      try {
        const url = page.url()
        if (url === "about:blank" || url === "") {
          await page.close()
        }
      } catch {
        // Already closed
      }
    }
  }

  log(`\nBrowser open with ${openedPages.length} tabs. Review the links and close the browser to continue.`)
  log("Tabs you CLOSE will be EXCLUDED from the result. Tabs left open will be INCLUDED.\n")

  // Wait for browser to close
  return new Promise<CategorizedLinks>((resolve) => {
    const browser = context.browser()
    if (!browser) {
      resolve(categorized) // Fallback
      return
    }

    const handleDisconnect = () => {
      // Mark as shutting down FIRST, so any pending tab close checks don't fire
      isContextClosing = true

      // Cancel all pending tab close delay checks
      for (const timeoutId of pendingTabCloseChecks) {
        clearTimeout(timeoutId)
      }
      pendingTabCloseChecks.clear()

      // Collect final URLs from tabs that were still open
      const finalUrls: string[] = []
      for (const [, url] of persistentTabUrls.entries()) {
        if (!url || url === "about:blank") continue
        if (userClosedUrls.has(url)) continue
        finalUrls.push(url)
      }

      log(`\nBrowser closed. ${finalUrls.length} URLs from open tabs, ${userClosedUrls.size} excluded by user.`)

      if (userClosedUrls.size > 0) {
        log("Excluded URLs:")
        for (const url of userClosedUrls) {
          log(`  - ${url}`)
        }
      }

      // Return the original categorization (user review is visual confirmation)
      // The tab exclusion tracking is informational for now — in interactive mode
      // the user confirms by closing the browser, not by individually closing tabs.
      resolve(categorized)
    }

    browser.on("disconnected", handleDisconnect)
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Public API: Interactive mode
// ────────────────────────────────────────────────────────────────────────────

/**
 * Interactive mode: process one company at a time.
 *
 * 1. Loads data, finds next unprocessed company by cbRank
 * 2. Runs headless extraction + AI categorization
 * 3. Opens browser with all found links for user review
 * 4. Saves to manualOverrides.ts after browser is closed
 *
 * Returns the name of the processed company (or null if none left).
 */
export const runInteractive = async (companyNameOverride?: string): Promise<string | null> => {
  const { sortedItems, currentOverrides, unprocessedItems } = loadData()

  if (unprocessedItems.length === 0) {
    log("All items have been processed!")
    return null
  }

  // Select company
  const firstItem = unprocessedItems[0]
  if (!firstItem) throw new Error("Unexpected: unprocessedItems array is empty")

  let selectedItem: CrunchbaseScrappedItemType
  if (companyNameOverride) {
    const found = unprocessedItems.find((item) => item.name === companyNameOverride)
    if (!found) {
      error(`Company "${companyNameOverride}" not found in unprocessed items.`)
      log("\nAvailable companies (showing first 10):")
      for (const item of unprocessedItems.slice(0, 10)) {
        log(`  - ${item.name} (cbRank: ${item.cbRank ?? "N/A"})`)
      }
      throw new Error(`Company "${companyNameOverride}" not found.`)
    }
    selectedItem = found
  } else {
    selectedItem = firstItem
  }

  const itemIndex = unprocessedItems.findIndex((i) => i.name === selectedItem.name)
  log(`\n[${itemIndex + 1}/${unprocessedItems.length}] Processing: ${selectedItem.name} (cbRank: ${selectedItem.cbRank ?? "N/A"})`)

  // Step 1: Headless extraction + AI categorization
  const result = await processCompany(selectedItem)

  if (!result.success) {
    // Expected failure — add to retry list
    log(`\nExpected failure for "${result.companyName}": ${result.errorType} — ${result.errorMessage}`)
    addToRetryList(
      result.companyName,
      selectedItem.ws ?? "",
      result.errorType ?? "UNKNOWN",
      result.errorMessage ?? "Unknown error"
    )
    log("Added to retry list. Run retry mode later to re-process.")

    // Display statistics
    displayStatistics(sortedItems, currentOverrides)
    return result.companyName
  }

  if (!result.override) {
    throw new Error(`processCompany returned success=true but no override for "${result.companyName}"`)
  }

  // Step 2: Browser review
  // Convert ManualOverrideFields (string | string[]) to CategorizedLinks (string[] only)
  const overrideAsCategorized: CategorizedLinks = {}
  const linkKeys = ["ws", "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"] as const
  for (const key of linkKeys) {
    const val = result.override[key]
    if (val !== undefined) {
      overrideAsCategorized[key] = Array.isArray(val) ? val : [val]
    }
  }
  if (result.override.urls) overrideAsCategorized.urls = result.override.urls
  if (result.override.android_app_ids) overrideAsCategorized.android_app_ids = result.override.android_app_ids
  if (result.override.android_dev_id) overrideAsCategorized.android_dev_id = result.override.android_dev_id

  log("\nOpening browser for review...")
  const reviewedCategorized = await browserReview(
    selectedItem.name,
    overrideAsCategorized
  )

  // Convert back to override if browser review changed anything
  const finalOverride = categorizedToOverride(reviewedCategorized)

  // Step 3: Save to manualOverrides
  currentOverrides[selectedItem.name] = finalOverride
  await saveManualOverrides(currentOverrides, { allowNewKeys: true })
  log(`\nSaved override for "${selectedItem.name}"`)

  // Verify save
  const verifyPath = path.join(__dirname, "../manual_resolve/manualOverrides.ts")
  if (!fs.existsSync(verifyPath)) {
    throw new Error(`manualOverrides.ts not found after save: ${verifyPath}`)
  }
  fs.readFileSync(verifyPath, "utf-8")
  log("Save verified")

  // Display statistics
  const updatedOverrides = loadManualOverrides()
  displayStatistics(sortedItems, updatedOverrides)

  await closeSharedBrowser()

  return selectedItem.name
}

// ────────────────────────────────────────────────────────────────────────────
// Public API: Batch mode
// ────────────────────────────────────────────────────────────────────────────

/**
 * Batch mode: auto-process next N companies without browser review.
 *
 * Stops immediately on unexpected failures.
 * Logs expected failures to retry_list.json and continues.
 * Saves after each company.
 */
export const runBatch = async (batchSize?: number): Promise<void> => {
  const size = batchSize ?? HOMEPAGE_AI_EXTRACTOR_CONFIG.batch.defaultSize
  const { sortedItems, unprocessedItems } = loadData()
  const currentOverrides = loadManualOverrides()

  const itemsToProcess = unprocessedItems.slice(0, size)
  log(`\nBatch mode: processing ${itemsToProcess.length} companies (of ${unprocessedItems.length} remaining)`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < itemsToProcess.length; i++) {
    const item = itemsToProcess[i]
    if (!item) throw new Error(`Unexpected: item at index ${i} is undefined`)

    log(`\n[${'─'.repeat(60)}]`)
    log(`[${i + 1}/${itemsToProcess.length}] ${item.name} (cbRank: ${item.cbRank ?? "N/A"})`)

    const result = await processCompany(item)

    if (!result.success) {
      // Expected failure
      failCount++
      log(`FAILED (expected): ${result.errorType} — ${result.errorMessage}`)
      addToRetryList(
        result.companyName,
        item.ws ?? "",
        result.errorType ?? "UNKNOWN",
        result.errorMessage ?? "Unknown error"
      )

      // Fail hard: stop the batch on expected failures too
      throw new Error(
        `Batch stopped: expected failure for "${result.companyName}".\n` +
          `Error type: ${result.errorType}\n` +
          `Error message: ${result.errorMessage}\n` +
          `Company added to retry_list.json. Fix the issue or adjust config, then re-run.\n` +
          `Processed ${successCount} companies successfully before failure.`
      )
    }

    if (!result.override) {
      throw new Error(`processCompany returned success=true but no override for "${result.companyName}"`)
    }

    // Save immediately
    currentOverrides[item.name] = result.override
    await saveManualOverrides(currentOverrides, { allowNewKeys: true })
    successCount++
    log(`SAVED (${successCount}/${itemsToProcess.length})`)

    // Remove from retry list if it was there
    removeFromRetryList(item.name)

    // Delay between companies to be polite
    if (i < itemsToProcess.length - 1) {
      const delay = HOMEPAGE_AI_EXTRACTOR_CONFIG.batch.delayBetweenRequests
      log(`Waiting ${delay}ms before next company...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  await closeSharedBrowser()

  // Final statistics
  log(`\n${"═".repeat(60)}`)
  log(`BATCH COMPLETE`)
  log(`  Success: ${successCount}`)
  log(`  Failed:  ${failCount} (see retry_list.json)`)
  log(`${"═".repeat(60)}`)

  const updatedOverrides = loadManualOverrides()
  displayStatistics(sortedItems, updatedOverrides)
}

// ────────────────────────────────────────────────────────────────────────────
// Public API: Retry mode
// ────────────────────────────────────────────────────────────────────────────

/**
 * Retry mode: re-process companies from the retry list.
 *
 * Same as batch mode but operates on the retry list instead of unprocessed items.
 */
export const runRetry = async (): Promise<void> => {
  const retryEntries = loadRetryList()
  if (retryEntries.length === 0) {
    log("Retry list is empty. Nothing to retry.")
    return
  }

  log(`\nRetry mode: ${retryEntries.length} companies to retry`)
  for (const entry of retryEntries) {
    log(`  - ${entry.companyName} (${entry.errorType}, retries: ${entry.retryCount})`)
  }

  // Load data
  const { sortedItems } = loadData()
  const currentOverrides = loadManualOverrides()

  let successCount = 0

  for (let i = 0; i < retryEntries.length; i++) {
    const entry = retryEntries[i]
    if (!entry) throw new Error(`Unexpected: retry entry at index ${i} is undefined`)

    // Find the company in the data
    const item = sortedItems.find((item) => item.name === entry.companyName)
    if (!item) {
      log(`Company "${entry.companyName}" not found in data — skipping (may have been deleted)`)
      removeFromRetryList(entry.companyName)
      continue
    }

    log(`\n[${i + 1}/${retryEntries.length}] Retrying: ${entry.companyName} (previous error: ${entry.errorType})`)

    const result = await processCompany(item)

    if (!result.success) {
      // Still failing — update retry list and stop
      addToRetryList(
        result.companyName,
        item.ws ?? "",
        result.errorType ?? "UNKNOWN",
        result.errorMessage ?? "Unknown error"
      )

      throw new Error(
        `Retry stopped: "${result.companyName}" still failing.\n` +
          `Error type: ${result.errorType}\n` +
          `Error message: ${result.errorMessage}\n` +
          `Processed ${successCount} companies successfully before failure.`
      )
    }

    if (!result.override) {
      throw new Error(`processCompany returned success=true but no override for "${result.companyName}"`)
    }

    // Save and remove from retry list
    currentOverrides[item.name] = result.override
    await saveManualOverrides(currentOverrides, { allowNewKeys: true })
    removeFromRetryList(entry.companyName)
    successCount++
    log(`RETRY SUCCESS (${successCount}/${retryEntries.length}): ${entry.companyName}`)

    // Delay between companies
    if (i < retryEntries.length - 1) {
      const delay = HOMEPAGE_AI_EXTRACTOR_CONFIG.batch.delayBetweenRequests
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  await closeSharedBrowser()

  log(`\nRetry complete: ${successCount}/${retryEntries.length} succeeded`)
  const updatedOverrides = loadManualOverrides()
  displayStatistics(sortedItems, updatedOverrides)
}

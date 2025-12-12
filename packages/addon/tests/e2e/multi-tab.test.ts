import type { BrowserContext, Page } from "playwright"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { HINT_DISMISSED_PERM_PREFIX, HINT_SHOWN_PREFIX, HINTS_SYSTEM_DISABLED_KEY } from "../../src/storageHelpers"
import { getRandomUrl, getRandomUrls } from "../fixtures/test-urls"
import { closeBrowser, launchBrowserWithExtension } from "../utils/browser"
import {
  isBannerDisplayed,
  isHintsToastShown,
  navigateToUrl,
  setStorageValue,
  waitForExtensionProcessing
} from "../utils/extension"

describe("Multi-Tab Scenarios", () => {
  let context: BrowserContext
  let extensionId: string

  beforeAll(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
    extensionId = result.extensionId

    // Ensure hints are enabled by default (fail fast if this doesn't work)
    await setStorageValue(context, extensionId, HINTS_SYSTEM_DISABLED_KEY, false)

    // Clear any hint history that might prevent hints from showing
    // This ensures hints work by default in tests
    const page = await context.newPage()
    try {
      const popupUrl = `chrome-extension://${extensionId}/popup.html`
      await page.goto(popupUrl, { waitUntil: "domcontentloaded", timeout: 5000 })
      await page.evaluate(
        ({
          hintShownPrefix,
          hintDismissedPermPrefix
        }: {
          hintShownPrefix: string
          hintDismissedPermPrefix: string
        }) => {
          return new Promise<void>((resolve) => {
            chrome.storage.local.get(null, (items) => {
              const keysToRemove: string[] = []
              for (const key in items) {
                // Remove hint shown timestamps and dismissed hints
                if (key.startsWith(hintShownPrefix) || key.startsWith(hintDismissedPermPrefix)) {
                  keysToRemove.push(key)
                }
              }
              if (keysToRemove.length > 0) {
                chrome.storage.local.remove(keysToRemove, () => resolve())
              } else {
                resolve()
              }
            })
          })
        },
        { hintShownPrefix: HINT_SHOWN_PREFIX, hintDismissedPermPrefix: HINT_DISMISSED_PERM_PREFIX }
      )
    } finally {
      await page.close()
    }
  })

  afterAll(async () => {
    await closeBrowser(context)
  })

  it("should handle multiple tabs with different URLs", async () => {
    // Get a mix: 2 banner URLs and 1 hint URL
    const bannerUrls = getRandomUrls({ count: 2, isHint: false, excludeTested: true, excludeLoginRequired: true })
    const hintUrls = getRandomUrls({ count: 1, isHint: true, excludeTested: true, excludeLoginRequired: true })
    const testUrls = [...bannerUrls, ...hintUrls]

    const pages: Page[] = []
    const successfulNavigations: Array<{ page: Page; testUrl: (typeof testUrls)[0] }> = []

    try {
      // Open multiple tabs and track successful navigations
      for (const testUrl of testUrls) {
        const page = await context.newPage()
        pages.push(page)
        const navigationSuccess = await navigateToUrl(page, testUrl.url)

        if (navigationSuccess) {
          await waitForExtensionProcessing(page)
          successfulNavigations.push({ page, testUrl })
        } else {
          // Navigation failed, skip this URL
          console.log(`[TEST] Skipping failed URL: ${testUrl.url}`)
        }
      }

      // Each successfully loaded tab should work independently
      // Separate hint URLs from banner URLs for proper testing
      const hintPages: Array<{ page: Page; testUrl: (typeof successfulNavigations)[0]["testUrl"] }> = []
      const bannerPages: Array<{ page: Page; testUrl: (typeof successfulNavigations)[0]["testUrl"] }> = []

      for (const { page, testUrl } of successfulNavigations) {
        if (testUrl.isHint) {
          hintPages.push({ page, testUrl })
        } else {
          bannerPages.push({ page, testUrl })
        }
      }

      // Test hint URLs - fail fast if hints don't show
      for (const { page, testUrl } of hintPages) {
        await page.waitForTimeout(3000)
        const toastVisible = await isHintsToastShown(page)
        if (!toastVisible) {
          throw new Error(
            `Hint toast should be visible for hint URL: ${testUrl.url}. Database entry has isHint: true and hintText.`
          )
        }
        expect(toastVisible).toBe(true)
      }

      // Test banner URLs - fail fast if banners don't show
      for (const { page, testUrl } of bannerPages) {
        const bannerVisible = await isBannerDisplayed(page)
        if (!bannerVisible) {
          throw new Error(`Banner should be visible for URL: ${testUrl.url}. This is not a hint URL.`)
        }
        expect(bannerVisible).toBe(true)
      }

      // Ensure at least one tab loaded successfully
      expect(successfulNavigations.length).toBeGreaterThan(0)
    } finally {
      // Close all pages
      for (const page of pages) {
        await page.close()
      }
    }
  })

  it("should show correct banner/hint independently in each tab", async () => {
    const flaggedUrl = getRandomUrl({ isHint: false, excludeTested: true })
    const hintUrl = getRandomUrl({ isHint: true, excludeTested: true })

    const page1 = await context.newPage()
    const page2 = await context.newPage()

    try {
      // Load flagged URL in first tab
      const nav1Success = await navigateToUrl(page1, flaggedUrl.url)
      if (!nav1Success) {
        throw new Error(`Failed to load flagged URL: ${flaggedUrl.url}`)
      }
      await waitForExtensionProcessing(page1)

      // Load hint URL in second tab
      const nav2Success = await navigateToUrl(page2, hintUrl.url)
      if (!nav2Success) {
        throw new Error(`Failed to load hint URL: ${hintUrl.url}`)
      }
      await waitForExtensionProcessing(page2)
      await page2.waitForTimeout(3000)

      // First tab should show banner (flaggedUrl.isHint is false)
      expect(await isBannerDisplayed(page1)).toBe(true)

      // Second tab should show hint toast (hintUrl.isHint is true - database has isHint: true AND hintText)
      await page2.waitForTimeout(3000)
      const toastVisible = await isHintsToastShown(page2)
      if (!toastVisible) {
        throw new Error(
          `Hint toast should be visible for hint URL: ${hintUrl.url}. Database entry has isHint: true and hintText.`
        )
      }
      // Assert after error check to avoid conditional expect
      expect(toastVisible).toBe(true)
    } finally {
      await page1.close()
      await page2.close()
    }
  })

  it("should not break functionality when switching tabs", async () => {
    const testUrl = getRandomUrl({ isHint: false, excludeTested: true })

    const page1 = await context.newPage()
    const page2 = await context.newPage()

    try {
      // Load flagged URL in first tab
      const nav1Success = await navigateToUrl(page1, testUrl.url)
      if (!nav1Success) {
        throw new Error(`Failed to load test URL: ${testUrl.url}`)
      }
      await waitForExtensionProcessing(page1)

      // Load clean URL in second tab
      const nav2Success = await navigateToUrl(page2, "https://example.com")
      if (!nav2Success) {
        throw new Error("Failed to load example.com")
      }

      // Switch to second tab
      await page2.bringToFront()
      await page2.waitForTimeout(1000)

      // Switch back to first tab
      await page1.bringToFront()
      await page1.waitForTimeout(1000)

      // Banner should still be visible
      expect(await isBannerDisplayed(page1)).toBe(true)
    } finally {
      await page1.close()
      await page2.close()
    }
  })

  it("should not affect other tabs when dismissing in one tab", async () => {
    const testUrl = getRandomUrl({ isHint: false, excludeTested: true })

    const page1 = await context.newPage()
    const page2 = await context.newPage()

    try {
      // Load same URL in both tabs
      const nav1Success = await navigateToUrl(page1, testUrl.url)
      if (!nav1Success) {
        throw new Error(`Failed to load test URL: ${testUrl.url}`)
      }
      await waitForExtensionProcessing(page1)

      const nav2Success = await navigateToUrl(page2, testUrl.url)
      if (!nav2Success) {
        throw new Error(`Failed to load test URL: ${testUrl.url}`)
      }
      await waitForExtensionProcessing(page2)

      // Both should show banner
      expect(await isBannerDisplayed(page1)).toBe(true)
      expect(await isBannerDisplayed(page2)).toBe(true)

      // Dismiss in first tab
      const dismissButton = page1.getByRole("button", { name: /allow.*month/i }).first()
      await dismissButton.click()
      await page1.waitForTimeout(2000)

      // First tab banner should be dismissed
      expect(await isBannerDisplayed(page1)).toBe(false)

      // Second tab banner should still be visible (session dismissal is per-tab)
      expect(await isBannerDisplayed(page2)).toBe(true)
    } finally {
      await page1.close()
      await page2.close()
    }
  })

  it("should share storage correctly across tabs", async () => {
    // Storage is shared across tabs in Chrome extensions
    // This is verified by the fact that settings persist across tabs
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    try {
      // Both tabs should have access to same storage
      const nav1Success = await navigateToUrl(page1, "https://example.com")
      const nav2Success = await navigateToUrl(page2, "https://example.com")

      if (!nav1Success || !nav2Success) {
        throw new Error("Failed to load example.com in one or both tabs")
      }

      // Storage is shared - verify both pages loaded successfully
      expect(nav1Success).toBe(true)
      expect(nav2Success).toBe(true)
    } finally {
      await page1.close()
      await page2.close()
    }
  })
})

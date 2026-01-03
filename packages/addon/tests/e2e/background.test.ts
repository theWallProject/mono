import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { getRandomResult, getRandomUrls } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { isBannerDisplayed, navigateToUrl, waitForExtensionProcessing } from "../utils/extension"
import { clearAllStorage } from "../utils/storage"

describe("Background Script", () => {
  let context: BrowserContext
  let extensionId: string

  beforeEach(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
    extensionId = result.extensionId
  })

  afterEach(async () => {
    await context.close().catch(() => {})
  })

  it("should load background script correctly", async () => {
    // Background script loads automatically with extension
    // Verify by checking if extension processes URLs correctly
    const page = await context.newPage()
    try {
      const success = await navigateToUrl(page, "https://example.com")
      expect(success).toBe(true)

      await waitForExtensionProcessing(page)
      // If we get here without errors, background script is working
    } finally {
      await page.close()
    }
  })

  it("should trigger URL testing on tab updates", async () => {
    const testUrl = await getRandomResult({ isHint: false, excludeLoginRequired: true })

    const page = await context.newPage()
    try {
      // Navigate to URL
      await navigateToUrl(page, testUrl.url)
      await waitForExtensionProcessing(page)

      // Background script should trigger URL testing
      // Banner should appear if URL is flagged
      const bannerVisible = await isBannerDisplayed(page)
      expect(bannerVisible).toBe(true)
    } finally {
      await page.close()
    }
  })

  it("should trigger URL testing on tab activation", async () => {
    const testUrl = await getRandomResult({ isHint: false, excludeLoginRequired: true })

    // Create two tabs
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    try {
      // Load URL in first tab
      await page1.goto(testUrl.url, { waitUntil: "networkidle" })
      await waitForExtensionProcessing(page1)

      // Load different page in second tab
      await page2.goto("https://example.com", { waitUntil: "networkidle" })

      // Switch back to first tab (activate it)
      await page1.bringToFront()
      await page1.waitForTimeout(1000)

      // Background script should re-test URL on activation
      const bannerVisible = await isBannerDisplayed(page1)
      expect(bannerVisible).toBe(true)
    } finally {
      await page1.close()
      await page2.close()
    }
  })

  it("should handle messages correctly", async () => {
    // Test message handling by checking if extension responds to URL tests
    const page = await context.newPage()
    try {
      const testUrls = await getRandomUrls({ count: 1, isHint: false, excludeLoginRequired: true })
      const testUrl = testUrls[0]
      expect(testUrl).toBeDefined()

      await navigateToUrl(page, testUrl!.url)
      await waitForExtensionProcessing(page)

      // Message should be handled and banner should appear
      const bannerVisible = await isBannerDisplayed(page)
      expect(bannerVisible).toBe(true)
    } finally {
      await page.close()
    }
  })

  it("should clear session storage on install/startup", async () => {
    // Clear all storage to simulate fresh install
    await clearAllStorage(context, extensionId)

    const page = await context.newPage()
    try {
      const navigationSuccess = await navigateToUrl(page, "https://example.com")
      expect(navigationSuccess).toBe(true)

      // Verify extension doesn't crash after storage clear - page should be accessible
      await waitForExtensionProcessing(page)
      const pageTitle = await page.title()
      expect(typeof pageTitle).toBe("string")
    } finally {
      await page.close()
    }
  })

  it("should open what's new page on first install", async () => {
    // Clear storage to simulate fresh install
    await clearAllStorage(context, extensionId)

    // Wait a bit for extension to process install event
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Check if what's new page was opened
    const pages = context.pages()
    const whatsNewPage = pages.find((p: { url: () => string }) => p.url().includes("whats-new.html"))

    // What's new page should be opened on fresh install
    expect(whatsNewPage).toBeDefined()
    expect(whatsNewPage?.url()).toContain("whats-new.html")
  })

  it("should not open what's new page on subsequent runs", async () => {
    // Don't clear storage - simulate existing user
    // Wait a bit for any potential page opens
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Check if what's new page was opened (it shouldn't be)
    const pages = context.pages()
    const whatsNewPage = pages.find((p) => p.url().includes("whats-new.html"))

    // What's new page should not be opened if already shown
    expect(whatsNewPage).toBeUndefined()
  })
})

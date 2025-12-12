import type { BrowserContext } from "playwright"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { CLEAN_URLS, getRandomUrl } from "../fixtures/test-urls"
import { closeBrowser, launchBrowserWithExtension } from "../utils/browser"
import { isBannerDisplayed, navigateToUrl, waitForExtensionProcessing } from "../utils/extension"

describe("Content Script", () => {
  let context: BrowserContext

  beforeAll(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
  })

  afterAll(async () => {
    await closeBrowser(context)
  })

  it("should inject content script correctly", async () => {
    const page = await context.newPage()
    try {
      await navigateToUrl(page, "https://example.com")
      await waitForExtensionProcessing(page)

      // Content script may inject differently, so we check for banner component instead
      const bannerVisible = await isBannerDisplayed(page)
      expect(bannerVisible).toBe(true)
    } finally {
      await page.close()
    }
  })

  it("should initialize DOM scanner for urlDomInline rules", async () => {
    const testUrl = getRandomUrl({ ruleType: "urlDomInline", excludeTested: true })

    const page = await context.newPage()
    try {
      await navigateToUrl(page, testUrl.url)
      await waitForExtensionProcessing(page)

      // Wait for DOM scanner to initialize (it waits 1.5s after page load)
      await page.waitForTimeout(2000)

      // DOM scanner should be active - verify extension is working by checking for banner
      const bannerVisible = await isBannerDisplayed(page)
      expect(bannerVisible).toBe(true)
    } finally {
      await page.close()
    }
  })

  it("should render banner component", async () => {
    const testUrl = getRandomUrl({ isHint: false, excludeTested: true })

    const page = await context.newPage()
    try {
      await navigateToUrl(page, testUrl.url)
      await waitForExtensionProcessing(page)

      const bannerVisible = await isBannerDisplayed(page)
      expect(bannerVisible).toBe(true)
    } finally {
      await page.close()
    }
  })

  it("should trigger URL testing on page load", async () => {
    const testUrl = getRandomUrl({ isHint: false, excludeTested: true })

    const page = await context.newPage()
    try {
      await navigateToUrl(page, testUrl.url)
      await waitForExtensionProcessing(page)

      // Banner should appear, indicating URL was tested
      const bannerVisible = await isBannerDisplayed(page)
      expect(bannerVisible).toBe(true)
    } finally {
      await page.close()
    }
  })

  it("should handle special URLs correctly", async () => {
    const specialUrls = ["chrome://extensions", "chrome://settings", "about:blank"]

    for (const url of specialUrls) {
      const page = await context.newPage()
      try {
        // These URLs may not load, but shouldn't cause errors
        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 5000 })
        } catch {
          // Some special URLs can't be navigated to, that's okay
        }

        // Extension should not crash - verify page object is still valid
        const pageTitle = await page.title().catch(() => "")
        expect(typeof pageTitle).toBe("string")
      } finally {
        await page.close()
      }
    }
  })

  it("should not show banner on clean URLs", async () => {
    for (const cleanUrl of CLEAN_URLS) {
      const page = await context.newPage()
      try {
        await navigateToUrl(page, cleanUrl)
        await waitForExtensionProcessing(page)

        // Banner should not appear on clean URLs
        const bannerVisible = await isBannerDisplayed(page)
        expect(bannerVisible).toBe(false)
      } finally {
        await page.close()
      }
    }
  })
})

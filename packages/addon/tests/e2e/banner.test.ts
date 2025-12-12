import type { BrowserContext } from "playwright"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { getRandomUrl, getRandomUrls } from "../fixtures/test-urls"
import { closeBrowser, launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import { isBannerDisplayed, navigateToUrl, waitForExtensionProcessing } from "../utils/extension"

describe("Banner Display", () => {
  let context: BrowserContext

  beforeAll(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
  })

  afterAll(async () => {
    await closeBrowser(context)
  })

  it("should display banner on flagged URLs", async () => {
    // Get random flagged URLs (not hints)
    const testUrls = getRandomUrls({ count: 3, isHint: false, excludeTested: true })

    for (const testUrl of testUrls) {
      const page = await context.newPage()
      try {
        await navigateToUrl(page, testUrl.url)
        await waitForExtensionProcessing(page)

        const bannerVisible = await isBannerDisplayed(page)
        expect(bannerVisible).toBe(true)

        // Mark as tested
        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      } finally {
        await page.close()
      }
    }
  })

  it("should show correct company information", async () => {
    const testUrl = getRandomUrl({ isHint: false, excludeTested: true })

    const page = await context.newPage()
    try {
      await page.goto(testUrl.url, { waitUntil: "networkidle" })
      await waitForExtensionProcessing(page)

      // Banner should contain some text
      const banner = page.locator('[class*="container"]').first()
      expect(await banner.isVisible()).toBe(true)

      const bannerText = await banner.textContent()
      expect(bannerText).toBeTruthy()
      expect(bannerText?.length).toBeGreaterThan(0)
    } finally {
      await page.close()
    }
  })

  it("should have working share button on banner", async () => {
    const testUrl = getRandomUrl({ isHint: false, excludeTested: true })

    const page = await context.newPage()
    try {
      await page.goto(testUrl.url, { waitUntil: "networkidle" })
      await waitForExtensionProcessing(page)

      const shareButton = page.getByRole("button", { name: /share/i }).first()
      expect(await shareButton.isVisible()).toBe(true)
    } finally {
      await page.close()
    }
  })

  it("should dismiss banner on session dismiss", async () => {
    const testUrl = getRandomUrl({ isHint: false, excludeTested: true })

    const page = await context.newPage()
    try {
      await page.goto(testUrl.url, { waitUntil: "networkidle" })
      await waitForExtensionProcessing(page)

      // Banner should be visible initially
      expect(await isBannerDisplayed(page)).toBe(true)

      // Click dismiss button
      const dismissButton = page.getByRole("button", { name: /allow.*month/i }).first()
      await dismissButton.click()

      // Wait for banner to disappear
      await page.waitForTimeout(2000)

      // Banner should be dismissed
      expect(await isBannerDisplayed(page)).toBe(false)
    } finally {
      await page.close()
    }
  })

  it("should test with random URLs covering all rule types", async () => {
    const ruleTypes: Array<"urlOnly" | "urlDomFull" | "urlDomInline"> = ["urlOnly", "urlDomFull", "urlDomInline"]

    for (const ruleType of ruleTypes) {
      const testUrl = getRandomUrl({ ruleType, isHint: false, excludeTested: true })

      const page = await context.newPage()
      try {
        await navigateToUrl(page, testUrl.url)
        await waitForExtensionProcessing(page)

        // Banner should appear for flagged URLs
        const bannerVisible = await isBannerDisplayed(page)
        expect(bannerVisible).toBe(true)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      } finally {
        await page.close()
      }
    }
  })
})

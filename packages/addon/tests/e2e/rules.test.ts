import type { BrowserContext } from "playwright"
import { beforeEach, describe, expect, it } from "vitest"

import { getRandomUrls, getTestUrlWithConditions, type CategorizedUrl } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import {
  isBannerDisplayed,
  isHintsToastShown,
  navigateToUrl,
  waitForExtensionProcessing,
  waitUntilHintShown
} from "../utils/extension"

describe("Rule Types", (): void => {
  let context: BrowserContext

  beforeEach(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
  })

  it("should handle urlOnly rules correctly", async () => {
    // urlOnly rules should ALWAYS show banners, never hints
    const targetCount = 5
    let successCount = 0
    let attempts = 0
    const maxAttempts = targetCount * 3 // Try up to 3x the target count to account for failures

    while (successCount < targetCount && attempts < maxAttempts) {
      attempts++
      const testUrl = getTestUrlWithConditions({
        ruleType: "urlOnly",
        expectBanner: true
      })

      const page = await context.newPage()
      try {
        console.log(
          `[TEST] Testing urlOnly rule with URL: ${testUrl.url} (attempt ${attempts}/${maxAttempts}, success: ${successCount}/${targetCount})`
        )
        console.log(
          `[TEST] URL details: ruleType=${testUrl.ruleType}, isHint=${testUrl.isHint}, reasons=${testUrl.reasons.join(",")}`
        )

        const loaded = await navigateToUrl(page, testUrl.url)
        expect(loaded).toBe(true)

        await waitForExtensionProcessing(page)

        // urlOnly rules should ALWAYS show banner, never hints
        console.log(`[TEST] Checking for banner after processing...`)
        const bannerVisible = await isBannerDisplayed(page)
        console.log(`[TEST] Banner visible result: ${bannerVisible}`)
        expect(bannerVisible).toBe(true)

        expect(bannerVisible).toBe(true)

        // Verify no hint toast appears for urlOnly rules
        const toastVisible = await isHintsToastShown(page)
        expect(toastVisible).toBe(false)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
        successCount++
        console.log(`[TEST] Success! (${successCount}/${targetCount})`)
      } finally {
        await page.close()
      }
    }

    // Fail fast if we didn't reach target count
    expect(successCount).toBeGreaterThanOrEqual(targetCount)
  })

  it("should handle urlDomFull rules correctly", async () => {
    // urlDomFull rules extract URL from DOM and test it
    // Test with URLs that should show banners
    const testUrls: Array<CategorizedUrl | null> = []
    for (let i = 0; i < 3; i++) {
      const url = getTestUrlWithConditions({
        ruleType: "urlDomFull",
        expectBanner: true
      })

      testUrls.push(url)
    }

    for (const testUrl of testUrls) {
      expect(testUrl).toBeDefined()

      const page = await context.newPage()
      try {
        const loaded = await navigateToUrl(page, testUrl!.url)
        expect(loaded).toBe(true)
        await waitForExtensionProcessing(page)

        // urlDomFull rules should show banner when extracted URL is flagged
        const bannerVisible = await isBannerDisplayed(page)
        expect(bannerVisible).toBe(true)

        markUrlAsTested(testUrl!.url, testUrl!.ruleType, testUrl!.reasons)
      } finally {
        await page.close()
      }
    }
  })

  it("should handle urlDomInline rules correctly", async () => {
    // urlDomInline rules trigger DOM scanning - test with URLs that should show banners
    const testUrls: CategorizedUrl[] = []
    for (let i = 0; i < 3; i++) {
      const url = getTestUrlWithConditions({
        ruleType: "urlDomInline",
        expectBanner: true
      })
      testUrls.push(url)
    }

    for (const testUrl of testUrls) {
      const page = await context.newPage()
      try {
        const loaded = await navigateToUrl(page, testUrl.url)
        expect(loaded).toBe(true)
        await waitForExtensionProcessing(page)

        // urlDomInline rules trigger DOM scanning
        // Wait for scanner to initialize (1.5s delay)
        await page.waitForTimeout(2000)

        // urlDomInline rules should show banner when scanned URLs are flagged
        const bannerVisible = await isBannerDisplayed(page)
        expect(bannerVisible).toBe(true)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      } finally {
        await page.close()
      }
    }
  })

  it("should handle special .il domains correctly", async () => {
    // Get URLs that end with .il
    const testUrls = getRandomUrls({ count: 3, reason: "u", excludeLoginRequired: true })

    for (const testUrl of testUrls) {
      expect(testUrl.url.includes(".il")).toBe(true)

      const page = await context.newPage()
      try {
        const loaded = await navigateToUrl(page, testUrl.url)
        expect(loaded).toBe(true)
        await waitForExtensionProcessing(page)

        // .il domains should show hints
        await page.waitForTimeout(3000)
        const toastVisible = await waitUntilHintShown(page)
        expect(toastVisible).toBe(true)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      } finally {
        await page.close()
      }
    }
  })

  it("should handle social media rules correctly", async () => {
    // Social media URLs should show banners (not hints)
    // Note: Many social media URLs require login, so we try multiple until we get enough successes
    const targetCount = 5
    let successCount = 0
    let attempts = 0
    const maxAttempts = targetCount * 3

    while (successCount < targetCount && attempts < maxAttempts) {
      attempts++
      const testUrls = getRandomUrls({
        count: 1,
        hasSocialMedia: true,
        isHint: false,

        excludeLoginRequired: true
      })

      if (testUrls.length === 0) {
        break
      }

      const testUrl = testUrls[0]
      expect(testUrl).toBeDefined()
      const page = await context.newPage()
      try {
        const loaded = await navigateToUrl(page, testUrl!.url)
        expect(loaded).toBe(true)

        await waitForExtensionProcessing(page)

        // Social media URLs should show banners
        const bannerVisible = await isBannerDisplayed(page)
        expect(bannerVisible).toBe(true)

        // Verify no hint toast appears
        const toastVisible = await isHintsToastShown(page)
        expect(toastVisible).toBe(false)

        markUrlAsTested(testUrl!.url, testUrl!.ruleType, testUrl!.reasons)
        successCount++
      } finally {
        await page.close()
      }
    }

    // Fail fast if we didn't reach target count
    expect(successCount).toBeGreaterThanOrEqual(targetCount)
  })

  it("should ensure coverage of all rule types over multiple runs", async () => {
    const ruleTypes: Array<"urlOnly" | "urlDomFull" | "urlDomInline"> = ["urlOnly", "urlDomFull", "urlDomInline"]

    for (const ruleType of ruleTypes) {
      // All rule types should show banners when configured correctly
      const testUrl = getTestUrlWithConditions({
        ruleType,
        expectBanner: true
      })

      const page = await context.newPage()
      try {
        const loaded = await navigateToUrl(page, testUrl.url)
        expect(loaded).toBe(true)
        await waitForExtensionProcessing(page)

        // All rule types should show banners when configured correctly
        const bannerVisible = await isBannerDisplayed(page)
        expect(bannerVisible).toBe(true)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      } finally {
        await page.close()
      }
    }
  })
})

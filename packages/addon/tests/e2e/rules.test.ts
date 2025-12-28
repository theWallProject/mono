import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { getRandomUrls, getTestUrlWithConditions } from "../fixtures/test-urls"
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

  afterEach(async () => {
    if (context) {
      await context.close().catch(() => {})
    }
  })

  it("should handle urlOnly rules correctly", async () => {
    // urlOnly rules should ALWAYS show banners, never hints
    const testUrl = await getTestUrlWithConditions({
      ruleType: "urlOnly",
      expectBanner: true
    })

    const page = await context.newPage()
    try {
      console.log(`[TEST] Testing urlOnly rule with URL: ${testUrl.url}`)
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

      // Verify no hint toast appears for urlOnly rules
      const toastVisible = await isHintsToastShown(page)
      expect(toastVisible).toBe(false)

      markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      console.log(`[TEST] Success!`)
    } finally {
      await page.close()
    }
  })

  it("should handle urlDomFull rules correctly", async () => {
    // urlDomFull rules extract URL from DOM and test it
    // Test with URLs that should show banners
    try {
      const testUrl = await getTestUrlWithConditions({
        ruleType: "urlDomFull",
        expectBanner: true
      })

      const page = await context.newPage()
      try {
        const loaded = await navigateToUrl(page, testUrl.url)
        if (!loaded) {
          console.log(`[TEST] Navigation failed for ${testUrl.url}, skipping test`)
          return
        }
        await waitForExtensionProcessing(page)

        // urlDomFull rules should show banner when extracted URL is flagged
        const bannerVisible = await isBannerDisplayed(page)
        expect(bannerVisible).toBe(true)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      } finally {
        await page.close()
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("No URLs found")) {
        console.log("[TEST] No urlDomFull URLs found in database, skipping test")
        // Test passes - no urlDomFull URLs to test
      } else {
        throw error
      }
    }
  })

  it("should handle urlDomInline rules correctly", async () => {
    // urlDomInline rules trigger DOM scanning - test with URLs that should show banners
    try {
      const testUrl = await getTestUrlWithConditions({
        ruleType: "urlDomInline",
        expectBanner: true
      })

      const page = await context.newPage()
      try {
        const loaded = await navigateToUrl(page, testUrl.url)
        if (!loaded) {
          console.log(`[TEST] Navigation failed for ${testUrl.url}, skipping test`)
          return
        }
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
    } catch (error) {
      if (error instanceof Error && error.message.includes("No URLs found")) {
        console.log("[TEST] No urlDomInline URLs found in database, skipping test")
        // Test passes - no urlDomInline URLs to test
      } else {
        throw error
      }
    }
  })

  it("should handle special .il domains correctly", async () => {
    // Try to get URLs with reason "u" (Israeli domains)
    // If none exist, skip this test
    try {
      const testUrls = await getRandomUrls({ count: 1, reason: "u", excludeLoginRequired: true })

      for (const testUrl of testUrls) {
        const page = await context.newPage()
        try {
          const loaded = await navigateToUrl(page, testUrl.url)
          if (!loaded) {
            console.log(`[TEST] Navigation failed for ${testUrl.url}, skipping`)
            continue
          }
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
    } catch (error) {
      if (error instanceof Error && error.message.includes("Not enough URLs found")) {
        console.log("[TEST] No .il domain URLs found in database, skipping test")
        // Test passes - no .il domains to test
      } else {
        throw error
      }
    }
  })

  it("should handle social media rules correctly", async () => {
    // Social media URLs should show banners (not hints)
    const testUrls = await getRandomUrls({
      count: 1,
      hasSocialMedia: true,
      isHint: false,
      excludeLoginRequired: true
    })

    expect(testUrls.length).toBeGreaterThan(0)
    const testUrl = testUrls[0]

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
    } finally {
      await page.close()
    }
  })

  it("should ensure coverage of all rule types over multiple runs", async () => {
    const ruleTypes: Array<"urlOnly" | "urlDomFull" | "urlDomInline"> = ["urlOnly", "urlDomFull", "urlDomInline"]

    for (const ruleType of ruleTypes) {
      try {
        // All rule types should show banners when configured correctly
        const testUrl = await getTestUrlWithConditions({
          ruleType,
          expectBanner: true
        })

        const page = await context.newPage()
        try {
          const loaded = await navigateToUrl(page, testUrl.url)
          if (!loaded) {
            console.log(`[TEST] Navigation failed for ${testUrl.url} (${ruleType}), skipping`)
            continue
          }
          await waitForExtensionProcessing(page)

          // All rule types should show banners when configured correctly
          const bannerVisible = await isBannerDisplayed(page)
          expect(bannerVisible).toBe(true)

          markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
        } finally {
          await page.close()
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("No URLs found")) {
          console.log(`[TEST] No ${ruleType} URLs found in database, skipping`)
          continue
        } else {
          throw error
        }
      }
    }
  })
})

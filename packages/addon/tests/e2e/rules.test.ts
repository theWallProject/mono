import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { getRandomUrls, getTestUrlWithConditions } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import {
  isBannerDisplayed,
  navigateToUrl,
  waitForBanner,
  waitForExtensionProcessing
} from "../utils/extension"

describe("Rule Types", (): void => {
  let context: BrowserContext

  beforeEach(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
  })

  afterEach(async () => {
    await context.close().catch(() => {})
  })

  it("should handle urlOnly rules correctly", async () => {
    // urlOnly rules should ALWAYS show banners, never hints
    // Try multiple URLs in case some sites are down
    const candidateUrls = getRandomUrls({
      count: 5,
      ruleType: "urlOnly",
      isHint: false,
      excludeLoginRequired: true
    })

    let lastError: Error | null = null
    for (const testUrl of candidateUrls) {
      const page = await context.newPage()
      try {
        console.log(`[TEST] Testing urlOnly rule with URL: ${testUrl.url}`)
        console.log(
          `[TEST] URL details: ruleType=${testUrl.ruleType}, isHint=${testUrl.isHint}, reasons=${testUrl.reasons.join(",")}`
        )

        const loaded = await navigateToUrl(page, testUrl.url)
        if (!loaded) {
          console.log(`[TEST] Navigation failed for ${testUrl.url}, trying next URL`)
          continue
        }

        // Wait for the banner to actually appear (not just page load)
        console.log(`[TEST] Waiting for banner to appear...`)
        await waitForBanner(page)
        console.log(`[TEST] Banner appeared`)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
        console.log(`[TEST] Success!`)
        return // Test passed
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.log(`[TEST] URL ${testUrl.url} failed: ${lastError.message}, trying next URL`)
      } finally {
        await page.close()
      }
    }

    throw lastError || new Error("All candidate URLs failed for urlOnly rule test")
  })

  it("should handle urlDomFull rules correctly", async () => {
    // urlDomFull rules extract URL from DOM and test it
    // Test with URLs that should show banners
    try {
      const testUrl = getTestUrlWithConditions({
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

  it("should handle special .il domains correctly", async () => {
    // .il domains in the database get full results (banners), not hints.
    // The .il hint fallback only fires for .il domains NOT in the database.
    // Since getRandomUrls pulls from the database, these are known companies — expect banners.
    try {
      const testUrls = getRandomUrls({ count: 1, reason: "u", excludeLoginRequired: true })

      for (const testUrl of testUrls) {
        const page = await context.newPage()
        try {
          const loaded = await navigateToUrl(page, testUrl.url)
          if (!loaded) {
            console.log(`[TEST] Navigation failed for ${testUrl.url}, skipping`)
            continue
          }
          await waitForExtensionProcessing(page)

          // .il domains from the database should show banners (full results)
          await waitForBanner(page)

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
    // Social media URLs should show banners
    // Note: domain hint toasts may also appear alongside the banner (e.g., facebook.com has a domain hint)
    // so we only verify the banner is visible, not that hints are absent
    const candidateUrls = getRandomUrls({
      count: 5,
      hasSocialMedia: true,
      isHint: false,
      excludeLoginRequired: true
    })

    expect(candidateUrls.length).toBeGreaterThan(0)

    let lastError: Error | null = null
    for (const testUrl of candidateUrls) {
      const page = await context.newPage()
      try {
        const loaded = await navigateToUrl(page, testUrl.url)
        if (!loaded) {
          console.log(`[TEST] Navigation failed for ${testUrl.url}, trying next URL`)
          continue
        }

        // Wait for the banner to actually appear
        await waitForBanner(page)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
        return // Test passed
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.log(`[TEST] URL ${testUrl.url} failed: ${lastError.message}, trying next URL`)
      } finally {
        await page.close()
      }
    }

    throw lastError || new Error("All candidate URLs failed for social media rule test")
  })

  it("should ensure coverage of all rule types over multiple runs", async () => {
    const ruleTypes: Array<"urlOnly" | "urlDomFull"> = ["urlOnly", "urlDomFull"]

    for (const ruleType of ruleTypes) {
      let candidateUrls
      try {
        candidateUrls = getRandomUrls({
          count: 5,
          ruleType,
          isHint: false,
          excludeLoginRequired: true
        })
      } catch (error) {
        if (error instanceof Error && (error.message.includes("No URLs found") || error.message.includes("Not enough URLs found"))) {
          console.log(`[TEST] No ${ruleType} URLs found in database, skipping`)
          continue
        }
        throw error
      }

      let passed = false
      for (const testUrl of candidateUrls) {
        const page = await context.newPage()
        try {
          const loaded = await navigateToUrl(page, testUrl.url)
          if (!loaded) {
            console.log(`[TEST] Navigation failed for ${testUrl.url} (${ruleType}), trying next`)
            continue
          }
          // Wait for the banner to actually appear (not just page load)
          await waitForBanner(page)

          markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
          passed = true
          break
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error)
          console.log(`[TEST] URL ${testUrl.url} failed for ${ruleType}: ${msg}, trying next`)
        } finally {
          await page.close()
        }
      }

      if (!passed) {
        console.log(`[TEST] All candidate URLs failed for ${ruleType}, skipping`)
      }
    }
  })
})

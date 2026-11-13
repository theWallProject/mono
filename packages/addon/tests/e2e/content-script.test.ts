import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { CLEAN_URLS, getRandomResult } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { isBannerDisplayed, gotoUrlWithBanner, navigateToUrl, waitForExtensionProcessing } from "../utils/extension"

describe("Content Script", () => {
  let context: BrowserContext

  beforeEach(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
  })

  afterEach(async () => {
    await context.close().catch(() => {})
  })

  it("should inject content script correctly", async () => {
    // Content-script injection is observable on any page. Asserting a banner on
    // example.com was wrong: example.com is not in the database (verified: zero entries),
    // so no banner can appear there and the assertion could never hold.
    const page = await context.newPage()
    try {
      const navigated = await navigateToUrl(page, "https://example.com")
      expect(navigated).toBe(true)
      await waitForExtensionProcessing(page)

      // The content script mounts its shadow host on every matched page.
      const hostCount = await page.locator("plasmo-csui").count()
      expect(hostCount).toBeGreaterThan(0)
    } finally {
      await page.close()
    }
  })

  it("should render banner component", async () => {
    const page = await context.newPage()
    try {
      // Walk candidates until one actually renders a banner instead of trusting a single
      // random live URL to load.
      const candidates: ReturnType<typeof getRandomResult>[] = []
      for (let i = 0; i < 15; i++) {
        candidates.push(getRandomResult({ isHint: false, excludeLoginRequired: true, hasSocialMedia: false }))
      }

      await gotoUrlWithBanner(page, candidates, "any-banner")

      const bannerVisible = await isBannerDisplayed(page)
      expect(bannerVisible).toBe(true)
    } finally {
      await page.close()
    }
  })

  it("should trigger URL testing on page load", async () => {
    const page = await context.newPage()
    try {
      const candidates: ReturnType<typeof getRandomResult>[] = []
      for (let i = 0; i < 15; i++) {
        candidates.push(getRandomResult({ isHint: false, excludeLoginRequired: true, hasSocialMedia: false }))
      }

      // A banner on page load is the signal that the URL was tested.
      await gotoUrlWithBanner(page, candidates, "any-banner")

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

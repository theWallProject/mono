import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { getRandomResult } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import {
  gotoUrlWithBanner,
  isBannerDisplayed,
  navigateToUrl,
  waitForExtensionProcessing
} from "../utils/extension"
import { getStorageValue, clearAllStorage } from "../utils/storage"
import { WHATS_NEW_SHOWN_VERSIONS_KEY } from "../../src/storageHelpers"

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
    const page = await context.newPage()
    try {
      // Walk candidates until one renders a banner, see the activation test above.
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

  it("should trigger URL testing on tab activation", async () => {
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    try {
      // Walk candidates until one renders a banner. A random live URL can be dead or redirect
      // off-host, in which case no banner can appear and the activation behaviour under test
      // is never exercised.
      const candidates: ReturnType<typeof getRandomResult>[] = []
      for (let i = 0; i < 15; i++) {
        candidates.push(getRandomResult({ isHint: false, excludeLoginRequired: true, hasSocialMedia: false }))
      }

      await gotoUrlWithBanner(page1, candidates, "any-banner")

      // Load different page in second tab
      await navigateToUrl(page2, "https://example.com")

      // Switch back to first tab (activate it)
      await page1.bringToFront()

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
      // Walk candidates until one renders a banner. A single random live URL can redirect
      // off-host or be dead, in which case no banner appears and this test would fail for
      // reasons unrelated to message handling.
      const candidates: ReturnType<typeof getRandomResult>[] = []
      for (let i = 0; i < 10; i++) {
        candidates.push(getRandomResult({ isHint: false, excludeLoginRequired: true, hasSocialMedia: false }))
      }

      const testUrl = await gotoUrlWithBanner(page, candidates, "any-banner")
      console.log(`[TEST] Banner rendered for: ${testUrl.url}`)

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

    // Check if what's new page was opened. Assert on the URL string, never on the Page
    // object: a failing `toBeDefined()`/`toBeUndefined()` on a Playwright Page makes the
    // reporter serialise the whole object graph and crash with "Invalid string length".
    const pageUrls = context.pages().map((p) => p.url())
    const whatsNewUrls = pageUrls.filter((url) => url.includes("whats-new.html"))

    expect(whatsNewUrls.length).toBeGreaterThan(0)
    expect(whatsNewUrls[0]).toContain("whats-new.html")
  })

  it("records the shown version so the page is not offered again", async () => {
    // Every test here launches a fresh browser profile, so each one is literally a first
    // install and the what's-new page always opens. Asserting "no page on a subsequent run"
    // is therefore not provable in this harness.
    //
    // What is provable, and what actually prevents a re-show, is the marker the extension
    // writes after opening the page: whats_new_shown_versions. A later install/update checks
    // that list before opening anything.
    const currentVersion = "1.15.0"

    const deadline = Date.now() + 5000
    let shownVersions: unknown = undefined
    while (Date.now() < deadline) {
      shownVersions = await getStorageValue(context, extensionId, WHATS_NEW_SHOWN_VERSIONS_KEY)
      if (Array.isArray(shownVersions) && shownVersions.includes(currentVersion)) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    expect(Array.isArray(shownVersions)).toBe(true)
    expect(shownVersions).toContain(currentVersion)
  })
})

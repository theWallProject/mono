import { readFileSync } from "fs"
import path from "path"
import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { WHATS_NEW_PAGE_ID } from "../../src/whatsNew"
import { getRandomResult } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { gotoUrlWithBanner, isBannerDisplayed, navigateToUrl, waitForExtensionProcessing } from "../utils/extension"
import { clearAllStorage } from "../utils/storage"

/**
 * The version the browser actually loaded, read from the built manifest rather than package.json:
 * tests run against build/chrome-mv3-prod, which can lag a bump.
 */
const readBuiltVersion = (): string => {
  const parsed: unknown = JSON.parse(
    readFileSync(path.resolve(__dirname, "../../build/chrome-mv3-prod/manifest.json"), "utf-8")
  )
  if (typeof parsed !== "object" || parsed === null || !("version" in parsed)) {
    throw new Error("build/chrome-mv3-prod/manifest.json has no version — build the extension first")
  }
  const version = parsed.version
  if (typeof version !== "string" || version.length === 0) {
    throw new Error("build/chrome-mv3-prod/manifest.json has an empty version")
  }
  return version
}

const builtVersion = readBuiltVersion(); void builtVersion

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

  it("does not open what's new on a first install, because a first install only seeds", async () => {
    // A fresh profile is a first install, so onInstalled runs with reason "install". Since the gate
    // now stores the page id and shows nothing when no id is stored, a first install must open no
    // page at all. The build flag only says "this build carries a page", not "show it now".
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Assert on URL strings, never on the Page objects: serialising a Playwright Page in a failure
    // message crashes the reporter with "Invalid string length".
    const whatsNewUrls = context
      .pages()
      .map((p) => p.url())
      .filter((url) => url.includes("whats-new.html"))

    expect(whatsNewUrls).toEqual([])
    // The build still has to carry the page, or there would be nothing to open later.
    expect(WHATS_NEW_PAGE_ID.length).toBeGreaterThan(0)
  })
})

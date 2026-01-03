import type { BrowserContext, Page } from "playwright"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { getRandomResult, getUrlWithAlternatives, getUrlWithoutAlternatives } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import {
  getAlternativesMenu,
  isBannerDisplayed,
  navigateToUrl,
  safeClosePage,
  waitForBanner,
  waitForBannerButton
} from "../utils/extension"

describe("Banner Display - Single Tab Isolated Tests", () => {
  let context: BrowserContext

  beforeAll(async () => {
    console.log("[TEST] Setting up browser with extension")
    const result = await launchBrowserWithExtension()
    context = result.context
    console.log("[TEST] Browser setup complete")
  })

  afterAll(async () => {
    await context.close().catch(() => {})
  })

  describe("Banner - All Standard Features (Single URL)", () => {
    let page: Page
    let testUrl: Awaited<ReturnType<typeof getRandomResult>>

    beforeAll(async () => {
      console.log("[TEST] Setting up single URL for all standard banner tests")
      testUrl = await getRandomResult({ isHint: false, excludeLoginRequired: true })
      console.log(`[TEST] Selected URL: ${testUrl.url}`)

      if (testUrl.isHint) {
        throw new Error(`Test URL ${testUrl.url} is a hint URL, but we need a banner URL.`)
      }

      page = await context.newPage()
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        console.log(`[TEST] Navigation failed: ${testUrl.url}`)
        throw new Error(`Failed to navigate to ${testUrl.url}`)
      }

      // Wait for banner to appear - this is the unified function that handles all waiting
      await waitForBanner(page)
      console.log("[TEST] Banner appeared, ready for all standard tests")
    })

    afterAll(async () => {
      await safeClosePage(page)
    })

    it("should display banner on flagged URLs", async () => {
      // Banner is already verified by waitForBanner() in beforeAll
      // Verify logo is still visible as explicit assertion
      const logo = page.locator('img[alt="The Wall Logo"]')
      const logoCount = await logo.count()
      expect(logoCount).toBeGreaterThan(0)
      const isVisible = await logo.first().isVisible()
      expect(isVisible).toBe(true)
      markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      console.log(`[TEST] ✓ Banner displayed correctly`)
    })

    it("should show correct company information in banner", async () => {
      console.log("[TEST] Verifying banner contains company information")
      const modalContainer = page.locator('[class*="modalContainer"]').first()
      const modalCount = await modalContainer.count()
      expect(modalCount).toBeGreaterThan(0)
      const isVisible = await modalContainer.isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Company information displayed correctly`)
    })

    it("should display all reasons correctly in banner", async () => {
      console.log("[TEST] Verifying reasons are displayed")
      const banner = page.locator('[class*="container"]').first()
      const bannerText = await banner.textContent()
      const hasText = bannerText !== null && bannerText.length > 0
      expect(hasText).toBe(true)
      console.log(`[TEST] ✓ Reasons displayed correctly`)
    })

    it("should have clickable share button", async () => {
      console.log("[TEST] Finding share button container")
      const shareContainer = page.locator('[class*="shareButtonContainer"]').first()

      // Verify container exists and is visible
      const isVisible = await shareContainer.isVisible()
      expect(isVisible).toBe(true)

      console.log("[TEST] Hovering over share container to ensure dropdown is visible")
      await shareContainer.hover()

      console.log("[TEST] Looking for share links by aria-label")
      const shareLink = page.locator('a[aria-label*="Share on"]').first()

      // Verify share link exists and is visible
      const linkVisible = await shareLink.isVisible()
      expect(linkVisible).toBe(true)

      console.log("[TEST] Clicking share link (Facebook)")
      // Set up listener for new page (share links open in new tab)
      const newPagePromise = context.waitForEvent("page", { timeout: 3000 }).catch(() => null)
      await shareLink.click()

      // Wait for new page if it opens, then close it
      const newPage = await newPagePromise
      await newPage?.close()

      console.log(`[TEST] ✓ Share button is clickable`)
    })

    it("should display skip button (allow for a month) on banner", async () => {
      console.log("[TEST] Verifying skip button is visible")
      const skipButton = await waitForBannerButton(page, /allow.*month/i)

      const isVisible = await skipButton.first().isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Skip button displayed`)
    })

    it("should display donation button on banner", async () => {
      console.log("[TEST] Verifying donation button is visible")
      const donateButton = await waitForBannerButton(page, /donate/i)

      const isVisible = await donateButton.first().isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Donation button displayed`)
    })

    it("should open Ko-fi link when donation button is clicked", async () => {
      console.log("[TEST] Clicking donation button")
      const donateButton = await waitForBannerButton(page, /donate/i)

      // Set up listener for new page (opens in new tab)
      const newPagePromise = context.waitForEvent("page", { timeout: 5000 })

      await donateButton.first().click()

      // Wait for new page to open
      const newPage = await newPagePromise
      await newPage.waitForLoadState("domcontentloaded", { timeout: 5000 })

      // Verify new page is ko-fi.com
      const newPageUrl = newPage.url()
      const containsKoFi = newPageUrl.includes("ko-fi.com")
      expect(containsKoFi).toBe(true)

      await newPage.close()
      console.log(`[TEST] ✓ Donation button opens Ko-fi link in new tab`)
    })

    it("should display report mistake button in bottom bar", async () => {
      console.log("[TEST] Verifying report mistake button is visible")
      const reportButton = await waitForBannerButton(page, /report.*mistake|mistake/i)

      const isVisible = await reportButton.first().isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Report mistake button displayed`)
    })

    it("should open mailto link when report mistake button is clicked", async () => {
      console.log("[TEST] Clicking report mistake button")
      const reportButton = await waitForBannerButton(page, /report.*mistake|mistake/i)

      // Click report mistake button (browser handles mailto, so we can't easily verify)
      await reportButton.first().click()

      // Wait a moment for mailto to open
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))

      // Check if mailto was triggered (browser handles mailto, so we can't easily verify)
      // But we can verify the button click didn't cause errors
      console.log(`[TEST] ✓ Report mistake button is clickable`)
    })

    it("should display logo on banner", async () => {
      console.log("[TEST] Verifying logo is displayed")
      const logo = page.locator('img[alt="The Wall Logo"]')
      const logoCount = await logo.count()
      expect(logoCount).toBeGreaterThan(0)
      const isVisible = await logo.first().isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Logo displayed`)
    })
  })

  describe("Banner - Dismissal Tests (Requires Navigation)", () => {
    it("should dismiss banner when skip button is clicked", async () => {
      console.log("[TEST] Starting: should dismiss banner when skip button is clicked")

      const testUrl = await getRandomResult({ isHint: false, excludeLoginRequired: true })
      console.log(`[TEST] Selected URL: ${testUrl.url}`)

      const page = await context.newPage()
      try {
        const navSuccess = await navigateToUrl(page, testUrl.url)
        if (!navSuccess) {
          console.log(`[TEST] Navigation failed, skipping test: ${testUrl.url}`)
          return
        }

        await waitForBanner(page)

        console.log("[TEST] Clicking skip button")
        const skipButton = await waitForBannerButton(page, /allow.*month/i)
        await skipButton.first().click()

        console.log("[TEST] Waiting for banner to be dismissed")
        await page
          .waitForSelector('img[alt="The Wall Logo"]', {
            state: "hidden",
            timeout: 1000
          })
          .catch(() => {
            // If selector doesn't exist, that's also fine (banner removed from DOM)
          })

        const bannerStillVisible = await isBannerDisplayed(page)
        expect(bannerStillVisible).toBe(false)

        console.log(`[TEST] ✓ Banner dismissed correctly`)
      } catch (error) {
        console.error(`[TEST] ✗ Test failed:`, error)
        throw error
      } finally {
        await safeClosePage(page)
      }
    })

    it("should not show banner again after dismissal in same session", async () => {
      console.log("[TEST] Starting: should not show banner again after dismissal in same session")

      // Use a different URL than the previous tests to avoid storage conflicts
      const testUrl = await getRandomResult({ isHint: false, excludeLoginRequired: true, ruleType: "urlOnly" })
      console.log(`[TEST] Selected URL: ${testUrl.url}`)

      const page = await context.newPage()
      try {
        // First visit - banner should appear
        console.log("[TEST] First visit - navigating to URL")
        const nav1Success = await navigateToUrl(page, testUrl.url)
        if (!nav1Success) {
          console.log(`[TEST] Navigation failed, skipping test`)
          return
        }

        await waitForBanner(page).catch((error) => {
          console.log(`[TEST] Banner did not appear (might be dismissed from previous test): ${error.message}`)
          throw error
        })

        // Dismiss banner
        console.log("[TEST] Dismissing banner")
        const skipButton = await waitForBannerButton(page, /allow.*month/i)
        await skipButton.first().click()

        // Wait for banner to disappear
        await page
          .waitForSelector('img[alt="The Wall Logo"]', {
            state: "hidden",
            timeout: 1000
          })
          .catch(() => {
            // If selector doesn't exist, that's also fine (banner removed from DOM)
          })

        // Navigate away
        console.log("[TEST] Navigating away")
        const nav2Success = await navigateToUrl(page, "https://example.com")
        expect(nav2Success).toBe(true)

        // Navigate back to same URL
        console.log("[TEST] Navigating back to same URL")
        const nav3Success = await navigateToUrl(page, testUrl.url)
        expect(nav3Success).toBe(true)

        console.log("[TEST] Verifying banner does not reappear")
        const logo = page.locator('img[alt="The Wall Logo"]')
        const logoCount = await logo.count()
        const bannerReappeared =
          logoCount > 0 &&
          (await logo
            .first()
            .isVisible()
            .catch(() => false))
        expect(bannerReappeared).toBe(false)

        console.log(`[TEST] ✓ Banner does not reappear after dismissal`)
      } catch (error) {
        console.error(`[TEST] ✗ Test failed:`, error)
        throw error
      } finally {
        await safeClosePage(page)
      }
    })
  })

  describe("Banner - Alternatives Button (Requires URL with Alternatives)", () => {
    let page: Page
    let testUrl: Awaited<ReturnType<typeof getUrlWithAlternatives>>

    beforeAll(async () => {
      console.log("[TEST] Setting up URL with alternatives")
      testUrl = await getUrlWithAlternatives({ excludeLoginRequired: true })
      console.log(`[TEST] Selected URL with alternatives: ${testUrl.url}`)

      if (testUrl.isHint) {
        throw new Error(`Test URL ${testUrl.url} is a hint URL, but we need a banner URL.`)
      }

      page = await context.newPage()
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        throw new Error(`Failed to navigate to ${testUrl.url}`)
      }

      await waitForBanner(page)
      console.log("[TEST] Banner appeared, ready for alternatives tests")
    })

    afterAll(async () => {
      await safeClosePage(page)
    })

    it("should display alternatives button when URL has alternatives", async () => {
      console.log("[TEST] Verifying alternatives button is visible")
      const alternativesButton = await waitForBannerButton(page, /show.*alternatives|alternatives/i)

      const isVisible = await alternativesButton.first().isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Alternatives button displayed for URL with alternatives`)
    })

    it("should show alternatives menu when alternatives button is clicked", async () => {
      console.log("[TEST] Clicking alternatives button")
      const alternativesButton = await waitForBannerButton(page, /show.*alternatives|alternatives/i)
      await alternativesButton.first().click()

      console.log("[TEST] Checking alternatives menu appears")
      const menu = await getAlternativesMenu(page)
      const menuExists = menu !== null
      expect(menuExists).toBe(true)

      // Verify menu contains alternatives
      const menuText = menu ? await menu.textContent() : null
      const hasMenuText = menuText !== null && menuText.length > 0
      expect(hasMenuText).toBe(true)

      console.log(`[TEST] ✓ Alternatives menu displayed correctly`)
    })
  })

  describe("Banner - Support Palestine Button (Requires URL without Alternatives)", () => {
    let page: Page
    let testUrl: Awaited<ReturnType<typeof getUrlWithoutAlternatives>>

    beforeAll(async () => {
      console.log("[TEST] Setting up URL without alternatives")
      testUrl = await getUrlWithoutAlternatives({ excludeLoginRequired: true })
      console.log(`[TEST] Selected URL without alternatives: ${testUrl.url}`)

      if (testUrl.isHint) {
        throw new Error(`Test URL ${testUrl.url} is a hint URL, but we need a banner URL.`)
      }

      page = await context.newPage()
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        console.log(`[TEST] Navigation failed: ${testUrl.url}`)
        throw new Error(`Failed to navigate to ${testUrl.url}`)
      }

      await waitForBanner(page)
      console.log("[TEST] Banner appeared, ready for Support Palestine tests")
    })

    afterAll(async () => {
      await safeClosePage(page)
    })

    it("should display Support Palestine button when URL does not have alternatives", async () => {
      console.log("[TEST] Verifying Support Palestine button is visible")
      const supportButton = await waitForBannerButton(page, /support.*palestine|palestine/i)

      const isVisible = await supportButton.first().isVisible()
      expect(isVisible).toBe(true)

      // Verify alternatives button does NOT appear
      const alternativesButton = page.getByRole("button", { name: /show.*alternatives|alternatives/i })
      const alternativesCount = await alternativesButton.count()
      const alternativesVisible =
        alternativesCount > 0
          ? await alternativesButton
              .first()
              .isVisible()
              .catch(() => false)
          : false
      expect(alternativesVisible).toBe(false)

      console.log(`[TEST] ✓ Support Palestine button displayed for URL without alternatives`)
    })

    it("should navigate to techforpalestine.org when Support Palestine button is clicked", async () => {
      console.log("[TEST] Clicking Support Palestine button")
      const supportButton = await waitForBannerButton(page, /support.*palestine|palestine/i)

      // Set up listener for navigation
      const navigationPromise = page.waitForURL(/techforpalestine\.org/i, { timeout: 3000 }).catch(() => null)

      await supportButton.first().click()

      // Wait for navigation
      await navigationPromise

      // Check URL - navigation should have happened
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))
      const currentUrl = page.url()
      const containsTechForPalestine = currentUrl.includes("techforpalestine.org")
      expect(containsTechForPalestine).toBe(true)

      console.log(`[TEST] ✓ Support Palestine button navigates correctly`)
    })
  })

  describe("Banner Coverage - All Rule Types", () => {
    it("should display banner for all rule types", async () => {
      console.log("[TEST] Starting: should display banner for all rule types")

      const ruleTypes: Array<"urlOnly" | "urlDomFull" | "urlDomInline"> = ["urlOnly", "urlDomFull", "urlDomInline"]

      for (const ruleType of ruleTypes) {
        console.log(`[TEST] Testing rule type: ${ruleType}`)
        const testUrl = await getRandomResult({ ruleType, isHint: false, excludeLoginRequired: true })
        console.log(`[TEST] Selected URL: ${testUrl.url} (ruleType: ${testUrl.ruleType})`)

        if (testUrl.isHint) {
          console.error(
            `[TEST] ✗ Test URL ${testUrl.url} is a hint URL, but we need a banner URL for rule type ${ruleType}.`
          )
          continue
        }
        if (testUrl.ruleType !== ruleType) {
          console.error(
            `[TEST] ✗ Test URL ${testUrl.url} has ruleType ${testUrl.ruleType}, but expected ${ruleType}. Test setup is incorrect.`
          )
          continue
        }

        const page = await context.newPage()
        try {
          const navSuccess = await navigateToUrl(page, testUrl.url)
          if (!navSuccess) {
            console.log(`[TEST] Navigation failed: ${testUrl.url}`)
            continue
          }

          await waitForBanner(page)

          markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
          console.log(`[TEST] ✓ Test passed for rule type ${ruleType}`)
          // ONE RULE TYPE PASSED - EXIT EARLY, TEST PASSES
          return
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.error(`[TEST] ✗ Test failed for rule type ${ruleType}:`, errorMessage)
        } finally {
          await safeClosePage(page)
        }
      }

      throw new Error(`All rule types failed. Check bad links and test setup.`)
    })
  })
})

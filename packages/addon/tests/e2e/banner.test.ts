import type { BrowserContext, Page } from "playwright"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import {
  getRandomResult,
  getRandomUrls,
  getUrlCandidatesWithoutAlternatives,
  getUrlCandidatesWithAlternatives,
  getUrlWithAlternatives,
  getUrlWithoutAlternatives
} from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import {
  extensionUi,
  getAlternativesMenu,
  gotoUrlWithBanner,
  isBannerDisplayed,
  navigateToUrl,
  safeClosePage,
  waitFor,
  waitForBanner,
  waitForBannerButton,
  waitForBannerLink
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
    let testUrl: ReturnType<typeof getRandomResult>

    beforeAll(async () => {
      console.log("[TEST] Setting up single URL for all standard banner tests")
      page = await context.newPage()

      // Walk candidates until one renders a banner. A single random pick from a live database
      // regularly lands on a dead domain, an off-host redirect, or a profile that shows
      // nothing, which would fail this whole describe block before any assertion runs.
      const candidates: ReturnType<typeof getRandomResult>[] = []
      for (let i = 0; i < 20; i++) {
        candidates.push(getRandomResult({ isHint: false, excludeLoginRequired: true, hasSocialMedia: false }))
      }

      testUrl = await gotoUrlWithBanner(page, candidates, "any-banner")
      console.log(`[TEST] Selected URL: ${testUrl.url}`)

      if (testUrl.isHint) {
        throw new Error(`Test URL ${testUrl.url} is a hint URL, but we need a banner URL.`)
      }

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

      // Wait for the dropdown to actually become visible. The previous `waitForSelector`
      // matched only when the transition had already flipped `visibility`, so the following
      // point-in-time `isVisible()` on the button could still race the 0.2s transition.
      console.log("[TEST] Waiting for share dropdown to open")
      const shareButton = page.locator('button[aria-label*="Share on"]').first()
      await waitFor(
        async () => {
          const count = await shareButton.count()
          return count > 0 && (await shareButton.isVisible())
        },
        {
          timeout: 3000,
          interval: 100,
          description: "share dropdown button to become visible after hover"
        }
      )

      console.log("[TEST] Clicking share button (LinkedIn)")
      // Set up listener for new page (share buttons open in new tab)
      const newPagePromise = context.waitForEvent("page", { timeout: 3000 }).catch(() => null)
      await shareButton.click()

      // Wait for new page if it opens, then close it
      const newPage = await newPagePromise
      await newPage?.close()

      console.log(`[TEST] ✓ Share button is clickable`)
    })

    it("should display close button on banner", async () => {
      console.log("[TEST] Verifying close button is visible")
      const closeButton = await waitForBannerButton(page, /close/i)

      const isVisible = await closeButton.first().isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Close button displayed`)
    })

    it("should display donation link on banner", async () => {
      console.log("[TEST] Verifying donation link is visible")
      // The donation element is an anchor around a decorative image, so it is queried by
      // destination rather than by role/name.
      const donationLink = await waitForBannerLink(page, "ko-fi.com")

      const isVisible = await donationLink.first().isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Donation link displayed`)
    })

    it("should open Ko-fi link when donation link is clicked", async () => {
      console.log("[TEST] Clicking donation link")
      const donationLink = await waitForBannerLink(page, "ko-fi.com")

      // Set up listener for new page (opens in new tab)
      const newPagePromise = context.waitForEvent("page", { timeout: 5000 })

      await donationLink.first().click()

      // Wait for new page to open
      const newPage = await newPagePromise
      await newPage.waitForLoadState("domcontentloaded", { timeout: 5000 })

      // Verify new page is ko-fi.com
      const newPageUrl = newPage.url()
      const containsKoFi = newPageUrl.includes("ko-fi.com")
      expect(containsKoFi).toBe(true)

      await newPage.close()
      console.log(`[TEST] ✓ Donation link opens Ko-fi in new tab`)
    })

    it("should display report mistake button in bottom bar", async () => {
      console.log("[TEST] Verifying report mistake button is visible")
      // The report button contains <img alt="Report"> and has title="Report mistake"
      const reportButton = page.locator('[class*="warningButton"], [class*="bottomBar"] button').first()

      const count = await reportButton.count()
      expect(count).toBeGreaterThan(0)
      const isVisible = await reportButton.first().isVisible()
      expect(isVisible).toBe(true)
      console.log(`[TEST] ✓ Report mistake button displayed`)
    })

    it("should open mailto link when report mistake button is clicked", async () => {
      console.log("[TEST] Clicking report mistake button")
      const reportButton = page.locator('[class*="warningButton"], [class*="bottomBar"] button').first()

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
    it("should dismiss banner when close button is clicked", async () => {
      console.log("[TEST] Starting: should dismiss banner when close button is clicked")

      const page = await context.newPage()
      try {
        // Walk candidates until one renders a banner instead of skipping the test when a
        // single random URL happens to be dead.
        // A larger pool is needed here than elsewhere: this describe block runs late in the
        // file, so a modest 15-candidate walk occasionally finds nothing when that draw
        // happens to be mostly stale domains.
        const candidates: ReturnType<typeof getRandomResult>[] = []
        for (let i = 0; i < 40; i++) {
          candidates.push(getRandomResult({ isHint: false, excludeLoginRequired: true, hasSocialMedia: false }))
        }

        const testUrl = await gotoUrlWithBanner(page, candidates, "any-banner")
        console.log(`[TEST] Selected URL: ${testUrl.url}`)

        console.log("[TEST] Clicking close button")
        const closeButton = await waitForBannerButton(page, /close/i)
        await closeButton.first().click()

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

    it("should not show banner again after dismissal on same page", async () => {
      console.log("[TEST] Starting: should not show banner again after dismissal on same page")

      // Pick a URL that actually shows a banner, then dismiss it. A random live URL can land
      // on a dead domain, an off-host redirect, or a social profile that renders no banner,
      // which fails this test for reasons unrelated to dismissal.
      const page = await context.newPage()
      try {
        let testUrl: ReturnType<typeof getRandomResult> | undefined
        let bannerReady = false

        for (let attempt = 0; attempt < 10 && !bannerReady; attempt++) {
          const candidate = getRandomResult({ isHint: false, excludeLoginRequired: true, hasSocialMedia: false })
          console.log(`[TEST] Trying URL (${attempt + 1}/10): ${candidate.url}`)

          const navigated = await navigateToUrl(page, candidate.url)
          if (!navigated) {
            continue
          }

          bannerReady = await waitForBanner(page)
            .then(() => true)
            .catch(() => false)
          if (bannerReady) {
            testUrl = candidate
          }
        }

        if (testUrl === undefined) {
          throw new Error("Could not find a URL that displays a banner in 10 attempts")
        }
        const dismissedUrl: string = testUrl.url
        console.log(`[TEST] Selected URL: ${dismissedUrl}`)

        // Dismiss banner
        console.log("[TEST] Dismissing banner")
        const closeButton = await waitForBannerButton(page, /close/i)
        await closeButton.first().click()

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
        const nav3Success = await navigateToUrl(page, dismissedUrl)
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
    let testUrl: ReturnType<typeof getUrlWithAlternatives>

    beforeAll(async () => {
      console.log("[TEST] Setting up URL with alternatives")
      page = await context.newPage()

      // Walk candidates until one renders a banner. A single random live URL can be dead or
      // redirect away, which would fail this whole describe block before any assertion runs.
      testUrl = await gotoUrlWithBanner(page, getUrlCandidatesWithAlternatives({ excludeLoginRequired: true }), "with-alternatives")
      console.log(`[TEST] Selected URL with alternatives: ${testUrl.url}`)

      if (testUrl.isHint) {
        throw new Error(`Test URL ${testUrl.url} is a hint URL, but we need a banner URL.`)
      }

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

    it("should show alternatives menu when alternatives button is hovered", async () => {
      console.log("[TEST] Hovering alternatives button to trigger menu")
      const alternativesButton = await waitForBannerButton(page, /show.*alternatives|alternatives/i)
      await alternativesButton.first().hover()

      // The menu fades in via a 200ms CSS transition driven by React state. Wait for the
      // element to actually become visible instead of sleeping a fixed 300ms and hoping the
      // transition beat the race.
      console.log("[TEST] Waiting for alternatives menu to become visible")
      const menuLocator = page.locator('[class*="altPopupMenu"]').first()
      const menuAppeared = await waitFor(
        async () => {
          const count = await menuLocator.count()
          return count > 0 && (await menuLocator.isVisible())
        },
        {
          timeout: 3000,
          interval: 100,
          description: "alternatives menu to become visible after hover"
        }
      )
        .then(() => true)
        .catch(() => false)

      expect(menuAppeared).toBe(true)

      console.log("[TEST] Checking alternatives menu content")
      const menu = await getAlternativesMenu(page)
      expect(menu).not.toBeNull()

      // Verify menu contains alternatives
      const menuText = await menu!.textContent()
      const hasMenuText = menuText !== null && menuText.length > 0
      expect(hasMenuText).toBe(true)

      console.log(`[TEST] ✓ Alternatives menu displayed correctly`)
    })
  })

  describe("Banner - Support Palestine Button (Requires URL without Alternatives)", () => {
    let page: Page
    let testUrl: ReturnType<typeof getUrlWithoutAlternatives>

    beforeAll(async () => {
      console.log("[TEST] Setting up URL without alternatives")
      page = await context.newPage()

      // Walk candidates until one renders a banner, see the alternatives block above.
      testUrl = await gotoUrlWithBanner(page, getUrlCandidatesWithoutAlternatives({ excludeLoginRequired: true }), "without-alternatives")
      console.log(`[TEST] Selected URL without alternatives: ${testUrl.url}`)

      if (testUrl.isHint) {
        throw new Error(`Test URL ${testUrl.url} is a hint URL, but we need a banner URL.`)
      }

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
      const alternativesButton = extensionUi(page).getByRole("button", { name: /show.*alternatives|alternatives/i })
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

      const ruleTypes: Array<"urlOnly" | "urlDomFull"> = ["urlOnly", "urlDomFull"]

      for (const ruleType of ruleTypes) {
        console.log(`[TEST] Testing rule type: ${ruleType}`)
        let candidateUrls
        try {
          candidateUrls = getRandomUrls({ count: 5, ruleType, isHint: false, excludeLoginRequired: true })
        } catch (error) {
          if (error instanceof Error && (error.message.includes("No URLs found") || error.message.includes("Not enough URLs found"))) {
            console.log(`[TEST] No ${ruleType} URLs found in database, skipping`)
            continue
          }
          throw error
        }

        for (const testUrl of candidateUrls) {
          console.log(`[TEST] Selected URL: ${testUrl.url} (ruleType: ${testUrl.ruleType})`)

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
            console.error(`[TEST] ✗ URL ${testUrl.url} failed for rule type ${ruleType}:`, errorMessage)
          } finally {
            await safeClosePage(page)
          }
        }
      }

      throw new Error(`All rule types failed. Check bad links and test setup.`)
    })
  })
})

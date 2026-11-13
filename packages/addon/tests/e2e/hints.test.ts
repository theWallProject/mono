import type { BrowserContext, Page } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { getHintUrlCandidates, type CategorizedUrl } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import { extensionUi, isHintsToastShown, navigateToUrl, tryHintUrl, waitFor } from "../utils/extension"
import { simulateExistingUser, clearAllStorage } from "../utils/storage"

/** How many hint candidates to try before giving up on finding a working one. */
const MAX_HINT_ATTEMPTS = 12

describe("Hints System - Single Tab Isolated Tests", () => {
  let context: BrowserContext
  let extensionId: string

  beforeEach(async () => {
    console.log("[TEST] Setting up browser with extension")
    const result = await launchBrowserWithExtension()
    context = result.context
    extensionId = result.extensionId
    console.log("[TEST] Browser setup complete")
  })

  afterEach(async () => {
    await context.close().catch(() => {})
  })

  /**
   * Navigates to a hint URL that demonstrably renders the hint toast.
   *
   * Hint entries include sites that redirect EU visitors to consent portals or login walls.
   * On those the extension correctly does nothing, because it never saw the flagged target.
   * Host comparison cannot separate that from a legitimate landing (`edition.cnn.com` for
   * `cnn.com`), so this probes for the toast itself and keeps the first URL that works.
   * On success the toast is already on screen.
   *
   * Fails hard if no candidate renders a toast, rather than quietly testing a redirect page.
   */
  const gotoHintUrlWithToast = async (page: Page): Promise<CategorizedUrl> => {
    const candidates = getHintUrlCandidates()

    for (const candidate of candidates.slice(0, MAX_HINT_ATTEMPTS)) {
      console.log(`[TEST] Trying hint URL: ${candidate.url}`)
      if (await tryHintUrl(page, candidate.url)) {
        return candidate
      }
    }

    throw new Error(`No hint URL rendered a hint toast (tried ${Math.min(candidates.length, MAX_HINT_ATTEMPTS)})`)
  }

  it("should show hints toast on hint URLs", async () => {
    console.log("[TEST] Starting: should show hints toast on hint URLs")

    const page = await context.newPage()
    try {
      const testUrl = await gotoHintUrlWithToast(page)
      console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

      // The probe already confirmed the toast is on screen; assert it explicitly so a future
      // change that stops rendering after the probe still fails loudly here.
      const toastVisible = await isHintsToastShown(page)
      expect(toastVisible).toBe(true)

      markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      console.log(`[TEST] ✓ Hint toast displayed correctly`)
    } catch (error) {
      console.error(`[TEST] ✗ Test failed:`, error)
      throw error
    } finally {
      await page.close()
    }
  })

  it("should show hint only once per session when visiting same URL multiple times", async () => {
    console.log("[TEST] Starting: should show hint only once per session")

    const page = await context.newPage()
    try {
      const testUrl = await gotoHintUrlWithToast(page)
      console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

      // Navigate away
      console.log("[TEST] Navigating away from hint URL")
      const navigatedAway = await navigateToUrl(page, "https://example.com")
      if (!navigatedAway) {
        throw new Error("Failed to navigate to example.com")
      }

      // Second visit to same hint URL in same session - hint should NOT appear again
      console.log("[TEST] Second visit - navigating back to same hint URL")
      const navigatedBack = await navigateToUrl(page, testUrl.url)
      if (!navigatedBack) {
        throw new Error(`Failed to navigate back to hint URL: ${testUrl.url}`)
      }

      // Give the extension a bounded chance to (incorrectly) re-show the toast, rather than
      // sleeping a fixed duration and hoping.
      console.log("[TEST] Verifying hint does not appear on second visit")
      const reappeared = await waitFor(async () => await isHintsToastShown(page), {
        timeout: 2000,
        interval: 200,
        description: "hint toast to reappear (should not)"
      })
        .then(() => true)
        .catch(() => false)

      expect(reappeared).toBe(false)

      markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      console.log(`[TEST] ✓ Test passed: hint does not reappear on second visit`)
    } catch (error) {
      console.error(`[TEST] ✗ Test failed:`, error)
      throw error
    } finally {
      await page.close()
    }
  })

  it("should not show hints when system is disabled", async () => {
    console.log("[TEST] Starting: should not show hints when system is disabled")

    // Establish a working hint URL with hints ENABLED first. Probing for a toast after
    // disabling the system would be circular: no URL can ever produce a toast, so the probe
    // would exhaust its candidates and fail for the wrong reason.
    const warmupPage = await context.newPage()
    let testUrl: CategorizedUrl
    try {
      testUrl = await gotoHintUrlWithToast(warmupPage)
    } finally {
      await warmupPage.close()
    }
    console.log(`[TEST] Working hint URL established: ${testUrl.url}`)

    // Clear the rate-limit marker so the second visit is eligible to show again, then
    // disable the system. Without clearing, the suppression could come from the cooldown
    // rather than from the setting under test.
    await clearAllStorage(context, extensionId)
    await simulateExistingUser(context, extensionId, { hintsDisabled: true })
    console.log("[TEST] Hints system disabled")

    const page = await context.newPage()
    try {
      const navigated = await navigateToUrl(page, testUrl.url)
      expect(navigated).toBe(true)

      console.log("[TEST] Verifying hint toast does NOT appear")
      const toastVisible = await waitFor(async () => await isHintsToastShown(page), {
        timeout: 3000,
        interval: 200,
        description: "hint toast to appear despite system being disabled"
      })
        .then(() => true)
        .catch(() => false)
      expect(toastVisible).toBe(false)

      console.log(`[TEST] ✓ Test passed: hints do not show when system is disabled`)
    } catch (error) {
      console.error(`[TEST] ✗ Test failed:`, error)
      throw error
    } finally {
      await page.close()
    }
  })

  it("should allow dismissing hints temporarily", async () => {
    console.log("[TEST] Starting: should allow dismissing hints temporarily")

    const page = await context.newPage()
    try {
      const testUrl = await gotoHintUrlWithToast(page)
      console.log(`[TEST] Navigating to hint URL: ${testUrl.url}`)

      // The probe confirms the toast is visible.
      const toastVisible = await isHintsToastShown(page)
      expect(toastVisible).toBe(true)

      // Find and click the first dismiss button (expands the toast)
      console.log("[TEST] Looking for dismiss button to expand toast")
      const expandButton = extensionUi(page).getByRole("button", { name: /dismiss/i }).first()
      const expandButtonCount = await expandButton.count()
      expect(expandButtonCount).toBeGreaterThan(0)
      const expandButtonVisible = await expandButton.isVisible()
      expect(expandButtonVisible).toBe(true)

      console.log("[TEST] Clicking dismiss button to expand toast")
      await expandButton.click()

      // Wait for the expanded view to expose the "Dismiss this" action. This is a real DOM
      // condition rather than a fixed sleep.
      const dismissThisButton = extensionUi(page).getByRole("button", { name: /dismiss this/i }).first()
      await waitFor(
        async () => {
          const count = await dismissThisButton.count()
          return count > 0 && (await dismissThisButton.isVisible())
        },
        {
          timeout: 3000,
          interval: 100,
          description: "'Dismiss this' button to appear after expanding the toast"
        }
      )

      console.log("[TEST] Clicking 'Dismiss this' button")
      await dismissThisButton.click()

      // Toast should disappear
      const dismissed = await waitFor(
        async () => !(await isHintsToastShown(page)),
        {
          timeout: 3000,
          interval: 100,
          description: "hint toast to disappear after dismissal"
        }
      )
        .then(() => true)
        .catch(() => false)

      expect(dismissed).toBe(true)

      markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      console.log(`[TEST] ✓ Test passed: hint dismissed temporarily`)
    } catch (error) {
      console.error(`[TEST] ✗ Test failed:`, error)
      throw error
    } finally {
      await page.close()
    }
  })
})

import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { getRandomResult } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import { isHintsToastShown, navigateToUrl, waitFor, waitUntilHintShown } from "../utils/extension"
import { simulateExistingUser } from "../utils/storage"

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

  it("should show hints toast on hint URLs", async () => {
    console.log("[TEST] Starting: should show hints toast on hint URLs")

    // Get ONE hint URL - test once
    const testUrl = await getRandomResult({ isHint: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    const page = await context.newPage()
    try {
      const navSuccess = await navigateToUrl(page, testUrl.url)

      expect(navSuccess).toBe(true)

      // await waitForExtensionProcessing(page)

      // Debug hint state if toast not visible
      const toastVisible = await waitUntilHintShown(page)

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

    // EXPLICIT: Get a hint URL
    const testUrl = await getRandomResult({ isHint: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    const page = await context.newPage()
    try {
      // First visit - hint should appear
      console.log("[TEST] First visit - navigating to hint URL")
      const nav1Success = await navigateToUrl(page, testUrl.url)
      if (!nav1Success) {
        throw new Error(`Failed to navigate to hint URL: ${testUrl.url}`)
      }

      // await waitForExtensionProcessing(page)

      const firstVisitToastVisible = await waitUntilHintShown(page)
      expect(firstVisitToastVisible).toBe(true)

      // Navigate away
      console.log("[TEST] Navigating away from hint URL")
      const nav2Success = await navigateToUrl(page, "https://example.com")
      if (!nav2Success) {
        // Don't add example.com to bad links - it's a test URL
        throw new Error("Failed to navigate to example.com")
      }
      // await waitForExtensionProcessing(page)

      // Second visit to same hint URL in same session - hint should NOT appear again
      console.log("[TEST] Second visit - navigating back to same hint URL")
      const nav3Success = await navigateToUrl(page, testUrl.url)
      if (!nav3Success) {
        console.log(`[TEST] Navigation failed, skipping test: ${testUrl.url}`)
        return // Skip this test
      }
      // await waitForExtensionProcessing(page)

      // Wait a moment for extension to process, then check that hint doesn't appear
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000))
      console.log("[TEST] Verifying hint does not appear on second visit")
      const secondVisitToastVisible = await isHintsToastShown(page)
      expect(secondVisitToastVisible).toBe(false)

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

    // Disable hints system
    await simulateExistingUser(context, extensionId, { hintsDisabled: true })
    console.log("[TEST] Hints system disabled")

    // EXPLICIT: Get a hint URL
    const testUrl = await getRandomResult({ isHint: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    const page = await context.newPage()
    try {
      console.log(`[TEST] Navigating to hint URL: ${testUrl.url}`)
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        console.log(`[TEST] Navigation failed, skipping test: ${testUrl.url}`)
        return // Skip this test
      }

      // await waitForExtensionProcessing(page)

      // Wait a moment for extension to process
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000))

      console.log("[TEST] Verifying hint toast does NOT appear")
      const toastVisible = await isHintsToastShown(page)
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

    // EXPLICIT: Get a hint URL
    const testUrl = await getRandomResult({ isHint: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    const page = await context.newPage()
    try {
      console.log(`[TEST] Navigating to hint URL: ${testUrl.url}`)
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        console.log(`[TEST] Navigation failed, skipping test: ${testUrl.url}`)
        return // Skip this test
      }

      // Wait for page to be ready
      await page.waitForLoadState("domcontentloaded")

      // Toast should be visible
      const toastVisible = await waitUntilHintShown(page)
      expect(toastVisible).toBe(true)

      // Find and click the first dismiss button (expands the toast)
      console.log("[TEST] Looking for dismiss button to expand toast")
      const expandButton = page.getByRole("button", { name: /dismiss/i }).first()
      const expandButtonCount = await expandButton.count()
      expect(expandButtonCount).toBeGreaterThan(0)
      const expandButtonVisible = await expandButton.isVisible()
      expect(expandButtonVisible).toBe(true)

      console.log("[TEST] Clicking dismiss button to expand toast")
      await expandButton.click()

      // Wait for toast to expand and show "Dismiss this" button
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 300))

      // Find and click "Dismiss this" button (actually dismisses the toast)
      console.log("[TEST] Looking for 'Dismiss this' button")
      const dismissThisButton = page.getByRole("button", { name: /dismiss this/i }).first()
      const dismissThisButtonCount = await dismissThisButton.count()
      expect(dismissThisButtonCount).toBeGreaterThan(0)
      const dismissThisButtonVisible = await dismissThisButton.isVisible()
      expect(dismissThisButtonVisible).toBe(true)

      console.log("[TEST] Clicking 'Dismiss this' button")
      await dismissThisButton.click()

      // Give the dismiss action a moment to process
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 300))

      // Wait for toast to be dismissed
      console.log("[TEST] Waiting for hint toast to be dismissed")
      await waitFor(
        async () => {
          const visible = await isHintsToastShown(page)
          console.log(`[TEST] Toast visible check: ${visible}`)
          return !visible
        },
        {
          timeout: 5000,
          interval: 200,
          description: "hint toast to be dismissed after clicking"
        }
      )

      const toastDismissed = await isHintsToastShown(page)
      expect(toastDismissed).toBe(false)

      console.log(`[TEST] ✓ Test passed: hint dismissed correctly`)
    } catch (error) {
      console.error(`[TEST] ✗ Test failed:`, error)
      throw error
    } finally {
      await page.close()
    }
  })
})

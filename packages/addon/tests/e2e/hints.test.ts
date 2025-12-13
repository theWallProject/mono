import type { BrowserContext } from "playwright"
import { beforeAll, describe, expect, it } from "vitest"

import { addBadLink, getRandomResult } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import { isHintsToastShown, navigateToUrl, waitFor, waitForExtensionProcessing } from "../utils/extension"
import { clearAllStorage, simulateExistingUser } from "../utils/storage"

describe("Hints System - Single Tab Isolated Tests", () => {
  let context: BrowserContext
  let extensionId: string

  beforeAll(async () => {
    console.log("[TEST] Setting up browser with extension")
    const result = await launchBrowserWithExtension()
    context = result.context
    extensionId = result.extensionId
    console.log("[TEST] Browser setup complete")
  })

  // Browser cleanup is handled globally in test-mode.ts

  it("should show hints toast on hint URLs", async () => {
    console.log("[TEST] Starting: should show hints toast on hint URLs")

    // Clear storage for fresh start
    await clearAllStorage(context, extensionId)

    // Get ONE hint URL - test once
    const testUrl = getRandomResult({ isHint: true, excludeTested: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    expect(testUrl.isHint).toBe(true)

    const page = await context.newPage()
    try {
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        addBadLink(testUrl.url)
      }
      expect(navSuccess).toBe(true)

      await waitForExtensionProcessing(page)

      // Verify hint toast is displayed
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

    // Clear storage for fresh start
    await clearAllStorage(context, extensionId)

    // EXPLICIT: Get a hint URL
    const testUrl = getRandomResult({ isHint: true, excludeTested: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    // VERIFY URL PROPERTIES
    expect(testUrl.isHint).toBe(true)

    const page = await context.newPage()
    try {
      // First visit - hint should appear
      console.log("[TEST] First visit - navigating to hint URL")
      const nav1Success = await navigateToUrl(page, testUrl.url)
      if (!nav1Success) {
        throw new Error(`Failed to navigate to hint URL: ${testUrl.url}`)
      }

      await waitForExtensionProcessing(page)

      const firstVisitToastVisible = await isHintsToastShown(page)
      expect(firstVisitToastVisible).toBe(true)

      // Navigate away
      console.log("[TEST] Navigating away from hint URL")
      const nav2Success = await navigateToUrl(page, "https://example.com")
      if (!nav2Success) {
        // Don't add example.com to bad links - it's a test URL
        throw new Error("Failed to navigate to example.com")
      }
      await waitForExtensionProcessing(page)

      // Wait a moment for navigation to complete
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 500))

      // Second visit to same hint URL in same session - hint should NOT appear again
      console.log("[TEST] Second visit - navigating back to same hint URL")
      const nav3Success = await navigateToUrl(page, testUrl.url)
      if (!nav3Success) {
        console.log(`[TEST] Navigation failed, adding to bad links and skipping test: ${testUrl.url}`)
        addBadLink(testUrl.url)
        return // Skip this test
      }
      await waitForExtensionProcessing(page)

      // Wait a bit to ensure hint doesn't appear (it should be suppressed)
      console.log("[TEST] Verifying hint does not appear on second visit")
      await waitFor(
        async () => {
          // Wait a moment, then check
          await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))
          const visible = await isHintsToastShown(page)
          return !visible // We're waiting for it to NOT be visible
        },
        {
          timeout: 5000,
          description: "hint to not appear on second visit (should be suppressed)"
        }
      ).catch(() => {
        // If waitFor succeeds, hint is not visible (good)
        // If it times out, hint might still be visible (bad)
      })

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
    const testUrl = getRandomResult({ isHint: true, excludeTested: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    // VERIFY URL PROPERTIES
    expect(testUrl.isHint).toBe(true)

    const page = await context.newPage()
    try {
      console.log(`[TEST] Navigating to hint URL: ${testUrl.url}`)
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        console.log(`[TEST] Navigation failed, adding to bad links and skipping test: ${testUrl.url}`)
        addBadLink(testUrl.url)
        return // Skip this test
      }

      await waitForExtensionProcessing(page)

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
      // Re-enable hints for other tests
      await clearAllStorage(context, extensionId)
      console.log("[TEST] Hints system re-enabled")
    }
  })

  it("should allow dismissing hints temporarily", async () => {
    console.log("[TEST] Starting: should allow dismissing hints temporarily")

    await clearAllStorage(context, extensionId)

    // EXPLICIT: Get a hint URL
    const testUrl = getRandomResult({ isHint: true, excludeTested: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    // VERIFY URL PROPERTIES
    expect(testUrl.isHint).toBe(true)

    const page = await context.newPage()
    try {
      console.log(`[TEST] Navigating to hint URL: ${testUrl.url}`)
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        console.log(`[TEST] Navigation failed, adding to bad links and skipping test: ${testUrl.url}`)
        addBadLink(testUrl.url)
        return // Skip this test
      }

      await waitForExtensionProcessing(page)

      // Toast should be visible
      const toastVisible = await isHintsToastShown(page)
      expect(toastVisible).toBe(true)

      // Find and click dismiss button
      console.log("[TEST] Looking for dismiss button")
      const dismissButton = page.getByRole("button", { name: /dismiss/i }).first()
      const buttonCount = await dismissButton.count()
      expect(buttonCount).toBeGreaterThan(0)
      const buttonVisible = await dismissButton.isVisible()
      expect(buttonVisible).toBe(true)

      console.log("[TEST] Clicking dismiss button")
      await dismissButton.click()

      // Wait for toast to be dismissed
      console.log("[TEST] Waiting for hint toast to be dismissed")
      await waitFor(
        async () => {
          const visible = await isHintsToastShown(page)
          return !visible
        },
        {
          timeout: 5000,
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

  it("should test hint with random URL", async () => {
    console.log("[TEST] Starting: should test hint with random URL")

    await clearAllStorage(context, extensionId)

    // Get ONE hint URL - test once
    const testUrl = getRandomResult({ isHint: true, excludeTested: true, excludeLoginRequired: true })
    console.log(`[TEST] Selected hint URL: ${testUrl.url}`)

    expect(testUrl.isHint).toBe(true)

    const page = await context.newPage()
    try {
      const navSuccess = await navigateToUrl(page, testUrl.url)
      if (!navSuccess) {
        addBadLink(testUrl.url)
      }
      expect(navSuccess).toBe(true)

      await waitForExtensionProcessing(page)

      // Hints should appear for hint URLs
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
})

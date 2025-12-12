import type { BrowserContext } from "playwright"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { getRandomUrl, getRandomUrls } from "../fixtures/test-urls"
import { closeBrowser, launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import { isHintsToastShown, navigateToUrl, waitForExtensionProcessing } from "../utils/extension"
import { clearAllStorage, simulateExistingUser } from "../utils/storage"

describe("Hints System", () => {
  let context: BrowserContext
  let extensionId: string

  beforeAll(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
    extensionId = result.extensionId
  })

  afterAll(async () => {
    await closeBrowser(context)
  })

  it("should show hints toast on hint URLs", async () => {
    // Clear storage for fresh start
    await clearAllStorage(context, extensionId)

    const testUrls = getRandomUrls({ count: 3, isHint: true, excludeTested: true })

    for (const testUrl of testUrls) {
      const page = await context.newPage()
      try {
        await navigateToUrl(page, testUrl.url)
        await waitForExtensionProcessing(page)

        // Wait for toast to appear
        await page.waitForTimeout(3000)

        const toastVisible = await isHintsToastShown(page)
        expect(toastVisible).toBe(true)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      } finally {
        await page.close()
      }
    }
  })

  it("should not show hints when system is disabled", async () => {
    // Disable hints system
    await simulateExistingUser(context, extensionId, { hintsDisabled: true })

    const testUrl = getRandomUrl({ isHint: true, excludeTested: true })

    const page = await context.newPage()
    try {
      await page.goto(testUrl.url, { waitUntil: "networkidle" })
      await waitForExtensionProcessing(page)

      await page.waitForTimeout(3000)

      // Toast should not appear
      const toastVisible = await isHintsToastShown(page)
      expect(toastVisible).toBe(false)
    } finally {
      await page.close()
      // Re-enable hints for other tests
      await clearAllStorage(context, extensionId)
    }
  })

  it("should allow dismissing hints temporarily", async () => {
    await clearAllStorage(context, extensionId)

    const testUrl = getRandomUrl({ isHint: true, excludeTested: true })

    const page = await context.newPage()
    try {
      await page.goto(testUrl.url, { waitUntil: "networkidle" })
      await waitForExtensionProcessing(page)

      await page.waitForTimeout(3000)

      // Toast should be visible
      expect(await isHintsToastShown(page)).toBe(true)

      // Find and click dismiss button
      const dismissButton = page.getByRole("button", { name: /dismiss/i }).first()
      const buttonVisible = await dismissButton.isVisible()
      expect(buttonVisible).toBe(true) // Dismiss button should be visible

      await dismissButton.click()
      await page.waitForTimeout(1000)

      // Toast should be dismissed after clicking
      const toastDismissed = await isHintsToastShown(page)
      expect(toastDismissed).toBe(false)
    } finally {
      await page.close()
    }
  })

  it("should test with random URLs covering different hint scenarios", async () => {
    await clearAllStorage(context, extensionId)

    const testUrls = getRandomUrls({ count: 5, isHint: true, excludeTested: true })

    for (const testUrl of testUrls) {
      const page = await context.newPage()
      try {
        await navigateToUrl(page, testUrl.url)
        await waitForExtensionProcessing(page)

        await page.waitForTimeout(3000)

        // Hints should appear for hint URLs
        const toastVisible = await isHintsToastShown(page)
        expect(toastVisible).toBe(true)

        markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
      } finally {
        await page.close()
      }
    }
  })
})

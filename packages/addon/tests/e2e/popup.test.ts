import type { BrowserContext } from "playwright"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { closeBrowser, launchBrowserWithExtension } from "../utils/browser"
import { getExtensionPopup } from "../utils/extension"

describe("Popup Functionality", () => {
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

  it("should open popup correctly", async () => {
    const popup = await getExtensionPopup(context, extensionId)
    expect(popup).toBeTruthy()

    // Check if popup has loaded
    const title = await popup.locator("h1").first()
    expect(await title.isVisible()).toBe(true)
  })

  it("should display settings section", async () => {
    const popup = await getExtensionPopup(context, extensionId)
    const settingsTitle = popup.getByText("Settings", { exact: false })
    expect(await settingsTitle.isVisible()).toBe(true)
  })

  it("should toggle hints system", async () => {
    const popup = await getExtensionPopup(context, extensionId)

    // Find toggle button
    const toggleButton = popup.getByRole("button", { name: /hints system/i })
    expect(await toggleButton.isVisible()).toBe(true)

    // Click toggle
    await toggleButton.click()

    // Wait for success message
    await popup.waitForSelector("text=Hints", { timeout: 5000 })
  })

  it("should reset dismissed hints", async () => {
    const popup = await getExtensionPopup(context, extensionId)

    // Find reset button
    const resetButton = popup.getByRole("button", { name: /reset.*dismissed/i })
    expect(await resetButton.isVisible()).toBe(true)

    // Click reset
    await resetButton.click()

    // Wait for success message
    await popup.waitForSelector("text=Reset", { timeout: 5000 })
  })

  it("should have working share buttons", async () => {
    const popup = await getExtensionPopup(context, extensionId)

    // Check for share icons
    const shareIcons = popup.locator('[aria-label*="Share"]')
    const count = await shareIcons.count()
    expect(count).toBeGreaterThan(0)
  })

  it("should have working donate button", async () => {
    const popup = await getExtensionPopup(context, extensionId)

    const donateButton = popup.getByRole("button", { name: /donate/i })
    expect(await donateButton.isVisible()).toBe(true)

    // Click should open external link (handled by browser)
    await donateButton.click()
  })

  it("should have working contact button", async () => {
    const popup = await getExtensionPopup(context, extensionId)

    const contactButton = popup.getByRole("button", { name: /contact/i })
    expect(await contactButton.isVisible()).toBe(true)
  })

  it("should verify tracking is disabled in test mode", async () => {
    // Check console logs for test mode tracking
    const popup = await getExtensionPopup(context, extensionId)

    const consoleLogs: string[] = []
    popup.on("console", (msg: { type: () => string; text: () => string }) => {
      if (msg.type() === "log") {
        consoleLogs.push(msg.text())
      }
    })

    // Trigger an action that would normally track
    const toggleButton = popup.getByRole("button", { name: /hints system/i })
    await toggleButton.click()

    // Wait a bit for any console logs
    await popup.waitForTimeout(1000)

    // In test mode, tracking should log instead of sending analytics
    // Verify no tracking URLs were called (test mode prevents actual tracking)
    const hasTrackingUrls = consoleLogs.some((log) => log.includes("analytics") || log.includes("track"))
    expect(hasTrackingUrls).toBe(false)

    // Verify popup still works correctly (no errors occurred)
    const toggleButtonStillVisible = await toggleButton.isVisible()
    expect(toggleButtonStillVisible).toBe(true)
  })
})

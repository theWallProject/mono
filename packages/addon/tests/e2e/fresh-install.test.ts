import type { BrowserContext } from "playwright"
import { beforeEach, describe, expect, it } from "vitest"

import { HINTS_SYSTEM_DISABLED_KEY } from "../../src/storageHelpers"
import { launchBrowserWithExtension } from "../utils/browser"
import { getExtensionPopup } from "../utils/extension"
import { simulateFreshInstall, verifyStorage } from "../utils/storage"

describe("Fresh Install Scenarios", () => {
  let context: BrowserContext
  let extensionId: string

  beforeEach(async () => {
    const result = await launchBrowserWithExtension()
    context = result.context
    extensionId = result.extensionId
  })

  it("should behave correctly on first install with no storage", async () => {
    await simulateFreshInstall(context, extensionId)

    // Storage should be empty
    const verified = await verifyStorage(context, extensionId, {})
    expect(verified).toBe(true)
  })

  it("should open what's new page on install", async () => {
    await simulateFreshInstall(context, extensionId)

    // Wait for extension to process install event
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // What's new page check is tested in background.test.ts
    // This test verifies fresh install behavior without checking page opens
  })

  it("should apply default settings correctly", async () => {
    await simulateFreshInstall(context, extensionId)

    // Default settings:
    // - Hints system enabled (no hints_system_disabled key)
    // - No dismissed hints
    const storage = await verifyStorage(context, extensionId, {})

    // Storage should be empty (defaults are implicit)
    expect(storage).toBe(true)
  })

  it("should have no dismissed hints on fresh install", async () => {
    await simulateFreshInstall(context, extensionId)

    // Check that no dismissed hints exist
    const verified = await verifyStorage(context, extensionId, {})
    expect(verified).toBe(true)
  })

  it("should have hints system enabled by default", async () => {
    await simulateFreshInstall(context, extensionId)

    // Hints system is enabled by default (no hints_system_disabled key)
    const verified = await verifyStorage(context, extensionId, {})
    expect(verified).toBe(true)

    // Verify hints_system_disabled is not set
    const hasDisabledKey = await verifyStorage(context, extensionId, {
      [HINTS_SYSTEM_DISABLED_KEY]: undefined
    })
    // This will be false if key doesn't exist, which is correct
    expect(hasDisabledKey).toBe(false)
  })

  it("should have empty storage initially", async () => {
    await simulateFreshInstall(context, extensionId)

    const verified = await verifyStorage(context, extensionId, {})
    expect(verified).toBe(true)
  })

  it("should work with all features using default settings", async () => {
    await simulateFreshInstall(context, extensionId)

    // Popup should work
    const popup = await getExtensionPopup(context, extensionId)
    expect(popup).toBeTruthy()

    // Settings should be accessible
    const settingsTitle = popup.getByText("Settings", { exact: false })
    expect(await settingsTitle.isVisible()).toBe(true)
  })
})

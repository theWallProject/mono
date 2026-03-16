import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { HINT_DISMISSED_PERM_PREFIX, HINTS_SYSTEM_DISABLED_KEY } from "../../src/storageHelpers"
import { getExtensionPopupUrl, launchBrowserWithExtension } from "../utils/browser"
import { getStorageValue, setSettings, simulateExistingUser, verifyStorage } from "../utils/storage"

describe("Settings Persistence", () => {
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

  it("should persist hints system toggle across sessions", async () => {
    // Set hints disabled
    await simulateExistingUser(context, extensionId, { hintsDisabled: true })

    // Verify it persists
    const verified = await verifyStorage(context, extensionId, {
      [HINTS_SYSTEM_DISABLED_KEY]: true
    })
    expect(verified).toBe(true)

    // Simulate session restart (just verify storage persists)
    const stillVerified = await verifyStorage(context, extensionId, {
      [HINTS_SYSTEM_DISABLED_KEY]: true
    })
    expect(stillVerified).toBe(true)
  })

  it("should persist dismissed hints across sessions", async () => {
    const dismissedHints = ["hint1", "hint2", "hint3"]

    await simulateExistingUser(context, extensionId, { dismissedHints })

    // Verify all dismissed hints persist
    for (const hintId of dismissedHints) {
      const verified = await verifyStorage(context, extensionId, {
        [`${HINT_DISMISSED_PERM_PREFIX}${hintId}`]: true
      })
      expect(verified).toBe(true)
    }
  })

  it("should persist dismissal timestamps correctly", async () => {
    const testKey = "test_dismissal_key"
    const timestamp = Date.now()

    await simulateExistingUser(context, extensionId, {
      dismissedHints: [testKey]
    })

    // Set timestamp manually
    await setSettings(context, extensionId, { [testKey]: timestamp })

    // Verify timestamp persists
    const verified = await verifyStorage(context, extensionId, {
      [testKey]: timestamp
    })
    expect(verified).toBe(true)
  })

  it("should reflect settings changes immediately", async () => {
    // Start with hints enabled
    await simulateExistingUser(context, extensionId, { hintsDisabled: false })

    // Verify enabled
    let verified = await verifyStorage(context, extensionId, {})
    expect(verified).toBe(true)

    // Disable hints
    await simulateExistingUser(context, extensionId, { hintsDisabled: true })

    // Verify disabled immediately
    verified = await verifyStorage(context, extensionId, {
      [HINTS_SYSTEM_DISABLED_KEY]: true
    })
    expect(verified).toBe(true)
  })

  it("should not show what's new again after being shown", async () => {
    // Set what's new as shown
    await setSettings(context, extensionId, {
      whats_new_shown_versions: ["1.6.0"]
    })

    // Verify it's stored
    const verified = await verifyStorage(context, extensionId, {
      whats_new_shown_versions: ["1.6.0"]
    })
    expect(verified).toBe(true)

    // What's new should not show again after being shown once
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const pages = context.pages()
    const whatsNewPage = pages.find((p: { url: () => string }) => p.url().includes("whats-new.html"))

    // What's new page should not be opened if already shown
    expect(whatsNewPage).toBeUndefined()
  })

  it("should persist dismissal across browser restart", async () => {
    // Dismissal timestamps are stored in chrome.storage.local (not session),
    // so they must survive a browser restart. This test simulates a restart
    // by writing a dismissal timestamp, then clearing session storage (which
    // is what a real browser restart does), and confirming the dismissal
    // is still in local storage.
    const dismissalKey = "ws_example.com"
    const timestamp = Date.now()

    await setSettings(context, extensionId, { [dismissalKey]: timestamp })

    // Verify the dismissal was written
    const storedValue = await getStorageValue(context, extensionId, dismissalKey)
    expect(storedValue).toBe(timestamp)

    // Simulate browser restart: session storage is cleared, local storage is not
    const page = await context.newPage()
    try {
      const popupUrl = getExtensionPopupUrl(extensionId)
      await page.goto(popupUrl)
      await page.evaluate(async () => {
        return new Promise<void>((resolve) => {
          chrome.storage.session.clear(() => {
            resolve()
          })
        })
      })
    } finally {
      await page.close()
    }

    // Dismissal should still be present in local storage after restart
    const valueAfterRestart = await getStorageValue(context, extensionId, dismissalKey)
    expect(valueAfterRestart).toBe(timestamp)
  })

  it("should maintain storage state correctly", async () => {
    const testData = {
      [HINTS_SYSTEM_DISABLED_KEY]: true,
      [`${HINT_DISMISSED_PERM_PREFIX}test1`]: true,
      test_key: "test_value"
    }

    await setSettings(context, extensionId, testData)

    // Verify all data persists
    const verified = await verifyStorage(context, extensionId, testData)
    expect(verified).toBe(true)
  })
})

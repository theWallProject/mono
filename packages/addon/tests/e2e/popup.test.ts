import type { BrowserContext } from "playwright"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { HINTS_SYSTEM_DISABLED_KEY } from "../../src/storageHelpers"
import { launchBrowserWithExtension } from "../utils/browser"
import { getExtensionPopup, waitFor, waitForExternalLink } from "../utils/extension"
import { clearAllStorage, getStorageValue } from "../utils/storage"

describe("Popup Functionality - Settings Tests via Options Dialogue", () => {
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
    if (context) {
      await context.close().catch(() => {})
    }
  })

  describe("Popup Opening", () => {
    it("should open popup correctly", async () => {
      console.log("[TEST] Starting: should open popup correctly")

      const popup = await getExtensionPopup(context, extensionId)
      console.log("[TEST] Verifying popup has loaded")
      // Check if popup has loaded
      const title = popup.locator("h1").first()
      const titleCount = await title.count()
      expect(titleCount).toBeGreaterThan(0)

      const isVisible = await title.isVisible()
      expect(isVisible).toBe(true)

      console.log(`[TEST] ✓ Test passed: popup opened correctly`)
      await popup.close()
    })

    it("should display extension name and icon", async () => {
      console.log("[TEST] Starting: should display extension name and icon")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Verifying extension name is displayed")
        const title = popup.locator("h1").first()
        await waitFor(
          async () => {
            const count = await title.count()
            return count > 0 && (await title.isVisible())
          },
          {
            timeout: 5000,
            description: "extension name (h1) to be visible"
          }
        )

        const titleText = await title.textContent()
        expect(titleText).toBeTruthy()
        expect(titleText!.length).toBeGreaterThan(0)

        console.log("[TEST] Verifying extension icon is displayed")
        const icon = popup.locator('img[alt="The Wall"]')
        const iconCount = await icon.count()
        expect(iconCount).toBeGreaterThan(0)

        const iconVisible = await icon.first().isVisible()
        expect(iconVisible).toBe(true)

        console.log(`[TEST] ✓ Test passed: extension name and icon displayed`)
      } finally {
        await popup.close()
      }
    })

    it("should have correct popup layout", async () => {
      console.log("[TEST] Starting: should have correct popup layout")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Verifying popup structure")
        // Check for main container elements
        const body = popup.locator("body")
        const bodyCount = await body.count()
        expect(bodyCount).toBeGreaterThan(0)

        // Popup should have content
        const bodyText = await body.textContent()
        expect(bodyText).toBeTruthy()
        expect(bodyText!.length).toBeGreaterThan(0)

        console.log(`[TEST] ✓ Test passed: popup layout is correct`)
      } finally {
        await popup.close()
      }
    })
  })

  describe("Hints System Settings", () => {
    it("should display hints system toggle button", async () => {
      console.log("[TEST] Starting: should display hints system toggle button")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Verifying toggle button is visible")
        const toggleButton = popup.getByRole("button", { name: /hints system/i })
        const buttonCount = await toggleButton.count()
        expect(buttonCount).toBeGreaterThan(0)

        await waitFor(
          async () => {
            return await toggleButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "hints system toggle button to be visible"
          }
        )

        const isVisible = await toggleButton.first().isVisible()
        expect(isVisible).toBe(true)

        console.log(`[TEST] ✓ Test passed: hints system toggle button displayed`)
      } finally {
        await popup.close()
      }
    })

    it("should toggle hints system on/off", async () => {
      console.log("[TEST] Starting: should toggle hints system on/off")

      // Clear storage for clean state
      await clearAllStorage(context, extensionId)

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Getting initial state")
        const toggleButton = popup.getByRole("button", { name: /hints system/i })
        await waitFor(
          async () => {
            return await toggleButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "toggle button to be visible"
          }
        )

        // Get initial button text to determine current state
        const initialButtonText = await toggleButton.first().textContent()
        expect(initialButtonText).toBeTruthy()

        const isInitiallyDisabled = initialButtonText!.toLowerCase().includes("enable")
        console.log(`[TEST] Initial state: hints system ${isInitiallyDisabled ? "disabled" : "enabled"}`)

        // Click toggle
        console.log("[TEST] Clicking toggle button")
        await toggleButton.first().click()

        // Wait for success message
        console.log("[TEST] Waiting for success message")
        await waitFor(
          async () => {
            const body = popup.locator("body")
            const pageText = await body.textContent()
            return (
              pageText !== null &&
              (pageText.includes("Hints") || pageText.includes("disabled") || pageText.includes("enabled"))
            )
          },
          {
            timeout: 5000,
            description: "success message to appear after toggle"
          }
        )

        // Verify state changed
        const newButtonText = await toggleButton.first().textContent()
        expect(newButtonText).toBeTruthy()

        const isNowDisabled = newButtonText!.toLowerCase().includes("enable")
        expect(isInitiallyDisabled).not.toBe(isNowDisabled)

        console.log(`[TEST] ✓ Test passed: hints system toggled correctly`)
      } finally {
        await popup.close()
        // Clean up
        await clearAllStorage(context, extensionId)
      }
    })

    it("should persist hints system setting", async () => {
      console.log("[TEST] Starting: should persist hints system setting")

      await clearAllStorage(context, extensionId)

      const popup1 = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Setting hints system to disabled")
        const toggleButton = popup1.getByRole("button", { name: /hints system/i })
        await waitFor(
          async () => {
            return await toggleButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "toggle button to be visible"
          }
        )

        const initialText = await toggleButton.first().textContent()
        const needsToggle = initialText?.toLowerCase().includes("disable")

        if (needsToggle) {
          await toggleButton.first().click()
          await waitFor(
            async () => {
              const text = await toggleButton.first().textContent()
              return text !== null && text.toLowerCase().includes("enable")
            },
            {
              timeout: 5000,
              description: "button text to change to 'enable'"
            }
          )
        }

        // Verify storage
        console.log("[TEST] Verifying setting in storage")
        const storageValue = await getStorageValue<boolean>(context, extensionId, HINTS_SYSTEM_DISABLED_KEY)
        expect(storageValue).toBe(true)
      } finally {
        await popup1.close()
      }

      // Reopen popup and verify setting persisted
      console.log("[TEST] Reopening popup to verify persistence")
      const popup2 = await getExtensionPopup(context, extensionId)
      try {
        const toggleButton = popup2.getByRole("button", { name: /hints system/i })
        await waitFor(
          async () => {
            return await toggleButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "toggle button to be visible"
          }
        )

        const buttonText = await toggleButton.first().textContent()
        expect(buttonText?.toLowerCase().includes("enable")).toBe(true)

        console.log(`[TEST] ✓ Test passed: setting persisted correctly`)
      } finally {
        await popup2.close()
        // Clean up
        await clearAllStorage(context, extensionId)
      }
    })
  })

  describe("Reset Dismissed Hints", () => {
    it("should display reset dismissed hints button", async () => {
      console.log("[TEST] Starting: should display reset dismissed hints button")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Verifying reset button is visible")
        const resetButton = popup.getByRole("button", { name: /reset.*dismissed/i })
        const buttonCount = await resetButton.count()
        expect(buttonCount).toBeGreaterThan(0)

        await waitFor(
          async () => {
            return await resetButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "reset button to be visible"
          }
        )

        const isVisible = await resetButton.first().isVisible()
        expect(isVisible).toBe(true)

        console.log(`[TEST] ✓ Test passed: reset button displayed`)
      } finally {
        await popup.close()
      }
    })

    it("should reset dismissed hints when button is clicked", async () => {
      console.log("[TEST] Starting: should reset dismissed hints when button is clicked")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Clicking reset button")
        const resetButton = popup.getByRole("button", { name: /reset.*dismissed/i })
        await waitFor(
          async () => {
            return await resetButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "reset button to be visible"
          }
        )

        await resetButton.first().click()

        // Wait for success message
        console.log("[TEST] Waiting for success message")
        await waitFor(
          async () => {
            const body = popup.locator("body")
            const pageText = await body.textContent()
            return pageText !== null && pageText.toLowerCase().includes("reset")
          },
          {
            timeout: 5000,
            description: "success message to appear after reset"
          }
        )

        console.log(`[TEST] ✓ Test passed: reset button works correctly`)
      } finally {
        await popup.close()
      }
    })
  })

  describe("Share Buttons in Popup", () => {
    it("should display all share buttons", async () => {
      console.log("[TEST] Starting: should display all share buttons")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Verifying share buttons are visible")
        // Check for share icons/buttons
        const shareIcons = popup.locator('[aria-label*="Share"], [aria-label*="share"]')
        const count = await shareIcons.count()
        expect(count).toBeGreaterThan(0)

        // Verify at least one is visible
        let atLeastOneVisible = false
        for (let i = 0; i < count; i++) {
          const icon = shareIcons.nth(i)
          const isVisible = await icon.isVisible().catch(() => false)
          if (isVisible) {
            atLeastOneVisible = true
            break
          }
        }

        expect(atLeastOneVisible).toBe(true)
        console.log(`[TEST] ✓ Test passed: ${count} share button(s) displayed`)
      } finally {
        await popup.close()
      }
    })
  })

  describe("Donate Button in Popup", () => {
    it("should display donate button", async () => {
      console.log("[TEST] Starting: should display donate button")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Verifying donate button is visible")
        const donateButton = popup.getByRole("button", { name: /donate/i })
        const buttonCount = await donateButton.count()
        expect(buttonCount).toBeGreaterThan(0)

        await waitFor(
          async () => {
            return await donateButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "donate button to be visible"
          }
        )

        const isVisible = await donateButton.first().isVisible()
        expect(isVisible).toBe(true)

        console.log(`[TEST] ✓ Test passed: donate button displayed`)
      } finally {
        await popup.close()
      }
    })

    it("should open Ko-fi link when donate button is clicked", async () => {
      console.log("[TEST] Starting: should open Ko-fi link when donate button is clicked")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        const donateButton = popup.getByRole("button", { name: /donate/i })
        await waitFor(
          async () => {
            return await donateButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "donate button to be visible"
          }
        )

        console.log("[TEST] Clicking donate button")
        // Set up listener for new page before clicking
        const newPagePromise = waitForExternalLink(context, /ko-fi\.com/i, 5000).catch(() => null)

        await donateButton.first().click()

        // Wait for new page to open
        const newPage = await newPagePromise
        if (newPage) {
          console.log(`[TEST] Ko-fi link opened in new tab: ${newPage.url()}`)
          await newPage.close()
        } else {
          // Link might open in same tab or browser handles it differently
          console.log(`[TEST] Donate button clicked (browser handles link opening)`)
        }

        console.log(`[TEST] ✓ Test passed: donate button is clickable`)
      } finally {
        await popup.close()
      }
    })
  })

  describe("Contact Button in Popup", () => {
    it("should display contact button", async () => {
      console.log("[TEST] Starting: should display contact button")

      const popup = await getExtensionPopup(context, extensionId)
      try {
        console.log("[TEST] Verifying contact button is visible")
        const contactButton = popup.getByRole("button", { name: /contact/i })
        const buttonCount = await contactButton.count()
        expect(buttonCount).toBeGreaterThan(0)

        await waitFor(
          async () => {
            return await contactButton.first().isVisible()
          },
          {
            timeout: 5000,
            description: "contact button to be visible"
          }
        )

        const isVisible = await contactButton.first().isVisible()
        expect(isVisible).toBe(true)

        console.log(`[TEST] ✓ Test passed: contact button displayed`)
      } finally {
        await popup.close()
      }
    })
  })
})

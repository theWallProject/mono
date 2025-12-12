import type { BrowserContext, Page } from "playwright"

import { getExtensionPopupUrl } from "./browser"

/**
 * Navigate to a URL with a reliable wait strategy
 * Uses "load" instead of "networkidle" to avoid timeouts on sites with continuous network activity
 * Returns true if the page loaded successfully, false if it failed or redirected to a login page
 */
export async function navigateToUrl(page: Page, url: string, timeout = 30000): Promise<boolean> {
  try {
    await page.goto(url, { waitUntil: "load", timeout })
  } catch (error) {
    // Handle network errors (DNS failures, timeouts, etc.)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorMessageLower = errorMessage.toLowerCase()
    if (
      errorMessageLower.includes("err_name_not_resolved") ||
      errorMessageLower.includes("net::err") ||
      errorMessageLower.includes("timeout") ||
      errorMessageLower.includes("timeouterror")
    ) {
      console.log(`[TEST] Failed to load URL (network error): ${url} - ${errorMessage}`)
      return false
    }
    // Re-throw other errors
    throw error
  }

  // Check if page redirected to login/auth page
  // Wait a bit for any redirects to complete
  await page.waitForTimeout(500)
  const currentUrl = page.url()

  // Check for common login/auth page patterns
  const isLoginPage =
    currentUrl.includes("/authwall") ||
    currentUrl.includes("/login") ||
    currentUrl.includes("/signin") ||
    currentUrl.includes("/auth?") ||
    currentUrl.includes("authwall") ||
    (currentUrl.includes("linkedin.com") &&
      !currentUrl.includes("/company/") &&
      !currentUrl.includes("/in/") &&
      !currentUrl.includes("/feed"))

  if (isLoginPage) {
    console.log(`[TEST] Page redirected to login/auth page: ${currentUrl} (original: ${url})`)
    return false
  }

  return true
}

/**
 * Get extension popup page
 */
export async function getExtensionPopup(context: BrowserContext, extensionId: string): Promise<Page> {
  const popupUrl = getExtensionPopupUrl(extensionId)
  const page = await context.newPage()
  await page.goto(popupUrl, { waitUntil: "domcontentloaded" })
  return page
}

/**
 * Check if banner is displayed
 * Simply checks for the unique logo alt text
 */
export async function isBannerDisplayed(page: Page): Promise<boolean> {
  try {
    console.log("[TEST] Checking for banner on page:", page.url())

    // Look for our unique logo alt text - this is the simplest and most reliable way
    const logo = page.locator('img[alt="The Wall Logo"]')
    const count = await logo.count()
    const isVisible =
      count > 0 &&
      (await logo
        .first()
        .isVisible()
        .catch(() => false))

    console.log(`[TEST] Banner found: ${isVisible} (logo count: ${count})`)

    return isVisible
  } catch (error) {
    console.error("[TEST] Error checking for banner:", error)
    return false
  }
}

/**
 * Check if hints toast is shown
 * Only matches our extension's toast, not other elements with role="status"
 */
export async function isHintsToastShown(page: Page): Promise<boolean> {
  try {
    console.log("[TEST] Checking for hints toast on page:", page.url())

    // First, try to find our toast by looking for the icon directly (most reliable)
    const iconLocator = page.locator('img[alt="The Wall"]')
    const iconCount = await iconLocator.count()
    console.log(`[TEST] Found ${iconCount} elements with alt="The Wall"`)

    if (iconCount > 0) {
      // Check if any of these icons are in a toast-like container
      for (let i = 0; i < iconCount; i++) {
        const icon = iconLocator.nth(i)
        const isVisible = await icon.isVisible().catch(() => false)
        if (!isVisible) continue

        // Check if the icon is in a container with our toast styling
        const container = icon
          .locator("xpath=ancestor::*[contains(@style, '1b1b1b') or contains(@style, 'rgb(27, 27, 27)')]")
          .first()
        const containerCount = await container.count().catch(() => 0)
        if (containerCount > 0) {
          console.log(`[TEST] Found our extension's toast via icon at index ${i}`)
          return true
        }
      }
    }

    // Fallback: Look for elements with role="status" that contain our icon
    const statusElements = page.locator('[role="status"]')
    const count = await statusElements.count()
    console.log(`[TEST] Found ${count} elements with role="status"`)

    for (let i = 0; i < count; i++) {
      const element = statusElements.nth(i)
      const isVisible = await element.isVisible().catch(() => false)

      if (!isVisible) {
        continue
      }

      // Check if this element contains our extension's icon
      const hasOurIcon = await element
        .locator('img[alt="The Wall"]')
        .count()
        .catch(() => 0)

      // Check for our specific styling
      const styles = await element
        .evaluate((el) => {
          // Code runs in browser context - window exists here
          const computed = window.getComputedStyle(el)
          return {
            background: computed.backgroundColor,
            border: computed.border,
            borderRadius: computed.borderRadius
          }
        })
        .catch(() => null)

      // Check for hint-related text (our toast has specific text content)
      const text = await element.textContent().catch(() => "")
      const hasHintText = text && (text.includes("hint") || text.includes("Hint") || text.length > 10)

      console.log(
        `[TEST] Toast element ${i}: visible=${isVisible}, hasIcon=${hasOurIcon > 0}, hasHintText=${hasHintText}, styles=`,
        styles
      )

      // Our toast should have the icon and specific styling
      if (
        hasOurIcon > 0 ||
        (styles && (styles.background.includes("rgb(27, 27, 27)") || styles.background.includes("#1b1b1b")))
      ) {
        console.log(`[TEST] Found our extension's toast at index ${i}`)
        return true
      }
    }

    console.log("[TEST] Toast not found - no matching elements with our extension's characteristics")
    return false
  } catch (error) {
    console.error("[TEST] Error checking for toast:", error)
    return false
  }
}

/**
 * Set storage value in extension context
 */
export async function setStorageValue(
  context: BrowserContext,
  extensionId: string,
  key: string,
  value: unknown
): Promise<void> {
  const page = await context.newPage()
  try {
    const popupUrl = getExtensionPopupUrl(extensionId)
    await page.goto(popupUrl)
    await page.evaluate(
      ({ storageKey, storageValue }: { storageKey: string; storageValue: unknown }) => {
        // Code runs in extension context - chrome API exists here
        return new Promise<void>((resolve) => {
          chrome.storage.local.set({ [storageKey]: storageValue }, () => {
            resolve()
          })
        })
      },
      { storageKey: key, storageValue: value }
    )
  } finally {
    await page.close()
  }
}

/**
 * Wait for page to load and extension to process URL
 */
export async function waitForExtensionProcessing(page: Page, timeout = 10000): Promise<void> {
  console.log("[TEST] Waiting for page to load:", page.url())

  // Wait for page to be fully loaded (use "load" instead of "networkidle" to avoid timeouts)
  await page.waitForLoadState("load", { timeout })
  console.log("[TEST] Page loaded, waiting for extension processing...")

  // Give extension time to process
  await page.waitForTimeout(2000)
  console.log("[TEST] Extension processing wait complete")
}

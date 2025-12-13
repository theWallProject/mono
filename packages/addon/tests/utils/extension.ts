import type { BrowserContext, Page } from "playwright"

import { addBadLink } from "../fixtures/test-urls"
import { getExtensionPopupUrl } from "./browser"

/**
 * Safely close a page, preventing about:blank stuck tabs
 * Handles errors gracefully and checks if page is already closed
 */
export async function safeClosePage(page: Page): Promise<void> {
  try {
    if (!page.isClosed()) {
      await page.close()
    }
  } catch (error) {
    // Ignore errors when closing - page might already be closed or closing
    console.log(`[TEST] Error closing page (ignored): ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Navigate to a URL with a reliable wait strategy
 * Uses "load" instead of "networkidle" to avoid timeouts on sites with continuous network activity
 * Returns true if the page loaded successfully, false if it failed or redirected to a login page
 * Automatically adds URLs to bad list if they redirect
 */
export async function navigateToUrl(page: Page, url: string, timeout = 30000): Promise<boolean> {
  try {
    // Ensure page is ready before navigation
    const currentUrl = page.url()
    if (currentUrl === "about:blank") {
      // Page is on about:blank, ready to navigate
      console.log(`[TEST] Page is on about:blank, navigating to: ${url}`)
    }

    await page.goto(url, { waitUntil: "load", timeout })

    // Verify we actually navigated away from about:blank
    const finalUrl = page.url()
    if (finalUrl === "about:blank") {
      console.log(`[TEST] Navigation to ${url} resulted in about:blank - navigation failed`)
      addBadLink(url)
      return false
    }
  } catch (error) {
    // Handle network errors (DNS failures, timeouts, etc.)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorMessageLower = errorMessage.toLowerCase()
    if (
      errorMessageLower.includes("err_name_not_resolved") ||
      errorMessageLower.includes("net::err") ||
      errorMessageLower.includes("timeout") ||
      errorMessageLower.includes("timeouterror") ||
      errorMessageLower.includes("navigation timeout")
    ) {
      console.log(`[TEST] Failed to load URL (network error): ${url} - ${errorMessage}`)
      // Check if page is stuck on about:blank
      const stuckUrl = page.url()
      if (stuckUrl === "about:blank") {
        console.log(`[TEST] Page is stuck on about:blank after navigation failure`)
      }
      addBadLink(url)
      return false
    }
    // Re-throw other errors
    throw error
  }

  // Check if page redirected to login/auth page
  // Wait for navigation to complete using smart waiting
  try {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 })
  } catch (error) {
    // If page doesn't load, it might be stuck
    const stuckUrl = page.url()
    if (stuckUrl === "about:blank") {
      console.log(`[TEST] Page stuck on about:blank after navigation`)
      addBadLink(url)
      return false
    }
    // Re-throw if it's a different issue
    throw error
  }

  const currentUrl = page.url()

  // Check if still on about:blank (shouldn't happen but safety check)
  if (currentUrl === "about:blank") {
    console.log(`[TEST] Page still on about:blank after navigation to ${url}`)
    addBadLink(url)
    return false
  }

  // Check if URL was redirected to a different domain
  try {
    const requestedHost = new URL(url).hostname
    const currentHost = new URL(currentUrl).hostname

    // If hostname changed, it's a redirect
    if (requestedHost !== currentHost) {
      console.log(`[TEST] URL redirected to different domain: ${currentUrl} (original: ${url})`)
      addBadLink(url)
      return false
    }
  } catch {
    // If URL parsing fails, skip redirect check
  }

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
    addBadLink(url)
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
 * Checks ONLY the logo - single thing, fast and reliable
 */
export async function isBannerDisplayed(page: Page): Promise<boolean> {
  console.log("[TEST] Checking for banner on page:", page.url())
  try {
    const logo = page.locator('img[alt="The Wall Logo"]')
    const logoCount = await logo.count()
    console.log(`[TEST] Found ${logoCount} logo element(s)`)

    if (logoCount === 0) {
      console.log("[TEST] Banner NOT displayed: no logo found")
      return false
    }

    const logoVisible = await logo
      .first()
      .isVisible()
      .catch(() => false)

    console.log(`[TEST] Logo visible: ${logoVisible}`)

    if (logoVisible) {
      console.log("[TEST] Banner IS displayed: logo is visible")
    } else {
      console.log("[TEST] Banner NOT displayed: logo exists but not visible")
    }

    return logoVisible
  } catch (error) {
    console.error("[TEST] Error checking for banner:", error)
    return false
  }
}

/**
 * Wait for banner to appear using Playwright's optimized waiting
 * Waits ONLY for the logo - single thing, fast
 */
export async function waitForBanner(page: Page): Promise<void> {
  console.log("[TEST] Waiting for banner to appear (checking logo)")
  await page.waitForSelector('img[alt="The Wall Logo"]', {
    state: "visible"
  })
  console.log("[TEST] ✓ Banner appeared (logo is visible)")
}

/**
 * Check if hints toast is shown
 * Fast check - looks for our icon with hint text nearby
 */
export async function isHintsToastShown(page: Page): Promise<boolean> {
  try {
    // Look for the icon directly - it's in the hint toast
    const icon = page.locator('img[alt="The Wall"]')
    const count = await icon.count().catch(() => 0)

    if (count === 0) {
      return false
    }

    // Check if any icon is visible and has hint text nearby
    for (let i = 0; i < count; i++) {
      const iconElement = icon.nth(i)
      const isVisible = await iconElement.isVisible().catch(() => false)
      if (!isVisible) continue

      // Check if this icon is in a toast container by looking for hint text
      const isInToast = await iconElement
        .evaluate((img) => {
          let parent = img.parentElement
          let depth = 0
          while (parent && depth < 5) {
            // Check if parent contains text (hint text is in a span sibling)
            const text = parent.textContent || ""
            // Hint toast has text content (not just the icon)
            // Check if there's meaningful text (more than just whitespace/icon alt text)
            if (text.trim().length > 10) {
              // Make sure it's not the banner (banner has "The Wall Logo" alt, not "The Wall")
              // And it has text content, so it's likely the hint toast
              return true
            }
            parent = parent.parentElement
            depth++
          }
          return false
        })
        .catch(() => false)

      if (isInToast) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error("[TEST] Error checking for toast:", error)
    return false
  }
}

/**
 * Wait for hints toast to appear using Playwright's optimized waiting
 * Much faster than polling with waitFor
 */
export async function waitForHintsToast(page: Page): Promise<void> {
  // Wait for the icon to appear
  await page.waitForSelector('img[alt="The Wall"]', { state: "visible" })

  // Verify it's in a toast container by checking for hint text
  await page.waitForFunction(() => {
    const icons = Array.from(document.querySelectorAll('img[alt="The Wall"]'))
    return icons.some((icon) => {
      let parent = icon.parentElement
      let depth = 0
      while (parent && depth < 5) {
        // Check if parent contains hint text (meaningful text content)
        const text = parent.textContent || ""
        if (text.trim().length > 10) {
          return true
        }
        parent = parent.parentElement
        depth++
      }
      return false
    })
  })
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
 * Internal timeout: max 3 seconds after page load
 */
export async function waitForExtensionProcessing(page: Page): Promise<void> {
  console.log("[TEST] Waiting for page to load:", page.url())

  // Wait for page to be fully loaded (use "load" instead of "networkidle" to avoid timeouts)
  await page.waitForLoadState("load")
  console.log("[TEST] Page loaded, waiting for extension processing...")

  // Wait for DOM to be ready (content script injection point)
  await page.waitForLoadState("domcontentloaded")

  // Wait for extension to process - use fast native waiting for banner OR hint
  try {
    // Wait for either banner logo or hint toast icon
    await Promise.race([
      page.waitForSelector('img[alt="The Wall Logo"]', { state: "visible" }),
      (async () => {
        await page.waitForSelector('img[alt="The Wall"]', { state: "visible" })
        // Verify it's in a toast by checking for hint text
        await page.waitForFunction(() => {
          const icons = Array.from(document.querySelectorAll('img[alt="The Wall"]'))
          return icons.some((icon) => {
            let parent = icon.parentElement
            let depth = 0
            while (parent && depth < 5) {
              // Check if parent contains hint text (meaningful text content)
              const text = parent.textContent || ""
              if (text.trim().length > 10) {
                return true
              }
              parent = parent.parentElement
              depth++
            }
            return false
          })
        })
      })()
    ])
    console.log(`[TEST] Extension processing complete (banner/hint appeared)`)
  } catch {
    // Extension might not show banner/hint for clean URLs - that's okay
    // Just ensure we've waited at least a minimal amount for content script injection
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    console.log("[TEST] Extension processing wait complete (no banner/hint expected for this URL)")
  }
}

/**
 * Wait for a condition to be true with retries and timeout
 * @param condition Function that returns a promise resolving to boolean
 * @param options Timeout, interval, and description options
 * @returns Promise that resolves when condition is true, or rejects on timeout
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  options: { timeout?: number; interval?: number; description: string }
): Promise<void> {
  const { timeout = 10000, interval = 100, description } = options
  const startTime = Date.now()
  let attemptCount = 0

  console.log(`[TEST] Waiting for: ${description} (timeout: ${timeout}ms)`)

  while (Date.now() - startTime < timeout) {
    attemptCount++
    const elapsed = Date.now() - startTime
    const result = await condition()

    if (result) {
      console.log(`[TEST] ✓ Condition met: ${description} (attempt ${attemptCount}, ${elapsed}ms)`)
      return
    }

    // Log progress every 5 attempts or every 500ms, whichever comes first
    if (attemptCount % 5 === 0 || elapsed % 500 < interval) {
      console.log(`[TEST] ⏳ Still waiting for: ${description} (attempt ${attemptCount}, ${elapsed}ms elapsed)`)
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  const totalElapsed = Date.now() - startTime
  console.error(`[TEST] ✗ Timeout waiting for: ${description} after ${totalElapsed}ms (${attemptCount} attempts)`)
  throw new Error(`Timeout waiting for ${description} after ${timeout}ms (${attemptCount} attempts)`)
}

/**
 * Wait for banner button to appear
 * @param page - Playwright page
 * @param buttonName - Button name pattern (regex or string)
 * @param options - Timeout options
 * @returns Locator for the button
 * @throws Error if button doesn't appear within timeout
 */
export async function waitForBannerButton(
  page: Page,
  buttonName: string | RegExp
): Promise<ReturnType<Page["getByRole"]>> {
  console.log(`[TEST] Finding banner button: ${buttonName} (should be immediately available after banner)`)

  const buttonPattern = typeof buttonName === "string" ? new RegExp(buttonName, "i") : buttonName
  const button = page.getByRole("button", { name: buttonPattern })

  // Button should be immediately available after banner appears
  // Just verify it exists and is visible (no waiting needed)
  const count = await button.count()
  if (count === 0) {
    throw new Error(`Banner button "${buttonName}" not found. Banner should be visible first.`)
  }

  const isVisible = await button
    .first()
    .isVisible()
    .catch(() => false)
  if (!isVisible) {
    throw new Error(`Banner button "${buttonName}" exists but is not visible.`)
  }

  console.log(`[TEST] Banner button found: ${buttonName}`)
  return button
}

/**
 * Check if alternatives menu is visible
 * @param page - Playwright page
 * @returns Locator for alternatives menu if visible, null otherwise
 */
export async function getAlternativesMenu(page: Page): Promise<ReturnType<Page["locator"]> | null> {
  console.log("[TEST] Checking for alternatives menu")
  const menu = page.locator('[class*="altPopupMenu"], [class*="altPopupList"]')
  const count = await menu.count()

  if (count === 0) {
    console.log("[TEST] Alternatives menu not found")
    return null
  }

  const isVisible = await menu
    .first()
    .isVisible()
    .catch(() => false)
  if (!isVisible) {
    console.log("[TEST] Alternatives menu exists but is not visible")
    return null
  }

  console.log("[TEST] Alternatives menu found and visible")
  return menu.first()
}

/**
 * Wait for external link to open in new page
 * @param context - Browser context
 * @param expectedUrlPattern - Expected URL pattern (string or regex)
 * @param timeout - Timeout in milliseconds
 * @returns The new page with the external link
 * @throws Error if new page doesn't open with expected URL
 */
export async function waitForExternalLink(
  context: BrowserContext,
  expectedUrlPattern: string | RegExp,
  timeout = 10000
): Promise<Page> {
  console.log(`[TEST] Waiting for external link to open: ${expectedUrlPattern}`)

  const pattern = typeof expectedUrlPattern === "string" ? new RegExp(expectedUrlPattern, "i") : expectedUrlPattern

  return new Promise<Page>((resolve, reject) => {
    const startTime = Date.now()

    const checkPages = async (): Promise<void> => {
      const pages = context.pages()
      for (const page of pages) {
        const url = page.url()
        if (pattern.test(url)) {
          console.log(`[TEST] External link opened: ${url}`)
          resolve(page)
          return
        }
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for external link matching ${expectedUrlPattern} to open`))
        return
      }

      // Check again after a short delay
      setTimeout(() => {
        checkPages().catch(reject)
      }, 100)
    }

    // Start checking immediately
    checkPages().catch(reject)

    // Also listen for new pages
    context.on("page", async (page) => {
      await page.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {})
      const url = page.url()
      if (pattern.test(url)) {
        console.log(`[TEST] External link opened via page event: ${url}`)
        resolve(page)
      }
    })
  })
}

/**
 * Debug hint state - check why a hint might not be showing
 * Returns diagnostic information about hint blocking conditions
 */
export async function debugHintState(
  context: BrowserContext,
  extensionId: string,
  hintId: string
): Promise<{
  hintsSystemDisabled: boolean
  permanentlyDismissed: boolean
  shownRecently: boolean
  lastShownTimestamp: number | null
  storageKeys: string[]
}> {
  const page = await context.newPage()
  try {
    const popupUrl = getExtensionPopupUrl(extensionId)
    await page.goto(popupUrl, { waitUntil: "domcontentloaded" })

    const debugInfo = await page.evaluate(
      ({
        hintId,
        hintShownPrefix,
        hintDismissedPermPrefix,
        hintsSystemDisabledKey
      }: {
        hintId: string
        hintShownPrefix: string
        hintDismissedPermPrefix: string
        hintsSystemDisabledKey: string
      }) => {
        return new Promise<{
          hintsSystemDisabled: boolean
          permanentlyDismissed: boolean
          shownRecently: boolean
          lastShownTimestamp: number | null
          storageKeys: string[]
        }>((resolve) => {
          chrome.storage.local.get(null, (items) => {
            const hintShownKey = `${hintShownPrefix}${hintId}`
            const hintDismissedKey = `${hintDismissedPermPrefix}${hintId}`

            const hintsSystemDisabled = items[hintsSystemDisabledKey] === true
            const permanentlyDismissed = items[hintDismissedKey] === true
            const lastShownTimestamp: number | undefined =
              typeof items[hintShownKey] === "number" ? items[hintShownKey] : undefined

            const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000
            const now = Date.now()
            const shownRecently = lastShownTimestamp !== undefined && now - lastShownTimestamp < THREE_DAYS_MS

            // Get all hint-related keys for debugging
            const storageKeys = Object.keys(items).filter(
              (key) =>
                key.startsWith(hintShownPrefix) ||
                key.startsWith(hintDismissedPermPrefix) ||
                key === hintsSystemDisabledKey
            )

            resolve({
              hintsSystemDisabled,
              permanentlyDismissed,
              shownRecently,
              lastShownTimestamp: lastShownTimestamp ?? null,
              storageKeys
            })
          })
        })
      },
      {
        hintId,
        hintShownPrefix: "hint_shown_",
        hintDismissedPermPrefix: "hint_dismissed_perm_",
        hintsSystemDisabledKey: "hints_system_disabled"
      }
    )

    return debugInfo
  } finally {
    await page.close()
  }
}

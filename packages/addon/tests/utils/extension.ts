import type { BrowserContext, Page } from "playwright"

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
 */
export async function navigateToUrl(page: Page, url: string, timeout = 30000): Promise<boolean> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout })
    console.log(`[TEST] Page navigated to: ${url}`)

    // Verify we actually navigated away from about:blank
    const finalUrl = page.url()
    if (finalUrl === "about:blank") {
      console.log(`[TEST] Navigation to ${url} resulted in about:blank - navigation failed`)
      return false
    }

    // Wait for page to be ready
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 })
    console.log(`[TEST] Page loaded successfully: ${url}`)
    return true
  } catch (error) {
    // Handle network errors (DNS failures, timeouts, etc.)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log(`[TEST] Failed to load URL: ${url} - ${errorMessage}`)
    return false
  }
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
 * Check if hints toast is shown (immediate check, no waiting)
 * Returns true if toast is visible, false otherwise
 * Uses shadow DOM traversal to find the toast icon
 */
export async function isHintsToastShown(page: Page): Promise<boolean> {
  try {
    const result = await page.evaluate(() => {
      // First, find plasmo-csui component
      const plasmoCsui = document.querySelector("plasmo-csui")
      if (!plasmoCsui) {
        return false
      }

      if (!plasmoCsui.shadowRoot) {
        return false
      }

      // Search inside plasmo-csui shadow root
      const searchInRoot = (root: Document | ShadowRoot | Element): boolean => {
        // Search for images in current root
        const images = root.querySelectorAll('img[alt="The Wall"]')

        for (const img of Array.from(images)) {
          const rect = img.getBoundingClientRect()
          const style = window.getComputedStyle(img)
          const isVisible =
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            parseFloat(style.opacity) > 0

          if (isVisible) {
            return true
          }
        }

        // Recursively search nested shadow roots
        const allElements = root.querySelectorAll("*")
        for (const el of Array.from(allElements)) {
          if (el.shadowRoot) {
            if (searchInRoot(el.shadowRoot)) {
              return true
            }
          }
        }

        return false
      }

      return searchInRoot(plasmoCsui.shadowRoot)
    })

    return result
  } catch {
    return false
  }
}

/**
 * Wait until hints toast is shown
 * Waits for the icon to appear, handling shadow DOM if present
 */
export async function waitUntilHintShown(page: Page, timeout = 10000): Promise<boolean> {
  console.log(`[TEST] waitUntilHintShown: Starting check (timeout: ${timeout}ms)`)
  try {
    // First wait for plasmo-csui element to appear
    await page.waitForSelector("plasmo-csui", { timeout: 5000 }).catch(() => {
      console.log(`[TEST] waitUntilHintShown: plasmo-csui element not found within 5s`)
    })

    await waitFor(
      async () => {
        const result = await page.evaluate(() => {
          // First, find plasmo-csui component
          const plasmoCsui = document.querySelector("plasmo-csui")
          if (!plasmoCsui) {
            return { found: false, details: "plasmo-csui element not found" }
          }

          if (!plasmoCsui.shadowRoot) {
            return { found: false, details: "plasmo-csui found but no shadow root" }
          }

          // Search inside plasmo-csui shadow root
          const searchInRoot = (
            root: Document | ShadowRoot | Element,
            depth = 0
          ): { found: boolean; details: string } => {
            // Search for images in current root
            const images = root.querySelectorAll('img[alt="The Wall"]')
            let foundCount = 0
            let visibleCount = 0

            for (const img of Array.from(images)) {
              foundCount++
              const rect = img.getBoundingClientRect()
              const style = window.getComputedStyle(img)
              const isVisible =
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                parseFloat(style.opacity) > 0

              if (isVisible) {
                visibleCount++
                return { found: true, details: `Found visible img at depth ${depth} in plasmo-csui shadow root` }
              }
            }

            // Recursively search nested shadow roots (in case there are multiple levels)
            const allElements = root.querySelectorAll("*")
            let shadowRootCount = 0
            for (const el of Array.from(allElements)) {
              if (el.shadowRoot) {
                shadowRootCount++
                const result = searchInRoot(el.shadowRoot, depth + 1)
                if (result.found) return result
              }
            }

            return {
              found: false,
              details: `Depth ${depth} in plasmo-csui: found ${foundCount} img(s), ${visibleCount} visible, ${shadowRootCount} nested shadow roots`
            }
          }

          return searchInRoot(plasmoCsui.shadowRoot, 0)
        })

        console.log(`[TEST] waitUntilHintShown: Check result - found: ${result.found}, details: ${result.details}`)

        return result.found
      },
      {
        timeout,
        interval: 200,
        description: "hints toast to appear"
      }
    )

    console.log(`[TEST] waitUntilHintShown: ✓ Toast found!`)
    return true
  } catch (error) {
    console.error(`[TEST] waitUntilHintShown: ✗ Failed or timeout:`, error)
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

    // eslint-disable-next-line @typescript-eslint/require-await -- No async operations, but returns Promise for error handling with .catch()
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

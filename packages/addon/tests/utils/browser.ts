import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { chromium, type Browser, type BrowserContext } from "playwright"

// Global store for browser contexts (so we can pause them on failure)
const browserContexts: BrowserContext[] = []

/**
 * Register a browser context (called when browser is launched)
 */
export function registerBrowserContext(context: BrowserContext): void {
  browserContexts.push(context)
}

/**
 * Get all registered browser contexts
 */
export function getBrowserContexts(): BrowserContext[] {
  return browserContexts
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get the extension build path
 */
export function getExtensionPath(): string {
  const extensionPath = path.resolve(__dirname, "../../build/chrome-mv3-prod")
  return extensionPath
}

/**
 * Launch Chrome with extension loaded
 */
export async function launchBrowserWithExtension(): Promise<{
  browser: Browser
  context: BrowserContext
  extensionId: string
}> {
  const extensionPath = getExtensionPath()
  const manifestPath = path.join(extensionPath, "manifest.json")

  // Verify extension exists before launching
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Extension not found at ${extensionPath}. Please build the extension first with: pnpm build:chrome`)
  }

  // Launch browser with extension and devtools open
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    devtools: true, // Open devtools automatically
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  })

  // Register context so we can pause it on test failure
  registerBrowserContext(context)

  // Auto-deny all permission requests for all pages
  // This blocks notifications, geolocation, camera, microphone, etc.
  context.on("page", (page) => {
    // Wait for page to have a valid URL, then deny all permissions
    page.once("domcontentloaded", () => {
      void (async () => {
        try {
          const url = page.url()
          // Only deny permissions for http/https URLs (skip chrome://, about:, etc.)
          if (url.startsWith("http://") || url.startsWith("https://")) {
            const origin = new URL(url).origin
            await context.grantPermissions([], { origin })
          }
        } catch {
          // Ignore errors (invalid URLs, etc.)
        }
      })()
    })
  })

  try {
    // Wait for extension to load
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Get extension ID using the official Chrome API: chrome.runtime.id
    // This is the only supported method - fail hard if it doesn't work
    const extensionId = await getExtensionIdFromRuntime(context)

    // Get browser instance from context
    const browser = context.browser()

    if (!browser) {
      throw new Error("Failed to get browser instance")
    }

    return { browser, context, extensionId }
  } catch (error) {
    // Clean up context if we fail
    await context.close()
    throw error
  }
}

/**
 * Get extension ID using the official Chrome API: chrome.runtime.id
 * This is the only supported method - fail hard if it doesn't work
 */
async function getExtensionIdFromRuntime(context: BrowserContext): Promise<string> {
  // First, find the extension ID from chrome://extensions-internals
  // which shows service worker URLs with extension IDs
  const internalsPage = await context.newPage()

  try {
    await internalsPage.goto("chrome://extensions-internals/", { waitUntil: "domcontentloaded", timeout: 10000 })
    await internalsPage.waitForTimeout(1000)

    // Extract extension ID from service worker URLs shown on the page
    const extensionId = await internalsPage.evaluate(() => {
      const pageText = document.body.innerText || ""
      const urlMatch = pageText.match(/chrome-extension:\/\/([a-z]{32})\//i)
      if (!urlMatch || !urlMatch[1] || urlMatch[1].length !== 32) {
        throw new Error(
          "Could not find extension ID in chrome://extensions-internals page. Extension may not have loaded."
        )
      }
      return urlMatch[1]
    })

    // Verify using the official Chrome API: chrome.runtime.id
    const popupPage = await context.newPage()
    try {
      const popupUrl = `chrome-extension://${extensionId}/popup.html`
      await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded", timeout: 5000 })

      // Use the official Chrome API to get the extension ID
      // Note: chrome is always available in extension pages, but we check for safety
      const verifiedId = await popupPage.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ok here
        if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.id) {
          throw new Error("chrome.runtime.id is not available. Extension context may not be accessible.")
        }
        return chrome.runtime.id
      })

      if (verifiedId !== extensionId) {
        throw new Error(`Extension ID mismatch: expected ${extensionId}, got ${verifiedId}`)
      }

      return verifiedId
    } finally {
      await popupPage.close()
    }
  } finally {
    await internalsPage.close()
  }
}

/**
 * Get extension popup URL
 */
export function getExtensionPopupUrl(extensionId: string): string {
  return `chrome-extension://${extensionId}/popup.html`
}

/**
 * Playwright-based homepage fetcher and link extractor.
 *
 * Navigates to a company's website using a headless browser, waits for JS rendering,
 * and extracts only user-facing clickable links (<a href> elements) from the DOM.
 * Hidden source-only elements like <link> (stylesheets, canonical, preload) are
 * intentionally excluded — they are not user-facing and generate noise.
 *
 * Detects and reports:
 *   - Cloudflare challenge pages
 *   - Cookie consent popups (attempts to dismiss them)
 *   - HTTP errors (4xx, 5xx)
 *   - Timeouts
 *   - Non-HTML content types (PDF, images, etc.)
 *   - Empty pages
 */

import { type Browser, type BrowserContext, type Page, chromium } from "playwright"

import { HOMEPAGE_AI_EXTRACTOR_CONFIG } from "./config"
import type { CompanyLogger } from "./company_logger"

/** Result of fetching and extracting links from a company homepage */
export type LinkExtractionResult = {
  /** The final URL after any redirects */
  finalUrl: string
  /** Whether the page redirected from the original URL */
  redirected: boolean
  /** Full page HTML */
  html: string
  /** All unique user-facing clickable links (<a href>) found in the page */
  allLinks: string[]
  /** HTML content of the footer section (if found) */
  footerHtml: string | null
  /** HTML content of the header section (if found) */
  headerHtml: string | null
  /** Page title */
  pageTitle: string
}

/**
 * Known Cloudflare challenge indicators.
 * If any of these are found in the page, we consider it a Cloudflare block.
 */
const CLOUDFLARE_INDICATORS = [
  "cf-browser-verification",
  "cf_chl_opt",
  "Just a moment...",
  "Checking your browser",
  "Enable JavaScript and cookies to continue",
  "Attention Required! | Cloudflare",
  "cf-challenge-running",
  "ray ID"
]

/**
 * Common cookie consent button selectors, ordered by specificity.
 * We try each in order and click the first one found.
 */
const COOKIE_CONSENT_SELECTORS = [
  // Common accept button texts
  'button:has-text("Accept all")',
  'button:has-text("Accept All")',
  'button:has-text("Accept cookies")',
  'button:has-text("Accept Cookies")',
  'button:has-text("I agree")',
  'button:has-text("I Accept")',
  'button:has-text("Allow all")',
  'button:has-text("Allow All")',
  'button:has-text("Got it")',
  'button:has-text("OK")',
  'button:has-text("Agree")',
  // Common ID/class patterns
  "#onetrust-accept-btn-handler",
  "#accept-cookies",
  ".cookie-consent-accept",
  '[data-testid="cookie-accept"]',
  '[aria-label="Accept cookies"]',
  "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
  ".cc-accept",
  ".cc-btn.cc-allow"
]

/**
 * Detects if a page is a Cloudflare challenge/block page.
 */
const isCloudflareChallenge = (html: string, title: string): boolean => {
  const lowerHtml = html.toLowerCase()
  const lowerTitle = title.toLowerCase()

  for (const indicator of CLOUDFLARE_INDICATORS) {
    if (lowerHtml.includes(indicator.toLowerCase()) || lowerTitle.includes(indicator.toLowerCase())) {
      return true
    }
  }

  return false
}

/**
 * Attempts to dismiss cookie consent popups by clicking common accept buttons.
 * Non-critical — if no popup is found or clicking fails, we continue silently.
 */
const tryDismissCookieConsent = async (page: Page, logger: CompanyLogger): Promise<void> => {
  for (const selector of COOKIE_CONSENT_SELECTORS) {
    try {
      const element = await page.$(selector)
      if (element) {
        const isVisible = await element.isVisible()
        if (isVisible) {
          await element.click({ timeout: 2000 })
          logger.log(`Dismissed cookie consent popup via: ${selector}`)
          // Wait a moment for the popup to close
          await page.waitForTimeout(500)
          return
        }
      }
    } catch {
      // Selector not found or click failed — try next
      continue
    }
  }
}

/**
 * Normalizes a URL string — ensures https:// prefix, trims whitespace.
 * Throws if the input is empty.
 */
const normalizeUrl = (url: string): string => {
  if (!url || url.trim().length === 0) {
    throw new Error("Cannot normalize empty URL")
  }

  let normalized = url.trim()
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`
  }
  return normalized
}

/**
 * Resolves a potentially relative URL against a base URL.
 * Returns null if the URL is invalid or is a non-HTTP scheme (mailto:, tel:, javascript:, etc.)
 */
const resolveUrl = (href: string, baseUrl: string): string | null => {
  if (!href || href.trim().length === 0) return null

  const trimmed = href.trim()

  // Skip non-HTTP schemes
  const nonHttpSchemes = ["mailto:", "tel:", "javascript:", "data:", "blob:", "ftp:", "#", "about:"]
  for (const scheme of nonHttpSchemes) {
    if (trimmed.toLowerCase().startsWith(scheme)) return null
  }

  // Reject href values that contain characters indicating JavaScript code or invalid URLs.
  // Parentheses, curly braces, semicolons, and similar characters appear in inline JS
  // snippets (e.g., "cookiebot.show()", "void(0)", "return false;") that the URL
  // constructor would wrongly resolve as relative paths.
  if (/[(){};<>`]/.test(trimmed)) return null

  try {
    const resolved = new URL(trimmed, baseUrl)
    // Only keep http/https URLs
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null
    // Reject URLs whose hostname has no dot — these are not real domains
    // (e.g., href="http://privacy-policy" parses as hostname "privacy-policy")
    if (!resolved.hostname.includes(".")) return null
    return resolved.href
  } catch {
    return null
  }
}

/**
 * Removes trailing slashes from a URL (but preserves protocol://).
 */
const removeTrailingSlash = (url: string): string => {
  return url.replace(/\/+$/, "")
}

/** Shared browser instance for headless extraction */
let sharedBrowser: Browser | null = null

/**
 * Gets or creates a shared headless browser instance.
 * Reusing the browser across companies avoids the overhead of launching Chromium for each one.
 */
export const getOrCreateBrowser = async (): Promise<Browser> => {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser
  }

  const config = HOMEPAGE_AI_EXTRACTOR_CONFIG.playwright

  sharedBrowser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      `--user-agent=${config.userAgent}`
    ]
  })

  return sharedBrowser
}

/**
 * Closes the shared browser instance. Call this when done with all companies.
 */
export const closeSharedBrowser = async (): Promise<void> => {
  if (sharedBrowser) {
    try {
      if (sharedBrowser.isConnected()) {
        await sharedBrowser.close()
      }
    } catch {
      // Browser already closed
    }
    sharedBrowser = null
  }
}

/**
 * Fetches a company homepage and extracts all links from the DOM.
 *
 * EXPECTED FAILURES (thrown as ExpectedExtractionError):
 *   - Network timeout / DNS failure
 *   - HTTP 4xx/5xx
 *   - Cloudflare/bot detection
 *   - Non-HTML content type
 *   - Empty page / no links
 *   - SSL errors
 *
 * UNEXPECTED FAILURES (thrown as regular Error):
 *   - Playwright crashes
 *   - Code bugs
 */
export class ExpectedExtractionError extends Error {
  constructor(
    message: string,
    public readonly errorType: string
  ) {
    super(message)
    this.name = "ExpectedExtractionError"
  }
}

export const extractLinksFromHomepage = async (
  websiteUrl: string,
  logger: CompanyLogger
): Promise<LinkExtractionResult> => {
  const config = HOMEPAGE_AI_EXTRACTOR_CONFIG.playwright
  const normalizedUrl = normalizeUrl(websiteUrl)
  logger.log(`Fetching: ${normalizedUrl}`)

  const browser = await getOrCreateBrowser()
  let context: BrowserContext | null = null
  let page: Page | null = null

  try {
    context = await browser.newContext({
      userAgent: config.userAgent,
      viewport: config.viewport,
      ignoreHTTPSErrors: false, // We want to detect SSL errors
      javaScriptEnabled: true
    })

    page = await context.newPage()

    // Navigate to the page
    let response
    try {
      response = await page.goto(normalizedUrl, {
        waitUntil: "domcontentloaded",
        timeout: config.timeout
      })
    } catch (navError) {
      const msg = navError instanceof Error ? navError.message : String(navError)

      // Classify navigation errors
      if (msg.includes("net::ERR_NAME_NOT_RESOLVED") || msg.includes("DNS")) {
        throw new ExpectedExtractionError(
          `DNS resolution failed for ${normalizedUrl}: ${msg}`,
          "DNS_FAILURE"
        )
      }
      if (msg.includes("net::ERR_CONNECTION_REFUSED")) {
        throw new ExpectedExtractionError(
          `Connection refused for ${normalizedUrl}: ${msg}`,
          "CONNECTION_REFUSED"
        )
      }
      if (msg.includes("net::ERR_CONNECTION_TIMED_OUT") || msg.includes("Timeout")) {
        throw new ExpectedExtractionError(
          `Connection timed out for ${normalizedUrl}: ${msg}`,
          "TIMEOUT"
        )
      }
      if (msg.includes("net::ERR_SSL") || msg.includes("SSL") || msg.includes("certificate")) {
        throw new ExpectedExtractionError(
          `SSL error for ${normalizedUrl}: ${msg}`,
          "SSL_ERROR"
        )
      }
      if (msg.includes("net::ERR_CONNECTION_RESET")) {
        throw new ExpectedExtractionError(
          `Connection reset for ${normalizedUrl}: ${msg}`,
          "CONNECTION_RESET"
        )
      }
      if (msg.includes("net::ERR_TOO_MANY_REDIRECTS")) {
        throw new ExpectedExtractionError(
          `Too many redirects for ${normalizedUrl}: ${msg}`,
          "TOO_MANY_REDIRECTS"
        )
      }
      // Any other navigation error is also expected (network issues)
      throw new ExpectedExtractionError(
        `Navigation failed for ${normalizedUrl}: ${msg}`,
        "NAVIGATION_FAILED"
      )
    }

    if (!response) {
      throw new ExpectedExtractionError(
        `No response received from ${normalizedUrl}`,
        "NO_RESPONSE"
      )
    }

    // Check HTTP status
    const status = response.status()
    if (status >= 400) {
      throw new ExpectedExtractionError(
        `HTTP ${status} error for ${normalizedUrl}: ${response.statusText()}`,
        `HTTP_${status}`
      )
    }

    // Check content type — we only handle HTML
    const contentType = response.headers()["content-type"] ?? ""
    if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new ExpectedExtractionError(
        `Non-HTML content type for ${normalizedUrl}: ${contentType}`,
        "NON_HTML_CONTENT"
      )
    }

    // Wait for network to settle (catch JS-rendered content)
    try {
      await page.waitForLoadState("networkidle", {
        timeout: config.networkIdleTimeout
      })
    } catch {
      // Network idle timeout is non-fatal — page may have persistent connections
      logger.log("Network idle timeout — continuing with current state")
    }

    // Try to dismiss cookie consent popups
    await tryDismissCookieConsent(page, logger)

    // Get page info
    const finalUrl = page.url()
    const redirected = normalizedUrl !== finalUrl
    const pageTitle = await page.title()

    if (redirected) {
      logger.log(`Redirected: ${normalizedUrl} -> ${finalUrl}`)
    }

    // Get full page HTML
    const html = await page.content()

    if (!html || html.trim().length === 0) {
      throw new ExpectedExtractionError(
        `Empty page content from ${normalizedUrl}`,
        "EMPTY_PAGE"
      )
    }

    // Detect Cloudflare challenge
    if (isCloudflareChallenge(html, pageTitle)) {
      // Save HTML for debugging even on Cloudflare blocks
      logger.saveHtml(html)
      throw new ExpectedExtractionError(
        `Cloudflare challenge/block detected for ${normalizedUrl}. Page title: "${pageTitle}"`,
        "CLOUDFLARE_BLOCK"
      )
    }

    logger.saveHtml(html)

    // Extract only user-facing clickable links from the DOM.
    // We intentionally skip <link> elements (stylesheets, canonical, preload, DNS prefetch, etc.)
    // and <area> elements (image maps — extremely rare) because they are not visible/clickable
    // by the user and pollute the link list with noise (asset URLs, CDN domains, etc.).
    const rawLinks = await page.evaluate(() => {
      const links: string[] = []

      // <a href> elements — the only truly user-facing clickable links
      const anchors = document.querySelectorAll("a[href]")
      for (const anchor of anchors) {
        const href = anchor.getAttribute("href")
        if (href) links.push(href)
      }

      return links
    })

    // Resolve relative URLs and deduplicate
    const resolvedLinks: Set<string> = new Set()
    for (const href of rawLinks) {
      const resolved = resolveUrl(href, finalUrl)
      if (resolved) {
        resolvedLinks.add(removeTrailingSlash(resolved))
      }
    }

    const allLinks = [...resolvedLinks].sort()

    logger.log(`Extracted ${allLinks.length} unique links from page`)
    logger.saveLinks(allLinks)

    if (allLinks.length === 0) {
      throw new ExpectedExtractionError(
        `No links found on ${normalizedUrl}. Page may be a single-page app with no anchor tags, or content is behind authentication.`,
        "NO_LINKS"
      )
    }

    // Extract footer HTML for AI analysis
    const footerHtml = await page.evaluate(() => {
      // Try multiple selectors for footer
      const selectors = ["footer", '[role="contentinfo"]', ".footer", "#footer", ".site-footer"]
      for (const sel of selectors) {
        const el = document.querySelector(sel)
        if (el) return el.outerHTML
      }
      return null
    })

    // Extract header HTML for AI analysis
    const headerHtml = await page.evaluate(() => {
      const selectors = ["header", '[role="banner"]', ".header", "#header", ".site-header", "nav"]
      for (const sel of selectors) {
        const el = document.querySelector(sel)
        if (el) return el.outerHTML
      }
      return null
    })

    if (footerHtml) {
      logger.log(`Extracted footer HTML (${footerHtml.length} chars)`)
    } else {
      logger.log("No footer section found in DOM")
    }

    if (headerHtml) {
      logger.log(`Extracted header HTML (${headerHtml.length} chars)`)
    } else {
      logger.log("No header section found in DOM")
    }

    return {
      finalUrl,
      redirected,
      html,
      allLinks,
      footerHtml,
      headerHtml,
      pageTitle
    }
  } finally {
    // Always clean up the context (but keep the shared browser alive)
    if (context) {
      try {
        await context.close()
      } catch {
        // Context already closed
      }
    }
  }
}

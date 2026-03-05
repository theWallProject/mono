/**
 * LinkedIn numerical ID → string slug resolver.
 *
 * When a LinkedIn company URL uses a numerical ID (e.g., /company/12345),
 * the company name won't appear in the URL, so it can never be "green".
 * This module resolves numerical IDs to their string slug equivalents by
 * navigating to LinkedIn in a real browser with a persistent profile (which
 * has an active LinkedIn login session).
 *
 * LinkedIn redirects /company/12345 → /company/acme-corp when logged in.
 * We capture the resolved slug URL and add it to the li array alongside
 * the original numerical URL.
 *
 * FAIL-HARD policy:
 *   - If LinkedIn redirects to a login/auth page → throw immediately.
 *     The user must log in via the browser profile before running batch mode.
 *   - If the browser profile directory doesn't exist → throw immediately.
 *   - No silent fallbacks, no retries, no hacks.
 */

import fs from "fs"
import path from "path"

import { API_ENDPOINT_RULE_LINKEDIN_COMPANY } from "@theWallProject/common"
import { chromium, type BrowserContext, type Page } from "playwright"

import { log } from "../../helper"
import type { CompanyLogger } from "./company_logger"

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

/** Persistent browser profile path (same as validate_urls.ts) */
const BROWSER_PROFILE_DIR = path.join(__dirname, "../../../.browser-profile")

/** Timeout for LinkedIn page navigation (LinkedIn redirects are fast when logged in) */
const LINKEDIN_NAVIGATION_TIMEOUT_MS = 20_000

/** Patterns that indicate a login/auth page — NOT a valid redirect */
const LOGIN_PAGE_PATTERNS = [
  /\/login/i,
  /\/signin/i,
  /\/authwall/i,
  /\/auth/i,
  /\/checkpoint/i,
  /\/uas\/login/i,
  /\/session/i
]

// ────────────────────────────────────────────────────────────────────────────
// LinkedIn URL analysis
// ────────────────────────────────────────────────────────────────────────────

const LINKEDIN_REGEX = new RegExp(API_ENDPOINT_RULE_LINKEDIN_COMPANY.regex, "i")

/**
 * Extract the selector (slug or numerical ID) from a LinkedIn company URL.
 * Returns null if the URL doesn't match the LinkedIn company regex.
 */
const extractLinkedInSelector = (url: string): string | null => {
  const match = LINKEDIN_REGEX.exec(url)
  return match?.[1] ?? null
}

/** Returns true if the selector is entirely digits (a numerical ID). */
const isNumericalSelector = (selector: string): boolean => /^\d+$/.test(selector)

/**
 * Returns true if the given LinkedIn URL uses a numerical company ID.
 * e.g., https://www.linkedin.com/company/12345 → true
 *       https://www.linkedin.com/company/acme-corp → false
 */
export const isNumericalLinkedInUrl = (url: string): boolean => {
  const selector = extractLinkedInSelector(url)
  return selector !== null && isNumericalSelector(selector)
}

// ────────────────────────────────────────────────────────────────────────────
// Login detection
// ────────────────────────────────────────────────────────────────────────────

/**
 * Throws immediately if the page URL indicates a login/auth page.
 * This means the LinkedIn session in the browser profile has expired.
 */
const assertNotLoginPage = (pageUrl: string): void => {
  const urlPath = new URL(pageUrl).pathname
  for (const pattern of LOGIN_PAGE_PATTERNS) {
    if (pattern.test(urlPath)) {
      throw new Error(
        `LinkedIn login required: browser redirected to ${pageUrl}\n` +
          `The LinkedIn session in the browser profile has expired.\n` +
          `Fix: run "pnpm data" → "Validate URLs" mode, log into LinkedIn in the browser, then close it.\n` +
          `Browser profile location: ${BROWSER_PROFILE_DIR}`
      )
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Browser management
// ────────────────────────────────────────────────────────────────────────────

/**
 * Launch a visible (non-headless) persistent browser context using the same
 * profile as validate_urls.ts. This profile should have an active LinkedIn
 * login session.
 *
 * Anti-detection measures are copied from validate_urls.ts to avoid triggering
 * LinkedIn's bot detection.
 */
const launchPersistentBrowser = async (): Promise<BrowserContext> => {
  if (!fs.existsSync(BROWSER_PROFILE_DIR)) {
    throw new Error(
      `Browser profile directory not found: ${BROWSER_PROFILE_DIR}\n` +
        `Fix: run "pnpm data" → "Validate URLs" mode first to create the profile and log into LinkedIn.`
    )
  }

  const browserArgs = [
    "--disable-blink-features=AutomationControlled",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  ]

  const context = await chromium.launchPersistentContext(BROWSER_PROFILE_DIR, {
    headless: false,
    args: browserArgs,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  })

  // Anti-detection: remove webdriver flag from all existing and future pages
  for (const page of context.pages()) {
    await applyAntiDetection(page)
  }
  context.on("page", (page) => {
    applyAntiDetection(page).catch(() => {
      // Non-fatal: page may have closed before script injection
    })
  })

  return context
}

/** Apply anti-detection measures to a page (same as validate_urls.ts). */
const applyAntiDetection = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false })
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5]
    })
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"]
    })
    // @ts-expect-error -- injecting fake chrome.runtime for detection evasion
    window.chrome = { runtime: {} }
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Core resolution logic
// ────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a single numerical LinkedIn URL to its string slug URL.
 *
 * Opens the URL in the persistent browser, waits for LinkedIn to redirect
 * /company/12345 → /company/acme-corp, and returns the resolved URL.
 *
 * Returns null if:
 *   - The URL stayed numerical (no redirect occurred)
 *   - Navigation failed (HTTP error, timeout)
 *
 * Throws (non-recoverable) if:
 *   - Redirected to a login/auth page (session expired)
 */
const resolveOneLinkedInUrl = async (
  numericalUrl: string,
  context: BrowserContext,
  logger: CompanyLogger
): Promise<string | null> => {
  let page: Page | null = null

  try {
    page = await context.newPage()
    await applyAntiDetection(page)

    logger.log(`  LINKEDIN: resolving ${numericalUrl}`)

    const response = await page.goto(numericalUrl, {
      waitUntil: "domcontentloaded",
      timeout: LINKEDIN_NAVIGATION_TIMEOUT_MS
    })

    if (!response) {
      logger.log(`  LINKEDIN: no response for ${numericalUrl}`)
      return null
    }

    const status = response.status()
    if (status >= 400) {
      logger.log(`  LINKEDIN: HTTP ${status} for ${numericalUrl}`)
      return null
    }

    const finalUrl = page.url().replace(/\/+$/, "")

    // Check for login redirect — fail hard
    assertNotLoginPage(finalUrl)

    // Normalize for comparison
    const inputNormalized = numericalUrl.replace(/\/+$/, "").toLowerCase()
    if (finalUrl.toLowerCase() === inputNormalized) {
      logger.log(`  LINKEDIN: no redirect for ${numericalUrl} (stayed numerical)`)
      return null
    }

    // Verify the final URL is actually a LinkedIn company page with a string slug
    const finalSelector = extractLinkedInSelector(finalUrl)
    if (!finalSelector) {
      logger.log(`  LINKEDIN: final URL doesn't match LinkedIn company regex: ${finalUrl}`)
      return null
    }

    if (isNumericalSelector(finalSelector)) {
      // Redirected to another numerical ID — not useful
      logger.log(`  LINKEDIN: redirected to another numerical ID: ${finalUrl}`)
      return null
    }

    // Build a clean canonical URL from the resolved selector
    const resolvedUrl = `https://www.linkedin.com/company/${finalSelector.toLowerCase()}`
    logger.log(`  LINKEDIN: resolved ${numericalUrl} → ${resolvedUrl}`)
    return resolvedUrl
  } catch (err) {
    // Re-throw login errors — these are fatal
    if (err instanceof Error && err.message.startsWith("LinkedIn login required")) {
      throw err
    }

    const msg = err instanceof Error ? err.message : String(err)
    logger.log(`  LINKEDIN: failed to resolve ${numericalUrl}: ${msg}`)
    return null
  } finally {
    if (page) {
      await page.close().catch(() => {})
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

/**
 * Resolves any numerical LinkedIn IDs in the override's `li` field to their
 * string slug equivalents. Adds the resolved URLs alongside the originals.
 *
 * Uses a persistent browser profile with LinkedIn login to follow redirects.
 *
 * Returns a new override object with the resolved URLs added (original is not mutated).
 *
 * @throws {Error} If LinkedIn login has expired (redirects to auth page).
 *   This is a fatal error — the caller should stop the batch.
 */
export const resolveLinkedInNumericalIds = async <T extends Record<string, unknown>>(
  override: T,
  logger: CompanyLogger
): Promise<T> => {
  const liField = override.li
  if (!liField) return override

  // Normalize to array
  const liUrls: string[] = Array.isArray(liField)
    ? liField.filter((v): v is string => typeof v === "string")
    : typeof liField === "string"
      ? [liField]
      : []

  if (liUrls.length === 0) return override

  // Find numerical URLs that need resolution
  const numericalUrls = liUrls.filter(isNumericalLinkedInUrl)
  if (numericalUrls.length === 0) {
    logger.log("  LINKEDIN: no numerical IDs to resolve")
    return override
  }

  log(`  Resolving ${numericalUrls.length} numerical LinkedIn ID(s) via persistent browser...`)
  logger.log(`  LINKEDIN: ${numericalUrls.length} numerical ID(s) to resolve: ${numericalUrls.join(", ")}`)

  let context: BrowserContext | null = null
  try {
    context = await launchPersistentBrowser()

    const resolvedUrls: string[] = []
    for (const url of numericalUrls) {
      const resolved = await resolveOneLinkedInUrl(url, context, logger)
      if (resolved) {
        resolvedUrls.push(resolved)
      }
    }

    if (resolvedUrls.length === 0) {
      logger.log("  LINKEDIN: none resolved to string slugs")
      return override
    }

    // Build new li array: original URLs + resolved URLs, deduplicated
    const existingSet = new Set(liUrls.map((u) => u.replace(/\/+$/, "").toLowerCase()))
    const newLiUrls = [...liUrls]
    for (const resolved of resolvedUrls) {
      const normalized = resolved.replace(/\/+$/, "").toLowerCase()
      if (!existingSet.has(normalized)) {
        newLiUrls.push(resolved)
        existingSet.add(normalized)
      }
    }

    logger.log(`  LINKEDIN: final li array: ${newLiUrls.join(", ")}`)

    // Return a new override with the updated li field
    return { ...override, li: newLiUrls }
  } finally {
    if (context) {
      await context.close().catch(() => {})
    }
  }
}

/**
 * AI-powered social link categorization.
 *
 * Uses the existing regex-based categorization from @theWallProject/common as the PRIMARY
 * source of truth. Then sends uncategorized links + footer/header HTML to the AI model
 * to catch social links that the regex missed (e.g., links in JS, non-standard URLs,
 * social links using custom shorteners).
 *
 * The AI is asked to return structured JSON matching our schema exactly.
 * Any AI output that doesn't match the expected format causes an immediate crash
 * (unexpected failure — code bug or prompt needs fixing).
 */

import {
  API_ENDPOINT_RULE_FACEBOOK,
  API_ENDPOINT_RULE_GITHUB,
  API_ENDPOINT_RULE_INSTAGRAM,
  API_ENDPOINT_RULE_LINKEDIN_COMPANY,
  API_ENDPOINT_RULE_THREADS,
  API_ENDPOINT_RULE_TIKTOK,
  API_ENDPOINT_RULE_TWITTER,
  API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
  API_ENDPOINT_RULE_YOUTUBE_PROFILE,
  getRegisteredDomain,
  type LinkField
} from "@theWallProject/common"

import { isFromRegexDomain } from "../validate/url_categorization"
import { chatCompletion } from "./ai_client"
import type { CompanyLogger } from "./company_logger"
import { getOrCreateBrowser, type LinkExtractionResult } from "./link_extractor"

/** Categorized output: links grouped by platform */
export type CategorizedLinks = {
  ws?: string[]
  li?: string[]
  fb?: string[]
  tw?: string[]
  ig?: string[]
  gh?: string[]
  ytp?: string[]
  ytc?: string[]
  tt?: string[]
  th?: string[]
  urls?: string[]
  android_app_ids?: string[]
  android_dev_id?: string
}

// ────────────────────────────────────────────────────────────────────────────
// Programmatic categorization (regex-based, from @theWallProject/common)
// ────────────────────────────────────────────────────────────────────────────

/** URLs that are definitely not the company's own social presence */
const NOISE_PATTERNS = [
  // File URLs — static assets, not meaningful links
  /\.(?:js|css|json|xml|rss|atom|woff2?|ttf|eot|otf)(?:\?|$)/i,
  /\.(?:png|jpe?g|gif|svg|ico|webp|avif|bmp|tiff?)(?:\?|$)/i,
  /\.(?:pdf|doc|docx|xls|xlsx|pptx?|zip|tar|gz|rar)(?:\?|$)/i,
  /\.(?:mp3|mp4|webm|ogg|wav|avi|mov|flv|wmv)(?:\?|$)/i,
  // Search result pages
  /^#/,
  // JavaScript code fragments that were incorrectly resolved as URLs
  // (e.g., "cookiebot.show()", "void(0)", "return false;")
  /[(){};<>`]/
]

/**
 * Extracts Android app ID from a Play Store app details URL.
 * Returns null for non-app-details URLs (search pages, developer pages, etc.)
 */
const extractAndroidAppId = (url: string): string | null => {
  const match = url.match(/play\.google\.com\/store\/apps\/details\?id=([^&/]+)/i)
  if (match?.[1]) {
    return decodeURIComponent(match[1])
  }
  return null
}

/**
 * Extracts Android developer ID from a Play Store developer URL.
 * Example: https://play.google.com/store/apps/developer?id=Wix.com,+INC.
 */
const extractAndroidDevId = (url: string): string | null => {
  const match = url.match(/play\.google\.com\/store\/apps\/dev(?:eloper)?\?id=([^&/]+)/i)
  if (match?.[1]) {
    return decodeURIComponent(match[1])
  }
  return null
}

/**
 * Categorizes a single URL into a link field type using regex from @theWallProject/common.
 * Returns null for URLs that don't match any social platform regex.
 */
const categorizeUrlProgrammatic = (url: string): LinkField | null => {
  try {
    // Skip noise URLs first
    for (const pattern of NOISE_PATTERNS) {
      if (pattern.test(url)) return null
    }

    // LinkedIn company pages
    if (new RegExp(API_ENDPOINT_RULE_LINKEDIN_COMPANY.regex).test(url)) return "li"

    // Facebook pages (normalize /pg/ and /p/ paths)
    const normalizedFb = url.replace("/pg/", "/").replace("/p/", "/")
    if (new RegExp(API_ENDPOINT_RULE_FACEBOOK.regex).test(normalizedFb)) return "fb"

    // Twitter/X profiles
    if (new RegExp(API_ENDPOINT_RULE_TWITTER.regex).test(url)) return "tw"

    // Instagram profiles
    if (new RegExp(API_ENDPOINT_RULE_INSTAGRAM.regex).test(url)) return "ig"

    // GitHub organizations/users
    if (new RegExp(API_ENDPOINT_RULE_GITHUB.regex).test(url)) return "gh"

    // YouTube profiles (/@handle or /c/name or /user/name)
    if (new RegExp(API_ENDPOINT_RULE_YOUTUBE_PROFILE.regex, "i").test(url)) return "ytp"

    // YouTube channels (/channel/UC...)
    if (new RegExp(API_ENDPOINT_RULE_YOUTUBE_CHANNEL.regex, "i").test(url)) return "ytc"

    // TikTok profiles
    if (new RegExp(API_ENDPOINT_RULE_TIKTOK.regex).test(url)) return "tt"

    // Threads profiles
    if (new RegExp(API_ENDPOINT_RULE_THREADS.regex).test(url)) return "th"

    return null
  } catch {
    return null
  }
}

/** Maps link field categories to their regex rules and flags for selector extraction */
const CATEGORY_RULES: Partial<Record<keyof CategorizedLinks, { rule: { regex: string }; flags?: string }>> = {
  li: { rule: API_ENDPOINT_RULE_LINKEDIN_COMPANY, flags: "i" },
  fb: { rule: API_ENDPOINT_RULE_FACEBOOK },
  tw: { rule: API_ENDPOINT_RULE_TWITTER, flags: "i" },
  ig: { rule: API_ENDPOINT_RULE_INSTAGRAM },
  gh: { rule: API_ENDPOINT_RULE_GITHUB },
  ytp: { rule: API_ENDPOINT_RULE_YOUTUBE_PROFILE, flags: "i" },
  ytc: { rule: API_ENDPOINT_RULE_YOUTUBE_CHANNEL, flags: "i" },
  tt: { rule: API_ENDPOINT_RULE_TIKTOK },
  th: { rule: API_ENDPOINT_RULE_THREADS }
}

/**
 * Extracts the profile selector (user/org ID) from a social platform URL.
 * Returns the selector lowercased for case-insensitive comparison, or null
 * if the URL doesn't match the category's regex.
 */
const extractSelector = (category: keyof CategorizedLinks, url: string): string | null => {
  const entry = CATEGORY_RULES[category]
  if (!entry) return null
  try {
    const regex = new RegExp(entry.rule.regex, entry.flags)
    const match = regex.exec(url)
    if (!match) return null
    // YouTube profile uses capture groups 1-4; take the first non-undefined
    const selector = match[1] || match[2] || match[3] || match[4]
    return selector ? selector.toLowerCase() : null
  } catch {
    return null
  }
}

/**
 * Builds the canonical profile-level URL for a selector on a given platform.
 * Used to replace repo/sub-page URLs with the cleaner profile URL when the
 * same selector is already present.
 */
const buildProfileUrl = (category: keyof CategorizedLinks, selector: string): string | null => {
  switch (category) {
    case "li":
      return `https://www.linkedin.com/company/${selector}`
    case "fb":
      return `https://www.facebook.com/${selector}`
    case "tw":
      return `https://x.com/${selector}`
    case "ig":
      return `https://www.instagram.com/${selector}`
    case "gh":
      return `https://github.com/${selector}`
    case "ytp":
      return `https://www.youtube.com/@${selector}`
    case "ytc":
      return `https://www.youtube.com/channel/${selector}`
    case "tt":
      return `https://www.tiktok.com/${selector}`
    case "th":
      return `https://www.threads.net/${selector}`
    default:
      return null
  }
}

/**
 * Filters out internal links (links pointing to the same domain or subdomains of the homepage).
 * Uses tldts (via getRegisteredDomain) to compare registered domains, so blog.example.com is
 * treated as internal when the homepage is example.com.
 */
const filterInternalLinks = (links: string[], homepageDomain: string): string[] => {
  const baseDomain = getRegisteredDomain(homepageDomain)
  return links.filter((link) => {
    try {
      const linkBaseDomain = getRegisteredDomain(link)
      return linkBaseDomain !== baseDomain
    } catch {
      return false
    }
  })
}

/**
 * Removes trailing slashes and normalizes URLs for deduplication.
 */
const normalizeForDedup = (url: string): string => {
  return url.replace(/\/+$/, "").toLowerCase()
}

/**
 * Extracts all href values from raw HTML using a simple regex.
 * Returns the set of normalized origins found in the HTML.
 * Used to determine which external links appear in footer/header sections
 * (company-relevant links) vs. body content (news articles, press mentions, etc.).
 */
const extractOriginsFromHtml = (html: string): Set<string> => {
  const origins = new Set<string>()
  // Match href="..." or href='...' — captures the URL inside quotes
  const hrefRegex = /href=["']([^"']+)["']/gi
  let match = hrefRegex.exec(html)
  while (match) {
    const href = match[1]
    if (href) {
      try {
        const parsed = new URL(href)
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          origins.add(parsed.origin.toLowerCase())
        }
      } catch {
        // Relative or invalid URL — skip
      }
    }
    match = hrefRegex.exec(html)
  }
  return origins
}

/**
 * Normalizes a URL for the urls bucket: strips trailing slashes, query params, and fragments.
 * Keeps the full path — dedup via normalizeForDedup handles duplicates.
 */
const cleanUrlForStorage = (url: string): string => {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "")
  } catch {
    return url
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Redirect resolution for non-standard social URLs
// ────────────────────────────────────────────────────────────────────────────

/**
 * Patterns on social-platform domains that are known to redirect to a canonical
 * profile URL.  Only these are worth the cost of a Playwright navigation.
 *
 * - facebook.com/people/Name/ID  → canonical page
 * - facebook.com/profile.php?id= → canonical page
 * - facebook.com/pages/...       → canonical page
 */
const RESOLVABLE_SOCIAL_PATTERNS: RegExp[] = [
  /facebook\.com\/people\//i,
  /facebook\.com\/profile\.php\?/i,
  /facebook\.com\/pages\//i
]

/**
 * Attempts to resolve a non-standard social-platform URL by following redirects
 * using the shared Playwright browser.
 *
 * Only tries for URL patterns that are known to redirect to canonical profile pages
 * (e.g., facebook.com/people/..., facebook.com/profile.php?id=...).
 * For all other regex-domain URLs (privacy pages, legal pages, etc.) returns null
 * immediately — no network round-trip.
 *
 * Returns the resolved canonical URL if the redirect succeeded and the final URL
 * differs from the input, or null if resolution was not attempted / failed.
 */
const resolveRedirectForRegexDomain = async (
  url: string,
  logger: CompanyLogger
): Promise<string | null> => {
  // Only attempt for known resolvable patterns
  const isResolvable = RESOLVABLE_SOCIAL_PATTERNS.some((pattern) => pattern.test(url))
  if (!isResolvable) return null

  let context
  let page
  try {
    const browser = await getOrCreateBrowser()
    context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    page = await context.newPage()

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15_000
    })

    if (!response) {
      logger.log(`  RESOLVE: no response for ${url}`)
      return null
    }

    const status = response.status()
    if (status >= 400) {
      logger.log(`  RESOLVE: HTTP ${status} for ${url}`)
      return null
    }

    const finalUrl = page.url().replace(/\/+$/, "")
    const inputNormalized = url.replace(/\/+$/, "")

    // Check the redirect actually changed the URL to something useful
    if (finalUrl.toLowerCase() === inputNormalized.toLowerCase()) {
      logger.log(`  RESOLVE: no redirect for ${url}`)
      return null
    }

    // Reject login / error pages that some platforms redirect to
    const finalPath = new URL(finalUrl).pathname.toLowerCase()
    if (/\/(login|signin|auth|error|checkpoint|recover)/.test(finalPath)) {
      logger.log(`  RESOLVE: redirected to login/error page: ${finalUrl}`)
      return null
    }

    logger.log(`  RESOLVE: ${url} → ${finalUrl}`)
    return finalUrl
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.log(`  RESOLVE: failed for ${url}: ${msg}`)
    return null
  } finally {
    if (page) await page.close().catch(() => {})
    if (context) await context.close().catch(() => {})
  }
}

// ────────────────────────────────────────────────────────────────────────────
// AI-powered enhancement
// ────────────────────────────────────────────────────────────────────────────

/** URL regex for extracting links from AI plain-text response */
const URL_LINE_REGEX = /^https?:\/\/\S+$/

/**
 * Builds the AI prompt for analyzing uncategorized links + HTML sections.
 * Keeps the prompt focused and under ~4KB of HTML context.
 */
/** Whether to include header HTML in the AI prompt. Headers are rarely useful
 *  (mostly navigation menus) and can be very large. Set to true to re-enable. */
const INCLUDE_HEADER_IN_PROMPT = false

/**
 * Strips clutter from HTML to reduce token count:
 * - Removes class and style attributes
 * - Removes SVG elements entirely (logos, icons — no useful links)
 * - Collapses whitespace
 */
const stripClutterAttributes = (html: string): string => {
  return (
    html
      // Strip SVG elements but preserve any <a> tags inside them (may contain links)
      .replace(/<svg[\s>][\s\S]*?<\/svg>/gi, (svgMatch) => {
        const anchors: string[] = []
        const anchorRegex = /<a\s[^>]*href\s*=\s*["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi
        let anchorMatch = anchorRegex.exec(svgMatch)
        while (anchorMatch) {
          anchors.push(anchorMatch[0])
          anchorMatch = anchorRegex.exec(svgMatch)
        }
        return anchors.join(" ")
      })
      // Remove class="..." and style="..." (with either quote type)
      .replace(/\s+(?:class|style)\s*=\s*"[^"]*"/gi, "")
      .replace(/\s+(?:class|style)\s*=\s*'[^']*'/gi, "")
      // Collapse multiple whitespace into single space
      .replace(/\s{2,}/g, " ")
      // Remove empty attribute lists that might result (e.g., <div > → <div>)
      .replace(/\s+>/g, ">")
  )
}

const buildAiPrompt = (
  companyName: string,
  uncategorizedLinks: string[],
  footerHtml: string | null,
  headerHtml: string | null
): string => {
  // Strip clutter attributes first, then apply size limit
  const cleanedFooter = footerHtml ? stripClutterAttributes(footerHtml) : null
  const cleanedHeader = INCLUDE_HEADER_IN_PROMPT && headerHtml ? stripClutterAttributes(headerHtml) : null

  // Size limit per section — must fit within the model's 32K context window
  const maxHtmlChars = 50_000
  const trimmedFooter = cleanedFooter ? cleanedFooter.slice(0, maxHtmlChars) : "(no footer found)"
  const trimmedHeader = cleanedHeader ? cleanedHeader.slice(0, maxHtmlChars) : null

  // Only include up to 200 uncategorized links to avoid enormous prompts
  const linksToAnalyze = uncategorizedLinks.slice(0, 200)

  return `You are filtering links from the website of "${companyName}".

Below are external links found on the page that I could not automatically categorize, plus the page's footer and header HTML which may contain additional links I missed.

Your task: return ONLY the links that are official accounts, profiles, products, or properties of "${companyName}" itself.

INCLUDE links like:
- Social media profiles (LinkedIn, Facebook, Twitter/X, Instagram, GitHub, YouTube, TikTok, Threads, etc.)
- App store listings (Google Play, Apple App Store, Chrome Web Store, Firefox Add-ons, Edge Add-ons, etc.)
- Package registries (npm, PyPI, Docker Hub, VS Code Marketplace, etc.)
- Community channels (Telegram, Discord, Slack, Reddit, etc.)
- Blog platforms (Medium, Dev.to, Substack, etc.)
- Directory listings (Product Hunt, Crunchbase, Wellfound/AngelList, G2, Capterra, etc.)
- Any other official presence of "${companyName}" on a third-party platform

EXCLUDE links like:
- News articles or press mentions ABOUT the company (e.g., techcrunch.com/article-about-company)
- Share/intent links (twitter.com/intent, linkedin.com/shareArticle, etc.)
- Tracking pixels, analytics, or ad URLs
- CDN, font, or asset URLs
- Embedded chatbots or support widgets from third-party services (e.g., Intercom, Drift, HubSpot chat)
- Cookie consent or privacy tool scripts
- Links to OTHER companies' profiles or products
- Generic platform links without a specific profile (e.g., just "facebook.com" or "twitter.com")
- Design agency credits or "built by" links

CRITICAL: Do NOT invent or guess any URLs. Every link you return MUST appear verbatim in the uncategorized links list or in the footer HTML below. If you are unsure, leave it out.

UNCATEGORIZED LINKS (${linksToAnalyze.length} of ${uncategorizedLinks.length}):
${linksToAnalyze.map((link) => `  ${link}`).join("\n")}

FOOTER HTML:
${trimmedFooter}${trimmedHeader ? `\n\nHEADER HTML:\n${trimmedHeader}` : ""}

Respond with ONLY a plain list of URLs, one per line. No numbering, no bullets, no explanations, no markdown.
If you find nothing, respond with an empty line.`
}

/**
 * Parses the AI response as a plain list of URLs (one per line).
 * Ignores blank lines, numbering, bullets, and any non-URL text.
 */
const parseAiLinks = (responseText: string, logger: CompanyLogger): string[] => {
  const lines = responseText.split("\n")
  const links: string[] = []

  logger.log(`── Parsing AI response (${lines.length} lines) ──`)
  for (const rawLine of lines) {
    // Strip numbering (e.g., "1. ", "- ", "* "), whitespace, and backticks
    const cleaned = rawLine
      .trim()
      .replace(/^[\d]+[.)]\s*/, "")
      .replace(/^[-*•]\s*/, "")
      .replace(/`/g, "")
      .trim()

    if (cleaned.length === 0) continue

    if (URL_LINE_REGEX.test(cleaned)) {
      links.push(cleaned)
      logger.log(`  AI LINK: ${cleaned}`)
    } else {
      logger.log(`  AI IGNORED (not a URL): ${cleaned.slice(0, 200)}`)
    }
  }

  logger.log(`AI returned ${links.length} valid links`)
  return links
}

// ────────────────────────────────────────────────────────────────────────────
// Main categorization pipeline
// ────────────────────────────────────────────────────────────────────────────

/**
 * Pushes a URL into the correct field of a CategorizedLinks object.
 * Uses explicit field matching instead of dynamic key indexing to satisfy
 * the no-type-assertions lint rule.
 */
const pushToCategory = (target: CategorizedLinks, category: keyof CategorizedLinks, url: string): void => {
  switch (category) {
    case "ws":
      target.ws = [...(target.ws ?? []), url]
      break
    case "li":
      target.li = [...(target.li ?? []), url]
      break
    case "fb":
      target.fb = [...(target.fb ?? []), url]
      break
    case "tw":
      target.tw = [...(target.tw ?? []), url]
      break
    case "ig":
      target.ig = [...(target.ig ?? []), url]
      break
    case "gh":
      target.gh = [...(target.gh ?? []), url]
      break
    case "ytp":
      target.ytp = [...(target.ytp ?? []), url]
      break
    case "ytc":
      target.ytc = [...(target.ytc ?? []), url]
      break
    case "tt":
      target.tt = [...(target.tt ?? []), url]
      break
    case "th":
      target.th = [...(target.th ?? []), url]
      break
    case "urls":
      target.urls = [...(target.urls ?? []), url]
      break
    case "android_app_ids":
      target.android_app_ids = [...(target.android_app_ids ?? []), url]
      break
    case "android_dev_id":
      target.android_dev_id = url
      break
    default: {
      const _exhaustive: never = category
      throw new Error(`Unexpected category: ${_exhaustive}`)
    }
  }
}

/**
 * Full categorization pipeline:
 * 1. Programmatic regex-based categorization of ALL extracted links
 * 2. AI-powered analysis of uncategorized links + footer/header HTML
 * 3. Merge results (programmatic takes priority — it's deterministic)
 *
 * Returns categorized links ready to save as a ManualOverrideFields entry.
 */
export const categorizeLinks = async (
  companyName: string,
  extraction: LinkExtractionResult,
  logger: CompanyLogger
): Promise<CategorizedLinks> => {
  const result: CategorizedLinks = {}

  // Use the final URL (after redirects) as the company's website
  result.ws = [extraction.finalUrl]
  logger.log(`Website (post-redirect): ${extraction.finalUrl}`)

  // Get the homepage domain for filtering internal links
  let homepageDomain: string
  try {
    homepageDomain = new URL(extraction.finalUrl).hostname.replace(/^www\./, "")
  } catch {
    throw new Error(`Invalid final URL: ${extraction.finalUrl}`)
  }

  // Collect subdomains of the main website into ws (e.g., blog.example.com, docs.example.com)
  const registeredDomain = getRegisteredDomain(extraction.finalUrl) // e.g., "catonetworks.com"
  if (registeredDomain) {
    const wsArray = result.ws // guaranteed non-null (set above)
    const seenSubdomains = new Set<string>([homepageDomain.toLowerCase()])
    for (const link of extraction.allLinks) {
      try {
        const linkHostname = new URL(link).hostname.replace(/^www\./, "").toLowerCase()
        // Same registered domain but different hostname = subdomain
        if (linkHostname !== homepageDomain.toLowerCase() && getRegisteredDomain(link) === registeredDomain) {
          if (!seenSubdomains.has(linkHostname)) {
            seenSubdomains.add(linkHostname)
            const subdomainUrl = `https://${linkHostname}`
            wsArray.push(subdomainUrl)
            logger.log(`  SUBDOMAIN: ${linkHostname} (added to ws)`)
          }
        }
      } catch {
        // Invalid URL — skip
      }
    }
    if (wsArray.length > 1) {
      logger.log(`Website subdomains found: ${wsArray.length - 1}`)
    }
  }

  // Filter out internal links (same domain as homepage)
  const externalLinks = filterInternalLinks(extraction.allLinks, homepageDomain)
  logger.log(`External links: ${externalLinks.length} (of ${extraction.allLinks.length} total)`)

  // Log all external links for debugging
  logger.log(`── All external links ──`)
  for (const link of externalLinks) {
    logger.log(`  EXT: ${link}`)
  }

  // ── Step 1: Programmatic categorization ──

  const uncategorizedLinks: string[] = []
  const seenNormalized = new Map<string, Set<string>>() // category -> set of normalized URLs
  const seenSelectors = new Map<string, Map<string, string>>() // category -> (selector -> profile URL)

  /**
   * Push a URL into the appropriate result array, handling dedup.
   *
   * For social link fields (gh, li, fb, etc.): deduplicates by extracted selector.
   * When two URLs yield the same selector (e.g., github.com/org and github.com/org/repo),
   * keeps only the profile-level URL. If the selectors differ, both are kept.
   *
   * For non-social fields (urls, ws, android_app_ids): deduplicates by full normalized URL.
   *
   * Returns true if the URL was added (or replaced an existing sub-page URL).
   */
  const addToResult = (category: keyof CategorizedLinks, url: string): boolean => {
    // For social link categories, deduplicate by selector
    const selector = extractSelector(category, url)
    if (selector) {
      if (!seenSelectors.has(category)) {
        seenSelectors.set(category, new Map())
      }
      const selectorMap = seenSelectors.get(category)
      if (!selectorMap) throw new Error("Unexpected: seenSelectors map missing key")

      const existingUrl = selectorMap.get(selector)
      if (existingUrl) {
        // Same selector already present — keep the shorter (profile-level) URL
        const profileUrl = buildProfileUrl(category, selector)
        if (profileUrl && normalizeForDedup(existingUrl) !== normalizeForDedup(profileUrl)) {
          // Existing URL is a sub-page (e.g., /org/repo); replace with profile URL
          const arr = result[category]
          if (Array.isArray(arr)) {
            const idx = arr.findIndex((u) => normalizeForDedup(u) === normalizeForDedup(existingUrl))
            if (idx !== -1) {
              arr[idx] = profileUrl
              selectorMap.set(selector, profileUrl)
              return true
            }
          }
        }
        // Either existing is already the profile URL, or we couldn't replace — skip
        return false
      }

      // New selector — add the profile-level URL instead of a potential sub-page
      const profileUrl = buildProfileUrl(category, selector)
      const urlToAdd = profileUrl ?? url
      selectorMap.set(selector, urlToAdd)
      pushToCategory(result, category, urlToAdd)
      return true
    }

    // Non-social categories (urls, ws, android_app_ids): dedup by full URL
    const normalized = normalizeForDedup(url)
    if (!seenNormalized.has(category)) {
      seenNormalized.set(category, new Set())
    }
    const seen = seenNormalized.get(category)
    if (!seen) throw new Error("Unexpected: seenNormalized map missing key")
    if (seen.has(normalized)) return false
    seen.add(normalized)

    pushToCategory(result, category, url)
    return true
  }

  logger.log(`── Step 1: Programmatic categorization ──`)
  const linksToResolve: string[] = [] // regex-domain URLs that might resolve via redirect
  for (const link of externalLinks) {
    // Check for Android app IDs first — don't duplicate into urls
    const androidAppId = extractAndroidAppId(link)
    if (androidAppId) {
      addToResult("android_app_ids", androidAppId)
      logger.log(`  REGEX: android_app_ids <- ${androidAppId} (from ${link})`)
      continue
    }

    // Check for Android developer ID — don't duplicate into urls
    const androidDevId = extractAndroidDevId(link)
    if (androidDevId) {
      result.android_dev_id = androidDevId
      logger.log(`  REGEX: android_dev_id <- ${androidDevId} (from ${link})`)
      continue
    }

    const category = categorizeUrlProgrammatic(link)
    if (category && category !== "il") {
      const added = addToResult(category, link)
      logger.log(`  REGEX: ${category} <- ${link}${added ? "" : " (duplicate, skipped)"}`)
    } else if (isFromRegexDomain(link)) {
      // URL is from a domain with regex rules (e.g., linkedin.com, facebook.com) but didn't
      // match the regex — it's a platform page (privacy policy, help, etc.), not a company profile.
      // Queue for redirect resolution if it matches a resolvable pattern; otherwise drop.
      linksToResolve.push(link)
    } else {
      uncategorizedLinks.push(link)
      logger.log(`  UNCATEGORIZED: ${link}`)
    }
  }

  // ── Step 1b: Resolve non-standard social URLs via redirect ──
  // Some social platform URLs use non-canonical formats (e.g., facebook.com/people/Name/ID)
  // that don't match our regex. We follow the redirect to get the canonical URL.
  if (linksToResolve.length > 0) {
    logger.log(`── Step 1b: Resolving ${linksToResolve.length} regex-domain URLs via redirect ──`)
    for (const link of linksToResolve) {
      const resolved = await resolveRedirectForRegexDomain(link, logger)
      if (resolved) {
        const resolvedCategory = categorizeUrlProgrammatic(resolved)
        if (resolvedCategory && resolvedCategory !== "il") {
          const added = addToResult(resolvedCategory, resolved)
          logger.log(`  RESOLVED: ${resolvedCategory} <- ${resolved} (from ${link})${added ? "" : " (duplicate)"}`)
        } else {
          logger.log(`  SKIP (resolved but still no regex match): ${resolved} (from ${link})`)
        }
      } else {
        logger.log(`  SKIP (regex domain, no match): ${link}`)
      }
    }
  }

  logger.log(
    `Programmatic result: ` +
      Object.entries(result)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}:${Array.isArray(v) ? v.length : 1}`)
        .join(", ") +
      ` | ${uncategorizedLinks.length} uncategorized`
  )

  // ── Step 2: AI-powered enhancement ──

  // Track which uncategorized links the AI claims, so we can add the rest to urls
  const aiClaimedNormalized = new Set<string>()

  if (uncategorizedLinks.length > 0 || extraction.footerHtml || extraction.headerHtml) {
    logger.log("Sending uncategorized links + HTML sections to AI for analysis...")

    const prompt = buildAiPrompt(companyName, uncategorizedLinks, extraction.footerHtml, extraction.headerHtml)
    logger.saveAiPrompt(prompt)

    const aiResponseText = await chatCompletion([
      {
        role: "system",
        content:
          "You are a precise link filtering assistant. You examine website links and HTML to identify which links belong to the company's official online presence. You respond ONLY with a plain list of URLs, one per line."
      },
      { role: "user", content: prompt }
    ])

    logger.saveAiResponse(aiResponseText)

    const aiLinks = parseAiLinks(aiResponseText, logger)

    // Run each AI-returned link through our regex categorization
    logger.log(`── Categorizing ${aiLinks.length} AI-returned links ──`)
    for (const link of aiLinks) {
      aiClaimedNormalized.add(normalizeForDedup(link))

      // Check for Android app IDs
      const androidAppId = extractAndroidAppId(link)
      if (androidAppId) {
        const added = addToResult("android_app_ids", androidAppId)
        logger.log(`  AI→REGEX: android_app_ids <- ${androidAppId}${added ? "" : " (duplicate, skipped)"}`)
        continue
      }

      // Check for Android developer ID
      const androidDevId = extractAndroidDevId(link)
      if (androidDevId) {
        result.android_dev_id = androidDevId
        logger.log(`  AI→REGEX: android_dev_id <- ${androidDevId}`)
        continue
      }

      // Try programmatic categorization (social media regex)
      const category = categorizeUrlProgrammatic(link)
      if (category && category !== "il") {
        const added = addToResult(category, link)
        logger.log(`  AI→REGEX: ${category} <- ${link}${added ? "" : " (duplicate, skipped)"}`)
      } else if (isFromRegexDomain(link)) {
        // URL is from a domain with regex rules but didn't match — try redirect resolution
        const resolved = await resolveRedirectForRegexDomain(link, logger)
        if (resolved) {
          const resolvedCategory = categorizeUrlProgrammatic(resolved)
          if (resolvedCategory && resolvedCategory !== "il") {
            const added = addToResult(resolvedCategory, resolved)
            logger.log(
              `  AI→RESOLVED: ${resolvedCategory} <- ${resolved} (from ${link})${added ? "" : " (duplicate)"}`
            )
          } else {
            logger.log(`  AI→SKIP (resolved but still no regex match): ${resolved} (from ${link})`)
          }
        } else {
          logger.log(`  AI→SKIP (regex domain, no match): ${link}`)
        }
      } else {
        // Not a recognized social platform — add to urls
        const cleaned = cleanUrlForStorage(link)
        const added = addToResult("urls", cleaned)
        logger.log(
          `  AI→URLS: ${cleaned}${link !== cleaned ? ` (cleaned from ${link})` : ""}${added ? "" : " (duplicate, skipped)"}`
        )
      }
    }
  } else {
    logger.log("No uncategorized links and no HTML sections — skipping AI analysis")
  }

  // ── Step 2b: Add remaining uncategorized links to urls for future inspection ──
  // ONLY include links whose origin appears in the footer or header HTML.
  // Links from the page body are typically press mentions, news articles, blog references,
  // etc. — not the company's own properties. Footer/header links are almost always
  // company-owned domains, app store pages, or design credits.

  const footerHeaderOrigins = new Set<string>()
  if (extraction.footerHtml) {
    for (const origin of extractOriginsFromHtml(extraction.footerHtml)) {
      footerHeaderOrigins.add(origin)
    }
  }
  if (extraction.headerHtml) {
    for (const origin of extractOriginsFromHtml(extraction.headerHtml)) {
      footerHeaderOrigins.add(origin)
    }
  }

  logger.log(`── Step 2b: Footer/header uncategorized links ──`)
  logger.log(`Footer/header origins (${footerHeaderOrigins.size}):`)
  for (const origin of footerHeaderOrigins) {
    logger.log(`  FOOTER/HEADER ORIGIN: ${origin}`)
  }

  let addedUncategorizedCount = 0
  for (const link of uncategorizedLinks) {
    // Skip if the AI already claimed this link
    if (aiClaimedNormalized.has(normalizeForDedup(link))) {
      logger.log(`  SKIP (AI claimed): ${link}`)
      continue
    }

    // Skip noise URLs — they are not useful for inspection
    let isNoise = false
    for (const pattern of NOISE_PATTERNS) {
      if (pattern.test(link)) {
        isNoise = true
        break
      }
    }
    if (isNoise) {
      logger.log(`  SKIP (noise): ${link}`)
      continue
    }

    // Only include links whose origin appears in the footer or header
    try {
      const linkOrigin = new URL(link).origin.toLowerCase()
      if (!footerHeaderOrigins.has(linkOrigin)) {
        logger.log(`  SKIP (not in footer/header): ${link}`)
        continue
      }
    } catch {
      logger.log(`  SKIP (invalid URL): ${link}`)
      continue
    }

    const cleaned = cleanUrlForStorage(link)
    const added = addToResult("urls", cleaned)
    if (added) {
      addedUncategorizedCount++
      logger.log(`  ADDED: urls <- ${cleaned}${link !== cleaned ? ` (cleaned from ${link})` : ""}`)
    } else {
      logger.log(`  SKIP (duplicate): ${cleaned}`)
    }
  }
  logger.log(`Step 2b result: added ${addedUncategorizedCount} uncategorized domains from footer/header`)

  // ── Step 3: Final dedup — remove urls that were already captured in specialized fields ──

  logger.log(`── Step 3: Final dedup ──`)
  if (result.urls && result.urls.length > 0) {
    const specializedUrls = new Set<string>()
    const specializedFields: Array<keyof CategorizedLinks> = ["li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"]
    for (const field of specializedFields) {
      const fieldUrls = result[field]
      if (Array.isArray(fieldUrls)) {
        for (const url of fieldUrls) {
          specializedUrls.add(normalizeForDedup(url))
        }
      }
    }

    const beforeCount = result.urls.length
    result.urls = result.urls.filter((url) => {
      if (specializedUrls.has(normalizeForDedup(url))) {
        logger.log(`  DEDUP REMOVED: ${url} (already in specialized field)`)
        return false
      }
      return true
    })
    const removedCount = beforeCount - result.urls.length
    logger.log(`Dedup: removed ${removedCount} of ${beforeCount} URLs already in specialized fields`)
    if (result.urls.length === 0) {
      delete result.urls
    }
  } else {
    logger.log(`No urls to dedup`)
  }

  // Clean up: sort all arrays (explicit field list to avoid type assertions)
  const arrayFields: Array<keyof CategorizedLinks> = [
    "ws",
    "li",
    "fb",
    "tw",
    "ig",
    "gh",
    "ytp",
    "ytc",
    "tt",
    "th",
    "urls",
    "android_app_ids"
  ]
  for (const field of arrayFields) {
    const arr = result[field]
    if (Array.isArray(arr)) {
      arr.sort()
    }
  }

  // Log final result with every link
  logger.log(`── FINAL RESULT ──`)
  const resultFields: Array<keyof CategorizedLinks> = [
    "ws",
    "li",
    "fb",
    "tw",
    "ig",
    "gh",
    "ytp",
    "ytc",
    "tt",
    "th",
    "urls",
    "android_app_ids"
  ]
  for (const field of resultFields) {
    const arr = result[field]
    if (Array.isArray(arr) && arr.length > 0) {
      logger.log(`  ${field} (${arr.length}):`)
      for (const url of arr) {
        logger.log(`    - ${url}`)
      }
    }
  }
  if (result.android_dev_id) {
    logger.log(`  android_dev_id: ${result.android_dev_id}`)
  }
  logger.log(
    `Summary: ` +
      Object.entries(result)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}:${Array.isArray(v) ? v.length : 1}`)
        .join(", ")
  )
  logger.saveResult(result)

  return result
}

// ────────────────────────────────────────────────────────────────────────────
// Social link deduplication (exported for use in run.ts)
// ────────────────────────────────────────────────────────────────────────────

const SOCIAL_FIELDS: Array<keyof CategorizedLinks> = ["li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"]

/**
 * Deduplicates social link arrays in a CategorizedLinks object by extracted selector.
 *
 * When multiple URLs resolve to the same profile selector (e.g.,
 * `linkedin.com/company/foo` and `linkedin.com/company/foo/?origin`),
 * keeps only the canonical profile-level URL.
 *
 * Non-social fields (ws, urls, android_app_ids) are left untouched.
 */
export const deduplicateSocialLinks = (categorized: CategorizedLinks): CategorizedLinks => {
  const result = { ...categorized }

  for (const field of SOCIAL_FIELDS) {
    const urls = result[field]
    if (!Array.isArray(urls) || urls.length <= 1) continue

    const deduped = deduplicateUrlsBySelector(field, urls)
    if (deduped.length !== urls.length) {
      // Only update if something was actually removed
      if (field === "li") result.li = deduped
      else if (field === "fb") result.fb = deduped
      else if (field === "tw") result.tw = deduped
      else if (field === "ig") result.ig = deduped
      else if (field === "gh") result.gh = deduped
      else if (field === "ytp") result.ytp = deduped
      else if (field === "ytc") result.ytc = deduped
      else if (field === "tt") result.tt = deduped
      else if (field === "th") result.th = deduped
    }
  }

  return result
}

/**
 * Deduplicates a URL array by extracted selector for a social link field.
 * URLs that resolve to the same selector are collapsed — only the canonical
 * profile-level URL is kept.
 */
const deduplicateUrlsBySelector = (field: keyof CategorizedLinks, urls: string[]): string[] => {
  const seenSelectors = new Map<string, string>() // selector -> canonical URL
  const deduped: string[] = []

  for (const url of urls) {
    const selector = extractSelector(field, url)
    if (selector) {
      if (seenSelectors.has(selector)) {
        // Duplicate selector — skip this URL, keep the canonical one
        continue
      }
      // Use the canonical profile URL if possible, otherwise keep original
      const canonical = buildProfileUrl(field, selector) ?? url
      seenSelectors.set(selector, canonical)
      deduped.push(canonical)
    } else {
      // No selector extracted (non-matching URL) — keep as-is
      deduped.push(url)
    }
  }

  return deduped
}

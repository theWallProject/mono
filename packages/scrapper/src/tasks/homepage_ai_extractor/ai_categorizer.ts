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
  type LinkField
} from "@theWallProject/common"
import { z } from "zod"

import { chatCompletion } from "./ai_client"
import type { CompanyLogger } from "./company_logger"
import type { LinkExtractionResult } from "./link_extractor"

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

// Exclude patterns: URLs that should NOT be auto-categorized as social links
// (they end up in the "urls" bucket instead)
const EXCLUDE_PATTERNS = [
  /youtube\.com\/watch/i,
  /youtube\.com\/shorts/i,
  /youtube\.com\/playlist/i,
  /apps\.apple\./i,
  /play\.google\.com\/store\/apps\/details/i, // Individual app pages (not developer pages)
  /vimeo\./i,
  /greenhouse\./i,
  /consent\.yahoo\./i,
  /cnbc\./i
]

/** URLs that are definitely not the company's own social presence */
const NOISE_PATTERNS = [
  // Search result pages
  /ecosia\.org\/search/i,
  /google\.com\/search/i,
  /bing\.com\/search/i,
  // CDN and asset URLs
  /fonts\.googleapis\.com/i,
  /cdnjs\.cloudflare\.com/i,
  /cdn\./i,
  /static\./i,
  /assets\./i,
  // Analytics and tracking
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /doubleclick\.net/i,
  /facebook\.com\/tr/i, // Facebook tracking pixel
  /facebook\.com\/sharer/i, // Share buttons (not company pages)
  /twitter\.com\/intent/i, // Twitter share intent (not profiles)
  /twitter\.com\/share/i,
  /linkedin\.com\/shareArticle/i, // LinkedIn share (not company pages)
  /linkedin\.com\/cws\/share/i,
  // Common utility pages
  /schema\.org/i,
  /w3\.org/i,
  /creativecommons\.org/i,
  /gravatar\.com/i,
  /wordpress\.org/i,
  /wordpress\.com\/(?!tag\/)/i, // WordPress.com (not company blogs)
  /wp-content\//i,
  /wp-includes\//i,
  // Anchor-only / fragment-only
  /^#/
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

    // Check excluded patterns (these go into "urls" bucket, not social)
    for (const pattern of EXCLUDE_PATTERNS) {
      if (pattern.test(url)) return null
    }

    return null
  } catch {
    return null
  }
}

/**
 * Filters out internal links (links pointing to the same domain as the homepage).
 */
const filterInternalLinks = (links: string[], homepageDomain: string): string[] => {
  return links.filter((link) => {
    try {
      const linkDomain = new URL(link).hostname.replace(/^www\./, "")
      return linkDomain !== homepageDomain
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
 * Domains where the full URL path matters because different paths represent
 * genuinely different items (apps, extensions, packages, profiles, etc.).
 * For these, we keep the full URL instead of collapsing to just the origin.
 */
const KEEP_FULL_PATH_DOMAINS = [
  "play.google.com",
  "apps.apple.com",
  "itunes.apple.com",
  "chromewebstore.google.com",
  "chrome.google.com",          // Legacy Chrome Web Store
  "addons.mozilla.org",
  "microsoftedge.microsoft.com", // Edge Add-ons
  "marketplace.visualstudio.com",
  "www.npmjs.com",
  "npmjs.com",
  "pypi.org",
  "hub.docker.com",
  "store.steampowered.com",
  "www.producthunt.com",
  "producthunt.com",
  "discord.gg",
  "discord.com",
  "t.me",                       // Telegram invite links
  "slack.com",                  // Slack workspace invites
  "medium.com",                 // Different authors/publications
  "www.crunchbase.com",
  "crunchbase.com",
]

/**
 * Reduces a URL to its origin (scheme + host) for domain-level deduplication,
 * UNLESS the domain is one where different paths represent different items
 * (app stores, extension stores, package registries, etc.).
 *
 * e.g. "https://docs.appcharge.com/guides" → "https://docs.appcharge.com"
 * but  "https://apps.apple.com/app/wix/id1099748482" → kept as-is
 */
const collapseToOriginIfGeneric = (url: string): string => {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    for (const domain of KEEP_FULL_PATH_DOMAINS) {
      if (hostname === domain || hostname === `www.${domain}`) {
        // Keep full URL but strip trailing slash and query params for cleanliness
        return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "")
      }
    }

    return parsed.origin
  } catch {
    return url
  }
}

// ────────────────────────────────────────────────────────────────────────────
// AI-powered enhancement
// ────────────────────────────────────────────────────────────────────────────

/** Zod schema for the AI extraction response */
const AiExtractionResultSchema = z.object({
  li: z.array(z.string()).optional(),
  fb: z.array(z.string()).optional(),
  tw: z.array(z.string()).optional(),
  ig: z.array(z.string()).optional(),
  gh: z.array(z.string()).optional(),
  ytp: z.array(z.string()).optional(),
  ytc: z.array(z.string()).optional(),
  tt: z.array(z.string()).optional(),
  th: z.array(z.string()).optional(),
  urls: z.array(z.string()).optional()
}).strict()

type AiExtractionResult = z.infer<typeof AiExtractionResultSchema>

/**
 * Builds the AI prompt for analyzing uncategorized links + HTML sections.
 * Keeps the prompt focused and under ~4KB of HTML context.
 */
const buildAiPrompt = (
  companyName: string,
  uncategorizedLinks: string[],
  footerHtml: string | null,
  headerHtml: string | null
): string => {
  // Trim HTML sections to ~4KB each to avoid overwhelming the model
  const maxHtmlChars = 4000
  const trimmedFooter = footerHtml ? footerHtml.slice(0, maxHtmlChars) : "(no footer found)"
  const trimmedHeader = headerHtml ? headerHtml.slice(0, maxHtmlChars) : "(no header found)"

  // Only include up to 200 uncategorized links to avoid enormous prompts
  const linksToAnalyze = uncategorizedLinks.slice(0, 200)

  return `You are analyzing the website of "${companyName}" to find their official social media profiles.

I have already identified some social links using regex. Below are the UNCATEGORIZED links from the page that my regex did NOT match, plus the page's footer and header HTML which may contain social links in non-standard formats.

Your task:
1. From the uncategorized links, identify any that are official social media profiles for "${companyName}".
2. From the footer/header HTML, find any social media links I may have missed (they could be in onclick handlers, data attributes, or non-anchor elements).
3. ONLY include links that are the company's OWN profiles. Do NOT include:
   - Share/intent links (twitter.com/intent, linkedin.com/shareArticle, etc.)
   - Tracking pixels or analytics URLs
   - Links to OTHER companies' profiles
   - Generic platform links (just facebook.com, just twitter.com)

Categorize each found link into EXACTLY one of these categories:
- "li"  = LinkedIn company/school page (linkedin.com/company/... or linkedin.com/school/...)
- "fb"  = Facebook page (facebook.com/CompanyName or facebook.com/profile.php?id=...)
- "tw"  = Twitter/X profile (x.com/handle or twitter.com/handle)
- "ig"  = Instagram profile (instagram.com/handle)
- "gh"  = GitHub organization/user (github.com/orgname)
- "ytp" = YouTube profile (youtube.com/@handle or youtube.com/c/name or youtube.com/user/name)
- "ytc" = YouTube channel (youtube.com/channel/UC...)
- "tt"  = TikTok profile (tiktok.com/@handle)
- "th"  = Threads profile (threads.net/@handle)
- "urls" = Other noteworthy URLs (App Store pages, Chrome Web Store extensions, Discord servers, etc.)

UNCATEGORIZED LINKS (${linksToAnalyze.length} of ${uncategorizedLinks.length}):
${linksToAnalyze.map((link) => `  ${link}`).join("\n")}

FOOTER HTML:
${trimmedFooter}

HEADER HTML:
${trimmedHeader}

Respond with ONLY a valid JSON object. No markdown, no explanation, no code fences.
If you find nothing, respond with: {}
Example response:
{"li":["https://www.linkedin.com/company/example"],"tw":["https://x.com/example"],"ytp":["https://www.youtube.com/@example"]}`
}

/**
 * Parses and validates the AI response JSON using Zod.
 * Throws on malformed responses — this is an UNEXPECTED failure (prompt/code bug).
 */
const parseAiResponse = (responseText: string, logger: CompanyLogger): AiExtractionResult => {
  // Strip markdown code fences if present (AI sometimes wraps in ```json ... ```)
  let cleaned = responseText.trim()
  if (cleaned.startsWith("```")) {
    // Remove opening fence (with optional language tag)
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "")
    // Remove closing fence
    cleaned = cleaned.replace(/\n?```\s*$/, "")
    cleaned = cleaned.trim()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(
      `AI returned non-JSON response. Raw text:\n${responseText.slice(0, 2000)}`
    )
  }

  const validated = AiExtractionResultSchema.parse(parsed)

  const summaryParts: string[] = []
  const keys = ["li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th", "urls"] as const
  for (const key of keys) {
    const arr = validated[key]
    if (arr && arr.length > 0) {
      summaryParts.push(`${key}:${arr.length}`)
    }
  }
  logger.log(`AI found: ${summaryParts.join(", ") || "(nothing)"}`)

  return validated
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
    case "ws":    target.ws  = [...(target.ws  ?? []), url]; break
    case "li":    target.li  = [...(target.li  ?? []), url]; break
    case "fb":    target.fb  = [...(target.fb  ?? []), url]; break
    case "tw":    target.tw  = [...(target.tw  ?? []), url]; break
    case "ig":    target.ig  = [...(target.ig  ?? []), url]; break
    case "gh":    target.gh  = [...(target.gh  ?? []), url]; break
    case "ytp":   target.ytp = [...(target.ytp ?? []), url]; break
    case "ytc":   target.ytc = [...(target.ytc ?? []), url]; break
    case "tt":    target.tt  = [...(target.tt  ?? []), url]; break
    case "th":    target.th  = [...(target.th  ?? []), url]; break
    case "urls":  target.urls = [...(target.urls ?? []), url]; break
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

  // Filter out internal links (same domain as homepage)
  const externalLinks = filterInternalLinks(extraction.allLinks, homepageDomain)
  logger.log(`External links: ${externalLinks.length} (of ${extraction.allLinks.length} total)`)

  // ── Step 1: Programmatic categorization ──

  const uncategorizedLinks: string[] = []
  const seenNormalized = new Map<string, Set<string>>() // key -> set of normalized URLs

  /** Push a URL into the appropriate result array, handling dedup. Returns true if added. */
  const addToResult = (category: keyof CategorizedLinks, url: string): boolean => {
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

  for (const link of externalLinks) {
    // Check for Android app IDs first — don't duplicate into urls
    const androidAppId = extractAndroidAppId(link)
    if (androidAppId) {
      addToResult("android_app_ids", androidAppId)
      continue
    }

    // Check for Android developer ID — don't duplicate into urls
    const androidDevId = extractAndroidDevId(link)
    if (androidDevId) {
      result.android_dev_id = androidDevId
      continue
    }

    const category = categorizeUrlProgrammatic(link)
    if (category && category !== "il") {
      addToResult(category, link)
    } else {
      uncategorizedLinks.push(link)
    }
  }

  logger.log(
    `Programmatic categorization: ` +
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

    const prompt = buildAiPrompt(
      companyName,
      uncategorizedLinks,
      extraction.footerHtml,
      extraction.headerHtml
    )
    logger.saveAiPrompt(prompt)

    const aiResponseText = await chatCompletion([
      {
        role: "system",
        content:
          "You are a precise data extraction assistant. You analyze website HTML and links to identify official social media profiles for companies. You respond ONLY with valid JSON, no explanations."
      },
      { role: "user", content: prompt }
    ])

    logger.saveAiResponse(aiResponseText)

    const aiResult = parseAiResponse(aiResponseText, logger)

    // Merge AI results — only add links that programmatic categorization didn't find
    const aiCategories: Array<keyof AiExtractionResult> = [
      "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th", "urls"
    ]

    for (const category of aiCategories) {
      const aiLinks = aiResult[category]
      if (!aiLinks || aiLinks.length === 0) continue

      for (const link of aiLinks) {
        aiClaimedNormalized.add(normalizeForDedup(link))

        // Verify the AI's categorization matches our regex for social links
        // (we trust AI for "urls" bucket, but double-check social categorization)
        if (category !== "urls") {
          const programmaticCategory = categorizeUrlProgrammatic(link)
          if (programmaticCategory && programmaticCategory !== "il" && programmaticCategory !== category) {
            logger.log(
              `AI categorized ${link} as "${category}" but regex says "${programmaticCategory}" — using regex result`
            )
            addToResult(programmaticCategory, link)
            continue
          }
        }

        // For urls bucket, collapse to origin for generic domains (keep full path for app stores etc.)
        const urlToAdd = category === "urls" ? collapseToOriginIfGeneric(link) : link
        const added = addToResult(category, urlToAdd)
        if (added) {
          logger.log(`AI added: ${category} <- ${urlToAdd}`)
        }
      }
    }
  } else {
    logger.log("No uncategorized links and no HTML sections — skipping AI analysis")
  }

  // ── Step 2b: Add remaining uncategorized links to urls for future inspection ──
  // Any external link that wasn't claimed by regex, AI, or noise filtering goes into urls.
  // We only store the origin (scheme + host) since we care about domains, not full paths.

  let addedUncategorizedCount = 0
  for (const link of uncategorizedLinks) {
    // Skip if the AI already claimed this link
    if (aiClaimedNormalized.has(normalizeForDedup(link))) continue

    // Skip noise URLs — they are not useful for inspection
    let isNoise = false
    for (const pattern of NOISE_PATTERNS) {
      if (pattern.test(link)) {
        isNoise = true
        break
      }
    }
    if (isNoise) continue

    const origin = collapseToOriginIfGeneric(link)
    if (addToResult("urls", origin)) {
      addedUncategorizedCount++
    }
  }
  if (addedUncategorizedCount > 0) {
    logger.log(`Added ${addedUncategorizedCount} uncategorized domains to urls for future inspection`)
  }

  // ── Step 3: Final dedup — remove urls that were already captured in specialized fields ──

  if (result.urls && result.urls.length > 0) {
    const specializedUrls = new Set<string>()
    const specializedFields: Array<keyof CategorizedLinks> = [
      "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"
    ]
    for (const field of specializedFields) {
      const fieldUrls = result[field]
      if (Array.isArray(fieldUrls)) {
        for (const url of fieldUrls) {
          specializedUrls.add(normalizeForDedup(url))
        }
      }
    }

    const beforeCount = result.urls.length
    result.urls = result.urls.filter((url) => !specializedUrls.has(normalizeForDedup(url)))
    const removedCount = beforeCount - result.urls.length
    if (removedCount > 0) {
      logger.log(`Dedup: removed ${removedCount} URLs already in specialized fields`)
    }
    if (result.urls.length === 0) {
      delete result.urls
    }
  }

  // Clean up: sort all arrays (explicit field list to avoid type assertions)
  const arrayFields: Array<keyof CategorizedLinks> = [
    "ws", "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th", "urls", "android_app_ids"
  ]
  for (const field of arrayFields) {
    const arr = result[field]
    if (Array.isArray(arr)) {
      arr.sort()
    }
  }

  logger.log(
    `Final categorization: ` +
      Object.entries(result)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}:${Array.isArray(v) ? v.length : 1}`)
        .join(", ")
  )
  logger.saveResult(result)

  return result
}

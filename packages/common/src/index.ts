import { parse } from "tldts"
import { z } from "zod"

/**
 * Enum-like object for APIListOfReasons, for code reference.
 */
export const APIListOfReasons = {
  /** HeadQ Location: Israel, Operating Status: Active */
  HeadQuarterInIL: "h",
  /** HeadQ Location: Not Israel, Operating Status: Active, Founders > Location: Israel */
  FounderInIL: "f",
  /** HeadQ Location: Not Israel, Operating Status: Active, Founders > Location: Not Israel, Investors > Location: Israel */
  InvestorNotFounderInIL: "i",
  /** Url */
  Url: "u",
  /** BDS Priority - Consumer boycott priority targets */
  BDSPriority: "BDS_PRIO",
  /** BDS Grassroots - Grassroots organic boycott targets */
  BDSGrassroots: "BDS_GRASS",
  /** BDS Pressure - Pressure targets */
  BDSPressure: "BDS_PRESSURE"
} as const

export type valuesOfListOfReasons = (typeof APIListOfReasons)[keyof typeof APIListOfReasons]

/**
 * Schema for API list of reasons (shared between addon and scrapper via FinalDBFileSchema).
 */
export const APIListOfReasonsSchema = z.enum([
  APIListOfReasons.HeadQuarterInIL,
  APIListOfReasons.FounderInIL,
  APIListOfReasons.InvestorNotFounderInIL,
  APIListOfReasons.Url,
  APIListOfReasons.BDSPriority,
  APIListOfReasons.BDSGrassroots,
  APIListOfReasons.BDSPressure
])

export type APIListOfReasonsValues = z.infer<typeof APIListOfReasonsSchema>

/**
 * Link field type shared across all packages.
 * When adding a new field, all packages should support it.
 */
export type LinkField =
  | "ws" // website
  | "li" // linkedin
  | "fb" // facebook
  | "tw" // twitter
  | "ig" // instagram
  | "gh" // github
  | "ytp" // youtube profile
  | "ytc" // youtube channel
  | "tt" // tiktok
  | "th" // threads
  | "il" // israeli website (.il domain)

/**
 * Platform-agnostic URL check result (without dismissal tracking).
 * Shared across all packages. Platform-specific extensions (like isDismissed) should extend this type.
 */
export type UrlCheckResult =
  | {
      isHint: true
      name: string
      hintText: string
      hintUrl: string
      hintCompanyId?: string
      rule: {
        selector: string
        key: LinkField
      }
    }
  | {
      isHint?: false | undefined
      reasons: APIListOfReasonsValues[]
      name: string
      alt?: { n: string; ws: string }[]
      stockSymbol?: string
      comment?: string
      link?: string
      rule: {
        selector: string
        key: LinkField
      }
    }
  | undefined

/**
 * Domain hint info - shown when a flagged company is viewed on a domain with an associated hint.
 * For example: instagram.com/wix → Wix flagged + Upscrolled suggestion for Instagram.
 * Shared across addon and telegram-bot packages.
 */
export type DomainHint = {
  hintText: string
  hintUrl: string
  hintCompanyId?: string
  name: string
}

export type SpecialDomains =
  | "linkedin.com"
  | "facebook.com"
  | "twitter.com"
  | "x.com"
  | "instagram.com"
  | "github.com"
  | "youtube.com"
  | "tiktok.com"
  | "threads.com"

type APIEndpointRule = {
  domain: SpecialDomains
  regex: string
}

/**
 * Zod schema for FinalDBFileType - THE ABSOLUTE SOURCE OF TRUTH.
 *
 * ⚠️ IMPORTANT: This Zod schema is the authoritative source for ALL.json structure.
 * The JSON schema file at `packages/common/src/schemas/all.generated.schema.json` is AUTO-GENERATED
 * from this Zod schema using `zod-to-json-schema`.
 *
 * To update the schema:
 * 1. Modify this Zod schema
 * 2. Run `pnpm run generate-schema` to regenerate the JSON schema file
 * 3. The build will validate ALL.json files against the generated schema
 *
 * HINT ENTRIES:
 * For hint entries (isHint: true), link fields can be strings OR arrays of strings.
 * This allows a single hint to cover multiple social media profiles/websites.
 * Regular entries (isHint: false or undefined) must use strings only.
 */
export const FinalDBFileSchema = z
  .object({
    /** id */
    id: z.string(),
    /** website - string for regular entries, string or array for hints */
    ws: z.union([z.string(), z.array(z.string())]).optional(),
    /** linkedin - string for regular entries, string or array for hints */
    li: z.union([z.string(), z.array(z.string())]).optional(),
    /** facebook - string for regular entries, string or array for hints */
    fb: z.union([z.string(), z.array(z.string())]).optional(),
    /** twitter - string for regular entries, string or array for hints */
    tw: z.union([z.string(), z.array(z.string())]).optional(),
    /** instagram - string for regular entries, string or array for hints */
    ig: z.union([z.string(), z.array(z.string())]).optional(),
    /** github - string for regular entries, string or array for hints */
    gh: z.union([z.string(), z.array(z.string())]).optional(),
    /** youtube profile - string for regular entries, string or array for hints */
    ytp: z.union([z.string(), z.array(z.string())]).optional(),
    /** youtube channel - string for regular entries, string or array for hints */
    ytc: z.union([z.string(), z.array(z.string())]).optional(),
    /** tiktok - string for regular entries, string or array for hints */
    tt: z.union([z.string(), z.array(z.string())]).optional(),
    /** threads - string for regular entries, string or array for hints */
    th: z.union([z.string(), z.array(z.string())]).optional(),
    /** reasons */
    r: z.array(APIListOfReasonsSchema),
    /** name */
    n: z.string(),
    /** comment */
    c: z.string().optional(),
    /** stock sympol */
    s: z.string().optional(),
    /** alternative names */
    alt: z
      .array(
        z
          .object({
            /** name */
            n: z.string(),
            /** website */
            ws: z.string()
          })
          .strict()
      )
      .optional(),
    /** hint flag */
    isHint: z.boolean().optional(),
    /** hint text */
    hintText: z.string().optional(),
    /** hint URL */
    hintUrl: z.string().optional(),
    /** hint company ID for company-level dismissal */
    hintCompanyId: z.string().optional(),
    /** Android app ID for hints (e.g., "com.xxx.yyy") */
    hint_android_id: z.string().optional(),
    /** Android developer ID like "com.wix" (not full app package IDs) */
    android_dev_id: z.string().optional(),
    /** Array of full Android app package IDs for exact matching */
    android_app_ids: z.array(z.string()).optional()
  })
  .strict()

export type FinalDBFileType = z.infer<typeof FinalDBFileSchema>

export type APIEndpointConfig = {
  rules: APIEndpointRule[]
}

/**
 * LinkedIn regex - should be used with case-insensitive flag ('i') since LinkedIn IDs are case-insensitive
 * Matches both company and showcase formats:
 * - linkedin.com/company/ID
 * - linkedin.com/showcase/ID
 * - https://www.linkedin.com/company/ID
 * - https://www.linkedin.com/showcase/ID
 * Handles optional protocol (http://, https://) and optional www. prefix
 */
export const API_ENDPOINT_RULE_LINKEDIN_COMPANY = {
  domain: "linkedin.com",
  regex: "(?:https?://)?(?:www\\.)?(?:linkedin\\.com)/(?!school)(?:company|showcase)/([^/?]+)"
} as const satisfies APIEndpointRule

export const API_ENDPOINT_RULE_FACEBOOK = {
  domain: "facebook.com",
  regex:
    "(?:facebook\\.com)/(?!events|groups|marketplace|watch|gaming|login|profile\\.php|home\\.php|pages|search|people(?=[/?]|$)|share(?=[/?]|$))([^/?]+)"
} as const satisfies APIEndpointRule

/**
 * Twitter regex - should be used with case-insensitive flag ('i') since Twitter IDs are case-insensitive
 */
export const API_ENDPOINT_RULE_TWITTER = {
  domain: "twitter.com",
  regex: "(?<!\\w)(?:twitter\\.com|x\\.com|t\\.co)/(?!search|hashtag|i/|intent|settings)([^/?]+)"
} as const satisfies APIEndpointRule

export const API_ENDPOINT_RULE_INSTAGRAM = {
  domain: "instagram.com",
  regex: "(?:instagram\\.com)/(?!explore|reels|p/|stories|tv/|direct|accounts)([^/?]+)"
} as const satisfies APIEndpointRule

export const API_ENDPOINT_RULE_GITHUB = {
  domain: "github.com",
  regex: "(?<!gist\\.)(?:github\\.com)/(?!settings|.*/(?:issues|pull|releases|actions|security))([^/]+)"
} as const satisfies APIEndpointRule // Captures userid only: github.com/userid/repoid → userid

/**
 * YouTube profile regex - should be used with case-insensitive flag ('i') since YouTube profile IDs are case-insensitive
 * Matches all equivalent formats:
 * - youtube.com/ID
 * - youtube.com/@ID
 * - youtube.com/c/ID
 * - youtube.com/c/@ID
 * - youtube.com/user/ID
 * - https://www.youtube.com/@ID
 * - http://youtube.com/ID
 * All formats capture the ID (without @ prefix) since they represent the same profile/channel
 * Handles optional protocol (http://, https://) and optional www. prefix
 * Note: The regex uses multiple capture groups (1-4) for different formats. Use the first non-undefined group.
 */
export const API_ENDPOINT_RULE_YOUTUBE_PROFILE = {
  domain: "youtube.com",
  regex:
    "(?:https?://)?(?:www\\.)?(?:youtube\\.com)/(?:(?:user/([^/?]+))|(?:c/(?!(?:@)?(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)@?([^/?]+))|(?:@(?!(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)([^/?]+))|(?!(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)(?!(?:c/|@|user/))([^/?]+))"
} as const satisfies APIEndpointRule

export const API_ENDPOINT_RULE_YOUTUBE_CHANNEL = {
  domain: "youtube.com",
  regex: "(?:https?://)?(?:www\\.)?(?:youtube\\.com)/channel/([^/?]+)"
} as const satisfies APIEndpointRule

export const API_ENDPOINT_RULE_TIKTOK = {
  domain: "tiktok.com",
  regex: "(?:tiktok\\.com)/(?!.*/video/|discover|foryou|trending|music|upload)([^/?]+)"
} as const satisfies APIEndpointRule

export const API_ENDPOINT_RULE_THREADS = {
  domain: "threads.com",
  regex: "(?:threads\\.com)/(?!.*/post/|search|explore|activity|settings)([^/?]+)"
} as const satisfies APIEndpointRule

export const CONFIG: APIEndpointConfig = {
  rules: [
    API_ENDPOINT_RULE_LINKEDIN_COMPANY,
    API_ENDPOINT_RULE_FACEBOOK,
    API_ENDPOINT_RULE_TWITTER,
    API_ENDPOINT_RULE_INSTAGRAM,
    API_ENDPOINT_RULE_GITHUB,
    API_ENDPOINT_RULE_YOUTUBE_PROFILE,
    API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
    API_ENDPOINT_RULE_TIKTOK,
    API_ENDPOINT_RULE_THREADS
  ]
}

/**
 * Extracts the main domain from a given URL.
 **/
export function getMainDomain(url: string) {
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`

    const { hostname } = new URL(urlWithProtocol)
    const parsed = parse(hostname)

    if (parsed.hostname) {
      return parsed.hostname.replace("www.", "")
    }
    console.warn("getMainDomain empty:", url)

    return ""
  } catch (e) {
    console.error("getMainDomain error:", url, e)
    return ""
  }
}

/**
 * Normalizes a URL by removing www. prefix for regex matching.
 * Pure function with no side effects.
 */
export function normalizeUrl(url: string): string {
  return url.replace(/^(https?:\/\/)www\./i, "$1")
}

/**
 * Gets regex flags for a domain (case-insensitive for YouTube, Twitter, LinkedIn).
 * Pure function with no side effects.
 */
function getRegexFlags(domain: SpecialDomains): string {
  return domain === "youtube.com" || domain === "twitter.com" || domain === "linkedin.com" ? "i" : ""
}

/**
 * Finds the matching rule for a URL from CONFIG.rules.
 * Pure function with no side effects.
 * @param url - The normalized URL to match
 * @returns The matching rule or null if no match
 */
export function findMatchingRule(url: string): (typeof CONFIG.rules)[number] | null {
  const normalizedUrl = normalizeUrl(url)
  const rule = CONFIG.rules.find((rule) => {
    const flags = getRegexFlags(rule.domain)
    const ruleRegex = new RegExp(rule.regex, flags)
    return ruleRegex.test(normalizedUrl)
  })
  return rule || null
}

/**
 * Extracts the selector (username/ID) from a URL using a rule's regex.
 * Pure function with no side effects.
 * @param url - The normalized URL
 * @param rule - The rule to use for extraction
 * @returns The extracted selector or null if no match
 */
export function extractSelector(url: string, rule: (typeof CONFIG.rules)[number]): string | null {
  const normalizedUrl = normalizeUrl(url)
  const flags = getRegexFlags(rule.domain)
  const regex = new RegExp(rule.regex, flags)
  const results = regex.exec(normalizedUrl)
  // For YouTube, the regex has multiple capture groups - use the first non-undefined one
  // Groups: 1=user/, 2=c/@?, 3=@, 4=direct
  const selector = results && (results[1] || results[2] || results[3] || results[4] || results[1])
  return selector || null
}

/**
 * Finds a matching database entry by selector (username, profile name, etc.).
 * Supports both string and array values for hint entries.
 * Pure function with no side effects.
 * @param selector - The selector to search for (e.g., username, profile name)
 * @param selectorKey - The database field key to search in
 * @param domain - The domain being checked (for case-sensitivity rules)
 * @param database - The database array to search
 * @returns The matching database entry or null
 */
export function findInDatabaseBySelector(
  selector: string,
  selectorKey: LinkField,
  domain: SpecialDomains,
  database: FinalDBFileType[]
): FinalDBFileType | null {
  // "il" is not a database field, skip database lookup
  if (selectorKey === "il") {
    return null
  }

  const findResult = database.find((row) => {
    const dbValue = row[selectorKey]
    if (!dbValue) {
      return false
    }

    // Handle both string and array values (for hints)
    const dbValues = Array.isArray(dbValue) ? dbValue : [dbValue]

    // Normalize selector: strip @ prefix
    const normalizedSelector = selector.replace(/^@/i, "")

    // Case-insensitive comparison for YouTube, Twitter, LinkedIn
    const isCaseInsensitive = domain === "youtube.com" || domain === "twitter.com" || domain === "linkedin.com"

    return dbValues.some((value) => {
      if (typeof value !== "string") return false

      // Normalize db value: strip @ prefix
      const normalizedDbValue = value.replace(/^@/i, "")

      return isCaseInsensitive
        ? normalizedDbValue.toLowerCase() === normalizedSelector.toLowerCase()
        : normalizedDbValue === normalizedSelector
    })
  })

  return findResult || null
}

/**
 * Checks if testDomain is a subdomain of baseDomain.
 * Returns true only if baseDomain is a base domain (no subdomain) and testDomain is its subdomain.
 * Pure function with no side effects.
 *
 * Examples:
 * - isSubdomainOf("fr.wix.com", "wix.com") → true
 * - isSubdomainOf("careers.wix.com", "wix.com") → true
 * - isSubdomainOf("wix.com", "wix.com") → false (same domain)
 * - isSubdomainOf("wix.com", "fr.wix.com") → false (base domain doesn't match subdomain)
 * - isSubdomainOf("de.wix.com", "fr.wix.com") → false (different subdomains)
 * @param testDomain - The domain to test (e.g., "fr.wix.com")
 * @param baseDomain - The base domain to check against (e.g., "wix.com")
 * @returns True if testDomain is a subdomain of baseDomain
 */
function isSubdomainOf(testDomain: string, baseDomain: string): boolean {
  // Must be different domains
  if (testDomain === baseDomain) return false

  // Check if testDomain ends with ".baseDomain"
  if (!testDomain.endsWith(`.${baseDomain}`)) return false

  // Ensure baseDomain has no subdomain (count dots)
  // wix.com has 1 dot → base domain
  // fr.wix.com has 2 dots → subdomain
  // api.fr.wix.com has 3 dots → nested subdomain
  const baseDotCount = (baseDomain.match(/\./g) || []).length
  const testDotCount = (testDomain.match(/\./g) || []).length

  // baseDomain must be base (1 dot for .com/.net, 2 dots for .co.uk/.com.au)
  // testDomain must have more dots than baseDomain
  return testDotCount > baseDotCount
}

/**
 * Finds a matching database entry by domain (for website lookups).
 * Supports subdomain matching: if a base domain is stored (e.g., "wix.com"),
 * it will match all subdomains (e.g., "fr.wix.com", "careers.wix.com").
 * If a subdomain is explicitly stored (e.g., "fr.wix.com"), only that exact subdomain matches.
 * Supports both string and array values for hint entries.
 * Pure function with no side effects.
 * @param domain - The domain to search for
 * @param database - The database array to search
 * @returns The matching database entry or null
 */
export function findInDatabaseByDomain(domain: string, database: FinalDBFileType[]): FinalDBFileType | null {
  // First pass: check for exact match (prioritizes exact subdomain matches over base domain matches)
  const exactMatch = database.find((row) => {
    if (!row.ws) return false

    // Handle both string and array values (for hints)
    const wsValues = Array.isArray(row.ws) ? row.ws : [row.ws]
    return wsValues.includes(domain)
  })
  if (exactMatch) return exactMatch

  // Second pass: check for subdomain match (only if no exact match found)
  // If stored rule is base domain (no subdomain), check if input is its subdomain
  // Example: stored="wix.com", input="fr.wix.com" → should match
  const subdomainMatch = database.find((row) => {
    if (!row.ws) return false

    // Handle both string and array values (for hints)
    const wsValues = Array.isArray(row.ws) ? row.ws : [row.ws]
    return wsValues.some((wsValue) => isSubdomainOf(domain, wsValue))
  })

  return subdomainMatch || null
}

/**
 * Finds a hint that applies to the given domain (via ws field).
 * Used to show platform hints inside banners for flagged companies.
 * For example: Instagram → Upscrolled, BBC → Newscord, ChatGPT → Thaura
 * Pure function with no side effects.
 * @param domain - The domain to search for (e.g., "instagram.com")
 * @param database - The database array to search
 * @returns The matching hint entry or null if no hint applies
 */
export function findHintByDomain(domain: string, database: FinalDBFileType[]): FinalDBFileType | null {
  const result = database.find((row) => {
    if (!row.isHint || !row.ws) return false

    // Handle both string and array values (for hints)
    const wsValues = Array.isArray(row.ws) ? row.ws : [row.ws]

    return wsValues.some((wsValue) => {
      const wsDomain = getMainDomain(wsValue)
      // Check for exact domain match or subdomain relationship
      // Exact match: "instagram.com" === "instagram.com"
      // Subdomain: "www.instagram.com" ends with ".instagram.com"
      // Avoids false positives like "xbox.com" matching "x.com"
      return (
        domain === wsDomain ||
        domain.endsWith(`.${wsDomain}`) ||
        wsDomain.endsWith(`.${domain}`)
      )
    })
  })

  return result || null
}

/**
 * Formats a database hint entry into a DomainHint.
 * Returns undefined if the entry is not a valid hint.
 * Pure function with no side effects.
 * @param hint - The database entry to format (from findHintByDomain)
 * @returns DomainHint or undefined if the entry is invalid
 */
export function formatDomainHint(hint: FinalDBFileType | null): DomainHint | undefined {
  if (!hint || !hint.hintText || !hint.hintUrl) {
    return undefined
  }
  return {
    hintText: hint.hintText,
    hintUrl: hint.hintUrl,
    hintCompanyId: hint.hintCompanyId,
    name: hint.n
  }
}

/**
 * Formats a database entry into a UrlCheckResult.
 * Pure function with no side effects.
 * @param findResult - The database entry to format
 * @param selector - The selector (username/domain)
 * @param selectorKey - The database field key
 * @returns Formatted UrlCheckResult
 */
export function formatResult(findResult: FinalDBFileType, selector: string, selectorKey: LinkField): UrlCheckResult {
  // Check if this is a hint entry
  if (findResult.isHint && findResult.hintText) {
    return {
      isHint: true,
      name: findResult.n,
      hintText: findResult.hintText,
      hintUrl: findResult.hintUrl || "",
      hintCompanyId: findResult.hintCompanyId,
      rule: {
        selector,
        key: selectorKey
      }
    }
  }

  // For regular entries, extract string value from ws (should always be string, not array)
  // If it's an array (shouldn't happen for non-hints), take first value
  const link = Array.isArray(findResult.ws) ? findResult.ws[0] : findResult.ws

  return {
    isHint: false,
    reasons: findResult.r,
    name: findResult.n,
    alt: findResult.alt,
    stockSymbol: findResult.s,
    comment: findResult.c,
    link,
    rule: {
      selector,
      key: selectorKey
    }
  }
}

/**
 * Gets the selector key (database field name) for a given domain.
 * Maps SpecialDomains to LinkField values.
 * @param domain - The domain to map
 * @param url - Optional URL (required for youtube.com to distinguish between profile and channel)
 * @returns The corresponding LinkField value
 * @throws Error if domain is unexpected or URL is required but missing
 */
export function getSelectorKey(domain: SpecialDomains, url?: string): LinkField {
  switch (domain) {
    case "facebook.com":
      return "fb"
    case "twitter.com":
    case "x.com":
      return "tw"
    case "linkedin.com":
      return "li"
    case "instagram.com":
      return "ig"
    case "github.com":
      return "gh"
    case "youtube.com": {
      if (!url) {
        throw new Error("getSelectorKey: url is required for youtube.com domain")
      }
      if (url.includes("/channel/")) {
        return "ytc"
      }
      if (url.includes("/@")) {
        return "ytp"
      }
      // Default to ytp for other YouTube URLs (shouldn't happen with proper rules)
      return "ytp"
    }
    case "tiktok.com":
      return "tt"
    case "threads.com":
      return "th"
    default: {
      throw new Error(`getSelectorKey: unexpected domain ${domain}`)
    }
  }
}

// Export blacklist schemas
export { BlacklistItemSchema, BlacklistSchema, type BlacklistItem, type Blacklist } from "./schemas/blacklist"

// Export formatting utilities
export { formatAndWrite, type WriteOptions } from "./utils/formatAndWrite"

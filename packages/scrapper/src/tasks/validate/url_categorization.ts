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

import { log } from "../../helper"

/**
 * Categorize a URL into ws, li, fb, tw, ig, gh, ytp, ytc, tt, th, or null (unsupported)
 */
export const categorizeUrl = (url: string): LinkField | null => {
  try {
    // Check LinkedIn
    const regexLinkedin = new RegExp(API_ENDPOINT_RULE_LINKEDIN_COMPANY.regex)
    if (regexLinkedin.test(url)) {
      return "li"
    }

    // Check Facebook
    const regexFacebook = new RegExp(API_ENDPOINT_RULE_FACEBOOK.regex)
    const normalizedFb = url.replace("/pg/", "/").replace("/p/", "/")
    if (regexFacebook.test(normalizedFb)) {
      return "fb"
    }

    // Check Twitter/X
    const regexTwitter = new RegExp(API_ENDPOINT_RULE_TWITTER.regex)
    if (regexTwitter.test(url)) {
      return "tw"
    }

    // Check Instagram
    const regexInstagram = new RegExp(API_ENDPOINT_RULE_INSTAGRAM.regex)
    if (regexInstagram.test(url)) {
      return "ig"
    }

    // Check GitHub
    const regexGitHub = new RegExp(API_ENDPOINT_RULE_GITHUB.regex)
    if (regexGitHub.test(url)) {
      return "gh"
    }

    // Check YouTube Profile - use common regex as only source of truth
    const regexYouTubeProfile = new RegExp(API_ENDPOINT_RULE_YOUTUBE_PROFILE.regex, "i")
    if (regexYouTubeProfile.test(url)) {
      return "ytp"
    }

    // Check YouTube Channel - use common regex as only source of truth
    const regexYouTubeChannel = new RegExp(API_ENDPOINT_RULE_YOUTUBE_CHANNEL.regex, "i")
    if (regexYouTubeChannel.test(url)) {
      return "ytc"
    }

    // Check TikTok
    const regexTikTok = new RegExp(API_ENDPOINT_RULE_TIKTOK.regex)
    if (regexTikTok.test(url)) {
      return "tt"
    }

    // Check Threads
    const regexThreads = new RegExp(API_ENDPOINT_RULE_THREADS.regex)
    if (regexThreads.test(url)) {
      return "th"
    }

    // Don't auto-categorize websites - keep them in urls for manual organization
    // Exclude obvious non-website URLs (Note: Profile/channel URLs are handled above via common regex)
    // Exclude video URLs and app store URLs, but allow other URLs to stay in urls
    const excludePatterns = [
      /youtube\.com\/watch/i,
      /youtube\.com\/shorts/i,
      /apps\.apple\./i,
      /play\.google\./i,
      /vimeo\./i,
      /greenhouse\./i,
      /consent\.yahoo\./i,
      /cnbc\./i
    ]

    const isExcluded = excludePatterns.some((pattern) => pattern.test(url))
    if (isExcluded) {
      return null // Unsupported
    }

    // Websites stay in urls array for manual organization
    return null
  } catch (e) {
    log(`  [DEBUG] Error categorizing URL ${url}: ${e}`)
    return null
  }
}

/**
 * Domains that have regex-based extraction rules in @theWallProject/common.
 * URLs from these domains that DON'T match their respective regex are not useful
 * (e.g., linkedin.com/legal/privacy-policy, facebook.com/sharer.php) and should be
 * dropped entirely rather than ending up in the `urls` leftover array.
 */
const REGEX_DOMAINS = new Set([
  "linkedin.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "github.com",
  "youtube.com",
  "tiktok.com",
  "threads.com"
])

/**
 * Checks if a URL belongs to a domain that has regex-based extraction rules.
 * URLs from these domains that fail regex matching should be silently dropped.
 */
export const isFromRegexDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname.replace(/^(www|m|mobile|business|l|lm|platform)\./i, "")
    return REGEX_DOMAINS.has(hostname)
  } catch {
    return false
  }
}

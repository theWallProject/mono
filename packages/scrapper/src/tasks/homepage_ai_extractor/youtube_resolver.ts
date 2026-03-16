/**
 * YouTube channel ID → @handle resolver.
 *
 * When a YouTube channel URL uses a channel ID (e.g., /channel/UCxxxx),
 * the company name rarely appears in the URL, so it can never be "green".
 * This module resolves channel IDs to their @handle equivalents by fetching
 * the YouTube channel page and extracting the `canonicalBaseUrl` from the
 * HTML response.
 *
 * The resolved @handle URL is added to `ytp` alongside the original `ytc`
 * entry — both are kept.
 *
 * NON-FATAL error handling:
 *   - If a channel has no @handle (rare legacy channels) → log and skip.
 *   - If YouTube returns 404 → log and skip.
 *   - If network fails → log warning and skip (no auth required).
 *   - The `ytc` entry is always preserved regardless of resolution outcome.
 */

import * as https from "https"

import type { CompanyLogger } from "./company_logger"
import type { CategorizedLinks } from "./ai_categorizer"

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

/** Timeout for YouTube channel page fetch (lightweight HTML scrape) */
const YOUTUBE_REQUEST_TIMEOUT_MS = 10_000

/** Regex to extract the UC... channel ID from a YouTube channel URL */
const YT_CHANNEL_RE = /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i

// ────────────────────────────────────────────────────────────────────────────
// Channel ID extraction
// ────────────────────────────────────────────────────────────────────────────

/** Extract the channel ID from a YouTube channel URL, or null. */
const extractChannelId = (url: string): string | null => {
  const m = YT_CHANNEL_RE.exec(url)
  return m?.[1] ?? null
}

// ────────────────────────────────────────────────────────────────────────────
// Single channel resolution
// ────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a YouTube channel ID to its @handle by fetching the channel page.
 * Works with any casing (e.g., "ucsm8sofdl36aekvq7pforsg").
 * Streams the response and aborts as soon as `canonicalBaseUrl` is found.
 * Returns the handle (without @) or null if the channel has no handle.
 * Throws on network/HTTP errors — caller decides how to handle.
 */
export const resolveYouTubeHandle = async (channelId: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://www.youtube.com/channel/${channelId}`,
      { timeout: YOUTUBE_REQUEST_TIMEOUT_MS },
      (res) => {
        if (res.statusCode === 404) {
          res.resume()
          resolve(null)
          return
        }
        if (res.statusCode !== 200) {
          res.resume()
          reject(new Error(`YouTube returned HTTP ${res.statusCode ?? "unknown"} for channel/${channelId}`))
          return
        }

        let data = ""
        let resolved = false
        res.on("data", (chunk: string) => {
          if (resolved) return
          data += chunk
          const idx = data.indexOf("canonicalBaseUrl")
          if (idx >= 0) {
            const slice = data.slice(idx, idx + 80)
            const m = /\/@([^"]+)/.exec(slice)
            if (m?.[1]) {
              resolved = true
              resolve(m[1])
              req.destroy()
            }
          }
        })
        res.on("end", () => {
          if (resolved) return
          const idx = data.indexOf("canonicalBaseUrl")
          if (idx >= 0) {
            const slice = data.slice(idx, idx + 80)
            const m = /\/@([^"]+)/.exec(slice)
            resolve(m?.[1] ?? null)
          } else {
            resolve(null)
          }
        })
        res.on("error", (err) => {
          if (!resolved) reject(err)
        })
      }
    )

    req.on("timeout", () => {
      req.destroy(new Error(`YouTube request timed out for channel/${channelId}`))
    })
    req.on("error", (err) => {
      if (!err.message.includes("socket hang up")) reject(err)
    })
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Batch resolution for CategorizedLinks
// ────────────────────────────────────────────────────────────────────────────

/** Resolver function type — resolves a channel ID to an @handle (or null). */
export type YouTubeHandleResolver = (channelId: string) => Promise<string | null>

/**
 * Resolve all YouTube channel IDs in a CategorizedLinks object to @handles.
 *
 * For each `ytc` URL with a channel ID, fetches the YouTube channel page to
 * find the `canonicalBaseUrl` (@handle). If found, adds the corresponding
 * `ytp` URL (`https://www.youtube.com/@{handle}`) to the result — keeping
 * both the original `ytc` entry and the new `ytp` entry.
 *
 * Non-fatal: if resolution fails for a channel, logs a warning and skips it.
 * The `ytc` entry is always preserved.
 *
 * Returns a new CategorizedLinks object (does not mutate the input).
 *
 * @param resolver — Optional override for the handle resolver (used in tests).
 *                   Defaults to `resolveYouTubeHandle` (real HTTP fetch).
 */
export const resolveYouTubeChannelHandles = async (
  categorized: CategorizedLinks,
  logger: CompanyLogger,
  resolver: YouTubeHandleResolver = resolveYouTubeHandle
): Promise<CategorizedLinks> => {
  const ytcUrls = categorized.ytc
  if (!ytcUrls || ytcUrls.length === 0) {
    logger.log("  YOUTUBE: no ytc entries to resolve")
    return categorized
  }

  // Extract channel IDs that need resolution
  const channelIds: Array<{ channelId: string; url: string }> = []
  for (const url of ytcUrls) {
    const id = extractChannelId(url)
    if (id) {
      channelIds.push({ channelId: id, url })
    }
  }

  if (channelIds.length === 0) {
    logger.log("  YOUTUBE: no channel IDs found in ytc URLs")
    return categorized
  }

  logger.log(`  YOUTUBE: resolving ${channelIds.length} channel ID(s) to @handles`)

  // Collect existing ytp URLs to avoid duplicates
  const existingYtp = new Set<string>(
    (categorized.ytp ?? []).map((u) => u.toLowerCase())
  )
  const newYtpUrls: string[] = []

  for (const { channelId, url } of channelIds) {
    try {
      const handle = await resolver(channelId)

      if (handle) {
        const ytpUrl = `https://www.youtube.com/@${handle}`
        if (!existingYtp.has(ytpUrl.toLowerCase())) {
          existingYtp.add(ytpUrl.toLowerCase())
          newYtpUrls.push(ytpUrl)
          logger.log(`  YOUTUBE: resolved ${channelId} → @${handle}`)
        } else {
          logger.log(`  YOUTUBE: resolved ${channelId} → @${handle} (already in ytp, skipped)`)
        }
      } else {
        logger.log(`  YOUTUBE: ${channelId} has no @handle (from ${url})`)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      logger.log(`  YOUTUBE WARNING: failed to resolve ${channelId}: ${errMsg}`)
    }
  }

  if (newYtpUrls.length === 0) {
    logger.log("  YOUTUBE: no new ytp URLs resolved")
    return categorized
  }

  // Build new result with both ytc (unchanged) and updated ytp
  const result: CategorizedLinks = { ...categorized }
  result.ytp = [...(categorized.ytp ?? []), ...newYtpUrls]
  logger.log(`  YOUTUBE: added ${newYtpUrls.length} ytp URL(s) from ytc resolution`)

  return result
}

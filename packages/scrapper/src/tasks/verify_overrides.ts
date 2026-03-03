/**
 * Interactive quick-verify script for auto-extracted (isHomepage) override entries.
 *
 * Displays one company at a time. The user verifies (←), postpones (→),
 * or exits (x). Saves run fire-and-forget in the background so the next
 * entry appears instantly. Data is loaded once at startup and mutated
 * in-memory — only the background writer touches disk.
 *
 * Usage: pnpm data:verify
 */

import { execSync } from "child_process"
import * as https from "https"
import * as readline from "readline"

import { z } from "zod"

import { error as logError, log } from "../helper"
import { loadManualOverrides, mergeAndSaveManualOverrides } from "./validate/override_io"
import { categorizeUrl } from "./validate/url_categorization"
import { hasMeta, isHomepage, isVerified, type EntryMeta, type ManualOverrideValue } from "./validate/types"

// ────────────────────────────────────────────────────────────────────────────
// ANSI helpers
// ────────────────────────────────────────────────────────────────────────────

const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"
const DIM = "\x1b[2m"
const WHITE = "\x1b[97m"
const CYAN = "\x1b[36m"
const BLUE = "\x1b[34m"
const GRAY = "\x1b[90m"
const MAGENTA = "\x1b[35m"
const GREEN = "\x1b[32m"
const YELLOW = "\x1b[33m"
const RED = "\x1b[31m"
const BG_GREEN = "\x1b[42m"
const BG_YELLOW = "\x1b[43m"
const BG_BLUE = "\x1b[44m"
const CLEAR_SCREEN = "\x1b[2J\x1b[H"

const FIELD_COLORS: Record<string, string> = {
  ws: CYAN,
  li: BLUE,
  fb: BLUE,
  tw: GRAY,
  ig: MAGENTA,
  gh: GREEN,
  ytp: RED,
  ytc: RED,
  tt: WHITE,
  th: GRAY,
  urls: YELLOW,
  android_dev_id: GREEN,
  android_app_ids: GREEN,
  alt: CYAN,
}

const FIELD_LABELS: Record<string, string> = {
  ws: "Website",
  li: "LinkedIn",
  fb: "Facebook",
  tw: "Twitter/X",
  ig: "Instagram",
  gh: "GitHub",
  ytp: "YouTube",
  ytc: "YT Channel",
  tt: "TikTok",
  th: "Threads",
  urls: "Other URLs",
  android_dev_id: "Android Dev",
  android_app_ids: "Android Apps",
  alt: "Alternatives",
}

// ────────────────────────────────────────────────────────────────────────────
// Clipboard
// ────────────────────────────────────────────────────────────────────────────

/** Read the system clipboard. Returns the trimmed text or null on failure. */
const readClipboard = (): string | null => {
  try {
    const cmd =
      process.platform === "win32"
        ? "powershell -NoProfile -Command Get-Clipboard"
        : process.platform === "darwin"
          ? "pbpaste"
          : "xclip -selection clipboard -o"
    return execSync(cmd, { encoding: "utf-8", timeout: 3000 }).trim() || null
  } catch {
    return null
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Play Store URL ↔ package ID
// ────────────────────────────────────────────────────────────────────────────

const PLAY_STORE_RE = /play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)/

/** Extract an Android package ID from a Play Store URL, or return null. */
const extractPackageId = (url: string): string | null => {
  const m = PLAY_STORE_RE.exec(url)
  return m?.[1] ?? null
}

// ────────────────────────────────────────────────────────────────────────────
// Name-in-link matching
// ────────────────────────────────────────────────────────────────────────────

/** Lowercase + strip non-alphanumeric for fuzzy comparison. */
const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "")

/**
 * Extract name candidates from a company name like "Acclym (formerly Agritask)".
 * Returns normalized tokens to check: the full name, the part before parens,
 * the part inside parens (without noise words), and individual words (≥3 chars).
 */
const NOISE_WORDS = new Set(["formerly", "now", "part", "of", "acquired", "aquired", "by"])

const extractNameCandidates = (companyName: string): string[] => {
  const candidates: string[] = []

  // Full name normalized
  const full = normalize(companyName)
  if (full.length > 0) candidates.push(full)

  // Part before parenthetical: "Acclym (formerly Agritask)" → "Acclym"
  const parenIdx = companyName.indexOf("(")
  if (parenIdx > 0) {
    const before = normalize(companyName.slice(0, parenIdx))
    if (before.length >= 3) candidates.push(before)

    // Words inside parenthetical, minus noise
    const inside = companyName.slice(parenIdx + 1).replace(/\).*$/, "")
    for (const word of inside.split(/\s+/)) {
      const nw = normalize(word)
      if (nw.length >= 3 && !NOISE_WORDS.has(nw)) {
        candidates.push(nw)
      }
    }
  }

  // Individual words from the full name (≥3 chars, minus noise)
  for (const word of companyName.split(/[\s\-_/]+/)) {
    const nw = normalize(word)
    if (nw.length >= 3 && !NOISE_WORDS.has(nw)) {
      candidates.push(nw)
    }
  }

  // Deduplicate
  return [...new Set(candidates)]
}

/**
 * True when any name candidate appears inside the link, OR the link
 * appears inside a candidate (handles link slugs shorter than the full name).
 */
const nameAppearsInLink = (companyName: string, linkValue: string): boolean => {
  const link = normalize(linkValue)
  if (link.length === 0) return false
  return extractNameCandidates(companyName).some((c) => link.includes(c) || c.includes(link))
}

/** Green when company name is in the link, otherwise the field's default color. */
const colorizeLink = (companyName: string, linkValue: string, fieldColor: string): string => {
  if (nameAppearsInLink(companyName, linkValue)) {
    return `${GREEN}${linkValue}${RESET}`
  }
  return `${fieldColor}${linkValue}${RESET}`
}

/** Fields that are not checked for "all green" (non-link or dimmed). */
const NON_LINK_FIELDS = new Set(["_meta", "urls", "alt"])

/**
 * Returns true when every link-type field value contains the company name.
 * Fields in NON_LINK_FIELDS are excluded. android_app_ids are checked as
 * Play Store display URLs. ytc inherits green from ytp (same as render logic).
 */
const allLinksGreen = (name: string, value: ManualOverrideValue): boolean => {
  // Check if any ytp URL matches — ytc inherits green from ytp
  const ytpGreen = (() => {
    const ytp = "ytp" in value ? value.ytp : undefined
    if (!ytp) return false
    const urls = Array.isArray(ytp) ? ytp : [ytp]
    return urls.some((u) => typeof u === "string" && nameAppearsInLink(name, u))
  })()

  let hasLinks = false

  for (const [key, val] of Object.entries(value)) {
    if (NON_LINK_FIELDS.has(key) || val === undefined) continue

    // ytc inherits green from ytp
    if (key === "ytc" && ytpGreen) continue

    if (key === "android_app_ids" && Array.isArray(val)) {
      for (const pkg of val) {
        hasLinks = true
        const displayUrl = `https://play.google.com/store/apps/details?id=${String(pkg)}`
        if (!nameAppearsInLink(name, displayUrl)) return false
      }
      continue
    }

    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "string") {
          hasLinks = true
          if (!nameAppearsInLink(name, item)) return false
        }
      }
    } else if (typeof val === "string") {
      hasLinks = true
      if (!nameAppearsInLink(name, val)) return false
    }
  }

  return hasLinks
}

// ────────────────────────────────────────────────────────────────────────────
// YouTube channel → @handle resolution
// ────────────────────────────────────────────────────────────────────────────

const YT_CHANNEL_RE = /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i

/** Extract the UC... channel ID from a YouTube channel URL, or null. */
const extractChannelId = (url: string): string | null => {
  const m = YT_CHANNEL_RE.exec(url)
  return m?.[1] ?? null
}

/**
 * Resolve a YouTube channel ID to its @handle by fetching the channel page.
 * Works with any casing (e.g. "ucsm8sofdl36aekvq7pforsg").
 * Streams the response and aborts as soon as `canonicalBaseUrl` is found.
 * Returns the handle (without @) or null if the channel has no handle.
 * Throws on network/HTTP errors — caller decides how to handle.
 */
const resolveYouTubeHandle = async (channelId: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://www.youtube.com/channel/${channelId}`,
      { timeout: 10_000 },
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

/**
 * For a given override entry, find all ytc channel URLs that need resolution
 * (have a UC... channel ID and no corresponding ytp @handle URL).
 * Returns the list of channel IDs to resolve.
 */
const findUnresolvedChannelIds = (value: ManualOverrideValue): string[] => {
  const ytcRaw = "ytc" in value ? value.ytc : undefined
  if (!ytcRaw) return []

  const ytcUrls = Array.isArray(ytcRaw) ? ytcRaw : [ytcRaw]
  const ids: string[] = []
  for (const url of ytcUrls) {
    if (typeof url !== "string") continue
    const id = extractChannelId(url)
    if (id) ids.push(id)
  }
  return ids
}

/** Per-channel resolution result, shown inline next to ytc links in the rendered entry. */
type ChannelResolveResult = { handle: string } | { error: "no_handle" } | { error: "not_found" }

/** Map from channel ID → resolution result, populated during resolve, read during render. */
const channelResolveResults = new Map<string, ChannelResolveResult>()

/**
 * Resolve all ytc channel IDs for an entry and inject ytp URLs.
 * Blocks until all resolve or user aborts. On failure, shows diagnostics
 * and waits for retry (y) or exit (x).
 * Results are stored in `channelResolveResults` so `renderEntry` can show them inline.
 */
const resolveAndInjectHandles = async (
  entryName: string,
  overrides: Record<string, ManualOverrideValue>,
  dirtyKeys: Set<string>
): Promise<void> => {
  const value = overrides[entryName]
  if (!value) return

  const channelIds = findUnresolvedChannelIds(value)
  if (channelIds.length === 0) return

  // Collect existing ytp URLs to avoid duplicates
  const ytpRaw = "ytp" in value ? value.ytp : undefined
  const existingYtp = new Set<string>(
    ytpRaw ? (Array.isArray(ytpRaw) ? ytpRaw.filter((u): u is string => typeof u === "string") : [ytpRaw]) : []
  )

  for (const channelId of channelIds) {
    let resolved = false
    while (!resolved) {
      try {
        const start = Date.now()
        const handle = await resolveYouTubeHandle(channelId)
        const elapsed = Date.now() - start

        if (handle) {
          channelResolveResults.set(channelId, { handle })
          const ytpUrl = `https://www.youtube.com/@${handle}`
          if (!existingYtp.has(ytpUrl)) {
            existingYtp.add(ytpUrl)
          }
          log(`  ${GREEN}↳${RESET} ${DIM}Resolved${RESET} ${channelId} ${DIM}→${RESET} ${GREEN}@${handle}${RESET} ${DIM}(${elapsed}ms)${RESET}`)
        } else {
          channelResolveResults.set(channelId, { error: "no_handle" })
          log(`  ${YELLOW}↳${RESET} ${DIM}${channelId} — no @handle (${elapsed}ms)${RESET}`)
        }

        resolved = true
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        const stack = err instanceof Error ? err.stack : undefined

        process.stdout.write(`\n  ${RED}YouTube resolve failed${RESET}\n`)
        process.stdout.write(`  ${DIM}Channel ID:${RESET} ${channelId}\n`)
        process.stdout.write(`  ${DIM}Entry:${RESET}      ${entryName}\n`)
        process.stdout.write(`  ${DIM}Error:${RESET}      ${RED}${errMsg}${RESET}\n`)
        if (stack) {
          process.stdout.write(`  ${DIM}Stack:${RESET}      ${DIM}${stack.split("\n").slice(1, 4).join("\n            ")}${RESET}\n`)
        }
        process.stdout.write(`\n  ${YELLOW}y${RESET} retry    ${DIM}x${RESET} exit\n`)

        const action = await waitForRetryOrExit()
        if (action === "exit") {
          process.exit(1)
        }
        process.stdout.write(`  ${DIM}Retrying...${RESET}\n`)
      }
    }
  }

  // Inject resolved ytp URLs back into the entry
  if (existingYtp.size > 0) {
    const current = overrides[entryName]
    if (current) {
      const ytpArray = [...existingYtp]
      overrides[entryName] = { ...current, ytp: ytpArray.length === 1 ? ytpArray : ytpArray }
      dirtyKeys.add(entryName)
    }
  }
}

/**
 * Build an inline annotation for a ytc link based on its resolve result.
 * Shown after the URL in the rendered entry.
 */
const ytcAnnotation = (url: string): string => {
  const id = extractChannelId(url)
  if (!id) return ""
  const result = channelResolveResults.get(id)
  if (!result) return ""
  if ("handle" in result) return ` ${DIM}→${RESET} ${GREEN}@${result.handle}${RESET}`
  if (result.error === "no_handle") return ` ${DIM}(no @handle)${RESET}`
  return ` ${YELLOW}(404 — bad channel URL)${RESET}`
}

// ────────────────────────────────────────────────────────────────────────────
// Rendering
// ────────────────────────────────────────────────────────────────────────────

const SKIP_FIELDS = new Set(["_meta", "name"])
const DIM_FIELDS = new Set(["urls"])

/** Characters used for field numbering: 1-9, then a-z (excluding d=delete, n=rename, x=exit) */
const NUM_CHARS = "123456789abcefghijklmopqrstuvwyz"

type RenderResult = {
  /** The rendered string (includes CLEAR_SCREEN) */
  output: string
  /** Ordered field keys — index corresponds to NUM_CHARS position */
  fieldKeys: string[]
  /** True when every link-type field contains the company name (all green) */
  allGreen: boolean
}

const renderEntry = (name: string, value: ManualOverrideValue, index: number, total: number): RenderResult => {
  const lines: string[] = []
  const fieldKeys: string[] = []

  // Clear screen — one company at a time
  lines.push(CLEAR_SCREEN)

  // Header — show custom name below the key name when present
  const customName = ("name" in value && typeof value.name === "string") ? value.name : null
  lines.push(`${DIM}${"─".repeat(60)}${RESET}`)
  lines.push(`  ${DIM}[${index + 1}/${total}]${RESET}  ${BOLD}${WHITE}${name}${RESET}`)
  if (customName) {
    lines.push(`  ${DIM}aka${RESET}  ${CYAN}${customName}${RESET}`)
  }
  lines.push(`${DIM}${"─".repeat(60)}${RESET}`)

  // Meta status line
  if (hasMeta(value)) {
    const meta = value._meta
    const flags: string[] = []
    if (meta.isHomepage) flags.push(`${BG_BLUE}${WHITE} homepage ${RESET}`)
    if (meta.isVerified) flags.push(`${BG_GREEN}${WHITE} verified ${RESET}`)
    if (meta.isBrowserVerified) flags.push(`${BG_GREEN}${WHITE} browser ${RESET}`)
    if (meta.isVerified === false) flags.push(`${BG_YELLOW}${WHITE} postponed ${RESET}`)
    lines.push(`  ${DIM}Status:${RESET} ${flags.join(" ")}`)
  }

  // Check if any ytp URL matches the company name — if so, ytc links inherit green
  const ytpGreen = (() => {
    const ytp = "ytp" in value ? value.ytp : undefined
    if (!ytp) return false
    const urls = Array.isArray(ytp) ? ytp : [ytp]
    return urls.some((u) => typeof u === "string" && nameAppearsInLink(name, u))
  })()

  // Controlled render order: social fields first, ytp+ytc adjacent, urls/alt last
  const FIELD_ORDER = ["ws", "li", "fb", "tw", "ig", "gh", "tt", "th", "ytp", "ytc", "android_dev_id", "android_app_ids", "alt", "urls"]

  // Collect keys: ordered fields first, then any remaining unknown keys (excluding _meta), urls always last
  const entries = Object.entries(value).filter(([k, v]) => !SKIP_FIELDS.has(k) && v !== undefined)
  const entryMap = new Map(entries)
  const orderedKeys: string[] = []
  for (const key of FIELD_ORDER) {
    if (entryMap.has(key)) orderedKeys.push(key)
  }
  // Any keys not in FIELD_ORDER (except _meta) go before urls
  for (const [key] of entries) {
    if (!SKIP_FIELDS.has(key) && !FIELD_ORDER.includes(key)) {
      // Insert before urls (which is always last in FIELD_ORDER)
      const urlsIdx = orderedKeys.indexOf("urls")
      if (urlsIdx >= 0) {
        orderedKeys.splice(urlsIdx, 0, key)
      } else {
        orderedKeys.push(key)
      }
    }
  }

  // Render fields in order, with numbering
  let fieldIdx = 0

  const renderField = (key: string, val: unknown): void => {
    const color = FIELD_COLORS[key] ?? WHITE
    const label = FIELD_LABELS[key] ?? key
    const effectiveColor = key === "ytc" && ytpGreen ? GREEN : color
    const numChar = NUM_CHARS[fieldIdx] ?? "?"
    const numPrefix = `${DIM}${numChar}${RESET}`
    fieldKeys.push(key)
    fieldIdx++

    // android_app_ids: display as full Play Store links but data is stored as package IDs
    if (key === "android_app_ids" && Array.isArray(val)) {
      lines.push(`  ${numPrefix} ${color}${label}:${RESET}`)
      for (const item of val) {
        const pkg = String(item)
        const displayUrl = `https://play.google.com/store/apps/details?id=${pkg}`
        lines.push(`    ${DIM}→${RESET} ${colorizeLink(name, displayUrl, color)}`)
      }
      return
    }

    if (Array.isArray(val)) {
      if (key === "alt") {
        lines.push(`  ${numPrefix} ${color}${label}:${RESET}`)
        for (const alt of val) {
          if (typeof alt === "object" && alt !== null && "n" in alt && "ws" in alt) {
            lines.push(`    ${DIM}→${RESET} ${String(alt.n)} ${DIM}(${String(alt.ws)})${RESET}`)
          }
        }
      } else if (DIM_FIELDS.has(key)) {
        lines.push(`  ${numPrefix} ${DIM}${label}:`)
        for (const item of val) {
          lines.push(`    → ${item}`)
        }
        lines.push(RESET)
      } else if (key === "ytc") {
        lines.push(`  ${numPrefix} ${ytpGreen ? GREEN : effectiveColor}${label}:${RESET}`)
        for (const item of val) {
          const itemStr = String(item)
          const linkColor = ytpGreen ? `${GREEN}${itemStr}${RESET}` : colorizeLink(name, itemStr, effectiveColor)
          lines.push(`    ${DIM}→${RESET} ${linkColor}${ytcAnnotation(itemStr)}`)
        }
      } else {
        lines.push(`  ${numPrefix} ${effectiveColor}${label}:${RESET}`)
        for (const item of val) {
          lines.push(`    ${DIM}→${RESET} ${colorizeLink(name, String(item), effectiveColor)}`)
        }
      }
    } else if (typeof val === "string") {
      if (DIM_FIELDS.has(key)) {
        lines.push(`  ${numPrefix} ${DIM}${label}: ${val}${RESET}`)
      } else if (key === "ytc") {
        const linkColor = ytpGreen ? `${GREEN}${val}${RESET}` : colorizeLink(name, val, effectiveColor)
        lines.push(`  ${numPrefix} ${ytpGreen ? GREEN : effectiveColor}${label}:${RESET} ${linkColor}${ytcAnnotation(val)}`)
      } else {
        lines.push(`  ${numPrefix} ${effectiveColor}${label}:${RESET} ${colorizeLink(name, val, effectiveColor)}`)
      }
    } else if (typeof val === "object" && val !== null) {
      lines.push(`  ${numPrefix} ${effectiveColor}${label}:${RESET} ${JSON.stringify(val)}`)
    }
  }

  for (const key of orderedKeys) {
    renderField(key, entryMap.get(key))
  }

  const green = allLinksGreen(name, value)

  lines.push("")
  const editHint = fieldIdx > 0 ? `    ${DIM}1-${NUM_CHARS[fieldIdx - 1] ?? "9"}${RESET} edit` : ""
  const defaultAction = green ? `${GREEN}↑ verify${RESET}` : `${YELLOW}↑ postpone${RESET}`
  lines.push(`  ${GREEN}←${RESET} verify    ${YELLOW}→${RESET} postpone    ${defaultAction}${editHint}    ${CYAN}n${RESET} rename    ${RED}d${RESET} delete    ${DIM}x${RESET} exit`)
  lines.push("")

  return { output: lines.join("\n"), fieldKeys, allGreen: green }
}

// ────────────────────────────────────────────────────────────────────────────
// Key input (persistent raw-mode session)
// ────────────────────────────────────────────────────────────────────────────

type EditMode = "append" | "replace" | "delete"
type Action = "verify" | "postpone" | "delete" | "rename" | "exit" | { field: number; mode: EditMode }

let stdinSessionActive = false
let stdinWasRaw: boolean | undefined

const activateStdinSession = (): void => {
  if (stdinSessionActive) return
  stdinWasRaw = process.stdin.isRaw
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
  }
  process.stdin.resume()
  stdinSessionActive = true
}

const deactivateStdinSession = (): void => {
  if (!stdinSessionActive) return
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(stdinWasRaw ?? false)
  }
  process.stdin.pause()
  stdinSessionActive = false
}

/**
 * Wait for a single keypress that resolves to "append" or "replace".
 * Shown after the user selects a field number. Escape cancels.
 */
const waitForEditMode = async (): Promise<EditMode | "cancel"> => {
  activateStdinSession()

  return new Promise((resolve) => {
    const onKeypress = (_str: string | undefined, key: readline.Key): void => {
      process.stdin.removeListener("keypress", onKeypress)

      if (key.name === "a") {
        resolve("append")
      } else if (key.name === "r") {
        resolve("replace")
      } else if (key.name === "d") {
        resolve("delete")
      } else if (key.name === "escape" || (key.ctrl && key.name === "c")) {
        resolve("cancel")
      } else {
        // Unknown key — re-listen
        process.stdin.once("keypress", onKeypress)
      }
    }

    process.stdin.once("keypress", onKeypress)
  })
}

/**
 * Raw-mode inline text editor. Shows a prompt with prefilled text.
 * The user can type, use backspace, left/right arrows to move the cursor.
 * Enter confirms, Escape cancels. Returns the final string or null on cancel.
 */
const waitForTextInput = async (prompt: string, prefill: string): Promise<string | null> => {
  activateStdinSession()

  return new Promise((resolve) => {
    const buf = [...prefill]
    let cursor = buf.length

    const redraw = (): void => {
      const text = buf.join("")
      // Move to start of line, clear it, write prompt + buffer, position cursor
      process.stdout.write(`\r\x1b[2K  ${prompt}${text}`)
      // Move cursor back to correct position if not at end
      const backSteps = buf.length - cursor
      if (backSteps > 0) {
        process.stdout.write(`\x1b[${backSteps}D`)
      }
    }

    redraw()

    const onKeypress = (str: string | undefined, key: readline.Key): void => {
      if (key.name === "return") {
        process.stdin.removeListener("keypress", onKeypress)
        process.stdout.write("\n")
        resolve(buf.join(""))
        return
      }

      if (key.name === "escape" || (key.ctrl && key.name === "c")) {
        process.stdin.removeListener("keypress", onKeypress)
        process.stdout.write("\r\x1b[2K")
        resolve(null)
        return
      }

      if (key.name === "backspace") {
        if (cursor > 0) {
          buf.splice(cursor - 1, 1)
          cursor--
        }
      } else if (key.name === "delete") {
        if (cursor < buf.length) {
          buf.splice(cursor, 1)
        }
      } else if (key.name === "left") {
        if (cursor > 0) cursor--
      } else if (key.name === "right") {
        if (cursor < buf.length) cursor++
      } else if (key.name === "home") {
        cursor = 0
      } else if (key.name === "end") {
        cursor = buf.length
      } else if (str && !key.ctrl && !key.meta) {
        // Insert printable character(s) at cursor
        const chars = [...str]
        buf.splice(cursor, 0, ...chars)
        cursor += chars.length
      }

      redraw()
    }

    process.stdin.on("keypress", onKeypress)
  })
}

const waitForAction = async (maxFieldIndex: number, allGreen: boolean): Promise<Action> => {
  activateStdinSession()

  // Build the set of valid field-select characters for the current entry
  const validChars = NUM_CHARS.slice(0, maxFieldIndex)

  return new Promise((resolve) => {
    const onKeypress = (_str: string | undefined, key: readline.Key): void => {
      process.stdin.removeListener("keypress", onKeypress)

      if (key.name === "left") {
        resolve("verify")
      } else if (key.name === "right") {
        resolve("postpone")
      } else if (key.name === "up") {
        resolve(allGreen ? "verify" : "postpone")
      } else if (key.name === "d") {
        resolve("delete")
      } else if (key.name === "n") {
        resolve("rename")
      } else if (key.name === "x" || (key.ctrl && key.name === "c")) {
        resolve("exit")
      } else {
        // Check if this is a field-select key (1-9, a-z)
        const ch = key.name ?? _str ?? ""
        const idx = validChars.indexOf(ch)
        if (idx >= 0) {
          // Show sub-prompt for append/replace
          process.stdout.write(`  ${DIM}${ch}${RESET} → ${GREEN}a${RESET} append  ${YELLOW}r${RESET} replace  ${DIM}esc${RESET} cancel`)
          void (async () => {
            const mode = await waitForEditMode()
            if (mode === "cancel") {
              // Erase the sub-prompt line and re-listen
              process.stdout.write(`\r\x1b[2K`)
              process.stdin.once("keypress", onKeypress)
            } else {
              process.stdout.write(`\n`)
              resolve({ field: idx, mode })
            }
          })()
        } else {
          // Unknown key — re-listen
          process.stdin.once("keypress", onKeypress)
        }
      }
    }

    process.stdin.once("keypress", onKeypress)
  })
}

const waitForRetryOrExit = async (): Promise<"retry" | "exit"> => {
  activateStdinSession()

  return new Promise((resolve) => {
    const onKeypress = (_str: string | undefined, key: readline.Key): void => {
      process.stdin.removeListener("keypress", onKeypress)

      if (key.name === "y") {
        resolve("retry")
      } else if (key.name === "x" || (key.ctrl && key.name === "c")) {
        resolve("exit")
      } else {
        process.stdin.once("keypress", onKeypress)
      }
    }

    process.stdin.once("keypress", onKeypress)
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Fire-and-forget save queue
// ────────────────────────────────────────────────────────────────────────────

/**
 * Serialized background writer. Each save waits for the previous one to
 * finish so we never have concurrent writes, but the caller never blocks.
 * `drain()` returns a promise that resolves when all queued saves are done.
 *
 * Uses merge-and-save: on each write, re-reads the file from disk and
 * applies only the dirty entries, preserving any external edits to other entries.
 * After a successful save, consumed dirty keys are cleared from the set.
 */
const createSaveQueue = (overrides: Record<string, ManualOverrideValue>, dirtyKeys: Set<string>) => {
  let chain: Promise<void> = Promise.resolve()
  let pending = 0

  const enqueue = (): void => {
    pending++
    // Snapshot the dirty keys at enqueue time so each save knows exactly
    // which entries to merge, even if more entries become dirty before
    // this save runs.
    const keysToSave = new Set(dirtyKeys)
    const doSave = async (): Promise<void> => {
      await chain
      await mergeAndSaveManualOverrides(overrides, keysToSave)
      // Clear only the keys we just saved (new dirty keys added since
      // enqueue will be picked up by the next enqueued save)
      for (const key of keysToSave) {
        dirtyKeys.delete(key)
      }
    }
    chain = doSave()
      .catch((err) => {
        logError("Background save failed:", err)
      })
      .finally(() => {
        pending--
      })
  }

  const drain = async (): Promise<void> => {
    await chain
  }

  const hasPending = (): boolean => pending > 0

  return { enqueue, drain, hasPending }
}

// ────────────────────────────────────────────────────────────────────────────
// Core logic
// ────────────────────────────────────────────────────────────────────────────

/** Write to disk every N entries (batched for speed). Unsaved work is flushed on exit. */
const SAVE_INTERVAL = 10

const sleep = async (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

type FieldEditOk = { ok: true; value: ManualOverrideValue; targetField: string; displayValue: string }
type FieldEditErr = { ok: false; error: string }
type FieldEditResult = FieldEditOk | FieldEditErr

/** Fields that are always stored as arrays. */
const ARRAY_FIELDS = new Set(["urls", "android_app_ids"])

/** Zod schema for a link field value: string, string[], or absent. */
const ExistingFieldSchema = z.union([z.string(), z.array(z.string())]).optional()

/**
 * Edit a field with a clipboard URL. Supports append and replace modes.
 *
 * Auto-categorizes the URL:
 * - Social platform URLs → the matching field (may differ from pressed key).
 * - Play Store URLs → `android_app_ids` (package ID extracted).
 * - Otherwise targets the originally selected field.
 *
 * In **replace** mode, the new value replaces the entire field.
 * In **append** mode, the new value is added to the existing value
 * (converting a string to an array if needed).
 */
const applyFieldEdit = (
  current: ManualOverrideValue,
  pressedField: string,
  clipboardUrl: string,
  mode: EditMode
): FieldEditResult => {
  const url = clipboardUrl.trim()
  if (!url) return { ok: false, error: "Clipboard is empty" }

  // Auto-categorize the URL
  const category = categorizeUrl(url)

  // Check if it's a Play Store URL → android_app_ids
  const pkgId = extractPackageId(url)

  let targetField: string
  let newItem: string

  if (pkgId) {
    targetField = "android_app_ids"
    newItem = pkgId
  } else if (category) {
    targetField = category
    newItem = url
  } else {
    targetField = pressedField
    newItem = url
  }

  const displayValue = pkgId ?? url

  let storeValue: string | string[]
  if (mode === "replace") {
    storeValue = ARRAY_FIELDS.has(targetField) ? [newItem] : newItem
  } else {
    // Parse the existing field value safely via Zod
    const fields = Object.fromEntries(Object.entries(current))
    const existing = ExistingFieldSchema.parse(fields[targetField])

    if (Array.isArray(existing)) {
      storeValue = [...existing, newItem]
    } else if (typeof existing === "string") {
      storeValue = [existing, newItem]
    } else {
      storeValue = ARRAY_FIELDS.has(targetField) ? [newItem] : newItem
    }
  }

  const updated: ManualOverrideValue = { ...current, [targetField]: storeValue }
  return { ok: true, value: updated, targetField, displayValue }
}

type QueueEntry = {
  readonly name: string
  readonly value: ManualOverrideValue
}

const buildQueues = (
  overrides: Record<string, ManualOverrideValue>
): { unverified: QueueEntry[]; postponed: QueueEntry[] } => {
  const unverified: QueueEntry[] = []
  const postponed: QueueEntry[] = []

  for (const [name, value] of Object.entries(overrides)) {
    if (!isHomepage(value)) continue
    if (isVerified(value)) continue

    if (hasMeta(value) && value._meta.isVerified === false) {
      postponed.push({ name, value })
    } else {
      unverified.push({ name, value })
    }
  }

  return { unverified, postponed }
}

const updateMeta = (existing: ManualOverrideValue, patch: Partial<EntryMeta>): ManualOverrideValue => {
  const currentMeta: EntryMeta = hasMeta(existing) ? { ...existing._meta } : {}
  const newMeta: EntryMeta = { ...currentMeta, ...patch }
  const base = { ...existing }
  return Object.assign(base, { _meta: newMeta })
}

const processQueue = async (
  queue: QueueEntry[],
  overrides: Record<string, ManualOverrideValue>,
  saveQueue: ReturnType<typeof createSaveQueue>,
  dirtyKeys: Set<string>,
  label: string,
  startIndex: number
): Promise<{ processed: number; exitRequested: boolean }> => {
  if (queue.length === 0) return { processed: 0, exitRequested: false }

  log(`\n${BOLD}${WHITE}=== ${label} (${queue.length} entries) ===${RESET}`)

  let processed = 0

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i]
    if (!entry) throw new Error(`Unexpected: queue[${i}] is undefined`)
    const totalInQueue = queue.length

    // Clear screen and show loading if YouTube resolution is needed
    const value = overrides[entry.name] ?? entry.value
    const needsResolve = findUnresolvedChannelIds(value).length > 0
    if (needsResolve) {
      process.stdout.write(CLEAR_SCREEN)
      process.stdout.write(`${DIM}${"─".repeat(60)}${RESET}\n`)
      process.stdout.write(`  ${DIM}[${startIndex + i + 1}/${startIndex + totalInQueue}]${RESET}  ${BOLD}${WHITE}${entry.name}${RESET}\n`)
      process.stdout.write(`${DIM}${"─".repeat(60)}${RESET}\n\n`)
      process.stdout.write(`  ${DIM}Resolving YouTube handles...${RESET}\n`)
      await resolveAndInjectHandles(entry.name, overrides, dirtyKeys)
    }

    // Show entry — loop to allow in-place edits before verify/postpone
    let decided = false
    while (!decided) {
      const { output, fieldKeys, allGreen } = renderEntry(
        entry.name,
        overrides[entry.name] ?? entry.value,
        startIndex + i,
        startIndex + totalInQueue
      )
      process.stdout.write(output)

      const action = await waitForAction(fieldKeys.length, allGreen)

      if (action === "exit") {
        deactivateStdinSession()
        if (dirtyKeys.size > 0) saveQueue.enqueue()
        await saveQueue.drain()
        return { processed, exitRequested: true }
      }

      if (action === "verify") {
        overrides[entry.name] = updateMeta(overrides[entry.name] ?? entry.value, { isVerified: true })
        dirtyKeys.add(entry.name)
        process.stdout.write(`  ${BG_GREEN}${WHITE} VERIFIED ${RESET} ${entry.name}\n`)
        decided = true
      } else if (action === "postpone") {
        overrides[entry.name] = updateMeta(overrides[entry.name] ?? entry.value, { isVerified: false })
        dirtyKeys.add(entry.name)
        process.stdout.write(`  ${BG_YELLOW}${WHITE} POSTPONED ${RESET} ${entry.name}\n`)
        decided = true
      } else if (action === "delete") {
        Reflect.deleteProperty(overrides, entry.name)
        dirtyKeys.add(entry.name)
        process.stdout.write(`  ${RED}${BOLD} DELETED ${RESET} ${entry.name}\n`)
        decided = true
      } else if (action === "rename") {
        const current = overrides[entry.name] ?? entry.value
        const currentName = ("name" in current && typeof current.name === "string") ? current.name : entry.name
        const newName = await waitForTextInput(`${CYAN}Name:${RESET} `, currentName)
        if (newName === null) {
          // Cancelled — re-render
          continue
        }
        const trimmed = newName.trim()
        if (trimmed.length === 0 || trimmed === entry.name) {
          // Empty or same as key — remove custom name if present
            if ("name" in current) {
              const { name: _removed, ...rest } = current
              overrides[entry.name] = rest
            dirtyKeys.add(entry.name)
            process.stdout.write(`  ${BG_BLUE}${WHITE} RENAMED ${RESET} ${DIM}(cleared — using key name)${RESET}\n`)
          }
        } else {
          overrides[entry.name] = { ...current, name: trimmed }
          dirtyKeys.add(entry.name)
          process.stdout.write(`  ${BG_BLUE}${WHITE} RENAMED ${RESET} ${trimmed}\n`)
        }
        await sleep(600)
      } else {
        // Edit field from clipboard (append or replace)
        const fieldKey = fieldKeys[action.field]
        if (!fieldKey) continue

        const clipboard = readClipboard()
        if (!clipboard) {
          process.stdout.write(`  ${RED}Clipboard is empty${RESET}\n`)
          await sleep(800)
          continue
        }

        // Apply the edit
        const current = overrides[entry.name] ?? entry.value
        const result = applyFieldEdit(current, fieldKey, clipboard, action.mode)
        if (!result.ok) {
          process.stdout.write(`  ${RED}${result.error}${RESET}\n`)
          await sleep(800)
          continue
        }

        overrides[entry.name] = result.value
        dirtyKeys.add(entry.name)

        // Flash confirmation then re-render (loop continues)
        const modeLabel = action.mode === "append" ? "APPENDED" : "REPLACED"
        const bgColor = action.mode === "append" ? BG_GREEN : BG_BLUE
        const targetLabel = FIELD_LABELS[result.targetField] ?? result.targetField
        if (result.targetField !== fieldKey) {
          const srcLabel = FIELD_LABELS[fieldKey] ?? fieldKey
          process.stdout.write(`  ${bgColor}${WHITE} ${modeLabel} ${RESET} ${srcLabel} → ${targetLabel}: ${DIM}${result.displayValue}${RESET}\n`)
        } else {
          process.stdout.write(`  ${bgColor}${WHITE} ${modeLabel} ${RESET} ${targetLabel}: ${DIM}${result.displayValue}${RESET}\n`)
        }

        // If ytc was updated, re-run YouTube handle resolution before re-rendering
        if (result.targetField === "ytc") {
          const updated = overrides[entry.name]
          if (updated && findUnresolvedChannelIds(updated).length > 0) {
            process.stdout.write(`  ${DIM}Resolving YouTube handles...${RESET}\n`)
            await resolveAndInjectHandles(entry.name, overrides, dirtyKeys)
          }
        }

        await sleep(600)
      }
    }

    processed++

    // Batch saves: write every SAVE_INTERVAL entries (fire-and-forget)
    if (processed % SAVE_INTERVAL === 0) {
      saveQueue.enqueue()
    }
  }

  return { processed, exitRequested: false }
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  log(`${BOLD}${WHITE}`)
  log("  data:verify — Quick verification of auto-extracted entries")
  log(`${RESET}${DIM}  Review homepage-extracted links. Verify (←) or postpone (→). Exit (x).${RESET}`)

  // Load once — all mutations happen in-memory
  const overrides = loadManualOverrides()
  const totalOverrides = Object.keys(overrides).length
  log(`\n${DIM}Loaded ${totalOverrides} overrides${RESET}`)

  const { unverified, postponed } = buildQueues(overrides)

  if (unverified.length === 0 && postponed.length === 0) {
    log(`\n${GREEN}All homepage-extracted entries have been verified!${RESET}`)
    return
  }

  log(`${DIM}Unverified: ${unverified.length}  |  Postponed: ${postponed.length}${RESET}`)

  // Track which entries were modified during this session
  const dirtyKeys = new Set<string>()

  // Single save queue shared across both passes
  const saveQueue = createSaveQueue(overrides, dirtyKeys)

  let totalProcessed = 0

  if (unverified.length > 0) {
    const result = await processQueue(unverified, overrides, saveQueue, dirtyKeys, "Unverified entries", 0)
    totalProcessed += result.processed
    if (result.exitRequested) {
      printSummary(totalProcessed, overrides)
      process.exit(0)
    }
  }

  if (postponed.length > 0) {
    const freshQueues = buildQueues(overrides)
    const freshPostponed = freshQueues.postponed

    if (freshPostponed.length > 0) {
      log(`\n${YELLOW}${BOLD}=== Postponed entries for deeper inspection ===${RESET}`)
      const result = await processQueue(freshPostponed, overrides, saveQueue, dirtyKeys, "Postponed entries", totalProcessed)
      totalProcessed += result.processed
      if (result.exitRequested) {
        printSummary(totalProcessed, overrides)
        process.exit(0)
      }
    }
  }

  deactivateStdinSession()
  // Flush any remaining dirty entries, then wait for all saves to finish
  if (dirtyKeys.size > 0) saveQueue.enqueue()
  await saveQueue.drain()
  printSummary(totalProcessed, overrides)
  process.exit(0)
}

const printSummary = (totalProcessed: number, overrides: Record<string, ManualOverrideValue>): void => {
  const { unverified, postponed } = buildQueues(overrides)

  log(`\n${BOLD}${WHITE}=== Summary ===${RESET}`)
  log(`  ${GREEN}Processed this session:${RESET} ${totalProcessed}`)
  log(`  ${DIM}Remaining unverified:${RESET}  ${unverified.length}`)
  log(`  ${YELLOW}Postponed:${RESET}             ${postponed.length}`)
  log("")
}

export { main as run }

if (require.main === module) {
  main().catch((err) => {
    logError("verify_overrides failed:", err)
    process.exit(1)
  })
}

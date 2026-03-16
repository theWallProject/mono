/**
 * Interactive quick-verify script for auto-extracted (isHomepage) override entries.
 *
 * Displays one company at a time. The user verifies (←), postpones (→),
 * or exits (x). Press v to paste a link from clipboard. Urls entries are
 * numbered — press a number to select, then w to promote to ws, or r to
 * remove. Saves run fire-and-forget in the background so the next entry
 * appears instantly. Data is loaded once at startup and mutated in-memory
 * — only the background writer touches disk.
 *
 * Usage: pnpm data:verify
 */

import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import * as readline from "readline"
import { z } from "zod"

import { FinalDBFileSchema, type FinalDBFileType } from "@theWallProject/common"

import { log, error as logError } from "../helper"
import { classifyEntry, classifyEntryFields, type FieldClassification } from "./validate/classify_entry"
import { allLinksGreen, nameAppearsInLink } from "./validate/green_check"
import { loadManualOverrides, mergeAndSaveManualOverrides } from "./validate/override_io"
import { hasMeta, isHomepage, isVerified, type EntryMeta, type ManualOverrideValue } from "./validate/types"
import { categorizeUrl } from "./validate/url_categorization"

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
  alt: CYAN
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
  alt: "Alternatives"
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
// Name-in-link matching (imported from validate/green_check.ts)
// ────────────────────────────────────────────────────────────────────────────

/** Green when company name is in the link, otherwise the field's default color. */
const colorizeLink = (companyName: string, linkValue: string, fieldColor: string): string => {
  if (nameAppearsInLink(companyName, linkValue)) {
    return `${GREEN}${linkValue}${RESET}`
  }
  return `${fieldColor}${linkValue}${RESET}`
}



// ────────────────────────────────────────────────────────────────────────────
// Rendering
// ────────────────────────────────────────────────────────────────────────────

const SKIP_FIELDS = new Set(["_meta", "name"])

/** Characters used for numbering urls entries: 1-9, then a-z (excluding action keys d,n,r,v,w,x) */
const NUM_CHARS = "123456789abcefghijklmopqstuyz"

type RenderResult = {
  /** The rendered string (includes CLEAR_SCREEN) */
  output: string
  /** Number of urls entries (for selection by number) */
  urlsCount: number
  /** True when every link-type field contains the company name (all green) */
  allGreen: boolean
  /** Index of the currently selected urls entry, or -1 if none */
  selectedUrlIndex: number
  /** The raw footer line (for restoring after sub-prompt cancel) */
  footerLine: string
}

const renderEntry = (
  name: string,
  value: ManualOverrideValue,
  index: number,
  total: number,
  selectedUrlIndex: number,
  fieldClassification?: FieldClassification
): RenderResult => {
  const lines: string[] = []
  let urlsCount = 0

  // Clear screen — one company at a time
  lines.push(CLEAR_SCREEN)

  // Header — show custom name below the key name when present
  const customName = "name" in value && typeof value.name === "string" ? value.name : null
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
  const FIELD_ORDER = [
    "ws",
    "li",
    "fb",
    "tw",
    "ig",
    "gh",
    "tt",
    "th",
    "ytp",
    "ytc",
    "android_dev_id",
    "android_app_ids",
    "alt",
    "urls"
  ]

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

  // Render fields in order — no numbering except for urls entries
  const renderField = (key: string, val: unknown, isFieldNew: boolean): void => {
    const color = FIELD_COLORS[key] ?? WHITE
    const label = FIELD_LABELS[key] ?? key
    const effectiveColor = key === "ytc" && ytpGreen ? GREEN : color
    const prefix = "  "
    const newTag = isFieldNew ? " \u{1F7E2}" : ""

    // android_app_ids: display as full Play Store links but data is stored as package IDs
    if (key === "android_app_ids" && Array.isArray(val)) {
      lines.push(`${prefix} ${color}${label}:${RESET}${newTag}`)
      for (const item of val) {
        const pkg = String(item)
        const displayUrl = `https://play.google.com/store/apps/details?id=${pkg}`
        lines.push(`    ${DIM}\u2192${RESET} ${colorizeLink(name, displayUrl, color)}`)
      }
      return
    }

    // urls: numbered entries for selection
    if (key === "urls") {
      const items = Array.isArray(val) ? val : typeof val === "string" ? [val] : []
      urlsCount = items.length
      if (items.length === 0) return
      lines.push(`${prefix} ${DIM}${label}:${RESET}`)
      for (let ui = 0; ui < items.length; ui++) {
        const numChar = NUM_CHARS[ui] ?? "?"
        const isSelected = ui === selectedUrlIndex
        const marker = isSelected ? `${CYAN}${BOLD}${numChar}${RESET}` : `${DIM}${numChar}${RESET}`
        const itemStr = String(items[ui])
        const itemDisplay = isSelected ? `${CYAN}${BOLD}${itemStr}${RESET}` : `${DIM}${itemStr}${RESET}`
        lines.push(`    ${marker} ${itemDisplay}`)
      }
      return
    }

    if (Array.isArray(val)) {
      if (key === "alt") {
        lines.push(`${prefix} ${color}${label}:${RESET}${newTag}`)
        for (const alt of val) {
          if (typeof alt === "object" && alt !== null && "n" in alt && "ws" in alt) {
            lines.push(`    ${DIM}\u2192${RESET} ${String(alt.n)} ${DIM}(${String(alt.ws)})${RESET}`)
          }
        }
      } else if (key === "ytc") {
        lines.push(`${prefix} ${ytpGreen ? GREEN : effectiveColor}${label}:${RESET}${newTag}`)
        for (const item of val) {
          const itemStr = String(item)
          const linkColor = ytpGreen ? `${GREEN}${itemStr}${RESET}` : colorizeLink(name, itemStr, effectiveColor)
          lines.push(`    ${DIM}\u2192${RESET} ${linkColor}`)
        }
      } else {
        lines.push(`${prefix} ${effectiveColor}${label}:${RESET}${newTag}`)
        for (const item of val) {
          lines.push(`    ${DIM}\u2192${RESET} ${colorizeLink(name, String(item), effectiveColor)}`)
        }
      }
    } else if (typeof val === "string") {
      if (key === "ytc") {
        const linkColor = ytpGreen ? `${GREEN}${val}${RESET}` : colorizeLink(name, val, effectiveColor)
        lines.push(
          `${prefix} ${ytpGreen ? GREEN : effectiveColor}${label}:${RESET}${newTag} ${linkColor}`
        )
      } else {
        lines.push(`${prefix} ${effectiveColor}${label}:${RESET}${newTag} ${colorizeLink(name, val, effectiveColor)}`)
      }
    } else if (typeof val === "object" && val !== null) {
      lines.push(`${prefix} ${effectiveColor}${label}:${RESET}${newTag} ${JSON.stringify(val)}`)
    }
  }

  // Split fields into new and known sections when classification is available
  const hasClassification = fieldClassification && Object.keys(fieldClassification).length > 0
  const newKeys = hasClassification
    ? orderedKeys.filter((k) => fieldClassification[k] === "new")
    : []
  const knownKeys = hasClassification
    ? orderedKeys.filter((k) => fieldClassification[k] !== "new")
    : orderedKeys

  // Render new fields first (with section header and markers)
  if (newKeys.length > 0) {
    lines.push(`  ${GREEN}${BOLD}New:${RESET}`)
    for (const key of newKeys) {
      renderField(key, entryMap.get(key), true)
    }
  }

  // Render known/duplicate fields (or all fields if no classification)
  if (knownKeys.length > 0) {
    if (newKeys.length > 0) {
      lines.push(`  ${DIM}Known:${RESET}`)
    }
    for (const key of knownKeys) {
      renderField(key, entryMap.get(key), false)
    }
  }

  const green = allLinksGreen(name, value)

  lines.push("")
  let footerLine: string
  if (selectedUrlIndex >= 0) {
    // Sub-level: only show actions for the selected url entry
    const selectHint =
      urlsCount > 1
        ? `    ${DIM}1-${NUM_CHARS[urlsCount - 1] ?? "9"}${RESET} reselect`
        : ""
    footerLine = `  ${CYAN}w${RESET} \u2192ws    ${RED}r${RESET} remove${selectHint}    ${DIM}esc${RESET} deselect`
  } else {
    // Top-level: all actions
    const defaultAction = green ? `${GREEN}\u2191 verify${RESET}` : `${YELLOW}\u2191 postpone${RESET}`
    const pasteHint = `    ${MAGENTA}v${RESET} paste`
    const selectHint =
      urlsCount > 0
        ? `    ${DIM}1-${NUM_CHARS[urlsCount - 1] ?? "9"}${RESET} select`
        : ""
    footerLine = `  ${GREEN}\u2190${RESET} verify    ${YELLOW}\u2192${RESET} postpone    ${defaultAction}    ${DIM}\u2193${RESET} back${pasteHint}${selectHint}    ${CYAN}n${RESET} rename    ${RED}d${RESET} delete    ${DIM}x${RESET} exit`
  }
  lines.push(footerLine)
  lines.push("")

  return { output: lines.join("\n"), urlsCount, allGreen: green, selectedUrlIndex, footerLine }
}

// ────────────────────────────────────────────────────────────────────────────
// Key input (persistent raw-mode session)
// ────────────────────────────────────────────────────────────────────────────

type EditMode = "append" | "replace" | "delete"
type Action =
  | "verify"
  | "postpone"
  | "delete"
  | "rename"
  | "exit"
  | "back"
  | { type: "paste"; mode: EditMode }
  | { type: "select"; urlIndex: number }
  | { type: "promote_ws" }
  | { type: "remove_url" }

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

const waitForAction = async (
  urlsCount: number,
  allGreen: boolean,
  selectedUrlIndex: number,
  footerLine: string
): Promise<Action> => {
  activateStdinSession()

  // Build the set of valid url-select characters for the current entry
  const validChars = NUM_CHARS.slice(0, urlsCount)

  return new Promise((resolve) => {
    const onKeypress = (_str: string | undefined, key: readline.Key): void => {
      process.stdin.removeListener("keypress", onKeypress)

      if (key.name === "left") {
        resolve("verify")
      } else if (key.name === "right") {
        resolve("postpone")
      } else if (key.name === "up") {
        resolve(allGreen ? "verify" : "postpone")
      } else if (key.name === "down") {
        resolve("back")
      } else if (key.name === "d") {
        resolve("delete")
      } else if (key.name === "n") {
        resolve("rename")
      } else if (key.name === "x" || (key.ctrl && key.name === "c")) {
        resolve("exit")
      } else if (key.name === "v") {
        // Paste link — replace footer with sub-prompt to avoid confusion
        process.stdout.write(`\x1b[1A\r\x1b[2K`)
        process.stdout.write(
          `  ${MAGENTA}v${RESET} → ${GREEN}a${RESET} append  ${YELLOW}r${RESET} replace  ${DIM}esc${RESET} cancel`
        )
        void (async () => {
          const mode = await waitForEditMode()
          if (mode === "cancel") {
            // Restore the original footer
            process.stdout.write(`\r\x1b[2K`)
            process.stdout.write(footerLine)
            process.stdin.once("keypress", onKeypress)
          } else {
            process.stdout.write(`\n`)
            resolve({ type: "paste", mode })
          }
        })()
      } else if (key.name === "escape" && selectedUrlIndex >= 0) {
        resolve({ type: "select", urlIndex: selectedUrlIndex }) // toggle off = deselect
      } else if (key.name === "w" && selectedUrlIndex >= 0) {
        resolve({ type: "promote_ws" })
      } else if (key.name === "r" && selectedUrlIndex >= 0) {
        resolve({ type: "remove_url" })
      } else {
        // Check if this is a url-select key (1-9, a-z)
        const ch = key.name ?? _str ?? ""
        const idx = validChars.indexOf(ch)
        if (idx >= 0) {
          resolve({ type: "select", urlIndex: idx })
        } else {
          // Unknown key — re-listen
          process.stdin.once("keypress", onKeypress)
        }
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
  /** Per-field new/duplicate classification (absent if ALL.json was unavailable) */
  readonly fieldClassification?: FieldClassification
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

  // ── Back (↓) support: undo the last verify/postpone/delete once ──────
  // We snapshot the previous entry's override value before each action so we
  // can restore it if the user presses ↓. Only one level of undo is allowed;
  // after a back, canGoBack resets to false until the next decision.
  let prevSnapshot: { name: string; value: ManualOverrideValue; wasDeleted: boolean } | undefined
  let canGoBack = false

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i]
    if (!entry) throw new Error(`Unexpected: queue[${i}] is undefined`)
    const totalInQueue = queue.length

    // Snapshot current entry's value before the user acts on it
    const snapshotBeforeAction = overrides[entry.name] ?? entry.value

    // Show entry — loop to allow in-place edits before verify/postpone
    let decided = false
    let decidedAction: Action | null = null
    let selectedUrlIdx = -1 // Currently selected urls entry index
    while (!decided) {
      const { output, urlsCount, allGreen, selectedUrlIndex, footerLine } = renderEntry(
        entry.name,
        overrides[entry.name] ?? entry.value,
        startIndex + i,
        startIndex + totalInQueue,
        selectedUrlIdx,
        entry.fieldClassification
      )
      process.stdout.write(output)

      const action = await waitForAction(urlsCount, allGreen, selectedUrlIndex, footerLine)

      if (action === "exit") {
        deactivateStdinSession()
        if (dirtyKeys.size > 0) saveQueue.enqueue()
        await saveQueue.drain()
        return { processed, exitRequested: true }
      }

      if (action === "back") {
        if (!canGoBack || !prevSnapshot || i === 0) {
          process.stdout.write(`  ${DIM}Nothing to go back to${RESET}\n`)
          await sleep(600)
          continue
        }
        // Restore the previous entry's state
        if (prevSnapshot.wasDeleted) {
          overrides[prevSnapshot.name] = prevSnapshot.value
        } else {
          overrides[prevSnapshot.name] = prevSnapshot.value
        }
        dirtyKeys.add(prevSnapshot.name)
        process.stdout.write(`  ${CYAN}${BOLD} UNDO ${RESET} Restored ${prevSnapshot.name}\n`)
        await sleep(600)

        // Go back: decrement i by 2 so the for-loop's i++ brings us to the previous entry
        i -= 2
        processed--
        canGoBack = false
        prevSnapshot = undefined
        decided = true
        decidedAction = "back"
        continue
      }

      if (action === "verify") {
        overrides[entry.name] = updateMeta(overrides[entry.name] ?? entry.value, { isVerified: true })
        dirtyKeys.add(entry.name)
        process.stdout.write(`  ${BG_GREEN}${WHITE} VERIFIED ${RESET} ${entry.name}\n`)
        decided = true
        decidedAction = action
      } else if (action === "postpone") {
        overrides[entry.name] = updateMeta(overrides[entry.name] ?? entry.value, { isVerified: false })
        dirtyKeys.add(entry.name)
        process.stdout.write(`  ${BG_YELLOW}${WHITE} POSTPONED ${RESET} ${entry.name}\n`)
        decided = true
        decidedAction = action
      } else if (action === "delete") {
        Reflect.deleteProperty(overrides, entry.name)
        dirtyKeys.add(entry.name)
        process.stdout.write(`  ${RED}${BOLD} DELETED ${RESET} ${entry.name}\n`)
        decided = true
        decidedAction = action
      } else if (action === "rename") {
        const current = overrides[entry.name] ?? entry.value
        const currentName = "name" in current && typeof current.name === "string" ? current.name : entry.name
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
      } else if (action.type === "select") {
        // Toggle selection: pressing the same number deselects
        selectedUrlIdx = selectedUrlIdx === action.urlIndex ? -1 : action.urlIndex
        // Re-render immediately (no sleep)
        continue
      } else if (action.type === "promote_ws") {
        // Promote selected urls entry to ws field
        const current = overrides[entry.name] ?? entry.value
        const urlsRaw = "urls" in current ? current.urls : undefined
        const urlsArr = Array.isArray(urlsRaw) ? urlsRaw : typeof urlsRaw === "string" ? [urlsRaw] : []
        const selectedUrl = urlsArr[selectedUrlIdx]
        if (typeof selectedUrl !== "string") continue

        // Set target field (auto-categorize in case it's a social link)
        const category = categorizeUrl(selectedUrl)
        const targetField = category ?? "ws"
        const targetLabel = FIELD_LABELS[targetField] ?? targetField

        // Append to target field (don't replace existing value)
        const fields = Object.fromEntries(Object.entries(current))
        const existing = ExistingFieldSchema.parse(fields[targetField])
        let newFieldValue: string | string[]
        if (existing === undefined) {
          newFieldValue = selectedUrl
        } else if (Array.isArray(existing)) {
          newFieldValue = [...existing, selectedUrl]
        } else {
          newFieldValue = [existing, selectedUrl]
        }

        // Remove from urls
        const newUrls = urlsArr.filter((_, idx) => idx !== selectedUrlIdx)
        const updated = { ...current, [targetField]: newFieldValue } as ManualOverrideValue
        if (newUrls.length === 0) {
          Reflect.deleteProperty(updated, "urls")
        } else {
          Object.assign(updated, { urls: newUrls })
        }
        overrides[entry.name] = updated
        dirtyKeys.add(entry.name)
        selectedUrlIdx = -1

        process.stdout.write(
          `  ${BG_GREEN}${WHITE} PROMOTED ${RESET} → ${targetLabel}: ${DIM}${selectedUrl}${RESET}\n`
        )
        await sleep(600)
      } else if (action.type === "remove_url") {
        // Remove selected urls entry
        const current = overrides[entry.name] ?? entry.value
        const urlsRaw = "urls" in current ? current.urls : undefined
        const urlsArr = Array.isArray(urlsRaw) ? urlsRaw : typeof urlsRaw === "string" ? [urlsRaw] : []
        const removedUrl = urlsArr[selectedUrlIdx]
        if (typeof removedUrl !== "string") continue

        const newUrls = urlsArr.filter((_, idx) => idx !== selectedUrlIdx)
        const updated = { ...current } as ManualOverrideValue
        if (newUrls.length === 0) {
          Reflect.deleteProperty(updated, "urls")
        } else {
          Object.assign(updated, { urls: newUrls })
        }
        overrides[entry.name] = updated
        dirtyKeys.add(entry.name)
        selectedUrlIdx = -1

        process.stdout.write(`  ${RED}${BOLD} REMOVED ${RESET} ${DIM}${removedUrl}${RESET}\n`)
        await sleep(600)
      } else if (action.type === "paste") {
        // Paste link from clipboard (auto-categorized)
        const clipboard = readClipboard()
        if (!clipboard) {
          process.stdout.write(`  ${RED}Clipboard is empty${RESET}\n`)
          await sleep(800)
          continue
        }

        // Apply the edit — target field is "urls" by default, but auto-categorization may redirect
        const current = overrides[entry.name] ?? entry.value
        const result = applyFieldEdit(current, "urls", clipboard, action.mode)
        if (!result.ok) {
          process.stdout.write(`  ${RED}${result.error}${RESET}\n`)
          await sleep(800)
          continue
        }

        overrides[entry.name] = result.value
        dirtyKeys.add(entry.name)

        // Flash confirmation then re-render (loop continues)
        const modeLabel = action.mode === "append" ? "APPENDED" : action.mode === "replace" ? "REPLACED" : "DELETED"
        const bgColor = action.mode === "append" ? BG_GREEN : action.mode === "replace" ? BG_BLUE : BG_YELLOW
        const targetLabel = FIELD_LABELS[result.targetField] ?? result.targetField
        process.stdout.write(
          `  ${bgColor}${WHITE} ${modeLabel} ${RESET} ${targetLabel}: ${DIM}${result.displayValue}${RESET}\n`
        )

        await sleep(600)
      }
    }

    // If back was pressed, don't count this entry and don't save
    if (decidedAction === "back") continue

    // Save snapshot of this entry so ↓ can undo it from the next screen
    prevSnapshot = {
      name: entry.name,
      value: snapshotBeforeAction,
      wasDeleted: decidedAction === "delete"
    }
    canGoBack = true

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

/**
 * Load the final ALL.json database for duplicate comparison.
 * This allows us to determine whether each override entry would produce
 * any change to the final database — if not, auto-verify it.
 */
const loadAllJson = (): FinalDBFileType[] => {
  const allJsonPath = path.join(__dirname, "../../results/4_final/ALL.json")
  if (!fs.existsSync(allJsonPath)) {
    log(`${YELLOW}Warning: ALL.json not found at ${allJsonPath} — skipping auto-verify${RESET}`)
    return []
  }
  const raw: unknown = JSON.parse(fs.readFileSync(allJsonPath, "utf-8"))
  return z.array(FinalDBFileSchema).parse(raw)
}

/**
 * Auto-verify entries that are duplicates (would produce no change to ALL.json).
 * Classifies each entry, auto-verifies duplicates, and returns only new entries
 * sorted to the front for interactive review.
 *
 * Processes all queued auto-verifications BEFORE the user sees anything interactive,
 * so the user only reviews entries with genuinely new data.
 */
const autoVerifyDuplicates = (
  queue: QueueEntry[],
  overrides: Record<string, ManualOverrideValue>,
  dirtyKeys: Set<string>,
  allJsonDb: FinalDBFileType[]
): { remaining: QueueEntry[]; autoVerifiedCount: number } => {
  if (allJsonDb.length === 0) {
    // No ALL.json available — no per-field classification possible, skip auto-verify
    return { remaining: [...queue], autoVerifiedCount: 0 }
  }

  const remaining: QueueEntry[] = []
  let autoVerifiedCount = 0

  for (const entry of queue) {
    const entryValue = overrides[entry.name] ?? entry.value
    const classification = classifyEntry(entry.name, entryValue, allJsonDb)

    if (classification === "duplicate") {
      // Auto-verify: set isVerified: true in-memory and mark dirty
      overrides[entry.name] = updateMeta(entryValue, { isVerified: true })
      dirtyKeys.add(entry.name)
      autoVerifiedCount++
    } else {
      // "new" — needs interactive review; attach per-field classification
      const fc = classifyEntryFields(entry.name, entryValue, allJsonDb)
      remaining.push({ ...entry, fieldClassification: fc })
    }
  }

  return { remaining, autoVerifiedCount }
}

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

  // Load ALL.json for duplicate comparison
  log(`${DIM}Loading ALL.json for duplicate detection...${RESET}`)
  const allJsonDb = loadAllJson()

  // Track which entries were modified during this session
  const dirtyKeys = new Set<string>()

  // Single save queue shared across both passes
  const saveQueue = createSaveQueue(overrides, dirtyKeys)

  // ── Phase 1: Auto-verify duplicates (no user interaction) ──────────
  const unverifiedResult = autoVerifyDuplicates(unverified, overrides, dirtyKeys, allJsonDb)
  const postponedResult = autoVerifyDuplicates(postponed, overrides, dirtyKeys, allJsonDb)
  const totalAutoVerified = unverifiedResult.autoVerifiedCount + postponedResult.autoVerifiedCount

  if (totalAutoVerified > 0) {
    log(`${GREEN}Auto-verified ${totalAutoVerified} duplicate entries (no changes to ALL.json)${RESET}`)
    // Flush auto-verified entries to disk immediately
    saveQueue.enqueue()
  }

  const remainingUnverified = unverifiedResult.remaining
  const remainingPostponed = postponedResult.remaining

  if (remainingUnverified.length === 0 && remainingPostponed.length === 0) {
    await saveQueue.drain()
    printSummary(0, totalAutoVerified, overrides)
    return
  }

  log(`${DIM}Remaining for review: ${remainingUnverified.length} unverified  |  ${remainingPostponed.length} postponed${RESET}`)

  // ── Phase 2: Interactive review (only genuinely new entries) ────────
  let totalProcessed = 0

  if (remainingUnverified.length > 0) {
    const result = await processQueue(
      remainingUnverified,
      overrides,
      saveQueue,
      dirtyKeys,
      "Unverified entries",
      0
    )
    totalProcessed += result.processed
    if (result.exitRequested) {
      printSummary(totalProcessed, totalAutoVerified, overrides)
      process.exit(0)
    }
  }

  if (remainingPostponed.length > 0) {
    // Re-classify postponed entries: some may have been verified during unverified pass
    const freshQueues = buildQueues(overrides)
    const freshPostponed = allJsonDb.length > 0
      ? freshQueues.postponed.map((e) => {
          const entryValue = overrides[e.name] ?? e.value
          const fc = classifyEntryFields(e.name, entryValue, allJsonDb)
          return { ...e, fieldClassification: fc }
        })
      : freshQueues.postponed

    if (freshPostponed.length > 0) {
      log(`\n${YELLOW}${BOLD}=== Postponed entries for deeper inspection ===${RESET}`)
      const result = await processQueue(
        freshPostponed,
        overrides,
        saveQueue,
        dirtyKeys,
        "Postponed entries",
        totalProcessed
      )
      totalProcessed += result.processed
      if (result.exitRequested) {
        printSummary(totalProcessed, totalAutoVerified, overrides)
        process.exit(0)
      }
    }
  }

  deactivateStdinSession()
  // Flush any remaining dirty entries, then wait for all saves to finish
  if (dirtyKeys.size > 0) saveQueue.enqueue()
  await saveQueue.drain()
  printSummary(totalProcessed, totalAutoVerified, overrides)
  process.exit(0)
}

const printSummary = (
  totalProcessed: number,
  totalAutoVerified: number,
  overrides: Record<string, ManualOverrideValue>
): void => {
  const { unverified, postponed } = buildQueues(overrides)

  log(`\n${BOLD}${WHITE}=== Summary ===${RESET}`)
  if (totalAutoVerified > 0) {
    log(`  ${GREEN}Auto-verified (no changes):${RESET} ${totalAutoVerified}`)
  }
  log(`  ${GREEN}Processed this session:${RESET}     ${totalProcessed}`)
  log(`  ${DIM}Remaining unverified:${RESET}       ${unverified.length}`)
  log(`  ${YELLOW}Postponed:${RESET}                 ${postponed.length}`)
  log("")
}

export { main as run }

if (require.main === module) {
  main().catch((err) => {
    logError("verify_overrides failed:", err)
    process.exit(1)
  })
}

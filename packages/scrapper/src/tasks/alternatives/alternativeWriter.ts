/**
 * Appends an alternative to the `alt` list of every matched company.
 *
 * Two properties of the existing pipeline shape this module:
 *
 * 1. **`alt` is keyed by company NAME**, not id. `final.ts` looks an entry up as
 *    `manualOverrides[item.n]` and copies `alt` straight across, ignoring the reason and
 *    trust checks that apply to link fields. So one override per name covers every row a
 *    company occupies.
 * 2. **Most companies have no manual entry.** 19,078 of 23,674 names appear in neither
 *    manualAdditions nor manualOverrides. Writing an alt-only override for them is legal —
 *    `merge_static.ts` skips overrides that carry no link fields — but the override file's
 *    new-key guard has to be told explicitly, which is why `allowNewKeys` exists.
 *
 * The writer is idempotent: re-running a command with the same alternative must not add a
 * second copy, and must not clobber alternatives that were already there.
 */

import { log } from "../../helper"
import { loadManualOverrides } from "../manual_resolve/loaders"
import { saveManualOverrides } from "../validate/override_io"
import type { ManualOverrideValue } from "../validate/types"

/** The alternative being attached. Mirrors the ALL.json `alt` entry shape. */
export type AlternativeEntry = {
  /** Display name. */
  n: string
  /** Website, with scheme. Stored verbatim as the client opens it directly. */
  ws: string
}

export type WrittenCompany = {
  /** Company name the override was written under. */
  name: string
  /** True when the alternative was newly added, false when it was already present. */
  added: boolean
  /** How many alternatives the company ends up with. */
  alternativeCount: number
}

export type WriteResult = {
  written: WrittenCompany[]
  /** Companies whose entry already contained this alternative. */
  skipped: string[]
}

/** Normalizes a URL for equality checks: scheme, www, trailing slash are not identity. */
export const normalizeAlternativeUrl = (url: string): string =>
  url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")

const sameAlternative = (a: AlternativeEntry, b: AlternativeEntry): boolean =>
  normalizeAlternativeUrl(a.ws) === normalizeAlternativeUrl(b.ws)

/**
 * Removes the alternative from every named company.
 *
 * Exists because review is not only additive: applying a generous list and then trimming it
 * is a normal outcome, and hand-editing a 9,000-entry file to undo it is how mistakes get
 * made. A company is left untouched when it does not carry the alternative, and its `alt`
 * array is dropped entirely when it was the only entry, so no empty arrays linger.
 */
export const removeAlternativeFromCompanies = async (
  companies: readonly string[],
  alternative: AlternativeEntry
): Promise<{ removed: string[]; untouched: string[] }> => {
  if (companies.length === 0) {
    throw new Error("No companies to remove the alternative from.")
  }

  const overrides = loadManualOverrides()
  const removed: string[] = []
  const untouched: string[] = []

  for (const name of companies) {
    const existing = overrides[name]
    const existingAlternatives = readExistingAlternatives(existing)

    if (!existingAlternatives.some((entry) => sameAlternative(entry, alternative))) {
      untouched.push(name)
      continue
    }

    if (existing === undefined || typeof existing !== "object" || existing === null) {
      throw new Error(`"${name}" has an alternative to remove but no override object. Data is inconsistent.`)
    }

    const kept = existingAlternatives.filter((entry) => !sameAlternative(entry, alternative))

    if (kept.length > 0) {
      overrides[name] = { ...existing, alt: kept }
    } else {
      // Drop `alt` entirely rather than leaving `alt: []` behind: an empty array is not the
      // same shape as "no alternatives" and would render an empty popup. Rebuilt field by
      // field because ManualOverrideValue is a union and not every member declares `alt`.
      const rest: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(existing)) {
        if (key !== "alt") {
          rest[key] = value
        }
      }
      overrides[name] = rest
    }

    removed.push(name)
  }

  if (removed.length === 0) {
    throw new Error(`None of the ${companies.length} companies carry "${alternative.n}". Nothing to remove.`)
  }

  await saveManualOverrides(overrides, { allowNewKeys: true })
  log(`Removed "${alternative.n}" from ${removed.length} companies (${untouched.length} did not have it).`)

  return { removed, untouched }
}

/** Reads the existing `alt` array off an override value, tolerating every stored shape. */
export const readExistingAlternatives = (value: ManualOverrideValue | undefined): AlternativeEntry[] => {
  if (value === undefined || typeof value !== "object" || value === null) {
    return []
  }

  if (!("alt" in value)) {
    return []
  }

  const alt = value.alt
  if (!Array.isArray(alt)) {
    return []
  }

  return alt.filter((entry): entry is AlternativeEntry => {
    if (typeof entry !== "object" || entry === null) return false
    return "n" in entry && "ws" in entry && typeof entry.n === "string" && typeof entry.ws === "string"
  })
}

/**
 * Appends the alternative to each company's override, creating alt-only overrides where
 * none existed.
 *
 * Returns what changed so the caller can report it, and throws if it would write nothing —
 * a silent no-op is indistinguishable from success at the CLI.
 */
export const appendAlternativeToCompanies = async (
  companies: readonly string[],
  alternative: AlternativeEntry
): Promise<WriteResult> => {
  if (companies.length === 0) {
    throw new Error("No companies to attach the alternative to.")
  }

  if (alternative.n.trim().length === 0) {
    throw new Error("Alternative name is empty.")
  }

  if (normalizeAlternativeUrl(alternative.ws).length === 0) {
    throw new Error(`Alternative website "${alternative.ws}" is empty.`)
  }

  const overrides = loadManualOverrides()
  const written: WrittenCompany[] = []
  const skipped: string[] = []

  for (const name of companies) {
    const existing = overrides[name]
    const existingAlternatives = readExistingAlternatives(existing)

    const alreadyPresent = existingAlternatives.some(
      (entry) => normalizeAlternativeUrl(entry.ws) === normalizeAlternativeUrl(alternative.ws)
    )

    if (alreadyPresent) {
      skipped.push(name)
      written.push({ name, added: false, alternativeCount: existingAlternatives.length })
      continue
    }

    const nextAlternatives = [...existingAlternatives, alternative]

    // Preserve everything else on the override. An alt-only override is created when the
    // company had none — that is the 80% case, and it is valid because final.ts reads alt
    // by name without requiring link fields.
    const base: ManualOverrideValue =
      existing !== undefined && typeof existing === "object" && existing !== null ? existing : {}

    overrides[name] = { ...base, alt: nextAlternatives }

    written.push({ name, added: true, alternativeCount: nextAlternatives.length })
  }

  const addedCount = written.filter((entry) => entry.added).length

  if (addedCount === 0) {
    log(`No changes: the alternative already exists on all ${companies.length} companies.`)
    return { written, skipped }
  }

  // allowNewKeys: most target companies are Crunchbase-only and have no override yet.
  await saveManualOverrides(overrides, { allowNewKeys: true })
  log(`Attached "${alternative.n}" to ${addedCount} companies (${skipped.length} already had it).`)

  return { written, skipped }
}

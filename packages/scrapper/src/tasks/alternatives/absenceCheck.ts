/**
 * Confidence that a company is absent from the corpus, plus the evidence when it is not.
 *
 * The authoring flow Mido specified depends on this check: "I have an alternative that I
 * know is not in our database, you should inform me otherwise and stop". So this module
 * answers one question — is this company already one of ours? — and the caller refuses to
 * continue when the answer is yes.
 *
 * Two independent checks, because either alone produces false negatives:
 *   - Domain: catches the same company under a different name (our rows are keyed by
 *     Crunchbase name, which is often a legal entity rather than the product name).
 *   - Name: catches the same company under a different domain (rebrands, country sites).
 *
 * Matching is deliberately conservative. A fuzzy name match that fires on
 * "BrainStorm Cell Therapeutics" when the user typed "BrainsMingle" would block a
 * legitimate addition, which is worse than letting a near-duplicate through — the human
 * sees the candidate list before anything is written.
 */

import { getRegisteredDomain } from "@theWallProject/common"

/** A corpus entry that collides with the company being added. */
export type CollisionMatch = {
  /** How the collision was detected. */
  kind: "domain" | "name"
  /** Corpus row that matched. */
  id: string
  name: string
  /** The corpus field value that produced the match. */
  matchedValue: string
}

export type AbsenceVerdict =
  | { absent: true }
  | { absent: false; matches: CollisionMatch[] }

export type CorpusEntry = {
  id: string
  name: string
  ws?: string | undefined
  li?: string | undefined
  fb?: string | undefined
  tw?: string | undefined
  ig?: string | undefined
  gh?: string | undefined
  ytp?: string | undefined
  ytc?: string | undefined
  tt?: string | undefined
  th?: string | undefined
}

/** Normalizes a name for comparison: case, spacing and punctuation are not identity. */
export const normalizeCompanyName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim()

/**
 * Extracts the comparable host from a stored website value.
 *
 * Corpus websites are stored without a scheme (`wix.com`), while user input normally
 * carries one (`https://brainsmingle.com`). Both must reduce to the same registered
 * domain, and subdomains must not create false distinctions: `blog.wix.com` and
 * `wix.com` are the same company.
 */
export const toRegisteredDomain = (value: string): string => getRegisteredDomain(value.trim())

const LINK_FIELDS = ["ws", "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"] as const

/** Every value of every link field on an entry, with the field it came from. */
const collectLinkValues = (entry: CorpusEntry): Array<{ field: string; value: string }> => {
  const values: Array<{ field: string; value: string }> = []
  for (const field of LINK_FIELDS) {
    const raw = entry[field]
    if (raw === undefined || raw.length === 0) {
      continue
    }
    values.push({ field, value: raw })
  }
  return values
}

/**
 * Decides whether `{name, website}` already exists in the corpus.
 *
 * Exact normalized-name equality only. Substring and edit-distance matching are
 * intentionally absent: they fire on unrelated companies that share a token
 * ("Brain", "Wix"), and blocking a legitimate addition costs more than missing a
 * near-duplicate that a human would have caught in the candidate list anyway.
 */
export const checkAbsence = (
  input: { name: string; website: string },
  corpus: readonly CorpusEntry[]
): AbsenceVerdict => {
  const wantedName = normalizeCompanyName(input.name)
  const wantedDomain = toRegisteredDomain(input.website)

  if (wantedName.length === 0) {
    throw new Error(`Company name "${input.name}" normalizes to nothing.`)
  }
  // `getRegisteredDomain` falls back to the bare hostname when tldts cannot resolve a
  // public suffix, so `localhost` and `x` come back unchanged rather than empty. A
  // comparable website must at least be a dotted host; otherwise every scheme-less
  // whatever would collide with every other one.
  if (wantedDomain.length === 0 || !wantedDomain.includes(".")) {
    throw new Error(`Website "${input.website}" has no registrable domain.`)
  }

  const matches: CollisionMatch[] = []
  // Keyed by normalized company name, not by row id: one company occupies several corpus
  // rows (a row per link field, each with its own id), and the caller wants one match per
  // company. This mirrors how `alt` itself is keyed by name in final.ts.
  const seenCompanies = new Set<string>()

  for (const entry of corpus) {
    const companyKey = normalizeCompanyName(entry.name)

    if (companyKey === wantedName && !seenCompanies.has(companyKey)) {
      seenCompanies.add(companyKey)
      matches.push({ kind: "name", id: entry.id, name: entry.name, matchedValue: entry.name })
      continue
    }

    for (const { value } of collectLinkValues(entry)) {
      if (toRegisteredDomain(value) !== wantedDomain) {
        continue
      }
      if (seenCompanies.has(companyKey)) {
        break
      }
      seenCompanies.add(companyKey)
      matches.push({ kind: "domain", id: entry.id, name: entry.name, matchedValue: value })
      break
    }
  }

  return matches.length === 0 ? { absent: true } : { absent: false, matches }
}

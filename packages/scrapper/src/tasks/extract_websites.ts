import path from "path"
import { formatAndWrite, isSharedHost } from "@theWallProject/common"

import { error, log, warn } from "../helper"
import {
  CrunchbaseScrappedItemsType,
  DBFileNames,
  MergedDataFileSchema,
  NetworksFlatItemsType,
  NetworksFlatItemType
} from "../types"

const outputFilePath = path.join(__dirname, `../../results/3_networks/${DBFileNames.WEBSITES}.json`)

/**
 * Rows deliberately parked on a shared host, so the guard below does not fight a decision.
 *
 * `manual_ws_wixsite_com` is an intentional blanket block on free Wix sites; the other two are
 * scrape defects being repaired in `manualOverrides.ts` and must not reappear.
 */
const SHARED_HOST_ALLOWLIST = new Set<string>(["manual_ws_wixsite_com"])

/**
 * Hosts whose whole domain belongs to a platform, not to one company.
 *
 * A scraped URL parked on one of these means the scrape grabbed a profile, a shop page or a
 * checkout page, and collapsing it to the root would block every user of that platform — the
 * `etsy.com` and `linktr.ee` incidents. A leading dot (`.steampowered`, `.apple.com`) spells "a
 * subdomain of this": it never matched the bare apex, and that meaning is kept explicit below.
 */
const FILTERED_DOMAINS = ["google.com", "business.site", ".steampowered", "meetup.com", ".apple.com"]

/**
 * True when the host is one of FILTERED_DOMAINS, or a subdomain of one.
 *
 * Label boundaries, not `includes`. `"notgoogle.com".includes("google.com")` is true, so a substring
 * test refuses any domain that merely *ends* with a filtered name — a company called notgoogle.com
 * would be silently dropped as a scrape defect, and the filter is supposed to catch URLs genuinely on
 * the platform. Comparing whole labels is what makes the two cases distinguishable.
 */
export const isFilteredDomain = (domain: string): boolean => {
  const normalized = domain.toLowerCase().replace(/\.$/, "")
  const labels = normalized.split(".")
  return FILTERED_DOMAINS.some((entry) => {
    const subdomainOnly = entry.startsWith(".")
    const base = entry.replace(/^\./, "")
    // The platform itself, or any subdomain of it.
    if (normalized === base || normalized.endsWith(`.${base}`)) return true
    // A dot-prefixed entry also means "any host that begins with this segment", which is how
    // `.steampowered` catches `store.steampowered.com` and `store.steampowered.co`.
    return subdomainOnly && labels.includes(base)
  })
}

/**
 * Whether a row's website survives the shared-host filter.
 *
 * Incoming data is refused: a scraped URL that lands on a filtered domain is a scrape defect, and
 * this is loud about it.
 *
 * Curated hint rows are the exception, and only for a host below the filtered domain. A hint is a
 * deliberate choice about where a suggestion belongs, so `ads.google.com` — the Google Ads console —
 * must survive even though it sits under `google.com`. The bare filtered host is still refused, in
 * both kinds of row: a hint on `google.com` would fire on Search, Gmail and Docs, which is the
 * outcome the filter exists to prevent.
 */
export const shouldKeepWebsite = (
  row: { ws?: string; isHint?: boolean },
  onExcluded: (message: string) => void = () => {}
): boolean => {
  const website = row.ws
  if (!website) return false

  const domain = website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
  if (domain === undefined) {
    throw new Error(`Failed to extract domain from: ${website}`)
  }

  const filtered = isFilteredDomain(domain)
  if (!filtered) return true

  if (row.isHint) {
    // A bare host has no label before its registered domain. `ads.google.com` does. Comparing the
    // label count rather than a list of strings is what makes "the bare one" mean the same thing for
    // `google.com`, `meetup.com` and the dot-prefixed `.steampowered` entry alike.
    const bare = domain.split(".").length === 2
    if (!bare) return true
    onExcluded(`Website excluded ${website} => ${domain} (curated hint on the bare platform host)`)
    return false
  }

  onExcluded(`Website excluded ${website} => ${domain}`)
  return false
}

export const run = async (merged: CrunchbaseScrappedItemsType) => {
  // Validate merged data structure (includes ig/gh/ytp/ytc/tt/th from manual overrides)
  // This will throw immediately if validation fails
  const mergedDB = MergedDataFileSchema.parse(merged)
  const duplicates: Record<string, NetworksFlatItemType[]> = {}

  const db = mergedDB.filter((row) => row.ws && row.ws !== "").filter((row) => shouldKeepWebsite(row, warn))

  const result: NetworksFlatItemsType = []

  // A URL with a path on the company's own domain is still that company's site, so `getMainDomain`
  // legitimately truncates it. But when a *different* company also holds the truncated root, the
  // truncation silently steals the domain: Crunchbase carried `www.wix.com/ascend/home` for Ascend and
  // `www.wix.com` for Wix, both collapsed to `wix.com`, and the de-dupe kept Ascend — so every user on
  // wix.com saw "Ascend". Compare names before writing, and refuse rather than pick a winner.
  const declaredOrigin = new Map<string, { id: string; name: string; hadPath: boolean }[]>()

  for (const row of db) {
    if (!row.ws) continue
    const withoutProtocol = row.ws.replace(/^https?:\/\//, "")
    const hadPath = withoutProtocol.replace(/^[^/]+/, "").replace(/^\//, "").length > 0
    const domain = withoutProtocol.replace(/^www\./, "").split("/")[0]
    if (!domain) continue
    const entries = declaredOrigin.get(domain) ?? []
    entries.push({ id: row.id, name: row.name, hadPath })
    declaredOrigin.set(domain, entries)
  }

  for (const domain of Array.from(declaredOrigin.keys())) {
    const entries = declaredOrigin.get(domain) ?? []
    const names = new Set(entries.map((e) => e.name.trim().toLowerCase()))
    if (names.size < 2) continue
    const truncated = entries.filter((e) => e.hadPath)
    if (truncated.length === 0) continue
    error(
      `Domain collision on '${domain}': ${entries.map((e) => `${e.name} (${e.id})`).join(", ")}. ` +
        `The path-bearing URL(s) ${truncated.map((e) => e.id).join(", ")} collapse onto the same root as another company. ` +
        `Give the path-bearing company its own domain or a manual override; refusing to let one company show another's name.`
    )
    throw new Error(`Domain collision with a path-truncated website: ${domain}`)
  }

  for (const row of db) {
    const website = row.ws

    if (!website) {
      error(row)
      throw new Error("Website is empty")
    }

    const domain = website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
    if (domain === undefined) {
      error(row)
      throw new Error(`Failed to extract domain from: ${website}`)
    }

    // A profile URL on a platform host collapses to the platform root, and the website matcher
    // matches apex-then-subdomain: one scraped Etsy shop or Linktree page would block every shop and
    // every Linktree on the internet. This shipped once (etsy.com, linktr.ee). Fail loudly instead of
    // writing it again, and fix the source link (the profile belongs in `urls`).
    if (isSharedHost(domain) && !SHARED_HOST_ALLOWLIST.has(row.id)) {
      error(
        `Shared-host website rejected for ${row.name} (${row.id}): '${website}' collapses to platform root '${domain}'. ` +
          `Put the profile URL in \`urls\` and give the row its own domain or social selectors.`
      )
      throw new Error(`Shared-host website rejected: ${domain} (${row.id})`)
    }

    // if (domain.split(".").length > 2) {
    //   // warn(`Website Domain extracted ${website} => ${domain}`);
    // } else {
    //   // log(`Website Domain extracted ${website} => ${domain}`);
    // }
    const previousRows = duplicates[domain]

    const websiteResult = {
      id: row.id,
      selector: domain,
      name: row.name,
      reasons: row.reasons
    }
    if (Array.isArray(previousRows)) {
      // error(`Duplicate domain [flagged]: ${domain} of website ${website}`);
      // const isDuplicate = previousRows.some(
      //   (existingRow) =>
      //     JSON.stringify({ ...existingRow, cbRank: undefined }) ===
      //     JSON.stringify({ ...newRow, cbRank: undefined }),
      // );

      // if (!isDuplicate) {
      previousRows.push(websiteResult)
      // }
      continue
    } else {
      duplicates[domain] = [websiteResult]

      result.push(websiteResult)
    }
  }

  // to merge different reasons
  for (const [domain, rows] of Object.entries(duplicates)) {
    if (rows.length > 1) {
      warn(`Duplicate flagged domain: ${domain}`)

      const firstRow = rows[0]
      if (firstRow === undefined) {
        throw new Error(`Unexpected empty rows array for domain: ${domain}`)
      }
      let merged = firstRow

      for (const row of rows) {
        merged = mergeObjects(merged, row)
      }
      const mergedSelector = merged.selector
      if (mergedSelector === undefined) {
        throw new Error(`Merged result has undefined selector for domain: ${domain}`)
      }
      result.splice(
        result.findIndex((row) => row.selector === mergedSelector),
        1,
        merged
      )
    }
  }

  await formatAndWrite(
    outputFilePath,
    result.sort((a, b) => a.selector.localeCompare(b.selector)),
    { parser: "json" }
  )

  log(`Wrote ${mergedDB.length} rows...`)
}

function mergeObjects(obj1: NetworksFlatItemType, obj2: NetworksFlatItemType): NetworksFlatItemType {
  const merged: NetworksFlatItemType = { ...obj1 }

  // Merge reasons arrays and remove duplicates
  merged.reasons = Array.from(new Set([...merged.reasons, ...obj2.reasons]))

  // Merge other required fields (keep first non-empty value)
  if (obj2.selector && (!merged.selector || merged.selector === "")) {
    merged.selector = obj2.selector
  }
  if (obj2.id && (!merged.id || merged.id === "")) {
    merged.id = obj2.id
  }
  if (obj2.name && (!merged.name || merged.name === "")) {
    merged.name = obj2.name
  }

  return merged
}

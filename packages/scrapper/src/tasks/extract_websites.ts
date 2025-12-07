import fs from "fs"
import path from "path"

import { error, log, warn } from "../helper"
import {
  CrunchbaseScrappedItemsType,
  DBFileNames,
  MergedDataFileSchema,
  NetworksFlatItemsType,
  NetworksFlatItemType
} from "../types"

const outputFilePath = path.join(__dirname, `../../results/3_networks/${DBFileNames.WEBSITES}.json`)

export const run = async (merged: CrunchbaseScrappedItemsType) => {
  // Validate merged data structure (includes ig/gh/ytp/ytc/tt/th from manual overrides)
  // This will throw immediately if validation fails
  const mergedDB = MergedDataFileSchema.parse(merged)
  const duplicates: Record<string, NetworksFlatItemType[]> = {}

  const db = mergedDB
    .filter((row) => row.ws && row.ws !== "")
    .filter((row) => {
      const website = row.ws

      let shouldKeep = false

      if (website) {
        const domain = website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        if (domain === undefined) {
          throw new Error(`Failed to extract domain from: ${website}`)
        }

        shouldKeep = !(
          domain.includes("google.com") ||
          domain.includes("business.site") ||
          domain.includes(".steampowered") ||
          domain.includes("meetup") ||
          domain.includes(".apple.com") ||
          domain.endsWith(".il")
        )

        if (!shouldKeep) {
          if (!domain.endsWith(".il")) {
            warn(`Website excluded ${website} => ${domain}`)
          }
        }
      }

      return shouldKeep
    })

  const result: NetworksFlatItemsType = []

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
      reasons: row.reasons,
      ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
      ...(row.isHint ? { isHint: true } : {}),
      ...(row.hintText ? { hintText: row.hintText } : {}),
      ...(row.hintUrl ? { hintUrl: row.hintUrl } : {}),
      ...(row.hint_android_id ? { hint_android_id: row.hint_android_id } : {}),
      ...(row.android_dev_id ? { android_dev_id: row.android_dev_id } : {}),
      ...(row.android_app_ids ? { android_app_ids: row.android_app_ids } : {})
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

  fs.writeFileSync(outputFilePath, JSON.stringify(result.sort((a, b) => a.selector.localeCompare(b.selector))), "utf-8")

  log(`Wrote ${mergedDB.length} rows...`)
}

function mergeObjects(obj1: NetworksFlatItemType, obj2: NetworksFlatItemType): NetworksFlatItemType {
  const merged: NetworksFlatItemType = { ...obj1 }

  // Merge reasons arrays and remove duplicates
  merged.reasons = Array.from(new Set([...merged.reasons, ...obj2.reasons]))

  // Merge other fields
  if (obj2.selector && (!merged.selector || merged.selector === "")) {
    merged.selector = obj2.selector
  }
  if (obj2.id && (!merged.id || merged.id === "")) {
    merged.id = obj2.id
  }
  if (obj2.name && (!merged.name || merged.name === "")) {
    merged.name = obj2.name
  }
  if (obj2.s && (!merged.s || merged.s === "")) {
    merged.s = obj2.s
  }
  if (obj2.isHint !== undefined) {
    merged.isHint = obj2.isHint
  }
  if (obj2.hintText && (!merged.hintText || merged.hintText === "")) {
    merged.hintText = obj2.hintText
  }
  if (obj2.hintUrl && (!merged.hintUrl || merged.hintUrl === "")) {
    merged.hintUrl = obj2.hintUrl
  }
  if (obj2.hint_android_id && (!merged.hint_android_id || merged.hint_android_id === "")) {
    merged.hint_android_id = obj2.hint_android_id
  }
  if (obj2.android_dev_id && (!merged.android_dev_id || merged.android_dev_id === "")) {
    merged.android_dev_id = obj2.android_dev_id
  }
  if (obj2.android_app_ids && (!merged.android_app_ids || merged.android_app_ids.length === 0)) {
    merged.android_app_ids = obj2.android_app_ids
  }

  return merged
}

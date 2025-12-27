import fs from "fs"
import path from "path"
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
  APIListOfReasonsSchema,
  getMainDomain,
  type LinkField,
  type valuesOfListOfReasons
} from "@theWallProject/common"

import { cleanWebsite, error, log } from "../helper"
import { CrunchbaseScrappedItemsSchema, ManualEntriesSchema, MergedDataItem } from "../types"
import { manualAdditions } from "./manual_resolve/manualAdditions"
import { manualDeleteIds } from "./manual_resolve/manualDeleteIds"
import { manualOverrides } from "./manual_resolve/manualOverrides"

// Helper to extract identifier from URL for ID generation
const extractIdentifier = (url: string, field: LinkField): string => {
  if (field === "ws") {
    // For websites, use domain (match extract_websites.ts logic)
    let domain = url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
    if (domain === undefined) {
      throw new Error(`Failed to extract domain from: ${url}`)
    }
    domain = domain.replace(/\./g, "_")
    return domain
  } else if (field === "li") {
    const regex = new RegExp(API_ENDPOINT_RULE_LINKEDIN_COMPANY.regex)
    const results = regex.exec(url)
    if (!results || !results[1]) {
      throw new Error(`Failed to extract LinkedIn identifier from: ${url}`)
    }
    return results[1].replace(/\//g, "_")
  } else if (field === "fb") {
    const regex = new RegExp(API_ENDPOINT_RULE_FACEBOOK.regex)
    const normalizedUrl = url.replace("/pg/", "/").replace("/p/", "/")
    const results = regex.exec(normalizedUrl)
    if (!results || !results[1]) {
      throw new Error(`Failed to extract Facebook identifier from: ${url}`)
    }
    return results[1].replace(/\//g, "_")
  } else if (field === "tw") {
    const regex = new RegExp(API_ENDPOINT_RULE_TWITTER.regex)
    const results = regex.exec(url)
    if (!results || !results[1]) {
      throw new Error(`Failed to extract Twitter identifier from: ${url}`)
    }
    return results[1].replace(/\//g, "_")
  } else if (field === "ig") {
    const regex = new RegExp(API_ENDPOINT_RULE_INSTAGRAM.regex)
    const results = regex.exec(url)
    if (!results || !results[1]) {
      throw new Error(`Failed to extract Instagram identifier from: ${url}`)
    }
    return results[1].replace(/\//g, "_")
  } else if (field === "gh") {
    const regex = new RegExp(API_ENDPOINT_RULE_GITHUB.regex)
    const results = regex.exec(url)
    if (!results || !results[1]) {
      throw new Error(`Failed to extract GitHub identifier from: ${url}`)
    }
    return results[1].replace(/\//g, "_")
  } else if (field === "ytp") {
    const regex = new RegExp(API_ENDPOINT_RULE_YOUTUBE_PROFILE.regex, "i")
    const results = regex.exec(url)
    if (!results) {
      throw new Error(`Failed to extract YouTube Profile identifier from: ${url}`)
    }
    // Check all capture groups (user/, c/, @, or direct format) and use the first non-undefined one
    const id = results[1] || results[2] || results[3] || results[4]
    if (!id) {
      throw new Error(`Failed to extract YouTube Profile identifier from: ${url}`)
    }
    return id.replace(/\//g, "_")
  } else if (field === "ytc") {
    const regex = new RegExp(API_ENDPOINT_RULE_YOUTUBE_CHANNEL.regex, "i")
    const results = regex.exec(url)
    if (!results || !results[1]) {
      throw new Error(`Failed to extract YouTube Channel identifier from: ${url}`)
    }
    return results[1].replace(/\//g, "_")
  } else if (field === "tt") {
    const regex = new RegExp(API_ENDPOINT_RULE_TIKTOK.regex)
    const results = regex.exec(url)
    if (!results || !results[1]) {
      throw new Error(`Failed to extract TikTok identifier from: ${url}`)
    }
    return results[1].replace(/\//g, "_")
  } else if (field === "th") {
    const regex = new RegExp(API_ENDPOINT_RULE_THREADS.regex)
    const results = regex.exec(url)
    if (!results || !results[1]) {
      throw new Error(`Failed to extract Threads identifier from: ${url}`)
    }
    return results[1].replace(/\//g, "_")
  }
  throw new Error(`Unknown field: ${field}`)
}
// import MERGED_CB from "../../results/2_merged/1_MERGED_CB.json";

const folderPath = path.join(__dirname, "../../results/1_batches/static")
const mergedCBPath = path.join(__dirname, "../../results/2_merged/1_MERGED_CB.json")

const outputFilePath = path.join(__dirname, "../../results/2_merged/2_MERGED_ALL.json")

const loadJsonFiles = (folderPath: string) => {
  const mergedCBContent = fs.readFileSync(mergedCBPath, "utf-8")

  const combinedArray = CrunchbaseScrappedItemsSchema.parse(JSON.parse(mergedCBContent))

  const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(".json"))

  files.forEach((file) => {
    const filePath = path.join(folderPath, file)
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const parsedData = ManualEntriesSchema.parse(JSON.parse(fileContent))

    log(`Static File ${file} has ${parsedData.length} rows`)

    for (const newRow of parsedData) {
      const siteExists = combinedArray.some((row) => {
        return newRow.ws && cleanWebsite(newRow.ws) === cleanWebsite(row.ws)
      })

      if (siteExists) {
        error(`Skipping Duplicate website ${newRow.ws} for ${newRow.name}`)
        continue
      } else {
        combinedArray.push(newRow)
      }

      // if (newRow.ws && urls.has(newRow.ws)) {
      //   parsedData
      //     .filter((row) => row.id === newRow.id)
      //     .forEach((row) => {
      //       // only show if not identical but ignore changes to cbRank
      //       const row1 = { ...row, cbRank: undefined };
      //       const row2 = { ...newRow, cbRank: undefined };

      //       if (JSON.stringify(row1) !== JSON.stringify(row2)) {
      //         error(`Duplicate id: ${newRow.id}`, row);
      //       }
      //     });

      //   continue;
      // }

      // urls.add(newRow.id);

      // const existingIndex = combinedArray.findIndex((existingObj) =>
      //   areDuplicates(existingObj, newRow),
      // );

      // if (existingIndex !== -1) {
      //   combinedArray[existingIndex] = mergeObjects(
      //     combinedArray[existingIndex],
      //     newRow,
      //   );
      // } else {
      //   combinedArray.push(newRow);
      // }
    }
  })

  const deDubeArray = combinedArray.flatMap((row) => {
    row.li = cleanWebsite(row.li)
    row.ws = cleanWebsite(row.ws)
    row.fb = cleanWebsite(row.fb)
    row.tw = cleanWebsite(row.tw)

    const { id } = row

    if (manualDeleteIds.includes(id)) return []

    // const dubName = tmpArr.find((row) => row.name === name);
    // const dubWebsite = tmpArr.find((row) => row.ws === ws && ws);
    // const dubFb = tmpArr.find((row) => row.fb === fb && fb);
    // const dubLi = tmpArr.find((row) => row.li === li && li);
    // const dubTw = tmpArr.find((row) => row.tw === tw && tw);

    // if (dubNameWebsite) {
    //   error(`Duplicate name and website: ${row.name} ${row.ws}`, {
    //     li1: row.li,
    //     li2: dubNameWebsite.li,
    //     tw1: row.tw,
    //     tw2: dubNameWebsite.tw,
    //     reasons1: row.reasons,
    //     reasons2: dubNameWebsite.reasons,
    //   });
    //   return [];
    // } else

    // if (dubName) {
    //   error(`Duplicate name: ${row.name}`, {
    //     li1: row.li,
    //     li2: dubName.li,
    //     ws1: row.ws,
    //     ws2: dubName.ws,
    //     tw1: row.tw,
    //     tw2: dubName.tw,
    //     reasons1: row.reasons,
    //     reasons2: dubName.reasons,
    //   });
    //   return [];
    // } else
    // if (dubWebsite) {
    //   error(`Duplicate website: ${row.ws}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubWebsite.name,
    //     liIgnored: row.li,
    //     liSaved: dubWebsite.li,
    //     fbIgnored: row.fb,
    //     fbSaved: dubWebsite.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubWebsite.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubWebsite.reasons,
    //   });

    //   // return [];
    // } else if (dubFb) {
    //   error(`Duplicate Facebook: ${row.fb}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubFb.name,
    //     liIgnored: row.li,
    //     liSaved: dubFb.li,
    //     twIgnored: row.tw,
    //     twSaved: dubFb.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubFb.reasons,
    //   });
    //   // return [];
    // } else if (dubLi) {
    //   error(`Duplicate LinkedIn: ${row.li}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubLi.name,
    //     fbIgnored: row.fb,
    //     fbSaved: dubLi.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubLi.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubLi.reasons,
    //   });
    //   // return [];
    // } else if (dubTw) {
    //   error(`Duplicate Twitter: ${row.tw}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubTw.name,
    //     fbIgnored: row.fb,
    //     fbSaved: dubTw.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubTw.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubTw.reasons,
    //   });
    //   // return [];
    // } else {
    // tmpArr.push(row);

    return [row]
    // }
  })

  // Helper to remove protocol from URLs
  const removeProtocol = (url: string | undefined): string | undefined => {
    if (!url) return url
    return url.replace(/^https?:\/\//, "")
  }

  // Helper to set field on object using proper typing
  const setField = (obj: MergedDataItem, field: LinkField, value: string | undefined) => {
    if (field === "ws") obj.ws = value
    else if (field === "li") obj.li = value
    else if (field === "fb") obj.fb = value
    else if (field === "tw") obj.tw = value
    else if (field === "ig") obj.ig = value
    else if (field === "gh") obj.gh = value
    else if (field === "ytp") obj.ytp = value
    else if (field === "ytc") obj.ytc = value
    else if (field === "tt") obj.tt = value
    else if (field === "th") obj.th = value
  }

  // First pass: normalize URLs and apply overrides (including arrays)
  const processedItems: MergedDataItem[] = []
  const additionalItems: MergedDataItem[] = []

  for (const row of deDubeArray) {
    row.tw = row.tw?.replace("www.twitter.com", "x.com")?.replace("twitter.com", "x.com")

    row.li = row.li?.replace("/company-beta/", "/company/")

    if (row.ws) {
      row.ws = getMainDomain(row.ws)
    }

    row.ws = removeProtocol(row.ws)
    row.li = removeProtocol(row.li)
    row.fb = removeProtocol(row.fb)
    row.tw = removeProtocol(row.tw)

    const override = manualOverrides[row.name]

    if (override) {
      // Apply override, but exclude the processed state flags, urls field, and alt field (used only in final.ts)
      const excludeKeys = new Set(["_processed", "urls", "alt"])
      const overrideFields = Object.fromEntries(Object.entries(override).filter(([key]) => !excludeKeys.has(key)))
      const hasOverrideFields = Object.keys(overrideFields).length > 0

      if (!hasOverrideFields) {
        // No override fields means processed with no changes - skip
        processedItems.push(row)
        continue
      }

      // Process each override field, handling arrays
      const updatedRow: MergedDataItem = { ...row }

      // Apply name override first if present (before logging)
      if (overrideFields.name && typeof overrideFields.name === "string") {
        updatedRow.name = overrideFields.name
      }

      log(`Manually updated ${updatedRow.name}`)
      const linkFields: LinkField[] = ["ws", "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"]

      for (const field of linkFields) {
        const overrideValue = overrideFields[field]
        if (overrideValue === undefined) continue

        if (Array.isArray(overrideValue)) {
          // Update original with first element
          if (overrideValue.length > 0) {
            const firstUrl = overrideValue[0]
            if (typeof firstUrl === "string") {
              setField(updatedRow, field, removeProtocol(firstUrl))
            }
          }

          // Create new minimal entries for remaining elements
          for (let i = 1; i < overrideValue.length; i++) {
            const url = overrideValue[i]
            if (!url || url === "" || typeof url !== "string") continue

            try {
              const identifier = extractIdentifier(url, field)
              const newId = `${row.id}_manual_${field}_${identifier}`

              const newItem: MergedDataItem = {
                id: newId,
                name: row.name,
                reasons: row.reasons
              }
              setField(newItem, field, removeProtocol(url))

              additionalItems.push(newItem)
              log(`Created new entry: ${newId} for ${field}: ${url}`)
            } catch (e) {
              error(`Failed to extract identifier from ${url} for ${row.name}: ${e}`)
              throw e
            }
          }
        } else if (typeof overrideValue === "string") {
          // Single string value - apply normally, remove protocol
          setField(updatedRow, field, removeProtocol(overrideValue))
        }
      }

      // Apply other non-link override fields
      // Skip link fields as they're already handled above
      for (const [key, value] of Object.entries(overrideFields)) {
        // Skip special fields
        if (key === "_processed" || key === "urls" || key === "alt") {
          continue
        }

        // Skip name (already handled above)
        if (key === "name") {
          continue
        }

        // Skip link fields (already handled in linkFields loop above)
        if (
          key === "ws" ||
          key === "li" ||
          key === "fb" ||
          key === "tw" ||
          key === "ig" ||
          key === "gh" ||
          key === "ytp" ||
          key === "ytc" ||
          key === "tt" ||
          key === "th"
        ) {
          continue
        }

        // Hard fail if key doesn't exist in the row object (invalid property)
        // Allow android_dev_id and android_app_ids even if not in current row (they're optional schema fields)
        const validOptionalFields = ["android_dev_id", "android_app_ids"]
        if (!(key in updatedRow) && !validOptionalFields.includes(key)) {
          const validKeys = Object.keys(updatedRow).join(", ")
          error(`Unexpected override key "${key}" for ${row.name}. Valid keys: ${validKeys}`)
          throw new Error(`Invalid override key "${key}" for ${row.name}`)
        }

        Object.assign(updatedRow, { [key]: value })
      }

      // Remove protocol from override-applied URLs
      // Note: ig, gh, ytp, ytc, tt, and th are handled through linkFields loop above with protocol already removed
      updatedRow.ws = updatedRow.ws?.replace(/^https?:\/\//, "")
      updatedRow.li = updatedRow.li?.replace(/^https?:\/\//, "")
      updatedRow.fb = updatedRow.fb?.replace(/^https?:\/\//, "")
      updatedRow.tw = updatedRow.tw?.replace(/^https?:\/\//, "")

      processedItems.push(updatedRow)
    } else {
      processedItems.push(row)
    }
  }

  // Process manualAdditions - add new items or enrich existing ones
  // The first URL of each field is kept on a single base entry, and extra URLs
  // are emitted as separate minimal entries (similar to manualOverrides handling).
  for (const addition of manualAdditions) {
    const existingIndex = processedItems.findIndex((item) => item.name === addition.name)

    // Type guard to check if addition has ManualOverrideFields
    const hasFields = (item: typeof addition): item is typeof addition & { reasons?: string[] } => {
      return typeof item === "object" && item !== null && "name" in item
    }

    if (!hasFields(addition)) {
      continue
    }

    // Extract and validate reasons first (shared across all entries)
    const reasons: valuesOfListOfReasons[] = []
    if ("reasons" in addition && Array.isArray(addition.reasons)) {
      for (const r of addition.reasons) {
        try {
          const validatedReason = APIListOfReasonsSchema.parse(r)
          reasons.push(validatedReason)
        } catch {
          error(`Invalid reason "${r}" for manualAddition "${addition.name}"`)
          throw new Error(`Invalid reason in manualAddition "${addition.name}"`)
        }
      }
    }

    const linkFields: LinkField[] = ["ws", "li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"]
    const toUrlArray = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value.filter((url): url is string => typeof url === "string" && url.trim() !== "")
      }
      if (typeof value === "string" && value.trim() !== "") {
        return [value]
      }
      return []
    }

    // Extract non-link fields that should be preserved on base entries
    // Note: alt field is handled separately in final.ts, not here
    const android_dev_id = "android_dev_id" in addition ? addition.android_dev_id : undefined
    const android_app_ids = "android_app_ids" in addition ? addition.android_app_ids : undefined

    // Helper to safely get field value from addition
    const getFieldValue = (field: LinkField): unknown => {
      if (field === "ws") return "ws" in addition ? addition.ws : undefined
      if (field === "li") return "li" in addition ? addition.li : undefined
      if (field === "fb") return "fb" in addition ? addition.fb : undefined
      if (field === "tw") return "tw" in addition ? addition.tw : undefined
      if (field === "ig") return "ig" in addition ? addition.ig : undefined
      if (field === "gh") return "gh" in addition ? addition.gh : undefined
      if (field === "ytp") return "ytp" in addition ? addition.ytp : undefined
      if (field === "ytc") return "ytc" in addition ? addition.ytc : undefined
      if (field === "tt") return "tt" in addition ? addition.tt : undefined
      if (field === "th") return "th" in addition ? addition.th : undefined
      return undefined
    }

    // Build a map of link fields to arrays for easier processing
    const fieldUrls = new Map<LinkField, string[]>()
    for (const field of linkFields) {
      const value = getFieldValue(field)
      const urls = toUrlArray(value)
      if (urls.length > 0) {
        fieldUrls.set(field, urls)
      }
    }

    if (fieldUrls.size === 0) {
      error(`Failed to create any entries for manualAddition "${addition.name}" - no valid URLs found`)
      throw new Error(`Cannot create manualAddition "${addition.name}" without a valid URL`)
    }

    // Enrich existing item if it exists, otherwise create a new base entry
    if (existingIndex !== -1) {
      const existingItem = processedItems[existingIndex]

      if (!existingItem) {
        error(`Existing item not found for manualAddition "${addition.name}"`)
        throw new Error(`Cannot create manualAddition "${addition.name}" without a valid existing item`)
      }

      const updatedItem: MergedDataItem = { ...existingItem }

      // Merge reasons
      updatedItem.reasons = Array.from(new Set([...(existingItem.reasons || []), ...reasons]))

      // Carry android fields to the base entry
      if (android_dev_id) {
        updatedItem.android_dev_id = android_dev_id
      }
      if (android_app_ids) {
        updatedItem.android_app_ids = android_app_ids
      }

      for (const [field, urls] of fieldUrls.entries()) {
        const [firstUrl, ...rest] = urls
        if (firstUrl) {
          setField(updatedItem, field, removeProtocol(firstUrl))
        }

        for (const url of rest) {
          try {
            const identifier = extractIdentifier(url, field)
            const newId = `${existingItem.id}_manual_${field}_${identifier}`
            const newItem: MergedDataItem = {
              id: newId,
              name: existingItem.name,
              reasons: updatedItem.reasons
            }
            setField(newItem, field, removeProtocol(url))
            additionalItems.push(newItem)
            log(`Created new entry from manualAddition: ${newId} for ${field}: ${url}`)
          } catch (e) {
            error(`Failed to extract identifier from ${url} for ${addition.name}: ${e}`)
            throw e
          }
        }
      }

      processedItems[existingIndex] = updatedItem
      log(`Merged manualAddition "${addition.name}" into existing item with ${fieldUrls.size} field(s)`)
      continue
    }

    // New base entry (not present in scraped data)
    const primaryEntry = Array.from<[LinkField, string[]]>(fieldUrls.entries())[0]
    if (!primaryEntry) {
      error(`Primary entry missing for manualAddition "${addition.name}"`)
      throw new Error(`Cannot create manualAddition "${addition.name}" without a primary URL`)
    }

    const [primaryField, primaryUrls] = primaryEntry
    if (!primaryUrls) {
      throw new Error(`Cannot create manualAddition "${addition.name}" without primaryUrls`)
    }
    if (!primaryField) {
      throw new Error(`Cannot create manualAddition "${addition.name}" without primaryUrls`)
    }
    const primaryUrl = primaryUrls[0]

    if (!primaryUrl) {
      error(`Primary URL missing for manualAddition "${addition.name}"`)
      throw new Error(`Cannot create manualAddition "${addition.name}" without a primary URL`)
    }

    let primaryIdentifier: string
    try {
      primaryIdentifier = extractIdentifier(primaryUrl, primaryField)
    } catch (e) {
      error(`Failed to extract identifier from primary URL ${primaryUrl} for ${addition.name}: ${e}`)
      throw e
    }

    const baseId = `manual_${primaryField}_${primaryIdentifier}`
    const baseItem: MergedDataItem = {
      id: baseId,
      name: addition.name,
      reasons,
      ...(android_dev_id ? { android_dev_id } : {}),
      ...(android_app_ids ? { android_app_ids } : {})
    }

    // Apply first URLs to the base entry
    for (const [field, urls] of fieldUrls.entries()) {
      const [firstUrl] = urls
      if (firstUrl) {
        setField(baseItem, field, removeProtocol(firstUrl))
      }
    }

    processedItems.push(baseItem)

    // Create additional entries for extra URLs (without carrying android fields)
    for (const [field, urls] of fieldUrls.entries()) {
      const [, ...rest] = urls
      for (const url of rest) {
        try {
          const identifier = extractIdentifier(url, field)
          const generatedId = `manual_${field}_${identifier}`
          const newItem: MergedDataItem = {
            id: generatedId,
            name: addition.name,
            reasons
          }
          setField(newItem, field, removeProtocol(url))
          additionalItems.push(newItem)
          log(`Created new entry: ${generatedId} for ${field}: ${url}`)
        } catch (e) {
          error(`Failed to create entry for ${field} URL "${url}" in manualAddition "${addition.name}": ${e}`)
          throw e
        }
      }
    }

    log(
      `Added manualAddition: ${addition.name} - base entry created with ${fieldUrls.size} field(s) and ${
        additionalItems.length
      } extra URL(s) so far`
    )
  }

  // Combine processed items with additional items
  const manuallyUpdatedArray = [...processedItems, ...additionalItems]

  const sortedArray = manuallyUpdatedArray.sort((a, b) => a.name.localeCompare(b.name))

  saveJsonToFile(sortedArray, outputFilePath)
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`)

  return sortedArray
}

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    log(`JSON size: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`)

    // Ensure directory exists
    const dir = path.dirname(outputFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Atomic write: write to temp file, then rename
    const tempPath = `${outputFilePath}.tmp`

    // Remove temp file if it exists from previous failed attempt
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }

    fs.writeFileSync(tempPath, jsonString, "utf-8")
    log(`Temp file written: ${tempPath}`)

    // Remove old file if exists
    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath)
    }

    // Rename temp to final
    fs.renameSync(tempPath, outputFilePath)
    log(`Data successfully written to ${outputFilePath}`)
  } catch (err) {
    error(`Failed to write ${outputFilePath}:`, err)
    if (err instanceof Error) {
      error(`Error name: ${err.name}`)
      error(`Error message: ${err.message}`)
      error(`Error stack: ${err.stack}`)
    }
    throw err
  }
}

// function areDuplicates(
//   row1: CrunchbaseScrappedItemType,
//   row2: CrunchbaseScrappedItemType,
// ): boolean {
//   const keysToCompare: (keyof CrunchbaseScrappedItemType)[] = [
//     // "name",
//     "id",
//     "li",
//     "ws",
//     "fb",
//     "tw",
//   ];
//   return keysToCompare.some(
//     (key) => row1[key] && row2[key] && row1[key] === row2[key],
//   );
// }

export async function run() {
  return loadJsonFiles(folderPath)
}

import fs from "fs"
import path from "path"
import {
  APIListOfReasonsSchema,
  BlacklistSchema,
  type APIListOfReasonsValues,
  type BlacklistItem
} from "@theWallProject/common"

import { manualOverrides } from "./manual_resolve/manualOverrides"

/**
 * Generates Android blacklist.json from manualOverrides.ts
 * Extracts entries with android_dev_id or android_app_ids and their reasons from the final database
 */
export async function generateAndroidBlacklist() {
  // Read the final database to get reasons for each company
  const finalDbPath = path.join(__dirname, "../../results/4_final/ALL.json")
  if (!fs.existsSync(finalDbPath)) {
    throw new Error(`Final database not found at ${finalDbPath}. Run the scrapper build first.`)
  }

  const finalDbContent = fs.readFileSync(finalDbPath, "utf-8")
  const finalDb: Array<{ n: string; r: string[] }> = JSON.parse(finalDbContent)

  // Create a map of company name to reasons for quick lookup
  const reasonsMap = new Map<string, APIListOfReasonsValues[]>()
  for (const item of finalDb) {
    // Validate all reasons - fail immediately if any reason is invalid
    const validReasons: APIListOfReasonsValues[] = []
    for (const r of item.r) {
      // This will throw immediately if validation fails
      const validatedReason = APIListOfReasonsSchema.parse(r)
      validReasons.push(validatedReason)
    }
    if (validReasons.length > 0) {
      reasonsMap.set(item.n, validReasons)
    }
  }

  const blacklist: BlacklistItem[] = []

  // Iterate through manualOverrides and extract Android entries
  for (const [companyName, override] of Object.entries(manualOverrides)) {
    // Skip processed-only entries
    if (override && typeof override === "object" && "_processed" in override && Object.keys(override).length === 1) {
      continue
    }

    if (!override || typeof override !== "object") {
      continue
    }

    const androidDevId = "android_dev_id" in override ? override.android_dev_id : undefined
    const androidAppIds = "android_app_ids" in override ? override.android_app_ids : undefined

    // Skip if no Android fields
    if (!androidDevId && (!androidAppIds || androidAppIds.length === 0)) {
      continue
    }

    // Get reasons from final database
    const reasonIds = reasonsMap.get(companyName)
    if (!reasonIds || reasonIds.length === 0) {
      console.warn(`⚠️  No reasons found for ${companyName}, skipping`)
      continue
    }

    // Build blacklist item - ensure at least one of androidDevId or androidAppIds is present
    const item: Record<string, unknown> = {
      reasonIds
    }

    if (androidDevId) {
      item.androidDevId = androidDevId
    }

    if (androidAppIds && androidAppIds.length > 0) {
      item.androidAppIds = androidAppIds
    }

    // Validate the item before adding (Zod will ensure at least one of androidDevId or androidAppIds is present)
    // Use the schema's element type by parsing a single-item array
    // This will throw immediately if validation fails
    const validatedArray = BlacklistSchema.parse([item])
    const validatedItem = validatedArray[0]
    if (validatedItem === undefined) {
      throw new Error(`Unexpected: validated item is undefined for ${companyName}`)
    }
    blacklist.push(validatedItem)
  }

  // Sort by androidDevId or first androidAppId for consistent output
  blacklist.sort((a, b) => {
    const aKey =
      a.androidDevId ??
      ("androidAppIds" in a && Array.isArray(a.androidAppIds) && a.androidAppIds.length > 0
        ? a.androidAppIds[0]
        : "") ??
      ""
    const bKey =
      b.androidDevId ??
      ("androidAppIds" in b && Array.isArray(b.androidAppIds) && b.androidAppIds.length > 0
        ? b.androidAppIds[0]
        : "") ??
      ""
    return aKey.localeCompare(bKey)
  })

  // Validate against schema - this will throw immediately if validation fails
  BlacklistSchema.parse(blacklist)

  // Write to Android assets directory
  const outputPath = path.join(__dirname, "../../../android/app/src/main/assets/blacklist.json")
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, JSON.stringify(blacklist, null, 2) + "\n")
  console.log(`✅ Generated blacklist.json with ${blacklist.length} entries at ${outputPath}`)
}

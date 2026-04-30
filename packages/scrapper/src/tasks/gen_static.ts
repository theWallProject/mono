import path from "path"
import { formatAndWrite } from "@theWallProject/common"

import { cleanWebsite, log } from "../helper"
import { Hints } from "../static_data/hints"
import { CompressedManualItemSchema, ManualEntriesType } from "../types"

const outputFilePath = path.join(__dirname, "../../results/1_batches/static/MANUAL.json")

const SOCIAL_LINK_FIELDS = ["li", "fb", "tw", "ig", "gh", "ytp", "ytc", "tt", "th"] as const

const injectStaticRows = async () => {
  const merged: ManualEntriesType = []
  log("Starting injectStaticRows - processing Hints")

  log(`Processing ${Hints.length} hint items`)
  for (const item of Hints) {
    const safeItem = CompressedManualItemSchema.parse(item)

    const {
      name,
      reasons,
      ws,
      isHint,
      hintText,
      hintUrl,
      hintCompanyId,
      hint_android_id,
      android_dev_id,
      android_app_ids,
      android_curated_app_ids
    } = safeItem

    if (!isHint) continue

    // Android-targeting fields are emitted on the first/canonical entry per company only.
    // Subsequent split entries (one per social-media URL) match by URL and don't need to
    // re-carry the package-id metadata — the runtime resolves apps via .find() against
    // ALL.json, so a single matching entry per dev is sufficient.
    let androidFieldsEmitted = false
    const consumeAndroidFields = () => {
      if (androidFieldsEmitted) return {}
      androidFieldsEmitted = true
      return {
        ...(hint_android_id ? { hint_android_id } : {}),
        ...(android_dev_id ? { android_dev_id } : {}),
        ...(android_app_ids ? { android_app_ids } : {}),
        ...(android_curated_app_ids ? { android_curated_app_ids } : {})
      }
    }

    // Process websites
    for (const [index, website] of ws.entries()) {
      const _website = cleanWebsite(website)
      if (!_website) {
        console.error(`Website is empty: ${website}`)
        throw new Error("Website is empty")
      }

      merged.push({
        name,
        reasons: reasons ?? [],
        ws: _website,
        id: `hint_ws_${name}_${index}`,
        isHint: true,
        hintText,
        hintUrl,
        ...(hintCompanyId ? { hintCompanyId } : {}),
        ...consumeAndroidFields()
      })
    }

    // Process every social-media link field uniformly.
    for (const field of SOCIAL_LINK_FIELDS) {
      const urls = safeItem[field]
      if (!urls) continue

      for (const [index, url] of urls.entries()) {
        const cleaned = cleanWebsite(url)
        if (!cleaned) continue

        merged.push({
          name,
          reasons: reasons ?? [],
          [field]: cleaned,
          id: `hint_${field}_${name}_${index}`,
          isHint: true,
          hintText,
          hintUrl,
          ...(hintCompanyId ? { hintCompanyId } : {}),
          ...consumeAndroidFields()
        })
      }
    }
  }
  log(`Processed ${merged.length} total items (Hints)`)

  const sortedArray = merged.sort((a, b) => a.name.localeCompare(b.name))

  await saveJsonToFile(sortedArray, outputFilePath)
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`)

  return sortedArray
}

const saveJsonToFile = async (data: string | object, outputFilePath: string) => {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    log(`JSON size: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`)

    // Write with atomic write and prettier formatting
    await formatAndWrite(outputFilePath, data, { atomic: true, parser: "json" })
    log(`Data successfully written to ${outputFilePath}`)
  } catch (err) {
    console.error(`Failed to write ${outputFilePath}:`, err)
    if (err instanceof Error) {
      console.error(`Error name: ${err.name}`)
      console.error(`Error message: ${err.message}`)
      console.error(`Error stack: ${err.stack}`)
    }
    throw err
  }
}

export async function run() {
  await injectStaticRows()
}

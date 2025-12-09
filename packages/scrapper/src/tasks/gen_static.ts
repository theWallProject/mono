import fs from "fs"
import path from "path"

import { cleanWebsite, log } from "../helper"
import { Hints } from "../static_data/hints"
import { CompressedManualItemSchema, ManualEntriesType } from "../types"

const outputFilePath = path.join(__dirname, "../../results/1_batches/static/MANUAL.json")

const injectStaticRows = () => {
  const merged: ManualEntriesType = []
  log("Starting injectStaticRows - processing Hints")

  // Process Hints items
  log(`Processing ${Hints.length} hint items`)
  for (const item of Hints) {
    const safeItem = CompressedManualItemSchema.parse(item)

    const { name, reasons, ws, isHint, hintText, hintUrl, hint_android_id, android_dev_id, android_app_ids } = safeItem

    // Only process items with isHint flag
    if (isHint) {
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
          hintText: hintText,
          hintUrl: hintUrl,
          ...(hint_android_id ? { hint_android_id } : {}),
          ...(android_dev_id ? { android_dev_id } : {}),
          ...(android_app_ids ? { android_app_ids } : {})
        })
      }
    }
  }
  log(`Processed ${merged.length} total items (Hints)`)

  const sortedArray = merged.sort((a, b) => a.name.localeCompare(b.name))

  saveJsonToFile(sortedArray, outputFilePath)
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`)

  return sortedArray
}

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8")
  log(`Data successfully written to ${outputFilePath}`)
}

export async function run() {
  injectStaticRows()
}

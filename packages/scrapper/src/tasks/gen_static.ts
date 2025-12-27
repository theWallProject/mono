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
  injectStaticRows()
}

import fs from "fs"
import path from "path"
import { FinalDBFileType, formatAndWrite, type LinkField } from "@theWallProject/common"
import { z } from "zod"

import { log } from "../helper"
import { DBFileNames, MergedDataFileSchema, NetworksFlatItemsSchema } from "../types"
import { manualAdditions } from "./manual_resolve/manualAdditions"
import { manualOverrides } from "./manual_resolve/manualOverrides"

const folderPath = path.join(__dirname, "../../results/3_networks")
const mergedDataPath = path.join(__dirname, "../../results/2_merged/2_MERGED_ALL.json")

const outputFilePath = path.join(__dirname, `../../results/4_final/${DBFileNames.ALL}.json`)

const loadJsonFiles = async (folderPath: string) => {
  // Load merged data to get stock symbol, hints, and Android fields
  const mergedDataContent = fs.readFileSync(mergedDataPath, "utf-8")
  const mergedData = MergedDataFileSchema.parse(JSON.parse(mergedDataContent))
  const mergedDataMap = new Map(mergedData.map((item) => [item.id, item]))
  log(`Loaded ${mergedData.length} items from merged data`)

  const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(".json"))

  let combinedArray: FinalDBFileType[] = []
  const idRecord: Record<string, FinalDBFileType> = {}

  files.forEach((file) => {
    const filePath = path.join(folderPath, file)
    const fileContent = fs.readFileSync(filePath, "utf-8")

    const parsedData = z.array(NetworksFlatItemsSchema).parse(JSON.parse(fileContent))

    log(`File ${file} has ${parsedData.length} rows`)
    const key = keyFromFileName(file)

    for (const newRow of parsedData) {
      const testRow = idRecord[newRow.id]
      const mergedItem = mergedDataMap.get(newRow.id)

      if (testRow) {
        const existingRow = idRecord[newRow.id]
        if (existingRow === undefined) {
          throw new Error(`Unexpected: testRow exists but idRecord[${newRow.id}] is undefined`)
        }
        // @ts-expect-error -- key is LinkField but FinalDBFileType doesn't include "il" (only used as a last-resort result key, not a database field)
        existingRow[key] = newRow.selector
      } else {
        idRecord[newRow.id] = {
          id: newRow.id,
          r: newRow.reasons,
          n: newRow.name,
          [key]: newRow.selector,
          // Add fields from merged data if available
          ...(mergedItem?.stock_symbol ? { s: mergedItem.stock_symbol } : {}),
          ...(mergedItem?.isHint ? { isHint: true } : {}),
          ...(mergedItem?.hintText ? { hintText: mergedItem.hintText } : {}),
          ...(mergedItem?.hintUrl ? { hintUrl: mergedItem.hintUrl } : {}),
          ...(mergedItem?.hintCompanyId ? { hintCompanyId: mergedItem.hintCompanyId } : {}),
          ...(mergedItem?.hint_android_id ? { hint_android_id: mergedItem.hint_android_id } : {}),
          ...(mergedItem?.android_dev_id ? { android_dev_id: mergedItem.android_dev_id } : {}),
          ...(mergedItem?.android_app_ids ? { android_app_ids: mergedItem.android_app_ids } : {}),
          ...(mergedItem?.android_curated_app_ids
            ? { android_curated_app_ids: mergedItem.android_curated_app_ids }
            : {}),
          ...(mergedItem?.proof_text ? { proof_text: mergedItem.proof_text } : {}),
          ...(mergedItem?.proof_link ? { proof_link: mergedItem.proof_link } : {})
        }
      }
    }
  })

  log(`Combined data has ${Object.keys(idRecord).length} unique ids`)
  combinedArray = Object.values(idRecord)

  // Create a map of manualAdditions by name for quick lookup
  const manualAdditionsMap = new Map(manualAdditions.map((item) => [item.name, item]))

  combinedArray = combinedArray.map((item) => {
    // Check manualOverrides first
    const override = manualOverrides[item.n]
    let alt = override && typeof override === "object" && "alt" in override ? override.alt : undefined

    // Check manualAdditions if not found in manualOverrides
    if (!alt) {
      const addition = manualAdditionsMap.get(item.n)
      alt = addition && typeof addition === "object" && "alt" in addition ? addition.alt : undefined
    }

    if (alt) {
      item.alt = alt
    }

    return item
  })

  const sortedArray = combinedArray.sort((a, b) => a.n.localeCompare(b.n))

  await saveJsonToFile(sortedArray, outputFilePath)
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`)
}

const saveJsonToFile = async (data: string | object, outputFilePath: string) => {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    log(`Final JSON size: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`)

    // Write with atomic write and prettier formatting
    await formatAndWrite(outputFilePath, data, { atomic: true, parser: "json" })
    log(`Final data successfully written to ${outputFilePath}`)

    // Copy ALL.json to all destinations right after it's generated
    const allJsonPath = outputFilePath

    // Copy to addon
    const addonTarget = path.join(__dirname, `../../../addon/src/db/ALL.json`)
    const addonDir = path.dirname(addonTarget)
    if (!fs.existsSync(addonDir)) {
      fs.mkdirSync(addonDir, { recursive: true })
    }
    fs.copyFileSync(allJsonPath, addonTarget)
    log(`Copied ALL.json to addon: ${addonTarget}`)

    // Copy to Android assets
    const androidTarget = path.join(__dirname, `../../../android/app/src/main/assets/ALL.json`)
    const androidDir = path.dirname(androidTarget)
    if (!fs.existsSync(androidDir)) {
      fs.mkdirSync(androidDir, { recursive: true })
    }
    fs.copyFileSync(allJsonPath, androidTarget)
    log(`Copied ALL.json to Android assets: ${androidTarget}`)

    // Copy to telegram-bot
    const telegramTarget = path.join(__dirname, `../../../telegram-bot/db/ALL.json`)
    const telegramDir = path.dirname(telegramTarget)
    if (!fs.existsSync(telegramDir)) {
      fs.mkdirSync(telegramDir, { recursive: true })
    }
    fs.copyFileSync(allJsonPath, telegramTarget)
    log(`Copied ALL.json to telegram-bot: ${telegramTarget}`)
  } catch (err) {
    console.error(`Failed to write or copy ${outputFilePath}:`, err)
    if (err instanceof Error) {
      console.error(`Error name: ${err.name}`)
      console.error(`Error message: ${err.message}`)
      console.error(`Error stack: ${err.stack}`)
    }
    throw err
  }
}

export async function run() {
  return await loadJsonFiles(folderPath)
}
function keyFromFileName(fileName: string): LinkField {
  switch (fileName.split(".")[0]) {
    case DBFileNames.FLAGGED_FACEBOOK:
      return "fb"
    case DBFileNames.FLAGGED_LI_COMPANY:
      return "li"
    case DBFileNames.FLAGGED_TWITTER:
      return "tw"
    case DBFileNames.WEBSITES:
      return "ws"
    case DBFileNames.FLAGGED_INSTAGRAM:
      return "ig"
    case DBFileNames.FLAGGED_GITHUB:
      return "gh"
    case DBFileNames.FLAGGED_YOUTUBE_PROFILE:
      return "ytp"
    case DBFileNames.FLAGGED_YOUTUBE_CHANNEL:
      return "ytc"
    case DBFileNames.FLAGGED_TIKTOK:
      return "tt"
    case DBFileNames.FLAGGED_THREADS:
      return "th"

    default:
      throw new Error(`Unknown file name: ${fileName}`)
  }
}

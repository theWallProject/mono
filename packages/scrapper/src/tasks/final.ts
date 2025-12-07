import fs from "fs"
import path from "path"
import { FinalDBFileType, type LinkField } from "@theWallProject/common"
import { z } from "zod"

import alternatives from "../../src/static_data/alternatives.json"
import { log } from "../helper"
import { DBFileNames, NetworksFlatItemsSchema } from "../types"

const folderPath = path.join(__dirname, "../../results/3_networks")

const outputFilePath = path.join(__dirname, `../../results/4_final/${DBFileNames.ALL}.json`)

const loadJsonFiles = (folderPath: string) => {
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

      if (testRow) {
        const existingRow = idRecord[newRow.id]
        if (existingRow === undefined) {
          throw new Error(`Unexpected: testRow exists but idRecord[${newRow.id}] is undefined`)
        }
        // @ts-expect-error -- key is LinkField but FinalDBFileType doesn't include "il", which is fine since scrapper never uses "il"
        existingRow[key] = newRow.selector
        if (newRow.s) {
          existingRow["s"] = newRow.s
        }
        if (newRow.isHint) {
          existingRow["isHint"] = true
        }
        if (newRow.hintText) {
          existingRow["hintText"] = newRow.hintText
        }
        if (newRow.hintUrl) {
          existingRow["hintUrl"] = newRow.hintUrl
        }
        if (newRow.hint_android_id) {
          existingRow["hint_android_id"] = newRow.hint_android_id
        }
        if (newRow.android_dev_id) {
          existingRow["android_dev_id"] = newRow.android_dev_id
        }
        if (newRow.android_app_ids) {
          existingRow["android_app_ids"] = newRow.android_app_ids
        }
      } else {
        idRecord[newRow.id] = {
          id: newRow.id,
          r: newRow.reasons,
          n: newRow.name,
          s: newRow.s,
          // ws: "",
          [key]: newRow.selector,
          // c: newRow;
          ...(newRow.isHint ? { isHint: true } : {}),
          ...(newRow.hintText ? { hintText: newRow.hintText } : {}),
          ...(newRow.hintUrl ? { hintUrl: newRow.hintUrl } : {}),
          ...(newRow.hint_android_id ? { hint_android_id: newRow.hint_android_id } : {}),
          ...(newRow.android_dev_id ? { android_dev_id: newRow.android_dev_id } : {}),
          ...(newRow.android_app_ids ? { android_app_ids: newRow.android_app_ids } : {})
        }
      }
    }
  })

  log(`Combined data has ${Object.keys(idRecord).length} unique ids`)
  combinedArray = Object.values(idRecord)

  combinedArray = combinedArray.map((item) => {
    // @ts-expect-error -- ok here
    const alt = alternatives[item.id]

    if (alt) {
      item.alt = alt
    }

    return item
  })

  const sortedArray = combinedArray.sort((a, b) => a.n.localeCompare(b.n))

  saveJsonToFile(sortedArray, outputFilePath)
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`)
}

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8")
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
}

export async function run() {
  return loadJsonFiles(folderPath)
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

import path from "path"
import { formatAndWrite } from "@theWallProject/common"

import { cleanWebsite, log } from "../helper"
import { Hints } from "../static_data/hints"
import { CompressedManualItemSchema, ManualEntriesType } from "../types"

const outputFilePath = path.join(__dirname, "../../results/1_batches/static/MANUAL.json")

const injectStaticRows = async () => {
  const merged: ManualEntriesType = []
  log("Starting injectStaticRows - processing Hints")

  // Process Hints items
  log(`Processing ${Hints.length} hint items`)
  for (const item of Hints) {
    const safeItem = CompressedManualItemSchema.parse(item)

    const {
      name,
      reasons,
      ws,
      li,
      fb,
      tw,
      ig,
      gh,
      ytp,
      ytc,
      tt,
      th,
      isHint,
      hintText,
      hintUrl,
      hint_android_id,
      android_dev_id,
      android_app_ids
    } = safeItem

    // Only process items with isHint flag
    if (isHint) {
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
          hintText: hintText,
          hintUrl: hintUrl,
          ...(hint_android_id ? { hint_android_id } : {}),
          ...(android_dev_id ? { android_dev_id } : {}),
          ...(android_app_ids ? { android_app_ids } : {})
        })
      }

      // Process LinkedIn
      if (li) {
        for (const [index, linkedin] of li.entries()) {
          const cleanLi = cleanWebsite(linkedin)
          if (cleanLi) {
            merged.push({
              name,
              reasons: reasons ?? [],
              li: cleanLi,
              id: `hint_li_${name}_${index}`,
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

      // Process Facebook
      if (fb) {
        for (const [index, facebook] of fb.entries()) {
          const cleanFb = cleanWebsite(facebook)
          if (cleanFb) {
            merged.push({
              name,
              reasons: reasons ?? [],
              fb: cleanFb,
              id: `hint_fb_${name}_${index}`,
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

      // Process Twitter
      if (tw) {
        for (const [index, twitter] of tw.entries()) {
          const cleanTw = cleanWebsite(twitter)
          if (cleanTw) {
            merged.push({
              name,
              reasons: reasons ?? [],
              tw: cleanTw,
              id: `hint_tw_${name}_${index}`,
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

      // Process Instagram
      if (ig) {
        for (const [index, instagram] of ig.entries()) {
          const cleanIg = cleanWebsite(instagram)
          if (cleanIg) {
            merged.push({
              name,
              reasons: reasons ?? [],
              ig: cleanIg,
              id: `hint_ig_${name}_${index}`,
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

      // Process GitHub
      if (gh) {
        for (const [index, github] of gh.entries()) {
          const cleanGh = cleanWebsite(github)
          if (cleanGh) {
            merged.push({
              name,
              reasons: reasons ?? [],
              gh: cleanGh,
              id: `hint_gh_${name}_${index}`,
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

      // Process YouTube Profile
      if (ytp) {
        for (const [index, youtubeProfile] of ytp.entries()) {
          const cleanYtp = cleanWebsite(youtubeProfile)
          if (cleanYtp) {
            merged.push({
              name,
              reasons: reasons ?? [],
              ytp: cleanYtp,
              id: `hint_ytp_${name}_${index}`,
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

      // Process YouTube Channel
      if (ytc) {
        for (const [index, youtubeChannel] of ytc.entries()) {
          const cleanYtc = cleanWebsite(youtubeChannel)
          if (cleanYtc) {
            merged.push({
              name,
              reasons: reasons ?? [],
              ytc: cleanYtc,
              id: `hint_ytc_${name}_${index}`,
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

      // Process TikTok
      if (tt) {
        for (const [index, tiktok] of tt.entries()) {
          const cleanTt = cleanWebsite(tiktok)
          if (cleanTt) {
            merged.push({
              name,
              reasons: reasons ?? [],
              tt: cleanTt,
              id: `hint_tt_${name}_${index}`,
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

      // Process Threads
      if (th) {
        for (const [index, threads] of th.entries()) {
          const cleanTh = cleanWebsite(threads)
          if (cleanTh) {
            merged.push({
              name,
              reasons: reasons ?? [],
              th: cleanTh,
              id: `hint_th_${name}_${index}`,
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

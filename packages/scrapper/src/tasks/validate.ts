import fs from "fs"
import path from "path"

import { error, log } from "../helper"
import { APIScrapperFileDataSchema, ScrappedFileType } from "../types"

type ValidationResult = {
  url: string
  result: string | number
}

const inputFilePath = path.join(
  __dirname,
  "../../results/2_merged/1_MERGED_CB.json"
)

const outputFilePath = path.join(
  __dirname,
  "../../results/2_merged/report.json"
)

const validateUrl = async (url: string): Promise<ValidationResult> => {
  if (!url) {
    throw new Error("URL is empty or undefined")
  }

  try {
    if (!url.startsWith("http")) {
      url = `https://${url}`
    }
    log(`Validating URL: ${url}`)

    const response = await fetch(url, {
      redirect: "manual" // Don't follow redirects automatically
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      return {
        url,
        result: location || `${response.status}`
      }
    }

    return {
      url,
      result: response.status
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error(`Error validating URL ${url}:`, e.code || e.message)
    return {
      url: url,
      result: `error ${e instanceof Error ? e.message : "Unknown error"}`
    }
  }
}

const validateUrls = async (data: ScrappedFileType) => {
  const results: ValidationResult[] = []
  let processed = 0
  const total = data.length

  for (const item of data) {
    const { li, ws, fb, tw } = item

    processed++
    if (processed % 10 === 0) {
      log(`Progress: ${processed}/${total}`)
    }

    // Validate each URL type
    if (ws) results.push(await validateUrl(ws))
    if (li) results.push(await validateUrl(li))
    if (fb) results.push(await validateUrl(fb))
    if (tw) results.push(await validateUrl(tw))
  }

  return results
}

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8")
  log(`Data successfully written to ${outputFilePath}`)
}

export async function run() {
  try {
    const fileContent = fs.readFileSync(inputFilePath, "utf-8")
    const data = APIScrapperFileDataSchema.parse(JSON.parse(fileContent))

    log(`Starting URL validation for ${data.length} entries...`)
    const results = await validateUrls(data)

    saveJsonToFile(results, outputFilePath)
    log(`Validation complete. Results saved to ${outputFilePath}`)
  } catch (err) {
    error("Error during validation:", err)
    throw err
  }
}

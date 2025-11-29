// import fs from "fs";
// import path from "path";
import mergedall from "../../results/2_merged/2_MERGED_ALL.json"
import alt from "../../src/static_data/alternatives.json"
import { log, warn } from "../helper"
import { APIScrapperFileDataSchema } from "../types"

const report = () => {
  const merged = APIScrapperFileDataSchema.parse(mergedall)
  const top = merged.filter(
    (item) => item.cbRank && item.reasons && item.reasons.includes("h")
  )
  const sortedArray = top
    .sort((a, b) => Number(a.cbRank) - Number(b.cbRank))
    .slice(0, 10)

  log(sortedArray)

  for (const item of sortedArray) {
    // @ts-expect-error -- ok here
    const alternative = alt[item.id]
    if (!alternative) {
      warn(`Company ${item.id} is missing alternatives`)
    }
  }
}

export async function run() {
  report()
}

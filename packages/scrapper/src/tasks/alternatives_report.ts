// import fs from "fs";
// import path from "path";
import mergedall from "../../results/2_merged/2_MERGED_ALL.json"
import { warn } from "../helper"
import { MergedDataFileSchema } from "../types"
import { manualOverrides } from "./manual_resolve/manualOverrides"

const report = () => {
  // Validate merged data structure (includes ig/gh/ytp/ytc/tt/th from manual overrides)
  // This will throw immediately if validation fails
  const merged = MergedDataFileSchema.parse(mergedall)
  const top = merged.filter((item) => item.cbRank && item.reasons && item.reasons.includes("h"))
  const sortedArray = top.sort((a, b) => Number(a.cbRank) - Number(b.cbRank)).slice(0, 10)

  // log(sortedArray)

  for (const item of sortedArray) {
    const override = manualOverrides[item.name]
    const alternative = override && typeof override === "object" && "alt" in override ? override.alt : undefined
    if (!alternative) {
      warn(`Company ${item.id} is missing alternatives`)
    }
  }
}

export async function run() {
  report()
}

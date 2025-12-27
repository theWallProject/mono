import path from "path"
import { formatAndWrite } from "@theWallProject/common"

import { log } from "../helper"
import BIT from "../static_data/external/buyIsraeliTech.json"
import { BuyIsraeliTechSchema, ManualEntriesType } from "../types"

const outputFilePath = path.join(__dirname, "../../results/1_batches/static/BUY_ISR_TECH.json")

const injectStaticRows = async () => {
  const merged: ManualEntriesType = []
  const SafeBIT = BuyIsraeliTechSchema.parse(BIT)

  for (const item of SafeBIT) {
    const { Name, Link, IsraelRelation } = item
    if (IsraelRelation === "HQ" && typeof Link === "string") {
      merged.push({
        name: Name,
        reasons: ["h"],
        ws: Link,
        id: `BIT_${Name}`
      })
    } else {
      // todo: add satellite office
    }
  }

  const sortedArray = merged.sort((a, b) => a.name.localeCompare(b.name))

  await saveJsonToFile(sortedArray, outputFilePath)
  log(`BIT: Wrote ${sortedArray.length} rows to ${outputFilePath}...`)

  return sortedArray
}

const saveJsonToFile = async (data: string | object, outputFilePath: string) => {
  await formatAndWrite(outputFilePath, data, { parser: "json" })
  log(`BIT Data successfully written to ${outputFilePath}`)
}

export async function run() {
  await injectStaticRows()
}

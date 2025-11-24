import fs from "fs";
import path from "path";
import { BuyIsraeliTechSchema, ScrappedFileType } from "../types";
import { log } from "../helper";
import BIT from "../static_data/external/buyIsraeliTech.json";

const outputFilePath = path.join(
  __dirname,
  "../../results/1_batches/static/BUY_ISR_TECH.json",
);

const injectStaticRows = () => {
  const merged: ScrappedFileType = [];
  const SafeBIT = BuyIsraeliTechSchema.parse(BIT);

  for (const item of SafeBIT) {
    const { Name, Link, IsraelRelation } = item;
    if (IsraelRelation === "HQ" && typeof Link === "string") {
      merged.push({
        name: Name,
        reasons: ["h"],
        ws: Link,
        id: `BIT_${Name}`,
      });
    } else {
      // todo: add satellite office
    }
  }

  const sortedArray = merged.sort((a, b) => a.name.localeCompare(b.name));

  saveJsonToFile(sortedArray, outputFilePath);
  log(`BIT: Wrote ${sortedArray.length} rows to ${outputFilePath}...`);

  return sortedArray;
};

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8");
  log(`BIT Data successfully written to ${outputFilePath}`);
};

export async function run() {
  injectStaticRows();
}

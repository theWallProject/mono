import fs from "fs";
import path from "path";
import { ScrappedItemType, APIScrapperFileDataSchema } from "../types";
import { log, warn } from "../helper";

const folderPath = path.join(__dirname, "../../results/1_batches/cb");

const outputFilePath = path.join(
  __dirname,
  "../../results/2_merged/1_MERGED_CB.json",
);

const loadJsonFiles = (folderPath: string) => {
  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".json"));

  let combinedArray: ScrappedItemType[] = [];
  const duplicates: Record<string, ScrappedItemType[]> = {};

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const parsedData = APIScrapperFileDataSchema.parse(JSON.parse(fileContent));
    log(`File ${file} has ${parsedData.length} rows`);

    for (const newRow of parsedData) {
      const previousRows = duplicates[newRow.id];

      if (Array.isArray(previousRows)) {
        const isDuplicate = previousRows.some(
          (existingRow) =>
            JSON.stringify({ ...existingRow, cbRank: undefined }) ===
            JSON.stringify({ ...newRow, cbRank: undefined }),
        );

        if (!isDuplicate) {
          previousRows.push(newRow);
        }
        continue;
      } else {
        duplicates[newRow.id] = [newRow];
        combinedArray.push(newRow);
      }
    }
  });

  for (const [id, rows] of Object.entries(duplicates)) {
    if (rows.length > 1) {
      warn(`Duplicate ids: ${id}`);

      let merged = rows[0];

      for (const row of rows) {
        merged = mergeObjects(merged, row);
      }

      combinedArray.splice(
        combinedArray.findIndex((item) => item.id === id),
        1,
        merged,
      );
    }
  }

  const sortedArray = combinedArray.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  saveJsonToFile(sortedArray, outputFilePath);
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`);
};

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8");
  log(`Data successfully written to ${outputFilePath}`);
};

export async function run() {
  return loadJsonFiles(folderPath);
}

function mergeObjects(
  obj1: ScrappedItemType,
  obj2: ScrappedItemType,
): ScrappedItemType {
  const merged: ScrappedItemType = { ...obj1 };

  // Type guard helper
  const isScrappedItemKey = (key: string): key is keyof ScrappedItemType => {
    return key in obj1;
  };

  for (const key of Object.keys(obj2)) {
    if (!isScrappedItemKey(key)) {
      continue;
    }
    if (
      key === "reasons"
      // Array.isArray(obj2Value) &&
      // Array.isArray(obj1Value)
    ) {
      // Merge reasons arrays and remove duplicates

      merged.reasons = Array.from(new Set([...merged[key], ...obj2[key]]));
    } else if (!obj2[key] || obj2[key] === "") {
      // Skip empty fields in obj2
      continue;
    } else if (!merged[key] || merged[key] === "") {
      // Fill empty fields in obj1
      // @ts-expect-error -- fix later
      merged[key] = obj2[key];
    }
  }

  return merged;
}

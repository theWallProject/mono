import fs from "fs";
import path from "path";
import { log } from "../helper";
import {
  APIEndpointDomainsResultSchema,
  DBFileNames,
  FinalDBFileType,
} from "@theWallProject/common";
import { z } from "zod";
import alternatives from "../../src/static_data/alternatives.json";
import { LinkField } from "./validate_urls";

const folderPath = path.join(__dirname, "../../results/3_networks");

const outputFilePath = path.join(
  __dirname,
  `../../results/4_final/${DBFileNames.ALL}.json`,
);

const loadJsonFiles = (folderPath: string) => {
  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".json"));

  let combinedArray: FinalDBFileType[] = [];
  const idRecord: Record<string, FinalDBFileType> = {};

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const parsedData = z
      .array(APIEndpointDomainsResultSchema)
      .parse(JSON.parse(fileContent));

    log(`File ${file} has ${parsedData.length} rows`);
    const key = keyFromFileName(file);

    for (const newRow of parsedData) {
      let testRow = idRecord[newRow.id];

      if (testRow) {
        idRecord[newRow.id][key] = newRow.selector;
        if (newRow.s) {
          idRecord[newRow.id]["s"] = newRow.s;
        }
        if (newRow.hint) {
          idRecord[newRow.id]["hint"] = true;
        }
        if (newRow.hintText) {
          idRecord[newRow.id]["hintText"] = newRow.hintText;
        }
        if (newRow.hintUrl) {
          idRecord[newRow.id]["hintUrl"] = newRow.hintUrl;
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
          ...(newRow.hint ? { hint: true } : {}),
          ...(newRow.hintText ? { hintText: newRow.hintText } : {}),
          ...(newRow.hintUrl ? { hintUrl: newRow.hintUrl } : {}),
        };
      }
    }
  });

  log(`Combined data has ${Object.keys(idRecord).length} unique ids`);
  combinedArray = Object.values(idRecord);

  combinedArray = combinedArray.map((item) => {
    // @ts-expect-error -- ok here
    const alt = alternatives[item.id];

    if (alt) {
      item.alt = alt;
    }

    return item;
  });

  const sortedArray = combinedArray.sort((a, b) => a.n.localeCompare(b.n));

  saveJsonToFile(sortedArray, outputFilePath);
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`);
};

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8");
  log(`Final data successfully written to ${outputFilePath}`);
};

export async function run() {
  return loadJsonFiles(folderPath);
}
function keyFromFileName(fileName: string): LinkField {
  switch (fileName.split(".")[0]) {
    case DBFileNames.FLAGGED_FACEBOOK:
      return "fb";
    case DBFileNames.FLAGGED_LI_COMPANY:
      return "li";
    case DBFileNames.FLAGGED_TWITTER:
      return "tw";
    case DBFileNames.WEBSITES:
      return "ws";
    case DBFileNames.FLAGGED_INSTAGRAM:
      return "ig";
    case DBFileNames.FLAGGED_GITHUB:
      return "gh";
    case DBFileNames.FLAGGED_YOUTUBE_PROFILE:
      return "ytp";
    case DBFileNames.FLAGGED_YOUTUBE_CHANNEL:
      return "ytc";
    case DBFileNames.FLAGGED_TIKTOK:
      return "tt";
    case DBFileNames.FLAGGED_THREADS:
      return "th";

    default:
      throw new Error(`Unknown file name: ${fileName}`);
  }
}

import fs from "fs";
import path from "path";
import { format } from "prettier";
import {
  APIEndpointDomains,
  APIEndpointDomainsResult,
  DBFileNames,
} from "@theWallProject/common";
import { APIScrapperFileDataSchema, ScrappedFileType } from "../types";
import { error, log, warn } from "../helper";

const outputFilePath = path.join(
  __dirname,
  `../../results/3_networks/${DBFileNames.WEBSITES}.json`,
);

export const run = async (merged: ScrappedFileType) => {
  const mergedDB = APIScrapperFileDataSchema.parse(merged);
  const duplicates: Record<string, APIEndpointDomainsResult[]> = {};

  const db = mergedDB
    .filter((row) => row.ws && row.ws !== "")
    .filter((row) => {
      const website = row.ws;

      let shouldKeep = false;

      if (website) {
        const domain = website
          .replace("https://", "")
          .replace("http://", "")
          .replace("www.", "")
          .split("/")[0];

        shouldKeep = !(
          domain.includes("google.com") ||
          domain.includes("business.site") ||
          domain.includes(".steampowered") ||
          domain.includes("meetup") ||
          domain.includes(".apple.com") ||
          domain.endsWith(".il")
        );

        if (!shouldKeep) {
          if (!domain.endsWith(".il")) {
            warn(`Website excluded ${website} => ${domain}`);
          }
        }
      }

      return shouldKeep;
    });

  const result: APIEndpointDomains = [];

  for (const row of db) {
    const website = row.ws;

    if (!website) {
      error(row);
      throw new Error("Website is empty");
    }

    const domain = website
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .split("/")[0];

    // if (domain.split(".").length > 2) {
    //   // warn(`Website Domain extracted ${website} => ${domain}`);
    // } else {
    //   // log(`Website Domain extracted ${website} => ${domain}`);
    // }
    const previousRows = duplicates[domain];

    const websiteResult = {
      id: row.id,
      selector: domain,
      name: row.name,
      reasons: row.reasons,
      ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
      ...(row.isHint ? { hint: true } : {}),
      ...(row.hintText ? { hintText: row.hintText } : {}),
      ...(row.hintUrl ? { hintUrl: row.hintUrl } : {}),
    };
    if (Array.isArray(previousRows)) {
      // error(`Duplicate domain [flagged]: ${domain} of website ${website}`);
      // const isDuplicate = previousRows.some(
      //   (existingRow) =>
      //     JSON.stringify({ ...existingRow, cbRank: undefined }) ===
      //     JSON.stringify({ ...newRow, cbRank: undefined }),
      // );

      // if (!isDuplicate) {
      previousRows.push(websiteResult);
      // }
      continue;
    } else {
      duplicates[domain] = [websiteResult];

      result.push(websiteResult);
    }
  }

  // to merge different reasons
  for (const [domain, rows] of Object.entries(duplicates)) {
    if (rows.length > 1) {
      warn(`Duplicate flagged domain: ${domain}`);

      let merged = rows[0];

      for (const row of rows) {
        merged = mergeObjects(merged, row);
      }
      result.splice(
        result.findIndex((row) => row.selector === merged.selector),
        1,
        merged,
      );
    }
  }

  fs.writeFileSync(
    outputFilePath,
    await format(
      JSON.stringify(
        result.sort((a, b) => a.selector.localeCompare(b.selector)),
        null,
        2,
      ),
      { parser: "json" },
    ),
    "utf-8",
  );

  log(`Wrote ${mergedDB.length} rows...`);
};

function mergeObjects(
  obj1: APIEndpointDomainsResult,
  obj2: APIEndpointDomainsResult,
): APIEndpointDomainsResult {
  const merged: APIEndpointDomainsResult = { ...obj1 };

  // Merge reasons arrays and remove duplicates
  merged.reasons = Array.from(new Set([...merged.reasons, ...obj2.reasons]));

  // Merge other fields
  if (obj2.selector && (!merged.selector || merged.selector === "")) {
    merged.selector = obj2.selector;
  }
  if (obj2.id && (!merged.id || merged.id === "")) {
    merged.id = obj2.id;
  }
  if (obj2.name && (!merged.name || merged.name === "")) {
    merged.name = obj2.name;
  }
  if (obj2.s && (!merged.s || merged.s === "")) {
    merged.s = obj2.s;
  }
  if (obj2.hint !== undefined) {
    merged.hint = obj2.hint;
  }
  if (obj2.hintText && (!merged.hintText || merged.hintText === "")) {
    merged.hintText = obj2.hintText;
  }
  if (obj2.hintUrl && (!merged.hintUrl || merged.hintUrl === "")) {
    merged.hintUrl = obj2.hintUrl;
  }

  return merged;
}

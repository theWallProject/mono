import fs from "fs";
import path from "path";
import {
  getMainDomain,
  API_ENDPOINT_RULE_LINKEDIN_COMPANY,
  API_ENDPOINT_RULE_FACEBOOK,
  API_ENDPOINT_RULE_TWITTER,
  API_ENDPOINT_RULE_INSTAGRAM,
  API_ENDPOINT_RULE_GITHUB,
  API_ENDPOINT_RULE_YOUTUBE_PROFILE,
  API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
  API_ENDPOINT_RULE_TIKTOK,
  API_ENDPOINT_RULE_THREADS,
} from "@theWallProject/common";
import { APIScrapperFileDataSchema, ScrappedItemType } from "../types";
import { log, cleanWebsite, error } from "../helper";
import { manualDeleteIds } from "./manual_resolve/manualDeleteIds";
import { manualOverrides } from "./manual_resolve/manualOverrides";
import { LinkField } from "./validate_urls";

// Type for items that may have ig/gh/ytp/ytc/tt/th from manual overrides (not in base ScrappedItemType)
type ScrappedItemWithOverrides = ScrappedItemType & {
  ig?: string;
  gh?: string;
  ytp?: string;
  ytc?: string;
  tt?: string;
  th?: string;
};

// Helper to extract identifier from URL for ID generation
const extractIdentifier = (url: string, field: LinkField): string => {
  if (field === "ws") {
    // For websites, use domain (match extract_websites.ts logic)
    const domain = url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .replace(/\./g, "_");
    return domain;
  } else if (field === "li") {
    const regex = new RegExp(API_ENDPOINT_RULE_LINKEDIN_COMPANY.regex);
    const results = regex.exec(url);
    if (!results || !results[1]) {
      throw new Error(`Failed to extract LinkedIn identifier from: ${url}`);
    }
    return results[1].replace(/\//g, "_");
  } else if (field === "fb") {
    const regex = new RegExp(API_ENDPOINT_RULE_FACEBOOK.regex);
    const normalizedUrl = url.replace("/pg/", "/").replace("/p/", "/");
    const results = regex.exec(normalizedUrl);
    if (!results || !results[1]) {
      throw new Error(`Failed to extract Facebook identifier from: ${url}`);
    }
    return results[1].replace(/\//g, "_");
  } else if (field === "tw") {
    const regex = new RegExp(API_ENDPOINT_RULE_TWITTER.regex);
    const results = regex.exec(url);
    if (!results || !results[1]) {
      throw new Error(`Failed to extract Twitter identifier from: ${url}`);
    }
    return results[1].replace(/\//g, "_");
  } else if (field === "ig") {
    const regex = new RegExp(API_ENDPOINT_RULE_INSTAGRAM.regex);
    const results = regex.exec(url);
    if (!results || !results[1]) {
      throw new Error(`Failed to extract Instagram identifier from: ${url}`);
    }
    return results[1].replace(/\//g, "_");
  } else if (field === "gh") {
    const regex = new RegExp(API_ENDPOINT_RULE_GITHUB.regex);
    const results = regex.exec(url);
    if (!results || !results[1]) {
      throw new Error(`Failed to extract GitHub identifier from: ${url}`);
    }
    return results[1].replace(/\//g, "_");
  } else if (field === "ytp") {
    const regex = new RegExp(API_ENDPOINT_RULE_YOUTUBE_PROFILE.regex);
    const results = regex.exec(url);
    if (!results || !results[1]) {
      throw new Error(
        `Failed to extract YouTube Profile identifier from: ${url}`,
      );
    }
    return results[1].replace(/\//g, "_");
  } else if (field === "ytc") {
    const regex = new RegExp(API_ENDPOINT_RULE_YOUTUBE_CHANNEL.regex);
    const results = regex.exec(url);
    if (!results || !results[1]) {
      throw new Error(
        `Failed to extract YouTube Channel identifier from: ${url}`,
      );
    }
    return results[1].replace(/\//g, "_");
  } else if (field === "tt") {
    const regex = new RegExp(API_ENDPOINT_RULE_TIKTOK.regex);
    const results = regex.exec(url);
    if (!results || !results[1]) {
      throw new Error(`Failed to extract TikTok identifier from: ${url}`);
    }
    return results[1].replace(/\//g, "_");
  } else if (field === "th") {
    const regex = new RegExp(API_ENDPOINT_RULE_THREADS.regex);
    const results = regex.exec(url);
    if (!results || !results[1]) {
      throw new Error(`Failed to extract Threads identifier from: ${url}`);
    }
    return results[1].replace(/\//g, "_");
  }
  throw new Error(`Unknown field: ${field}`);
};
// import MERGED_CB from "../../results/2_merged/1_MERGED_CB.json";

const folderPath = path.join(__dirname, "../../results/1_batches/static");
const mergedCBPath = path.join(
  __dirname,
  "../../results/2_merged/1_MERGED_CB.json",
);

const outputFilePath = path.join(
  __dirname,
  "../../results/2_merged/2_MERGED_ALL.json",
);

const loadJsonFiles = (folderPath: string) => {
  const mergedCBContent = fs.readFileSync(mergedCBPath, "utf-8");

  let combinedArray = APIScrapperFileDataSchema.parse(
    JSON.parse(mergedCBContent),
  );

  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".json"));

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsedData = APIScrapperFileDataSchema.parse(JSON.parse(fileContent));

    log(`Static File ${file} has ${parsedData.length} rows`);

    for (const newRow of parsedData) {
      const siteExists = combinedArray.some((row) => {
        return newRow.ws && cleanWebsite(newRow.ws) === cleanWebsite(row.ws);
      });

      if (siteExists) {
        error(`Skipping Duplicate website:`, newRow);
        continue;
      } else {
        combinedArray.push(newRow);
      }

      // if (newRow.ws && urls.has(newRow.ws)) {
      //   parsedData
      //     .filter((row) => row.id === newRow.id)
      //     .forEach((row) => {
      //       // only show if not identical but ignore changes to cbRank
      //       const row1 = { ...row, cbRank: undefined };
      //       const row2 = { ...newRow, cbRank: undefined };

      //       if (JSON.stringify(row1) !== JSON.stringify(row2)) {
      //         error(`Duplicate id: ${newRow.id}`, row);
      //       }
      //     });

      //   continue;
      // }

      // urls.add(newRow.id);

      // const existingIndex = combinedArray.findIndex((existingObj) =>
      //   areDuplicates(existingObj, newRow),
      // );

      // if (existingIndex !== -1) {
      //   combinedArray[existingIndex] = mergeObjects(
      //     combinedArray[existingIndex],
      //     newRow,
      //   );
      // } else {
      //   combinedArray.push(newRow);
      // }
    }
  });

  const deDubeArray = combinedArray.flatMap((row) => {
    row.li = cleanWebsite(row.li);
    row.ws = cleanWebsite(row.ws);
    row.fb = cleanWebsite(row.fb);
    row.tw = cleanWebsite(row.tw);

    const { id } = row;

    if (manualDeleteIds.includes(id)) return [];

    // const dubName = tmpArr.find((row) => row.name === name);
    // const dubWebsite = tmpArr.find((row) => row.ws === ws && ws);
    // const dubFb = tmpArr.find((row) => row.fb === fb && fb);
    // const dubLi = tmpArr.find((row) => row.li === li && li);
    // const dubTw = tmpArr.find((row) => row.tw === tw && tw);

    // if (dubNameWebsite) {
    //   error(`Duplicate name and website: ${row.name} ${row.ws}`, {
    //     li1: row.li,
    //     li2: dubNameWebsite.li,
    //     tw1: row.tw,
    //     tw2: dubNameWebsite.tw,
    //     reasons1: row.reasons,
    //     reasons2: dubNameWebsite.reasons,
    //   });
    //   return [];
    // } else

    // if (dubName) {
    //   error(`Duplicate name: ${row.name}`, {
    //     li1: row.li,
    //     li2: dubName.li,
    //     ws1: row.ws,
    //     ws2: dubName.ws,
    //     tw1: row.tw,
    //     tw2: dubName.tw,
    //     reasons1: row.reasons,
    //     reasons2: dubName.reasons,
    //   });
    //   return [];
    // } else
    // if (dubWebsite) {
    //   error(`Duplicate website: ${row.ws}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubWebsite.name,
    //     liIgnored: row.li,
    //     liSaved: dubWebsite.li,
    //     fbIgnored: row.fb,
    //     fbSaved: dubWebsite.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubWebsite.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubWebsite.reasons,
    //   });

    //   // return [];
    // } else if (dubFb) {
    //   error(`Duplicate Facebook: ${row.fb}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubFb.name,
    //     liIgnored: row.li,
    //     liSaved: dubFb.li,
    //     twIgnored: row.tw,
    //     twSaved: dubFb.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubFb.reasons,
    //   });
    //   // return [];
    // } else if (dubLi) {
    //   error(`Duplicate LinkedIn: ${row.li}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubLi.name,
    //     fbIgnored: row.fb,
    //     fbSaved: dubLi.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubLi.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubLi.reasons,
    //   });
    //   // return [];
    // } else if (dubTw) {
    //   error(`Duplicate Twitter: ${row.tw}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubTw.name,
    //     fbIgnored: row.fb,
    //     fbSaved: dubTw.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubTw.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubTw.reasons,
    //   });
    //   // return [];
    // } else {
    // tmpArr.push(row);

    return [row];
    // }
  });

  // First pass: normalize URLs and apply overrides (including arrays)
  const processedItems: ScrappedItemWithOverrides[] = [];
  const additionalItems: ScrappedItemWithOverrides[] = [];

  for (const row of deDubeArray) {
    row.tw = row.tw
      ?.replace("www.twitter.com", "x.com")
      ?.replace("twitter.com", "x.com");

    row.li = row.li?.replace("/company-beta/", "/company/");

    if (row.ws) {
      row.ws = getMainDomain(row.ws);
    }

    // Remove https:// and http:// from all URL fields
    const removeProtocol = (url: string | undefined): string | undefined => {
      if (!url) return url;
      return url.replace(/^https?:\/\//, "");
    };

    row.ws = removeProtocol(row.ws);
    row.li = removeProtocol(row.li);
    row.fb = removeProtocol(row.fb);
    row.tw = removeProtocol(row.tw);

    const override = manualOverrides[row.name];

    if (override) {
      // Apply override, but exclude the processed state flags and urls field
      const excludeKeys = new Set(["_processed", "urls"]);
      const overrideFields = Object.fromEntries(
        Object.entries(override).filter(([key]) => !excludeKeys.has(key)),
      );
      const hasOverrideFields = Object.keys(overrideFields).length > 0;

      if (!hasOverrideFields) {
        // No override fields means processed with no changes - skip
        processedItems.push(row);
        continue;
      }

      // Process each override field, handling arrays
      const updatedRow: ScrappedItemWithOverrides = { ...row };

      // Apply name override first if present (before logging)
      if (overrideFields.name && typeof overrideFields.name === "string") {
        updatedRow.name = overrideFields.name;
      }

      log(`Manually updated ${updatedRow.name}`);
      const linkFields: LinkField[] = [
        "ws",
        "li",
        "fb",
        "tw",
        "ig",
        "gh",
        "ytp",
        "ytc",
        "tt",
        "th",
      ];

      // Helper to remove protocol from URLs
      const removeProtocol = (url: string | undefined): string | undefined => {
        if (!url) return url;
        return url.replace(/^https?:\/\//, "");
      };

      // Helper to set field on object using proper typing
      const setField = (
        obj: ScrappedItemWithOverrides,
        field: LinkField,
        value: string | undefined,
      ) => {
        if (field === "ws") obj.ws = value;
        else if (field === "li") obj.li = value;
        else if (field === "fb") obj.fb = value;
        else if (field === "tw") obj.tw = value;
        else if (field === "ig") obj.ig = value;
        else if (field === "gh") obj.gh = value;
        else if (field === "ytp") obj.ytp = value;
        else if (field === "ytc") obj.ytc = value;
        else if (field === "tt") obj.tt = value;
        else if (field === "th") obj.th = value;
      };

      for (const field of linkFields) {
        const overrideValue = overrideFields[field];
        if (overrideValue === undefined) continue;

        if (Array.isArray(overrideValue)) {
          // Update original with first element
          if (overrideValue.length > 0) {
            const firstUrl = overrideValue[0];
            if (typeof firstUrl === "string") {
              setField(updatedRow, field, removeProtocol(firstUrl));
            }
          }

          // Create new minimal entries for remaining elements
          for (let i = 1; i < overrideValue.length; i++) {
            const url = overrideValue[i];
            if (!url || url === "" || typeof url !== "string") continue;

            try {
              const identifier = extractIdentifier(url, field);
              const newId = `${row.id}_manual_${field}_${identifier}`;

              const newItem: ScrappedItemWithOverrides = {
                id: newId,
                name: row.name,
                reasons: row.reasons,
              };
              setField(newItem, field, removeProtocol(url));

              additionalItems.push(newItem);
              log(`Created new entry: ${newId} for ${field}: ${url}`);
            } catch (e) {
              error(
                `Failed to extract identifier from ${url} for ${row.name}: ${e}`,
              );
              throw e;
            }
          }
        } else if (typeof overrideValue === "string") {
          // Single string value - apply normally, remove protocol
          setField(updatedRow, field, removeProtocol(overrideValue));
        }
      }

      // Apply other non-link override fields
      // Skip link fields as they're already handled above
      for (const [key, value] of Object.entries(overrideFields)) {
        // Skip special fields
        if (key === "_processed" || key === "urls") {
          continue;
        }

        // Skip name (already handled above)
        if (key === "name") {
          continue;
        }

        // Skip link fields (already handled in linkFields loop above)
        if (
          key === "ws" ||
          key === "li" ||
          key === "fb" ||
          key === "tw" ||
          key === "ig" ||
          key === "gh" ||
          key === "ytp" ||
          key === "ytc" ||
          key === "tt" ||
          key === "th"
        ) {
          continue;
        }

        // Hard fail if key doesn't exist in the row object (invalid property)
        if (!(key in updatedRow)) {
          const validKeys = Object.keys(updatedRow).join(", ");
          error(
            `Unexpected override key "${key}" for ${row.name}. Valid keys: ${validKeys}`,
          );
          throw new Error(`Invalid override key "${key}" for ${row.name}`);
        }

        Object.assign(updatedRow, { [key]: value });
      }

      // Remove protocol from override-applied URLs
      // Note: ig, gh, ytp, ytc, tt, and th are handled through linkFields loop above with protocol already removed
      updatedRow.ws = updatedRow.ws?.replace(/^https?:\/\//, "");
      updatedRow.li = updatedRow.li?.replace(/^https?:\/\//, "");
      updatedRow.fb = updatedRow.fb?.replace(/^https?:\/\//, "");
      updatedRow.tw = updatedRow.tw?.replace(/^https?:\/\//, "");

      processedItems.push(updatedRow);
    } else {
      processedItems.push(row);
    }
  }

  // Combine processed items with additional items
  const manuallyUpdatedArray = [...processedItems, ...additionalItems];

  const sortedArray = manuallyUpdatedArray.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  saveJsonToFile(sortedArray, outputFilePath);
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`);

  return sortedArray;
};

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8");
  log(`Data successfully written to ${outputFilePath}`);
};

// function areDuplicates(
//   row1: ScrappedItemType,
//   row2: ScrappedItemType,
// ): boolean {
//   const keysToCompare: (keyof ScrappedItemType)[] = [
//     // "name",
//     "id",
//     "li",
//     "ws",
//     "fb",
//     "tw",
//   ];
//   return keysToCompare.some(
//     (key) => row1[key] && row2[key] && row1[key] === row2[key],
//   );
// }

export async function run() {
  return loadJsonFiles(folderPath);
}

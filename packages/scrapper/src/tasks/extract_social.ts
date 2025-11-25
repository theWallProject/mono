import fs from "fs";
import path from "path";
import {
  APIEndpointDomains,
  API_ENDPOINT_RULE_LINKEDIN_COMPANY,
  API_ENDPOINT_RULE_FACEBOOK,
  API_ENDPOINT_RULE_TWITTER,
  API_ENDPOINT_RULE_INSTAGRAM,
  API_ENDPOINT_RULE_GITHUB,
  API_ENDPOINT_RULE_YOUTUBE_PROFILE,
  API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
  API_ENDPOINT_RULE_TIKTOK,
  API_ENDPOINT_RULE_THREADS,
  DBFileNames,
} from "@theWallProject/common";
import { APIScrapperFileDataSchema, ScrappedFileType } from "../types";
import { error, log, warn } from "../helper";

// Type for merged data that may include ig/gh/ytp/ytc/tt/th from manual overrides
type MergedDataItem = ScrappedFileType[number] & {
  ig?: string;
  gh?: string;
  ytp?: string;
  ytc?: string;
  tt?: string;
  th?: string;
};

const extractSocialLinks = (data: MergedDataItem[]) => {
  const linkedinFlagged: APIEndpointDomains = [];
  const facebookFlagged: APIEndpointDomains = [];
  const twitterFlagged: APIEndpointDomains = [];
  const instagramFlagged: APIEndpointDomains = [];
  const githubFlagged: APIEndpointDomains = [];
  const youtubeProfileFlagged: APIEndpointDomains = [];
  const youtubeChannelFlagged: APIEndpointDomains = [];
  const tiktokFlagged: APIEndpointDomains = [];
  const threadsFlagged: APIEndpointDomains = [];

  const regexLinkedin = new RegExp(API_ENDPOINT_RULE_LINKEDIN_COMPANY.regex);
  const regexFacebook = new RegExp(API_ENDPOINT_RULE_FACEBOOK.regex);
  const regexTwitter = new RegExp(API_ENDPOINT_RULE_TWITTER.regex);
  const regexInstagram = new RegExp(API_ENDPOINT_RULE_INSTAGRAM.regex);
  const regexGitHub = new RegExp(API_ENDPOINT_RULE_GITHUB.regex);
  const regexYouTubeProfile = new RegExp(
    API_ENDPOINT_RULE_YOUTUBE_PROFILE.regex,
    "i",
  );
  const regexYouTubeChannel = new RegExp(
    API_ENDPOINT_RULE_YOUTUBE_CHANNEL.regex,
    "i",
  );
  const regexTikTok = new RegExp(API_ENDPOINT_RULE_TIKTOK.regex);
  const regexThreads = new RegExp(API_ENDPOINT_RULE_THREADS.regex);

  // const namesMap: { [key: string]: boolean } = {};
  const websitesMap: { [key: string]: boolean } = {};
  const fbMap: { [key: string]: boolean } = {};
  const liMap: { [key: string]: boolean } = {};
  const twitterMap: { [key: string]: boolean } = {};
  const instagramMap: { [key: string]: boolean } = {};
  const githubMap: { [key: string]: boolean } = {};
  const youtubeProfileMap: { [key: string]: boolean } = {};
  const youtubeChannelMap: { [key: string]: boolean } = {};
  const tiktokMap: { [key: string]: boolean } = {};
  const threadsMap: { [key: string]: boolean } = {};

  data.forEach((row) => {
    const { name, ws, li, fb, tw, reasons, id, ig, gh, ytp, ytc, tt, th } = row;

    // if (namesMap[name]) {
    //   error(`Duplicate name [social]: ${row.name}`);
    // } else {
    //   namesMap[row.name] = true;
    // }

    if (ws) {
      if (websitesMap[ws]) {
        error(`Duplicate website [social]: ${row.ws}`);
      } else {
        websitesMap[ws] = true;
      }
    }

    if (li && li !== "") {
      const results = regexLinkedin.exec(li);
      const result = results && results[1];

      if (result) {
        // log(`LinkedIn processing ${li} => ${result}`);

        if (liMap[result]) {
          error(`Duplicate LinkedIn [social]: ${result}`);
        } else {
          liMap[result] = true;
          linkedinFlagged.push({
            selector: result,
            name: name,
            id: row.id,
            reasons: reasons,
            ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
          });
        }
      } else {
        if (!(li.includes("/company-beta/") || li.includes("/in/"))) {
          warn(`LinkedIn processing ${li} had no result! [${result}]`);
        }
      }
    }

    if (fb && fb !== "") {
      const results = regexFacebook.exec(
        fb.replace("/pg/", "/").replace("/p/", "/"),
      );
      const result = results && results[1];

      if (result) {
        // log(`Facebook processing ${fb} => ${result}`);

        if (
          [
            "profile.php",
            "home.php",
            "groups",
            "pages",
            "search",
            "people",
            "share",
          ].includes(result)
        ) {
          // warn("skipping facebook group link for now");
        } else {
          if (fbMap[result]) {
            error(`Duplicate Facebook [social]: ${result}`);
          } else {
            fbMap[result] = true;
            facebookFlagged.push({
              id: id,
              selector: result,
              name: name,
              reasons: reasons,
              ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
            });
          }
        }
      } else {
        warn(`Facebook processing ${fb} had no result! [${result}]`);
      }
    }

    if (tw && tw !== "") {
      const results = regexTwitter.exec(tw);
      const result = results && results[1];

      if (result) {
        // log(`Twitter extracted ${tw} => ${result}`);
        if (
          ["home", "https:", "hashtag", "search", "intent"].includes(result)
        ) {
          return;
        }
        if (twitterMap[result]) {
          error(`Duplicate Twitter [social]: ${result}`);
        } else {
          twitterMap[result] = true;

          twitterFlagged.push({
            id: row.id,
            selector: result,
            name: row.name,
            reasons: row.reasons,
            ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
          });
        }
      } else {
        warn(`Twitter processing ${tw} had no result! [${result}]`);
      }
    }

    // Extract Instagram (from manual overrides)
    if (ig && ig !== "") {
      const results = regexInstagram.exec(ig);
      const result = results && results[1];

      if (result) {
        if (
          ["explore", "accounts", "direct", "stories", "reels"].includes(result)
        ) {
          return;
        }
        if (instagramMap[result]) {
          error(`Duplicate Instagram [social]: ${result}`);
        } else {
          instagramMap[result] = true;

          instagramFlagged.push({
            id: row.id,
            selector: result,
            name: row.name,
            reasons: row.reasons,
            ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
          });
        }
      } else {
        warn(`Instagram processing ${ig} had no result! [${result}]`);
      }
    }

    // Extract GitHub (from manual overrides)
    if (gh && gh !== "") {
      const results = regexGitHub.exec(gh);
      const result = results && results[1];

      if (result) {
        if (githubMap[result]) {
          error(`Duplicate GitHub [social]: ${result}`);
        } else {
          githubMap[result] = true;

          githubFlagged.push({
            id: row.id,
            selector: result,
            name: row.name,
            reasons: row.reasons,
            ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
          });
        }
      } else {
        warn(`GitHub processing ${gh} had no result! [${result}]`);
      }
    }

    // Extract YouTube Profile (from manual overrides)
    // Use common regex as only source of truth
    if (ytp && ytp !== "") {
      const results = regexYouTubeProfile.exec(ytp);
      const result = results && results[1];

      if (result) {
        if (youtubeProfileMap[result]) {
          error(`Duplicate YouTube Profile [social]: ${result}`);
        } else {
          youtubeProfileMap[result] = true;

          youtubeProfileFlagged.push({
            id: row.id,
            selector: result,
            name: row.name,
            reasons: row.reasons,
            ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
          });
        }
      } else {
        warn(`YouTube Profile processing ${ytp} had no result! [${result}]`);
      }
    }

    // Extract YouTube Channel (from manual overrides)
    if (ytc && ytc !== "") {
      const results = regexYouTubeChannel.exec(ytc);
      const result = results && results[1];

      if (result) {
        if (youtubeChannelMap[result]) {
          error(`Duplicate YouTube Channel [social]: ${result}`);
        } else {
          youtubeChannelMap[result] = true;

          youtubeChannelFlagged.push({
            id: row.id,
            selector: result,
            name: row.name,
            reasons: row.reasons,
            ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
          });
        }
      } else {
        warn(`YouTube Channel processing ${ytc} had no result! [${result}]`);
      }
    }

    // Extract TikTok (from manual overrides)
    // Use common regex as only source of truth
    if (tt && tt !== "") {
      const results = regexTikTok.exec(tt);
      const result = results && results[1];

      if (result) {
        if (tiktokMap[result]) {
          error(`Duplicate TikTok [social]: ${result}`);
        } else {
          tiktokMap[result] = true;

          tiktokFlagged.push({
            id: row.id,
            selector: result,
            name: row.name,
            reasons: row.reasons,
            ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
          });
        }
      } else {
        warn(`TikTok processing ${tt} had no result! [${result}]`);
      }
    }

    // Extract Threads (from manual overrides)
    // Use common regex as only source of truth
    if (th && th !== "") {
      const results = regexThreads.exec(th);
      const result = results && results[1];

      if (result) {
        if (threadsMap[result]) {
          error(`Duplicate Threads [social]: ${result}`);
        } else {
          threadsMap[result] = true;

          threadsFlagged.push({
            id: row.id,
            selector: result,
            name: row.name,
            reasons: row.reasons,
            ...(row.stock_symbol ? { s: row.stock_symbol } : {}),
          });
        }
      } else {
        warn(`Threads processing ${th} had no result! [${result}]`);
      }
    }
  });

  saveJsonToFile(
    linkedinFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_LI_COMPANY}.json`,
    ),
  );

  saveJsonToFile(
    facebookFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_FACEBOOK}.json`,
    ),
  );

  saveJsonToFile(
    twitterFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_TWITTER}.json`,
    ),
  );

  saveJsonToFile(
    instagramFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_INSTAGRAM}.json`,
    ),
  );

  saveJsonToFile(
    githubFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_GITHUB}.json`,
    ),
  );

  saveJsonToFile(
    youtubeProfileFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_YOUTUBE_PROFILE}.json`,
    ),
  );

  saveJsonToFile(
    youtubeChannelFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_YOUTUBE_CHANNEL}.json`,
    ),
  );

  saveJsonToFile(
    tiktokFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_TIKTOK}.json`,
    ),
  );

  saveJsonToFile(
    threadsFlagged.sort((a, b) => a.name.localeCompare(b.name)),
    path.join(
      __dirname,
      `../../results/3_networks/${DBFileNames.FLAGGED_THREADS}.json`,
    ),
  );

  log(`Wrote ${linkedinFlagged.length} li rows...`);
  log(`Wrote ${facebookFlagged.length} fb rows..`);
  log(`Wrote ${twitterFlagged.length} tw rows..`);
  log(`Wrote ${instagramFlagged.length} ig rows..`);
  log(`Wrote ${githubFlagged.length} gh rows..`);
  log(`Wrote ${youtubeProfileFlagged.length} ytp rows..`);
  log(`Wrote ${youtubeChannelFlagged.length} ytc rows..`);
  log(`Wrote ${tiktokFlagged.length} tt rows..`);
  log(`Wrote ${threadsFlagged.length} th rows..`);
};

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8");
  log(`Data successfully written to ${outputFilePath}`);
};

export async function run(merged: ScrappedFileType | MergedDataItem[]) {
  // Validate base structure (ig/gh may be present but not in schema)
  APIScrapperFileDataSchema.parse(merged);

  extractSocialLinks(merged);
}

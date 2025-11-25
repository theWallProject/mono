import puppeteer, { Page } from "puppeteer";
import fs from "fs";
import path from "path";
import { format } from "prettier";
import { ScrappedItemType } from "../types";
import {
  APIListOfReasons,
  valuesOfListOfReasons,
} from "@theWallProject/common";
import { error, log, warn } from "../helper";
import dotenv from "dotenv";

type ScrappingConfig = {
  cbSearchUrl: string;
  // cbRanges: [string, string][];
  reasons: valuesOfListOfReasons[];
  fileName: string;
  cbSteps: [number, number][];
};

const homeUrl = "https://www.crunchbase.com";
const filterStages: ScrappingConfig[] = [
  {
    cbSearchUrl:
      "https://www.crunchbase.com/discover/saved/israel-active/ec0496b1-5137-4e73-a3eb-a9e7ea6b2900",
    reasons: [APIListOfReasons.HeadQuarterInIL],
    fileName: "HQ_ISR",
    cbSteps: [
      [1, 60000],
      [60001, 145000],
      [145001, 290000],
      [290001, 440000],
      [440001, 590000],
      [590001, 750000],
      [750001, 920000],
      [920001, 1000000],
      [1000001, 1100000],
      [1100001, 1300000],
      [1300001, 1530000],
      [1530001, 1800000],
      [1800001, 2050000],
      [2050001, 2290000],
      [2290001, 2580000],
      [2580001, 2850000],
      [2850001, 3180000],
      [3180001, 3540000],
      [3540001, 9999999],
    ],
  },
  {
    cbSearchUrl:
      "https://www.crunchbase.com/discover/saved/israel-founder-active/a5dfe009-c869-4d34-8b3c-c0213f08056b",
    reasons: [APIListOfReasons.FounderInIL],
    fileName: "FOUNDER_ISR",
    cbSteps: [
      [1, 150000],
      [150001, 1200000],
      [1200001, 999999999],
    ],
  },
  {
    cbSearchUrl:
      "https://www.crunchbase.com/discover/saved/israel-investor-active/04acb0ea-daee-4b71-955b-13c6b95a0483",
    reasons: [APIListOfReasons.InvestorNotFounderInIL],
    fileName: "INV_NOT_FOUNDER_ISR",
    cbSteps: [
      [1, 50000],
      [50001, 999999999],
    ],
  },
  // {
  //   cbSearchUrl:
  //     "https://www.crunchbase.com/lists/berlin-halal-friendly/6dab6829-5be0-4038-a408-edf172fb269a/organization.companies",
  //   reasons: [APIListOfReasons.FounderInIL],
  //   fileName: "TMP_BERLIN",
  //   cbSteps: [
  //     [1, 130000],
  //     [130001, 320000],
  //     [320001, 550000],
  //     [550001, 840000],
  //     [840001, 1120000],
  //     [1120001, 1420000],
  //     [1420001, 1700000],
  //     [1700001, 1950000],
  //     [1950001, 2220000],
  //     [2220001, 2480000],
  //     [2480001, 2730000],
  //     [2730001, 3000000],
  //     [3000001, 3300000],
  //     [3300001, 999999999],
  //   ],
  // },
];

export async function run() {
  dotenv.config();

  const EMAIL = process.env.EMAIL;
  const PASSWORD = process.env.PASSWORD;

  if (!EMAIL || !PASSWORD) {
    throw new Error("EMAIL and PASSWORD must be set");
  }

  const browser = await puppeteer.launch({
    headless: false,
    // executablePath: "/usr/bin/google-chrome",
    // args: ["--start-maximized"],
    args: ["--window-size=1800,1000"],
    // userDataDir,
  });
  const page = await browser.newPage();

  page.on("error", (err) => {
    error("Scrap browser error occurred:", err);
    throw new Error("Scrap browser error occurred");
  });

  page.on("close", () => {
    warn("Page was closed unexpectedly!");
  });

  browser.on("disconnected", () => {
    error("Browser was disconnected!");
    throw new Error("Browser was disconnected");
  });

  await page.setViewport({ width: 1800, height: 1000 });

  // Navigate to the page
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});

  await page.waitForSelector('[aria-label="Log In"]');
  await page.click('[aria-label="Log In"]');
  await page.waitForSelector('[type="email"]');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  await page.type('[type="email"]', EMAIL, { delay: 50 });
  await page.type('[type="password"]', PASSWORD, { delay: 50 });
  await page.click('[type="submit"]');
  await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});

  log("Continuing after login...");
  const stageCounts = [];

  for await (const stage of filterStages) {
    log("processing stage:", stage);

    let batchNum = 1;

    for (const [from, to] of stage.cbSteps) {
      if (
        fs.existsSync(
          path.join(
            __dirname,
            `../../results/1_batches/cb/${stage.fileName}_${batchNum}.json`,
          ),
        )
      ) {
        warn(`Skipping stage ${stage.fileName}_${batchNum}...`);
        batchNum += 1;

        continue;
      }

      log(`before naviagting to ${stage.cbSearchUrl}`);

      await page.goto(stage.cbSearchUrl, { waitUntil: "domcontentloaded" });

      // log("before reloading");
      // await page.reload({ waitUntil: "domcontentloaded" });

      await setFilter(page, 0, from);
      log("after setting from");

      await setFilter(page, 1, to);
      log("after setting to");

      try {
        await clickSearchButton(page);
      } catch (error) {
        warn("couldnt click search, skipping", error);
      }

      const resultsInfo = await page.waitForSelector(
        ".component--results-info",
      );
      if (!resultsInfo) {
        throw new Error("no results info found");
      }

      const resultsInfoText = await resultsInfo.evaluate((el) =>
        el.textContent?.trim(),
      );
      log("Results info text:", resultsInfoText);
      // extract number from pattern "of 789,76 results"
      const strCountFromResultsInfo = resultsInfoText
        ?.split("of")[1]
        .match(/\d+/)?.[0];

      if (!strCountFromResultsInfo) {
        throw new Error("no number from results info found");
      }
      const countFromResultsInfo = parseInt(strCountFromResultsInfo);

      stageCounts.push({ batchNum, countFromResultsInfo });

      // if (resultsInfo) {
      const textNodes = await page.evaluate(() => {
        const element = document.querySelector(".component--results-info");
        if (!element) return [];

        return Array.from(element.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim());
      });

      log("Search count:", textNodes);

      const results = await processTable(page, stage);
      log("after processTable");

      results.sort((a, b) => a.name.localeCompare(b.name));
      if (results.length !== countFromResultsInfo) {
        warn(
          `Size mismatch [${from}]: ${results.length} !== ${countFromResultsInfo}`,
        );
      }

      await saveResultsToFile(results, `${stage.fileName}_${batchNum}.json`);
      batchNum += 1;
    }

    log("stageCounts", stageCounts);
    // await page.goto(stage.cbSearchUrl, { waitUntil: "domcontentloaded" });
    // await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  // await browser.close();
}

async function saveResultsToFile(
  results: ScrappedItemType[],
  fileName: string,
) {
  const filePath = path.join(
    __dirname,
    "../../results/1_batches/cb/",
    fileName,
  );

  log(`scraping complete. Saving ${results.length} rows to [${filePath}]...`);
  const text = await format(JSON.stringify(results, null, 2), {
    parser: "json",
  });

  fs.writeFileSync(filePath, text, { flag: "a" });
  log(`Results saved to ${filePath}`);
}

async function clickSearchButton(page: Page): Promise<void> {
  log("Clicking the search button...");
  const searchButtonSelector = '[data-cy="search-button"]';

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await page.waitForSelector(searchButtonSelector, { timeout: 1000 });

  try {
    await page.click(searchButtonSelector);
    log("Search button clicked, waiting for results to load...");
  } catch (error) {
    warn(
      "Couldnt click search button button, waiting for results to load...",
      error,
    );
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function setFilter(
  page: Page,
  index: number,
  value: number,
): Promise<void> {
  const selector = ".component--number-input .mdc-text-field__input";

  log(`Setting filter for ${selector} with value ${value}[${index}]`);

  // Wait for element to be ready with increased timeout
  await page.waitForSelector(selector);

  // Use page.$$ to get fresh handles each time
  const fields = await page.$$(selector);
  if (!fields[index]) {
    throw new Error(`Field at index ${index} not found`);
  }

  // Focus and click using page.evaluate with property checks
  await page.evaluate((element: unknown) => {
    // Type narrowing without assertions: check if element has required methods
    if (
      element &&
      typeof element === "object" &&
      element !== null &&
      "focus" in element &&
      "select" in element
    ) {
      // Use Object.getOwnPropertyDescriptor or direct property access
      // Since we're in browser context, element is a DOM element with these methods
      const elementRecord: Record<string, unknown> = {};
      Object.assign(elementRecord, element);
      const focusMethod = elementRecord["focus"];
      const selectMethod = elementRecord["select"];

      if (
        typeof focusMethod === "function" &&
        typeof selectMethod === "function"
      ) {
        // Use Function.prototype.call to invoke without type assertions
        Function.prototype.call.call(focusMethod, element);
        Function.prototype.call.call(selectMethod, element);
      }
    }
  }, fields[index]);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Clear existing value
  await page.keyboard.press("Backspace");

  // Type new value directly
  await page.keyboard.type(value.toString(), { delay: 100 });
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Click away to trigger any change events
  if (index === 1) {
    await page.mouse.click(500, 100);
  }
  await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});
}

async function processTable(
  page: Page,
  stage: ScrappingConfig,
): Promise<ScrappedItemType[]> {
  const results: ScrappedItemType[] = [];
  let hasMore = true;
  let currentFirstRowName = "";

  while (hasMore) {
    log("waiting for table body...");
    await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});

    await page.waitForSelector(".body-wrapper");
    await page.waitForSelector(".body-wrapper grid-row");

    const rows = await page.$$(".body-wrapper grid-row");

    log(`processing [${rows.length}] rows...`);
    for (const row of rows) {
      const rowData: ScrappedItemType = await page.evaluate(
        (row, stg) => {
          const getData = (selector: string): string =>
            row.querySelector<HTMLDivElement>(selector)?.innerText || "";

          const getLinks = (
            selector: string,
          ): { name: string; link: string }[] =>
            [...row.querySelectorAll<HTMLAnchorElement>(selector)].map(
              (link) => ({
                name: link.innerText.trim(),
                link: link.href,
              }),
            );

          const result: ScrappedItemType = {
            reasons: stg.reasons,
            name: getData("[data-columnid=identifier]"),
            cbLink: getLinks("[data-columnid=identifier] a")[0].link,
            id: getLinks("[data-columnid=identifier] a")[0].link.replace(
              "https://www.crunchbase.com/organization/",
              "",
            ),
            li:
              row.querySelector<HTMLAnchorElement>("[data-columnid=linkedin] a")
                ?.href || "",
            fb:
              row.querySelector<HTMLAnchorElement>("[data-columnid=facebook] a")
                ?.href || "",
            ws:
              row.querySelector<HTMLAnchorElement>("[data-columnid=website] a")
                ?.href || "",
            tw:
              row.querySelector<HTMLAnchorElement>("[data-columnid=twitter] a")
                ?.href || "",
            founderIds: getLinks("[data-columnid=founder_identifiers] a"),
            investorIds: getLinks("[data-columnid=investor_identifiers] a"),
            acquirerIds: getLinks("[data-columnid=acquirer_identifier] a"),
            description: getData("[data-columnid=short_description]"),
            cbRank: getData("[data-columnid=rank_org_company]").replaceAll(
              ",",
              "",
            ),
            estRevenue: getData("[data-columnid=revenue_range]").replace(
              "—",
              "",
            ),
            stock_symbol: getData("[data-columnid=stock_symbol]").replace(
              "—",
              "",
            ),
            hq_postal_code: getData("[data-columnid=hq_postal_code]").replace(
              "—",
              "",
            ),
            stock_exchange_symbol: getData(
              "[data-columnid=stock_exchange_symbol]",
            ).replace("—", ""),
            industries: getLinks("[data-columnid=categories] a").map(
              (link) => link.name,
            ),
            industryGroups: getLinks("[data-columnid=category_groups] a").map(
              (link) => link.name,
            ),
          };

          return result;
        },
        row,
        stage,
      );

      results.push(rowData);
    }

    log("checking for next page...");
    const nextBtn = await page.$(".page-button-next");
    if (!nextBtn) break;

    hasMore = await page.evaluate(
      (btn) => btn.getAttribute("aria-disabled") !== "true",
      nextBtn,
    );

    if (hasMore) {
      log("has more... clicking next");
      await nextBtn.click();

      // Wait for the first row to change
      const newFirstRowSelector =
        ".body-wrapper grid-row [data-columnid=identifier]";

      currentFirstRowName = await page.evaluate(
        (selector) =>
          document.querySelector<HTMLDivElement>(selector)?.innerText || "",
        newFirstRowSelector,
      );

      await page.waitForFunction(
        (selector, currentName) =>
          document.querySelector<HTMLDivElement>(selector)?.innerText !==
          currentName,
        { timeout: 5000 },
        newFirstRowSelector,
        currentFirstRowName,
      );

      log("waiting for content to load...");
      await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});
    }
  }

  return results;
}

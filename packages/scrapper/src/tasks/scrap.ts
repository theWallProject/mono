import fs from "fs"
import path from "path"
import { APIListOfReasons, valuesOfListOfReasons } from "@theWallProject/common"
import dotenv from "dotenv"
import puppeteer, { Page } from "puppeteer"

import { error, log, warn } from "../helper"
import { CrunchbaseScrappedItemType } from "../types"

type ScrappingConfig = {
  cbSearchUrl: string
  // cbRanges: [string, string][];
  reasons: valuesOfListOfReasons[]
  fileName: string
  cbSteps: [number, number][]
}

const homeUrl = "https://www.crunchbase.com"
// Slow, human-ish pacing helpers (avoid rate limits / bot detection)
const sleepRaw = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
const jitter = (min: number, max: number): number => min + Math.random() * (max - min)
// SCRAP_PACING: <1 = faster (e.g. 0.5 doubles speed), >1 = slower. Default 1.
const PACE = (() => {
  const v = Number(process.env.SCRAP_PACING)
  return Number.isFinite(v) && v > 0 ? v : 1
})()
const pacedSleep = async (min: number, max: number): Promise<void> => sleepRaw(jitter(min, max) * PACE)
// Crunchbase caps in-page results at 1000. Ranges exceeding this are auto-split in half
// (the live count is read first — "fetch the max number" — and only over-cap ranges split).
const RANGE_CAP = 950
const MAX_SPLIT_DEPTH = 14
// Ranges learned from the 2026-10-04 scrape (fine-grained, each ≤ ~1000 results):
// HQ = 30 buckets, Founder = 16 buckets. Recorded in results/1_batches/cb_ranges.json.
const filterStages: ScrappingConfig[] = [
  {
    cbSearchUrl: "https://www.crunchbase.com/discover/saved/hq-in-israel-active/deaa5454-5810-4e44-890a-afe06235eb47",
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
      [1530001, 1665000],
      [1665001, 1800000],
      [1800001, 2050000],
      [2050001, 2290000],
      [2290001, 2580000],
      [2580001, 2850000],
      [2850001, 3015000],
      [3015001, 3180000],
      [3180001, 3360000],
      [3360001, 3540000],
      [3540001, 3741875],
      [3741876, 3943750],
      [3943751, 4145625],
      [4145626, 4347500],
      [4347501, 4751250],
      [4751251, 5155000],
      [5155001, 5558750],
      [5558751, 5962500],
      [5962501, 6770000]
    ]
  },
  {
    cbSearchUrl: "https://www.crunchbase.com/discover/saved/founder-in-israel-active/644e19cd-6cf8-463f-9966-5aa5515cd0cb",
    reasons: [APIListOfReasons.FounderInIL],
    fileName: "FOUNDER_ISR",
    cbSteps: [
      [1, 37500],
      [37501, 75000],
      [75001, 150000],
      [150001, 281250],
      [281251, 412500],
      [412501, 543750],
      [543751, 675000],
      [675001, 937500],
      [937501, 1200000],
      [1200001, 1687696],
      [1687697, 2175391],
      [2175392, 2663087],
      [2663088, 3150782],
      [3150783, 4126173],
      [4126174, 5101563],
      [5101564, 9003125]
    ]
  },
  {
    cbSearchUrl:
      "https://www.crunchbase.com/discover/saved/investor-in-israel-not-founders-active/e70864f2-2bfa-4b39-b695-7b89ef13b407",
    reasons: [APIListOfReasons.InvestorNotFounderInIL],
    fileName: "INV_NOT_FOUNDER_ISR",
    // HQ-in-Israel and founder-in-Israel are excluded; ranges learned 2026-10-04.
    cbSteps: [
      [1, 25000],
      [25001, 50000],
      [50001, 999999999]
    ]
  }
]

export async function run() {
  dotenv.config()

  const EMAIL = process.env.EMAIL
  const PASSWORD = process.env.PASSWORD

  if (!EMAIL || !PASSWORD) {
    throw new Error("EMAIL and PASSWORD must be set")
  }

  const launchArgs = [
    "--window-size=1800,1000",
    // Required on Ubuntu 23.10+ (AppArmor restricts unprivileged user namespaces)
    "--no-sandbox",
    // Hide Chrome automation marker flags from page JS / Cloudflare checks
    "--disable-blink-features=AutomationControlled",
    "--disable-infobars"
  ]
  // Route through a local CONNECT proxy bound to a different (un-banned) source address.
  // See scripts/slaac-proxy.mjs — set SCRAP_PROXY_SERVER to enable.
  if (process.env.SCRAP_PROXY_SERVER) {
    launchArgs.push(`--proxy-server=${process.env.SCRAP_PROXY_SERVER}`)
    log(`Using proxy: ${process.env.SCRAP_PROXY_SERVER}`)
  }

  const browser =
    process.env.SCRAP_CONNECT === "1"
      ? await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null })
      : await puppeteer.launch({
          headless: false,
          userDataDir: path.join(__dirname, `../../${process.env.SCRAP_PROFILE_DIR || ".browser-profile"}`),
          args: launchArgs
        })
  const page = await browser.newPage()

  // Mask automation markers before any page script runs
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined })
  })

  page.setDefaultTimeout(60000)

  page.on("error", (err) => {
    error("Scrap browser error occurred:", err)
    throw new Error("Scrap browser error occurred")
  })

  page.on("close", () => {
    warn("Page was closed unexpectedly!")
  })

  browser.on("disconnected", () => {
    error("Browser was disconnected!")
    throw new Error("Browser was disconnected")
  })

  await page.setViewport({ width: 1800, height: 1000 })

  // Navigate to the site; login is ONLY performed when SCRAP_ALLOW_LOGIN=1 (never by default).
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" })
  await page.waitForNetworkIdle({ timeout: 6000 }).catch(() => {})
  // give the SPA time to hydrate + restore any session before deciding auth state
  await sleepRaw(6000)
  await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {})
  await sleepRaw(jitter(2000, 3500))

  const auth = await page.evaluate(() => ({
    hasLoginLink: !!document.querySelector('a[href="/login"]'),
    hasEmail: !!document.querySelector('[type="email"]')
  }))

  const canLogin = process.env.SCRAP_ALLOW_LOGIN === "1"

  if (auth.hasLoginLink || auth.hasEmail) {
    if (!canLogin) {
      throw new Error(
        "NOT LOGGED IN and automated login is disabled (SCRAP_ALLOW_LOGIN is not set). " +
          "Log in once manually in the profile browser, then re-run this scrape."
      )
    }
    log("SCRAP_ALLOW_LOGIN=1 — performing login...")
    if (!auth.hasEmail) {
      await page.evaluate(() => (document.querySelector('a[href="/login"]') as HTMLElement | null)?.click())
      await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {})
    }
    await page.waitForSelector('[type="email"]', { timeout: 30000 })
    await new Promise((resolve) => setTimeout(resolve, 1500))

    await humanType(page, '[type="email"]', EMAIL)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await page.waitForSelector('[type="password"]', { timeout: 15000 })
    await new Promise((resolve) => setTimeout(resolve, 500))
    await humanType(page, '[type="password"]', PASSWORD)

    await new Promise((resolve) => setTimeout(resolve, 700))
    await page.click('[type="submit"]')
  } else {
    log("Session looks authenticated — skipping login.")
  }

  // Wait for the login to complete (redirect away from /login)
  log("Waiting for login to complete...")
  await page
    .waitForFunction(() => !window.location.pathname.includes("/login"), { timeout: 90000 })
    .catch(() => {})
  await page.waitForNetworkIdle({ timeout: 8000 }).catch(() => {})

  const currentPageUrl = page.url()
  log("Current URL after login:", currentPageUrl)

  const blocked = await page.evaluate(() =>
    document.body.innerText.includes("Sorry, you have been blocked")
  )
  if (blocked) {
    error("Cloudflare block page detected after login.")
    await page.screenshot({ path: path.join(__dirname, "../../logs/cf-blocked.png") }).catch(() => {})
    throw new Error(
      "Cloudflare blocked the automated browser during login. " +
        "Try completing the login manually once (headed browser) so the session cookie (cf_clearance) is stored in .browser-profile/"
    )
  }

  log("Continuing after login...")

  // Hard guard: refuse to scrape while logged out (avoids empty batches & wasted requests)
  const authed = await page.evaluate(() => !document.querySelector('a[href="/login"]'))
  if (!authed) {
    throw new Error(
      "NOT AUTHENTICATED. No automated login is performed by default. " +
        "Open the browser manually, log in to Crunchbase once (so the session is stored in the profile), then re-run."
    )
  }
  const stageCounts = []
  // Seed from the previously recorded sidecar so stages skipped via SCRAP_STAGE keep their ranges.
  const rangesPath = path.join(__dirname, "../../results/1_batches/cb_ranges.json")
  const rangesByStage: Record<string, Array<[number, number]>> = {}
  try {
    Object.assign(rangesByStage, JSON.parse(fs.readFileSync(rangesPath, "utf8")))
  } catch {
    /* no sidecar yet */
  }

  for (const stage of filterStages) {
    if (process.env.SCRAP_STAGE && !stage.fileName.includes(process.env.SCRAP_STAGE)) {
      log(`skip stage ${stage.fileName} (SCRAP_STAGE=${process.env.SCRAP_STAGE})`)
      continue
    }
    log("processing stage:", stage)

    // Range queue with auto-split: read the live count first; ranges over the 1000-row view
    // cap are split in half and reprocessed, so nothing is truncated.
    const rangeQueue: Array<[number, number, number]> = stage.cbSteps.map(([f, t]) => [f, t, 0])
    let batchNum = 1
    const stageRanges: Array<[number, number]> = []

    while (rangeQueue.length > 0) {
      const item = rangeQueue.shift()
      if (!item) break
      const [rangeFrom, rangeTo, depth] = item
      const outFile = `${stage.fileName}_${batchNum}.json`
      const outPath = path.join(__dirname, `../../results/1_batches/cb/${outFile}`)
      if (fs.existsSync(outPath)) {
        warn(`Skipping existing batch ${outFile}`)
        stageRanges.push([rangeFrom, rangeTo])
        batchNum += 1
        continue
      }

      log(`before navigating to ${stage.cbSearchUrl} (range ${rangeFrom}-${rangeTo})`)
      await pacedSleep(1200, 1500)

      await page.goto(stage.cbSearchUrl, { waitUntil: "domcontentloaded" })
      await page.waitForNetworkIdle({ timeout: 8000 }).catch(() => {})
      await pacedSleep(2000, 2500)

      // Guard: transient "Oops! There was a problem!" crash pages must not become empty batches
      for (let tries = 0; tries < 3; tries++) {
        const errPage = await page.evaluate(() => document.body.innerText.includes("Oops! There was a problem!"))
        if (!errPage) break
        warn(`\u26a0\ufe0f Crash/error page detected — waiting ${12 + tries * 8}s, then reloading...`)
        await sleepRaw((12 + tries * 8) * 1000)
        await page.reload({ waitUntil: "domcontentloaded" })
        await page.waitForNetworkIdle({ timeout: 8000 }).catch(() => {})
        await pacedSleep(3000, 5000)
      }

      const appliedRange = await setRankFilter(page, rangeFrom, rangeTo)
      log(appliedRange ? `rank range applied: ${rangeFrom} - ${rangeTo}` : "\u26a0\ufe0f rank filter not found/applyable — will scrape whatever is shown")

      // Read the filtered count.
      const readCount = async (): Promise<number> => {
        const resultsInfo = await page.waitForSelector(".component--results-info")
        if (!resultsInfo) return 0
        const resultsInfoText = await resultsInfo.evaluate((el) => el.textContent?.trim())
        log("Results info text:", resultsInfoText)
        // e.g. "Prev 1-50 Next  of 1,883 results" OR small sets: "36 results"
        const num = resultsInfoText?.match(/([\d,]+)\s*results?/)?.[1]
        return num ? parseInt(num.replace(/,/g, ""), 10) : 0
      }

      const countFromResultsInfo = await readCount()

      // 0-result ranges (empty tail beyond the max rank) — no table, skip.
      if (countFromResultsInfo === 0) {
        warn(`range [${rangeFrom}-${rangeTo}] = 0 results — skipping (nothing to scrape)`)
        continue
      }

      // Auto-split: only over-cap ranges get split (count is fetched first), halves reprocessed.
      if (countFromResultsInfo > RANGE_CAP && rangeTo - rangeFrom > 4000 && depth < MAX_SPLIT_DEPTH) {
        const mid = Math.floor((rangeFrom + rangeTo) / 2)
        warn(
          `\u00bb range [${rangeFrom}-${rangeTo}] = ${countFromResultsInfo} (>${RANGE_CAP}) — splitting into [${rangeFrom}-${mid}] and [${mid + 1}-${rangeTo}]`
        )
        rangeQueue.unshift([mid + 1, rangeTo, depth + 1])
        rangeQueue.unshift([rangeFrom, mid, depth + 1])
        continue
      }

      stageCounts.push({ batch: batchNum, range: `${rangeFrom}-${rangeTo}`, count: countFromResultsInfo })

      const textNodes = await page.evaluate(() => {
        const element = document.querySelector(".component--results-info")
        if (!element) return []

        return Array.from(element.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim())
      })

      log("Search count:", textNodes)

      const results = await processTable(page, stage)
      log("after processTable")

      results.sort((a, b) => a.name.localeCompare(b.name))
      if (results.length !== countFromResultsInfo) {
        warn(`Size mismatch [${rangeFrom}-${rangeTo}]: ${results.length} !== ${countFromResultsInfo}`)
      }

      saveResultsToFile(results, outFile)
      stageRanges.push([rangeFrom, rangeTo])
      batchNum += 1
      await pacedSleep(1500, 2500)
    }

    rangesByStage[stage.fileName] = stageRanges
    log("stageCounts", stageCounts)
    // await page.goto(stage.cbSearchUrl, { waitUntil: "domcontentloaded" });
    // await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  // Record the exact ranges per batch (numeration order) so config can be updated split-free,
  // independent of the (plain-numbered) filenames.
  fs.writeFileSync(rangesPath, JSON.stringify(rangesByStage, null, 1))
  log(`Recorded ${Object.keys(rangesByStage).length} stage(s) of ranges to ${rangesPath}`)

  // await browser.close();
}

/**
 * Types text with randomized, human-like delays and clicks into the field first.
 */
async function humanType(page: Page, selector: string, text: string): Promise<void> {
  await page.click(selector)
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400))
  for (const char of text) {
    await page.keyboard.type(char)
    await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 130))
  }
}

/**
 * Set the CB Rank (Company) range on the saved search's rank filter.
 * Query-mode approach (validated): click each rank number input, TYPE the value with real
 * key events, then Tab — Angular commits on blur. No operator-menu/native-setter tricks.
 */
async function setRankFilter(page: Page, from: number, to: number): Promise<boolean> {
  // helper: focus the idx-th "Enter number …" input of the rank row via JS (mouse clicks can be
  // intercepted by overlays on some pages — JS focus is reliable) and TYPE the value as real keys.
  const typeInto = async (value: number, idx: number): Promise<boolean> => {
    const ok = await page.evaluate((idx) => {
      const rows = [...document.querySelectorAll(".component--query-item")]
        .filter((r) => !/query-item-add/.test(r.className || ""))
      const rankRow = rows.find((r) => /CB Rank/.test((r as HTMLElement).innerText))
      const ins = rankRow
        ? [...rankRow.querySelectorAll("input")].filter((i) => /Enter number/.test(i.placeholder || ""))
        : []
      const target = ins[idx]
      if (target) {
        ;(target as HTMLInputElement).scrollIntoView({ block: "center" })
        ;(target as HTMLInputElement).focus()
        return true
      }
      return false
    }, idx)
    if (!ok) return false
    await sleepRaw(jitter(700, 1100))
    await page.keyboard.type(String(value), { delay: 50 })
    await sleepRaw(jitter(500, 900))
    await page.keyboard.press("Tab")
    await sleepRaw(jitter(1200, 1800))
    return true
  }

  // ensure the rank row's inputs are rendered (open the Query view if needed)
  const rankInputCount = async (): Promise<number> =>
    page.evaluate(() => {
      const row = [...document.querySelectorAll(".component--query-item")]
        .filter((r) => !/query-item-add/.test(r.className || ""))
        .find((r) => /CB Rank/.test((r as HTMLElement).innerText))
      if (!row) return -1
      return [...row.querySelectorAll("input")].filter((i) => /Enter number/.test(i.placeholder || "")).length
    })

  let n = await rankInputCount()
  if (n < 0) return false
  if (n < 2) {
    const q = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b2) => /^\s*query\s*$/i.test((b2.innerText || "").trim()))
      if (btn) {
        btn.click()
        return true
      }
      return false
    })
    if (!q) return false
    await sleepRaw(jitter(2500, 3500))
    n = await rankInputCount()
  }
  if (n < 2) return false

  if (!(await typeInto(from, 0))) return false
  if (!(await typeInto(to, 1))) return false

  // absolutely wait for the grid to refresh before the caller reads the count
  await page.waitForNetworkIdle({ timeout: 15000 }).catch(() => {})
  await sleepRaw(jitter(6000, 8000))
  return true
}

function saveResultsToFile(results: CrunchbaseScrappedItemType[], fileName: string) {
  const filePath = path.join(__dirname, "../../results/1_batches/cb/", fileName)

  log(`scraping complete. Saving ${results.length} rows to [${filePath}]...`)
  const text = JSON.stringify(results)

  // "w" overwrites any stale/partial content from a previous run (skip-check above means
  // existing complete batches are never re-written, so overwriting is always safe here)
  fs.writeFileSync(filePath, text, { flag: "w" })
  log(`Results saved to ${filePath}`)
}

async function processTable(page: Page, stage: ScrappingConfig): Promise<CrunchbaseScrappedItemType[]> {
  const results: CrunchbaseScrappedItemType[] = []
  let hasMore = true

  while (hasMore) {
    log("waiting for table body...")
    await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {})

    await page.waitForSelector(".body-wrapper", { timeout: 20000 }).catch(() => {})
    await page.waitForSelector(".body-wrapper grid-row", { timeout: 20000 }).catch(() => {})
    await pacedSleep(600, 1400)

    const rows = await page.$$(".body-wrapper grid-row")
    if (rows.length === 0) {
      warn("No table rows found — stopping pagination (partial/empty range)")
      break
    }

    log(`processing [${rows.length}] rows...`)
    for (const row of rows) {
      const rowData: CrunchbaseScrappedItemType = await page.evaluate(
        (row, stg) => {
          const getData = (selector: string): string => row.querySelector<HTMLDivElement>(selector)?.innerText || ""

          const getLinks = (selector: string): { name: string; link: string }[] =>
            [...row.querySelectorAll<HTMLAnchorElement>(selector)].map((link) => ({
              name: link.innerText.trim(),
              link: link.href
            }))

          const identifierLinks = getLinks("[data-columnid=identifier] a")
          const firstIdentifierLink = identifierLinks[0]
          if (firstIdentifierLink === undefined) {
            throw new Error("Failed to find identifier link")
          }
          const result: CrunchbaseScrappedItemType = {
            reasons: stg.reasons,
            name: getData("[data-columnid=identifier]"),
            cbLink: firstIdentifierLink.link,
            id: firstIdentifierLink.link.replace("https://www.crunchbase.com/organization/", ""),
            li: row.querySelector<HTMLAnchorElement>("[data-columnid=linkedin] a")?.href || "",
            fb: row.querySelector<HTMLAnchorElement>("[data-columnid=facebook] a")?.href || "",
            ws: row.querySelector<HTMLAnchorElement>("[data-columnid=website] a")?.href || "",
            tw: row.querySelector<HTMLAnchorElement>("[data-columnid=twitter] a")?.href || "",
            founderIds: getLinks("[data-columnid=founder_identifiers] a"),
            investorIds: getLinks("[data-columnid=investor_identifiers] a"),
            acquirerIds: getLinks("[data-columnid=acquirer_identifier] a"),
            description: getData("[data-columnid=short_description]"),
            cbRank: getData("[data-columnid=rank_org_company]").replaceAll(",", ""),
            estRevenue: getData("[data-columnid=revenue_range]").replace("—", ""),
            stock_symbol: getData("[data-columnid=stock_symbol]").replace("—", ""),
            hq_postal_code: getData("[data-columnid=hq_postal_code]").replace("—", ""),
            stock_exchange_symbol: getData("[data-columnid=stock_exchange_symbol]").replace("—", ""),
            industries: getLinks("[data-columnid=categories] a").map((link) => link.name),
            industryGroups: getLinks("[data-columnid=category_groups] a").map((link) => link.name)
          }

          return result
        },
        row,
        stage
      )

      results.push(rowData)
    }

    log("checking for next page...")
    const nextBtn = await page.$(".page-button-next")
    if (!nextBtn) break

    hasMore = await page.evaluate((btn) => btn.getAttribute("aria-disabled") !== "true", nextBtn)

    if (hasMore) {
      log("has more... clicking next")
      // Slow down: random pause before/after pagination
      await pacedSleep(1200, 2500)
      await nextBtn.click()

      // Wait for the new page's data to load (network idle + a short jittered pause).
      // NOTE: dropped the old per-page 30s "first row changed" wait — it added a ~30s stall
      // on every page while rows were already unique, and made scrapes ~15x slower.
      await page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {})
      await pacedSleep(800, 1500)
    }
  }

  return results
}

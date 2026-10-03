// verify_saved_searches.cjs — check that the saved-search URLs are real, loadable, and unbroken.
// Connects to the running browser (same logged-in session via :9222) so it doesn't need login.
//
// Usage: node scripts/verify_saved_searches.cjs  [optional: URLs...] (defaults to the 3 in notes)

const puppeteer = require("puppeteer")

const DEFAULTS = [
  "https://www.crunchbase.com/discover/saved/hq-in-israel-active/deaa5454-5810-4e44-890a-afe06235eb47",
  "https://www.crunchbase.com/discover/saved/founder-in-israel-active/644e19cd-6cf8-463f-9966-5aa5515cd0cb",
  "https://www.crunchbase.com/discover/saved/investor-in-israel-not-founders-active/e70864f2-2bfa-4b39-b695-7b89ef13b407"
]
const URLs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULTS

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const jitter = (base) => base + Math.random() * 1200

async function main() {
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null })
  try {
    let page = (await browser.pages()).find((p) => p.url().includes("crunchbase.com"))
    if (!page) page = await browser.newPage()
    await page.bringToFront()

    let allOk = true
    for (const url of URLs) {
      console.log(`\n▶ verifying ${url}`)
      // load with retry on transient error page
      let ok = false
      for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {})
        await sleep(jitter(6000))
        await page.waitForNetworkIdle({ timeout: 8000 }).catch(() => {})
        await sleep(jitter(1500))
        const s = await page.evaluate(() => {
          const body = document.body.innerText
          const chips = document.querySelector(".component--filters")
          return {
            url: location.href,
            oops: body.includes("Oops"),
            blocked: body.includes("blocked"),
            uncertain: body.includes("This entity page can't be found") || body.includes("not found"),
            chipsText: chips ? chips.innerText.replace(/\s+/g, " ").trim().slice(0, 160) : "",
            results: (body.match(/of [\d,+]+\+? results/) || ["?"])[0]
          }
        })
        if (!s.oops && !s.blocked && /\/discover\/saved\//.test(s.url)) {
          ok = true
          console.log("  ✅ loaded | url=" + s.url.slice(0, 100))
          console.log("     chips: " + (s.chipsText || "(none)"))
          console.log("     results: " + s.results)
          if (!s.chipsText) {
            allOk = false
            console.log("  ⚠️  NO FILTER CHIPS — may not be a real saved search")
          }
        } else {
          console.log(`  ⚠ attempt ${attempt}: oops=${s.oops} blocked=${s.blocked} url=${s.url.slice(0, 90)} — pausing ${attempt * 12}s before ${attempt < 2 ? "retry" : "marking FAILED"}`)
          await sleep(attempt * 12000)
        }
      }
      if (!ok) {
        allOk = false
        console.log("  ❌ FAILED — this saved-search link does not load cleanly. RE-RUN the creation script for it.")
      }
      await sleep(jitter(3000))
    }

    console.log(allOk ? "\n✅ ALL saved-search links verified." : "\n❌ Some links failed — rerun create_saved_search.cjs for the failing ones.")
    process.exit(allOk ? 0 : 2)
  } finally {
    await browser.disconnect()
  }
}
main().catch((e) => {
  console.error("❌ VERIFY FAILED:", e.message)
  process.exit(1)
})
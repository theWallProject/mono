// split_ranges.cjs — derive fine CB-Rank sub-ranges (each ≤ ~900 results) by live-counting.
// Uses the SAME setRankFilter recipe (open editor → between → fill → Enter → read count).
// Usage: node scripts/split_ranges.cjs <saved-search-url> <from> <to>

const puppeteer = require("puppeteer")
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const TARGET = 900

const URL = process.argv[2]
const FROM = Number(process.argv[3])
const TO = Number(process.argv[4])
if (!URL || !Number.isFinite(FROM) || !Number.isFinite(TO)) {
  console.error("usage: node scripts/split_ranges.cjs <url> <from> <to>")
  process.exit(1)
}

async function applyRank(page, from, to) {
  // 1) ensure value editor open (only click when no inputs rendered)
  const st = await page.evaluate(() => {
    const row = [...document.querySelectorAll(".component--query-item")].filter((r) => !/query-item-add/.test(r.className || "")).find((r) => /CB Rank/.test(r.innerText))
    if (!row) return null
    return { ok: true, inputs: [...row.querySelectorAll("input")].filter((i) => i.type !== "hidden" && i.type !== "checkbox").length }
  })
  if (!st) return null
  if (st.inputs === 0) {
    await page.evaluate(() => {
      const row = [...document.querySelectorAll(".component--query-item")].filter((r) => !/query-item-add/.test(r.className || "")).find((r) => /CB Rank/.test(r.innerText))
      const v = row && row.querySelector(".component--values")
      if (v) v.click()
    })
    await sleep(1800)
  }
  // 2) operator select -> between
  await page.evaluate(() => {
    const row = [...document.querySelectorAll(".component--query-item")].filter((r) => !/query-item-add/.test(r.className || "")).find((r) => /CB Rank/.test(r.innerText))
    const sel = row && (row.querySelector(".mat-mdc-select") || row.querySelector("mat-select"))
    if (sel) sel.click()
  })
  await sleep(1600)
  await page.evaluate(() => {
    const opt = [...document.querySelectorAll(".mat-mdc-option, mat-option")].find((o) => (o.innerText || "").trim() === "between")
    if (opt) opt.click()
  })
  await sleep(1600)
  // 3) fill
  const filled = await page.evaluate(
    (from, to) => {
      const row = [...document.querySelectorAll(".component--query-item")].filter((r) => !/query-item-add/.test(r.className || "")).find((r) => /CB Rank/.test(r.innerText))
      const ins = row ? [...row.querySelectorAll("input")].filter((i) => i.type !== "hidden" && i.type !== "checkbox") : []
      if (ins.length < 2) return false
      const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")
      for (const [v, idx] of [[String(from), 0], [String(to), 1]]) {
        const i = ins[idx]
        i.focus()
        desc.set.call(i, v)
        i.dispatchEvent(new Event("input", { bubbles: true }))
      }
      return true
    },
    from,
    to
  )
  if (!filled) return null
  await sleep(1000)
  await page.keyboard.press("Enter")
  await sleep(7000)
  await page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {})
  await sleep(800)
  return await page.evaluate(() => {
    const m = document.body.innerText.match(/of ([\d,]+)\+? results/)
    return m ? parseInt(m[1].replace(/,/g, ""), 10) : 0
  })
}

async function measure(page, from, to) {
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 })
  await sleep(6000)
  await page.waitForNetworkIdle({ timeout: 8000 }).catch(() => {})
  await sleep(1000)
  const c = await applyRank(page, from, to)
  console.log(`  measure [${from.toLocaleString()} - ${to.toLocaleString()}] = ${c}`)
  return c
}

const leaves = []
async function split(page, from, to) {
  const count = await measure(page, from, to)
  if (count === 0) return
  if (count <= TARGET) {
    leaves.push([from, to])
    return
  }
  const mid = Math.floor((from + to) / 2)
  if (mid <= from || mid >= to) {
    leaves.push([from, to])
    return
  }
  await split(page, from, mid)
  await split(page, mid + 1, to)
}

async function main() {
  const b = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null })
  const pages = await b.pages()
  let page = pages.find((p) => p.url().includes("crunchbase.com")) || pages[0]
  await page.bringToFront()
  console.log(`splitting [${FROM} - ${TO}] on ${URL.slice(0, 80)}`)
  await split(page, FROM, TO)
  console.log("\nFINE RANGES:")
  for (const [f, t] of leaves) console.log(`  [${f}, ${t}],`)
  await b.disconnect()
}
main().catch((e) => {
  console.error("ERR", e.message)
  process.exit(1)
})
// update_saved_search.cjs — add social columns + CB Rank "between" filter to EXISTING saved searches.
// Idempotent: only adds what's missing. Connects to the open logged-in browser (:9222).
//
// Usage: node scripts/update_saved_search.cjs <saved-search-url> [more-urls...]

const puppeteer = require("puppeteer")

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const jitter = (base) => base + Math.random() * 1200

const COLUMNS = [
  { search: "website", option: "Basic Info > Website", name: "Website" },
  { search: "linkedin", option: "Basic Info > LinkedIn", name: "LinkedIn" },
  { search: "facebook", option: "Basic Info > Facebook", name: "Facebook" },
  { search: "twitter", option: "Basic Info > X (Twitter)", name: "X (Twitter)" }
]

const URLs = process.argv.slice(2)
if (!URLs.length) {
  console.error("usage: node scripts/update_saved_search.cjs <url> [url...]")
  process.exit(1)
}

async function clickByText(page, containerSel, text) {
  return page.evaluate((containerSel, text) => {
    const root = document.querySelector(containerSel) || document
    const el = [...root.querySelectorAll("button")].find((b) => (b.innerText || "").trim() === text)
    if (el) {
      el.click()
      return true
    }
    return false
  }, containerSel, text)
}

async function mouseClickText(page, text, containerSel) {
  const rect = await page.evaluate((text, containerSel) => {
    const root = containerSel ? document.querySelector(containerSel) : document
    if (!root) return null
    const el = [...root.querySelectorAll("*")].find((e) => (e.innerText || "").trim() === text && e.getBoundingClientRect().width > 0)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }
  }, text, containerSel)
  if (!rect) return false
  await page.mouse.click(rect.x, rect.y)
  await sleep(jitter(1800))
  return true
}

function dialogText(page) {
  return page.evaluate(() => {
    const dlg = [...document.querySelectorAll(".mat-mdc-dialog-container")].map((o) => (o.innerText || "").trim()).filter((t) => t.length)
    return dlg.join("\n---\n")
  })
}

async function focusFindInput(page) {
  const ok = await page.evaluate(() => {
    const inp = [...document.querySelectorAll("input")].find((i) => (i.placeholder || "") === "Find a filter..." && i.getBoundingClientRect().width > 0)
    if (inp) {
      inp.focus()
      return true
    }
    return false
  })
  return ok
}

async function openEditView(page) {
  // close any open dialog first
  await page.keyboard.press("Escape").catch(() => {})
  await sleep(1000)
  const opened = await page.evaluate(() => {
    const bts = [...document.querySelectorAll("button")].filter((x) => /^\s*add column\s*$/i.test((x.innerText || "").trim()) && x.getBoundingClientRect().width > 0)
    if (bts[0]) {
      bts[0].click()
      return true
    }
    return false
  })
  await sleep(jitter(2500))
  return opened
}

async function addSocialColumns(page) {
  if (!(await openEditView(page))) {
    console.log("  ! could not open Add Column")
    return
  }
  // current Selected Columns lines
  const selected = new Set(
    (await page.evaluate(() => {
      const dlg = [...document.querySelectorAll(".mat-mdc-dialog-container")].map((o) => (o.innerText || "").trim()).filter((t) => t.includes("Selected Columns"))[0] || ""
      const i = dlg.indexOf("Selected Columns")
      const seg = dlg.slice(i, i + 400)
      return seg.split("\n").map((s) => s.trim()).filter(Boolean)
    })).slice(1) // drop "Selected Columns" header
  )
  console.log("  current columns:", [...selected].join(", "))

  for (const col of COLUMNS) {
    if (selected.has(col.name)) {
      console.log(`  already present: ${col.name}`)
      continue
    }
    await focusFindInput(page)
    await sleep(500)
    await page.keyboard.type(col.search)
    await sleep(jitter(1800))
    const ok = await mouseClickText(page, col.option, ".mat-mdc-dialog-container")
    console.log(`  ${ok ? "added" : "NOT added"}: ${col.name} (${col.option})`)
    // clear the search box for the next column
    await focusFindInput(page)
    await sleep(300)
    await page.keyboard.down("Control")
    await page.keyboard.press("KeyA")
    await page.keyboard.up("Control")
    await sleep(200)
  }
  // Apply Changes
  const applied = await clickByText(page, ".mat-mdc-dialog-container", "Apply Changes")
  console.log("  apply changes:", applied)
  await sleep(jitter(3500))
}

async function addRankFilter(page) {
  // open Add Companies filter
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Add Companies filter")
    if (btn) btn.click()
  })
  await sleep(jitter(2500))
  await focusFindInput(page)
  await sleep(500)
  await page.keyboard.type("cb rank")
  await sleep(jitter(1800))
  const clicked = await mouseClickText(page, "Rank & Scores > CB Rank (Company)", ".mat-mdc-dialog-container")
  await sleep(jitter(2400))
  console.log("  rank filter:", clicked ? "added" : "NOT added")

  // ensure operator is "between"
  const op = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".component--query-item")].filter((r) => !/query-item-add/.test(r.className || ""))
    const last = rows[rows.length - 1]
    if (!last) return null
    const sel = last.querySelector(".component--operators .mat-mdc-select") || last.querySelector(".component--operators")
    if (!sel) return null
    const r = sel.getBoundingClientRect()
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), txt: (sel.innerText || "").trim() }
  })
  if (op) {
    if (op.txt !== "between") {
      await page.mouse.click(op.x, op.y)
      await sleep(jitter(2200))
      const picked = await page.evaluate(() => {
        const opt = [...document.querySelectorAll(".mat-mdc-option, mat-option")].find((o) => (o.innerText || "").trim() === "between")
        if (opt) {
          opt.click()
          return true
        }
        return false
      })
      console.log("  rank operator -> between:", picked)
      await sleep(jitter(2000))
    } else {
      console.log("  rank operator already 'between'")
    }
  }
}

async function saveChanges(page) {
  const saved = await clickByText(page, "body", "Save Changes")
  console.log("  save changes clicked:", saved)
  await sleep(jitter(3500))
  return saved
}

async function main() {
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null })
  try {
    let page = (await browser.pages()).find((p) => p.url().includes("crunchbase.com"))
    if (!page) page = await browser.newPage()
    await page.bringToFront()

    for (const url of URLs) {
      console.log(`\n▶ ${url.slice(0, 100)}`)
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 })
      await sleep(jitter(6000))
      await page.waitForNetworkIdle({ timeout: 8000 }).catch(() => {})
      await sleep(jitter(1500))

      const oops = await page.evaluate(() => document.body.innerText.includes("Oops"))
      if (oops) {
        console.log("  !! Oops page — waiting 15s then reloading")
        await sleep(15000)
        await page.reload({ waitUntil: "domcontentloaded" })
        await sleep(jitter(6000))
      }
      console.log("  → adding social columns...")
      await addSocialColumns(page)
      console.log("  → adding CB Rank filter...")
      await addRankFilter(page)
      console.log("  → saving changes...")
      await saveChanges(page)
    }
    console.log("\n✅ update complete")
  } finally {
    await browser.disconnect()
  }
}
main().catch((e) => {
  console.error("❌ UPDATE FAILED:", e.message)
  process.exit(1)
})
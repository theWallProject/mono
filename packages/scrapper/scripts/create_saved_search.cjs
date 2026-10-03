// create_saved_search.cjs — paint a Crunchbase saved search by driving the open browser (CDP).
//
// Based on the manually-verified flow used to create "HQ in Israel - Active":
//   Advanced Search → Add Companies filter → search "Find a filter..." → click field → set value → Save Search → Create a Saved Search → title → save.
//
// Usage:
//   node scripts/create_saved_search.cjs \
//     --title "Founder in Israel - Active" \
//     --filter "Founder Location=Israel" \
//     --filter "Operating Status=Active"
//
// Options:
//   --title <string>      required — name of the saved search
//   --filter "F=V"        repeatable — field name (as typed in "Find a filter…") and value
//   --browser-url <url>   default http://127.0.0.1:9222
//   --out <file>          append the resulting saved-search URL to a file (optional)
//
// The script connects to the already-open Chrome (the same profile/session), so no login is needed.

const puppeteer = require("puppeteer")

const ARGS = process.argv.slice(2)
const getArg = (name, def) => {
  const i = ARGS.indexOf(name)
  return i >= 0 && ARGS[i + 1] ? ARGS[i + 1] : def
}
const filters = []
for (let i = 0; i < ARGS.length; i++) {
  if (ARGS[i] === "--filter") {
    let pair = ARGS[i + 1]
    let negate = false
    if (pair.includes("!=")) {
      negate = true
      pair = pair.replace("!=", "=")
    }
    const eq = pair.indexOf("=")
    if (eq < 0) throw new Error(`Bad --filter value: "${ARGS[i + 1]}" (expect "Field=Value" or "Field!=Value")`)
    filters.push({
      field: pair.slice(0, eq).trim(),
      value: pair.slice(eq + 1).trim(),
      negate
    })
  }
}
const title = getArg("--title")
const browserURL = getArg("--browser-url", "http://127.0.0.1:9222")
const outFile = getArg("--out")

if (!title) throw new Error("--title is required")
if (!filters.length) throw new Error("at least one --filter is required")

// ── Runtime monitoring: capture the exact JS exceptions/logs that precede the crash screen ──
const errorEvents = []
async function setupMonitoring(page) {
  page.on("pageerror", (e) => {
    errorEvents.push({ kind: "pageerror", msg: String((e && e.message) || e), stack: (e && e.stack) || "" })
  })
  page.on("console", (m) => {
    if (m.type() === "error") {
      errorEvents.push({ kind: "console.error", text: m.text() })
    }
  })
  try {
    const cdp = await page.createCDPSession()
    await cdp.send("Runtime.enable").catch(() => {})
    cdp.on("Runtime.exceptionThrown", (p) => {
      const d = p.exceptionDetails || {}
      errorEvents.push({
        kind: "exceptionThrown",
        text: (d.exception && d.exception.description) || d.text || "unknown",
        url: d.url
      })
    })
    cdp.on("Log.entryAdded", (p) => {
      const e = p.entry
      if (e && (e.level === "error" || e.level === "warning") && e.source !== "violation") {
        errorEvents.push({ kind: `log.${e.level}`, text: e.text, source: e.source, url: e.url })
      }
    })
  } catch {
    /* CDP session optional */
  }
}
function dumpErrorEvents() {
  const seen = new Set()
  const uniq = errorEvents.filter((e) => {
    const k = `${e.kind}|${e.text}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  if (!uniq.length) return
  console.log("\n── captured runtime errors/warnings ──")
  for (const e of uniq.slice(-20)) {
    console.log(`  [${e.kind}] ${e.text.slice(0, 400)}${e.url ? `  (${e.url})` : ""}`)
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const jitter = (base) => base + Math.random() * 800

// Set the focused input's value via a single native 'input' event (one autocomplete request,
// avoids per-keystroke request storms). Fallback to sendCharacter if the native setter fails.
async function setInputText(page, text) {
  const ok = await page.evaluate((text) => {
    const inp = document.activeElement
    if (!inp || !("value" in inp)) return false
    const proto = inp instanceof HTMLTextAreaElement ? "HTMLTextAreaElement" : "HTMLInputElement"
    const setter = Object.getOwnPropertyDescriptor(window[proto].prototype, "value")?.set
    if (!setter) return false
    setter.call(inp, text)
    inp.dispatchEvent(new Event("input", { bubbles: true }))
    return true
  }, text)
  if (!ok) {
    await page.keyboard.sendCharacter(text)
  }
  return ok
}

// No scripted typing storms: single insertText per field (one autocomplete request).

async function checkHealth(page, label) {
  const s = await page.evaluate(() => {
    const t = document.body.innerText
    return { oops: t.includes("Oops"), blocked: t.includes("blocked"), url: location.href }
  })
  if (s.oops || s.blocked) {
    throw new Error(`[${label}] Crunchbase error page detected (oops=${s.oops}, blocked=${s.blocked}). Stopping — no further actions. url=${s.url}`)
  }
  return s
}

// Click a button by exact trimmed text (within optional container selector)
async function clickButton(page, text, containerSel) {
  return await page.evaluate(
    (text, containerSel) => {
      const root = containerSel ? document.querySelector(containerSel) : document
      if (!root) return false
      const btn = [...root.querySelectorAll("button")].find((b) => (b.innerText || "").trim() === text)
      if (btn) {
        btn.click()
        return true
      }
      return false
    },
    text,
    containerSel
  )
}

// Capture signatures of visible non-search text inputs (to detect the newly-created value input)
async function valueInputSignatures(page) {
  return await page.evaluate(() => {
    return [...document.querySelectorAll("input")]
      .filter((i) => {
        if (i.type === "checkbox" || i.type === "hidden") return false
        const ph = i.placeholder || ""
        if (ph === "Search for companies, investors, and more") return false
        if (ph === "Find a filter...") return false
        const r = i.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })
      .map((i) => `${i.placeholder || ""}`)
  })
}

// Add one filter field (field typed in "Find a filter…", then click the matching option)
async function addFilterField(page, field) {
  // close any leftover dialog first
  await page.evaluate(() => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))).catch(() => {})
  await sleep(900)
  const opened = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Add Companies filter")
    if (btn) {
      btn.click()
      return true
    }
    return false
  })
  if (!opened) throw new Error("Could not find 'Add Companies filter' button")
  await sleep(jitter(2600))
  await checkHealth(page, `open filter dialog (${field})`)

  // focus a VISIBLE "Find a filter..." input (dialog may reuse stale hidden inputs)
  let focused = false
  for (let attempt = 1; attempt <= 3 && !focused; attempt++) {
    focused = await page.evaluate(() => {
      const inp = [...document.querySelectorAll("input")].find((i) => {
        if ((i.placeholder || "") !== "Find a filter...") return false
        const r = i.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })
      if (inp) {
        inp.focus()
        return true
      }
      return false
    })
    if (!focused) {
      // the dialog may not be open yet — wait and retry
      await sleep(2000 * attempt)
    }
  }
  if (!focused) throw new Error("Could not focus a visible 'Find a filter...' input")
  await sleep(jitter(800))
  await setInputText(page,field)
  await sleep(jitter(2600))
  await checkHealth(page, `filter search (${field})`)

  const pick = await page.evaluate((field) => {
    const opts = [...document.querySelectorAll(".mat-mdc-dialog-container li, .mat-mdc-dialog-container button")]
      .map((e) => (e.innerText || "").trim())
      .filter(Boolean)
    const clean = opts.filter((t) => !/^(Clear|Refresh)$/.test(t))
    // 1) exact Basic Info entry
    const exact = clean.find((t) => t === `Basic Info > ${field}`)
    if (exact) return { target: exact, candidates: clean.slice(0, 12) }
    // 2) token-derived match (rationalizes "Founder Location" → "Team > Founders > Person Info > Location")
    const toks = field.toLowerCase().split(/\s+/).filter(Boolean)
    const lastTok = toks[toks.length - 1]
    const containingAll = clean.filter((t) => {
      const lower = t.toLowerCase()
      return toks.every((tk) => lower.includes(tk))
    })
    const byLeaf = containingAll
      .filter((t) => {
        const leaf = t.split(">").pop().trim().toLowerCase()
        return leaf === lastTok || leaf.startsWith(lastTok)
      })
      .sort((a, b) => a.length - b.length)
    const any = byLeaf[0] || containingAll[0]
    return { target: any || null, candidates: clean.slice(0, 12), matchedVia: any ? "token" : null }
  }, field)
  if (!pick.target) {
    throw new Error(`No dialog option matched "${field}". Candidates:\n${pick.candidates.map((c) => "  " + c).join("\n")}`)
  }
  const clicked = await page.evaluate((t) => {
    const el = [...document.querySelectorAll(".mat-mdc-dialog-container li, .mat-mdc-dialog-container button")].find((e) => (e.innerText || "").trim() === t)
    if (el) {
      el.click()
      return true
    }
    return false
  }, pick.target)
  if (!clicked) throw new Error(`Could not click option "${pick.target}"`)
  await sleep(jitter(2600))
  await checkHealth(page, `after selecting ${field}`)
  return pick.target
}

// Set an operator on the just-added filter's mat-select (e.g. "does not include")
async function setOperator(page, optionText) {
  const rect = await page.evaluate(() => {
    const els = [...document.querySelectorAll(".component--operators")]
      .filter((e) => (e.innerText || "").trim() === "includes any" && e.getBoundingClientRect().width > 0)
    const e = els[els.length - 1] // newest filter row
    if (!e) return null
    const r = e.getBoundingClientRect()
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }
  })
  if (!rect) return false
  await page.mouse.click(rect.x, rect.y)
  await sleep(2500)
  const clicked = await page.evaluate((optionText) => {
    const opt = [...document.querySelectorAll(".mat-mdc-option, mat-option")].find((o) => (o.innerText || "").trim() === optionText)
    if (opt) {
      opt.click()
      return true
    }
    return false
  }, optionText)
  await sleep(2200)
  return clicked
}

// Set the value in the row of the filter just added (scoped to its .component--query-item)
async function setFilterValue(page, value) {
  // focus the text input inside the LAST real filter row
  let focused = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".component--query-item")].filter((r) => !/query-item-add/.test(r.className || ""))
    const row = rows[rows.length - 1]
    if (!row) return "no-row"
    const inp = [...row.querySelectorAll("input")].find((i) => {
      const r = i.getBoundingClientRect()
      return i.type !== "hidden" && i.type !== "checkbox" && r.width > 0 && (i.placeholder || "").length > 0
    })
    if (inp) {
      inp.focus()
      return true
    }
    // editor not open yet — open the value facet
    const vals = row.querySelector(".component--values")
    if (vals) {
      vals.click()
      return "opened"
    }
    return false
  })

  if (focused === "no-row") throw new Error("No filter row found to set value on")
  if (focused === "opened") {
    await sleep(jitter(1600))
    focused = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".component--query-item")].filter((r) => !/query-item-add/.test(r.className || ""))
      const row = rows[rows.length - 1]
      const inp = row && [...row.querySelectorAll("input")].find((i) => {
        const r = i.getBoundingClientRect()
        return i.type !== "hidden" && i.type !== "checkbox" && r.width > 0 && (i.placeholder || "").length > 0
      })
      if (inp) {
        inp.focus()
        return true
      }
      return false
    })
    if (!focused) throw new Error("Could not locate the value input after opening the value editor")
  } else if (focused === false) {
    throw new Error("Could not locate the value input for the new filter row")
  }

  await sleep(jitter(700))
  await setInputText(page,value)
  await sleep(jitter(2400))
  await checkHealth(page, `value input "${value}"`)

  const picked = await page.evaluate((value) => {
    const opts = [...document.querySelectorAll(".cdk-overlay-container [role=option], .cdk-overlay-pane li, mat-option")].map((e) => ({
      el: e,
      text: (e.innerText || "").trim()
    }))
    let target = opts.find((o) => o.text === value)
    if (!target) target = opts.find((o) => o.text.startsWith(value))
    if (target) {
      target.el.click()
      return true
    }
    return false
  }, value)
  if (!picked) throw new Error(`No autocomplete option matched "${value}"`)
  await sleep(jitter(2600))
  await checkHealth(page, `after selecting value "${value}"`)
}

// Save current query as a NEW saved search — never update an existing one
async function saveSearch(page, title_) {
  // Safety: we must be on a draft query, not an existing saved search
  const guard = await page.evaluate(() => ({
    url: location.href,
    hasSaveChanges: [...document.querySelectorAll("button")].some((b) => /^\s*save changes\s*$/i.test((b.innerText || "").trim()))
  }))
  if (/\/discover\/saved\//.test(guard.url) || guard.hasSaveChanges) {
    throw new Error("Refusing to save: the page is showing an EXISTING saved search (would update it). Navigate to a fresh Advanced Search first.")
  }

  const clickedSave = await clickButton(page, "Save Search")
  if (!clickedSave) throw new Error("Could not click 'Save Search'")
  await sleep(jitter(2400))
  await checkHealth(page, "Save Search menu")

  const menu = await page.evaluate(() => {
    return [...document.querySelectorAll(".mat-mdc-menu-panel button, [role=menuitem]")]
      .map((e) => (e.innerText || "").trim())
      .filter(Boolean)
  })
  if (!menu.includes("Create a Saved Search")) {
    throw new Error(`Save menu has no "Create a Saved Search" (menu: ${JSON.stringify(menu)}). Aborting to avoid altering an existing search.`)
  }
  const openedMenu = await page.evaluate(() => {
    const el = [...document.querySelectorAll(".mat-mdc-menu-panel button, [role=menuitem]")].find((e) => (e.innerText || "").trim() === "Create a Saved Search")
    if (el) {
      el.click()
      return true
    }
    return false
  })
  if (!openedMenu) throw new Error("Could not open 'Create a Saved Search'")
  await sleep(jitter(2800))
  await checkHealth(page, "Create Saved Search dialog")

  const nameFocused = await page.evaluate(() => {
    const dlg = document.querySelector(".mat-mdc-dialog-container, [role=dialog], .cdk-overlay-pane")
    const inp = (dlg || document).querySelector("input:not([type=hidden]):not([type=checkbox])")
    if (inp) {
      inp.focus()
      return true
    }
    return false
  })
  if (!nameFocused) throw new Error("Could not focus saved-search name input")
  await sleep(jitter(700))
  await setInputText(page,title_)
  await sleep(jitter(800))

  const saved = await page.evaluate(() => {
    const btn = [...document.querySelectorAll(".mat-mdc-dialog-container button, [role=dialog] button")].find((b) => /^\s*save search\s*$/i.test((b.innerText || "").trim()))
    if (btn) {
      btn.click()
      return true
    }
    return false
  })
  if (!saved) throw new Error("Could not confirm the saved-search dialog Save button")
  await sleep(6000)
  const st = await checkHealth(page, "after save")
  if (!/\/discover\/saved\//.test(st.url)) {
    throw new Error(`After save, URL does not look like a saved search: ${st.url}`)
  }
  return st.url
}

// Open a clean, unsaved draft Advanced Search page. Retries ONCE after a pause if the load
// briefly lands on Crunchbase's transient error page; otherwise fails hard.
async function openFreshDraft(page) {
  // best-effort: close any leftover overlay before navigating
  await page.evaluate(() => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))).catch(() => {})
  await sleep(1000)
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page
      .goto("https://www.crunchbase.com/discover/organization.companies", { waitUntil: "domcontentloaded", timeout: 60000 })
      .catch(() => {})
    await sleep(8000)
    await page.waitForNetworkIdle({ timeout: 8000 }).catch(() => {})
    await sleep(2500)
    const s = await page.evaluate(() => ({
      oops: document.body.innerText.includes("Oops"),
      blocked: document.body.innerText.includes("blocked"),
      url: location.href
    }))
    if (!s.oops && !s.blocked && !/\/discover\/saved\//.test(s.url)) {
      return s.url
    }
    console.log(
      `  ⚠ attempt ${attempt} landed on error state (oops=${s.oops}, blocked=${s.blocked}); pausing ${attempt * 12}s before ${attempt < 2 ? "retry" : "giving up"}…`
    )
    await sleep(attempt * 12000)
  }
  throw new Error("Could not load a clean draft Advanced Search page after 2 attempts.")
}

async function main() {
  console.log(`▶ Creating saved search "${title}"`)
  console.log(`  filters: ${filters.map((f) => `${f.field}=${f.value}`).join(", ")}`)

  const browser = await puppeteer.connect({ browserURL, defaultViewport: null })
  try {
    const pages = await browser.pages()
    let page = pages.find((p) => p.url().includes("crunchbase.com"))
    if (!page) page = await browser.newPage()
    await page.bringToFront()

    await setupMonitoring(page)

    const freshUrl = await openFreshDraft(page)
    console.log("  ↳ draft query confirmed:", freshUrl.slice(0, 85))

    for (const f of filters) {
      const picked = await addFilterField(page, f.field)
      console.log(`  ✔ filter added: ${picked}`)
      if (f.negate) {
        const ok = await setOperator(page, "does not include")
        if (!ok) throw new Error(`Could not set operator "does not include" for ${f.field}`)
        console.log("  ✔ operator: does not include")
      }
      await setFilterValue(page, f.value)
      console.log(`  ✔ value set: ${f.field} ${f.negate ? "≠" : "="} ${f.value}`)
    }

    const url = await saveSearch(page, title)
    console.log(`\n✅ SAVED SEARCH CREATED: ${title}`)
    console.log(`   ${url}`)
    if (outFile) {
      const fs = require("fs")
      fs.appendFileSync(outFile, `${title}\t${url}\n`)
      console.log(`   (appended to ${outFile})`)
    }
  } finally {
    await browser.disconnect()
  }
}

main().catch((e) => {
  dumpErrorEvents()
  console.error("❌ FAILED:", e.message)
  process.exit(1)
})
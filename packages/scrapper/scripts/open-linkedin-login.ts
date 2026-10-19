/**
 * Helper: open the persistent browser profile on LinkedIn so the user can log in.
 * The session cookies are saved back to .browser-profile on close.
 *
 * Usage: node -r ts-node/register scripts/open-linkedin-login.ts
 */
import { chromium } from "playwright"
import path from "path"

const BROWSER_PROFILE_DIR = path.join(__dirname, "../.browser-profile")

async function main() {
  console.log(`Opening browser with profile: ${BROWSER_PROFILE_DIR}`)
  console.log("Log into LinkedIn, then CLOSE the browser window to save the session.\n")

  const context = await chromium.launchPersistentContext(BROWSER_PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ]
  })

  const page = context.pages()[0] ?? (await context.newPage())
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false })
  })
  await page.goto("https://www.linkedin.com/checkpoint/challenge?", { waitUntil: "domcontentloaded" }).catch(() => {})
  await page.goto("https://www.linkedin.com/login", { waitUntil: "domcontentloaded" }).catch(() => {})

  context.on("close", () => {
    console.log("Browser closed. Session saved to profile.")
    process.exit(0)
  })
}

main().catch((err) => {
  console.error("Failed to open LinkedIn login:", err)
  process.exit(1)
})
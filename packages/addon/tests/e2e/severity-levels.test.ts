import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import type { BrowserContext, Page } from "playwright"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { getUrlForReasonLevel, type CategorizedUrl } from "../fixtures/test-urls"
import { launchBrowserWithExtension } from "../utils/browser"
import { markUrlAsTested } from "../utils/coverage"
import { navigateToUrl, safeClosePage, waitForBanner } from "../utils/extension"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SCREENSHOT_DIR = path.resolve(__dirname, "../../tmp/severity-screenshots")

/**
 * Modal container selector. The CSS module class is hashed at build time, so match on the
 * stable prefix and read the severity modifier from the same attribute.
 */
const MODAL_SELECTOR = '[class*="modalContainer"]'

type RenderedModal = {
  classNames: string
  backgroundColor: string
  color: string
}

/**
 * Waits until the modal's fade-in animation has finished.
 *
 * The banner renders inside a Plasmo shadow root, so `document.querySelector` cannot see it —
 * plain `page.waitForFunction` would never match. Locators pierce shadow DOM, so the opacity
 * is read through `locator.evaluate` instead.
 *
 * The fade gesture itself lives on `.modalWrapper` (`modalFadeIn`, 0.4s); screenshotting or
 * asserting before it settles captures a semi-transparent frame that misrepresents the colour.
 */
async function waitForModalSettled(page: Page): Promise<void> {
  const wrapper = page.locator('[class*="modalWrapper"]').first()
  await wrapper.waitFor({ state: "visible", timeout: 10000 })

  const deadline = Date.now() + 10000
  while (Date.now() < deadline) {
    const opacity = await wrapper.evaluate((element) => window.getComputedStyle(element).opacity)
    if (opacity === "1") {
      return
    }
    await page.waitForTimeout(50)
  }

  throw new Error("Banner modal did not finish fading in within 10s")
}

/**
 * Reads the modal's class list and its computed background colour.
 * Returns null when the modal is not in the DOM.
 */
async function readModal(page: Page): Promise<RenderedModal | null> {
  const modal = page.locator(MODAL_SELECTOR).first()
  if ((await modal.count()) === 0) {
    return null
  }

  const classNames = (await modal.getAttribute("class")) ?? ""
  const backgroundColor = await modal.evaluate((element) => window.getComputedStyle(element).backgroundColor)
  const color = await modal.evaluate((element) => window.getComputedStyle(element).color)

  return { classNames, backgroundColor, color }
}

/**
 * rgb() for a hex colour, so the assertion compares like with like.
 */
function rgbOf(hex: string): string {
  const value = hex.replace("#", "")
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

const RED_BG = rgbOf("#b72b00")
const YELLOW_BG = rgbOf("#ffc300")
/** Ink the yellow tier switches its text to; white cannot reach AA on #ffc300. */
const YELLOW_INK = rgbOf("#2b1d00")
const WHITE = rgbOf("#ffffff")

/**
 * Reads the modal and fails the test loudly if it is absent, so the assertions below
 * never need a non-null assertion.
 */
async function requireModal(page: Page): Promise<RenderedModal> {
  await waitForModalSettled(page)
  const modal = await readModal(page)
  if (modal === null) {
    throw new Error(`Banner modal not found on ${page.url()}`)
  }
  return modal
}

describe("Banner severity levels", () => {
  let context: BrowserContext

  beforeAll(async () => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
    const result = await launchBrowserWithExtension()
    context = result.context
  })

  afterAll(async () => {
    await context.close().catch(() => {})
  })

  describe("yellow tier (indirect connection)", () => {
    let page: Page
    let testUrl: CategorizedUrl

    beforeAll(async () => {
      testUrl = getUrlForReasonLevel("yellow")
      console.log(`[TEST] Yellow-tier URL: ${testUrl.url} (reasons: ${testUrl.reasons.join(",")})`)

      page = await context.newPage()
      const navigated = await navigateToUrl(page, testUrl.url)
      if (!navigated) {
        throw new Error(`Failed to navigate to yellow-tier URL ${testUrl.url}`)
      }
      await waitForBanner(page)
    })

    afterAll(async () => {
      await safeClosePage(page)
    })

    it("renders the modal with the yellow severity modifier", async () => {
      const modal = await requireModal(page)
      expect(modal.classNames).toContain("modalContainerYellow")
      markUrlAsTested(testUrl.url, testUrl.ruleType, testUrl.reasons)
    })

    it("paints the modal with the yellow background", async () => {
      const modal = await requireModal(page)
      expect(modal.backgroundColor).toBe(YELLOW_BG)
    })

    it("switches the modal text to ink so it stays readable on yellow", async () => {
      // White on #ffc300 is 1.61:1 — below AA — so the yellow tier must flip its text colour.
      const modal = await requireModal(page)
      expect(modal.color).toBe(YELLOW_INK)
    })

    it("keeps the reason text readable against the yellow background", async () => {
      await requireModal(page)
      const content = page.locator('[class*="modalContentWrapper"]').first()
      const contentColor = await content.evaluate((element) => window.getComputedStyle(element).color)
      expect(contentColor).toBe(YELLOW_INK)
    })

    it("captures a screenshot of the yellow modal", async () => {
      const file = path.join(SCREENSHOT_DIR, "banner-yellow.png")
      await page.screenshot({ path: file, fullPage: false })
      expect(fs.existsSync(file)).toBe(true)
      console.log(`[TEST] Screenshot: ${file}`)
    })
  })

  describe("red tier (direct connection)", () => {
    let page: Page
    let testUrl: CategorizedUrl

    beforeAll(async () => {
      testUrl = getUrlForReasonLevel("red")
      console.log(`[TEST] Red-tier URL: ${testUrl.url} (reasons: ${testUrl.reasons.join(",")})`)

      page = await context.newPage()
      const navigated = await navigateToUrl(page, testUrl.url)
      if (!navigated) {
        throw new Error(`Failed to navigate to red-tier URL ${testUrl.url}`)
      }
      await waitForBanner(page)
    })

    afterAll(async () => {
      await safeClosePage(page)
    })

    it("renders the modal without the yellow severity modifier", async () => {
      const modal = await requireModal(page)
      expect(modal.classNames).not.toContain("modalContainerYellow")
    })

    it("paints the modal with the unchanged red background", async () => {
      const modal = await requireModal(page)
      expect(modal.backgroundColor).toBe(RED_BG)
    })

    it("keeps white body text on the red background", async () => {
      const modal = await requireModal(page)
      expect(modal.color).toBe(WHITE)
    })

    it("captures a screenshot of the red modal", async () => {
      const file = path.join(SCREENSHOT_DIR, "banner-red.png")
      await page.screenshot({ path: file, fullPage: false })
      expect(fs.existsSync(file)).toBe(true)
      console.log(`[TEST] Screenshot: ${file}`)
    })
  })
})

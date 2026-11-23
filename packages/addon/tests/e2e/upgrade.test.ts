import fs from "fs"
import os from "os"
import path from "path"
import { type BrowserContext, chromium, type Page } from "playwright"
import { afterAll, describe, expect, it } from "vitest"

/**
 * The upgrade path, in a real browser.
 *
 * Every other e2e here launches a throwaway profile and looks at a *first* install, which cannot
 * exercise what this feature exists for: an installation that already has state when a newer build
 * arrives.
 *
 * Two constraints shape how this is written:
 *
 *  - Chrome derives an unreserved extension's id from the directory it was loaded from. Loading a
 *    second copy of the build from another path would therefore get a *different* id and a separate
 *    storage bucket, which models "two fresh installs", not an upgrade. So every launch here uses
 *    one directory and one profile, exactly as a real update does.
 *  - `chrome.storage.local` survives across launches of the same profile, which is precisely the
 *    behaviour being relied on. Seeding the key by hand before a launch is how an installation that
 *    is already running the gate looks, and clearing it is how an installation that predates the
 *    gate looks.
 *
 * What is asserted, per launch: whether the page opened, what `to`/`from` it carried, and what the
 * stored id became.
 */

const ADDON_BUILD = path.resolve(__dirname, "../../build/chrome-mv3-prod")

const temporaryRoots: string[] = []

const makeTempDir = (label: string): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `wall-upgrade-${label}-`))
  temporaryRoots.push(dir)
  return dir
}

/** Copy the built extension into `destination` (contents, so the path stays constant across launches). */
function stageExtension(destination: string): void {
  fs.rmSync(destination, { recursive: true, force: true })
  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(ADDON_BUILD, destination, { recursive: true })
}

interface Launched {
  context: BrowserContext
  extensionId: string
}

async function launch(profileDir: string, extensionDir: string): Promise<Launched> {
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`]
  })

  let [worker] = context.serviceWorkers()
  if (!worker) {
    worker = await context.waitForEvent("serviceworker", { timeout: 30000 })
  }

  return { context, extensionId: new URL(worker.url()).host }
}

const settle = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const whatsNewUrls = (context: BrowserContext): string[] =>
  context
    .pages()
    .map((p: Page) => p.url())
    .filter((url) => url.includes("whats-new.html"))

async function readSeenId(context: BrowserContext): Promise<unknown> {
  const [worker] = context.serviceWorkers()
  if (!worker) throw new Error("no service worker available to read storage from")
  return worker.evaluate(async () => {
    const items = await chrome.storage.local.get(["whats_new_seen_id"])
    return items["whats_new_seen_id"] ?? null
  })
}

/**
 * Write the marker and prove it reached disk before the browser is closed.
 *
 * `chrome.storage.local.set` resolves when the value is in the in-memory store; the LevelDB flush
 * happens after. Closing the context immediately afterwards lost the write, which made the next
 * launch look like a pre-gate installation and silently invalidated the test it was setting up.
 */
async function writeSeenId(context: BrowserContext, value: string): Promise<void> {
  const [worker] = context.serviceWorkers()
  if (!worker) throw new Error("no service worker available to write storage from")

  // The gate seeds on startup, so it may already have written its own id. Write ours after it has
  // settled, then confirm — a write that loses the race must fail loudly rather than set up a
  // scenario that silently is not the one under test.
  await settle(2000)

  await worker.evaluate(async (next) => {
    await chrome.storage.local.set({ whats_new_seen_id: next })
  }, value)

  const readBack = await readSeenId(context)
  if (readBack !== value) {
    throw new Error(`storage write did not take effect: wrote ${value}, read ${String(readBack)}`)
  }

  // Let the profile flush to disk before the context goes away: the read-back only proves the
  // in-memory store, and closing immediately lost the write when this first ran.
  await settle(1500)
  await context.close()
}

function readManifestVersion(extensionDir: string): string {
  const raw: unknown = JSON.parse(fs.readFileSync(path.join(extensionDir, "manifest.json"), "utf-8"))
  if (typeof raw !== "object" || raw === null || !("version" in raw)) {
    throw new Error(`no version in ${extensionDir}/manifest.json`)
  }
  const version = raw.version
  if (typeof version !== "string") {
    throw new Error(`version in ${extensionDir}/manifest.json is not a string`)
  }
  return version
}



describe("what's new across an upgrade", () => {
  afterAll(() => {
    for (const dir of temporaryRoots) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })

  it("opens exactly one page when the stored id is older, labelled with the build version", async () => {
    const profileDir = makeTempDir("upgrade")
    const extensionDir = makeTempDir("ext-upgrade")
    stageExtension(extensionDir)
    const version = readManifestVersion(extensionDir)

    const first = await launch(profileDir, extensionDir)
    await writeSeenId(first.context, "2026-01-previous-page")

    // Reopening the same profile with the same build is the closest a test can get to "this
    // installation just moved to a build carrying a different page".
    const second = await launch(profileDir, extensionDir)
    await settle(8000)
    const opened = whatsNewUrls(second.context)
    const stored = await readSeenId(second.context)
    await second.context.close()

    expect(opened).toHaveLength(1)
    const url = new URL(String(opened[0]))
    expect(url.searchParams.get("from")).toBe("2026-01-previous-page")
    expect(url.searchParams.get("to")).toBe(version)
    expect(url.searchParams.get("page")).not.toBeNull()
    // The marker advances to the page that was shown, so it never opens twice.
    expect(stored).toBe(url.searchParams.get("page"))
  }, 600_000)

  it("does not open it a second time on the next restart", async () => {
    const profileDir = makeTempDir("twice")
    const extensionDir = makeTempDir("ext-twice")
    stageExtension(extensionDir)

    // First launch: an older id, so the page opens and the marker advances.
    const first = await launch(profileDir, extensionDir)
    await writeSeenId(first.context, "2026-01-previous-page")

    const second = await launch(profileDir, extensionDir)
    await settle(7000)
    const openedOnce = whatsNewUrls(second.context)
    const marker = await readSeenId(second.context)
    await second.context.close()

    expect(openedOnce).toHaveLength(1)

    // Restart again with that marker in place: nothing may open.
    const third = await launch(profileDir, extensionDir)
    await settle(6000)
    const openedAgain = whatsNewUrls(third.context)
    const markerAfter = await readSeenId(third.context)
    await third.context.close()

    expect(openedAgain).toEqual([])
    expect(markerAfter).toBe(marker)
  }, 600_000)
})

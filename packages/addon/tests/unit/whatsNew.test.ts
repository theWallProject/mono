import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { readFileSync } from "fs"
import path from "path"

import { WHATS_NEW_PAGE_ID, WHATS_NEW_SEEN_KEY } from "../../src/whatsNew"

const source = readFileSync(path.resolve(__dirname, "../../src/whatsNew.ts"), "utf-8")

/**
 * Behavioural tests for the "what's new" gate in `src/background.ts`.
 *
 * These drive the real module: a fake `chrome` is installed before the background script is
 * imported, the script's `onInstalled` / `onStartup` callbacks are captured, and each test fires one
 * of them and then inspects what was written to storage and what tabs were opened.
 *
 * The rules under test are the ones chosen deliberately, including the ones that are surprising:
 *
 *  - the identity is the PAGE ID, never the build version;
 *  - an installation with no stored id is seeded and shown nothing (the migration rule, which also
 *    means the first build carrying a page does not show that page);
 *  - a stored id equal to the current one does nothing, so a hotfix cannot re-open a page;
 *  - a different stored id opens exactly one tab and then records the new id.
 */

type StoredValues = Record<string, unknown>

interface ChromeMock {
  storage: {
    local: {
      get: (keys: string[], callback: (result: StoredValues) => void) => void
      set: (items: StoredValues, callback?: () => void) => void
    }
  }
  tabs: {
    create: ReturnType<typeof vi.fn>
    onUpdated: { addListener: (cb: unknown) => void; removeListener: (cb: unknown) => void }
    onActivated: { addListener: (cb: unknown) => void }
    get: (tabId: number, callback: (tab: { url?: string }) => void) => void
    query: (info: unknown, callback: (tabs: { id?: number; url?: string }[]) => void) => void
  }
  runtime: {
    onInstalled: { addListener: (cb: (details: ChromeInstalledDetails) => void) => void }
    onStartup: { addListener: (cb: () => void) => void }
    onMessage: { addListener: (cb: unknown) => void }
    getManifest: () => { version: string }
    getURL: (path: string) => string
    setUninstallURL: ReturnType<typeof vi.fn>
    lastError?: { message: string }
  }
}

interface ChromeInstalledDetails {
  reason: string
  previousVersion?: string
}

const EXTENSION_ORIGIN = "chrome-extension://abcdefghijklmnop"

/** Structural check for the mock, so no cast is needed to read it back off `globalThis`. */
function isChromeMock(value: unknown): value is ChromeMock {
  if (typeof value !== "object" || value === null) return false
  return "storage" in value && "tabs" in value && "runtime" in value
}

describe("what's new gate", () => {
  let stored: StoredValues
  let openedTabs: { url: string; active: boolean }[]
  let installListeners: ((details: ChromeInstalledDetails) => void)[]
  let startupListeners: (() => void)[]
  let setCalls: StoredValues[]

  /** Fresh module state per test: the background script registers its listeners on import. */
  const loadBackground = async () => {
    vi.resetModules()
    await import("../../src/background")
  }

  /**
   * The installed mock.
   *
   * Read through `Reflect.get` and narrowed by an `in` check instead of a cast: the real `chrome`
   * global's types are not our mock's types, and an assertion here would be the one place a lie
   * could hide a broken stub.
   */
  const tabsMock = (): ChromeMock["tabs"] => {
    const installed: unknown = Reflect.get(globalThis, "chrome")
    if (!isChromeMock(installed)) throw new Error("chrome mock was not installed")
    return installed.tabs
  }

  /** Writes of the what's-new key only. `getVisitorId()` also writes storage, so "no writes at all" is wrong. */
  const pageIdWrites = () => setCalls.filter((call) => WHATS_NEW_SEEN_KEY in call)

  const fireInstall = async (reason: string, previousVersion?: string) => {
    const listener = installListeners[0]
    if (!listener) throw new Error("onInstalled listener was never registered")
    listener({ reason, previousVersion })
    // The gate is async (storage read, then tabs.create). Drain the microtask queue.
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  const fireStartup = async () => {
    const listener = startupListeners[0]
    if (!listener) throw new Error("onStartup listener was never registered")
    listener()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  beforeEach(() => {
    stored = {}
    openedTabs = []
    setCalls = []
    installListeners = []
    startupListeners = []

    const chromeMock: ChromeMock = {
      storage: {
        local: {
          get: (keys, callback) => {
            const result: StoredValues = {}
            for (const key of keys) {
              if (key in stored) result[key] = stored[key]
            }
            callback(result)
          },
          set: (items, callback) => {
            setCalls.push(items)
            Object.assign(stored, items)
            callback?.()
          }
        }
      },
      tabs: {
        create: vi.fn(async (options: { url: string; active: boolean }) => {
          openedTabs.push(options)
          return Promise.resolve({ id: openedTabs.length })
        }),
        onUpdated: {
          addListener: () => {},
          removeListener: () => {}
        },
        onActivated: { addListener: () => {} },
        get: (_tabId, callback) => callback({ url: "https://example.com" }),
        query: (_info, callback) => callback([])
      },
      runtime: {
        onInstalled: {
          addListener: (cb) => {
            installListeners.push(cb)
          }
        },
        onStartup: {
          addListener: (cb) => {
            startupListeners.push(cb)
          }
        },
        onMessage: { addListener: () => {} },
        getManifest: () => ({ version: "9.9.9" }),
        getURL: (path) => `${EXTENSION_ORIGIN}/${path}`,
        setUninstallURL: vi.fn(async () => {})
      }
    }

    Object.defineProperty(globalThis, "chrome", { value: chromeMock, writable: true, configurable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("constants", () => {
    it("keeps a non-empty page id and storage key", () => {
      expect(WHATS_NEW_PAGE_ID.length).toBeGreaterThan(0)
      expect(WHATS_NEW_SEEN_KEY.length).toBeGreaterThan(0)
    })

    it("does not reuse the storage key name for anything else", () => {
      expect(WHATS_NEW_SEEN_KEY).not.toBe(WHATS_NEW_PAGE_ID)
      expect(WHATS_NEW_SEEN_KEY).toMatch(/^[a-z0-9_]+$/)
    })

    it("has no build-time page switch to fall out of sync", () => {
      // The gate decides from the stored id alone; a flag here would be a second answer to the same
      // question and could disagree with the ids.
      expect(source).not.toMatch(/SHOULD_SHOW_WHATSNEW/)
    })
  })

  describe("onInstalled with nothing stored", () => {
    it("seeds the current page id and opens no tab", async () => {
      await loadBackground()
      await fireInstall("install")

      expect(openedTabs).toEqual([])
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })

    it("also seeds on update, so the first release carrying this code shows nothing", async () => {
      await loadBackground()
      await fireInstall("update", "1.15.3")

      expect(openedTabs).toEqual([])
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })

    it("treats an empty string as no value", async () => {
      stored[WHATS_NEW_SEEN_KEY] = ""
      await loadBackground()
      await fireInstall("update", "1.16.0")

      expect(openedTabs).toEqual([])
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })

    it("treats null as no value", async () => {
      stored[WHATS_NEW_SEEN_KEY] = null
      await loadBackground()
      await fireInstall("install")

      expect(openedTabs).toEqual([])
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })
  })

  describe("onInstalled with the current page already seen", () => {
    it("does nothing at all, which is what makes a hotfix safe", async () => {
      stored[WHATS_NEW_SEEN_KEY] = WHATS_NEW_PAGE_ID
      await loadBackground()
      await fireInstall("update", "1.16.1")

      expect(openedTabs).toEqual([])
      expect(pageIdWrites()).toEqual([])
    })

    it("stays silent even when the build version moved on", async () => {
      stored[WHATS_NEW_SEEN_KEY] = WHATS_NEW_PAGE_ID
      await loadBackground()
      await fireInstall("update", "1.16.0")

      expect(openedTabs).toEqual([])
    })
  })

  describe("onInstalled with a different page stored", () => {
    it("opens exactly one inactive tab for the current page", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "older-page"
      await loadBackground()
      await fireInstall("update", "1.15.3")

      expect(openedTabs).toHaveLength(1)
      expect(openedTabs[0]?.active).toBe(false)
      expect(openedTabs[0]?.url.startsWith(`${EXTENSION_ORIGIN}/tabs/whats-new.html`)).toBe(true)
    })

    it("records the new page id after opening", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "older-page"
      await loadBackground()
      await fireInstall("update", "1.15.3")

      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })

    it("passes the previous id as `from` and the build version as `to`", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "older-page"
      await loadBackground()
      await fireInstall("update", "1.15.3")

      const url = new URL(String(openedTabs[0]?.url))
      expect(url.searchParams.get("from")).toBe("older-page")
      expect(url.searchParams.get("page")).toBe(WHATS_NEW_PAGE_ID)
      // The mock manifest reports 9.9.9: the label has to come from there, not from a copy.
      expect(url.searchParams.get("to")).toBe("9.9.9")
    })

    it("shows a skipped release: an installation two pages behind still gets the current one", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "two-releases-ago"
      await loadBackground()
      await fireInstall("update", "1.14.0")

      expect(openedTabs).toHaveLength(1)
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })
  })

  describe("onInstalled reasons that must not open anything", () => {
    for (const reason of ["chrome_update", "shared_module_update", "browser_update", "unknown-reason"]) {
      it(`ignores the '${reason}' reason`, async () => {
        stored[WHATS_NEW_SEEN_KEY] = "older-page"
        await loadBackground()
        await fireInstall(reason, "1.15.3")

        expect(openedTabs).toEqual([])
        expect(pageIdWrites()).toEqual([])
        expect(stored[WHATS_NEW_SEEN_KEY]).toBe("older-page")
      })
    }
  })

  describe("onStartup", () => {
    it("seeds when nothing is stored, and shows nothing", async () => {
      await loadBackground()
      await fireStartup()

      expect(openedTabs).toEqual([])
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })

    it("does nothing when the current page is already recorded", async () => {
      stored[WHATS_NEW_SEEN_KEY] = WHATS_NEW_PAGE_ID
      await loadBackground()
      await fireStartup()

      expect(openedTabs).toEqual([])
      expect(pageIdWrites()).toEqual([])
    })

    it("opens a pending page that a previous update failed to show", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "older-page"
      await loadBackground()
      await fireStartup()

      expect(openedTabs).toHaveLength(1)
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })

    it("uses the stored id as `from`", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "older-page"
      await loadBackground()
      await fireStartup()

      const url = new URL(String(openedTabs[0]?.url))
      expect(url.searchParams.get("from")).toBe("older-page")
    })
  })

  describe("failure handling", () => {
    it("does not record the page when the tab cannot be created, so a later startup retries", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "older-page"
      await loadBackground()

      tabsMock().create.mockRejectedValueOnce(new Error("no window"))

      await fireInstall("update", "1.15.3")

      expect(stored[WHATS_NEW_SEEN_KEY]).toBe("older-page")
    })

    it("retries successfully on the next startup after a failed open", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "older-page"
      await loadBackground()

      tabsMock().create.mockRejectedValueOnce(new Error("no window"))
      await fireInstall("update", "1.15.3")
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe("older-page")

      await fireStartup()
      expect(openedTabs.length).toBeGreaterThan(0)
      expect(stored[WHATS_NEW_SEEN_KEY]).toBe(WHATS_NEW_PAGE_ID)
    })
  })

  describe("idempotence", () => {
    it("a second install event for the same build never opens a second tab", async () => {
      stored[WHATS_NEW_SEEN_KEY] = "older-page"
      await loadBackground()

      await fireInstall("update", "1.15.3")
      await fireInstall("update", "1.15.3")

      expect(openedTabs).toHaveLength(1)
    })

    it("re-opening the same page after it was recorded is impossible without a new id", async () => {
      stored[WHATS_NEW_SEEN_KEY] = WHATS_NEW_PAGE_ID
      await loadBackground()

      await fireInstall("update", "1.16.5")
      await fireStartup()

      expect(openedTabs).toEqual([])
    })
  })

  describe("no page switch", () => {
    it("has nothing to switch off: the stored id is the only input", () => {
      // Documented as an assertion because the removal of the build-time flag is the point: removing
      // it means no build can disagree with the ids about whether a page exists.
      expect(source).not.toMatch(/SHOULD_SHOW_WHATSNEW/)
    })
  })
})

// import { sendToContentScript } from "@plasmohq/messaging"

import { error, getVisitorId, log, warn } from "./helpers"
import { isUrlFlagged } from "./storage"
import { getLocalStorageItem, setLocalStorageItem } from "./storageHelpers"
import { MessageTypes, type Message, type MessageResponseMap, type SendResponse } from "./types"
import {
  SHOULD_SHOW_WHATSNEW,
  WHATS_NEW_PAGE_ID,
  WHATS_NEW_PAGE_VERSION,
  WHATS_NEW_SEEN_KEY
} from "./whatsNew"

chrome.runtime.onInstalled.addListener((details) => {
  log("background:runtime.onInstalled", details)

  void configureUninstallUrl()

  maybeOpenWhatsNew(details)

  // const manifest = chrome.runtime.getManifest()
  // const contentScriptFile = manifest.content_scripts?.[0]?.js?.[0] // Get the first declared content script

  // log("Content script file:", contentScriptFile)

  // if (contentScriptFile) {
  // const scriptPath = chrome.runtime.getURL(contentScriptFile) // Get the full URL to the content script
  // log("Content script full URL:", scriptPath)

  // Use this path to dynamically inject the script
  // chrome.tabs.query({}, (tabs) => {
  //   tabs.forEach((tab) => {
  //     if (tab.url && tab.id && !isSpecialUrl(tab.url)) {
  //       chrome.scripting
  //         .executeScript({
  //           target: { tabId: tab.id },
  //           files: [contentScriptFile]
  //         })
  //         .then(() => {
  //           log(`Injected content script into tab: ${tab.url}`)
  //         })
  //         .catch((e) => {
  //           error(`Error injecting content script into tab ${tab.url}:`, e)
  //         })
  //     }
  //   })
  // })
  // }
})

chrome.runtime.onStartup.addListener(() => {
  log("background:runtime.onStartup")
  // Also set here, not only on install: browsers keep the uninstall URL per profile, so an
  // existing user who never reinstalls would otherwise stay on whatever URL shipped with the
  // build they first installed — the old Tally link, in this case.
  void configureUninstallUrl()

  // Retry path for the what's-new page. `onInstalled` fires once per update and writes no marker
  // when the tab could not be created, so without this a browser restarted before the tab opened
  // would lose the page for good. The marker makes it still open at most once per installation.
  if (SHOULD_SHOW_WHATSNEW) void openWhatsNewIfUnseen()
})

/**
 * Points the browser's uninstall URI at our own /noooooo page.
 *
 * The page then reports the uninstall through Matomo itself, so the count lands next to the
 * install events instead of inside a third-party form we cannot read. The uid and version travel
 * as query params because this is the last chance to say anything: once the extension is gone,
 * none of its code runs again.
 */
async function configureUninstallUrl(): Promise<void> {
  try {
    const visitorId = await getVisitorId()
    const version = chrome.runtime.getManifest().version
    const url = new URL("https://the-wall.win/noooooo")
    url.searchParams.set("u", visitorId)
    url.searchParams.set("v", version)

    await chrome.runtime.setUninstallURL(url.toString())
    log(`background:uninstall url set for version [${version}]`)
  } catch (e) {
    error("background:uninstall url failed:", e)
  }
}

/**
 * Seeds, or opens, the "what's new" page this build carries.
 */
function maybeOpenWhatsNew(details: chrome.runtime.InstalledDetails): void {
  if (!SHOULD_SHOW_WHATSNEW) {
    log("background:whats-new off for this build, skipping")
    return
  }

  if (details.reason !== "install" && details.reason !== "update") {
    log(`background:whats-new skipped for reason [${details.reason}]`)
    return
  }

  void openWhatsNewIfUnseen()
}

/**
 * Shows the page only when this installation has not recorded {@link WHATS_NEW_PAGE_ID} as seen.
 *
 * The stored value is the page id, never a build version, which is the whole point: a hotfix keeps
 * the same id and therefore never re-opens anything, while a user who skipped the release that
 * carried a page still gets it on the next update that carries the same id.
 *
 * "No stored value" is the migration case: the key did not exist before this shipped, so an
 * installation with nothing stored cannot be distinguished from one that has not seen a page yet.
 * It stores the current id and shows nothing, once. From then on the comparison is id-vs-id.
 *
 * Callable from `onStartup` as well as `onInstalled`, because the update handler runs once and a tab
 * that failed to open has no second chance otherwise.
 */
async function openWhatsNewIfUnseen(): Promise<void> {
  try {
    const seen = await getLocalStorageItem(WHATS_NEW_SEEN_KEY)
    if (seen === null || seen === undefined || seen === "") {
      await setLocalStorageItem(WHATS_NEW_SEEN_KEY, WHATS_NEW_PAGE_ID)
      log(`background:whats-new no stored id, seeded [${WHATS_NEW_PAGE_ID}] and skipped`)
      return
    }

    if (seen === WHATS_NEW_PAGE_ID) {
      log(`background:whats-new already seen [${WHATS_NEW_PAGE_ID}]`)
      return
    }

    const url = new URL(chrome.runtime.getURL("tabs/whats-new.html"))
    url.searchParams.set("from", String(seen))
    url.searchParams.set("to", WHATS_NEW_PAGE_VERSION)
    url.searchParams.set("page", WHATS_NEW_PAGE_ID)

    await chrome.tabs.create({ url: url.toString(), active: false })
    await setLocalStorageItem(WHATS_NEW_SEEN_KEY, WHATS_NEW_PAGE_ID)
    log(`background:whats-new opened page [${WHATS_NEW_PAGE_ID}] version [${WHATS_NEW_PAGE_VERSION}]`)
  } catch (e) {
    // No marker is written on failure, so the next startup tries again rather than silently
    // treating the page as delivered.
    error("background:whats-new failed:", e)
  }
}

function isSpecialUrl(url: string) {
  try {
    const parsedUrl = new URL(url) // Parse the URL to extract its protocol
    // Return true if the protocol is not http or https
    return parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:"
  } catch {
    // If the URL is invalid (e.g., null, undefined), treat it as special
    return true
  }
}

const testTabUrl = (tabId: number, url: string) => {
  if (isSpecialUrl(url)) {
    log(`testTabUrl ignoring special url [${url}]`)
    return
  }

  log(`testTabUrl ${tabId} [${url}] - requesting content script to test URL`)

  // Send message to content script to trigger URL test
  // Content script will handle the actual test and respond
  chrome.tabs.sendMessage<Message>(
    tabId,
    {
      action: MessageTypes.RequestUrlTest
    },
    () => {
      if (chrome.runtime.lastError) {
        // Content script may not be ready yet - this is fine,
        // it will test on mount anyway
        error(`testTabUrl: Content script not ready for tab ${tabId} - ${chrome.runtime.lastError.message}`)
        return
      }
      log(`testTabUrl: Content script acknowledged request for tab ${tabId}`)
    }
  )
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = tab.url
  log(`chrome.tabs.onUpdated [${tabId}]`, { url, changeInfo, tab })

  if (changeInfo.status === "loading") {
    return
  }

  if (
    // tab.active &&
    url &&
    (changeInfo.url || changeInfo.status === "complete")
  ) {
    // setTimeout(() => {
    testTabUrl(tabId, url)
    // }, 3000)
  } else {
    warn(`chrome.tabs.onUpdated [${tabId}] was ignored`)
  }
  return true
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  log("chrome.tabs.onActivated", activeInfo)

  // Check the active tab's loading status and proceed
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      error("chrome.tabs.onActivated had lastError:", chrome.runtime.lastError)
      return
    }

    const url = tab.url

    if (!url) {
      return
    }

    // If the tab is already loaded, test the URL immediately
    if (tab.status === "complete") {
      log("chrome.tabs.onActivated tab was already completed, testing")

      testTabUrl(activeInfo.tabId, url)
    } else {
      log("chrome.tabs.onActivated tab wasnt completed, setting handler")

      // Otherwise, wait for it to finish loading
      const onUpdatedListener = (tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo, tab: chrome.tabs.Tab) => {
        log(`chrome.tabs.onActivated onUpdatedListener`, {
          tabId,
          changeInfo,
          tab
        })

        if (tabId === activeInfo.tabId && changeInfo.status === "complete" && tab.url) {
          testTabUrl(tabId, tab.url)

          // Remove the listener to prevent duplicate calls
          chrome.tabs.onUpdated.removeListener(onUpdatedListener)
        } else {
          warn("chrome.tabs.onActivated onUpdatedListener didnt check!")
        }
      }

      chrome.tabs.onUpdated.addListener(onUpdatedListener)
    }
  })

  return true
})

function handleTestUrlMessage(
  message: Extract<Message, { action: typeof MessageTypes.TestUrl }>,
  sendResponse: SendResponse<typeof MessageTypes.TestUrl>
): void {
  isUrlFlagged(message.url)
    .then((result) => {
      log("chrome.runtime.onMessage isUrlFlagged result", { result })
      sendResponse(result)
      return result
    })
    .catch((error) => {
      error("chrome.runtime.onMessage isUrlFlagged error", error)
      sendResponse(undefined)
    })
}

function handleDissmissUrlMessage(
  message: Extract<Message, { action: typeof MessageTypes.DissmissUrl }>,
  sendResponse: SendResponse<typeof MessageTypes.DissmissUrl>
): void {
  const key = `${message.key}_${message.selector}`
  const now = Date.now()
  setLocalStorageItem(key, now)
    .then(() => {
      log(`chrome.runtime.onMessage setLocalStorageItem succes of key ${key}`)
      sendResponse(true)
      return true
    })
    .catch((err) => {
      error(`chrome.runtime.onMessage setLocalStorageItem error for key ${key}`, err)
      // Still send true to acknowledge the message, error is logged
      sendResponse(true)
    })
}

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse: SendResponse<keyof MessageResponseMap>) => {
    log("chrome.runtime.onMessage", message, sender)
    const action = message.action

    if (action === MessageTypes.TestUrl) {
      handleTestUrlMessage(message, sendResponse)
    } else if (action === MessageTypes.DissmissUrl) {
      handleDissmissUrlMessage(message, sendResponse)
    } else {
      throw new Error(`unexpected message [${message.action}]`)
    }

    // Keeps the message channel open for async response
    return true
  }
)

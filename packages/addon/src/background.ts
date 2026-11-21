// import { sendToContentScript } from "@plasmohq/messaging"

import { error, log, warn } from "./helpers"
import { isUrlFlagged } from "./storage"
import { setLocalStorageItem } from "./storageHelpers"
import { MessageTypes, type Message, type MessageResponseMap, type SendResponse } from "./types"
import { SHOULD_SHOW_WHATSNEW } from "./whatsNew"

chrome.runtime.onInstalled.addListener((details) => {
  log("background:runtime.onInstalled", details)

  // Set uninstall URL for feedback survey
  chrome.runtime.setUninstallURL("https://tally.so/r/Np0Jpl").catch((err) => {
    error("Failed to set uninstall URL:", err)
  })

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
})

/**
 * Opens the "what's new" page for a build that switched it on.
 *
 * There is no per-user "already shown" marker, and none is needed: onInstalled fires once per
 * install/update transition, and the `chrome_update` reason is excluded here, so one build with
 * SHOULD_SHOW_WHATSNEW on shows the page at most once per browser. What this must never do again is
 * decide "has this user seen this release" from a version list — that is what silently disarmed the
 * page whenever a release landed one version off the list.
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

  try {
    const currentVersion = chrome.runtime.getManifest().version
    const fromVersion = details.reason === "update" ? details.previousVersion || "unknown" : "install"
    const whatNewUrl = `${chrome.runtime.getURL("tabs/whats-new.html")}?from=${encodeURIComponent(fromVersion)}&to=${encodeURIComponent(currentVersion)}`
    log(`background:whats-new opening for version [${currentVersion}]`)
    chrome.tabs.create({ url: whatNewUrl, active: false }).catch((e: unknown) => {
      error("background:whats-new failed to open:", e)
    })
  } catch (e) {
    error("background:whats-new failed to build url:", e)
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

// import { sendToContentScript } from "@plasmohq/messaging"

import { error, log, warn } from "./helpers"
import { isUrlFlagged } from "./storage"
import {
  getWhatsNewShownVersions,
  markWhatsNewVersionAsShown,
  setStorageItem
} from "./storageHelpers"
import {
  MessageTypes,
  type Message,
  type MessageResponseMap,
  type SendResponse
} from "./types"

// Versions that should trigger the "what's new" page
// User controls which versions trigger it by adding versions to this array
const WHATS_NEW_VERSIONS = ["1.5.4"]

chrome.runtime.onInstalled.addListener(async (details) => {
  log("background:runtime.onInstalled", details)
  chrome.storage.session.clear(() => {
    log("cleared session [onInstalled]...")
  })

  // Check if we should show "what's new" page
  if (details.reason === "install" || details.reason === "update") {
    try {
      const manifest = chrome.runtime.getManifest()
      const currentVersion = manifest.version
      log(`Checking what's new for version ${currentVersion}`)

      // Check if this version should trigger the "what's new" page
      if (WHATS_NEW_VERSIONS.includes(currentVersion)) {
        // Check if this version has already been shown
        const shownVersions = await getWhatsNewShownVersions()
        if (!shownVersions.includes(currentVersion)) {
          log(`Opening what's new page for version ${currentVersion}`)
          // Open the what's new page
          chrome.tabs.create({
            url: chrome.runtime.getURL("tabs/whats-new.html")
          })
          // Mark this version as shown
          await markWhatsNewVersionAsShown(currentVersion)
        } else {
          log(`Version ${currentVersion} already shown, skipping what's new page`)
        }
      } else {
        log(`Version ${currentVersion} not in WHATS_NEW_VERSIONS, skipping`)
      }
    } catch (e) {
      error("Error checking what's new page:", e)
      // Don't fail hard - just log the error
    }
  }

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
  chrome.storage.session.clear(() => {
    log("cleared session...")
  })
})

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

const testTabUrl = async (tabId: number, url: string) => {
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
        error(
          `testTabUrl: Content script not ready for tab ${tabId} - ${chrome.runtime.lastError.message}`
        )
        return
      }
      log(`testTabUrl: Content script acknowledged request for tab ${tabId}`)
    }
  )
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
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
    await testTabUrl(tabId, url)
    // }, 3000)
  } else {
    warn(`chrome.tabs.onUpdated [${tabId}] was ignored`)
  }
  return true
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  log("chrome.tabs.onActivated", activeInfo)

  // Check the active tab's loading status and proceed
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
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

      await testTabUrl(activeInfo.tabId, url)
    } else {
      log("chrome.tabs.onActivated tab wasnt completed, setting handler")

      // Otherwise, wait for it to finish loading
      const onUpdatedListener = async (
        tabId: number,
        changeInfo: chrome.tabs.OnUpdatedInfo,
        tab: chrome.tabs.Tab
      ) => {
        log(`chrome.tabs.onActivated onUpdatedListener`, {
          tabId,
          changeInfo,
          tab
        })

        if (
          tabId === activeInfo.tabId &&
          changeInfo.status === "complete" &&
          tab.url
        ) {
          await testTabUrl(tabId, tab.url)

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

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender,
    sendResponse: SendResponse<keyof MessageResponseMap>
  ) => {
    log("chrome.runtime.onMessage", message, sender)
    const action = message.action

    if (action === MessageTypes.TestUrl) {
      isUrlFlagged(message.url).then((result) => {
        log("chrome.runtime.onMessage isUrlFlagged result", { result })

        sendResponse(result)
      })
    } else if (action === MessageTypes.DissmissUrl) {
      const key = `${message.key}_${message.selector}`
      const now = Date.now()
      setStorageItem(key, now).then(() => {
        log(`chrome.runtime.onMessage setStorageItem succes of key ${key}`)

        sendResponse(true)
      })
    } else {
      throw new Error(`unexpected message [${message.action}]`)
    }

    // Keeps the message channel open for async response
    return true
  }
)

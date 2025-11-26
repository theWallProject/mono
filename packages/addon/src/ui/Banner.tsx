/* eslint-disable import/order */
import React, { useEffect, useRef, useState } from "react"
import { toast, Toaster } from "react-hot-toast"

import { track } from "~helpers"

import icon16 from "../../assets/icon16.png"
import backgroundImage from "../../assets/images/flag-bg.jpg"
import theWallWhite from "../../assets/images/the-wall-white.png"
// import { log, warn } from "../helpers"
// import { share } from "../image_sharing/image"
import { ShareButton } from "../share_button/ShareButton"
import {
  getAllLocalStorageItems,
  getLocalStorageItem,
  removeLocalStorageItems,
  setLocalStorageItem
} from "../storageHelpers"
import { MessageTypes, type Message, type MessageResponseMap } from "../types"
import { Scene } from "./3d/scene"
import { Button } from "./Button"
// import { GraffitiEffect } from "./GraffitiEffect"
import style from "./style.module.css"

export const Banner = () => {
  const [isSharing, setIsSharing] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [areAlternativesShown, setAreAlternativesShown] = useState(false)

  const [testResult, setTestResult] =
    useState<MessageResponseMap[MessageTypes.TestUrl]>()
  const toastIdRef = useRef<string | null>(null)
  const isCheckingHintRef = useRef<boolean>(false)

  // Helper function to get today's date string (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  }

  // Check if a hint was shown today
  const wasHintShownToday = async (hintKey: string): Promise<boolean> => {
    const storageKey = `hint_shown_${hintKey}`
    const lastShownDate = await getLocalStorageItem<string>(storageKey)
    const today = getTodayDateString()
    return lastShownDate === today
  }

  // Mark a hint as shown today
  const markHintAsShownToday = async (hintKey: string) => {
    const storageKey = `hint_shown_${hintKey}`
    const today = getTodayDateString()
    await setLocalStorageItem(storageKey, today)

    // Clean up old entries (not from today) to prevent storage bloat
    const allItems = await getAllLocalStorageItems()
    const keysToRemove: string[] = []
    for (const key in allItems) {
      if (key.startsWith("hint_shown_")) {
        const lastShownDate = allItems[key] as string
        if (lastShownDate !== today) {
          keysToRemove.push(key)
        }
      }
    }
    if (keysToRemove.length > 0) {
      await removeLocalStorageItems(keysToRemove)
    }
  }

  // Helper function to ensure proper extension URL
  const getExtensionURL = (importedUrl: string) => {
    // If it's already a full extension URL, return as is
    if (
      importedUrl.startsWith("chrome-extension://") ||
      importedUrl.startsWith("safari-web-extension://")
    ) {
      return importedUrl
    }
    // Otherwise, convert it using chrome.runtime.getURL
    return chrome.runtime.getURL(importedUrl)
  }

  // Helper function to replace {{url}} placeholders with the current page URL
  const replacePlaceholders = (
    text: string | undefined,
    url: string,
    encodeForUrl: boolean = false
  ): string => {
    if (!text) return ""
    const replacement = encodeForUrl ? encodeURIComponent(url) : url
    return text.replace(/\{\{url\}\}/g, replacement)
  }

  const onDismissSessionClick = (key: string, selector: string) => {
    chrome.runtime.sendMessage<Message>(
      {
        action: MessageTypes.DissmissUrl,
        key,
        selector
      },
      () => {
        // log("onDismissSessionClick: Response from background:", response)
        setTimeout(() => {
          setTestResult(undefined)
        }, 1000)
      }
    )
  }

  const handleReportMistakeClick = () => {
    track("Button", "Click", "report_mistake")

    const currentUrl = window.location.href
    const mailtoLink = `mailto:the.wall.addon@proton.me?subject=Error Report&body=${encodeURIComponent(currentUrl)}`

    window.open(mailtoLink, "_blank")
  }

  useEffect(() => {
    const listener = (message: Message) => {
      if (message.action === MessageTypes.GetTestResult) {
        setTestResult(message.result)
      }
    }
    // log("inside use effect before adding listener")
    chrome.runtime.onMessage.addListener(listener)

    return () => {
      // warn("removing use effect. removing listener")

      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  // Show toast when hint result is received
  useEffect(() => {
    if (testResult?.isHint === true && !testResult.isDismissed) {
      // Create a unique key for this hint based on the rule selector
      const hintKey = testResult.rule.selector

      // Check if this hint was already shown today
      if (isCheckingHintRef.current) {
        return // Prevent multiple simultaneous checks
      }

      isCheckingHintRef.current = true
      wasHintShownToday(hintKey).then(async (wasShown) => {
        isCheckingHintRef.current = false

        if (wasShown) {
          // Hint was already shown today, don't show again
          return
        }

        // Mark this hint as shown today
        await markHintAsShownToday(hintKey)

        // Dismiss any existing hint toast to prevent duplicates
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current)
          toastIdRef.current = null
        }

        const currentUrl = window.location.href
        const processedHintUrl = replacePlaceholders(
          testResult.hintUrl,
          currentUrl,
          true
        )
        const processedHintText = replacePlaceholders(
          testResult.hintText,
          currentUrl,
          false
        )
        const toastId = `hint-${processedHintText}-${Date.now()}`

        const id = toast(
          () => (
            <div
              onClick={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              style={{
                padding: "12px 16px",
                color: "#e9e9e9",
                fontSize: "14px",
                lineHeight: "1.5",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                pointerEvents: "auto",
                maxWidth: "100%",
                boxSizing: "border-box"
              }}>
              <img
                src={getExtensionURL(icon16)}
                alt="The Wall"
                style={{
                  width: "20px",
                  height: "20px",
                  flexShrink: 0
                }}
              />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                {processedHintText}
              </span>
              {processedHintUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (processedHintUrl) {
                      window.open(
                        processedHintUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "4px",
                    color: "#e9e9e9",
                    cursor: "pointer",
                    padding: "4px 6px",
                    fontSize: "14px",
                    lineHeight: "1",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: "24px",
                    height: "24px",
                    fontFamily: "inherit",
                    marginLeft: "4px"
                  }}
                  title="Open link"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.2)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.1)"
                  }}>
                  🔗
                </button>
              )}
            </div>
          ),
          {
            id: toastId,
            duration: 10000,
            position: "top-center",
            style: {
              background: "#1b1b1b",
              color: "#e9e9e9",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              border: "1px solid #333",
              pointerEvents: "auto"
            }
          }
        )

        toastIdRef.current = id
      })
    } else {
      // Dismiss toast if hint is dismissed or no longer a hint
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null
      }
    }

    return () => {
      // Cleanup on unmount
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null
      }
    }
  }, [testResult])

  // If it's a hint, show toast and return early (no full modal)
  if (testResult?.isHint === true) {
    return (
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1b1b1b",
            color: "#e9e9e9",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            border: "1px solid #333"
          }
        }}
      />
    )
  }

  return testResult && !testResult.isDismissed ? (
    <div className={style.container} dir={chrome.i18n.getMessage("@@bidi_dir")}>
      <img src="https://the-wall.win/bg.gif?rec=1&action_name=wall" alt="" />
      <div
        className={style.bgLayer}
        style={{
          backgroundColor: "#121212",
          backgroundImage: `url(${getExtensionURL(backgroundImage)})`
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh"
        }}>
        <Scene isSharing={isSharing} isSkipping={isSkipping} />
      </div>
      <img
        src={getExtensionURL(theWallWhite)}
        className={style.theWallLogo}
        alt="The Wall Logo"
      />
      <div className={style.modalContainer}>
        <div className={style.modalMargin}>
          <div className={style.modalContentWrapper}>
            {testResult.reasons.map((reason) => {
              const companyName = `"${testResult.name}" ${testResult.stockSymbol ? `(${testResult.stockSymbol})` : ""}`

              switch (reason) {
                case "u":
                  return (
                    <div key={reason}>
                      {chrome.i18n.getMessage("reasonUrlIL", [companyName])}
                    </div>
                  )
                case "f":
                  return (
                    <div key={reason}>
                      {chrome.i18n.getMessage("reasonFounder", [companyName])}
                    </div>
                  )
                case "i":
                  return (
                    <div key={reason}>
                      {chrome.i18n.getMessage("reasonInvestor", [companyName])}
                    </div>
                  )
                case "h":
                  return (
                    <div key={reason}>
                      {chrome.i18n.getMessage("reasonHeadquarter", [
                        testResult.name
                      ])}
                    </div>
                  )
                case "b":
                  return (
                    <div key={reason}>
                      {chrome.i18n.getMessage("reasonBDS", [testResult.name])}
                    </div>
                  )

                default:
                  reason satisfies never
                  throw new Error(`unknown reason [${reason}]`)
              }
            })}
            {/* // todo: use or delete */}
            {testResult.comment ? <div>{testResult.comment}</div> : ""}
            {testResult.link ? <a href={testResult.link}>Link</a> : ""}
          </div>

          <div className={style.buttonsWrapper}>
            <ShareButton
              text={chrome.i18n.getMessage("sharingMessageText")}
              url={"https://the-wall.win"}
              onMouseEnter={() => setIsSharing(true)}
              onMouseLeave={() => setIsSharing(false)}
            />
            <Button
              title={chrome.i18n.getMessage("modalDismissSession")}
              onClick={() => {
                track("Button", "Click", "allow_month")

                onDismissSessionClick(
                  testResult.rule.key,
                  testResult.rule.selector
                )
              }}
              onMouseEnter={() => setIsSkipping(true)}
              onMouseLeave={() => setIsSkipping(false)}
              btnStyle={{
                boxShadow: "3px 2px 7px #c72222"
              }}
            />
            {testResult.alt ? (
              <Button
                title={chrome.i18n.getMessage("modalShowAlternatives")}
                onClick={() => {
                  track("Button", "Click", "show_alternatives")
                  setAreAlternativesShown(true)
                }}
                onMouseEnter={() => setIsSharing(true)}
                onMouseLeave={() => setIsSharing(false)}
                btnStyle={{
                  boxShadow: "3px 2px 7px #74d136"
                }}
              />
            ) : (
              <Button
                title={chrome.i18n.getMessage("modalSupportPalestine")}
                onClick={() => {
                  track("Button", "Click", "support_pal")

                  setTimeout(() => {
                    window.location.href = "https://techforpalestine.org"
                  }, 500)
                }}
                onMouseEnter={() => setIsSharing(true)}
                onMouseLeave={() => setIsSharing(false)}
                btnStyle={{
                  boxShadow: "3px 2px 7px #74d136"
                }}
              />
            )}
            {areAlternativesShown && testResult.alt && (
              <div className={style.altPopupMenu}>
                <ul className={style.altPopupList}>
                  {testResult.alt.map((alt) => (
                    <li key={alt.ws} className={style.altPopupItem}>
                      <a href={alt.ws} className={style.altLink}>
                        {alt.n}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={style.bottomBar}>
        <Button
          title={chrome.i18n.getMessage("buttomBarButtonReport")}
          onClick={handleReportMistakeClick}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: "5vw",
          bottom: "12vh",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
        <Button
          title={chrome.i18n.getMessage("modalDonateButton")}
          onClick={() => {
            track("Button", "Click", "support_ko_fi")
            window.open("https://ko-fi.com/thewalladdon", "_blank")
          }}
          onMouseEnter={() => setIsSharing(true)}
          onMouseLeave={() => setIsSharing(false)}
          btnStyle={{
            boxShadow: "3px 2px 6px #ff5e5b"
          }}
        />
      </div>
    </div>
  ) : null
}

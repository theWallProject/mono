/* eslint-disable import/order */
import React, { useCallback, useEffect, useRef, useState } from "react"
import { toast, Toaster } from "react-hot-toast"

import { getExtensionURL, track } from "~helpers"

import backgroundImage from "../../assets/images/flag-bg.jpg"
import theWallWhite from "../../assets/images/the-wall-white.png"
import { error, log } from "../helpers"
// import { share } from "../image_sharing/image"
import { ShareButton } from "../share_button/ShareButton"
import {
  getAllLocalStorageItems,
  getLocalStorageItem,
  HINT_DISMISSED_PERM_PREFIX,
  HINT_SHOWN_PREFIX,
  HINTS_SYSTEM_DISABLED_KEY,
  removeLocalStorageItems,
  setLocalStorageItem
} from "../storageHelpers"
import { MessageTypes, type Message, type MessageResponseMap } from "../types"
import { Scene } from "./3d/scene"
import { Button } from "./Button"
import { HintToastContent } from "./HintToastContent"
// import { GraffitiEffect } from "./GraffitiEffect"
import style from "./style.module.css"

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export const Banner = () => {
  const [isSharing, setIsSharing] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [areAlternativesShown, setAreAlternativesShown] = useState(false)

  const [testResult, setTestResult] =
    useState<MessageResponseMap[MessageTypes.TestUrl]>()
  const toastIdRef = useRef<string | null>(null)
  const isCheckingHintRef = useRef<boolean>(false)
  const isTestingUrlRef = useRef<boolean>(false)

  // Check if a hint was shown recently (within 3 days)
  const wasHintShownRecently = async (hintId: string): Promise<boolean> => {
    const storageKey = `${HINT_SHOWN_PREFIX}${hintId}`
    const lastShownTimestamp = await getLocalStorageItem<number>(storageKey)
    if (!lastShownTimestamp) return false
    const now = Date.now()
    return now - lastShownTimestamp < THREE_DAYS_MS
  }

  // Mark a hint as shown now
  const markHintAsShown = async (hintId: string) => {
    const storageKey = `${HINT_SHOWN_PREFIX}${hintId}`
    await setLocalStorageItem(storageKey, Date.now())

    // Clean up old entries (older than 3 days) to prevent storage bloat
    const allItems = await getAllLocalStorageItems()
    const keysToRemove: string[] = []
    const now = Date.now()
    for (const key in allItems) {
      if (key.startsWith(HINT_SHOWN_PREFIX)) {
        const lastShownTimestamp = allItems[key] as number
        if (
          typeof lastShownTimestamp === "number" &&
          now - lastShownTimestamp >= THREE_DAYS_MS
        ) {
          keysToRemove.push(key)
        }
      }
    }
    if (keysToRemove.length > 0) {
      await removeLocalStorageItems(keysToRemove)
    }
  }

  // Check if hints system is disabled globally
  const isHintsSystemDisabled = async (): Promise<boolean> => {
    const disabled = await getLocalStorageItem<boolean>(
      HINTS_SYSTEM_DISABLED_KEY
    )
    return disabled === true
  }

  // Check if a hint is dismissed permanently
  const isHintDismissedPermanently = async (
    hintId: string
  ): Promise<boolean> => {
    const storageKey = `${HINT_DISMISSED_PERM_PREFIX}${hintId}`
    const dismissed = await getLocalStorageItem<boolean>(storageKey)
    return dismissed === true
  }

  // Dismiss hint permanently
  const dismissHintPermanently = async (hintId: string) => {
    const storageKey = `${HINT_DISMISSED_PERM_PREFIX}${hintId}`
    await setLocalStorageItem(storageKey, true)
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }
  }

  // Disable hints system globally
  const disableHintsSystem = async (): Promise<boolean> => {
    const confirmMessage = chrome.i18n.getMessage("hintDisableAllConfirm")
    if (window.confirm(confirmMessage)) {
      await setLocalStorageItem(HINTS_SYSTEM_DISABLED_KEY, true)
      return true
    }
    return false
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

  // Helper function to check if URL is special (chrome://, extension://, etc.)
  const isSpecialUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      // Return true if the protocol is not http or https
      return parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:"
    } catch {
      // If the URL is invalid, treat it as special
      return true
    }
  }

  // Helper function to test current URL
  const testCurrentUrl = useCallback(() => {
    // Prevent duplicate simultaneous requests
    if (isTestingUrlRef.current) {
      log("[Banner] Already testing URL, skipping duplicate request")
      return
    }

    const url = window.location.href

    // Skip special URLs
    if (isSpecialUrl(url)) {
      log("[Banner] Skipping special URL:", url)
      return
    }

    isTestingUrlRef.current = true
    log("[Banner] Testing URL:", url)

    chrome.runtime.sendMessage<Message>(
      {
        action: MessageTypes.TestUrl,
        url
      },
      (result: MessageResponseMap[MessageTypes.TestUrl]) => {
        isTestingUrlRef.current = false

        if (chrome.runtime.lastError) {
          error("[Banner] Error testing URL:", chrome.runtime.lastError.message)
          return
        }

        log("[Banner] Test result:", result)
        setTestResult(result)
      }
    )
  }, [])

  // Test URL on initial mount
  useEffect(() => {
    testCurrentUrl()
  }, [testCurrentUrl])

  // Listen for navigation-triggered test requests from background
  useEffect(() => {
    const listener = (message: Message) => {
      log("[Banner] Received message:", message)
      if (message.action === MessageTypes.RequestUrlTest) {
        log("[Banner] RequestUrlTest received, testing current URL")
        testCurrentUrl()
      }
      return true // Indicate we will send a response asynchronously
    }
    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [testCurrentUrl])

  // Inject animation styles for hint buttons
  useEffect(() => {
    const styleId = "hint-button-animations"
    if (document.getElementById(styleId)) return

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      @keyframes hintButtonFadeIn {
        from {
          opacity: 0;
          transform: translateX(-8px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  // Show toast when hint result is received
  useEffect(() => {
    log("[Hint Toast] testResult:", testResult)

    if (
      testResult?.isHint === true &&
      !testResult.isDismissed &&
      testResult.name
    ) {
      // Use hint name as the unique ID
      const hintId = testResult.name
      log("[Hint Toast] Processing hint:", hintId)

      // Check if this hint was already shown recently
      if (isCheckingHintRef.current) {
        log("[Hint Toast] Already checking, skipping")
        return // Prevent multiple simultaneous checks
      }

      isCheckingHintRef.current = true
      ;(async () => {
        // Check all conditions before showing
        const [systemDisabled, permanentlyDismissed, shownRecently] =
          await Promise.all([
            isHintsSystemDisabled(),
            isHintDismissedPermanently(hintId),
            wasHintShownRecently(hintId)
          ])

        log("[Hint Toast] Conditions check:", {
          hintId,
          systemDisabled,
          permanentlyDismissed,
          shownRecently
        })

        isCheckingHintRef.current = false

        if (systemDisabled || permanentlyDismissed || shownRecently) {
          // Don't show toast if any condition prevents it
          log("[Hint Toast] Blocked from showing:", {
            systemDisabled,
            permanentlyDismissed,
            shownRecently
          })
          // Don't dismiss existing toast if blocked - it might be showing
          return
        }

        log("[Hint Toast] All checks passed, showing toast")

        // Mark this hint as shown
        await markHintAsShown(hintId)

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
        const toastId = `hint-${hintId}-${Date.now()}`

        log("[Hint Toast] Creating toast with:", {
          hintId,
          processedHintText,
          processedHintUrl,
          toastId
        })

        const id = toast.custom(
          (t) => (
            <HintToastContent
              hintId={hintId}
              processedHintText={processedHintText}
              processedHintUrl={processedHintUrl}
              onDismiss={() => {
                toast.dismiss(t.id)
                if (toastIdRef.current === t.id) {
                  toastIdRef.current = null
                }
              }}
              onDismissPermanently={dismissHintPermanently}
              onDisableAll={disableHintsSystem}
            />
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

        log("[Hint Toast] Toast created with ID:", id)
        toastIdRef.current = id
      })()
    } else if (testResult === undefined || (testResult && !testResult.isHint)) {
      // Only dismiss toast if testResult is undefined or no longer a hint
      // Don't dismiss if testResult.isHint is still true but blocked
      if (toastIdRef.current) {
        log("[Hint Toast] Dismissing toast - testResult changed to non-hint")
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null
      }
    }

    return () => {
      // Cleanup on unmount only - don't dismiss on testResult changes
      // The toast should persist until user dismisses it or component unmounts
    }
  }, [testResult])

  // If it's a hint, show toast and return early (no full modal)
  if (testResult?.isHint === true) {
    return (
      <>
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
      </>
    )
  }

  return (
    <>
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
      {testResult && !testResult.isDismissed ? (
        <div
          className={style.container}
          dir={chrome.i18n.getMessage("@@bidi_dir")}>
          <img
            src="https://the-wall.win/bg.gif?rec=1&action_name=wall"
            alt=""
          />
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
                          {chrome.i18n.getMessage("reasonFounder", [
                            companyName
                          ])}
                        </div>
                      )
                    case "i":
                      return (
                        <div key={reason}>
                          {chrome.i18n.getMessage("reasonInvestor", [
                            companyName
                          ])}
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
                          {chrome.i18n.getMessage("reasonBDS", [
                            testResult.name
                          ])}
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
      ) : null}
    </>
  )
}

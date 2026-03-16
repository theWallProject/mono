import React, { useCallback, useEffect, useRef, useState } from "react"
import { toast, Toaster } from "react-hot-toast"

import { getExtensionURL, track } from "~helpers"

import backgroundImage from "../../assets/images/bg-pattern.png"
import donateIcon from "../../assets/images/donate-icon.svg"
import shieldIcon from "../../assets/images/shield-icon.svg"
import warningIcon from "../../assets/images/warning-icon.svg"
import { error, log } from "../helpers"
import { getI18nMessage } from "../helpers/i18n-keys"
import { getReasonI18nKey } from "../helpers/reasonMap"
import { findRuleOfType, isUrlOnlyRule, processRule } from "../rules"
import { ShareButton } from "../share_button/ShareButton"
import {
  getAllLocalStorageItems,
  getLocalStorageItem,
  HINT_COMPANY_DISMISSED_PERM_PREFIX,
  HINT_DISMISSED_PERM_PREFIX,
  HINT_SHOWN_PREFIX,
  HINTS_SYSTEM_DISABLED_KEY,
  removeLocalStorageItems,
  setLocalStorageItem
} from "../storageHelpers"
import { MessageTypes, type Message, type MessageResponseMap } from "../types"
import { Button } from "./Button"
import { HintToastContent } from "./HintToastContent"
import style from "./style.module.css"

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export const Banner = () => {
  const [areAlternativesShown, setAreAlternativesShown] = useState(false)

  const [testResult, setTestResult] = useState<MessageResponseMap[MessageTypes.TestUrl]>()
  const toastIdRef = useRef<string | null>(null)
  const isCheckingHintRef = useRef<boolean>(false)
  const isTestingUrlRef = useRef<boolean>(false)

  // Check if a hint was shown recently (within 3 days)
  const wasHintShownRecently = async (hintId: string): Promise<boolean> => {
    const storageKey = `${HINT_SHOWN_PREFIX}${hintId}`
    const lastShownTimestamp = await getLocalStorageItem(storageKey)
    if (!lastShownTimestamp || typeof lastShownTimestamp !== "number") return false
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
        const lastShownTimestamp = allItems[key]
        if (typeof lastShownTimestamp === "number" && now - lastShownTimestamp >= THREE_DAYS_MS) {
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
    const disabled = await getLocalStorageItem(HINTS_SYSTEM_DISABLED_KEY)
    return disabled === true
  }

  // Check if a hint is dismissed permanently (either by hint ID or company ID)
  const isHintDismissedPermanently = async (hintId: string, hintCompanyId?: string): Promise<boolean> => {
    // Check per-hint-ID dismissal first (backward compatibility)
    const hintStorageKey = `${HINT_DISMISSED_PERM_PREFIX}${hintId}`
    const hintDismissed = await getLocalStorageItem(hintStorageKey)
    if (hintDismissed === true) {
      return true
    }

    // Check company-level if hintCompanyId exists
    if (hintCompanyId) {
      const companyStorageKey = `${HINT_COMPANY_DISMISSED_PERM_PREFIX}${hintCompanyId}`
      const companyDismissed = await getLocalStorageItem(companyStorageKey)
      if (companyDismissed === true) {
        return true
      }
    }

    return false
  }

  // Dismiss hint permanently (use company ID if available, otherwise hint ID)
  const dismissHintPermanently = async (hintId: string, hintCompanyId?: string) => {
    // Use company-level dismissal if hintCompanyId exists, otherwise per-hint-ID
    const storageKey = hintCompanyId
      ? `${HINT_COMPANY_DISMISSED_PERM_PREFIX}${hintCompanyId}`
      : `${HINT_DISMISSED_PERM_PREFIX}${hintId}`

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
  const replacePlaceholders = (text: string | undefined, url: string, encodeForUrl: boolean = false): string => {
    if (!text) return ""
    const replacement = encodeForUrl ? encodeURIComponent(url) : url
    return text.replace(/\{\{url\}\}/g, replacement)
  }

  const onDismissClick = () => {
    if (!testResult || testResult.isHint || testResult.isDismissed) return
    track("Button", "Click", "dismiss_close")
    chrome.runtime.sendMessage<Message>(
      {
        action: MessageTypes.DissmissUrl,
        key: testResult.rule.key,
        selector: testResult.rule.selector
      },
      () => {
        setTimeout(() => {
          setTestResult(undefined)
        }, 100)
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
  const testCurrentUrl = useCallback(async () => {
    // Prevent duplicate simultaneous requests
    if (isTestingUrlRef.current) {
      log("[Banner] Already testing URL, skipping duplicate request")
      return
    }

    let url = window.location.href

    // Skip special URLs
    if (isSpecialUrl(url)) {
      log("[Banner] Skipping special URL:", url)
      return
    }

    // Check if there's a URL + DOM + full block rule for this page
    const urlDomFullRule = findRuleOfType(url, "urlDomFull")
    if (urlDomFullRule) {
      log("[Banner] URL + DOM + full block rule found, extracting URL from DOM")
      const extractedUrl = await processRule(urlDomFullRule)
      if (extractedUrl && typeof extractedUrl === "string") {
        url = extractedUrl
        log("[Banner] Testing extracted URL:", url)
      } else {
        log("[Banner] Could not extract URL from DOM, testing page URL")
      }
    } else if (isUrlOnlyRule(url)) {
      // URL-only is the default fallback (thousands of rules in ALL.json)
      // No extraction needed - use current page URL
      log("[Banner] Treating as URL-only rule (default fallback)")
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
    void testCurrentUrl()
  }, [testCurrentUrl])

  // Re-test URL when navigation occurs on pages with rules (SPA navigation)
  useEffect(() => {
    let lastUrl = window.location.href
    const checkInterval = setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href
        // Re-test if there's a urlDomFull rule or if it's URL-only (default fallback)
        const urlDomFullRule = findRuleOfType(lastUrl, "urlDomFull")
        const isUrlOnly = isUrlOnlyRule(lastUrl)
        if (urlDomFullRule || isUrlOnly) {
          log("[Banner] URL changed on page with rule, re-testing")
          void testCurrentUrl()
        }
      }
    }, 1000)

    return () => {
      clearInterval(checkInterval)
    }
  }, [testCurrentUrl])

  // Listen for navigation-triggered test requests from background
  useEffect(() => {
    const listener = (message: Message) => {
      log("[Banner] Received message:", message)
      if (message.action === MessageTypes.RequestUrlTest) {
        log("[Banner] RequestUrlTest received, testing current URL")
        void testCurrentUrl()
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

    const styleEl = document.createElement("style")
    styleEl.id = styleId
    styleEl.textContent = `
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
    document.head.appendChild(styleEl)

    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  // Helper to show hint toast
  const showHintToast = useCallback(
    async (
      hintId: string,
      hintCompanyId: string | undefined,
      hintText: string,
      hintUrl: string | undefined,
      skipRateLimit: boolean = false
    ) => {
      // Check all conditions before showing
      // .il domain hints bypass rate limiting - they always show regardless of cooldown
      const [systemDisabled, permanentlyDismissed, shownRecently] = await Promise.all([
        isHintsSystemDisabled(),
        isHintDismissedPermanently(hintId, hintCompanyId),
        skipRateLimit ? Promise.resolve(false) : wasHintShownRecently(hintId)
      ])

      log("[Hint Toast] Conditions check:", {
        hintId,
        systemDisabled,
        permanentlyDismissed,
        shownRecently,
        skipRateLimit
      })

      if (systemDisabled || permanentlyDismissed || shownRecently) {
        log("[Hint Toast] Blocked from showing:", {
          systemDisabled,
          permanentlyDismissed,
          shownRecently
        })
        return
      }

      log("[Hint Toast] All checks passed, showing toast")

      // Mark this hint as shown (skip for rate-limit-exempt hints so they don't affect cooldown)
      if (!skipRateLimit) {
        await markHintAsShown(hintId)
      }

      // Dismiss any existing hint toast to prevent duplicates
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null
      }

      const currentUrl = window.location.href
      const processedHintUrl = replacePlaceholders(hintUrl, currentUrl, true)
      const processedHintText = replacePlaceholders(hintText, currentUrl, false)
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
            hintCompanyId={hintCompanyId}
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
            background: "#b72b00",
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            border: "1px solid #932300",
            pointerEvents: "auto"
          }
        }
      )

      log("[Hint Toast] Toast created with ID:", id)
      toastIdRef.current = id
    },
    []
  )

  // Show toast when hint result is received (standalone hint or domain hint)
  useEffect(() => {
    log("[Hint Toast] testResult:", testResult)

    // Check if this is a standalone hint
    if (testResult?.isHint === true && !testResult.isDismissed && testResult.name) {
      const hintId = testResult.name
      const isIlHint = testResult.rule?.key === "il"
      log("[Hint Toast] Processing standalone hint:", hintId, { isIlHint })

      if (isCheckingHintRef.current) {
        log("[Hint Toast] Already checking, skipping")
        return
      }

      isCheckingHintRef.current = true
      void showHintToast(
        hintId,
        testResult.hintCompanyId,
        testResult.hintText || "",
        testResult.hintUrl,
        isIlHint
      ).finally(() => {
        isCheckingHintRef.current = false
      })
    }
    // Check if there's a domain hint (shown when viewing flagged company on hint-enabled domain)
    else if (testResult && !testResult.isHint && testResult.domainHint) {
      const { domainHint } = testResult
      const hintId = domainHint.name || "domain_hint"
      log("[Hint Toast] Processing domain hint:", hintId)

      if (isCheckingHintRef.current) {
        log("[Hint Toast] Already checking, skipping")
        return
      }

      isCheckingHintRef.current = true
      void showHintToast(hintId, domainHint.hintCompanyId, domainHint.hintText, domainHint.hintUrl).finally(() => {
        isCheckingHintRef.current = false
      })
    }

    return () => {
      // Cleanup on unmount only
    }
  }, [testResult, showHintToast])

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#b72b00",
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            border: "1px solid #932300"
          }
        }}
      />
      {testResult && !testResult.isDismissed && !testResult.isHint ? (
        <div className={style.container} dir={chrome.i18n.getMessage("@@bidi_dir")}>
          <img src="https://the-wall.win/bg.gif?rec=1&action_name=wall" alt="" />
          {/* Background pattern layer */}
          <div
            className={style.bgLayer}
            style={{
              backgroundImage: `url(${getExtensionURL(backgroundImage)})`
            }}
          />
          {/* Dark overlay */}
          <div className={style.bgOverlay} />

          {/* Wrapper for modal and share bar to stack vertically */}
          <div className={style.modalWrapper}>
            {/* Modal container with shield icon */}
            <div className={style.modalContainer}>
              {/* Close button - top right */}
              <button
                type="button"
                className={style.closeButton}
                onClick={onDismissClick}
                aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 1L13 13M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {/* Shield circle background */}
              <div className={style.shieldCircleBg} />
              {/* Shield icon */}
              <img src={getExtensionURL(shieldIcon)} className={style.shieldIcon} alt="The Wall Logo" />

              <div className={style.modalMargin}>
                <div className={style.modalContentWrapper}>
                  {testResult.reasons.map((reason) => {
                    const companyName = `"${testResult.name}" ${testResult.stockSymbol ? `(${testResult.stockSymbol})` : ""}`

                    // Type guard to ensure reason is a valid string literal
                    if (typeof reason !== "string") {
                      throw new Error(`Invalid reason type: ${typeof reason}`)
                    }

                    const reasonKey = getReasonI18nKey(reason)
                    const substitutions =
                      reason === "h" || reason === "BDS_PRIO" || reason === "BDS_GRASS" || reason === "BDS_PRESSURE"
                        ? [testResult.name]
                        : [companyName]
                    return <div key={reason}>{getI18nMessage(reasonKey, substitutions)}</div>
                  })}
                  {testResult.comment ? <div>{testResult.comment}</div> : ""}
                </div>

                <div className={style.buttonsWrapper}>
                  {testResult.reasons.some((r) => r === "BDS_PRIO" || r === "BDS_GRASS" || r === "BDS_PRESSURE") ? (
                    <Button
                      title={getI18nMessage("modalShowBDSGuide")}
                      onClick={() => {
                        track("Button", "Click", "show_bds_guide")
                        setTimeout(() => {
                          window.location.href = "https://bdsmovement.net/Guide-to-BDS-Boycott"
                        }, 500)
                      }}
                    />
                  ) : testResult.alt ? (
                    <div
                      className={style.altButtonWrapper}
                      onMouseEnter={() => {
                        track("Button", "Click", "show_alternatives")
                        setAreAlternativesShown(true)
                      }}
                      onMouseLeave={() => setAreAlternativesShown(false)}>
                      <Button title={getI18nMessage("modalShowAlternatives")} onClick={() => {}} />
                      <div className={`${style.altPopupMenu} ${areAlternativesShown ? style.visible : ""}`}>
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
                    </div>
                  ) : (
                    <Button
                      title={getI18nMessage("modalSupportPalestine")}
                      onClick={() => {
                        track("Button", "Click", "support_pal")

                        setTimeout(() => {
                          window.location.href = "https://techforpalestine.org"
                        }, 500)
                      }}
                    />
                  )}

                </div>
              </div>

              {/* Report button inside modal */}
              <div className={style.bottomBar}>
                <button
                  type="button"
                  className={style.warningButton}
                  onClick={handleReportMistakeClick}
                  title={getI18nMessage("buttomBarButtonReport")}>
                  <img src={getExtensionURL(warningIcon)} alt="Report" />
                  <span>{getI18nMessage("buttomBarButtonReport")}</span>
                </button>
              </div>
            </div>

            {/* Donate and share - directly under modal */}
            <div className={style.bottomShareBar}>
              <div className={style.pillBadgeContainerLeft}>
                <button
                  type="button"
                  className={style.pillBadge}
                  onClick={() => {
                    track("Button", "Click", "support_ko_fi")
                    window.open("https://ko-fi.com/thewalladdon", "_blank")
                  }}>
                  <img src={getExtensionURL(donateIcon)} alt="" />
                  {getI18nMessage("modalDonateButton")}
                </button>
              </div>

              <div className={style.pillBadgeContainerRight}>
                <ShareButton text={getI18nMessage("sharingMessageText")} url={"https://the-wall.win"} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

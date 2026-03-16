import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook"
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin"
import { FaTelegram } from "@react-icons/all-files/fa/FaTelegram"
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp"
import React, { useEffect, useState } from "react"

import shieldIcon from "../assets/images/shield-icon.svg"
import { getExtensionURL, track } from "./helpers"
import { getI18nMessage } from "./helpers/i18n-keys"
import {
  getAllLocalStorageItems,
  getLocalStorageItem,
  HINT_DISMISSED_PERM_PREFIX,
  HINT_SHOWN_PREFIX,
  HINTS_SYSTEM_DISABLED_KEY,
  removeLocalStorageItems,
  setLocalStorageItem
} from "./storageHelpers"

function Popup() {
  const [hintsDisabled, setHintsDisabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isToggling, setIsToggling] = useState<boolean>(false)
  const [isResetting, setIsResetting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    // Remove default browser margins/padding and set background
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.documentElement.style.background = "#b72b00"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.background = "#b72b00"

    // Check if hints system is disabled on mount
    const checkHintsStatus = async () => {
      const disabled = await getLocalStorageItem(HINTS_SYSTEM_DISABLED_KEY)
      setHintsDisabled(disabled === true)
      setIsLoading(false)
    }
    void checkHintsStatus()
  }, [])

  const toggleHintsSystem = async () => {
    track("Button", "Click", "hint_toggle_system")
    setIsToggling(true)
    try {
      const newState = !hintsDisabled
      await setLocalStorageItem(HINTS_SYSTEM_DISABLED_KEY, newState)
      setHintsDisabled(newState)
      setSuccessMessage(newState ? "Hints disabled" : "Hints enabled")
      setTimeout(() => setSuccessMessage(null), 2000)
    } finally {
      setIsToggling(false)
    }
  }

  const resetDismissedHints = async () => {
    track("Button", "Click", "hint_reset_dismissed")
    setIsResetting(true)
    try {
      const allItems = await getAllLocalStorageItems()
      const keysToRemove: string[] = []

      for (const key in allItems) {
        if (key.startsWith(HINT_DISMISSED_PERM_PREFIX) || key.startsWith(HINT_SHOWN_PREFIX)) {
          keysToRemove.push(key)
        }
      }

      if (keysToRemove.length > 0) {
        await removeLocalStorageItems(keysToRemove)
        setSuccessMessage(`Reset ${keysToRemove.length} dismissed hint(s)`)
      } else {
        setSuccessMessage("No dismissed hints to reset")
      }
      setTimeout(() => setSuccessMessage(null), 2000)
    } finally {
      setIsResetting(false)
    }
  }

  const handleDonate = () => {
    track("Button", "Click", "options_donate")
    window.open("https://ko-fi.com/thewalladdon", "_blank")
  }

  const handleShare = (platform: string) => {
    const url = "https://the-wall.win"
    const encodedUrl = encodeURIComponent(url)

    switch (platform) {
      case "fb":
        track("Button", "Click", "options_share_fb")
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")
        break
      case "tw":
        track("Button", "Click", "options_share_tw")
        window.open(`https://x.com/intent/post?url=${encodedUrl}`, "_blank")
        break
      case "li":
        track("Button", "Click", "options_share_li")
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`, "_blank")
        break
      case "wa":
        track("Button", "Click", "options_share_wa")
        window.open(`https://wa.me/?text=${encodedUrl}`, "_blank")
        break
      case "tg":
        track("Button", "Click", "options_share_tg")
        window.open(`https://t.me/share/url?url=${encodedUrl}`, "_blank")
        break
    }
  }

  const containerStyle: React.CSSProperties = {
    minWidth: 300,
    margin: 0,
    padding: 0,
    background: "#b72b00",
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    flexDirection: "column",
    minHeight: "100%"
  }

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 16px",
    borderBottom: "1px solid rgba(255, 225, 205, 0.15)",
    background: "rgba(255, 255, 255, 0.05)",
    flexShrink: 0
  }

  const iconStyle: React.CSSProperties = {
    width: "26px",
    height: "26px",
    flexShrink: 0,
    filter: "brightness(0) invert(1)",
    objectFit: "contain"
  }

  const titleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "600",
    letterSpacing: "0.01em",
    margin: 0,
    flex: 1
  }

  const contentStyle: React.CSSProperties = {
    padding: "16px",
    flex: 1
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: "16px"
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "rgba(255, 225, 205, 0.7)",
    marginBottom: "8px",
    paddingLeft: "2px"
  }

  const buttonStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "none",
    borderRadius: "8px",
    color: "#b72b00",
    cursor: "pointer",
    padding: "10px 14px",
    fontSize: "13px",
    lineHeight: "1.5",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "500",
    width: "100%",
    marginBottom: "8px",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
  }

  const lastButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    marginBottom: 0
  }

  const dividerStyle: React.CSSProperties = {
    height: "1px",
    background: "rgba(255, 225, 205, 0.15)",
    margin: "16px 0",
    border: "none"
  }

  const shareContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    alignItems: "center",
    padding: "8px 0"
  }

  const shareIconStyle: React.CSSProperties = {
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.1)"
  }

  const loadingStyle: React.CSSProperties = {
    padding: "12px 14px",
    textAlign: "center",
    fontSize: "13px",
    color: "rgba(255, 225, 205, 0.7)"
  }

  const successMessageStyle: React.CSSProperties = {
    padding: "8px 14px",
    background: "rgba(255, 255, 255, 0.15)",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    fontSize: "12px",
    textAlign: "center",
    fontWeight: "500"
  }

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: "not-allowed"
  }

  const checkboxContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    background: "#ffffff",
    border: "none",
    borderRadius: "8px",
    marginBottom: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
  }

  const checkboxStyle: React.CSSProperties = {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#b72b00",
    flexShrink: 0
  }

  const checkboxLabelStyle: React.CSSProperties = {
    fontSize: "13px",
    lineHeight: "1.5",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "500",
    color: "#b72b00",
    flex: 1,
    cursor: "pointer",
    userSelect: "none"
  }

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <img src={getExtensionURL(shieldIcon)} alt="The Wall" style={iconStyle} />
        <h1 style={titleStyle}>{chrome.i18n.getMessage("extensionName")}</h1>
      </div>
      <div style={contentStyle}>
        {/* Settings Section */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Settings</div>
          <div
            style={checkboxContainerStyle}
            onClick={() => {
              void toggleHintsSystem()
            }}
            onMouseEnter={(e) => {
              if (!isToggling && !isResetting) {
                e.currentTarget.style.transform = "translateY(-1px)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)"
              }
            }}
            onMouseLeave={(e) => {
              if (!isToggling && !isResetting) {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)"
              }
            }}>
            <input
              type="checkbox"
              checked={!hintsDisabled}
              onChange={() => {
                void toggleHintsSystem()
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isToggling || isResetting}
              style={checkboxStyle}
            />
            <label style={checkboxLabelStyle}>{isToggling ? "Processing..." : "Enable Hints"}</label>
          </div>
          <button
            type="button"
            onClick={() => {
              void resetDismissedHints()
            }}
            disabled={isToggling || isResetting}
            style={
              isToggling || isResetting
                ? { ...lastButtonStyle, ...disabledButtonStyle }
                : lastButtonStyle
            }
            onMouseEnter={(e) => {
              if (!isToggling && !isResetting) {
                e.currentTarget.style.transform = "translateY(-1px)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)"
              }
            }}
            onMouseLeave={(e) => {
              if (!isToggling && !isResetting) {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)"
              }
            }}>
            {isResetting ? "Resetting..." : "Reset All Dismissed Hints"}
          </button>
        </div>

        <hr style={dividerStyle} />

        {/* Donation Section */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Support</div>
          <button
            type="button"
            onClick={handleDonate}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)"
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)"
            }}>
            {getI18nMessage("modalDonateButton")}
          </button>
        </div>

        <hr style={dividerStyle} />

        {/* Sharing Section */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Share</div>
          <div style={shareContainerStyle}>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("fb")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on Facebook">
              <FaFacebook size={22} color="#ffffff" />
            </div>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("tw")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on X (Twitter)">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="#ffffff">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("li")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on LinkedIn">
              <FaLinkedin size={22} color="#ffffff" />
            </div>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("wa")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on WhatsApp">
              <FaWhatsapp size={22} color="#ffffff" />
            </div>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("tg")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on Telegram">
              <FaTelegram size={22} color="#ffffff" />
            </div>
          </div>
          <a
            href="https://the-wall.win"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "rgba(255, 225, 205, 0.6)",
              fontSize: "11px",
              textDecoration: "none",
              textAlign: "center",
              display: "block",
              marginTop: "8px",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 225, 205, 0.6)"
            }}>
            the-wall.win
          </a>
        </div>
      </div>

      {successMessage && <div style={successMessageStyle}>✓ {successMessage}</div>}
    </div>
  )
}

export default Popup

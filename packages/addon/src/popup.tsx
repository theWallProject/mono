import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook"
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin"
import { FaTelegram } from "@react-icons/all-files/fa/FaTelegram"
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp"
import React, { useEffect, useState } from "react"

// eslint-disable-next-line import/order
import icon16 from "../assets/icon16.png"
import { getExtensionURL, track } from "./helpers"
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
    // Remove default browser margins/padding
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.body.style.margin = "0"
    document.body.style.padding = "0"

    // Check if hints system is disabled on mount
    const checkHintsStatus = async () => {
      const disabled = await getLocalStorageItem<boolean>(
        HINTS_SYSTEM_DISABLED_KEY
      )
      setHintsDisabled(disabled === true)
      setIsLoading(false)
    }
    checkHintsStatus()
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
        if (
          key.startsWith(HINT_DISMISSED_PERM_PREFIX) ||
          key.startsWith(HINT_SHOWN_PREFIX)
        ) {
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
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank"
        )
        break
      case "tw":
        track("Button", "Click", "options_share_tw")
        window.open(`https://x.com/intent/post?url=${encodedUrl}`, "_blank")
        break
      case "li":
        track("Button", "Click", "options_share_li")
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`,
          "_blank"
        )
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

  const handleContact = () => {
    track("Button", "Click", "options_contact")
    window.open(
      "mailto:the.wall.addon@proton.me?subject=Contact - The Wall Extension",
      "_blank"
    )
  }

  const containerStyle: React.CSSProperties = {
    minWidth: 300,
    margin: 0,
    padding: 0,
    background: "#1b1b1b",
    color: "#e9e9e9",
    fontFamily: "sans-serif",
    display: "flex",
    flexDirection: "column",
    minHeight: "100%"
  }

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.03)",
    flexShrink: 0
  }

  const iconStyle: React.CSSProperties = {
    width: "22px",
    height: "22px",
    flexShrink: 0
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
    color: "rgba(233, 233, 233, 0.5)",
    marginBottom: "8px",
    paddingLeft: "2px"
  }

  const buttonStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    color: "#e9e9e9",
    cursor: "pointer",
    padding: "10px 14px",
    fontSize: "13px",
    lineHeight: "1.5",
    fontFamily: "sans-serif",
    fontWeight: "500",
    width: "100%",
    marginBottom: "8px",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }

  const lastButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    marginBottom: 0
  }

  const dividerStyle: React.CSSProperties = {
    height: "1px",
    background: "rgba(255, 255, 255, 0.08)",
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
    padding: "6px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }

  const footerStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flexShrink: 0
  }

  const footerLinkStyle: React.CSSProperties = {
    color: "rgba(233, 233, 233, 0.7)",
    fontSize: "11px",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.2s ease",
    textAlign: "center"
  }

  const loadingStyle: React.CSSProperties = {
    padding: "12px 14px",
    textAlign: "center",
    fontSize: "13px",
    color: "rgba(233, 233, 233, 0.6)"
  }

  const successMessageStyle: React.CSSProperties = {
    padding: "8px 14px",
    background: "rgba(116, 209, 54, 0.15)",
    borderTop: "1px solid rgba(116, 209, 54, 0.3)",
    color: "#74d136",
    fontSize: "12px",
    textAlign: "center",
    fontWeight: "500"
  }

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: "not-allowed"
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
        <img src={getExtensionURL(icon16)} alt="The Wall" style={iconStyle} />
        <h1 style={titleStyle}>{chrome.i18n.getMessage("extensionName")}</h1>
      </div>
      <div style={contentStyle}>
        {/* Settings Section */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Settings</div>
          <button
            type="button"
            onClick={toggleHintsSystem}
            disabled={isToggling || isResetting}
            style={
              isToggling || isResetting ? disabledButtonStyle : buttonStyle
            }
            onMouseEnter={(e) => {
              if (!isToggling && !isResetting) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)"
                e.currentTarget.style.transform = "translateY(-1px)"
              }
            }}
            onMouseLeave={(e) => {
              if (!isToggling && !isResetting) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
                e.currentTarget.style.transform = "translateY(0)"
              }
            }}>
            {isToggling
              ? "Processing..."
              : hintsDisabled
                ? "Enable Hints System"
                : "Disable Hints System"}
          </button>
          <button
            type="button"
            onClick={resetDismissedHints}
            disabled={isToggling || isResetting}
            style={
              isToggling || isResetting
                ? { ...lastButtonStyle, ...disabledButtonStyle }
                : lastButtonStyle
            }
            onMouseEnter={(e) => {
              if (!isToggling && !isResetting) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)"
                e.currentTarget.style.transform = "translateY(-1px)"
              }
            }}
            onMouseLeave={(e) => {
              if (!isToggling && !isResetting) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
                e.currentTarget.style.transform = "translateY(0)"
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
              e.currentTarget.style.background = "rgba(255, 94, 91, 0.15)"
              e.currentTarget.style.borderColor = "rgba(255, 94, 91, 0.3)"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
              e.currentTarget.style.transform = "translateY(0)"
            }}>
            {chrome.i18n.getMessage("modalDonateButton")}
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
                e.currentTarget.style.background = "rgba(59, 89, 152, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on Facebook">
              <FaFacebook size={22} color="#3b5998" />
            </div>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("tw")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(136, 153, 172, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on X (Twitter)">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="#8899ac">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("li")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(14, 118, 168, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on LinkedIn">
              <FaLinkedin size={22} color="#0e76a8" />
            </div>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("wa")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(37, 211, 102, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on WhatsApp">
              <FaWhatsapp size={22} color="#25D366" />
            </div>
            <div
              style={shareIconStyle}
              onClick={() => handleShare("tg")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 136, 204, 0.2)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label="Share on Telegram">
              <FaTelegram size={22} color="#0088cc" />
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div style={successMessageStyle}>✓ {successMessage}</div>
      )}

      {/* Footer */}
      <div style={footerStyle}>
        <button
          type="button"
          onClick={handleContact}
          style={{
            ...buttonStyle,
            marginBottom: "6px",
            fontSize: "12px",
            padding: "8px 12px",
            background: "rgba(255, 255, 255, 0.06)",
            borderColor: "rgba(255, 255, 255, 0.12)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)"
          }}>
          Contact Us
        </button>
        <a
          href="https://the-wall.win"
          target="_blank"
          rel="noopener noreferrer"
          style={footerLinkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(233, 233, 233, 0.9)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(233, 233, 233, 0.7)"
          }}>
          the-wall.win
        </a>
      </div>
    </div>
  )
}

export default Popup

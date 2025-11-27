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

  const containerStyle: React.CSSProperties = {
    minWidth: 300,
    margin: 0,
    padding: 0,
    background: "#1b1b1b",
    color: "#e9e9e9",
    fontFamily: "sans-serif"
  }

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.02)"
  }

  const iconStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    flexShrink: 0
  }

  const titleStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.01em",
    margin: 0,
    flex: 1
  }

  const contentStyle: React.CSSProperties = {
    padding: "10px 14px"
  }

  const buttonStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "6px",
    color: "#e9e9e9",
    cursor: "pointer",
    padding: "8px 12px",
    fontSize: "13px",
    lineHeight: "1.4",
    fontFamily: "sans-serif",
    fontWeight: "500",
    width: "100%",
    marginBottom: "6px",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    textAlign: "left"
  }

  const lastButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    marginBottom: 0
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
        <button
          type="button"
          onClick={toggleHintsSystem}
          disabled={isToggling || isResetting}
          style={isToggling || isResetting ? disabledButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (!isToggling && !isResetting) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
            }
          }}
          onMouseLeave={(e) => {
            if (!isToggling && !isResetting) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
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
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
            }
          }}
          onMouseLeave={(e) => {
            if (!isToggling && !isResetting) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
            }
          }}>
          {isResetting ? "Resetting..." : "Reset All Dismissed Hints"}
        </button>
      </div>
      {successMessage && (
        <div style={successMessageStyle}>✓ {successMessage}</div>
      )}
    </div>
  )
}

export default Popup

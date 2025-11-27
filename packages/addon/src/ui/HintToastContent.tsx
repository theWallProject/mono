import React, { useState } from "react"

import icon16 from "../../assets/icon16.png"
import { getExtensionURL, track } from "../helpers"

export const HintToastContent = ({
  hintId,
  processedHintText,
  processedHintUrl,
  onDismiss,
  onDismissPermanently,
  onDisableAll
}: {
  hintId: string
  processedHintText: string
  processedHintUrl?: string
  onDismiss: () => void
  onDismissPermanently: (hintId: string) => Promise<void>
  onDisableAll: () => Promise<boolean>
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
      style={{
        background: "#1b1b1b",
        padding: "12px 16px",
        color: "#e9e9e9",
        fontSize: "14px",
        lineHeight: "1.5",
        fontFamily: "sans-serif",
        fontWeight: "400",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        pointerEvents: "auto",
        maxWidth: "100%",
        boxSizing: "border-box",
        position: "relative",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        border: "1px solid #333"
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
          textOverflow: "ellipsis",
          fontWeight: "500",
          letterSpacing: "0.01em"
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
              window.open(processedHintUrl, "_blank", "noopener,noreferrer")
            }
            // Track after opening window
            setTimeout(() => {
              track("Button", "Click", "hint_link")
            }, 100)
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
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
          }}>
          🔗
        </button>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginLeft: "4px"
        }}>
        {!isExpanded ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              track("Button", "Click", "hint_expand")
              setIsExpanded(true)
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
              padding: "3px 6px",
              fontSize: "11px",
              lineHeight: "1.2",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: "sans-serif",
              fontWeight: "500",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
            }}>
            {chrome.i18n.getMessage("hintDismiss")}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                track("Button", "Click", "hint_dismiss_this")
                onDismiss()
                await onDismissPermanently(hintId)
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
                padding: "3px 6px",
                fontSize: "11px",
                lineHeight: "1",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                animation: "hintButtonFadeIn 0.3s ease forwards"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
              }}>
              {chrome.i18n.getMessage("hintDismissThis")}
            </button>
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                track("Button", "Click", "hint_disable_all")
                onDismiss()
                await onDisableAll()
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
                padding: "3px 6px",
                fontSize: "11px",
                lineHeight: "1",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                animation: "hintButtonFadeIn 0.3s ease 0.1s forwards"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
              }}>
              {chrome.i18n.getMessage("hintDisableAll")}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

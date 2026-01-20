import React, { useState } from "react"

import shieldIcon from "../../assets/images/shield-icon.svg"
import { getExtensionURL, track } from "../helpers"
import { getI18nMessage } from "../helpers/i18n-keys"

export const HintToastContent = ({
  hintId,
  hintCompanyId,
  processedHintText,
  processedHintUrl,
  onDismiss,
  onDismissPermanently,
  onDisableAll
}: {
  hintId: string
  hintCompanyId?: string
  processedHintText: string
  processedHintUrl?: string
  onDismiss: () => void
  onDismissPermanently: (hintId: string, hintCompanyId?: string) => Promise<void>
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
        background: "#b72b00",
        padding: "12px 16px",
        color: "#ffffff",
        fontSize: "14px",
        lineHeight: "1.5",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "400",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        pointerEvents: "auto",
        maxWidth: "100%",
        boxSizing: "border-box",
        position: "relative",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        border: "1px solid #932300"
      }}>
      <img
        src={getExtensionURL(shieldIcon)}
        alt="The Wall"
        style={{
          width: "24px",
          height: "24px",
          flexShrink: 0,
          objectFit: "contain",
          filter: "brightness(0) invert(1)"
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
            background: "rgba(255, 225, 205, 0.2)",
            border: "1px solid rgba(255, 225, 205, 0.3)",
            borderRadius: "6px",
            color: "#ffe1cd",
            cursor: "pointer",
            padding: "4px 6px",
            fontSize: "14px",
            lineHeight: "1",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: "28px",
            height: "28px",
            fontFamily: "inherit",
            marginLeft: "4px"
          }}
          title="Open link"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 225, 205, 0.3)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 225, 205, 0.2)"
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
              background: "rgba(255, 225, 205, 0.2)",
              border: "1px solid rgba(255, 225, 205, 0.3)",
              borderRadius: "6px",
              color: "#ffe1cd",
              cursor: "pointer",
              padding: "4px 8px",
              fontSize: "11px",
              lineHeight: "1.2",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: "'Inter', sans-serif",
              fontWeight: "500",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 225, 205, 0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 225, 205, 0.2)"
            }}>
            {chrome.i18n.getMessage("hintDismiss")}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => {
                void (async () => {
                  e.preventDefault()
                  e.stopPropagation()
                  track("Button", "Click", "hint_dismiss_this")
                  onDismiss()
                  await onDismissPermanently(hintId, hintCompanyId)
                })()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              style={{
                background: "rgba(255, 225, 205, 0.2)",
                border: "1px solid rgba(255, 225, 205, 0.3)",
                borderRadius: "6px",
                color: "#ffe1cd",
                cursor: "pointer",
                padding: "4px 8px",
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
                e.currentTarget.style.background = "rgba(255, 225, 205, 0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 225, 205, 0.2)"
              }}>
              {getI18nMessage("hintDismissThis")}
            </button>
            <button
              type="button"
              onClick={(e) => {
                void (async () => {
                  e.preventDefault()
                  e.stopPropagation()
                  track("Button", "Click", "hint_disable_all")
                  onDismiss()
                  await onDisableAll()
                })()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              style={{
                background: "rgba(255, 225, 205, 0.2)",
                border: "1px solid rgba(255, 225, 205, 0.3)",
                borderRadius: "6px",
                color: "#ffe1cd",
                cursor: "pointer",
                padding: "4px 8px",
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
                e.currentTarget.style.background = "rgba(255, 225, 205, 0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 225, 205, 0.2)"
              }}>
              {getI18nMessage("hintDisableAll")}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

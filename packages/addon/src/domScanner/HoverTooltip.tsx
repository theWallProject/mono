import type { APIListOfReasonsValues } from "@theWallProject/common"
import React, { useEffect, useRef, useState } from "react"

import theWallWhite from "../../assets/images/the-wall-white.png"
import { getExtensionURL, log } from "../helpers"
import { REASON_TO_I18N_KEY } from "../helpers/reasonMap"
import style from "./style.module.css"

type HoverTooltipProps = {
  name?: string
  reasons?: APIListOfReasonsValues[]
  targetElement: globalThis.HTMLElement
  onClose: () => void
}

export const HoverTooltip: React.FC<HoverTooltipProps> = ({
  name,
  reasons,
  targetElement,
  onClose
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updatePosition = () => {
      if (!tooltipRef.current || !targetElement) return

      const rect = targetElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      // Position tooltip above the element, centered horizontally
      let top = rect.top - tooltipRect.height - 8
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2

      // If tooltip would go off top of screen, position below instead
      if (top < 0) {
        top = rect.bottom + 8
      }

      // Adjust if tooltip would go off left edge
      if (left < 8) {
        left = 8
      }

      // Adjust if tooltip would go off right edge
      const maxLeft = window.innerWidth - tooltipRect.width - 8
      if (left > maxLeft) {
        left = maxLeft
      }

      setPosition({ top, left })
    }

    updatePosition()

    // Trigger fade in after position is set
    setTimeout(() => {
      setIsVisible(true)
    }, 10)

    // Update position on scroll/resize
    const handleScroll = () => updatePosition()
    const handleResize = () => updatePosition()

    window.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleResize)
    }
  }, [targetElement])

  // Close tooltip when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as globalThis.Node) &&
        !targetElement.contains(e.target as globalThis.Node)
      ) {
        // Don't close if clicking on overlay dismiss button
        const target = e.target as globalThis.Element
        if (target?.closest?.(".wall-overlay-dismiss")) {
          return
        }
        onClose()
      }
    }

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose, targetElement])

  // Listen for dismiss events from overlay button
  useEffect(() => {
    const handleDismiss = () => {
      setIsVisible(false)
      setTimeout(() => {
        onClose()
      }, 200)
    }

    targetElement.addEventListener("wall:dismiss", handleDismiss)
    return () => {
      targetElement.removeEventListener("wall:dismiss", handleDismiss)
    }
  }, [targetElement, onClose])

  if (!reasons || reasons.length === 0) {
    return null
  }

  const getReasonText = (reason: APIListOfReasonsValues): string => {
    const messageKey = REASON_TO_I18N_KEY[reason]
    if (!messageKey) {
      return reason
    }

    try {
      const message = chrome.i18n.getMessage(messageKey, [name || ""])
      return message || reason
    } catch (e) {
      log(`[HoverTooltip] Failed to get i18n message for ${messageKey}`, e)
      return reason
    }
  }

  const extensionName = chrome.i18n.getMessage("extensionName")

  // Note: This tooltip only shows addon logo/name and reasons - NO links.
  // Links are only shown in the Banner component (for full-page blocks), not in DOM scanner tooltips.
  return (
    <div
      ref={tooltipRef}
      className={`${style.wallDomTooltip}${isVisible ? ` ${style["wallDomTooltipVisible"]}` : ""}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}>
      <div className={style["wallDomTooltipHeader"]}>
        <img
          src={getExtensionURL(theWallWhite)}
          alt="The Wall"
          className={style["wallDomTooltipLogo"]}
        />
        <div className={style.wallDomTooltipName}>{extensionName}</div>
      </div>
      {reasons && reasons.length > 0 && (
        <div className={style.wallDomTooltipReason}>
          {reasons.map((reason, index) => (
            <div key={index} className={style.wallDomTooltipReasonItem}>
              {getReasonText(reason)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

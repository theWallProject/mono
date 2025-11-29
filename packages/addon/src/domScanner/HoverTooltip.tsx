import React, { useEffect, useRef, useState } from "react"

import { log } from "../helpers"
// eslint-disable-next-line import/order
import { REASON_TO_I18N_KEY } from "../helpers/reasonMap"
import style from "./style.module.css"

type HoverTooltipProps = {
  name?: string
  reasons?: string[]
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

  if (!name && (!reasons || reasons.length === 0)) {
    return null
  }

  const getReasonText = (reason: string): string => {
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

  return (
    <div
      ref={tooltipRef}
      className={style.wallDomTooltip}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}>
      {name && <div className={style.wallDomTooltipName}>{name}</div>}
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

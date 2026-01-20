import type { valuesOfListOfReasons } from "@theWallProject/common"
import React, { useEffect, useRef, useState } from "react"

import shieldIcon from "../../assets/images/shield-icon.svg"
import { getExtensionURL } from "../helpers"
import { getI18nMessage } from "../helpers/i18n-keys"
import { getReasonI18nKey } from "../helpers/reasonMap"
import style from "./style.module.css"
import { isWallDismissEvent, WALL_DISMISS_EVENT_TYPE } from "./visualTreatment"

type HoverTooltipProps = {
  name?: string
  reasons?: valuesOfListOfReasons[]
  targetElement: globalThis.HTMLElement
  onClose: () => void
}

export const HoverTooltip: React.FC<HoverTooltipProps> = ({ name, reasons, targetElement, onClose }) => {
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

  // Listen for dismiss events from overlay button
  useEffect(() => {
    const handleDismiss: globalThis.EventListener = (event) => {
      if (!isWallDismissEvent(event)) {
        return
      }
      setIsVisible(false)
      setTimeout(() => {
        onClose()
      }, 200)
    }

    targetElement.addEventListener(WALL_DISMISS_EVENT_TYPE, handleDismiss)
    return () => {
      targetElement.removeEventListener(WALL_DISMISS_EVENT_TYPE, handleDismiss)
    }
  }, [targetElement, onClose])

  if (!reasons || reasons.length === 0) {
    return null
  }

  const getReasonText = (reason: valuesOfListOfReasons): string => {
    const messageKey = getReasonI18nKey(reason)

    const substitutions = name ? [name] : []
    const message = getI18nMessage(messageKey, substitutions)
    if (!message || message === "") {
      throw new Error(`Failed to get i18n message for key: ${messageKey} (reason: ${reason})`)
    }
    return message
  }

  const extensionName = getI18nMessage("extensionName")

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
        <img src={getExtensionURL(shieldIcon)} alt="The Wall" className={style["wallDomTooltipLogo"]} />
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

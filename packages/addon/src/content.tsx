import domScannerStyleText from "data-text:src/domScanner/style.module.css"
import shareButtonstyleText from "data-text:src/share_button/ShareButton.module.css"
import styleText from "data-text:src/ui/style.module.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"
import { Banner } from "src/ui/Banner"

import { DomScanner } from "./domScanner/scanner"
import { log } from "./helpers"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
  // css: ["font.css"]
  // all_frames: true
  // run_at: "document_start"
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = [
    styleText,
    shareButtonstyleText,
    domScannerStyleText
  ].join("\n")
  return style
}

const Content = () => {
  const scannerRef = useRef<DomScanner | null>(null)

  useEffect(() => {
    // Initialize scanner after a delay
    const initTimeout = setTimeout(() => {
      try {
        log("[Content] Initializing DOM scanner")
        scannerRef.current = new DomScanner()
        scannerRef.current.initialize()
      } catch (e) {
        log("[Content] Failed to initialize DOM scanner", e)
        // Fail-safe: scanner just won't run, page still works
      }
    }, 1500) // Wait 1.5 seconds after page load

    // Handle navigation
    const handleNavigation = () => {
      try {
        if (scannerRef.current) {
          scannerRef.current.stop()
          scannerRef.current = null
        }

        // Re-initialize after navigation
        setTimeout(() => {
          try {
            scannerRef.current = new DomScanner()
            scannerRef.current.initialize()
          } catch (e) {
            log("[Content] Error re-initializing scanner after navigation", e)
          }
        }, 1500)
      } catch (e) {
        log("[Content] Error handling navigation", e)
      }
    }

    // Listen for navigation events
    window.addEventListener("popstate", handleNavigation)

    // Monitor URL changes (for SPA navigation)
    let lastUrl = window.location.href
    const urlCheckInterval = setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href
        handleNavigation()
      }
    }, 1000)

    return () => {
      clearTimeout(initTimeout)
      clearInterval(urlCheckInterval)
      window.removeEventListener("popstate", handleNavigation)
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current = null
      }
    }
  }, [])

  return <Banner />
}

export default Content

// Flag to control content script logging
// Enabled only in development mode, disabled in production builds
// Note: NODE_ENV is a built-in Plasmo variable automatically set to "development" or "production"
const ENABLE_CONTENT_SCRIPT_LOGGING = false
// console.log("🍉 process.env.NODE_ENV", process.env?.NODE_ENV, process.env)

export function log(...params: unknown[]) {
  if (!ENABLE_CONTENT_SCRIPT_LOGGING) {
    return
  }
  // alert(text)
  console.log("🍉", ...params)
  // debugger
}

export function error(...params: unknown[]) {
  if (!ENABLE_CONTENT_SCRIPT_LOGGING) {
    return
  }
  // alert(text)
  console.error("🔴🍉🔴", ...params)
  // debugger
}

export function warn(...params: unknown[]) {
  if (!ENABLE_CONTENT_SCRIPT_LOGGING) {
    return
  }
  // alert(text)
  console.warn("⚠️🍉⚠️", ...params)
  // debugger
}

export type TR_CAT = "Button"

export type TR_ACTION = "Click"

export type TR_NAME =
  | "allow_month"
  | "support_pal"
  | "support_ko_fi"
  | "show_alternatives"
  | "show_bds_guide"
  | "report_mistake"
  | "share_fb"
  | "share_tw"
  | "share_li"
  | "share_wa"
  | "share_tg"
  | "share_ig"
  | "hint_link"
  | "hint_expand"
  | "hint_dismiss_this"
  | "hint_disable_all"
  | "hint_toggle_system"
  | "hint_reset_dismissed"
  | "options_donate"
  | "options_share_fb"
  | "options_share_tw"
  | "options_share_li"
  | "options_share_wa"
  | "options_share_tg"
  | "options_contact"
  | "linkedin_job_processing_enable"
  | "linkedin_job_processing_disable"

// Helper to safely check for test mode
function isTestModeEnabled(): boolean {
  // Check window.TEST_MODE (browser/test environment) - primary check
  if (typeof window !== "undefined") {
    const windowWithTestMode = window
    if (windowWithTestMode.TEST_MODE) {
      return true
    }
  }

  // Check process.env.TEST_MODE (set by test-mode.ts)
  // According to Plasmo docs (https://docs.plasmo.com/framework/env), process.env is available in extensions
  if (typeof process !== "undefined" && process.env?.TEST_MODE === "true") {
    return true
  }

  return false
}

export function track(category: TR_CAT, action: TR_ACTION, name: TR_NAME) {
  // Disable tracking in test mode - log instead
  if (isTestModeEnabled()) {
    console.log("[TEST] Track:", { category, action, name })
    return
  }

  try {
    const img = document.createElement("img")
    // imageUrl += "&e_v=" + encodeURIComponent(value) // Optional numeric value
    img.src = `https://the-wall.win/bg.gif?rec=1&e_c=${encodeURIComponent(category)}&e_a=${encodeURIComponent(action)}&e_n=${encodeURIComponent(name)}`

    document.body.appendChild(img)
  } catch (e) {
    error(e)
  }
}

// Shared helper to ensure proper extension URL
export const getExtensionURL = (importedUrl: string) => {
  // If it's already a full extension URL, return as is
  if (importedUrl.startsWith("chrome-extension://") || importedUrl.startsWith("safari-web-extension://")) {
    return importedUrl
  }
  // Otherwise, convert it using chrome.runtime.getURL
  return chrome.runtime.getURL(importedUrl)
}

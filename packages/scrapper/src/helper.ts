/**
 * Minimal logging helpers.
 *
 * Machine-readable commands (`--json`) need stdout to contain *only* the
 * payload, so `log`/`warn` can be redirected to stderr for the duration of the
 * process. Set once at CLI startup via `setLogToStderr`.
 */

let logToStderr = false

/** Route `log`/`warn` to stderr so stdout stays machine-readable. */
export function setLogToStderr(enabled: boolean): void {
  logToStderr = enabled
}

export function log(...params: unknown[]) {
  if (logToStderr) {
    console.error(...params)
    return
  }
  console.log(...params)
}

export function error(...params: unknown[]) {
  console.error("🔴", ...params)
}

export function warn(...params: unknown[]) {
  if (logToStderr) {
    console.error(...params)
    return
  }
  console.warn("🟡", ...params)
}

export function cleanWebsite(website?: string) {
  return website
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .split("/?")[0]
}

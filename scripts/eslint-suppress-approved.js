import { createHash } from "crypto"
import { existsSync, readFileSync } from "fs"
import { join, relative } from "path"

const CACHE_FILE = join(process.cwd(), ".eslint-warnings-cache.json")

function computeCodeHash(lineContent) {
  const trimmed = lineContent.trim()
  return createHash("sha256").update(trimmed).digest("hex")
}

function createFingerprint(filePath, ruleId, message, lineContent) {
  const relativePath = relative(process.cwd(), filePath).replace(/\\/g, "/")
  const codeHash = computeCodeHash(lineContent)
  return {
    file: relativePath,
    ruleId: ruleId || "unknown",
    codeHash,
    message
  }
}

function fingerprintMatches(fp1, fp2) {
  return (
    fp1.file === fp2.file && fp1.ruleId === fp2.ruleId && fp1.codeHash === fp2.codeHash && fp1.message === fp2.message
  )
}

function log(...args) {
  // Use stderr to avoid interfering with JSON output
  console.error(...args)
}

function loadCache() {
  try {
    log(`[suppress-approved] Loading cache from: ${CACHE_FILE}`)
    if (!existsSync(CACHE_FILE)) {
      log(`[suppress-approved] Cache file does not exist`)
      return { approvedWarnings: [] }
    }
    const content = readFileSync(CACHE_FILE, "utf-8")
    const parsed = JSON.parse(content)
    const warnings = parsed.approvedWarnings || []
    log(`[suppress-approved] Loaded ${warnings.length} approved warnings from cache`)
    return {
      approvedWarnings: warnings
    }
  } catch (error) {
    log(`[suppress-approved] Error loading cache: ${error}`)
    return { approvedWarnings: [] }
  }
}

function readSourceLine(filePath, lineNumber) {
  try {
    const content = readFileSync(filePath, "utf-8")
    const lines = content.split("\n")
    if (lineNumber > 0 && lineNumber <= lines.length) {
      return lines[lineNumber - 1]
    }
    return ""
  } catch {
    return ""
  }
}

function filterApprovedMessages(messages, filename) {
  log(`[suppress-approved] Filtering messages for: ${filename}`)
  log(`[suppress-approved] Total messages: ${messages?.length || 0}`)

  const cache = loadCache()
  log(`[suppress-approved] Cache loaded, approved warnings: ${cache.approvedWarnings.length}`)

  if (cache.approvedWarnings.length === 0) {
    log(`[suppress-approved] No approved warnings in cache, returning all messages`)
    return messages
  }

  if (!filename || !messages || messages.length === 0) {
    log(`[suppress-approved] No filename or messages, returning as-is`)
    return messages
  }

  const filtered = messages.filter((message) => {
    // Only filter warnings (severity 1), not errors (severity 2)
    if (!message || message.severity !== 1) {
      return true
    }

    try {
      const lineContent = message.source || readSourceLine(filename, message.line || 0)
      const fingerprint = createFingerprint(filename, message.ruleId || null, message.message || "", lineContent)

      // Check if this warning is approved
      const isApproved = cache.approvedWarnings.some((approved) => fingerprintMatches(approved, fingerprint))

      if (isApproved) {
        log(`[suppress-approved] Suppressing approved warning: ${message.ruleId} in ${filename}:${message.line}`)
      }

      // Return false to suppress approved warnings
      return !isApproved
    } catch (error) {
      // If there's an error filtering, keep the message
      log(`[suppress-approved] Error filtering message: ${error}`)
      return true
    }
  })

  log(`[suppress-approved] Filtered ${messages.length} messages to ${filtered.length} messages`)
  return filtered
}

// ESLint 9 flat config plugin
// Note: Processors in ESLint 9 need to be applied per-file in the config
const suppressApprovedPlugin = {
  meta: {
    name: "suppress-approved-warnings",
    version: "1.0.0"
  },
  processors: {
    // Processor that filters messages after all rules run
    // These processors will be applied when referenced in the config
    js: {
      postprocess(messages, filename) {
        log(`[suppress-approved] .js processor called for: ${filename}`)
        log(
          `[suppress-approved] Messages type: ${typeof messages}, isArray: ${Array.isArray(messages)}, length: ${messages?.length}`
        )
        if (!messages) return []
        // Flatten if messages is an array of arrays
        const flatMessages = Array.isArray(messages[0]) ? messages.flat() : messages
        log(`[suppress-approved] After flattening: ${flatMessages.length} messages`)
        if (flatMessages.length > 0 && typeof flatMessages[0] === "object") {
          log(`[suppress-approved] Sample message keys: ${Object.keys(flatMessages[0]).join(", ")}`)
        }
        return filterApprovedMessages(flatMessages, filename || "")
      },
      supportsAutofix: false
    },
    ts: {
      postprocess(messages, filename) {
        log(`[suppress-approved] .ts processor called for: ${filename}`)
        log(
          `[suppress-approved] Messages type: ${typeof messages}, isArray: ${Array.isArray(messages)}, length: ${messages?.length}`
        )
        if (!messages) return []
        // Flatten if messages is an array of arrays
        const flatMessages = Array.isArray(messages[0]) ? messages.flat() : messages
        log(`[suppress-approved] After flattening: ${flatMessages.length} messages`)
        if (flatMessages.length > 0 && typeof flatMessages[0] === "object") {
          log(`[suppress-approved] Sample message keys: ${Object.keys(flatMessages[0]).join(", ")}`)
        }
        return filterApprovedMessages(flatMessages, filename || "")
      },
      supportsAutofix: false
    },
    tsx: {
      postprocess(messages, filename) {
        log(`[suppress-approved] .tsx processor called for: ${filename}`)
        log(
          `[suppress-approved] Messages type: ${typeof messages}, isArray: ${Array.isArray(messages)}, length: ${messages?.length}`
        )
        if (!messages) return []
        // Flatten if messages is an array of arrays
        const flatMessages = Array.isArray(messages[0]) ? messages.flat() : messages
        log(`[suppress-approved] After flattening: ${flatMessages.length} messages`)
        if (flatMessages.length > 0 && typeof flatMessages[0] === "object") {
          log(`[suppress-approved] Sample message keys: ${Object.keys(flatMessages[0]).join(", ")}`)
        }
        return filterApprovedMessages(flatMessages, filename || "")
      },
      supportsAutofix: false
    },
    jsx: {
      postprocess(messages, filename) {
        log(`[suppress-approved] .jsx processor called for: ${filename}`)
        log(
          `[suppress-approved] Messages type: ${typeof messages}, isArray: ${Array.isArray(messages)}, length: ${messages?.length}`
        )
        if (!messages) return []
        // Flatten if messages is an array of arrays
        const flatMessages = Array.isArray(messages[0]) ? messages.flat() : messages
        log(`[suppress-approved] After flattening: ${flatMessages.length} messages`)
        if (flatMessages.length > 0 && typeof flatMessages[0] === "object") {
          log(`[suppress-approved] Sample message keys: ${Object.keys(flatMessages[0]).join(", ")}`)
        }
        return filterApprovedMessages(flatMessages, filename || "")
      },
      supportsAutofix: false
    }
  }
}

export default suppressApprovedPlugin

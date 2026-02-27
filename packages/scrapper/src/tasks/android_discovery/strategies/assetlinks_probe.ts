/**
 * Digital Asset Links (assetlinks.json) probe strategy.
 *
 * Fetches the Google DAL API for each company domain and extracts
 * Android app package names. This is the highest-confidence signal:
 * assetlinks.json is a cryptographic declaration by the domain owner.
 *
 * Safety layers applied in order:
 * 1. No cross-domain redirects
 * 2. SDK package blocklist (~40 prefixes)
 * 3. Hosting platform detection (Wix, Shopify, etc.)
 * 4. Dev/staging variant filter
 */

import { getRegisteredDomain } from "@theWallProject/common"

import { log, warn } from "../../../helper"
import { CONFIG } from "../config"
import { filterHostingPackages } from "../filters/hosting_detector"
import { filterPackages } from "../filters/sdk_blocklist"
import type { StrategyResult } from "../types"

// ── DAL API response types ───────────────────────────────────────────────

/** Google DAL API returns camelCase format */
type DALStatement = {
  readonly source?: { readonly web?: { readonly site?: string } }
  readonly relation?: string
  readonly target?: {
    readonly androidApp?: {
      readonly packageName?: string
      readonly certificate?: { readonly sha256Fingerprint?: string }
    }
  }
}

type DALResponse = {
  readonly statements?: readonly DALStatement[]
  readonly maxAge?: string
  readonly debugString?: string
  readonly errorCode?: readonly string[]
}

/** Direct assetlinks.json uses snake_case format */
type DirectEntry = {
  readonly relation?: readonly string[]
  readonly target?: {
    readonly namespace?: string
    readonly package_name?: string
    readonly sha256_cert_fingerprints?: readonly string[]
  }
}

// ── Fetch functions ──────────────────────────────────────────────────────

/**
 * Extract package names from DAL API response.
 * The API uses camelCase: target.androidApp.packageName
 */
function extractFromDAL(data: DALResponse): string[] {
  if (!data.statements || !Array.isArray(data.statements)) {
    return []
  }

  const packages: string[] = []
  for (const statement of data.statements) {
    const pkg = statement.target?.androidApp?.packageName
    if (pkg) {
      packages.push(pkg)
    }
  }
  return packages
}

/**
 * Extract package names from direct assetlinks.json.
 * The direct format uses snake_case: target.namespace + target.package_name
 */
function extractFromDirect(data: readonly DirectEntry[]): string[] {
  const packages: string[] = []
  for (const entry of data) {
    if (entry.target?.namespace === "android_app" && entry.target.package_name) {
      packages.push(entry.target.package_name)
    }
  }
  return packages
}

/**
 * Fetch assetlinks via Google's DAL API.
 * Tries both bare domain and www. prefix since many domains redirect.
 */
async function fetchViaDAL(domain: string): Promise<readonly string[]> {
  // Try both variants: bare domain often redirects, www. usually works
  const variants = [domain]
  if (!domain.startsWith("www.")) {
    variants.push(`www.${domain}`)
  }

  for (const variant of variants) {
    const url = `${CONFIG.dalApiUrl}?source.web.site=https://${variant}&relation=${CONFIG.dalRelation}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CONFIG.fetchTimeoutMs)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: "manual"
      })

      if (!response.ok) {
        continue
      }

      const data = (await response.json()) as DALResponse

      // Check for redirect errors — try next variant
      if (data.errorCode?.includes("ERROR_CODE_REDIRECT") && !data.statements?.length) {
        continue
      }

      const packages = extractFromDAL(data)
      if (packages.length > 0) {
        return packages
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        continue
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  return []
}

/**
 * Fetch assetlinks.json directly from the domain.
 * Fallback when DAL API fails or returns redirect errors.
 */
async function fetchDirect(domain: string): Promise<readonly string[]> {
  const variants = [domain]
  if (!domain.startsWith("www.")) {
    variants.push(`www.${domain}`)
  }

  for (const variant of variants) {
    const url = `https://${variant}/.well-known/assetlinks.json`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CONFIG.fetchTimeoutMs)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: { Accept: "application/json" }
      })

      if (!response.ok) {
        continue
      }

      // Verify no cross-domain redirect
      const responseUrl = response.url || url
      try {
        const responseDomain = getRegisteredDomain(responseUrl)
        const inputDomain = getRegisteredDomain(variant)
        if (responseDomain !== inputDomain) {
          warn(`  [assetlinks] Cross-domain redirect: ${variant} -> ${responseDomain}, rejecting`)
          continue
        }
      } catch {
        // If domain parsing fails, skip this result
        continue
      }

      const text = await response.text()
      let data: unknown
      try {
        data = JSON.parse(text)
      } catch {
        continue
      }

      if (!Array.isArray(data)) {
        continue
      }

      const packages = extractFromDirect(data as readonly DirectEntry[])
      if (packages.length > 0) {
        return packages
      }
    } catch {
      continue
    } finally {
      clearTimeout(timeout)
    }
  }

  return []
}

// ── Main probe function ──────────────────────────────────────────────────

/**
 * Probe a single domain for Android app packages via assetlinks.
 *
 * Applies all safety filters:
 * 1. SDK blocklist
 * 2. Hosting platform detection
 * 3. Dev/staging variant filter
 */
export async function probeAssetlinks(domain: string): Promise<StrategyResult> {
  // Try DAL API first, fall back to direct fetch
  let rawPackages = await fetchViaDAL(domain)
  if (rawPackages.length === 0) {
    rawPackages = await fetchDirect(domain)
  }

  if (rawPackages.length === 0) {
    return { packages: [], rawCount: 0, filteredCount: 0 }
  }

  // Deduplicate
  const uniquePackages = [...new Set(rawPackages)]
  const rawCount = uniquePackages.length

  // Layer 1: SDK blocklist
  const { accepted: afterSdk, sdkFiltered, devFiltered: devFromSdk } = filterPackages(uniquePackages)

  if (sdkFiltered.length > 0) {
    log(`  [filter] ${domain}: removed ${sdkFiltered.length} SDK packages: ${sdkFiltered.join(", ")}`)
  }
  if (devFromSdk.length > 0) {
    log(`  [filter] ${domain}: removed ${devFromSdk.length} dev variants: ${devFromSdk.join(", ")}`)
  }

  // Layer 2: Hosting platform detection
  const afterHosting = filterHostingPackages(domain, afterSdk)
  const hostingFiltered = afterSdk.length - afterHosting.length

  if (hostingFiltered > 0) {
    log(`  [filter] ${domain}: removed ${hostingFiltered} hosting platform packages`)
  }

  const filteredCount = rawCount - afterHosting.length

  return {
    packages: afterHosting,
    rawCount,
    filteredCount
  }
}

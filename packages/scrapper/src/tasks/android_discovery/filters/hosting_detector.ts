/**
 * Hosting platform detection.
 *
 * Wix-hosted, Shopify-hosted, etc. sites may return the hosting platform's
 * assetlinks.json instead of their own. If the returned packages match a
 * known hosting platform AND the company's domain is NOT that platform,
 * we must reject all assetlinks results for that company.
 */

import { getRegisteredDomain } from "@theWallProject/common"

/** Map of hosting platform registered domain → their known Android package prefixes */
const HOSTING_PLATFORMS: ReadonlyMap<string, readonly string[]> = new Map([
  ["wix.com", ["com.wix"]],
  ["shopify.com", ["com.shopify"]],
  ["squarespace.com", ["com.squarespace"]],
  ["webflow.com", ["com.webflow"]],
  ["godaddy.com", ["com.godaddy"]],
  ["weebly.com", ["com.weebly"]],
  ["wordpress.com", ["org.wordpress"]],
  ["bigcommerce.com", ["com.bigcommerce"]],
  ["hubspot.com", ["com.hubspot"]]
])

/**
 * Check if any of the discovered packages belong to a hosting platform
 * that the company is NOT.
 *
 * Returns the name of the detected platform if it's a false positive,
 * or null if the packages are safe.
 */
export function detectHostingPlatform(
  companyDomain: string,
  packages: readonly string[]
): string | null {
  const companyRegistered = getRegisteredDomain(companyDomain)

  for (const [platformDomain, platformPrefixes] of HOSTING_PLATFORMS) {
    // If the company IS the platform, their packages are legitimate
    if (companyRegistered === platformDomain) {
      continue
    }

    // Check if any discovered package matches this platform's prefixes
    const hasMatch = packages.some((pkg) =>
      platformPrefixes.some(
        (prefix) => pkg === prefix || pkg.startsWith(`${prefix}.`)
      )
    )

    if (hasMatch) {
      return platformDomain
    }
  }

  return null
}

/**
 * Filter out packages that belong to a hosting platform.
 * Returns only packages that are NOT from a hosting platform (unless the company IS that platform).
 */
export function filterHostingPackages(
  companyDomain: string,
  packages: readonly string[]
): readonly string[] {
  const companyRegistered = getRegisteredDomain(companyDomain)

  return packages.filter((pkg) => {
    for (const [platformDomain, platformPrefixes] of HOSTING_PLATFORMS) {
      if (companyRegistered === platformDomain) {
        continue
      }
      const isHostingPkg = platformPrefixes.some(
        (prefix) => pkg === prefix || pkg.startsWith(`${prefix}.`)
      )
      if (isHostingPkg) {
        return false
      }
    }
    return true
  })
}

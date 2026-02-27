/**
 * Comprehensive SDK package prefix blocklist.
 *
 * assetlinks.json declarations often include SDK packages (analytics, auth,
 * payments, deep linking) that are NOT the company's own apps. These must be
 * filtered before any discovery result is accepted.
 *
 * Uses prefix matching: "com.google.android" blocks "com.google.android.gms",
 * "com.google.android.apps.maps", etc.
 */

const SDK_PREFIXES: readonly string[] = [
  // ── Google ecosystem ──────────────────────────────────────────────────
  "com.google.android",
  "com.google.firebase",
  "com.google.gms",
  "com.android.vending",
  "com.android.chrome",

  // ── Social login / deep linking SDKs ──────────────────────────────────
  "com.facebook.katana",
  "com.facebook.orca",
  "com.facebook.lite",
  "com.twitter.android",
  "com.instagram.android",
  "com.linkedin.android",
  "com.snapchat.android",
  "com.whatsapp",
  "com.zhiliaoapp.musically", // TikTok

  // ── Analytics / crash reporting ────────────────────────────────────────
  "com.crashlytics",
  "com.newrelic",
  "com.bugsnag",
  "io.sentry",
  "com.datadog",
  "com.splunk",

  // ── Attribution / deep linking ─────────────────────────────────────────
  "io.branch",
  "com.appsflyer",
  "com.adjust.sdk",
  "com.singular.sdk",
  "com.kochava",

  // ── Push / engagement ──────────────────────────────────────────────────
  "com.onesignal",
  "com.clevertap",
  "com.segment",
  "com.mixpanel",
  "com.amplitude",
  "com.braze",
  "com.urbanairship",
  "com.leanplum",

  // ── Payment SDKs ───────────────────────────────────────────────────────
  "com.stripe",
  "com.paypal",
  "com.samsung.android.spay",
  "com.braintreepayments",
  "com.adyen",

  // ── Auth SDKs ──────────────────────────────────────────────────────────
  "com.auth0",
  "com.okta"
]

/**
 * Dev/staging variant suffixes to filter out.
 * These are typically internal builds, not production apps.
 */
const DEV_SUFFIXES: readonly string[] = [".dev", ".debug", ".staging", ".beta", ".internal", ".canary", ".nightly"]

/**
 * Check if a package name matches any SDK prefix in the blocklist.
 */
export function isSdkPackage(packageName: string): boolean {
  return SDK_PREFIXES.some(
    (prefix) => packageName === prefix || packageName.startsWith(`${prefix}.`) || packageName.startsWith(`${prefix}-`)
  )
}

/**
 * Check if a package name is a dev/staging variant.
 */
export function isDevVariant(packageName: string): boolean {
  return DEV_SUFFIXES.some((suffix) => packageName.endsWith(suffix))
}

/**
 * Filter an array of package names, removing SDK packages and dev variants.
 * Returns only packages likely to be the company's own production apps.
 */
export function filterPackages(packages: readonly string[]): {
  readonly accepted: readonly string[]
  readonly sdkFiltered: readonly string[]
  readonly devFiltered: readonly string[]
} {
  const accepted: string[] = []
  const sdkFiltered: string[] = []
  const devFiltered: string[] = []

  for (const pkg of packages) {
    if (isSdkPackage(pkg)) {
      sdkFiltered.push(pkg)
    } else if (isDevVariant(pkg)) {
      devFiltered.push(pkg)
    } else {
      accepted.push(pkg)
    }
  }

  return { accepted, sdkFiltered, devFiltered }
}

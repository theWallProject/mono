/**
 * Known-safe apps that must NEVER be associated with the wrong company.
 *
 * After every enrichment run, we verify that none of these popular apps
 * would be incorrectly flagged by the new android_app_ids entries.
 * Any match = pipeline failure.
 */

export const KNOWN_SAFE_APPS: readonly string[] = [
  // Google
  "com.google.android.apps.maps",
  "com.google.android.youtube",
  "com.google.android.gm",
  "com.google.android.apps.photos",

  // Meta
  "com.facebook.katana",
  "com.facebook.orca",
  "com.instagram.android",
  "com.whatsapp",

  // Social
  "com.twitter.android",
  "com.snapchat.android",
  "com.zhiliaoapp.musically", // TikTok
  "com.reddit.frontpage",
  "org.telegram.messenger",
  "com.discord",
  "com.linkedin.android",
  "com.pinterest",

  // Entertainment
  "com.spotify.music",
  "com.netflix.mediaclient",
  "tv.twitch.android.app",
  "com.amazon.avod.thirdpartyclient",

  // Transport
  "com.uber.driver",
  "com.ubercab",
  "com.lyft.android",

  // Finance
  "com.paypal.android.p2pmobile",
  "com.venmo",
  "com.robinhood.android",
  "com.coinbase.android",
  "com.squareup.cash",

  // Shopping
  "com.amazon.mShop.android.shopping",
  "com.ebay.mobile",
  "com.alibaba.aliexpresshd",

  // Productivity
  "com.microsoft.teams",
  "com.slack",
  "us.zoom.videomeetings",
  "com.dropbox.android",
  "com.notion.id",

  // Browsers
  "com.android.chrome",
  "org.mozilla.firefox",
  "com.brave.browser",

  // Edge cases that could collide with existing dev_id prefixes
  "com.mondaymotivation.app",
  "com.wixsite.builder",
  "com.etrade.mobilepro",
  "com.moonpayments.wallet"
]

/**
 * Check if any of the discovered android_app_ids would incorrectly
 * match a known-safe app. Uses exact matching (not prefix).
 *
 * Returns an array of conflicts (empty = safe).
 */
export function checkKnownSafeApps(
  discoveredAppIds: readonly string[]
): readonly string[] {
  const safeSet = new Set(KNOWN_SAFE_APPS)
  return discoveredAppIds.filter((id) => safeSet.has(id))
}

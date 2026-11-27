import { CompressedManualItemType } from "../../types"

/**
 * Ad-console hints - Ethicly as the alternative to buying ads from the largest networks.
 *
 * Store the subdomain, never the parent. A domain in the database covers every subdomain beneath it,
 * so `google.com` would put this hint on Search, Gmail and Docs. `ads.google.com` covers only itself,
 * which is the whole ad console and nothing else.
 *
 * That rule is what makes the entries below safe, and it is enforced by the matcher rather than by
 * care here: a stored subdomain covers itself, a stored domain covers its children, and nothing
 * matches in the other direction. The contract tests in `@theWallProject/common` pin it.
 *
 * Android app IDs are the ad-console apps only. The YouTube app is not Google Ads, and hinting an ad
 * exchange at someone watching a video would be the same category error as hinting it on Search.
 */

const ETHICLY_HINT_URL = "https://ads.ethicly.ch/functions/v1/track-affiliate-click?utm_source=ahmed&utm_medium=wall&utm_campaign=extension"

const HINT_TEXT = (network: string) =>
  `This is ${network}'s ad console. Ethicly sells ad space to publishers directly, without a network in the middle.`

export const adPlatformHints: CompressedManualItemType[] = [
  {
    name: "Google Ads",
    reasons: [],
    ws: ["https://ads.google.com"],
    isHint: true,
    hintText: HINT_TEXT("Google"),
    hintUrl: ETHICLY_HINT_URL,
    hintCompanyId: "ethicly_ads"
  },
  {
    name: "Meta Ads",
    reasons: [],
    ws: ["https://business.facebook.com", "https://adsmanager.facebook.com"],
    isHint: true,
    hintText: HINT_TEXT("Meta"),
    hintUrl: ETHICLY_HINT_URL,
    hintCompanyId: "ethicly_ads"
  },
  {
    name: "Amazon Ads",
    reasons: [],
    ws: ["https://advertising.amazon.com"],
    isHint: true,
    hintText: HINT_TEXT("Amazon"),
    hintUrl: ETHICLY_HINT_URL,
    hintCompanyId: "ethicly_ads",
    android_app_ids: ["com.amazon.adsmanager"]
  },
  {
    name: "X Ads",
    reasons: [],
    ws: ["https://ads.twitter.com", "https://ads.x.com", "https://business.twitter.com", "https://business.x.com"],
    isHint: true,
    hintText: HINT_TEXT("X"),
    hintUrl: ETHICLY_HINT_URL,
    hintCompanyId: "ethicly_ads"
  }
]

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

/**
 * Copy that says what Ethicly actually does, taken from their own site rather than invented here:
 * contextual placement, fixed prices, matched by the page rather than by the reader, no retargeting,
 * no audience data, no auction. "Backed by Tech for Palestine" is theirs too.
 *
 * One sentence of what this page is, one of what Ethicly offers instead. No superlatives, no
 * exclamation, no claim that needs a number we do not have.
 */
const HINT_TEXT = (_network: string) =>
  `Ethicly is a pro-Palestine ad network: ads matched to the page, not the person.`

/**
 * Publisher consoles - the other side of the same two companies.
 *
 * An advertiser console buys ad space; a publisher console sells it. Different pages, different
 * intent, so these are their own hints rather than a second message squeezed into the first. Hosts
 * were checked live before being written here: `adsense.google.com` (302 to /start/), `admob.google.com`
 * (301 to /home/, and apps.admob.com redirects into it), `aps.amazon.com` (302).
 *
 * Left out on purpose, because no host could be verified:
 * - X's publisher console. `mo.x.com` and `monetize.x.com` do not resolve, and x.com/monetization is
 *   a path on x.com, which the host rule cannot scope without swallowing the whole site.
 * - The SSPs (PubMatic, Magnite, OpenX). Their consoles either do not resolve or are company front
 *   doors, and a direct-deal platform is not a drop-in swap for an SSP anyway.
 * - Meta Audience Network, which is facebook.com/audiencenetwork — a page, not a host. It needs the
 *   `fb` selector, not a hint.
 */
const PUBLISHER_HINT_TEXT = (_network: string) =>
  `Ethicly is a pro-Palestine ad network: fixed prices, no exchange in the middle.`

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
    name: "Google AdSense",
    reasons: [],
    ws: ["https://adsense.google.com"],
    isHint: true,
    hintText: PUBLISHER_HINT_TEXT("Google AdSense"),
    hintUrl: ETHICLY_HINT_URL,
    hintCompanyId: "ethicly_ads"
  },
  {
    name: "AdMob",
    reasons: [],
    ws: ["https://admob.google.com"],
    isHint: true,
    hintText: PUBLISHER_HINT_TEXT("AdMob"),
    hintUrl: ETHICLY_HINT_URL,
    hintCompanyId: "ethicly_ads"
  },
  {
    name: "Amazon Publisher Services",
    reasons: [],
    ws: ["https://aps.amazon.com"],
    isHint: true,
    hintText: PUBLISHER_HINT_TEXT("Amazon Publisher Services"),
    hintUrl: ETHICLY_HINT_URL,
    hintCompanyId: "ethicly_ads"
  },
  {
    name: "X Ads",
    reasons: [],
    // Every one of these is live and reaches the ad console: ads.twitter.com and ads.x.com both 302
    // to business.x.com/en/advertising, business.twitter.com 301s to business.x.com, and
    // business.x.com is the destination itself. Stored as written, because people type any of them.
    ws: [
      "https://ads.twitter.com",
      "https://ads.x.com",
      "https://business.twitter.com",
      "https://business.x.com"
    ],
    isHint: true,
    hintText: HINT_TEXT("X"),
    hintUrl: ETHICLY_HINT_URL,
    hintCompanyId: "ethicly_ads"
  }
]

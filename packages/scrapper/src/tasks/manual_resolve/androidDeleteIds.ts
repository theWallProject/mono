/**
 * Android package IDs to exclude from the final database.
 *
 * When a package ID is listed here, it is filtered out during merge_static.ts
 * aggregation — it will NOT appear in any company's android_app_ids.
 *
 * Use this for false positives discovered by assetlinks.json probing.
 * Each entry must exist in at least one androidDiscoveries.ts entry's packages array.
 * The build fails hard if a listed ID is not found in any discovery.
 */
export const androidDeleteIds: string[] = [
  "com.wix.admin",
  "org.wordpress.android",
  "com.jetpack.android",
  "org.wordpress.android.prealpha",
  "com.jetpack.android.prealpha",
  "com.woocommerce.android",
  "com.woocommerce.android.prealpha",
  "com.celray",
  "com.tumblr",
  "notion.id",
  "com.substack.app"
]

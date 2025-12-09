import { APIListOfReasonsSchema } from "@theWallProject/common"
import { z } from "zod"

export enum DBFileNames {
  ALL = "ALL",
  WEBSITES = "WEBSITES",
  FLAGGED_FACEBOOK = "FLAGGED_FACEBOOK",
  FLAGGED_LI_COMPANY = "FLAGGED_LI_COMPANY",
  FLAGGED_TWITTER = "FLAGGED_TWITTER",
  FLAGGED_INSTAGRAM = "FLAGGED_INSTAGRAM",
  FLAGGED_GITHUB = "FLAGGED_GITHUB",
  FLAGGED_YOUTUBE_PROFILE = "FLAGGED_YOUTUBE_PROFILE",
  FLAGGED_YOUTUBE_CHANNEL = "FLAGGED_YOUTUBE_CHANNEL",
  FLAGGED_TIKTOK = "FLAGGED_TIKTOK",
  FLAGGED_THREADS = "FLAGGED_THREADS"
}

export type DBFileNamesValues = `${DBFileNames}`

/**
 * Crunchbase scraped item schema
 * Only includes fields that are present in the Crunchbase API response
 * DON'T USE THIS SCHEMA FOR MANUAL OVERRIDES
 */
const CrunchbaseScrappedItemSchema = z
  .object({
    name: z.string(),
    id: z.string(),
    cbLink: z.string().optional(),
    reasons: z.array(APIListOfReasonsSchema),
    li: z.string().optional(),
    ws: z.string().optional(),
    fb: z.string().optional(),
    tw: z.string().optional(),
    stock_symbol: z.string().optional(),
    stock_exchange_symbol: z.string().optional(),
    acquirer_identifier: z
      .array(
        z
          .object({
            name: z.string(),
            link: z.string().url()
          })
          .strict()
      )
      .optional(),
    hq_postal_code: z.string().optional(),
    founderIds: z
      .array(
        z
          .object({
            name: z.string(),
            link: z.string().url()
          })
          .strict()
      )
      .optional(),
    investorIds: z
      .array(
        z
          .object({
            name: z.string(),
            link: z.string().url()
          })
          .strict()
      )
      .optional(),
    acquirerIds: z
      .array(
        z
          .object({
            name: z.string(),
            link: z.string().url()
          })
          .strict()
      )
      .optional(),
    /** short_description */
    description: z.string().optional(),

    /** rank_org_company */
    cbRank: z.string().optional(),

    /** revenue_range */
    estRevenue: z.string().optional(),

    /** categories */
    industries: z.array(z.string()).optional(),

    /** category_groups */
    industryGroups: z.array(z.string()).optional()
  })
  .strict()

export const CrunchbaseScrappedItemsSchema = z.array(CrunchbaseScrappedItemSchema)

/**
 * Merged data item schema
 * Includes ig/gh/ytp/ytc/tt/th from manual overrides
 * Also includes hint and Android fields from manual data/overrides (not from Crunchbase)
 */
const MergedDataItemSchema = CrunchbaseScrappedItemSchema.extend({
  /** instagram */
  ig: z.string().optional(),
  /** github */
  gh: z.string().optional(),
  /** youtube profile */
  ytp: z.string().optional(),
  /** youtube channel */
  ytc: z.string().optional(),
  /** tiktok */
  tt: z.string().optional(),
  /** threads */
  th: z.string().optional(),
  /** hint flag */
  isHint: z.boolean().optional(),
  /** hint text */
  hintText: z.string().optional(),
  /** hint URL */
  hintUrl: z.string().optional(),
  /** Android app ID for hints (e.g., "com.xxx.yyy") */
  hint_android_id: z.string().optional(),
  /** Android developer ID like "com.wix" (not full app package IDs) */
  android_dev_id: z.string().optional(),
  /** Array of full Android app package IDs for exact matching */
  android_app_ids: z.array(z.string()).optional()
})

export const MergedDataFileSchema = z.array(MergedDataItemSchema)

export const CompressedManualItemSchema = z
  .object({
    reasons: z.array(APIListOfReasonsSchema).optional(),
    name: z.string().min(1, { message: "String cannot be empty" }),
    li: z.array(z.string()).optional(),
    ws: z.array(z.string()).min(1, { message: "String cannot be empty" }),
    fb: z.array(z.string()).optional(),
    tw: z.array(z.string()).optional(),
    ig: z.array(z.string()).optional(),
    gh: z.array(z.string()).optional(),
    ytp: z.array(z.string()).optional(),
    ytc: z.array(z.string()).optional(),
    tt: z.array(z.string()).optional(),
    th: z.array(z.string()).optional(),
    isHint: z.boolean().optional(),
    hintText: z.string().optional(),
    hintUrl: z.string().optional(),
    /** Android app ID for hints (e.g., "com.xxx.yyy") */
    hint_android_id: z.string().optional(),
    /** Android developer ID like "com.wix" (not full app package IDs) */
    android_dev_id: z.string().optional(),
    /** Array of full Android app package IDs for exact matching */
    android_app_ids: z.array(z.string()).optional()
  })
  .strict()

/**
 * NetworksFlatItemsSchema - Schema for intermediate FLAGGED_* files
 *
 * These files are flattened representations used during the pipeline.
 * They are merged in the final() step to create ALL.json.
 *
 * ONLY these 4 fields are needed:
 * - id: for merging entries in final() step
 * - selector: the platform-specific identifier (username, domain, etc.)
 * - name: company name for display/debugging
 * - reasons: blocking reasons
 *
 * Other fields (stock symbol, hints, Android) are carried through 2_MERGED_ALL.json
 * and added directly in the final() step when creating ALL.json.
 */
export const NetworksFlatItemsSchema = z
  .object({
    id: z.string(),
    selector: z.string(),
    name: z.string(),
    reasons: z.array(APIListOfReasonsSchema)
  })
  .strict()

export type NetworksFlatItemType = z.infer<typeof NetworksFlatItemsSchema>

export type NetworksFlatItemsType = NetworksFlatItemType[]

/**
 * Manual entry schema
 * Used for entries created from manual data (Hints, BuyIsraeliTech)
 * Only includes fields that manual entries actually use
 */
export const ManualEntrySchema = z
  .object({
    name: z.string(),
    id: z.string(),
    reasons: z.array(APIListOfReasonsSchema),
    li: z.string().optional(),
    ws: z.string().optional(),
    fb: z.string().optional(),
    tw: z.string().optional(),
    isHint: z.boolean().optional(),
    hintText: z.string().optional(),
    hintUrl: z.string().optional(),
    /** Android app ID for hints (e.g., "com.xxx.yyy") */
    hint_android_id: z.string().optional(),
    /** Android developer ID like "com.wix" (not full app package IDs) */
    android_dev_id: z.string().optional(),
    /** Array of full Android app package IDs for exact matching */
    android_app_ids: z.array(z.string()).optional()
  })
  .strict()

export const ManualEntriesSchema = z.array(ManualEntrySchema)

export const BuyIsraeliTechSchema = z.array(
  z
    .object({
      Name: z.string().min(1, { message: "String cannot be empty" }),
      Link: z.union([z.string().min(1, { message: "String cannot be empty" }), z.null()]),
      IsraelRelation: z.union([z.literal("HQ"), z.literal("Satellite Office")]),
      /** Tags/category for the company */
      Tags: z.string().optional(),
      /** Stage of the company (Early, Mid, Late, etc.) */
      Stage: z.string().optional(),
      /** Description of the company */
      Description: z.string().optional(),
      /** Logo file path */
      Logo: z.string().optional()
    })
    .strict()
)

export type CompressedManualItemType = z.infer<typeof CompressedManualItemSchema>
export type ManualEntryType = z.infer<typeof ManualEntrySchema>
export type ManualEntriesType = z.infer<typeof ManualEntriesSchema>
export type CrunchbaseScrappedItemType = z.infer<typeof CrunchbaseScrappedItemSchema>
export type CrunchbaseScrappedItemsType = z.infer<typeof CrunchbaseScrappedItemsSchema>
export type MergedDataItem = z.infer<typeof MergedDataItemSchema>
export type MergedDataFile = z.infer<typeof MergedDataFileSchema>
export type BuyIsraeliTechType = z.infer<typeof BuyIsraeliTechSchema>

/**
 * Manual override fields type
 * Allows arrays for link fields in overrides
 */
export type ManualOverrideFields = {
  ws?: string | string[]
  li?: string | string[]
  fb?: string | string[]
  tw?: string | string[]
  ig?: string | string[]
  gh?: string | string[]
  ytp?: string | string[]
  ytc?: string | string[]
  tt?: string | string[]
  th?: string | string[]
  /**
   * Android developer ID like "com.wix" (not full app package IDs).
   * This is the developer identifier, not a specific app package name.
   */
  android_dev_id?: string
  /**
   * Array of full Android app package IDs for exact matching.
   * Use this when you want to block specific apps rather than all apps from a developer.
   */
  android_app_ids?: string[]
  /**
   * Alternatives array with name and website
   */
  alt?: Array<{
    n: string // name
    ws: string // website
  }>
} & Omit<Partial<CrunchbaseScrappedItemType>, "ws" | "li" | "fb" | "tw" | "ig" | "gh" | "ytp" | "ytc" | "tt" | "th">

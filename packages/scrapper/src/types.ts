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
    industryGroups: z.array(z.string()).optional(),
    /** hint flag */
    isHint: z.boolean().optional(),
    /** hint text */
    hintText: z.string().optional(),
    /** hint URL */
    hintUrl: z.string().optional(),
    /** Android developer ID like "com.wix" (not full app package IDs) */
    android_dev_id: z.string().optional(),
    /** Array of full Android app package IDs for exact matching */
    android_app_ids: z.array(z.string()).optional()
  })
  .strict()

export const CrunchbaseScrappedItemsSchema = z.array(CrunchbaseScrappedItemSchema)

export const APIEndpointDomainsResultSchema = z
  .object({
    selector: z.string(),
    id: z.string(),
    reasons: z.array(APIListOfReasonsSchema),
    name: z.string(),
    /** stock sympol */
    s: z.string().optional(),
    /** hint flag */
    hint: z.boolean().optional(),
    /** hint text */
    hintText: z.string().optional(),
    /** hint URL */
    hintUrl: z.string().optional()
  })
  .strict()

export type APIEndpointDomainsResult = z.infer<typeof APIEndpointDomainsResultSchema>

export type APIEndpointDomains = APIEndpointDomainsResult[]
// Schema for merged data that may include ig/gh/ytp/ytc/tt/th from manual overrides
export const MergedDataItemSchema = CrunchbaseScrappedItemSchema.extend({
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
  th: z.string().optional()
})

export const MergedDataFileSchema = z.array(MergedDataItemSchema)

export const ManualItemSchema = z
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
    hintUrl: z.string().optional()
  })
  .strict()

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

export type ManualItemType = z.infer<typeof ManualItemSchema>
export type CrunchbaseScrappedItemType = z.infer<typeof CrunchbaseScrappedItemSchema>
export type CrunchbaseScrappedItemsType = z.infer<typeof CrunchbaseScrappedItemsSchema>
export type MergedDataItem = z.infer<typeof MergedDataItemSchema>
export type MergedDataFile = z.infer<typeof MergedDataFileSchema>
export type BuyIsraeliTechType = z.infer<typeof BuyIsraeliTechSchema>

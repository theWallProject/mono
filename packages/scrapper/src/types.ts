import { APIListOfReasonsSchema } from "@theWallProject/common"
import { z } from "zod"

export const ScrappedItemSchema = z.object({
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
      z.object({
        name: z.string(),
        link: z.string().url()
      })
    )
    .optional(),
  hq_postal_code: z.string().optional(),
  founderIds: z
    .array(
      z.object({
        name: z.string(),
        link: z.string().url()
      })
    )
    .optional(),
  investorIds: z
    .array(
      z.object({
        name: z.string(),
        link: z.string().url()
      })
    )
    .optional(),
  acquirerIds: z
    .array(
      z.object({
        name: z.string(),
        link: z.string().url()
      })
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
  hintUrl: z.string().optional()
})

export const APIScrapperFileDataSchema = z.array(ScrappedItemSchema)

export const ManualItemSchema = z.object({
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

export const BuyIsraeliTechSchema = z.array(
  z.object({
    Name: z.string().min(1, { message: "String cannot be empty" }),
    Link: z.union([
      z.string().min(1, { message: "String cannot be empty" }),
      z.null()
    ]),
    IsraelRelation: z.union([z.literal("HQ"), z.literal("Satellite Office")])
  })
)

export type ManualItemType = z.infer<typeof ManualItemSchema>
export type ScrappedItemType = z.infer<typeof ScrappedItemSchema>
export type ScrappedFileType = z.infer<typeof APIScrapperFileDataSchema>
export type BuyIsraeliTechType = z.infer<typeof BuyIsraeliTechSchema>

/**
 * Scrapper-specific types and schemas.
 * These are only used by the scrapper package, not shared with other packages.
 */

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

export const APIEndpointDomainsResultSchema = z.object({
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

export type APIEndpointDomainsResult = z.infer<
  typeof APIEndpointDomainsResultSchema
>

export type APIEndpointDomains = APIEndpointDomainsResult[]

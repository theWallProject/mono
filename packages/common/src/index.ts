import {parse} from "tldts";

import {z} from "zod";

/**
 * Enum-like object for APIListOfReasons, for code reference.
 */
export const APIListOfReasons = {
  /** HeadQ Location: Israel, Operating Status: Active */
  HeadQuarterInIL: "h",
  /** HeadQ Location: Not Israel, Operating Status: Active, Founders > Location: Israel */
  FounderInIL: "f",
  /** HeadQ Location: Not Israel, Operating Status: Active, Founders > Location: Not Israel, Investors > Location: Israel */
  InvestorNotFounderInIL: "i",
  /** Url */
  Url: "u",
  /** BDS */
  BDS: "b",
} as const;

export type valuesOfListOfReasons =
  (typeof APIListOfReasons)[keyof typeof APIListOfReasons];

export const APIListOfReasonsSchema = z.enum([
  APIListOfReasons.HeadQuarterInIL,
  APIListOfReasons.FounderInIL,
  APIListOfReasons.InvestorNotFounderInIL,
  APIListOfReasons.Url,
  APIListOfReasons.BDS,
]);

// export type APIListOfReasonsSchemaType = z.infer<typeof APIListOfReasonsSchema>;

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
  FLAGGED_THREADS = "FLAGGED_THREADS",
}

export type DBFileNamesValues = `${DBFileNames}`;
export type APIListOfReasonsValues =
  (typeof APIListOfReasons)[keyof typeof APIListOfReasons];
export type SpecialDomains =
  | "linkedin.com"
  | "facebook.com"
  | "twitter.com"
  | "x.com"
  | "instagram.com"
  | "github.com"
  | "youtube.com"
  | "tiktok.com"
  | "threads.com";

type APIEndpointRule = {
  domain: SpecialDomains;
  regex: string;
};

export const APIEndpointDomainsResultSchema = z.object({
  selector: z.string(),
  id: z.string(),
  reasons: z.array(APIListOfReasonsSchema),
  name: z.string(),
  /** stock sympol */
  s: z.string().optional(),
});

export type APIEndpointDomainsResult = z.infer<
  typeof APIEndpointDomainsResultSchema
>;

export const FinalDBFileSchema = z.object({
  /** id */
  id: z.string(),
  /** website */
  ws: z.string().optional(),
  /** linkedin */
  li: z.string().optional(),
  /** facebook */
  fb: z.string().optional(),
  /** twitter */
  tw: z.string().optional(),
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
  /** reasons */
  r: z.array(APIListOfReasonsSchema),
  /** name */
  n: z.string(),
  /** comment */
  c: z.string().optional(),
  /** stock sympol */
  s: z.string().optional(),
  /** alternative names */
  alt: z
    .array(
      z.object({
        /** name */
        n: z.string(),
        /** website */
        ws: z.string(),
      })
    )
    .optional(),
});

export type FinalDBFileType = z.infer<typeof FinalDBFileSchema>;

export type APIEndpointDomains = APIEndpointDomainsResult[];

export type APIEndpointConfig = {
  rules: APIEndpointRule[];
};

/**
 * LinkedIn regex - should be used with case-insensitive flag ('i') since LinkedIn IDs are case-insensitive
 * Matches both company and showcase formats:
 * - linkedin.com/company/ID
 * - linkedin.com/showcase/ID
 * - https://www.linkedin.com/company/ID
 * - https://www.linkedin.com/showcase/ID
 * Handles optional protocol (http://, https://) and optional www. prefix
 */
export const API_ENDPOINT_RULE_LINKEDIN_COMPANY = {
  domain: "linkedin.com",
  regex:
    "(?:https?://)?(?:www\\.)?(?:linkedin\\.com)/(?!school)(?:company|showcase)/([^/?]+)",
} as const satisfies APIEndpointRule;

export const API_ENDPOINT_RULE_FACEBOOK = {
  domain: "facebook.com",
  regex:
    "(?:facebook\\.com)/(?!events|groups|marketplace|watch|gaming|login)([^/?]+)",
} as const satisfies APIEndpointRule;

/**
 * Twitter regex - should be used with case-insensitive flag ('i') since Twitter IDs are case-insensitive
 */
export const API_ENDPOINT_RULE_TWITTER = {
  domain: "twitter.com",
  regex:
    "(?<!\\w)(?:twitter\\.com|x\\.com|t\\.co)/(?!search|hashtag|i/|intent|settings)([^/?]+)",
} as const satisfies APIEndpointRule;

export const API_ENDPOINT_RULE_INSTAGRAM = {
  domain: "instagram.com",
  regex:
    "(?:instagram\\.com)/(?!explore|reels|p/|stories|tv/|direct|accounts)([^/?]+)",
} as const satisfies APIEndpointRule;

export const API_ENDPOINT_RULE_GITHUB = {
  domain: "github.com",
  regex:
    "(?<!gist\\.)(?:github\\.com)/(?!settings|.*/(?:issues|pull|releases|actions|security))([^/]+)",
} as const satisfies APIEndpointRule; // Captures userid only: github.com/userid/repoid → userid

/**
 * YouTube profile regex - should be used with case-insensitive flag ('i') since YouTube profile IDs are case-insensitive
 * Matches all equivalent formats:
 * - youtube.com/ID
 * - youtube.com/@ID
 * - youtube.com/c/ID
 * - youtube.com/c/@ID
 * - youtube.com/user/ID
 * - https://www.youtube.com/@ID
 * - http://youtube.com/ID
 * All formats capture the ID (without @ prefix) since they represent the same profile/channel
 * Handles optional protocol (http://, https://) and optional www. prefix
 * Note: The regex uses multiple capture groups (1-4) for different formats. Use the first non-undefined group.
 */
export const API_ENDPOINT_RULE_YOUTUBE_PROFILE = {
  domain: "youtube.com",
  regex:
    "(?:https?://)?(?:www\\.)?(?:youtube\\.com)/(?:(?:user/([^/?]+))|(?:c/(?!(?:@)?(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)@?([^/?]+))|(?:@(?!(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)([^/?]+))|(?!(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)(?!(?:c/|@|user/))([^/?]+))",
} as const satisfies APIEndpointRule;

export const API_ENDPOINT_RULE_YOUTUBE_CHANNEL = {
  domain: "youtube.com",
  regex: "(?:https?://)?(?:www\\.)?(?:youtube\\.com)/channel/([^/?]+)",
} as const satisfies APIEndpointRule;

export const API_ENDPOINT_RULE_TIKTOK = {
  domain: "tiktok.com",
  regex:
    "(?:tiktok\\.com)/(?!.*/video/|discover|foryou|trending|music|upload)([^/?]+)",
} as const satisfies APIEndpointRule;

export const API_ENDPOINT_RULE_THREADS = {
  domain: "threads.com",
  regex:
    "(?:threads\\.com)/(?!.*/post/|search|explore|activity|settings)([^/?]+)",
} as const satisfies APIEndpointRule;

export const CONFIG: APIEndpointConfig = {
  rules: [
    API_ENDPOINT_RULE_LINKEDIN_COMPANY,
    API_ENDPOINT_RULE_FACEBOOK,
    API_ENDPOINT_RULE_TWITTER,
    API_ENDPOINT_RULE_INSTAGRAM,
    API_ENDPOINT_RULE_GITHUB,
    API_ENDPOINT_RULE_YOUTUBE_PROFILE,
    API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
    API_ENDPOINT_RULE_TIKTOK,
    API_ENDPOINT_RULE_THREADS,
  ],
};

/**
 * Extracts the main domain from a given URL.
 **/
export function getMainDomain(url: string) {
  try {
    // Add protocol if missing
    const urlWithProtocol =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    const {hostname} = new URL(urlWithProtocol);
    const parsed = parse(hostname);

    if (parsed.hostname) {
      return parsed.hostname.replace("www.", "");
    }
    console.warn("getMainDomain empty:", url);

    return "";
  } catch (e) {
    console.error("getMainDomain error:", url, e);
    return "";
  }
}

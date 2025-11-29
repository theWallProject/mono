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

/**
 * Schema for API list of reasons (shared between addon and scrapper via FinalDBFileSchema).
 */
export const APIListOfReasonsSchema = z.enum([
  APIListOfReasons.HeadQuarterInIL,
  APIListOfReasons.FounderInIL,
  APIListOfReasons.InvestorNotFounderInIL,
  APIListOfReasons.Url,
  APIListOfReasons.BDS,
]);

export type APIListOfReasonsValues = z.infer<typeof APIListOfReasonsSchema>;

/**
 * Link field type shared across all packages.
 * When adding a new field, all packages should support it.
 */
export type LinkField =
  | "ws" // website
  | "li" // linkedin
  | "fb" // facebook
  | "tw" // twitter
  | "ig" // instagram
  | "gh" // github
  | "ytp" // youtube profile
  | "ytc" // youtube channel
  | "tt" // tiktok
  | "th" // threads
  | "il"; // israeli website (.il domain)

/**
 * Platform-agnostic URL check result (without dismissal tracking).
 * Shared across all packages. Platform-specific extensions (like isDismissed) should extend this type.
 */
export type UrlCheckResult =
  | {
      isHint: true;
      name: string;
      hintText: string;
      hintUrl: string;
      rule: {
        selector: string;
        key: LinkField;
      };
    }
  | {
      isHint?: false | undefined;
      reasons: APIListOfReasonsValues[];
      name: string;
      alt?: {n: string; ws: string}[];
      stockSymbol?: string;
      comment?: string;
      link?: string;
      rule: {
        selector: string;
        key: LinkField;
      };
    }
  | undefined;

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
  /** hint flag */
  hint: z.boolean().optional(),
  /** hint text */
  hintText: z.string().optional(),
  /** hint URL */
  hintUrl: z.string().optional(),
});

export type FinalDBFileType = z.infer<typeof FinalDBFileSchema>;

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

/**
 * Normalizes a URL by removing www. prefix for regex matching.
 * Pure function with no side effects.
 */
export function normalizeUrl(url: string): string {
  return url.replace(/^(https?:\/\/)www\./i, "$1");
}

/**
 * Gets regex flags for a domain (case-insensitive for YouTube, Twitter, LinkedIn).
 * Pure function with no side effects.
 */
function getRegexFlags(domain: SpecialDomains): string {
  return domain === "youtube.com" ||
    domain === "twitter.com" ||
    domain === "linkedin.com"
    ? "i"
    : "";
}

/**
 * Finds the matching rule for a URL from CONFIG.rules.
 * Pure function with no side effects.
 * @param url - The normalized URL to match
 * @returns The matching rule or null if no match
 */
export function findMatchingRule(
  url: string
): (typeof CONFIG.rules)[number] | null {
  const normalizedUrl = normalizeUrl(url);
  const rule = CONFIG.rules.find((rule) => {
    const flags = getRegexFlags(rule.domain);
    const ruleRegex = new RegExp(rule.regex, flags);
    return ruleRegex.test(normalizedUrl);
  });
  return rule || null;
}

/**
 * Extracts the selector (username/ID) from a URL using a rule's regex.
 * Pure function with no side effects.
 * @param url - The normalized URL
 * @param rule - The rule to use for extraction
 * @returns The extracted selector or null if no match
 */
export function extractSelector(
  url: string,
  rule: (typeof CONFIG.rules)[number]
): string | null {
  const normalizedUrl = normalizeUrl(url);
  const flags = getRegexFlags(rule.domain);
  const regex = new RegExp(rule.regex, flags);
  const results = regex.exec(normalizedUrl);
  // For YouTube, the regex has multiple capture groups - use the first non-undefined one
  // Groups: 1=user/, 2=c/@?, 3=@, 4=direct
  const selector =
    results &&
    (results[1] || results[2] || results[3] || results[4] || results[1]);
  return selector || null;
}

/**
 * Finds a matching database entry by selector and selector key.
 * Pure function with no side effects.
 * @param selector - The selector to match (e.g., username)
 * @param selectorKey - The database field key (e.g., "fb", "tw")
 * @param domain - The domain for case-insensitive comparison logic
 * @param database - The database array to search
 * @returns The matching database entry or null
 */
export function findInDatabaseBySelector(
  selector: string,
  selectorKey: LinkField,
  domain: SpecialDomains,
  database: FinalDBFileType[]
): FinalDBFileType | null {
  // "il" is not a database field, skip database lookup
  if (selectorKey === "il") {
    return null;
  }

  const findResult = database.find((row) => {
    const dbValue = row[selectorKey as Exclude<LinkField, "il">];
    if (!dbValue || typeof dbValue !== "string") {
      return false;
    }

    // Normalize: strip @ prefix from both values
    // For YouTube, Twitter, LinkedIn: also compare case-insensitively
    const normalizedDbValue = dbValue.replace(/^@/i, "");
    const normalizedSelector = selector.replace(/^@/i, "");

    // Case-insensitive comparison for YouTube, Twitter, LinkedIn
    const isCaseInsensitive =
      domain === "youtube.com" ||
      domain === "twitter.com" ||
      domain === "linkedin.com";

    return isCaseInsensitive
      ? normalizedDbValue.toLowerCase() === normalizedSelector.toLowerCase()
      : normalizedDbValue === normalizedSelector;
  });

  return findResult || null;
}

/**
 * Finds a matching database entry by domain (for website lookups).
 * Pure function with no side effects.
 * @param domain - The domain to search for
 * @param database - The database array to search
 * @returns The matching database entry or null
 */
export function findInDatabaseByDomain(
  domain: string,
  database: FinalDBFileType[]
): FinalDBFileType | null {
  const findResult = database.find((row) => row.ws === domain);
  return findResult || null;
}

/**
 * Formats a database entry into a UrlCheckResult.
 * Pure function with no side effects.
 * @param findResult - The database entry to format
 * @param selector - The selector (username/domain)
 * @param selectorKey - The database field key
 * @returns Formatted UrlCheckResult
 */
export function formatResult(
  findResult: FinalDBFileType,
  selector: string,
  selectorKey: LinkField
): UrlCheckResult {
  // Check if this is a hint entry
  if (findResult.hint && findResult.hintText) {
    return {
      isHint: true,
      name: findResult.n,
      hintText: findResult.hintText,
      hintUrl: findResult.hintUrl || "",
      rule: {
        selector,
        key: selectorKey,
      },
    };
  }

  return {
    isHint: false,
    reasons: findResult.r,
    name: findResult.n,
    alt: findResult.alt,
    stockSymbol: findResult.s,
    comment: findResult.c,
    link: findResult.ws,
    rule: {
      selector,
      key: selectorKey,
    },
  };
}

/**
 * Gets the selector key (database field name) for a given domain.
 * Maps SpecialDomains to LinkField values.
 * @param domain - The domain to map
 * @param url - Optional URL (required for youtube.com to distinguish between profile and channel)
 * @returns The corresponding LinkField value
 * @throws Error if domain is unexpected or URL is required but missing
 */
export function getSelectorKey(
  domain: SpecialDomains,
  url?: string
): LinkField {
  switch (domain) {
    case "facebook.com":
      return "fb";
    case "twitter.com":
    case "x.com":
      return "tw";
    case "linkedin.com":
      return "li";
    case "instagram.com":
      return "ig";
    case "github.com":
      return "gh";
    case "youtube.com": {
      if (!url) {
        throw new Error(
          "getSelectorKey: url is required for youtube.com domain"
        );
      }
      if (url.includes("/channel/")) {
        return "ytc";
      }
      if (url.includes("/@")) {
        return "ytp";
      }
      // Default to ytp for other YouTube URLs (shouldn't happen with proper rules)
      return "ytp";
    }
    case "tiktok.com":
      return "tt";
    case "threads.com":
      return "th";
    default: {
      throw new Error(`getSelectorKey: unexpected domain ${domain}`);
    }
  }
}

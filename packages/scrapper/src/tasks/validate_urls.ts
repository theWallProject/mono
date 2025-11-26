import fs from "fs";
import path from "path";
import * as readline from "readline";
import { chromium, BrowserContext, Page } from "playwright";
import {
  API_ENDPOINT_RULE_LINKEDIN_COMPANY,
  API_ENDPOINT_RULE_FACEBOOK,
  API_ENDPOINT_RULE_TWITTER,
  API_ENDPOINT_RULE_INSTAGRAM,
  API_ENDPOINT_RULE_GITHUB,
  API_ENDPOINT_RULE_YOUTUBE_PROFILE,
  API_ENDPOINT_RULE_YOUTUBE_CHANNEL,
  API_ENDPOINT_RULE_TIKTOK,
  API_ENDPOINT_RULE_THREADS,
} from "@theWallProject/common";
import { APIScrapperFileDataSchema, ScrappedItemType } from "../types";
import { error, log } from "../helper";
import prettier from "prettier";

type ProcessedState = {
  _processed: true;
};

type ManualOverrideFields = Omit<
  Partial<ScrappedItemType>,
  "ws" | "li" | "fb" | "tw" | "ig" | "gh" | "ytp" | "ytc" | "tt" | "th"
> & {
  ws?: string | string[];
  li?: string | string[];
  fb?: string | string[];
  tw?: string | string[];
  ig?: string | string[];
  gh?: string | string[];
  ytp?: string | string[];
  ytc?: string | string[];
  tt?: string | string[];
  th?: string | string[];
};

type ManualOverrideValue =
  | (ManualOverrideFields & ProcessedState)
  | ProcessedState
  | ManualOverrideFields;

const inputFilePath = path.join(
  __dirname,
  "../../results/2_merged/2_MERGED_ALL.json",
);

const manualOverridesPath = path.join(
  __dirname,
  "./manual_resolve/manualOverrides.ts",
);

const isProcessed = (
  value: ManualOverrideValue,
): value is ProcessedState | (Partial<ScrappedItemType> & ProcessedState) => {
  return (
    typeof value === "object" &&
    value !== null &&
    "_processed" in value &&
    value._processed === true
  );
};

const loadManualOverrides = (): Record<string, ManualOverrideValue> => {
  const modulePath = path.resolve(manualOverridesPath);
  const resolvedPath = require.resolve(modulePath);
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete require.cache[resolvedPath];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require(modulePath);
  const overrides = (module.manualOverrides || {}) satisfies Record<
    string,
    ManualOverrideValue
  >;
  return overrides;
};

const formatValue = (value: ManualOverrideValue): string => {
  if (isProcessed(value)) {
    const fields: string[] = [];
    if ("ws" in value && value.ws !== undefined)
      fields.push(`ws: ${JSON.stringify(value.ws)}`);
    if ("li" in value && value.li !== undefined)
      fields.push(`li: ${JSON.stringify(value.li)}`);
    if ("fb" in value && value.fb !== undefined)
      fields.push(`fb: ${JSON.stringify(value.fb)}`);
    if ("tw" in value && value.tw !== undefined)
      fields.push(`tw: ${JSON.stringify(value.tw)}`);
    if ("ig" in value && value.ig !== undefined)
      fields.push(`ig: ${JSON.stringify(value.ig)}`);
    if ("gh" in value && value.gh !== undefined)
      fields.push(`gh: ${JSON.stringify(value.gh)}`);
    if ("ytp" in value && value.ytp !== undefined)
      fields.push(`ytp: ${JSON.stringify(value.ytp)}`);
    if ("ytc" in value && value.ytc !== undefined)
      fields.push(`ytc: ${JSON.stringify(value.ytc)}`);
    if ("tt" in value && value.tt !== undefined)
      fields.push(`tt: ${JSON.stringify(value.tt)}`);
    if ("th" in value && value.th !== undefined)
      fields.push(`th: ${JSON.stringify(value.th)}`);
    if ("urls" in value && value.urls !== undefined)
      fields.push(`urls: ${JSON.stringify(value.urls)}`);

    if (fields.length > 0) {
      // Has changes - include both the fields and the processed state
      return `{ ${fields.join(", ")}, _processed: true }`;
    } else {
      // No changes - just processed state
      return `{ _processed: true }`;
    }
  } else {
    // Regular override without processed state
    const fields: string[] = [];
    if (value.ws !== undefined) fields.push(`ws: ${JSON.stringify(value.ws)}`);
    if (value.li !== undefined) fields.push(`li: ${JSON.stringify(value.li)}`);
    if (value.fb !== undefined) fields.push(`fb: ${JSON.stringify(value.fb)}`);
    if (value.tw !== undefined) fields.push(`tw: ${JSON.stringify(value.tw)}`);
    if (value.ig !== undefined) fields.push(`ig: ${JSON.stringify(value.ig)}`);
    if (value.gh !== undefined) fields.push(`gh: ${JSON.stringify(value.gh)}`);
    if (value.ytp !== undefined)
      fields.push(`ytp: ${JSON.stringify(value.ytp)}`);
    if (value.ytc !== undefined)
      fields.push(`ytc: ${JSON.stringify(value.ytc)}`);
    if (value.tt !== undefined) fields.push(`tt: ${JSON.stringify(value.tt)}`);
    if (value.th !== undefined) fields.push(`th: ${JSON.stringify(value.th)}`);
    if ("urls" in value && value.urls !== undefined)
      fields.push(`urls: ${JSON.stringify(value.urls)}`);

    if (fields.length > 0) {
      return `{ ${fields.join(", ")} }`;
    } else {
      return `{}`;
    }
  }
};

const saveManualOverrides = async (
  overrides: Record<string, ManualOverrideValue>,
) => {
  const keys = Object.keys(overrides).sort();
  let content = 'import { ScrappedItemType } from "../../types";\n\n';
  content +=
    '// Allow arrays for link fields in overrides\ntype ManualOverrideFields = {\n  ws?: string | string[];\n  li?: string | string[];\n  fb?: string | string[];\n  tw?: string | string[];\n  ig?: string | string[];\n  gh?: string | string[];\n  ytp?: string | string[];\n  ytc?: string | string[];\n  tt?: string | string[];\n  th?: string | string[];\n} & Omit<Partial<ScrappedItemType>, "ws" | "li" | "fb" | "tw" | "ig" | "gh" | "ytp" | "ytc" | "tt" | "th">;\n\n';
  content +=
    "export const manualOverrides: Record<string, ManualOverrideFields | { _processed: true } | (ManualOverrideFields & { _processed: true }) | (ManualOverrideFields & { urls?: string[] }) | (ManualOverrideFields & { _processed: true; urls?: string[] })> = {\n";

  for (const key of keys) {
    const value = overrides[key];
    const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
    const keyStr = needsQuotes ? `"${key.replace(/"/g, '\\"')}"` : key;
    content += `  ${keyStr}: ${formatValue(value)},\n`;
  }

  content += "};\n";

  // Format with prettier
  try {
    const prettierConfig = await prettier.resolveConfig(manualOverridesPath);
    const formatted = await prettier.format(content, {
      ...prettierConfig,
      parser: "typescript",
    });
    fs.writeFileSync(manualOverridesPath, formatted, "utf-8");
    log(
      `Saved manualOverrides to ${manualOverridesPath} (formatted with prettier)`,
    );
  } catch (e) {
    // If prettier fails, save without formatting
    fs.writeFileSync(manualOverridesPath, content, "utf-8");
    log(
      `Saved manualOverrides to ${manualOverridesPath} (prettier failed: ${e})`,
    );
  }
};

const normalizeUrl = (url: string): string => {
  if (!url) {
    throw new Error("URL is empty");
  }

  // Remove leading/trailing whitespace
  url = url.trim();

  // If URL doesn't start with http:// or https://, add https://
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }

  return url;
};

const removeTrailingSlash = (url: string): string => {
  return url.replace(/\/+$/, "");
};

const normalizeUrlForComparison = (url: string): string => {
  if (!url) return "";

  // Normalize to https if it's http
  url = url.trim().toLowerCase();
  url = url.replace(/^http:\/\//, "https://");

  // Remove trailing slash (except for root domain like https://example.com/)
  url = url.replace(/\/+$/, "");

  // Remove www. prefix for comparison
  url = url.replace(/^https:\/\/www\./, "https://");

  // Remove query parameters and fragments for comparison
  url = url.split("?")[0].split("#")[0];

  return url;
};

const urlsAreEquivalent = (url1: string, url2: string): boolean => {
  const normalized1 = normalizeUrlForComparison(url1);
  const normalized2 = normalizeUrlForComparison(url2);
  return normalized1 === normalized2;
};

const checkRedirect = async (
  page: Page,
  url: string,
): Promise<{ finalUrl: string; redirected: boolean }> => {
  const normalizedUrl = normalizeUrl(url);
  const initialUrl = normalizedUrl;
  let finalUrl = initialUrl;
  let redirected = false;

  const response = await page.goto(normalizedUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  if (!response) {
    throw new Error(`No response from ${normalizedUrl}`);
  }

  if (response.status() >= 400) {
    throw new Error(
      `HTTP ${response.status()} error for ${normalizedUrl}: ${response.statusText()}`,
    );
  }

  finalUrl = response.url();

  // Compare normalized URLs to ignore formatting differences
  redirected = !urlsAreEquivalent(initialUrl, finalUrl);

  return { finalUrl, redirected };
};

export type LinkField =
  | "ws"
  | "li"
  | "fb"
  | "tw"
  | "ig"
  | "gh"
  | "ytp"
  | "ytc"
  | "tt"
  | "th";
type CategorizedUrls = {
  ws?: string[];
  li?: string[];
  fb?: string[];
  tw?: string[];
  ig?: string[];
  gh?: string[];
  ytp?: string[];
  ytc?: string[];
  tt?: string[];
  th?: string[];
  urls?: string[]; // Unsupported URLs only
};

// Categorize a URL into ws, li, fb, tw, ig, gh, ytp, ytc, tt, th, or null (unsupported)
const categorizeUrl = (url: string): LinkField | null => {
  try {
    // Check LinkedIn
    const regexLinkedin = new RegExp(API_ENDPOINT_RULE_LINKEDIN_COMPANY.regex);
    if (regexLinkedin.test(url)) {
      return "li";
    }

    // Check Facebook
    const regexFacebook = new RegExp(API_ENDPOINT_RULE_FACEBOOK.regex);
    const normalizedFb = url.replace("/pg/", "/").replace("/p/", "/");
    if (regexFacebook.test(normalizedFb)) {
      return "fb";
    }

    // Check Twitter/X
    const regexTwitter = new RegExp(API_ENDPOINT_RULE_TWITTER.regex);
    if (regexTwitter.test(url)) {
      return "tw";
    }

    // Check Instagram
    const regexInstagram = new RegExp(API_ENDPOINT_RULE_INSTAGRAM.regex);
    if (regexInstagram.test(url)) {
      return "ig";
    }

    // Check GitHub
    const regexGitHub = new RegExp(API_ENDPOINT_RULE_GITHUB.regex);
    if (regexGitHub.test(url)) {
      return "gh";
    }

    // Check YouTube Profile - use common regex as only source of truth
    const regexYouTubeProfile = new RegExp(
      API_ENDPOINT_RULE_YOUTUBE_PROFILE.regex,
      "i",
    );
    if (regexYouTubeProfile.test(url)) {
      return "ytp";
    }

    // Check YouTube Channel - use common regex as only source of truth
    const regexYouTubeChannel = new RegExp(
      API_ENDPOINT_RULE_YOUTUBE_CHANNEL.regex,
      "i",
    );
    if (regexYouTubeChannel.test(url)) {
      return "ytc";
    }

    // Check TikTok
    const regexTikTok = new RegExp(API_ENDPOINT_RULE_TIKTOK.regex);
    if (regexTikTok.test(url)) {
      return "tt";
    }

    // Check Threads
    const regexThreads = new RegExp(API_ENDPOINT_RULE_THREADS.regex);
    if (regexThreads.test(url)) {
      return "th";
    }

    // Don't auto-categorize websites - keep them in urls for manual organization
    // Exclude obvious non-website URLs (Note: Profile/channel URLs are handled above via common regex)
    // Exclude video URLs and app store URLs, but allow other URLs to stay in urls
    const excludePatterns = [
      /youtube\.com\/watch/i,
      /youtube\.com\/shorts/i,
      /apps\.apple\./i,
      /play\.google\./i,
      /vimeo\./i,
      /greenhouse\./i,
      /consent\.yahoo\./i,
      /cnbc\./i,
    ];

    const isExcluded = excludePatterns.some((pattern) => pattern.test(url));
    if (isExcluded) {
      return null; // Unsupported
    }

    // Websites stay in urls array for manual organization
    return null;
  } catch (e) {
    log(`  [DEBUG] Error categorizing URL ${url}: ${e}`);
    return null;
  }
};

type OverrideWithUrls = {
  ws?: string | string[];
  li?: string | string[];
  fb?: string | string[];
  tw?: string | string[];
  ig?: string | string[];
  gh?: string | string[];
  ytp?: string | string[];
  ytc?: string | string[];
  tt?: string | string[];
  th?: string | string[];
  urls?: string[];
};

// Search service configuration
type SearchService = {
  name: string;
  urlTemplate: (query: string) => string;
};

const searchServices: SearchService[] = [
  {
    name: "Ecosia",
    urlTemplate: (query) =>
      `https://www.ecosia.org/search?q=${encodeURIComponent(query)}`,
  },
  {
    name: "GitHub",
    urlTemplate: (query) =>
      `https://github.com/search?q=${encodeURIComponent(query)}&type=users`,
  },
  {
    name: "YouTube",
    urlTemplate: (query) =>
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%253D%253D`,
  },
  {
    name: "TikTok",
    urlTemplate: (query) =>
      `https://www.tiktok.com/search/user?q=${encodeURIComponent(query)}`,
  },
  {
    name: "Play Store",
    urlTemplate: (query) =>
      `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`,
  },
  {
    name: "Apple Store",
    urlTemplate: (query) =>
      `https://www.apple.com/us/search/${encodeURIComponent(query)}?src=globalnav`,
  },
  {
    name: "Chrome Web Store",
    urlTemplate: (query) =>
      `https://chrome.google.com/webstore/search/${encodeURIComponent(query)}`,
  },
  {
    name: "Facebook",
    urlTemplate: (query) =>
      `https://www.facebook.com/search/pages/?q=${encodeURIComponent(query)}`,
  },
  {
    name: "Threads",
    urlTemplate: (query) =>
      `https://www.threads.net/search?q=${encodeURIComponent(query)}`,
  },
  {
    name: "Instagram",
    urlTemplate: (query) =>
      `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(query)}`,
  },
  {
    name: "npm",
    urlTemplate: (query) =>
      `https://www.npmjs.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    name: "VSCode Extensions",
    urlTemplate: (query) =>
      `https://marketplace.visualstudio.com/search?term=${encodeURIComponent(query)}`,
  },
];

/**
 * Opens search pages for all configured search services
 */
const openSearchPages = async (
  context: BrowserContext,
  query: string,
  pages: Page[],
): Promise<void> => {
  // Open all search tabs first (without waiting for navigation)
  const searchPages: Array<{
    page: Page;
    service: SearchService;
    url: string;
  }> = [];

  for (const service of searchServices) {
    try {
      const searchPage = await context.newPage();
      const searchUrl = service.urlTemplate(query);
      log(`  🔍 Opening ${service.name} search for "${query}"`);
      searchPages.push({ page: searchPage, service, url: searchUrl });
      pages.push(searchPage);
    } catch (e) {
      log(`  [DEBUG] Could not create ${service.name} search tab: ${e}`);
    }
  }

  // Navigate all search tabs in parallel (don't wait for each to finish)
  const navigationPromises = searchPages.map(async ({ page, service, url }) => {
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      log(`  ✓ ${service.name} search tab opened`);
    } catch (e) {
      log(`  [DEBUG] Could not navigate ${service.name} search tab: ${e}`);
    }
  });

  // Wait for all navigations to complete (but they're already running in parallel)
  await Promise.all(navigationPromises);
};

const validateItemLinks = async (
  context: BrowserContext,
  item: ScrappedItemType,
): Promise<OverrideWithUrls | null> => {
  const changes: OverrideWithUrls = {};
  let hasChanges = false;

  const links: Array<{ field: LinkField; url: string }> = [];
  if (item.ws) links.push({ field: "ws", url: item.ws });
  if (item.li) links.push({ field: "li", url: item.li });
  if (item.fb) links.push({ field: "fb", url: item.fb });
  if (item.tw) links.push({ field: "tw", url: item.tw });
  // ig and gh are only from manual overrides, not in ScrappedItemType

  if (links.length === 0) {
    log(`  No links to validate for ${item.name}`);
    return null;
  }

  const pages: Page[] = [];
  const linkPages: Array<{ page: Page; field: LinkField; url: string }> = [];

  // Open all link tabs first (without waiting for navigation)
  for (const { field, url } of links) {
    log(`  Opening ${field}: ${url}`);
    const page = await context.newPage();
    linkPages.push({ page, field, url });
    pages.push(page);
  }

  // Navigate all tabs in parallel (don't wait for each to finish)
  const navigationPromises = linkPages.map(async ({ page, field, url }) => {
    try {
      const { finalUrl, redirected } = await checkRedirect(page, url);

      if (redirected) {
        log(`    → Redirected to: ${finalUrl} (from ${url})`);
        changes[field] = removeTrailingSlash(finalUrl);
        hasChanges = true;
      } else {
        // URLs are equivalent after normalization
        log(`    ✓ No redirect (URLs are equivalent: ${url} === ${finalUrl})`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      error(
        `    ⚠️  Error checking ${field} (${url}): ${errorMessage}. Page kept open for manual verification.`,
      );
      // Keep the page open for manual verification instead of closing it
      // Note: We don't set changes[field] here, so it won't be auto-updated
      // User can manually update via the urls array or close the browser and continue
    }
  });

  // Wait for all navigations to complete (but they're already running in parallel)
  await Promise.all(navigationPromises);

  // Open search pages for all configured services
  await openSearchPages(context, item.name, pages);

  // Close any empty tabs that might have been opened
  try {
    const allPages = context.pages();
    const emptyPages: Page[] = [];
    for (const page of allPages) {
      try {
        if (!page.isClosed() && !pages.includes(page)) {
          const url = page.url();
          if (url === "about:blank" || url === "") {
            emptyPages.push(page);
          }
        }
      } catch {
        // Page might already be closed or not accessible
      }
    }

    // Close all empty pages (except the ones we're using)
    for (const page of emptyPages) {
      try {
        await page.close();
      } catch {
        // Page might already be closed
      }
    }
    if (emptyPages.length > 0) {
      log(`  Closed ${emptyPages.length} empty tab(s)`);
    }
  } catch {
    // Ignore errors when closing empty tabs
  }

  // Wait for entire browser to be closed by user
  log(
    `  ⏳ Browser windows are open (${pages.length} tabs). Close the browser to proceed...`,
  );

  // CRITICAL: Store tracking data OUTSIDE browser context scope
  // These persist even after browser/context closes
  const persistentTabUrls = new Map<Page, string>(); // Tab -> Final URL mapping (single source of truth)
  const tabUrlHistory = new Map<Page, Set<string>>(); // Tab -> Set of URLs seen (only for user-closed detection)
  const userClosedUrls = new Set<string>(); // URLs user manually closed (exclude from collection)
  const pendingTabCloseChecks = new Set<NodeJS.Timeout>(); // Track pending timeout checks
  let isContextClosing = false; // Track if context is closing (prevents URL deletion during bulk close)
  const TAB_CLOSE_DELAY_MS = 3000; // Wait 3 seconds after tab close - if browser still open, it's manual close

  // Helper to check if browser/context is still open
  const isBrowserStillOpen = (tab: Page): boolean => {
    try {
      const tabContext = tab.context();
      if (tabContext) {
        const browser = tabContext.browser();
        if (browser !== null && browser.isConnected()) {
          return true;
        }
      }
    } catch {
      // Context closed - browser was closing
    }

    // Also check the main context
    try {
      const mainBrowser = context.browser();
      return mainBrowser !== null && mainBrowser.isConnected();
    } catch {
      return false;
    }
  };

  // Helper to handle tab close - wait 3 seconds, if browser still open then it's manual close
  const setupTabCloseHandler = (tab: Page) => {
    tab.on("close", () => {
      // Get final URL and history (persistentTabUrls already has the final URL)
      const url = persistentTabUrls.get(tab);
      const urlHistory = tabUrlHistory.get(tab) || new Set<string>();

      // Only remove from tracking if context is NOT closing
      // If context is closing, keep data for collection
      if (!isContextClosing) {
        tabUrlHistory.delete(tab);
      }

      if (!url || url === "about:blank") {
        return;
      }

      // Check if context is already closed (definitely shutdown)
      let isShuttingDown = isContextClosing;
      if (!isShuttingDown) {
        try {
          const tabContext = tab.context();
          isShuttingDown = !tabContext || tabContext.browser() === null;
        } catch {
          // Context already closed - definitely shutdown
          isShuttingDown = true;
        }
      }

      if (isShuttingDown) {
        // Browser is already closing - keep URLs in finalUrls (already there)
        log(
          `  [DEBUG] ⚠️ Tab closed during context shutdown, ${urlHistory.size} URLs preserved`,
        );
        return;
      }

      // Wait 3 seconds - if browser still open, it was manual close
      const timeoutId = setTimeout(() => {
        pendingTabCloseChecks.delete(timeoutId);

        if (isBrowserStillOpen(tab) && !isContextClosing) {
          // Browser still open after 3 seconds = user manually closed this tab
          // Mark ALL URLs from this tab's navigation history as user-closed
          for (const historyUrl of urlHistory) {
            userClosedUrls.add(historyUrl);
          }
          log(
            `  [DEBUG] ✗ Tab closed (user action - browser still open after ${TAB_CLOSE_DELAY_MS}ms), marking ${urlHistory.size} URLs as excluded: ${Array.from(urlHistory).join(", ")}`,
          );
        } else {
          // Browser closed = it was shutdown, keep URLs
          log(
            `  [DEBUG] ⚠️ Tab close was browser shutdown (browser closed within ${TAB_CLOSE_DELAY_MS}ms), keeping ${urlHistory.size} URLs`,
          );
        }
      }, TAB_CLOSE_DELAY_MS);

      pendingTabCloseChecks.add(timeoutId);
    });
  };

  // Wait for all pending tab close checks to complete (or timeout after 4 seconds)
  const waitForPendingChecks = async () => {
    if (pendingTabCloseChecks.size > 0) {
      log(
        `  [DEBUG] Waiting for ${pendingTabCloseChecks.size} pending tab close checks to complete...`,
      );
      const maxWait = TAB_CLOSE_DELAY_MS + 1000; // Wait slightly longer than the delay
      const startTime = Date.now();

      while (
        pendingTabCloseChecks.size > 0 &&
        Date.now() - startTime < maxWait
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (pendingTabCloseChecks.size > 0) {
        log(
          `  [DEBUG] ⚠️ Still ${pendingTabCloseChecks.size} pending checks, proceeding anyway`,
        );
        // Clear remaining timeouts
        for (const timeoutId of pendingTabCloseChecks) {
          clearTimeout(timeoutId);
        }
        pendingTabCloseChecks.clear();
      } else {
        log(`  [DEBUG] ✓ All pending tab close checks completed`);
      }
    }
  };

  // Initialize with tabs we opened
  for (const tab of pages) {
    tabUrlHistory.set(tab, new Set<string>()); // Initialize URL history for this tab
    try {
      const url = tab.url();
      if (url && url !== "about:blank") {
        persistentTabUrls.set(tab, url); // Store final URL (single source of truth)
        const history = tabUrlHistory.get(tab);
        if (history) {
          history.add(url); // Add to tab's URL history (for user-closed detection)
        }
      }
    } catch {
      // Tab might not have URL yet
    }
  }

  // Helper to update and store a tab's URL (synchronous for events)
  // DETERMINISTIC: Use persistentTabUrls as the single source of truth
  // Updates persistentTabUrls with final URL and tracks history for user-closed detection only
  const updateTabUrl = (tab: Page, source: string = "unknown") => {
    try {
      if (tab.isClosed()) {
        return;
      }
      const tabUrl = tab.url();
      if (tabUrl && tabUrl !== "about:blank") {
        const oldUrl = persistentTabUrls.get(tab);
        persistentTabUrls.set(tab, tabUrl); // Update final URL (single source of truth)

        // Ensure tab has URL history set (for user-closed detection)
        if (!tabUrlHistory.has(tab)) {
          tabUrlHistory.set(tab, new Set<string>());
        }
        const history = tabUrlHistory.get(tab);
        if (history) {
          // Add old URL to history if it exists (for user-closed detection)
          if (oldUrl && oldUrl !== tabUrl && oldUrl !== "about:blank") {
            history.add(oldUrl);
          }
          // Add new URL to history
          history.add(tabUrl);
        }

        if (oldUrl && oldUrl !== tabUrl && oldUrl !== "about:blank") {
          log(
            `  [DEBUG] ✨ Tab URL updated from ${source}: ${oldUrl} → ${tabUrl}`,
          );
        } else if (oldUrl !== tabUrl) {
          log(`  [DEBUG] ✨ Tab URL captured from ${source}: ${tabUrl}`);
        }
      }
    } catch {
      // Tab might be closing or not accessible - ignore silently
    }
  };

  // Store URLs for initial tabs and set up navigation listeners
  for (const tab of pages) {
    try {
      updateTabUrl(tab, "initial");

      // Set up navigation listeners for all initial tabs
      tab.on("framenavigated", () => {
        updateTabUrl(tab, "framenavigated");
      });

      tab.on("load", () => {
        updateTabUrl(tab, "load");
      });

      // Set up tab close handler
      setupTabCloseHandler(tab);
    } catch {
      // Tab might not have a URL yet
    }
  }

  // Listen for new tabs created (including manually opened tabs)
  // This event fires synchronously when a new tab is created
  // Events write to external storage, independent of browser lifecycle
  context.on("page", (tab) => {
    try {
      // Initialize URL history for this tab
      tabUrlHistory.set(tab, new Set<string>());
      log(
        `  [DEBUG] ✨ New tab created (total tracked: ${tabUrlHistory.size})`,
      );

      // Try to get URL immediately if available
      try {
        const initialUrl = tab.url();
        if (initialUrl && initialUrl !== "about:blank") {
          persistentTabUrls.set(tab, initialUrl); // Store final URL (single source of truth)
          const history = tabUrlHistory.get(tab);
          if (history) {
            history.add(initialUrl); // Add to tab's URL history (for user-closed detection)
          }
        }
      } catch {
        // Tab might not have URL yet
      }

      // Listen for navigation to capture final URL (stores externally)
      tab.on("framenavigated", () => {
        updateTabUrl(tab, "framenavigated");
      });

      // Also listen for load to catch fully loaded tabs (stores externally)
      tab.on("load", () => {
        updateTabUrl(tab, "load");
      });

      // Set up tab close handler
      setupTabCloseHandler(tab);
    } catch (e) {
      log(`  [DEBUG] Error in tab event handler: ${e}`);
    }
  });

  return new Promise<OverrideWithUrls | null>((resolve) => {
    let resolved = false;
    let pollInterval: NodeJS.Timeout | null = null;

    // Collect URLs from ALL open tabs when browser closes
    // DETERMINISTIC METHOD: Use persistentTabUrls as the single source of truth
    // CRITICAL: One URL per tab - number of tabs MUST equal number of final URLs
    // Only collect FINAL URLs (ignore intermediate redirects)
    // Collect ALL URLs regardless of who opened them
    const collectExtraUrls = (): string[] => {
      const extraUrls: string[] = [];
      log(`  [DEBUG] === Starting URL collection (deterministic method) ===`);
      log(
        `  [DEBUG] Links we opened: ${JSON.stringify(links.map((l) => l.url))}`,
      );
      log(`  [DEBUG] Total tracked tabs: ${tabUrlHistory.size}`);
      log(
        `  [DEBUG] Tabs with URLs in persistent storage: ${persistentTabUrls.size}`,
      );
      log(
        `  [DEBUG] URLs user manually closed (excluded): ${userClosedUrls.size}`,
      );

      try {
        // DETERMINISTIC: Use persistentTabUrls as the single source of truth
        // Collect ONE final URL from EACH tab
        let validUrlsFound = 0;
        let userClosedSkipped = 0;
        let blankUrlsSkipped = 0;

        for (const [, url] of persistentTabUrls.entries()) {
          if (!url || url === "about:blank") {
            blankUrlsSkipped++;
            continue;
          }

          // Skip if user manually closed this URL
          if (userClosedUrls.has(url)) {
            userClosedSkipped++;
            log(`  [DEBUG] ⊙ Skipped user-closed URL: ${url}`);
            continue;
          }

          // Collect final URL (one per tab)
          // If multiple tabs have the same URL, that's fine - we want one URL per tab
          const cleanedUrl = removeTrailingSlash(url);
          extraUrls.push(cleanedUrl);
          validUrlsFound++;
          log(`  [DEBUG] ✓ Collected final URL: ${cleanedUrl}`);
        }

        // Sort for consistency
        extraUrls.sort();

        log(`  [DEBUG] === URL collection complete ===`);
        log(
          `  [DEBUG] Summary: ${validUrlsFound} valid URLs from ${persistentTabUrls.size} tabs, ${userClosedSkipped} user-closed, ${blankUrlsSkipped} blank`,
        );
        log(`  [DEBUG] URLs: ${JSON.stringify(extraUrls)}`);

        // Verify: number of tabs should equal number of URLs
        if (
          persistentTabUrls.size !==
          extraUrls.length + userClosedSkipped + blankUrlsSkipped
        ) {
          log(
            `  [DEBUG] ⚠️ WARNING: Tab count (${persistentTabUrls.size}) does not match collected URLs (${extraUrls.length} + ${userClosedSkipped} skipped + ${blankUrlsSkipped} blank)`,
          );
        } else {
          log(
            `  [DEBUG] ✓ Verified: ${persistentTabUrls.size} tabs = ${extraUrls.length} URLs (+ ${userClosedSkipped} user-closed + ${blankUrlsSkipped} blank)`,
          );
        }

        return extraUrls;
      } catch (e) {
        log(`  [DEBUG] Error collecting extra URLs: ${e}`);
        if (e instanceof Error) {
          log(`  [DEBUG] Error stack: ${e.stack}`);
        }
        return [];
      }
    };

    const cleanup = (reason: string) => {
      if (resolved) {
        log(
          `  [DEBUG] cleanup called again with reason: ${reason}, but already resolved`,
        );
        return;
      }
      resolved = true;
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }

      // DETERMINISTIC: persistentTabUrls is already populated and persists
      // No need to capture URLs here - they're already in persistentTabUrls
      log(`  [DEBUG] cleanup() called with reason: ${reason}`);
      log(
        `  [DEBUG] Using persistentTabUrls (${persistentTabUrls.size} tabs) as single source of truth`,
      );

      // Mark context as closing
      // This prevents tab close handlers from interfering
      isContextClosing = true;
      log(
        `  [DEBUG] Context closing flag set to prevent URL deletion during tab close events`,
      );

      log(
        `  [DEBUG] Reading tab->URL mappings (no browser access needed): ${persistentTabUrls.size} tabs with URLs`,
      );
      log(`  [DEBUG] Total tracked tabs before cleanup: ${tabUrlHistory.size}`);

      // Log all URLs currently in storage for debugging
      if (persistentTabUrls.size > 0) {
        log(`  [DEBUG] URLs in persistent storage before collection:`);
        for (const [tab, url] of persistentTabUrls.entries()) {
          try {
            const isClosed = tab.isClosed();
            log(`  [DEBUG]   - ${url} (tab closed: ${isClosed})`);
          } catch {
            log(`  [DEBUG]   - ${url} (tab status: unknown - likely closed)`);
          }
        }
      } else {
        log(
          `  [DEBUG] ⚠️ WARNING: persistentTabUrls is empty! All URLs may have been deleted.`,
        );
      }

      // Simply read from persistentTabUrls - tab->URL mappings prepared by events
      (async () => {
        // Wait for pending tab close checks before collecting
        await waitForPendingChecks();

        log(`  [DEBUG] Collecting from tab->URL mappings...`);
        log(`  [DEBUG] Final user-closed URLs count: ${userClosedUrls.size}`);
        const extraUrls = collectExtraUrls();

        log(`  [DEBUG] Collection returned ${extraUrls.length} URLs`);
        log(
          `  [DEBUG] Changes object before: ${JSON.stringify(Object.keys(changes))}`,
        );

        if (extraUrls.length > 0) {
          log(`  📎 Found ${extraUrls.length} extra tab URL(s):`, extraUrls);

          // Categorize URLs into appropriate keys
          // CRITICAL: Collect ALL URLs from different tabs, but deduplicate within each category
          // If multiple tabs have the same URL, it will only appear once per category
          const categorized: CategorizedUrls = {};
          const seenUrls = new Map<LinkField | "urls", Set<string>>(); // Track seen URLs per category to avoid duplicates

          for (const url of extraUrls) {
            const category = categorizeUrl(url);
            const categoryKey = category || "urls";
            const cleanedUrl = removeTrailingSlash(url);

            // Initialize Set for this category if needed
            if (!seenUrls.has(categoryKey)) {
              seenUrls.set(categoryKey, new Set<string>());
            }
            const seen = seenUrls.get(categoryKey);
            if (!seen) continue;

            // Skip if we've already seen this exact URL in this category
            if (seen.has(cleanedUrl)) {
              log(
                `  [DEBUG] ⊙ Skipped duplicate URL in ${categoryKey}: ${cleanedUrl}`,
              );
              continue;
            }

            // Mark as seen and add to category
            seen.add(cleanedUrl);

            if (category === "li") {
              if (!categorized.li) categorized.li = [];
              categorized.li.push(cleanedUrl);
            } else if (category === "fb") {
              if (!categorized.fb) categorized.fb = [];
              categorized.fb.push(cleanedUrl);
            } else if (category === "tw") {
              if (!categorized.tw) categorized.tw = [];
              categorized.tw.push(cleanedUrl);
            } else if (category === "ig") {
              if (!categorized.ig) categorized.ig = [];
              categorized.ig.push(cleanedUrl);
            } else if (category === "gh") {
              if (!categorized.gh) categorized.gh = [];
              categorized.gh.push(cleanedUrl);
            } else if (category === "ytp") {
              if (!categorized.ytp) categorized.ytp = [];
              categorized.ytp.push(cleanedUrl);
            } else if (category === "ytc") {
              if (!categorized.ytc) categorized.ytc = [];
              categorized.ytc.push(cleanedUrl);
            } else if (category === "tt") {
              if (!categorized.tt) categorized.tt = [];
              categorized.tt.push(cleanedUrl);
            } else if (category === "th") {
              if (!categorized.th) categorized.th = [];
              categorized.th.push(cleanedUrl);
            } else {
              // Unsupported URL or website - keep in urls array for manual organization
              if (!categorized.urls) categorized.urls = [];
              categorized.urls.push(cleanedUrl);
            }
          }

          // Helper to merge arrays and deduplicate
          const mergeAndDeduplicate = (
            existing: string | string[] | undefined,
            newUrls: string[],
          ): string[] => {
            const existingArray = Array.isArray(existing)
              ? existing
              : existing
                ? [existing]
                : [];
            const combined = [...existingArray, ...newUrls];
            // Deduplicate by converting to Set and back to array
            return Array.from(new Set(combined));
          };

          // Merge categorized URLs into changes object (with deduplication)
          // Note: Websites are kept in urls array for manual organization

          if (categorized.li && categorized.li.length > 0) {
            changes.li = mergeAndDeduplicate(changes.li, categorized.li);
            hasChanges = true;
            log(`  ✓ Categorized ${categorized.li.length} LinkedIn URL(s)`);
          }

          if (categorized.fb && categorized.fb.length > 0) {
            changes.fb = mergeAndDeduplicate(changes.fb, categorized.fb);
            hasChanges = true;
            log(`  ✓ Categorized ${categorized.fb.length} Facebook URL(s)`);
          }

          if (categorized.tw && categorized.tw.length > 0) {
            changes.tw = mergeAndDeduplicate(changes.tw, categorized.tw);
            hasChanges = true;
            log(`  ✓ Categorized ${categorized.tw.length} Twitter/X URL(s)`);
          }

          if (categorized.ig && categorized.ig.length > 0) {
            changes.ig = mergeAndDeduplicate(changes.ig, categorized.ig);
            hasChanges = true;
            log(`  ✓ Categorized ${categorized.ig.length} Instagram URL(s)`);
          }

          if (categorized.gh && categorized.gh.length > 0) {
            changes.gh = mergeAndDeduplicate(changes.gh, categorized.gh);
            hasChanges = true;
            log(`  ✓ Categorized ${categorized.gh.length} GitHub URL(s)`);
          }

          if (categorized.ytp && categorized.ytp.length > 0) {
            changes.ytp = mergeAndDeduplicate(changes.ytp, categorized.ytp);
            hasChanges = true;
            log(
              `  ✓ Categorized ${categorized.ytp.length} YouTube Profile URL(s)`,
            );
          }

          if (categorized.ytc && categorized.ytc.length > 0) {
            changes.ytc = mergeAndDeduplicate(changes.ytc, categorized.ytc);
            hasChanges = true;
            log(
              `  ✓ Categorized ${categorized.ytc.length} YouTube Channel URL(s)`,
            );
          }

          if (categorized.tt && categorized.tt.length > 0) {
            changes.tt = mergeAndDeduplicate(changes.tt, categorized.tt);
            hasChanges = true;
            log(`  ✓ Categorized ${categorized.tt.length} TikTok URL(s)`);
          }

          if (categorized.th && categorized.th.length > 0) {
            changes.th = mergeAndDeduplicate(changes.th, categorized.th);
            hasChanges = true;
            log(`  ✓ Categorized ${categorized.th.length} Threads URL(s)`);
          }

          // Only keep unsupported URLs in urls array (with deduplication)
          if (categorized.urls && categorized.urls.length > 0) {
            changes.urls = mergeAndDeduplicate(changes.urls, categorized.urls);
            hasChanges = true;
            log(
              `  ✓ Kept ${categorized.urls.length} unsupported URL(s) in urls array`,
            );
          }
        } else {
          log(`  [DEBUG] No extra URLs found`);
        }

        log(
          `  [DEBUG] Final changes object: ${JSON.stringify(changes, null, 2)}`,
        );
        log(
          `  [DEBUG] hasChanges=${hasChanges}, changes.keys=${Object.keys(changes).join(", ")}`,
        );

        const finalHasChanges =
          hasChanges || (changes.urls !== undefined && changes.urls.length > 0);
        const hasUrls = changes.urls !== undefined && changes.urls.length > 0;
        log(
          `  [DEBUG] Final decision: hasChanges=${hasChanges}, hasUrls=${hasUrls}, finalHasChanges=${finalHasChanges}`,
        );

        // Save final URLs to tmp.txt for debugging - use same deterministic method
        // DETERMINISTIC: Use persistentTabUrls as the single source of truth
        try {
          const tmpFilePath = path.join(__dirname, "../../tmp.txt");
          const finalUrlList: string[] = [];

          // Use persistentTabUrls (same as collectExtraUrls)
          for (const [, url] of persistentTabUrls.entries()) {
            if (!url || url === "about:blank") {
              continue;
            }

            // Skip if user manually closed this URL
            if (userClosedUrls.has(url)) {
              continue;
            }

            finalUrlList.push(removeTrailingSlash(url));
          }

          // Sort for consistency
          finalUrlList.sort();

          fs.writeFileSync(
            tmpFilePath,
            finalUrlList.join("\n") + "\n",
            "utf-8",
          );
          log(
            `  💾 Saved ${finalUrlList.length} final URLs to tmp.txt from ${persistentTabUrls.size} tabs (one URL per tab, excluded ${userClosedUrls.size} manually closed URLs)`,
          );
        } catch (e) {
          log(`  ⚠️  Failed to save tmp.txt: ${e}`);
        }

        log(`  ✓ Browser closed, continuing... (detected via: ${reason})`);
        resolve(finalHasChanges ? changes : null);
      })();
    };

    const browser = context.browser();
    log(`  [DEBUG] Browser instance: ${browser ? "exists" : "null"}`);

    if (!browser) {
      log(`  [DEBUG] No browser instance, cleaning up`);
      cleanup("no browser instance");
      return;
    }

    log(`  [DEBUG] Browser connected: ${browser.isConnected()}`);
    log(`  [DEBUG] Setting up event listeners...`);

    // Listen to multiple events with debug logging
    browser.once("disconnected", () => {
      log(
        `  [DEBUG] Browser 'disconnected' event fired - using persistentTabUrls`,
      );
      // DETERMINISTIC: persistentTabUrls already has all URLs, no need to capture
      isContextClosing = true;
      log(
        `  [DEBUG] Context closing flag set from browser disconnect, persistentTabUrls size: ${persistentTabUrls.size}`,
      );
      cleanup("disconnected event");
    });

    context.once("close", () => {
      log(
        `  [DEBUG] Context 'close' event fired - setting closing flag and collecting URLs`,
      );
      // Set flag immediately when context starts closing
      // This prevents tab close handlers from deleting URLs
      isContextClosing = true;
      log(
        `  [DEBUG] Context closing flag set, persistentTabUrls size: ${persistentTabUrls.size}`,
      );
      cleanup("context close event");
    });

    // Also check if browser is already disconnected
    if (!browser.isConnected()) {
      log(`  [DEBUG] Browser already disconnected`);
      cleanup("already disconnected");
      return;
    }

    // Poll for browser disconnection as a fallback (in case events don't fire)
    pollInterval = setInterval(() => {
      const isConnected = browser.isConnected();
      const browserFromContext = context.browser();
      const allPagesClosed = pages.every((p) => p.isClosed());

      // DETERMINISTIC: persistentTabUrls already has all URLs, no need to capture
      if (!isConnected || browserFromContext === null) {
        isContextClosing = true;
        log(
          `  [DEBUG] Browser disconnected detected in polling - using persistentTabUrls (${persistentTabUrls.size} tabs)`,
        );
        cleanup("polling (isConnected=false)");
        return;
      }

      // If all pages are closed, browser was likely closed
      if (allPagesClosed && pages.length > 0) {
        isContextClosing = true;
        log(
          `  [DEBUG] All pages closed detected in polling - using persistentTabUrls (${persistentTabUrls.size} tabs)`,
        );
        cleanup("polling (all pages closed)");
        return;
      }
    }, 1000); // Poll every second
  });
};

/**
 * Draws a progress bar
 */
const drawProgressBar = (
  current: number,
  total: number,
  width: number = 40,
): string => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `[${bar}] ${percentage.toFixed(1)}% (${current}/${total})`;
};

/**
 * Gets statistics about processed/unprocessed items
 */
const getStatistics = (
  allItems: ScrappedItemType[],
  processedItems: Record<string, ManualOverrideValue>,
) => {
  const total = allItems.length;
  let processed = 0;
  let unprocessed = 0;
  const byReason: Record<string, { total: number; processed: number }> = {
    h: { total: 0, processed: 0 },
    f: { total: 0, processed: 0 },
    other: { total: 0, processed: 0 },
  };

  for (const item of allItems) {
    const isProcessedItem =
      processedItems[item.name] && isProcessed(processedItems[item.name]);

    if (isProcessedItem) {
      processed++;
    } else {
      unprocessed++;
    }

    // Count by reason
    const priority = getReasonPriority(item);
    if (priority === 1) {
      // "h" reason
      byReason.h.total++;
      if (isProcessedItem) byReason.h.processed++;
    } else if (priority === 2) {
      // "f" reason
      byReason.f.total++;
      if (isProcessedItem) byReason.f.processed++;
    } else {
      // other reasons
      byReason.other.total++;
      if (isProcessedItem) byReason.other.processed++;
    }
  }

  return {
    total,
    processed,
    unprocessed,
    byReason,
  };
};

/**
 * Displays statistics and progress bar
 */
const displayStatistics = (
  allItems: ScrappedItemType[],
  processedItems: Record<string, ManualOverrideValue>,
) => {
  const stats = getStatistics(allItems, processedItems);

  log("\n" + "=".repeat(60));
  log("📊 VALIDATION STATISTICS");
  log("=".repeat(60));

  // Overall progress
  log("\n📈 Overall Progress:");
  log(`   ${drawProgressBar(stats.processed, stats.total, 50)}`);

  // By reason
  log("\n📋 By Reason:");
  log(
    `   Reason "h": ${drawProgressBar(stats.byReason.h.processed, stats.byReason.h.total, 30)}`,
  );
  log(
    `   Reason "f": ${drawProgressBar(stats.byReason.f.processed, stats.byReason.f.total, 30)}`,
  );
  log(
    `   Others:    ${drawProgressBar(stats.byReason.other.processed, stats.byReason.other.total, 30)}`,
  );

  // Summary
  log("\n📊 Summary:");
  log(`   Total companies:     ${stats.total}`);
  log(
    `   ✅ Processed:        ${stats.processed} (${((stats.processed / stats.total) * 100).toFixed(1)}%)`,
  );
  log(
    `   ⏳ Remaining:        ${stats.unprocessed} (${((stats.unprocessed / stats.total) * 100).toFixed(1)}%)`,
  );

  log("\n📋 Remaining by Reason:");
  log(
    `   Reason "h":          ${stats.byReason.h.total - stats.byReason.h.processed} remaining`,
  );
  log(
    `   Reason "f":          ${stats.byReason.f.total - stats.byReason.f.processed} remaining`,
  );
  log(
    `   Others:              ${stats.byReason.other.total - stats.byReason.other.processed} remaining`,
  );

  log("\n" + "=".repeat(60));
};

/**
 * Gets the priority of an item based on its reasons:
 * - "h" reason = priority 1 (highest)
 * - "f" reason = priority 2
 * - others = priority 3 (lowest)
 */
const getReasonPriority = (item: ScrappedItemType): number => {
  if (!item.reasons || item.reasons.length === 0) {
    return 3; // No reasons = lowest priority
  }
  if (item.reasons.includes("h")) {
    return 1; // Highest priority
  }
  if (item.reasons.includes("f")) {
    return 2; // Second priority
  }
  return 3; // Other reasons = lowest priority
};

const sortByReasonAndCbRank = (
  items: ScrappedItemType[],
): ScrappedItemType[] => {
  return [...items].sort((a, b) => {
    // First sort by reason priority (h first, then f, then others)
    const priorityA = getReasonPriority(a);
    const priorityB = getReasonPriority(b);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority, sort by cbRank (lowest first)
    const rankA = a.cbRank
      ? parseInt(a.cbRank.replace(/,/g, ""), 10)
      : Infinity;
    const rankB = b.cbRank
      ? parseInt(b.cbRank.replace(/,/g, ""), 10)
      : Infinity;
    return rankA - rankB;
  });
};

/**
 * Prompts the user for a company name with a default value prefilled
 */
const promptForCompanyName = (defaultCompany: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    rl.question(
      `Enter company name to process (default: ${defaultCompany}): `,
      (answer) => {
        rl.close();
        const companyName = answer.trim() || defaultCompany;
        resolve(companyName);
      },
    );
  });
};

/**
 * Finds a company by exact case-sensitive name match
 */
const findCompanyByName = (
  companyName: string,
  items: ScrappedItemType[],
): ScrappedItemType | null => {
  return items.find((item) => item.name === companyName) || null;
};

export async function run() {
  let browserContext: BrowserContext | null = null;

  // Persistent browser profile path
  const userDataDir = path.join(__dirname, "../../.browser-profile");

  try {
    // Load data
    log("Loading data from 2_MERGED_ALL.json...");
    const fileContent = fs.readFileSync(inputFilePath, "utf-8");
    const data = APIScrapperFileDataSchema.parse(JSON.parse(fileContent));
    log(`Loaded ${data.length} items`);

    // Load current manual overrides
    let currentOverrides = loadManualOverrides();
    log(`Loaded ${Object.keys(currentOverrides).length} existing overrides`);

    // Sort by reason priority (h first, then f, then others) and cbRank
    const sortedData = sortByReasonAndCbRank(data);
    log("Sorted by reason priority (h > f > others) and cbRank");

    // Filter out already processed items
    const unprocessedItems = sortedData.filter((item) => {
      const existing = currentOverrides[item.name];
      return !existing || !isProcessed(existing);
    });

    log(`\nFound ${unprocessedItems.length} unprocessed items`);

    if (unprocessedItems.length === 0) {
      log("All items have been processed!");
      return;
    }

    // Get default company (next in queue)
    const defaultCompany = unprocessedItems[0].name;

    // Prompt user for company name with default prefilled
    const selectedCompanyName = await promptForCompanyName(defaultCompany);

    // Find the selected company by exact case-sensitive match
    const item = findCompanyByName(selectedCompanyName, unprocessedItems);

    if (!item) {
      // Company not found - show error with available options
      error(
        `\n❌ Company "${selectedCompanyName}" not found in unprocessed items.`,
      );
      log("\nAvailable companies (showing first 10):");
      const sampleCompanies = unprocessedItems.slice(0, 10);
      for (const company of sampleCompanies) {
        log(`  - ${company.name}`);
      }
      if (unprocessedItems.length > 10) {
        log(`  ... and ${unprocessedItems.length - 10} more`);
      }
      throw new Error(
        `Company "${selectedCompanyName}" not found. Please use an exact case-sensitive match.`,
      );
    }

    // Find the index of the selected company for progress display
    const itemIndex = unprocessedItems.findIndex((i) => i.name === item.name);
    log(
      `\n[${itemIndex + 1}/${unprocessedItems.length}] Processing: ${item.name} (cbRank: ${item.cbRank || "N/A"})`,
    );

    // Launch browser with persistent profile (reuse same profile across items)
    log("Launching browser with persistent profile...");

    const browserArgs = [
      "--start-maximized", // Ensure single window
      // Remove automation detection flags
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      // Use a realistic user agent
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];

    // Load The Wall extension from local path
    // Path from src/tasks/validate_urls.ts: go up 3 levels (to parent of scrapper repo), then into addon/build/chrome-mv3-dev/
    const extensionDir = path.join(
      __dirname,
      "../../../addon/build/chrome-mv3-dev",
    );
    const extensionManifestPath = path.join(extensionDir, "manifest.json");

    // Check if extension exists - crash if not found
    if (!fs.existsSync(extensionManifestPath)) {
      throw new Error(
        `Extension manifest not found at: ${extensionManifestPath}. ` +
          `Please ensure the extension is built at: ${extensionDir}`,
      );
    }

    // According to Playwright docs, use --disable-extensions-except and --load-extension
    // Use absolute path to avoid issues with relative paths
    const absoluteExtensionDir = path.resolve(extensionDir);
    browserArgs.push(`--disable-extensions-except=${absoluteExtensionDir}`);
    browserArgs.push(`--load-extension=${absoluteExtensionDir}`);
    log(`Loading The Wall extension from: ${absoluteExtensionDir}`);

    browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      // Use Playwright's bundled Chromium (required for extensions)
      // Chrome/Edge removed extension loading flags, so we must use Chromium
      args: browserArgs,
      // Add viewport to make it look more realistic
      viewport: { width: 1280, height: 720 },
      // Disable webdriver flag
      ignoreHTTPSErrors: true,
    });
    log("Browser launched (profile will persist cookies/login)");

    // Remove webdriver property from all pages to avoid detection
    const pages = browserContext.pages();
    for (const page of pages) {
      await page.addInitScript(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, "webdriver", {
          get: () => false,
        });
        // Override plugins to appear more realistic
        Object.defineProperty(navigator, "plugins", {
          get: () => [1, 2, 3, 4, 5],
        });
        // Override languages
        Object.defineProperty(navigator, "languages", {
          get: () => ["en-US", "en"],
        });
        // Remove Chrome automation indicator
        // Extend Window interface for chrome property
        // Use Object.defineProperty to avoid type assertion
        Object.defineProperty(window, "chrome", {
          value: { runtime: {} },
          writable: true,
          configurable: true,
        });
      });
    }

    // Also apply to future pages
    browserContext.on("page", async (page) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", {
          get: () => false,
        });
        Object.defineProperty(navigator, "plugins", {
          get: () => [1, 2, 3, 4, 5],
        });
        Object.defineProperty(navigator, "languages", {
          get: () => ["en-US", "en"],
        });
        // Extend Window interface for chrome property
        // Use Object.defineProperty to avoid type assertion
        Object.defineProperty(window, "chrome", {
          value: { runtime: {} },
          writable: true,
          configurable: true,
        });
      });
    });

    // Use the persistent context directly
    const changes = await validateItemLinks(browserContext, item);

    // Browser is closed now, process results
    if (changes && Object.keys(changes).length > 0) {
      // Has changes - update with the changes
      log(`  ✏️ Changes detected for ${item.name}:`, changes);
      // OverrideWithUrls can return arrays for any link field, convert to ManualOverrideFields format
      // ManualOverrideFields allows arrays for all link fields (ws/li/fb/tw/ig/gh/ytp/ytc/tt/th)
      const override: ManualOverrideFields &
        ProcessedState & {
          urls?: string[];
        } = {
        _processed: true,
      };

      // Type-safe assignment for each link field
      if (changes.urls) override.urls = changes.urls;
      if (changes.ws !== undefined) override.ws = changes.ws;
      if (changes.li !== undefined) override.li = changes.li;
      if (changes.fb !== undefined) override.fb = changes.fb;
      if (changes.tw !== undefined) override.tw = changes.tw;
      if (changes.ig !== undefined) override.ig = changes.ig;
      if (changes.gh !== undefined) override.gh = changes.gh;
      if (changes.ytp !== undefined) override.ytp = changes.ytp;
      if (changes.ytc !== undefined) override.ytc = changes.ytc;
      if (changes.tt !== undefined) override.tt = changes.tt;
      if (changes.th !== undefined) override.th = changes.th;

      currentOverrides[item.name] = override;
    } else {
      // No changes - mark as processed
      log(`  ✓ No changes for ${item.name}`);
      const override: ProcessedState = {
        _processed: true,
      };
      currentOverrides[item.name] = override;
    }

    // Save after each item
    await saveManualOverrides(currentOverrides);

    // CRITICAL: Ensure file is fully written and readable before proceeding
    // Verify the file exists and is readable to ensure it's saved on disk
    try {
      const exists = fs.existsSync(manualOverridesPath);
      if (!exists) {
        throw new Error(
          `manualOverrides file not found after save: ${manualOverridesPath}`,
        );
      }
      // Try to read it to ensure it's fully written
      fs.readFileSync(manualOverridesPath, "utf-8");
      log("  💾 Progress saved and verified");
    } catch (e) {
      error(`  ⚠️  Failed to verify manualOverrides save: ${e}`);
      throw new Error(
        `Cannot proceed: manualOverrides file not saved correctly`,
      );
    }

    log(`\n✓ Item processed. Remaining items: ${unprocessedItems.length - 1}`);

    // Reload overrides to get updated statistics
    const updatedOverrides = loadManualOverrides();

    log("\n✅ Script complete. Run again to process next item.");

    // Display statistics at the very end
    displayStatistics(sortedData, updatedOverrides);

    // Don't exit here - let validate_index.ts handle exit after applying overrides
    // This allows validate_index.ts to run apply-overrides command after validation
  } catch (err) {
    error("Error during validation:", err);
    throw err;
  } finally {
    if (browserContext) {
      try {
        // Check if browser is still connected before trying to close
        const browser = browserContext.browser();
        const isConnected = browser?.isConnected() ?? false;
        if (isConnected) {
          await browserContext.close();
          log("Browser closed");
        }
      } catch {
        // Browser context already closed, ignore
      }
    }
  }
}

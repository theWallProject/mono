import { BrowserContext, Page } from "playwright"

import { log } from "../../helper"

export type SearchService = {
  name: string
  urlTemplate: (query: string) => string
}

export const searchServices: SearchService[] = [
  {
    name: "Ecosia",
    urlTemplate: (query) =>
      `https://www.ecosia.org/search?q=${encodeURIComponent(query)}`
  },
  {
    name: "GitHub",
    urlTemplate: (query) =>
      `https://github.com/search?q=${encodeURIComponent(query)}&type=users`
  },
  {
    name: "YouTube",
    urlTemplate: (query) =>
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%253D%253D`
  },
  {
    name: "TikTok",
    urlTemplate: (query) =>
      `https://www.tiktok.com/search/user?q=${encodeURIComponent(query)}`
  },
  {
    name: "Play Store",
    urlTemplate: (query) =>
      `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`
  },
  {
    name: "Apple Store",
    urlTemplate: (query) =>
      `https://www.apple.com/us/search/${encodeURIComponent(query)}?src=globalnav`
  },
  {
    name: "Chrome Web Store",
    urlTemplate: (query) =>
      `https://chrome.google.com/webstore/search/${encodeURIComponent(query)}`
  },
  {
    name: "Facebook",
    urlTemplate: (query) =>
      `https://www.facebook.com/search/pages/?q=${encodeURIComponent(query)}`
  },
  {
    name: "Threads",
    urlTemplate: (query) =>
      `https://www.threads.net/search?q=${encodeURIComponent(query)}`
  },
  {
    name: "Instagram",
    urlTemplate: (query) =>
      `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(query)}`
  }
]

/**
 * Opens search pages for all configured search services
 */
export const openSearchPages = async (
  context: BrowserContext,
  query: string,
  pages: Page[]
): Promise<void> => {
  // Open all search tabs first (without waiting for navigation)
  const searchPages: Array<{
    page: Page
    service: SearchService
    url: string
  }> = []

  for (const service of searchServices) {
    try {
      const searchPage = await context.newPage()
      const searchUrl = service.urlTemplate(query)
      log(`  🔍 Opening ${service.name} search for "${query}"`)
      searchPages.push({ page: searchPage, service, url: searchUrl })
      pages.push(searchPage)
    } catch (e) {
      log(`  [DEBUG] Could not create ${service.name} search tab: ${e}`)
    }
  }

  // Navigate all search tabs in parallel (don't wait for each to finish)
  const navigationPromises = searchPages.map(async ({ page, service, url }) => {
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000
      })
      log(`  ✓ ${service.name} search tab opened`)
    } catch (e) {
      log(`  [DEBUG] Could not navigate ${service.name} search tab: ${e}`)
    }
  })

  // Wait for all navigations to complete (but they're already running in parallel)
  await Promise.all(navigationPromises)
}

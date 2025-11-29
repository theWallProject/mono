import { Page } from "playwright"

export const normalizeUrl = (url: string): string => {
  if (!url) {
    throw new Error("URL is empty")
  }

  // Remove leading/trailing whitespace
  url = url.trim()

  // If URL doesn't start with http:// or https://, add https://
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`
  }

  return url
}

export const removeTrailingSlash = (url: string): string => {
  return url.replace(/\/+$/, "")
}

export const normalizeUrlForComparison = (url: string): string => {
  if (!url) return ""

  // Normalize to https if it's http
  url = url.trim().toLowerCase()
  url = url.replace(/^http:\/\//, "https://")

  // Remove trailing slash (except for root domain like https://example.com/)
  url = url.replace(/\/+$/, "")

  // Remove www. prefix for comparison
  url = url.replace(/^https:\/\/www\./, "https://")

  // Remove query parameters and fragments for comparison
  url = url.split("?")[0].split("#")[0]

  return url
}

export const urlsAreEquivalent = (url1: string, url2: string): boolean => {
  const normalized1 = normalizeUrlForComparison(url1)
  const normalized2 = normalizeUrlForComparison(url2)
  return normalized1 === normalized2
}

export const checkRedirect = async (
  page: Page,
  url: string
): Promise<{ finalUrl: string; redirected: boolean }> => {
  const normalizedUrl = normalizeUrl(url)
  const initialUrl = normalizedUrl
  let finalUrl = initialUrl
  let redirected = false

  const response = await page.goto(normalizedUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30000
  })

  if (!response) {
    throw new Error(`No response from ${normalizedUrl}`)
  }

  if (response.status() >= 400) {
    throw new Error(
      `HTTP ${response.status()} error for ${normalizedUrl}: ${response.statusText()}`
    )
  }

  finalUrl = response.url()

  // Compare normalized URLs to ignore formatting differences
  redirected = !urlsAreEquivalent(initialUrl, finalUrl)

  return { finalUrl, redirected }
}

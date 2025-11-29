import type { DomScanRule } from "./types"

/**
 * LinkedIn job page scanning rules configuration
 */
export const LINKEDIN_JOB_PAGE_RULES: DomScanRule[] = [
  {
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/jobs\/search/,
    itemSelector: ".job-details-jobs-unified-top-card__container--two-pane", // Job posting container
    linkSelector: ".job-details-jobs-unified-top-card__company-name a", // Company link within item
    linkAttribute: "href"
  }
]

/**
 * Find matching rule for current page URL
 */
export const findMatchingRule = (url: string): DomScanRule | null => {
  return (
    LINKEDIN_JOB_PAGE_RULES.find((rule) => rule.urlPattern.test(url)) || null
  )
}

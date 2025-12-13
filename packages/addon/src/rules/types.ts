export type RuleIds = "youtube_channel" | "linkedin_job_processing"
/**
 * Discriminated union type for all rule types
 * TypeScript automatically narrows types based on the 'type' field
 */
export type Rule =
  | {
      type: "urlOnly"
      id: RuleIds
      urlPattern: RegExp
    }
  | {
      type: "urlDomFull"
      id: RuleIds
      urlPattern: RegExp
      linkSelector: string // CSS selector for element containing URL to extract
      linkAttribute?: string // Attribute containing URL (default: 'href')
    }
  | {
      type: "urlDomInline"
      id: RuleIds
      urlPattern: RegExp
      itemSelector: string // Parent container selector (e.g., job listing row)
      linkSelector: string // Nested selector for link within item container
      linkAttribute?: string // Attribute containing URL (default: 'href')
    }

/**
 * Type helper to extract a specific rule type from the union
 */
export type RuleOfType<T extends Rule["type"]> = Extract<Rule, { type: T }>

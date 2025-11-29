import type { Rule } from "../types"

import { processUrlDomFull } from "./urlDomFull"
import { processUrlDomInline } from "./urlDomInline"
import { processUrlOnly } from "./urlOnly"

/**
 * Processor function type for each rule type
 */
type Processor<T extends Rule["type"]> = (
  rule: Extract<Rule, { type: T }>
) => Promise<string | null> | Extract<Rule, { type: T }>

/**
 * Type-safe processor registry
 * Maps rule types to their processor functions
 */
export const PROCESSORS: {
  [K in Rule["type"]]: Processor<K>
} = {
  urlOnly: processUrlOnly as Processor<"urlOnly">,
  urlDomFull: processUrlDomFull as Processor<"urlDomFull">,
  urlDomInline: processUrlDomInline as Processor<"urlDomInline">
}

/**
 * Process a rule using its corresponding processor
 */
export async function processRule<T extends Rule["type"]>(
  rule: Extract<Rule, { type: T }>
): Promise<string | null | Extract<Rule, { type: T }>> {
  const processor = PROCESSORS[rule.type]
  return processor(rule) as Promise<string | null | Extract<Rule, { type: T }>>
}


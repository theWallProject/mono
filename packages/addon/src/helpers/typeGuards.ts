/**
 * Type guard functions for runtime type checking
 * Used to replace type assertions with proper type narrowing
 */

/**
 * Type guard to check if a value is an HTMLElement
 */
export function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement
}

/**
 * Type guard to check if a Node is an Element
 */
export function isElementNode(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

/**
 * Type guard to check if a value is a Node
 */
export function isNode(value: unknown): value is Node {
  return value instanceof Node
}

/**
 * Type guard to check if definitions object has the expected structure
 */
export function isDefinitionsRecord(value: unknown): value is Record<string, Record<string, unknown>> {
  if (typeof value !== "object" || value === null) {
    return false
  }
  for (const [, item] of Object.entries(value)) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return false
    }
  }
  return true
}

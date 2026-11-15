/**
 * Extracts a company profile from its own website.
 *
 * The alternatives flow needs to know what a company *is* before it can find
 * comparable entries in our corpus. Rather than asking an agent to summarise the site
 * (which costs tokens and invites invention), this reads the site's own structured data:
 * JSON-LD `Organization` / `SoftwareApplication` nodes and the `<meta description>`.
 * BrainsMingle, for example, declares exactly the right wording in its JSON-LD.
 *
 * This is deliberately limited to data the site publishes about itself. Scraping body
 * text would pick up marketing copy, navigation and cookie banners, which pollutes the
 * embedding with words that describe nothing.
 *
 * Fails hard when a site publishes nothing usable. A vague query produces a confident
 * wrong answer, which is worse than no answer.
 */

import { z } from "zod"

/** Hard cap so a pathological page cannot stall an authoring run. */
const REQUEST_TIMEOUT_MS = 20_000

/** Review-derived profiles are assembled from a handful of short strings. */
const MAX_DESCRIPTION_LENGTH = 600

const MAX_REDIRECTS = 5

const JsonLdStringSchema = z.union([z.string(), z.array(z.string())]).optional()

/**
 * Minimal shape of the JSON-LD nodes we read.
 *
 * Only the fields used here are declared; unknown fields are ignored because site
 * markup varies enormously and a strict schema would reject most real pages.
 */
const JsonLdNodeSchema = z
  .object({
    "@type": z.union([z.string(), z.array(z.string())]).optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    url: z.string().optional(),
    sameAs: JsonLdStringSchema
  })
  .passthrough()

const JsonLdGraphSchema = z.union([z.array(z.unknown()), z.object({ "@graph": z.array(z.unknown()) }).passthrough()])

export type CompanyProfile = {
  /** Registered name from JSON-LD, when present. */
  name?: string
  /** Self-description, trimmed to something an embedding model can use. */
  description?: string
  /** Page title, useful when JSON-LD is absent. */
  title?: string
  /** `<meta name="description">` or its OpenGraph equivalent. */
  metaDescription?: string
  /** Social/identity URLs declared by the site. */
  sameAs: string[]
  /** Which sources contributed, so a weak profile is visible rather than silently weak. */
  sources: Array<"jsonLd" | "metaDescription" | "title">
}

/**
 * The text to embed: what the company says it DOES, never what it is CALLED.
 *
 * Measured on the reference case: including the company's own name and page title dropped
 * the strongest true match from 0.66 to 0.53 and replaced it with "BrainShake" and
 * "Brainsgate". The name embeds as a brand token, so every unrelated company sharing a
 * syllable outranks genuine competitors. The title is worse, since it usually repeats the
 * brand. Descriptions say what the product is, which is the only thing worth comparing.
 */
export const buildProfileText = (profile: CompanyProfile): string => {
  const parts = [profile.description, profile.metaDescription]
    .filter((part): part is string => part !== undefined && part.trim().length > 0)
    // Descriptions routinely end in a period; joining on ". " would then produce "..".
    .map((part) => part.trim().replace(/[.\s]+$/, ""))
    .filter((part) => part.length > 0)

  return parts.join(". ").slice(0, MAX_DESCRIPTION_LENGTH)
}

const unescapeHtmlEntities = (value: string): string =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")

const decodeAttributeValue = (value: string): string => unescapeHtmlEntities(value).trim()

/** Reads the first matching `<meta>` content for any of the given names/properties. */
export const extractMetaDescription = (html: string): string | undefined => {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i,
    /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]*property=["']og:description["']/i
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(html)
    const captured = match?.[1]
    if (captured !== undefined && captured.trim().length > 0) {
      return decodeAttributeValue(captured)
    }
  }

  return undefined
}

/** Reads `<title>`, which nearly every page has and which usually names the company. */
export const extractTitle = (html: string): string | undefined => {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  const captured = match?.[1]
  if (captured === undefined) {
    return undefined
  }

  const cleaned = decodeAttributeValue(captured.replace(/\s+/g, " "))
  return cleaned.length > 0 ? cleaned : undefined
}

/**
 * Pulls every JSON-LD node out of the page.
 *
 * Malformed JSON is skipped rather than thrown on: a single broken block on an otherwise
 * useful page should not fail the whole extraction, and sites routinely emit invalid
 * JSON-LD. A page with *no* usable node is handled by the caller's fail-hard check.
 */
export const extractJsonLdNodes = (html: string): z.infer<typeof JsonLdNodeSchema>[] => {
  const nodes: z.infer<typeof JsonLdNodeSchema>[] = []
  const blockPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

  for (const match of html.matchAll(blockPattern)) {
    const body = match[1]
    if (body === undefined) {
      continue
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(body.trim())
    } catch {
      continue
    }

    const graph = JsonLdGraphSchema.safeParse(parsed)
    const candidates: unknown[] = graph.success && Array.isArray(graph.data) ? graph.data : []

    if (!Array.isArray(parsed)) {
      const wrapped = JsonLdGraphSchema.safeParse(parsed)
      if (wrapped.success && !Array.isArray(wrapped.data) && "@graph" in wrapped.data) {
        candidates.push(...wrapped.data["@graph"])
      } else {
        candidates.push(parsed)
      }
    }

    for (const candidate of candidates) {
      const node = JsonLdNodeSchema.safeParse(candidate)
      if (node.success) {
        nodes.push(node.data)
      }
    }
  }

  return nodes
}

const nodeTypes = (node: z.infer<typeof JsonLdNodeSchema>): string[] => {
  const type = node["@type"]
  if (type === undefined) {
    return []
  }
  return Array.isArray(type) ? type : [type]
}

/**
 * Builds a profile from already-fetched HTML. Pure, so the parsing rules are testable
 * without a network call.
 */
export const buildCompanyProfileFromHtml = (html: string): CompanyProfile => {
  const nodes = extractJsonLdNodes(html)

  const organizationLike = nodes.filter((node) =>
    nodeTypes(node).some((type) => type === "Organization" || type === "SoftwareApplication" || type === "Corporation")
  )

  const declaredName = organizationLike.find((node) => node.name !== undefined)?.name
  const declaredDescription = organizationLike.find((node) => node.description !== undefined)?.description

  const sameAs = [
    ...new Set(
      organizationLike.flatMap((node) => {
        const value = node.sameAs
        if (value === undefined) return []
        return Array.isArray(value) ? value : [value]
      })
    )
  ]

  const metaDescription = extractMetaDescription(html)
  const title = extractTitle(html)

  const sources: CompanyProfile["sources"] = []
  if (declaredName !== undefined || declaredDescription !== undefined) sources.push("jsonLd")
  if (metaDescription !== undefined) sources.push("metaDescription")
  if (title !== undefined) sources.push("title")

  return {
    ...(declaredName !== undefined ? { name: declaredName } : {}),
    ...(declaredDescription !== undefined ? { description: declaredDescription.trim() } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(metaDescription !== undefined ? { metaDescription } : {}),
    sameAs,
    sources
  }
}

/** Follows redirects manually so a loop cannot hang the process. */
const fetchWithRedirects = async (url: string): Promise<string> => {
  let current = url

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          // Many sites serve different markup to obvious scrapers; this is the same UA
          // string the homepage extractor uses for the same reason.
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
          Accept: "text/html,application/xhtml+xml"
        }
      })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location")
        if (location === null) {
          throw new Error(`Redirect from ${current} had no Location header.`)
        }
        current = new URL(location, current).toString()
        continue
      }

      if (!response.ok) {
        throw new Error(`Fetching ${current} failed with HTTP ${response.status}.`)
      }

      return await response.text()
    } finally {
      clearTimeout(timer)
    }
  }

  throw new Error(`Too many redirects (more than ${MAX_REDIRECTS}) starting at ${url}.`)
}

/**
 * Fetches a company's homepage and extracts its profile.
 *
 * Throws when the site yields no usable description text: the caller then has nothing to
 * embed, and a caller that proceeds anyway would attach the alternative to unrelated
 * companies. Failing here is the correct outcome.
 */
export const fetchCompanyProfile = async (website: string): Promise<CompanyProfile> => {
  const target = /^https?:\/\//i.test(website) ? website : `https://${website}`
  const html = await fetchWithRedirects(target)
  const profile = buildCompanyProfileFromHtml(html)

  if (buildProfileText(profile).length === 0) {
    throw new Error(
      `No usable description found at ${target}. The page exposed no JSON-LD organization data, ` +
        "no meta description and no title. Pass --desc to supply one explicitly."
    )
  }

  return profile
}

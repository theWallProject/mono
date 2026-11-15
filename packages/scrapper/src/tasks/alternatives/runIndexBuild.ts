/**
 * `--action alternatives-index`: rebuilds the similarity sidecar.
 *
 * Run this whenever the merged corpus changes. The index carries a corpus fingerprint and
 * every query verifies it, so a forgotten rebuild surfaces as a loud error rather than as
 * neighbours computed against companies that no longer exist.
 */

import fs from "fs"
import path from "path"

import { log } from "../../helper"
import { buildIndustryTaxonomyHashInput } from "./industryTaxonomy"
import { loadCorpus } from "./runAlternativesAdd"
import { buildIndex, INDEX_FORMAT_VERSION, type IndexMeta } from "./similarity"

export type IndexBuildResult = {
  meta: IndexMeta
  companies: number
}

export const run = async (): Promise<IndexBuildResult> => {
  const corpus = loadCorpus()
  log(`Embedding ${corpus.length} distinct companies...`)

  const corpusHash = buildIndustryTaxonomyHashInput(corpus)
  const meta = await buildIndex(corpus, corpusHash)

  const metaPath = path.join(__dirname, "../../../results/index/meta.json")
  if (!fs.existsSync(metaPath)) {
    throw new Error(`Index build reported success but ${metaPath} does not exist.`)
  }

  log(`Index ready: ${meta.count} vectors, format ${INDEX_FORMAT_VERSION}, corpus ${corpusHash}`)

  return { meta, companies: corpus.length }
}

/** Exposed so the add command can confirm a rebuild produced a matching hash. */
export const expectCorpusHash = (corpus: Parameters<typeof buildIndustryTaxonomyHashInput>[0]): string =>
  buildIndustryTaxonomyHashInput(corpus)

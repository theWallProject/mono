# Scrapper Data Flow Documentation

This document describes the data flow through the scrapper pipeline, including input/output types for each step.

## Pipeline Overview

```
scrap → merge_cb → gen_static → gen_buyIsraeliTech → merge_static → extract_social → extract_websites → final
                                                                                      ↓
                                                                              generate_android_blacklist
                                                                                      ↓
                                                                              alternatives_report
                                                                                      ↓
                                                                              copy_to_addon
                                                                                      ↓
                                                                              validate (optional)
```

## Step-by-Step Data Flow

### Step 1: `scrap()` - Scrape Crunchbase

**File:** `src/tasks/scrap.ts`

**Input:** None (scrapes from Crunchbase website)

**Output:** `CrunchbaseScrappedItemType[]`

- **Location:** `results/1_batches/cb/*.json` (multiple batch files)
- **Type:** `CrunchbaseScrappedItemsType` (alias for `CrunchbaseScrappedItemType[]`)

**Type Definition:**

```typescript
CrunchbaseScrappedItemType {
  name: string
  id: string
  cbLink?: string
  reasons: APIListOfReasons[]
  li?: string          // LinkedIn
  ws?: string          // Website
  fb?: string          // Facebook
  tw?: string          // Twitter
  stock_symbol?: string
  stock_exchange_symbol?: string
  acquirer_identifier?: Array<{name: string, link: string}>
  hq_postal_code?: string
  founderIds?: Array<{name: string, link: string}>
  investorIds?: Array<{name: string, link: string}>
  acquirerIds?: Array<{name: string, link: string}>
  description?: string
  cbRank?: string
  estRevenue?: string
  industries?: string[]
  industryGroups?: string[]
}
```

**Notes:**

- Scrapes data from Crunchbase in batches
- Each batch saved as separate JSON file
- Only includes fields from Crunchbase API response
- Does NOT include hint fields or Android fields (these come from manual data/overrides)

---

### Step 2: `merge_cb()` - Merge Crunchbase Batches

**File:** `src/tasks/merge_cb.ts`

**Input:** `CrunchbaseScrappedItemType[]` (from multiple batch files in `results/1_batches/cb/`)

**Output:** `CrunchbaseScrappedItemType[]`

- **Location:** `results/2_merged/1_MERGED_CB.json`
- **Type:** `CrunchbaseScrappedItemsType`

**Transformations:**

- Merges all batch files
- Deduplicates by `id`
- Merges duplicate entries (combines reasons, fills empty fields)
- Sorts by name

**Type:** Same as input (`CrunchbaseScrappedItemType[]`)

---

### Step 3: `gen_static()` - Generate Manual Data

**File:** `src/tasks/gen_static.ts`

**Input:**

- `BDS` (from `static_data/BDS.ts`) - `CompressedManualItemType[]`
- `Hints` (from `static_data/hints.ts`) - `CompressedManualItemType[]`

**Output:** `ManualEntryType[]`

- **Location:** `results/1_batches/static/MANUAL.json`
- **Type:** `ManualEntriesType` (alias for `ManualEntryType[]`)

**Input Type:**

```typescript
CompressedManualItemType {
  reasons?: APIListOfReasons[]
  name: string
  li?: string[]        // Array of LinkedIn URLs
  ws: string[]         // Array of website URLs (required, min 1)
  fb?: string[]        // Array of Facebook URLs
  tw?: string[]        // Array of Twitter URLs
  ig?: string[]        // Array of Instagram URLs
  gh?: string[]        // Array of GitHub URLs
  ytp?: string[]       // Array of YouTube Profile URLs
  ytc?: string[]       // Array of YouTube Channel URLs
  tt?: string[]        // Array of TikTok URLs
  th?: string[]        // Array of Threads URLs
  isHint?: boolean
  hintText?: string
  hintUrl?: string
}
```

**Output Type:**

```typescript
ManualEntryType {
  name: string
  id: string
  reasons: APIListOfReasons[]
  li?: string          // Single LinkedIn URL
  ws?: string          // Single website URL
  fb?: string          // Single Facebook URL
  tw?: string          // Single Twitter URL
  isHint?: boolean
  hintText?: string
  hintUrl?: string
}
```

**Transformations:**

- Converts `CompressedManualItemType` (with arrays) → `ManualEntryType` (with single strings)
- Creates one entry per URL (splits arrays into multiple entries)
- Generates IDs: `s_ws_${name}_${index}`, `s_li_${name}_${index}`, etc.
- Only processes Hints items with `isHint: true`

**Type Note:**

- `ManualEntryType` is a dedicated type for manual entries (not Crunchbase items)
- Only includes fields that manual entries actually use
- Does not include Crunchbase-specific fields like `cbLink`, `cbRank`, `estRevenue`, etc.

---

### Step 4: `gen_buyIsraeliTech()` - Generate Buy Israeli Tech Data

**File:** `src/tasks/gen_buyIsraeliTech.ts`

**Input:** `BuyIsraeliTechType[]` (from `static_data/external/buyIsraeliTech.json`)

**Output:** `ManualEntryType[]`

- **Location:** `results/1_batches/static/BUY_ISR_TECH.json`
- **Type:** `ManualEntriesType` (alias for `ManualEntryType[]`)

**Input Type:**

```typescript
BuyIsraeliTechType {
  Name: string
  Link: string | null
  IsraelRelation: "HQ" | "Satellite Office"
  Tags?: string
  Stage?: string
  Description?: string
  Logo?: string
}
```

**Transformations:**

- Filters for `IsraelRelation === "HQ"` and `Link` is string
- Converts to `ManualEntryType` format
- Sets `reasons: ["h"]`
- Generates ID: `BIT_${Name}`

**Type:** Same as `gen_static()` output (`ManualEntryType[]`)

---

### Step 5: `merge_static()` - Merge All Sources

**File:** `src/tasks/merge_static.ts`

**Input:**

- `CrunchbaseScrappedItemType[]` from `results/2_merged/1_MERGED_CB.json`
- `ManualEntryType[]` from all files in `results/1_batches/static/`

**Output:** `MergedDataItem[]`

- **Location:** `results/2_merged/2_MERGED_ALL.json`
- **Type:** `MergedDataFile` (alias for `MergedDataItem[]`)

**Output Type:**

```typescript
MergedDataItem extends CrunchbaseScrappedItemType {
  // Additional social platforms from manual overrides
  ig?: string          // Instagram (from manual overrides)
  gh?: string          // GitHub (from manual overrides)
  ytp?: string         // YouTube Profile (from manual overrides)
  ytc?: string         // YouTube Channel (from manual overrides)
  tt?: string          // TikTok (from manual overrides)
  th?: string          // Threads (from manual overrides)

  // Hint fields from manual data (BDS, Hints)
  isHint?: boolean     // Hint flag (from manual hints data)
  hintText?: string    // Hint text (from manual hints data)
  hintUrl?: string     // Hint URL (from manual hints data)

  // Android fields from manual overrides
  android_dev_id?: string      // Android developer ID (from manual overrides)
  android_app_ids?: string[]   // Android app package IDs (from manual overrides)
}
```

**Transformations:**

- Merges CB data with static data
- Removes duplicates by website URL
- Applies manual overrides from `manual_resolve/manualOverrides.ts`
- Removes items in `manual_resolve/manualDeleteIds.ts`
- Normalizes URLs (removes protocol, normalizes domains)
- Handles array overrides (creates multiple entries for array values)
- Converts Twitter URLs: `twitter.com` → `x.com`
- Normalizes LinkedIn: `/company-beta/` → `/company/`
- Uses `getMainDomain()` for websites
- Adds hint fields from manual hints data
- Adds Android fields from manual overrides

**Type Note:**

- `MergedDataItem` extends `CrunchbaseScrappedItemType` and adds:
  - 6 social platform fields (ig, gh, ytp, ytc, tt, th) from manual overrides
  - 3 hint fields (isHint, hintText, hintUrl) from manual hints data
  - 2 Android fields (android_dev_id, android_app_ids) from manual overrides
- These fields are NOT from Crunchbase API - they come from manual data sources

---

### Step 6: `extract_social()` - Extract Social Links

**File:** `src/tasks/extract_social.ts`

**Input:** `MergedDataItem[]` (from `results/2_merged/2_MERGED_ALL.json`)

**Output:** `NetworksFlatItemType[]` (multiple files)

- **Locations:**
  - `results/3_networks/FLAGGED_LI_COMPANY.json`
  - `results/3_networks/FLAGGED_FACEBOOK.json`
  - `results/3_networks/FLAGGED_TWITTER.json`
  - `results/3_networks/FLAGGED_INSTAGRAM.json`
  - `results/3_networks/FLAGGED_GITHUB.json`
  - `results/3_networks/FLAGGED_YOUTUBE_PROFILE.json`
  - `results/3_networks/FLAGGED_YOUTUBE_CHANNEL.json`
  - `results/3_networks/FLAGGED_TIKTOK.json`
  - `results/3_networks/FLAGGED_THREADS.json`

**Output Type:**

```typescript
NetworksFlatItemType {
  selector: string      // Extracted identifier (username, domain, etc.)
  id: string           // Original item ID
  reasons: APIListOfReasons[]
  name: string
  s?: string           // Stock symbol
  isHint?: boolean
  hintText?: string
  hintUrl?: string
}
```

**Transformations:**

- Extracts identifiers from URLs using regex patterns
- Creates separate entries for each social platform
- Validates URLs against platform-specific regex
- Filters out invalid patterns (e.g., Facebook groups, Twitter home)
- Deduplicates by selector per platform
- Sorts by name

**Type Comparison: `MergedDataItem` vs `NetworksFlatItemType`**

| Aspect                | `MergedDataItem` (Input)                                                | `NetworksFlatItemType` (Output)               |
| --------------------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| **Structure**         | One entry per company                                                   | One entry per platform/selector               |
| **URL Fields**        | Full URLs: `li`, `ws`, `fb`, `tw`, `ig`, `gh`, `ytp`, `ytc`, `tt`, `th` | None (replaced by `selector`)                 |
| **Selector**          | Not present                                                             | Extracted identifier (username, domain, etc.) |
| **Core Fields**       | `id`, `name`, `reasons`                                                 | `id`, `name`, `reasons` (preserved)           |
| **Stock Symbol**      | `stock_symbol`                                                          | `s` (abbreviated)                             |
| **Hint Fields**       | `isHint`, `hintText`, `hintUrl`                                         | `isHint`, `hintText`, `hintUrl` (preserved)   |
| **Crunchbase Fields** | `cbLink`, `cbRank`, `estRevenue`, `industries`, `founderIds`, etc.      | None (dropped)                                |
| **Other Fields**      | `description`, `hq_postal_code`, `acquirerIds`, etc.                    | None (dropped)                                |

**Key Transformations:**

1. **Flattening**: One company entry with multiple URLs → Multiple entries (one per platform)
   - Example: Company with `li`, `fb`, `tw` → 3 separate entries

2. **URL Extraction**: Full URL → Platform-specific identifier
   - `li: "linkedin.com/company/example"` → `selector: "example"`
   - `fb: "facebook.com/example"` → `selector: "example"`
   - `ws: "example.com"` → `selector: "example_com"` (for websites)

3. **Field Mapping**:
   - `stock_symbol` → `s`
   - All other fields preserved as-is or dropped

4. **Platform Separation**: Each platform gets its own file
   - LinkedIn entries → `FLAGGED_LI_COMPANY.json`
   - Facebook entries → `FLAGGED_FACEBOOK.json`
   - etc.

---

### Step 7: `extract_websites()` - Extract Websites

**File:** `src/tasks/extract_websites.ts`

**Input:** `MergedDataItem[]` (from `results/2_merged/2_MERGED_ALL.json`)

**Output:** `NetworksFlatItemType[]`

- **Location:** `results/3_networks/WEBSITES.json`
- **Type:** `NetworksFlatItemsType` (alias for `NetworksFlatItemType[]`)

**Transformations:**

- Filters items with non-empty `ws` field
- Excludes domains: `google.com`, `business.site`, `.steampowered`, `meetup`, `.apple.com`, `.il`
- Extracts domain from website URL
- Merges duplicate domains (combines reasons)
- Preserves hint fields (`isHint`, `hintText`, `hintUrl`)

**Type:** Same as `extract_social()` output (`NetworksFlatItemType[]`)

---

### Step 8: `final()` - Generate Final Database

**File:** `src/tasks/final.ts`

**Input:** `NetworksFlatItemType[]` (from all files in `results/3_networks/`)

**Output:** `FinalDBFileType[]`

- **Location:** `results/4_final/ALL.json`
- **Type:** `FinalDBFileType[]` (from `@theWallProject/common`)

**Output Type:**

```typescript
FinalDBFileType {
  id: string
  ws?: string          // website
  li?: string          // linkedin
  fb?: string          // facebook
  tw?: string          // twitter
  ig?: string          // instagram
  gh?: string          // github
  ytp?: string         // youtube profile
  ytc?: string         // youtube channel
  tt?: string          // tiktok
  th?: string          // threads
  r: APIListOfReasons[]  // reasons (abbreviated)
  n: string            // name (abbreviated)
  c?: string           // comment
  s?: string           // stock symbol
  alt?: Array<{        // alternatives
    n: string          // name
    ws: string         // website
  }>
  isHint?: boolean
  hintText?: string
  hintUrl?: string
}
```

**Transformations:**

- Combines all network files by `id`
- Maps `selector` → platform field (e.g., `ws`, `li`, `fb`)
- Maps field names: `name` → `n`, `reasons` → `r`
- Adds alternatives from `static_data/alternatives.json`
- Sorts by name

**Type Comparison: `NetworksFlatItemType` vs `FinalDBFileType`**

| Aspect              | `NetworksFlatItemType` (Input)   | `FinalDBFileType` (Output)                                                     |
| ------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| **Structure**       | One entry per platform/selector  | One entry per company (`id`) with all platforms combined                       |
| **ID Field**        | `id` (company ID)                | `id` (same, used for merging)                                                  |
| **Name Field**      | `name` (full name)               | `n` (abbreviated)                                                              |
| **Reasons Field**   | `reasons` (full name)            | `r` (abbreviated)                                                              |
| **Stock Symbol**    | `s`                              | `s` (same)                                                                     |
| **Selector**        | `selector` (platform identifier) | Not present (becomes platform field value)                                     |
| **Platform Fields** | None (only `selector`)           | `ws`, `li`, `fb`, `tw`, `ig`, `gh`, `ytp`, `ytc`, `tt`, `th` (selector values) |
| **Hint Fields**     | `isHint`, `hintText`, `hintUrl`  | `isHint`, `hintText`, `hintUrl` (preserved)                                    |
| **Alternatives**    | Not present                      | `alt` (added from alternatives.json)                                           |
| **Comment**         | Not present                      | `c` (optional)                                                                 |

**Key Transformations:**

1. **Unflattening**: Multiple platform entries → One company entry
   - Multiple `NetworksFlatItemType` entries with same `id` → One `FinalDBFileType` entry
   - Example: 3 entries (LinkedIn, Facebook, Twitter) with `id: "company123"` → 1 entry with `id: "company123"`, `li: "selector1"`, `fb: "selector2"`, `tw: "selector3"`

2. **Selector → Platform Field Mapping**:
   - `selector: "example"` from `FLAGGED_LI_COMPANY.json` → `li: "example"`
   - `selector: "example"` from `FLAGGED_FACEBOOK.json` → `fb: "example"`
   - `selector: "example_com"` from `WEBSITES.json` → `ws: "example_com"`

3. **Field Name Abbreviation**:
   - `name` → `n`
   - `reasons` → `r`
   - Other fields remain the same or are mapped

4. **Data Enrichment**:
   - Adds `alt` field from `alternatives.json` if available
   - Preserves all hint fields

5. **File Consolidation**:
   - Reads from multiple files (one per platform)
   - Outputs to single `ALL.json` file

---

### Step 9: `generate_android_blacklist()` - Generate Android Blacklist

**File:** `src/tasks/generate_android_blacklist.ts`

**Input:**

- `FinalDBFileType[]` from `results/4_final/ALL.json`
- `manualOverrides` from `manual_resolve/manualOverrides.ts`

**Output:** `BlacklistItem[]`

- **Location:** `android/app/src/main/assets/blacklist.json`
- **Type:** `BlacklistItem[]` (from `@theWallProject/common`)

**Output Type:**

```typescript
BlacklistItem {
  reasonIds: APIListOfReasons[]
  androidDevId?: string
  androidAppIds?: string[]
}
```

**Transformations:**

- Extracts entries with `android_dev_id` or `android_app_ids` from manual overrides
- Looks up reasons from final database by company name
- Validates against `BlacklistSchema`
- Sorts by `androidDevId` or first `androidAppId`

---

### Step 10: `alternatives_report()` - Alternatives Report

**File:** `src/tasks/alternatives_report.ts`

**Input:**

- `MergedDataItem[]` from `results/2_merged/2_MERGED_ALL.json`
- `alternatives` from `static_data/alternatives.json`

**Output:** Console warnings (no file output)

**Purpose:** Reports missing alternatives for top-ranked companies

---

### Step 11: `copy_to_addon()` - Copy to Addon

**File:** `src/tasks/copy_to_addon.ts`

**Input:** All files from `results/4_final/`

**Output:** Files copied to `addon/src/db/`

**Purpose:** Copies final database files to addon package

---

### Step 12: `validate()` - Validate URLs (Optional)

**File:** `src/tasks/validate.ts`

**Input:** `CrunchbaseScrappedItemType[]` from `results/2_merged/1_MERGED_CB.json`

**Output:** `ValidationResult[]`

- **Location:** `results/2_merged/report.json`

**Output Type:**

```typescript
ValidationResult {
  url: string
  result: string | number  // HTTP status code or redirect location
}
```

**Purpose:** Validates URLs by making HTTP requests

---

## Type Duplication Analysis

### Core Type Hierarchy

1. **`CrunchbaseScrappedItemType`** (Crunchbase-specific type)
   - Used in: scrap, merge_cb
   - Contains: name, id, reasons, li, ws, fb, tw, and Crunchbase-specific fields (cbLink, cbRank, estRevenue, industries, etc.)
   - Does NOT include hint fields or Android fields (these are added in MergedDataItem)

2. **`ManualEntryType`** (manual entry type)
   - Used in: gen_static, gen_buyIsraeliTech
   - Contains: name, id, reasons, li, ws, fb, tw, isHint, hintText, hintUrl
   - Does NOT include Crunchbase-specific fields
   - Subset of `CrunchbaseScrappedItemType` (all fields are compatible)

3. **`MergedDataItem`** extends `CrunchbaseScrappedItemType`
   - Adds: ig, gh, ytp, ytc, tt, th (social platforms from manual overrides)
   - Adds: isHint, hintText, hintUrl (hint fields from manual hints data)
   - Adds: android_dev_id, android_app_ids (Android fields from manual overrides)
   - Used in: merge_static (output), extract_social, extract_websites
   - Can be created from both `CrunchbaseScrappedItemType` and `ManualEntryType`
   - Contains all fields from Crunchbase plus all manual data fields

4. **`NetworksFlatItemType`** (flattened structure)
   - Similar to base but with `selector` instead of URL fields
   - Used in: extract_social, extract_websites, final
   - Fields: selector, id, reasons, name, s, isHint, hintText, hintUrl

5. **`FinalDBFileType`** (abbreviated structure)
   - Similar to `NetworksFlatItemType` but with abbreviated field names
   - Used in: final, generate_android_blacklist
   - Defined in: `@theWallProject/common`

### Duplication Issues

1. **`CrunchbaseScrappedItemType` vs `MergedDataItem`**
   - `MergedDataItem` is just an extension with 6 more fields
   - Could be unified with optional fields

2. **`NetworksFlatItemType` vs `FinalDBFileType`**
   - Very similar structure, different field names
   - `NetworksFlatItemType` has `selector`, `name`, `reasons`
   - `FinalDBFileType` has platform fields (`ws`, `li`, etc.), `n`, `r`
   - Could use a mapping function instead of separate types

3. **`CompressedManualItemType` vs `ManualEntryType` vs `CrunchbaseScrappedItemType`**
   - `CompressedManualItemType` uses arrays for URLs (input format)
   - `ManualEntryType` uses single strings (output format for manual entries)
   - `CrunchbaseScrappedItemType` includes Crunchbase-specific fields
   - Conversion from arrays to single strings happens in `gen_static()`

### Recommendations

1. **Unify `CrunchbaseScrappedItemType` and `MergedDataItem`**
   - Make ig, gh, ytp, ytc, tt, th optional in base type
   - Remove `MergedDataItem` type

2. **Create mapping utilities instead of separate types**
   - Keep `NetworksFlatItemType` for intermediate processing
   - Use transformation functions to convert to `FinalDBFileType`
   - Document the mapping clearly

3. **Consider a unified base type**
   - Create a base type with all possible fields
   - Use discriminated unions or optional fields for variations

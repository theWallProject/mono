# The Wall Scraper

A multi-step data scraping and processing pipeline that collects company data from Crunchbase, merges it with static sources, and generates network-based datasets for The Wall addon.

## Prerequisites

- Node.js 21
- npm
- Crunchbase account credentials

## Setup

1. Install dependencies: `npm install`

2. Create `.env` file:

```
EMAIL=your-email@example.com
PASSWORD=your-password
```

3. **Configure Crunchbase Saved Searches**:

Create three saved searches in Crunchbase with these filters:

### 1. HQ in Israel Search

- Geography: Headquarter Location = Israel
- Organization Type: Companies
- Status: Active
- CB Rank (Company): Number input fields for rank filtering
- Rank ranges: 1-60k, 60k-145k, 145k-290k, 290k-440k, 440k-590k, 590k-750k, 750k-920k, 920k-1M, 1M-1.1M, 1.1M-1.3M, 1.3M-1.53M, 1.53M-1.8M, 1.8M-2.05M, 2.05M-2.29M, 2.29M-2.58M, 2.58M-2.85M, 2.85M-3.18M, 3.18M-3.54M, 3.54M-9.99M

### 2. Founders in Israel Search

- People/Founders: Founder Location = Israel
- Organization Type: Companies
- Status: Active
- CB Rank (Company): Number input fields
- Rank ranges: 1-150k, 150k-1.2M, 1.2M-999M

### 3. Investors in Israel (Not Founders) Search

- People/Investors: Investor Location = Israel (founder location ≠ Israel)
- Organization Type: Companies
- Status: Active
- CB Rank (Company): Number input fields
- Rank ranges: 1-50k, 50k-999M

**Note**: Crunchbase limits results to 1000 per query, so the scraper splits searches by rank ranges. Update `cbSearchUrl` in `src/tasks/scrap.ts` with your saved search URLs.

## Pipeline Steps

1. **Scraping** (`scrap.ts`): Scrapes Crunchbase using Puppeteer. Navigates to saved searches, sets rank filters, extracts company data, handles pagination. Output: `results/1_batches/cb/*.json`

2. **Merge CB** (`merge_cb.ts`): Consolidates all CB batches, merges duplicates by `id`, combines `reasons` arrays. Output: `results/2_merged/1_MERGED_CB.json`

3. **Generate Static Data** (`gen_static.ts`, `gen_buyIsraeliTech.ts`): Processes BDS and BuyIsTech data. Output: `results/1_batches/static/*.json`

4. **Merge All** (`merge_static.ts`): Combines CB + static data, deduplicates by website, applies manual overrides, normalizes URLs. Output: `results/2_merged/2_MERGED_ALL.json`

5. **Extract Social** (`extract_social.ts`): Extracts LinkedIn, Facebook, Twitter handles using regex. Output: `results/3_networks/FLAGGED_*.json`

6. **Extract Websites** (`extract_websites.ts`): Extracts domains, filters invalid sites. Output: `results/3_networks/WEBSITES.json`

7. **Generate Final DB** (`final.ts`): Merges network files by `id`, adds alternatives. Output: `results/4_final/ALL.json`

8. **Alternatives Report** (`alternatives_report.ts`): Validates top 10 companies have alternatives. Output: Console warnings

9. **Copy to Addon** (`copy_to_addon.ts`) [Optional]: Copies final files to `../addon/src/db/`

10. **Validate URLs** (`validate.ts`) [Optional]: Validates URLs, reports status codes. Output: `results/2_merged/report.json`

## Usage

```bash
npm run dev
```

Prompts for: Scraping, URL validation, Copy to addon

Other scripts: `npm run merge`, `npm run convert`

## Data Flow

```
1_batches/cb/*.json → 2_merged/1_MERGED_CB.json
                    ↓
1_batches/static/*.json → 2_merged/2_MERGED_ALL.json
                          ↓
                          3_networks/*.json (separate by network type)
                          ↓
                          4_final/ALL.json (unified format)
```

## Data Structures

- **ScrappedItemType**: Full company data (name, id, cbLink, reasons, social links, founderIds, investorIds, cbRank, etc.)
- **APIEndpointDomainsResult**: `{ id, selector, name, reasons, s? }`
- **FinalDBFileType**: `{ id, n, r, s?, ws?, li?, fb?, tw?, alt? }`

## Manual Resolution

Defined in `src/tasks/manual_resolve/duplicate.ts`:

- `manualDeleteIds`: IDs to exclude
- `manualOverrides`: Field overrides by company name

## Notes

- Scraping can be time-consuming; existing batch files are skipped
- Pipeline is resumable
- Manual resolution handles edge cases

## Adding a New Social Media Platform

**Important**: There are two types of platforms:

- **Platforms from Crunchbase** (e.g., LinkedIn, Facebook, Twitter): Extracted automatically from scraped data
- **Platforms only from manual overrides** (e.g., Instagram, GitHub): Only added manually, not scraped from Crunchbase

### Step 1: Common Setup (All Platforms)

1. **`@theWallProject/common`**: Add `API_ENDPOINT_RULE_PLATFORM_NAME` (regex capturing username in group 1), `DBFileNames.FLAGGED_PLATFORM_NAME`, and `platformName?: string` to `FinalDBFileType`
   - Field naming: use short lowercase (e.g., Instagram → `ig`, GitHub → `gh`)

### Step 2: Platform-Specific Setup

#### For Platforms from Crunchbase (LinkedIn, Facebook, Twitter pattern)

2. **`src/types.ts`**:

   - Add `platformName: z.string().optional()` to `ScrappedItemSchema`
   - Add `platformName: z.array(z.string()).optional()` to `ManualItemSchema`

3. **`src/tasks/extract_social.ts`**:

   - Import `API_ENDPOINT_RULE_PLATFORM_NAME` and `DBFileNames.FLAGGED_PLATFORM_NAME`
   - Add extraction logic (follow Facebook/Twitter pattern)
   - Add file output using `DBFileNames.FLAGGED_PLATFORM_NAME`
   - Add log statement

4. **`src/tasks/validate_urls.ts`**:
   - Add `"platformName"` to `validateItemLinks` links array (since it exists on `ScrappedItemType`)

#### For Platforms Only from Manual Overrides (Instagram, GitHub pattern)

2. **`src/types.ts`**:

   - **DO NOT** add to `ScrappedItemSchema` (only in manual overrides)
   - Add `platformName: z.array(z.string()).optional()` to `ManualItemSchema`

3. **`src/tasks/extract_social.ts`**:

   - **SKIP** this step (not extracted from Crunchbase)

4. **`src/tasks/validate_urls.ts`**:
   - **DO NOT** add to `validateItemLinks` links array (field doesn't exist on `ScrappedItemType`)

### Step 3: Common Steps (All Platforms)

5. **`src/tasks/manual_resolve/manualOverrides.ts`**: Add `platformName?: string | string[]` to `ManualOverrideFields` type

6. **`src/tasks/merge_static.ts`**:

   - Import `API_ENDPOINT_RULE_PLATFORM_NAME`
   - Add `"platformName"` to `extractIdentifier` function (add new case)
   - Add `"platformName"` to `linkFields` array
   - Update `ScrappedItemWithOverrides` type to include `platformName?: string`
   - Add `platformName` case to the `setField` helper function
   - Protocol removal is handled automatically via `setField`

7. **`src/tasks/validate_urls.ts`**:

   - Import `API_ENDPOINT_RULE_PLATFORM_NAME`
   - Add `"platformName"` to `LinkField` type
   - Add `platformName?: string[]` to `CategorizedUrls` and `OverrideWithUrls` types
   - Add detection in `categorizeUrl` function
   - Add `platformName` case in `formatValue` function (both processed and unprocessed branches)
   - Update `saveManualOverrides` template to include `platformName` in `ManualOverrideFields`
   - Add `platformName` case in `collectExtraUrls` categorization loop and merging logic
   - Update `ManualOverrideValue` type to include `platformName?: string | string[]`

8. **`src/tasks/final.ts`**: Add case `DBFileNames.FLAGGED_PLATFORM_NAME` returning `"platformName"` in `keyFromFileName` function

9. **Addon (`theWallAddon/src/storage.ts`)**: Add case to `getSelectorKey` function mapping domain to selector key (e.g., `"github.com"` → `"gh"`)

**Checklist**:

- Regex extracts usernames correctly
- Output files created (if platform from Crunchbase)
- Manual override extraction works
- Addon updated
- No linter errors
- No `any` type hacks used

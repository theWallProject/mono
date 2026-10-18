> **⚠️ Existing clones must be re-cloned.**
> This repository's Git history was rewritten to strip ~11 GB of scraper website data (`packages/scrapper/logs/`) that made clones enormous.
> The affected branches were force-pushed, so `git pull`/`fetch` will not work on an old clone — please delete it and clone fresh.

# The Wall Monorepo

Monorepo for The Wall project packages using pnpm workspaces.

## Packages

- **`@theWallProject/common`** - Shared types and utilities
- **`@theWallProject/addon`** - Browser extension (Plasmo framework)
- **`@theWallProject/scrapper`** - Scraper tool for data collection

## Prerequisites

- Node.js >= 18
- pnpm >= 8

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build all packages:

   ```bash
   pnpm build
   ```

   Or build individual packages:

   ```bash
   pnpm --filter @theWallProject/common build
   pnpm --filter @theWallProject/addon build
   pnpm --filter @theWallProject/scrapper build
   ```

## Development

### Common Package

```bash
cd packages/common
pnpm build
pnpm test
```

### Addon Package

```bash
cd packages/addon
pnpm dev
pnpm build
pnpm test        # Run tests
pnpm test:e2e    # Run E2E tests only
```

### Scrapper Package

```bash
cd packages/scrapper
pnpm dev
pnpm build
```

## Workspace Structure

```
.
├── packages/
│   ├── common/      # Shared library
│   ├── addon/       # Browser extension
│   └── scrapper/    # Scraper tool
├── package.json     # Root package.json
└── pnpm-workspace.yaml
```

## Testing

### Addon Package Tests

The addon package includes comprehensive end-to-end tests:

```bash
# Run addon tests from root
pnpm test:addon
pnpm test:addon:e2e
```

Tests use Playwright and Vitest to test all extension functionality in real Chrome instances. See [packages/addon/tests/README.md](packages/addon/tests/README.md) for detailed documentation.

**Note**: Tests require the extension to be built first (`pnpm build:chrome`) and an internet connection for testing real URLs.

## Notes

- All packages use `@theWallProject/*` scope for consistency
- The `common` package is linked as a workspace dependency in `addon` and `scrapper`
- Addon tests require built extension and internet connection

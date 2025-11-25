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
```

### Scrapper Package

```bash
cd packages/scrapper
pnpm dev
pnpm build
```

## Dependency Versions

- TypeScript: `^5.9.3` (aligned across all packages)
- Zod: `^4.1.12` (aligned across all packages)

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

## Notes

- All packages use `@theWallProject/*` scope for consistency
- The `common` package is linked as a workspace dependency in `addon` and `scrapper`
- No `package-lock.json` files in packages (pnpm uses single lock file at root)

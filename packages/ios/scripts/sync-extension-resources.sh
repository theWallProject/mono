#!/bin/bash

# Extension Resource Sync Script
#
# Copies Plasmo build output from addon package to iOS extension bundle
# and applies iOS-specific manifest patches
#
# Usage: ./sync-extension-resources.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ADDON_ROOT="$(cd "$IOS_ROOT/../addon" && pwd)"
SOURCE_DIR="$ADDON_ROOT/build/safari-mv3-prod"
TARGET_DIR="$IOS_ROOT/TheWall/TheWallExtension/Resources"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Extension Resource Sync${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Validate source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}Error: Source directory not found${NC}"
    echo -e "Expected: $SOURCE_DIR"
    echo -e "\nDid you build the Safari extension?"
    echo -e "Run: ${YELLOW}cd $ADDON_ROOT && pnpm run build:safari${NC}"
    exit 1
fi

# Validate manifest.json exists
if [ ! -f "$SOURCE_DIR/manifest.json" ]; then
    echo -e "${RED}Error: manifest.json not found in source directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Source:${NC} $SOURCE_DIR"
echo -e "${YELLOW}Target:${NC} $TARGET_DIR\n"

# Clear target directory (except .gitkeep)
if [ -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}• Cleaning target directory...${NC}"
    find "$TARGET_DIR" -mindepth 1 ! -name '.gitkeep' -delete
    echo -e "${GREEN}✓${NC} Target directory cleaned"
else
    mkdir -p "$TARGET_DIR"
    echo -e "${GREEN}✓${NC} Target directory created"
fi

# Copy all files from source to target (excluding _locales, handled by i18n fallback in JS)
echo -e "${YELLOW}• Copying extension files...${NC}"
rsync -av --exclude='.DS_Store' --exclude='_locales' "$SOURCE_DIR/" "$TARGET_DIR/" > /dev/null
echo -e "${GREEN}✓${NC} Files copied successfully (i18n handled by bundled English fallback)"

# Flatten subdirectories for Xcode compatibility
# Xcode flattens resource directories, so we move nested files to root
echo -e "${YELLOW}• Flattening subdirectories for Xcode...${NC}"
if [ -f "$TARGET_DIR/static/background/index.js" ]; then
    cp "$TARGET_DIR/static/background/index.js" "$TARGET_DIR/background.js"
    rm -rf "$TARGET_DIR/static"
    echo -e "${GREEN}✓${NC} Flattened static/background/index.js -> background.js"
fi

# Flatten tabs/ directory
if [ -d "$TARGET_DIR/tabs" ]; then
    find "$TARGET_DIR/tabs" -type f -exec mv {} "$TARGET_DIR/" \;
    rm -rf "$TARGET_DIR/tabs"
    echo -e "${GREEN}✓${NC} Flattened tabs/ directory"
fi

# Flatten public/ directory
if [ -d "$TARGET_DIR/public" ]; then
    find "$TARGET_DIR/public" -type f -exec mv {} "$TARGET_DIR/" \;
    rm -rf "$TARGET_DIR/public"
    echo -e "${GREEN}✓${NC} Flattened public/ directory"
fi

# Count copied files
FILE_COUNT=$(find "$TARGET_DIR" -type f ! -name '.gitkeep' | wc -l | tr -d ' ')
echo -e "  Files copied: $FILE_COUNT"

# Calculate total size
TOTAL_SIZE=$(du -sh "$TARGET_DIR" | cut -f1)
echo -e "  Total size: $TOTAL_SIZE"

# Apply iOS-specific manifest patches
echo -e "\n${YELLOW}• Applying iOS manifest patches...${NC}"
"$SCRIPT_DIR/patch-manifest.sh" "$TARGET_DIR/manifest.json"

# Verify critical files exist
echo -e "\n${YELLOW}• Verifying extension structure...${NC}"

REQUIRED_FILES=(
    "manifest.json"
    "background.js"
)

MISSING=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$TARGET_DIR/$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (missing)"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -gt 0 ]; then
    echo -e "\n${RED}Error: $MISSING required file(s) missing${NC}"
    exit 1
fi

# Check manifest validity
if ! jq empty "$TARGET_DIR/manifest.json" 2>/dev/null; then
    echo -e "\n${RED}Error: manifest.json is not valid JSON${NC}"
    exit 1
fi

# Display extension info
echo -e "\n${BLUE}Extension Information:${NC}"
EXT_NAME=$(jq -r '.name' "$TARGET_DIR/manifest.json")
EXT_VERSION=$(jq -r '.version' "$TARGET_DIR/manifest.json")
echo -e "  Name: $EXT_NAME"
echo -e "  Version: $EXT_VERSION"

echo -e "\n${GREEN}✓ Extension resources synced successfully${NC}"
echo -e "${BLUE}================================================${NC}\n"

exit 0

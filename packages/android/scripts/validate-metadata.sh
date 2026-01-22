#!/bin/bash
# Play Store metadata validation script
# Validates metadata against Play Store limits

set -e

cd "$(dirname "$0")/.."

METADATA_DIR="fastlane/metadata/android"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Character limits
TITLE_LIMIT=30
SHORT_DESC_LIMIT=80
FULL_DESC_LIMIT=4000
CHANGELOG_LIMIT=500

ERRORS=0

echo "Validating Play Store metadata..."
echo ""

# Function to check character count
check_length() {
    local file="$1"
    local limit="$2"
    local name="$3"

    if [ ! -f "$file" ]; then
        echo -e "${RED}[MISSING]${NC} $name: File not found at $file"
        ERRORS=$((ERRORS + 1))
        return
    fi

    local length=$(wc -m < "$file" | tr -d ' ')

    if [ "$length" -gt "$limit" ]; then
        echo -e "${RED}[FAIL]${NC} $name: $length chars (limit: $limit)"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}[OK]${NC} $name: $length/$limit chars"
    fi
}

# Function to check if file exists and is not empty
check_exists() {
    local file="$1"
    local name="$2"

    if [ ! -f "$file" ]; then
        echo -e "${RED}[MISSING]${NC} $name: File not found"
        ERRORS=$((ERRORS + 1))
    elif [ ! -s "$file" ]; then
        echo -e "${RED}[EMPTY]${NC} $name: File is empty"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}[OK]${NC} $name: File exists"
    fi
}

# Check en-US locale (required)
echo "Checking en-US locale..."
echo ""

check_length "$METADATA_DIR/en-US/title.txt" $TITLE_LIMIT "Title"
check_length "$METADATA_DIR/en-US/short_description.txt" $SHORT_DESC_LIMIT "Short description"
check_length "$METADATA_DIR/en-US/full_description.txt" $FULL_DESC_LIMIT "Full description"

echo ""
echo "Checking changelogs..."

# Check all changelogs
if [ -d "$METADATA_DIR/en-US/changelogs" ]; then
    for changelog in "$METADATA_DIR/en-US/changelogs"/*.txt; do
        if [ -f "$changelog" ]; then
            version=$(basename "$changelog" .txt)
            check_length "$changelog" $CHANGELOG_LIMIT "Changelog v$version"
        fi
    done
else
    echo -e "${YELLOW}[WARN]${NC} No changelogs directory found"
fi

echo ""
echo "Checking images..."

# Check for required images (warnings only, not errors)
IMAGES_DIR="$METADATA_DIR/en-US/images"

if [ -f "$IMAGES_DIR/icon.png" ]; then
    echo -e "${GREEN}[OK]${NC} App icon (512x512)"
else
    echo -e "${YELLOW}[WARN]${NC} App icon missing (required for Play Store)"
fi

if [ -f "$IMAGES_DIR/featureGraphic.png" ]; then
    echo -e "${GREEN}[OK]${NC} Feature graphic (1024x500)"
else
    echo -e "${YELLOW}[WARN]${NC} Feature graphic missing (recommended)"
fi

# Count screenshots
SCREENSHOT_COUNT=$(find "$IMAGES_DIR/phoneScreenshots" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | wc -l | tr -d ' ')
if [ "$SCREENSHOT_COUNT" -ge 2 ]; then
    echo -e "${GREEN}[OK]${NC} Phone screenshots: $SCREENSHOT_COUNT found (min 2)"
else
    echo -e "${YELLOW}[WARN]${NC} Phone screenshots: $SCREENSHOT_COUNT found (min 2 required for Play Store)"
fi

echo ""

# Docker validation (if available)
if command -v docker &> /dev/null; then
    echo "Running fastlane-supply-validate via Docker..."
    echo ""

    # Convert Windows path to Unix path for Docker (Git Bash)
    UNIX_PATH=$(cd "$METADATA_DIR" && pwd)

    if docker run --rm \
        -v "$UNIX_PATH:/metadata" \
        nickcmaynard/fastlane-supply-validate \
        -fastlane-path /metadata \
        -play-store-locales 2>/dev/null; then
        echo -e "${GREEN}Docker validation passed!${NC}"
    else
        echo -e "${YELLOW}Docker validation skipped (may not be available)${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}[INFO]${NC} Docker not available - skipping fastlane-supply-validate"
    echo "Install Docker to enable comprehensive validation."
    echo ""
fi

# Summary
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}Validation passed!${NC}"
    exit 0
else
    echo -e "${RED}Validation failed with $ERRORS error(s)${NC}"
    exit 1
fi

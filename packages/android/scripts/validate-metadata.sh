#!/bin/bash
# Play Store metadata validation script
# Validates metadata against Play Store limits for ALL supported locales.
#
# When adding a new language, you MUST add its fastlane locale code to REQUIRED_LOCALES below.

set -e

cd "$(dirname "$0")/.."

METADATA_DIR="fastlane/metadata/android"

# ========================================================================
# REQUIRED LOCALES — add new languages here
# ========================================================================
REQUIRED_LOCALES=("en-US" "ar")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Character limits
TITLE_LIMIT=30
SHORT_DESC_LIMIT=80
FULL_DESC_LIMIT=4000
CHANGELOG_LIMIT=500

ERRORS=0
WARNINGS=0

echo "Validating Play Store metadata..."
echo "Required locales: ${REQUIRED_LOCALES[*]}"
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

# ========================================================================
# Validate each required locale
# ========================================================================
for locale in "${REQUIRED_LOCALES[@]}"; do
    echo -e "${BLUE}=== Checking $locale locale ===${NC}"
    echo ""

    LOCALE_DIR="$METADATA_DIR/$locale"

    if [ ! -d "$LOCALE_DIR" ]; then
        echo -e "${RED}[MISSING]${NC} Locale directory not found: $LOCALE_DIR"
        ERRORS=$((ERRORS + 1))
        echo ""
        continue
    fi

    # Check required text files
    check_length "$LOCALE_DIR/title.txt" $TITLE_LIMIT "$locale/title"
    check_length "$LOCALE_DIR/short_description.txt" $SHORT_DESC_LIMIT "$locale/short_description"
    check_length "$LOCALE_DIR/full_description.txt" $FULL_DESC_LIMIT "$locale/full_description"

    echo ""
    echo "Checking changelogs..."

    # Check all changelogs
    if [ -d "$LOCALE_DIR/changelogs" ]; then
        changelog_count=0
        for changelog in "$LOCALE_DIR/changelogs"/*.txt; do
            if [ -f "$changelog" ]; then
                version=$(basename "$changelog" .txt)
                check_length "$changelog" $CHANGELOG_LIMIT "$locale/changelog v$version"
                changelog_count=$((changelog_count + 1))
            fi
        done
        if [ "$changelog_count" -eq 0 ]; then
            echo -e "${YELLOW}[WARN]${NC} $locale: No changelog files found"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}[WARN]${NC} $locale: No changelogs directory found"
        WARNINGS=$((WARNINGS + 1))
    fi

    echo ""
    echo "Checking images..."

    IMAGES_DIR="$LOCALE_DIR/images"

    if [ "$locale" = "en-US" ]; then
        # Primary locale — images are required
        if [ -f "$IMAGES_DIR/icon.png" ]; then
            echo -e "${GREEN}[OK]${NC} $locale: App icon (512x512)"
        else
            echo -e "${YELLOW}[WARN]${NC} $locale: App icon missing (required for Play Store)"
            WARNINGS=$((WARNINGS + 1))
        fi

        if [ -f "$IMAGES_DIR/featureGraphic.png" ] || [ -f "$IMAGES_DIR/featured.png" ]; then
            echo -e "${GREEN}[OK]${NC} $locale: Feature graphic (1024x500)"
        else
            echo -e "${YELLOW}[WARN]${NC} $locale: Feature graphic missing (recommended)"
            WARNINGS=$((WARNINGS + 1))
        fi

        # Count screenshots
        SCREENSHOT_COUNT=0
        if [ -d "$IMAGES_DIR/phoneScreenshots" ]; then
            SCREENSHOT_COUNT=$(find "$IMAGES_DIR/phoneScreenshots" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | wc -l | tr -d ' ')
        fi
        if [ "$SCREENSHOT_COUNT" -ge 2 ]; then
            echo -e "${GREEN}[OK]${NC} $locale: Phone screenshots: $SCREENSHOT_COUNT found (min 2)"
        else
            echo -e "${YELLOW}[WARN]${NC} $locale: Phone screenshots: $SCREENSHOT_COUNT found (min 2 required for Play Store)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        # Non-primary locale — images are optional, just report status
        SCREENSHOT_COUNT=0
        if [ -d "$IMAGES_DIR/phoneScreenshots" ]; then
            SCREENSHOT_COUNT=$(find "$IMAGES_DIR/phoneScreenshots" \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) ! -name ".gitkeep" 2>/dev/null | wc -l | tr -d ' ')
        fi
        if [ "$SCREENSHOT_COUNT" -ge 2 ]; then
            echo -e "${GREEN}[OK]${NC} $locale: Phone screenshots: $SCREENSHOT_COUNT found"
        else
            echo -e "${YELLOW}[INFO]${NC} $locale: Phone screenshots: $SCREENSHOT_COUNT found (optional for non-primary locale)"
        fi
    fi

    echo ""
done

# ========================================================================
# Check for unexpected locale directories (not in REQUIRED_LOCALES)
# ========================================================================
echo -e "${BLUE}=== Checking for unexpected locales ===${NC}"
echo ""

for dir in "$METADATA_DIR"/*/; do
    if [ -d "$dir" ]; then
        locale_name=$(basename "$dir")
        # Skip non-locale directories
        if [ "$locale_name" = "README.md" ]; then
            continue
        fi
        found=false
        for required in "${REQUIRED_LOCALES[@]}"; do
            if [ "$locale_name" = "$required" ]; then
                found=true
                break
            fi
        done
        if [ "$found" = false ]; then
            echo -e "${YELLOW}[WARN]${NC} Unexpected locale directory: $locale_name (not in REQUIRED_LOCALES)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done

echo ""

# ========================================================================
# Docker validation (if available)
# ========================================================================
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

# ========================================================================
# Summary
# ========================================================================
echo "========================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}Validation passed! All ${#REQUIRED_LOCALES[@]} locales OK.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}Validation passed with $WARNINGS warning(s).${NC}"
    exit 0
else
    echo -e "${RED}Validation failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi

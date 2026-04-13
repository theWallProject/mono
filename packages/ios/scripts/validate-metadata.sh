#!/bin/bash

# App Store Metadata Validation Script
#
# Verifies all required metadata files exist for App Store submission
#
# Usage: ./validate-metadata.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
METADATA_DIR="$PROJECT_ROOT/fastlane/metadata"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  App Store Metadata Validation${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Required locales
LOCALES=("en-US" "ar")

# Required files per locale
REQUIRED_FILES=(
    "name.txt"
    "subtitle.txt"
    "description.txt"
    "keywords.txt"
    "privacy_url.txt"
)

MISSING=0
WARNINGS=0

for locale in "${LOCALES[@]}"; do
    echo -e "${YELLOW}Checking $locale locale...${NC}"

    LOCALE_DIR="$METADATA_DIR/$locale"

    if [ ! -d "$LOCALE_DIR" ]; then
        echo -e "${RED}✗${NC} Locale directory missing: $locale"
        MISSING=$((MISSING + 1))
        continue
    fi

    for file in "${REQUIRED_FILES[@]}"; do
        FILE_PATH="$LOCALE_DIR/$file"

        if [ ! -f "$FILE_PATH" ]; then
            echo -e "${RED}✗${NC} Missing: $file"
            MISSING=$((MISSING + 1))
        else
            # Check if file is empty
            if [ ! -s "$FILE_PATH" ]; then
                echo -e "${YELLOW}⚠${NC} Empty: $file"
                WARNINGS=$((WARNINGS + 1))
            else
                # Validate specific files
                case "$file" in
                    name.txt)
                        LENGTH=$(wc -c < "$FILE_PATH" | tr -d ' ')
                        if [ "$LENGTH" -gt 30 ]; then
                            echo -e "${YELLOW}⚠${NC} name.txt too long ($LENGTH > 30 chars)"
                            WARNINGS=$((WARNINGS + 1))
                        else
                            echo -e "${GREEN}✓${NC} $file ($LENGTH chars)"
                        fi
                        ;;

                    subtitle.txt)
                        LENGTH=$(wc -c < "$FILE_PATH" | tr -d ' ')
                        if [ "$LENGTH" -gt 30 ]; then
                            echo -e "${YELLOW}⚠${NC} subtitle.txt too long ($LENGTH > 30 chars)"
                            WARNINGS=$((WARNINGS + 1))
                        else
                            echo -e "${GREEN}✓${NC} $file ($LENGTH chars)"
                        fi
                        ;;

                    description.txt)
                        LENGTH=$(wc -c < "$FILE_PATH" | tr -d ' ')
                        if [ "$LENGTH" -gt 4000 ]; then
                            echo -e "${YELLOW}⚠${NC} description.txt too long ($LENGTH > 4000 chars)"
                            WARNINGS=$((WARNINGS + 1))
                        else
                            echo -e "${GREEN}✓${NC} $file ($LENGTH chars)"
                        fi
                        ;;

                    keywords.txt)
                        LENGTH=$(wc -c < "$FILE_PATH" | tr -d ' ')
                        if [ "$LENGTH" -gt 100 ]; then
                            echo -e "${YELLOW}⚠${NC} keywords.txt too long ($LENGTH > 100 chars)"
                            WARNINGS=$((WARNINGS + 1))
                        else
                            echo -e "${GREEN}✓${NC} $file ($LENGTH chars)"
                        fi
                        ;;

                    *)
                        echo -e "${GREEN}✓${NC} $file"
                        ;;
                esac
            fi
        fi
    done

    echo ""
done

# Summary
echo -e "${BLUE}================================================${NC}"
if [ $MISSING -gt 0 ]; then
    echo -e "${RED}✗ Validation failed: $MISSING required file(s) missing${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Validation passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${GREEN}✓ All metadata files present and valid${NC}"
    exit 0
fi

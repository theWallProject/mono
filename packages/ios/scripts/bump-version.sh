#!/bin/bash

# Version Bump Script
#
# Updates version numbers in Xcode project and package.json
# Uses agvtool for Xcode project versioning
#
# Usage: ./bump-version.sh <version>
# Example: ./bump-version.sh 1.2.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No version provided${NC}"
    echo "Usage: $0 <version>"
    echo "Example: $0 1.2.0"
    exit 1
fi

NEW_VERSION="$1"

# Validate semantic version format
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid version format${NC}"
    echo "Expected format: X.Y.Z (e.g., 1.2.0)"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PACKAGE_JSON="$PROJECT_ROOT/package.json"
PROJECT="$PROJECT_ROOT/TheWall.xcodeproj"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Version Bump${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check if project exists
if [ ! -d "$PROJECT" ]; then
    echo -e "${RED}Error: Xcode project not found${NC}"
    echo -e "Run: ${YELLOW}pnpm run generate-project${NC}"
    exit 1
fi

# Get current version
if [ -f "$PACKAGE_JSON" ]; then
    CURRENT_VERSION=$(jq -r '.version' "$PACKAGE_JSON")
    echo -e "Current version: ${YELLOW}$CURRENT_VERSION${NC}"
fi
echo -e "New version:     ${GREEN}$NEW_VERSION${NC}\n"

# Update MARKETING_VERSION in Xcode project
echo -e "${YELLOW}• Updating Xcode project version...${NC}"
cd "$PROJECT_ROOT"

# Use agvtool to set marketing version
xcrun agvtool new-marketing-version "$NEW_VERSION"
echo -e "${GREEN}✓${NC} MARKETING_VERSION set to $NEW_VERSION"

# Increment build number
CURRENT_BUILD=$(xcrun agvtool what-version -terse)
NEW_BUILD=$((CURRENT_BUILD + 1))
xcrun agvtool new-version -all "$NEW_BUILD"
echo -e "${GREEN}✓${NC} CURRENT_PROJECT_VERSION incremented to $NEW_BUILD"

# Update package.json
if [ -f "$PACKAGE_JSON" ]; then
    echo -e "\n${YELLOW}• Updating package.json...${NC}"

    # Use jq to update version
    jq ".version = \"$NEW_VERSION\"" "$PACKAGE_JSON" > "${PACKAGE_JSON}.tmp"
    mv "${PACKAGE_JSON}.tmp" "$PACKAGE_JSON"

    echo -e "${GREEN}✓${NC} package.json updated"
fi

echo -e "\n${GREEN}✓ Version bump complete${NC}"
echo -e "  Version: $NEW_VERSION"
echo -e "  Build:   $NEW_BUILD"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Commit changes: ${BLUE}git add . && git commit -m \"chore(ios): bump version to $NEW_VERSION\"${NC}"
echo -e "  2. Tag release: ${BLUE}git tag ios/v$NEW_VERSION${NC}"
echo -e "  3. Push: ${BLUE}git push && git push --tags${NC}"

echo -e "\n${BLUE}================================================${NC}\n"

exit 0

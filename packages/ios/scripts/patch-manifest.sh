#!/bin/bash

# Safari Manifest Patching Script for iOS Compatibility
#
# This script addresses iOS Safari constraints:
# 1. Service worker termination (30-60s on iOS 17, ~1 day on iOS 18)
# 2. Transforms service_worker to scripts array with persistent: false
#
# Usage: ./patch-manifest.sh path/to/manifest.json

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No manifest path provided${NC}"
    echo "Usage: $0 path/to/manifest.json"
    exit 1
fi

MANIFEST="$1"

# Validate manifest exists
if [ ! -f "$MANIFEST" ]; then
    echo -e "${RED}Error: Manifest file not found: $MANIFEST${NC}"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed${NC}"
    echo "Install with: brew install jq"
    exit 1
fi

echo -e "${YELLOW}Patching manifest for iOS Safari compatibility...${NC}"

# Backup original manifest
cp "$MANIFEST" "${MANIFEST}.backup"
echo -e "${GREEN}✓${NC} Created backup: ${MANIFEST}.backup"

# 1. Transform service_worker to scripts array with persistent: false
# Use flattened path (background.js at root) since Xcode flattens directories
echo -e "${YELLOW}• Setting background scripts to flattened path${NC}"

jq '.background = {
    "scripts": ["background.js"],
    "persistent": false
}' "$MANIFEST" > "${MANIFEST}.tmp"

mv "${MANIFEST}.tmp" "$MANIFEST"
echo -e "${GREEN}✓${NC} Set background to non-persistent scripts (background.js)"

# 2. Ensure manifest_version is 3 (Safari supports MV3 on iOS 17+)
MANIFEST_VERSION=$(jq -r '.manifest_version' "$MANIFEST")
if [ "$MANIFEST_VERSION" != "3" ]; then
    echo -e "${RED}⚠${NC} Warning: manifest_version is $MANIFEST_VERSION (expected 3)"
fi

# 3. Validate critical permissions exist
echo -e "${YELLOW}• Validating permissions${NC}"

PERMISSIONS=$(jq -r '.permissions[]' "$MANIFEST" 2>/dev/null || echo "")
if ! echo "$PERMISSIONS" | grep -q "storage"; then
    echo -e "${RED}⚠${NC} Warning: 'storage' permission missing"
fi

# 4. Verify host_permissions for all_urls (required for overlay injection)
HOST_PERMS=$(jq -r '.host_permissions[]' "$MANIFEST" 2>/dev/null || echo "")
if ! echo "$HOST_PERMS" | grep -q "<all_urls>"; then
    echo -e "${RED}⚠${NC} Warning: '<all_urls>' host permission missing"
fi

# 5. Add host_permissions for MV3 (required for content script injection)
echo -e "${YELLOW}• Adding host_permissions for content script injection${NC}"

# Check if host_permissions already exists
if ! jq -e '.host_permissions' "$MANIFEST" > /dev/null 2>&1; then
    jq '.host_permissions = ["<all_urls>"]' "$MANIFEST" > "${MANIFEST}.tmp"
    mv "${MANIFEST}.tmp" "$MANIFEST"
    echo -e "${GREEN}✓${NC} Added host_permissions for <all_urls>"
else
    echo -e "${GREEN}✓${NC} host_permissions already present"
fi

# 6. Fix localization for iOS (_locales excluded, i18n fallback handles translations in JS)
echo -e "${YELLOW}• Fixing localization for iOS${NC}"

# Remove default_locale since _locales is excluded from iOS bundle
jq 'del(.default_locale)' "$MANIFEST" > "${MANIFEST}.tmp"
mv "${MANIFEST}.tmp" "$MANIFEST"

# Replace __MSG_*__ placeholders with actual text
jq '.name = "The Wall" | .description = "Boycott assistance for ethical consumers"' "$MANIFEST" > "${MANIFEST}.tmp"
mv "${MANIFEST}.tmp" "$MANIFEST"

echo -e "${GREEN}✓${NC} Set static name/description (i18n handled by JS fallback)"

# 7. Fix web_accessible_resources for flattened directory structure
echo -e "${YELLOW}• Fixing web_accessible_resources for flat structure${NC}"

# Remove the public/**/*.* resource entry (no public/ directory after flattening)
jq '.web_accessible_resources = [.web_accessible_resources[] | select(.resources | all(startswith("public/") | not))]' "$MANIFEST" > "${MANIFEST}.tmp"
mv "${MANIFEST}.tmp" "$MANIFEST"
echo -e "${GREEN}✓${NC} Removed public/ references from web_accessible_resources"

# 8. Display final background configuration
echo -e "\n${GREEN}Final background configuration:${NC}"
jq '.background' "$MANIFEST"

echo -e "\n${GREEN}✓ Manifest patched successfully${NC}"
echo -e "Original saved to: ${MANIFEST}.backup"

exit 0

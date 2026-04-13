#!/bin/bash

# The Wall iOS Release Script
#
# Builds, tests, and uploads the iOS app to TestFlight or App Store
#
# Usage:
#   ./release.sh beta      # Upload to TestFlight
#   ./release.sh release   # Upload to App Store Connect

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RELEASE_TYPE="${1:-beta}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  The Wall iOS Release${NC}"
echo -e "${BLUE}  Type: $RELEASE_TYPE${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Step 1: Validate metadata
echo -e "${YELLOW}Step 1/6: Validating App Store metadata...${NC}"
bash "$SCRIPT_DIR/validate-metadata.sh"
echo -e "${GREEN}✓${NC} Metadata validated\n"

# Step 2: Build Safari extension
echo -e "${YELLOW}Step 2/6: Building Safari extension...${NC}"
cd "$PROJECT_ROOT/../addon"
pnpm run build:safari
echo -e "${GREEN}✓${NC} Safari extension built\n"

# Step 3: Sync extension resources
echo -e "${YELLOW}Step 3/6: Syncing extension resources...${NC}"
cd "$PROJECT_ROOT"
bash "$SCRIPT_DIR/sync-extension-resources.sh"
echo -e "${GREEN}✓${NC} Extension resources synced\n"

# Step 4: Generate Xcode project
echo -e "${YELLOW}Step 4/6: Generating Xcode project...${NC}"
if command -v xcodegen &> /dev/null; then
    xcodegen generate
    echo -e "${GREEN}✓${NC} Xcode project generated\n"
else
    echo -e "${RED}⚠${NC} xcodegen not found, skipping (project may already exist)\n"
fi

# Step 5: Run tests
echo -e "${YELLOW}Step 5/6: Running tests...${NC}"
xcodebuild test \
    -scheme TheWall \
    -destination 'platform=iOS Simulator,name=iPhone 15' \
    -quiet || {
    echo -e "${RED}✗${NC} Tests failed"
    exit 1
}
echo -e "${GREEN}✓${NC} All tests passed\n"

# Step 6: Upload via Fastlane
echo -e "${YELLOW}Step 6/6: Uploading to App Store Connect...${NC}"
cd fastlane

case "$RELEASE_TYPE" in
    beta)
        fastlane beta
        echo -e "\n${GREEN}✓ Beta build uploaded to TestFlight!${NC}"
        echo -e "${BLUE}Check TestFlight at: https://appstoreconnect.apple.com/apps${NC}"
        ;;

    release)
        fastlane release
        echo -e "\n${GREEN}✓ Release build uploaded to App Store Connect!${NC}"
        echo -e "${YELLOW}⚠  Remember to manually submit for review in App Store Connect${NC}"
        echo -e "${BLUE}App Store Connect: https://appstoreconnect.apple.com/apps${NC}"
        ;;

    *)
        echo -e "${RED}Error: Unknown release type '$RELEASE_TYPE'${NC}"
        echo "Usage: $0 [beta|release]"
        exit 1
        ;;
esac

echo -e "\n${BLUE}================================================${NC}"
echo -e "${GREEN}Release process complete!${NC}"
echo -e "${BLUE}================================================${NC}\n"

exit 0

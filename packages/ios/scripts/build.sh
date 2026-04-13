#!/bin/bash

# Xcode Build Wrapper Script
#
# Provides convenient commands for building the iOS app
#
# Usage:
#   ./build.sh [clean|debug|release|archive]
#   Default: debug

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCHEME="TheWall"
WORKSPACE="$PROJECT_ROOT/TheWall.xcworkspace"
PROJECT="$PROJECT_ROOT/TheWall.xcodeproj"

# Determine build configuration
BUILD_TYPE="${1:-debug}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  The Wall iOS Build${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check if Xcode project exists
if [ ! -d "$PROJECT" ] && [ ! -d "$WORKSPACE" ]; then
    echo -e "${RED}Error: Xcode project not found${NC}"
    echo -e "Run: ${YELLOW}pnpm run generate-project${NC}"
    exit 1
fi

# Determine project/workspace flag
if [ -d "$WORKSPACE" ]; then
    PROJECT_FLAG="-workspace $WORKSPACE"
else
    PROJECT_FLAG="-project $PROJECT"
fi

case "$BUILD_TYPE" in
    clean)
        echo -e "${YELLOW}• Cleaning build artifacts...${NC}"
        xcodebuild clean $PROJECT_FLAG -scheme "$SCHEME" | xcpretty || true
        rm -rf "$PROJECT_ROOT/build" "$PROJECT_ROOT/DerivedData"
        echo -e "${GREEN}✓ Clean complete${NC}"
        ;;

    debug)
        echo -e "${YELLOW}• Building for Debug configuration...${NC}"
        xcodebuild build \
            $PROJECT_FLAG \
            -scheme "$SCHEME" \
            -configuration Debug \
            -destination 'generic/platform=iOS Simulator' \
            CODE_SIGN_IDENTITY="" \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGNING_ALLOWED=NO | xcpretty

        echo -e "\n${GREEN}✓ Debug build complete${NC}"
        ;;

    release)
        echo -e "${YELLOW}• Building for Release configuration...${NC}"
        xcodebuild build \
            $PROJECT_FLAG \
            -scheme "$SCHEME" \
            -configuration Release \
            -destination 'generic/platform=iOS' \
            -allowProvisioningUpdates | xcpretty

        echo -e "\n${GREEN}✓ Release build complete${NC}"
        ;;

    archive)
        echo -e "${YELLOW}• Creating archive...${NC}"

        ARCHIVE_PATH="$PROJECT_ROOT/build/TheWall.xcarchive"
        mkdir -p "$PROJECT_ROOT/build"

        xcodebuild archive \
            $PROJECT_FLAG \
            -scheme "$SCHEME" \
            -configuration Release \
            -archivePath "$ARCHIVE_PATH" \
            -allowProvisioningUpdates | xcpretty

        echo -e "\n${GREEN}✓ Archive created${NC}"
        echo -e "  Path: $ARCHIVE_PATH"
        ;;

    *)
        echo -e "${RED}Error: Unknown build type '$BUILD_TYPE'${NC}"
        echo "Usage: $0 [clean|debug|release|archive]"
        exit 1
        ;;
esac

echo -e "${BLUE}================================================${NC}\n"

exit 0

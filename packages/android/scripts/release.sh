#!/bin/bash
# Release build script for The Wall Android app
# Usage: release.sh [--bump patch|minor|major]

set -e

cd "$(dirname "$0")/.."

SCRIPT_DIR="$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Set JAVA_HOME if not already set (MUST be done first)
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/c/Program Files/Android/Android Studio/jbr" ]; then
        export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
    elif [ -d "$HOME/Library/Android/sdk/../Android Studio.app/Contents/jbr/Contents/Home" ]; then
        export JAVA_HOME="$HOME/Library/Android/sdk/../Android Studio.app/Contents/jbr/Contents/Home"
    fi
fi

# Verify JAVA_HOME is set
if [ -z "$JAVA_HOME" ]; then
    echo -e "${RED}Error: JAVA_HOME is not set and could not be auto-detected${NC}"
    echo ""
    echo "Please set JAVA_HOME to your JDK location, e.g.:"
    echo "  export JAVA_HOME=\"/c/Program Files/Android/Android Studio/jbr\""
    echo ""
    exit 1
fi

echo "========================================"
echo "  The Wall Android - Release Build"
echo "========================================"
echo ""
echo "Using JAVA_HOME: $JAVA_HOME"
echo ""

# Parse arguments
BUMP_TYPE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --bump)
            BUMP_TYPE="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: release.sh [--bump patch|minor|major]"
            exit 1
            ;;
    esac
done

# Check for keystore configuration
if [ ! -f "keystore.properties" ]; then
    echo -e "${RED}Error: keystore.properties not found${NC}"
    echo ""
    echo "To create a release build, you need to set up signing:"
    echo "  1. Generate a keystore (see keystore.properties.template)"
    echo "  2. Copy keystore.properties.template to keystore.properties"
    echo "  3. Fill in your keystore details"
    echo ""
    exit 1
fi

# Verify keystore file exists
STORE_FILE=$(grep "storeFile" keystore.properties | cut -d'=' -f2)
if [ ! -f "$STORE_FILE" ]; then
    echo -e "${RED}Error: Keystore file not found at: $STORE_FILE${NC}"
    echo "Please check your keystore.properties configuration."
    exit 1
fi

# Bump version if requested
if [ -n "$BUMP_TYPE" ]; then
    echo -e "${YELLOW}Bumping version ($BUMP_TYPE)...${NC}"
    bash "$SCRIPT_DIR/bump-version.sh" "$BUMP_TYPE"
    echo ""
fi

# Read current version
VERSION_NAME=$(grep "VERSION_NAME" version.properties | cut -d'=' -f2)
VERSION_CODE=$(grep "VERSION_CODE" version.properties | cut -d'=' -f2)

echo "Building release v$VERSION_NAME (code: $VERSION_CODE)"
echo ""

# Validate metadata if script exists
if [ -f "$SCRIPT_DIR/validate-metadata.sh" ]; then
    echo -e "${YELLOW}Validating Play Store metadata...${NC}"
    if bash "$SCRIPT_DIR/validate-metadata.sh"; then
        echo -e "${GREEN}Metadata validation passed!${NC}"
    else
        echo -e "${RED}Metadata validation failed. Fix issues before releasing.${NC}"
        exit 1
    fi
    echo ""
fi

# Clean build
echo -e "${YELLOW}Cleaning previous build...${NC}"
./gradlew clean
echo ""

# Build release AAB (required for Play Store) and APK
echo -e "${YELLOW}Building release AAB and APK...${NC}"
./gradlew bundleRelease assembleRelease
echo ""

# Create output directory
mkdir -p release-output

# Find and copy the AAB
AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
APK_PATH="app/build/outputs/apk/release/app-release.apk"

if [ -f "$AAB_PATH" ]; then
    AAB_OUTPUT="thewall-v${VERSION_NAME}.aab"
    cp "$AAB_PATH" "release-output/$AAB_OUTPUT"

    echo -e "${GREEN}========================================"
    echo "  Release build successful!"
    echo "========================================"
    echo ""
    echo "  Version: v$VERSION_NAME (code: $VERSION_CODE)"
    echo ""
    echo "  AAB (for Play Store):"
    AAB_SIZE=$(du -h "release-output/$AAB_OUTPUT" | cut -f1)
    echo "    release-output/$AAB_OUTPUT ($AAB_SIZE)"

    # Also copy APK for testing
    if [ -f "$APK_PATH" ]; then
        APK_OUTPUT="thewall-v${VERSION_NAME}.apk"
        cp "$APK_PATH" "release-output/$APK_OUTPUT"
        APK_SIZE=$(du -h "release-output/$APK_OUTPUT" | cut -f1)
        echo ""
        echo "  APK (for testing/sideloading):"
        echo "    release-output/$APK_OUTPUT ($APK_SIZE)"
    fi
    echo -e "${NC}"
else
    echo -e "${RED}Error: Release AAB not found at $AAB_PATH${NC}"
    exit 1
fi

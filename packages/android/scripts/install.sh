#!/bin/bash
# Install release APK to connected device via USB
# Usage: install.sh

set -e

cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find adb - check common locations
ADB_CMD=""
if command -v adb &> /dev/null; then
    ADB_CMD="adb"
elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
    ADB_CMD="$ANDROID_HOME/platform-tools/adb"
elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/platform-tools/adb.exe" ]; then
    ADB_CMD="$ANDROID_HOME/platform-tools/adb.exe"
elif [ -f "$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe" ]; then
    ADB_CMD="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
elif [ -f "$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe" ]; then
    ADB_CMD="$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe"
elif [ -f "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    ADB_CMD="$HOME/Library/Android/sdk/platform-tools/adb"
elif [ -f "$HOME/Android/Sdk/platform-tools/adb" ]; then
    ADB_CMD="$HOME/Android/Sdk/platform-tools/adb"
fi

if [ -z "$ADB_CMD" ]; then
    echo -e "${RED}Error: adb not found${NC}"
    echo ""
    echo "Set ANDROID_HOME or add platform-tools to PATH."
    exit 1
fi

# Read current version
if [ ! -f "version.properties" ]; then
    echo -e "${RED}Error: version.properties not found${NC}"
    exit 1
fi

VERSION_NAME=$(grep "VERSION_NAME" version.properties | cut -d'=' -f2)
APK_PATH="release-output/thewall-v${VERSION_NAME}.apk"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}Error: APK not found at $APK_PATH${NC}"
    echo ""
    echo "Run 'pnpm release' first to build the release APK."
    exit 1
fi

# Check for connected device
DEVICE_COUNT=$("$ADB_CMD" devices | grep -v "List" | grep -v "^$" | wc -l)
if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo -e "${RED}Error: No device connected${NC}"
    echo ""
    echo "Connect your device via USB and enable USB debugging."
    exit 1
fi

echo -e "${YELLOW}Installing thewall-v${VERSION_NAME}.apk...${NC}"
echo ""

# Install with replacement flag
"$ADB_CMD" install -r "$APK_PATH"

echo ""
echo -e "${GREEN}Installed successfully!${NC}"

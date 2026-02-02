#!/bin/bash
# Automated screenshot capture script for The Wall Android app
# Installs latest APK, navigates through screens, and captures screenshots
#
# Usage:
#   screenshots.sh               - Run on all emulators (phone + tablet)
#   screenshots.sh --phone-only  - Run only on phone emulator
#   screenshots.sh --tablet-only - Run only on tablet emulator
#   screenshots.sh list          - List available emulators

set -e

cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directories
PHONE_DIR="fastlane/metadata/android/en-US/images/phoneScreenshots"
TABLET_DIR="fastlane/metadata/android/en-US/images/tabletScreenshots"

# App package
PACKAGE="com.thewallboycott.android"
ACTIVITY="$PACKAGE/.MainActivity"

# Detect ADB
if command -v adb &> /dev/null; then
    ADB="adb"
elif [ -f "$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe" ]; then
    ADB="$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe"
elif [ -f "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    ADB="$HOME/Library/Android/sdk/platform-tools/adb"
else
    echo -e "${RED}Error: ADB not found${NC}"
    exit 1
fi

get_emulators() {
    "$ADB" devices | grep -E "emulator-[0-9]+" | cut -f1
}

get_emulator_name() {
    "$ADB" -s "$1" emu avd name 2>/dev/null | head -1 | tr -d '\r' || echo "unknown"
}

is_tablet() {
    local width=$("$ADB" -s "$1" shell wm size | grep -oE "[0-9]+x[0-9]+" | cut -dx -f1)
    [ "$width" -ge 1200 ] 2>/dev/null
}

take_screenshot() {
    local device=$1
    local output=$2
    "$ADB" -s "$device" exec-out screencap -p > "$output"
    echo -e "${GREEN}  ✓ $output${NC}"
}

# Get screen dimensions
get_screen_size() {
    local device=$1
    "$ADB" -s "$device" shell wm size | grep -oE "[0-9]+x[0-9]+"
}

# Tap at percentage of screen (more reliable than text search for Compose UI)
tap_percent() {
    local device=$1
    local pct_x=$2
    local pct_y=$3
    local size=$(get_screen_size "$device")
    local w=$(echo "$size" | cut -dx -f1)
    local h=$(echo "$size" | cut -dx -f2)
    local x=$((w * pct_x / 100))
    local y=$((h * pct_y / 100))
    "$ADB" -s "$device" shell input tap "$x" "$y"
    echo -e "${CYAN}  → Tap at ($x, $y)${NC}"
}

wait_for_scan() {
    local device=$1
    echo -e "${CYAN}  ⏳ Waiting for scan (max 10s)...${NC}"
    sleep 10
    echo -e "${GREEN}  ✓ Done${NC}"
}

capture_screenshots() {
    local device=$1
    local dir=$2
    local type=$3

    echo ""
    echo -e "${YELLOW}━━━ $type ($device) ━━━${NC}"

    mkdir -p "$dir"

    # Reset and launch
    "$ADB" -s "$device" shell pm clear "$PACKAGE" > /dev/null 2>&1 || true
    "$ADB" -s "$device" shell am start -n "$ACTIVITY" > /dev/null 2>&1

    # Wait for app to fully load (tablet needs more time)
    if [ "$type" = "Tablet" ]; then
        echo -e "${CYAN}  ⏳ Waiting for tablet to load...${NC}"
        sleep 12
    else
        sleep 8
    fi

    # 1: Start screen with "Scan Installed Apps" button
    echo -e "${CYAN}1: Start Screen${NC}"
    sleep 3
    take_screenshot "$device" "$dir/1.png"

    # Tap "Scan Installed Apps" button (centered, roughly 65% down the screen)
    local size=$(get_screen_size "$device")
    local w=$(echo "$size" | cut -dx -f1)
    local h=$(echo "$size" | cut -dx -f2)
    # Handle portrait/landscape - use the smaller dimension as width
    if [ "$w" -gt "$h" ]; then
        # wm reports landscape but display is portrait - swap
        local scan_x=$((h / 2))
        local scan_y=$((w * 65 / 100))
    else
        # Portrait
        local scan_x=$((w / 2))
        local scan_y=$((h * 65 / 100))
    fi
    "$ADB" -s "$device" shell input tap "$scan_x" "$scan_y"
    echo -e "${CYAN}  → Tap 'Scan Installed Apps' at ($scan_x, $scan_y)${NC}"
    sleep 15  # Wait for scan to complete

    # 2: Results
    echo -e "${CYAN}2: Scan Results${NC}"
    sleep 2
    take_screenshot "$device" "$dir/2.png"

    # Navigate to Lookup via bottom nav (center tab)
    # Handle portrait/landscape orientation
    if [ "$w" -gt "$h" ]; then
        # Landscape reported but portrait display
        local lookup_x=$((h / 2))
        local lookup_y=$((w - 80))
    else
        # Portrait
        local lookup_x=$((w / 2))
        local lookup_y=$((h - 80))
    fi
    "$ADB" -s "$device" shell input tap "$lookup_x" "$lookup_y"
    echo -e "${CYAN}  → Tap Lookup at ($lookup_x, $lookup_y)${NC}"
    sleep 3

    # 3: URL Lookup
    echo -e "${CYAN}3: URL Lookup${NC}"
    sleep 1
    take_screenshot "$device" "$dir/3.png"

    echo -e "${GREEN}✓ $type done${NC}"
}

# Parse args
PHONE_ONLY=false
TABLET_ONLY=false

case "$1" in
    list)
        echo "Emulators:"
        for emu in $(get_emulators); do
            name=$(get_emulator_name "$emu")
            etype="phone"
            is_tablet "$emu" && etype="tablet"
            echo "  $emu ($name) [$etype]"
        done
        exit 0
        ;;
    --phone-only) PHONE_ONLY=true ;;
    --tablet-only) TABLET_ONLY=true ;;
    --help|-h)
        echo "Usage: screenshots.sh [--phone-only|--tablet-only|list]"
        exit 0
        ;;
esac

echo "========================================"
echo "  Screenshot Capture"
echo "========================================"

APK="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK" ]; then
    echo -e "${YELLOW}Building APK...${NC}"
    # Set JAVA_HOME
    if [ -z "$JAVA_HOME" ]; then
        [ -d "/c/Program Files/Android/Android Studio/jbr" ] && export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
    fi
    ./gradlew assembleDebug
fi

if [ ! -f "$APK" ]; then
    echo -e "${RED}APK not found. Run 'pnpm build' first.${NC}"
    exit 1
fi

# Get emulators
emulators=($(get_emulators))
if [ ${#emulators[@]} -eq 0 ]; then
    echo -e "${RED}No emulators running${NC}"
    exit 1
fi

# Auto-detect phone/tablet
phone=""
tablet=""
for emu in "${emulators[@]}"; do
    if is_tablet "$emu"; then
        [ -z "$tablet" ] && tablet="$emu"
    else
        [ -z "$phone" ] && phone="$emu"
    fi
done

echo -e "${CYAN}Phone: $phone, Tablet: $tablet${NC}"

# Install
for emu in "${emulators[@]}"; do
    echo -e "${CYAN}Installing on $emu...${NC}"
    "$ADB" -s "$emu" install -r "$APK" > /dev/null 2>&1
done

# Capture
if [ "$TABLET_ONLY" != true ] && [ -n "$phone" ]; then
    capture_screenshots "$phone" "$PHONE_DIR" "Phone"
fi

if [ "$PHONE_ONLY" != true ] && [ -n "$tablet" ]; then
    capture_screenshots "$tablet" "$TABLET_DIR" "Tablet"
fi

echo ""
echo -e "${GREEN}========================================"
echo "  Done!"
echo "========================================${NC}"

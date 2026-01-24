#!/bin/bash
# ADB utility script for The Wall Android app

# Set JAVA_HOME if not already set (Windows default)
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/c/Program Files/Android/Android Studio/jbr" ]; then
        export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
    elif [ -d "$HOME/Library/Android/sdk/../Android Studio.app/Contents/jbr/Contents/Home" ]; then
        # macOS fallback
        export JAVA_HOME="$HOME/Library/Android/sdk/../Android Studio.app/Contents/jbr/Contents/Home"
    fi
fi

# Detect ADB path
if command -v adb &> /dev/null; then
    ADB="adb"
elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
    ADB="$ANDROID_HOME/platform-tools/adb"
elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/platform-tools/adb.exe" ]; then
    ADB="$ANDROID_HOME/platform-tools/adb.exe"
elif [ -f "$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe" ]; then
    # Windows default SDK location
    ADB="$HOME/AppData/Local/Android/Sdk/platform-tools/adb.exe"
elif [ -f "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    # macOS default SDK location
    ADB="$HOME/Library/Android/sdk/platform-tools/adb"
else
    echo "Error: ADB not found. Please install Android SDK platform-tools or set ANDROID_HOME."
    exit 1
fi

PACKAGE="com.thewallboycott.android"

# Commands
case "$1" in
    trigger_scan)
        echo "Triggering background scan worker..."
        "$ADB" shell am start -n "$PACKAGE/.MainActivity" --es "TRIGGER_SCAN" "true"
        echo "Done. Watch for notification."
        ;;

    install)
        echo "Installing debug APK..."
        "$ADB" install -r app/build/outputs/apk/debug/app-debug.apk
        ;;

    uninstall)
        echo "Uninstalling app..."
        "$ADB" uninstall "$PACKAGE"
        ;;

    logcat)
        echo "Showing app logs (Ctrl+C to stop)..."
        "$ADB" logcat -v time "$PACKAGE:V" ScanWorker:V *:S
        ;;

    clear_data)
        echo "Clearing app data..."
        "$ADB" shell pm clear "$PACKAGE"
        ;;

    *)
        echo "The Wall ADB Utility"
        echo ""
        echo "Usage: bash scripts/adb.sh <command>"
        echo ""
        echo "Commands:"
        echo "  trigger_scan   - Trigger background scan (for testing foreground service)"
        echo "  install        - Install debug APK"
        echo "  uninstall      - Uninstall app"
        echo "  logcat         - Show app logs"
        echo "  clear_data     - Clear app data"
        exit 1
        ;;
esac

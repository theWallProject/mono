#!/bin/bash
# Android build script with JAVA_HOME fallback for Windows (Android Studio JBR)

# Set JAVA_HOME if not already set (Windows default)
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/c/Program Files/Android/Android Studio/jbr" ]; then
        export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
    elif [ -d "$HOME/Library/Android/sdk/../Android Studio.app/Contents/jbr/Contents/Home" ]; then
        # macOS fallback
        export JAVA_HOME="$HOME/Library/Android/sdk/../Android Studio.app/Contents/jbr/Contents/Home"
    fi
fi

# Run gradle with the provided arguments
./gradlew "$@"

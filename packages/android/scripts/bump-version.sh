#!/bin/bash
# Version bump script for The Wall Android app
# Usage: bump-version.sh [patch|minor|major]

set -e

cd "$(dirname "$0")/.."

VERSION_FILE="version.properties"

if [ ! -f "$VERSION_FILE" ]; then
    echo "Error: $VERSION_FILE not found"
    exit 1
fi

# Read current version
CURRENT_CODE=$(grep "VERSION_CODE" "$VERSION_FILE" | cut -d'=' -f2)
CURRENT_NAME=$(grep "VERSION_NAME" "$VERSION_FILE" | cut -d'=' -f2)

# Parse semantic version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_NAME"

BUMP_TYPE="${1:-patch}"

case "$BUMP_TYPE" in
    patch)
        PATCH=$((PATCH + 1))
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    *)
        echo "Usage: bump-version.sh [patch|minor|major]"
        echo "  patch: 1.0.0 -> 1.0.1 (default)"
        echo "  minor: 1.0.0 -> 1.1.0"
        echo "  major: 1.0.0 -> 2.0.0"
        exit 1
        ;;
esac

# Calculate new values
NEW_CODE=$((CURRENT_CODE + 1))
NEW_NAME="${MAJOR}.${MINOR}.${PATCH}"

echo "Bumping version:"
echo "  VERSION_CODE: $CURRENT_CODE -> $NEW_CODE"
echo "  VERSION_NAME: $CURRENT_NAME -> $NEW_NAME"

# Update version.properties
cat > "$VERSION_FILE" << EOF
# App Version Configuration
# This file is read by build.gradle.kts to set versionCode and versionName
# Use pnpm release:patch/minor/major to automatically bump versions

VERSION_CODE=$NEW_CODE
VERSION_NAME=$NEW_NAME
EOF

echo "Version updated successfully!"
echo ""
echo "New version: v$NEW_NAME (code: $NEW_CODE)"

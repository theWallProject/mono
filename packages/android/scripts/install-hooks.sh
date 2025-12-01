#!/bin/sh
# This script installs the pre-commit hook from the scripts directory
# into the .git/hooks directory.

# Navigate to the root of the Git repository
GIT_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$GIT_ROOT/.git/hooks"
PRE_COMMIT_HOOK_SRC="$GIT_ROOT/packages/android/scripts/pre-commit.sh"
PRE_COMMIT_HOOK_DEST="$HOOKS_DIR/pre-commit"

echo "Installing pre-commit hook..."

# Create the hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Copy the pre-commit script to the hooks directory
cp "$PRE_COMMIT_HOOK_SRC" "$PRE_COMMIT_HOOK_DEST"

# Make the script executable
chmod +x "$PRE_COMMIT_HOOK_DEST"

echo "✅ Pre-commit hook installed successfully."
echo "You can now commit your changes. The hook will run automatically."

exit 0

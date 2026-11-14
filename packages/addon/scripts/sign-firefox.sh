#!/bin/bash
# Signs the Firefox build with Mozilla so it can be installed on Android Firefox.
#
# Android Firefox only accepts add-ons signed by Mozilla — there is no override for
# unsigned XPIs, not even on Nightly. `web-ext sign --channel=unlisted` returns a signed
# XPI for self-distribution in a few minutes, without publishing it on AMO.
#
# Get API credentials (free) at https://addons.mozilla.org/developers/addon/api/key/
# and export them first:
#
#   export AMO_JWT_ISSUER=user:12345:678
#   export AMO_JWT_SECRET=abcdef...
#
# Usage: ./scripts/sign-firefox.sh

set -euo pipefail

cd "$(dirname "$0")/.."

SOURCE_DIR="build/firefox-mv2-prod"
ARTIFACTS_DIR="build/amo"
SOURCE_ARCHIVE="build/firefox.zip"

if [ -z "${AMO_JWT_ISSUER:-}" ] || [ -z "${AMO_JWT_SECRET:-}" ]; then
  echo "Error: AMO_JWT_ISSUER and AMO_JWT_SECRET must both be set." >&2
  echo "Create them at https://addons.mozilla.org/developers/addon/api/key/" >&2
  exit 1
fi

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: $SOURCE_DIR not found. Run: pnpm exec plasmo build --target=firefox-mv2" >&2
  exit 1
fi

# AMO requires human-readable source when the submitted bundle is minified, and this build
# always is. The archive is regenerated here so it cannot drift from the bundle.
if [ ! -f "$SOURCE_ARCHIVE" ]; then
  echo "Regenerating source archive..."
  node build-scripts/ff-src.js
fi

mkdir -p "$ARTIFACTS_DIR"

echo "Signing $SOURCE_DIR (unlisted)..."
npx web-ext sign \
  --channel=unlisted \
  --api-key="$AMO_JWT_ISSUER" \
  --api-secret="$AMO_JWT_SECRET" \
  --source-dir="$SOURCE_DIR" \
  --artifacts-dir="$ARTIFACTS_DIR" \
  --upload-source-code="$SOURCE_ARCHIVE"

echo
echo "Signed XPI(s):"
ls -la "$ARTIFACTS_DIR"/*.xpi

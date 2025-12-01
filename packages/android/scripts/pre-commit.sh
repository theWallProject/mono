#!/bin/sh

echo "Running pre-commit checks..."

# Run the Gradle task from the android subdirectory
./gradlew :app:lintDebug

# Get the exit code of the Gradle task
status=$?

# If the exit code is not 0, abort the commit
if [ "$status" -ne 0 ]; then
    echo "❌ Lint checks failed. Aborting commit."
    exit 1
fi

echo "✅ All checks passed. Proceeding with commit."
exit 0

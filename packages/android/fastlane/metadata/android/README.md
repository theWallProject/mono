# Play Store Metadata

This directory contains Play Store listing metadata in fastlane format.

## Directory Structure

```
en-US/
├── title.txt              # App title (max 30 chars)
├── short_description.txt  # Short description (max 80 chars)
├── full_description.txt   # Full description (max 4000 chars)
├── changelogs/
│   └── {versionCode}.txt  # Changelog per versionCode (max 500 chars)
└── images/
    ├── icon.png           # App icon (512x512)
    ├── featureGraphic.png # Feature graphic (1024x500)
    └── phoneScreenshots/  # Phone screenshots (min 2)
```

## Character Limits

| Field                   | Max Characters |
| ----------------------- | -------------- |
| Title                   | 30             |
| Short description       | 80             |
| Full description        | 4,000          |
| Changelog (per version) | 500            |

## Updating Metadata

1. Edit the appropriate text file
2. Run `pnpm validate:metadata` to verify limits
3. Commit changes

## Adding Changelogs

For each new release, create a new file named `{versionCode}.txt` in the `changelogs` directory. The versionCode should match the value in `version.properties`.

## Images Required

Before publishing to Play Store, add these images:

- **icon.png** (512x512): High-res app icon
- **featureGraphic.png** (1024x500): Feature graphic for store listing
- **phoneScreenshots/**: At least 2 phone screenshots

## Validation

Run `pnpm validate:metadata` to check all metadata meets Play Store requirements.

The validation uses [fastlane-supply-validate](https://github.com/nickcmaynard/fastlane-supply-validate) via Docker.

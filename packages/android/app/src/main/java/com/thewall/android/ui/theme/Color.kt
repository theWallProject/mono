package com.thewall.android.ui.theme

import androidx.compose.ui.graphics.Color

// =============================================================================
// Brand Colors
// =============================================================================
val WallPrimary = Color(0xFFB72B00)           // Main brand color - burnt orange
val WallPrimaryDark = Color(0xFF932300)       // Pressed states, borders
val WallPrimaryContainer = Color(0xFF3D1A12)  // Dark tinted error containers
val WallOnPrimaryContainer = Color(0xFFFFB4A1) // Text on error containers

// =============================================================================
// Success Colors (Green)
// =============================================================================
val WallSecondary = Color(0xFF1A8754)          // Success states, "Install" buttons
val WallSecondaryContainer = Color(0xFF172D1F) // Dark success containers
val WallOnSecondaryContainer = Color(0xFF8BDFB3) // Text on success containers
val WallSuccessAccent = Color(0xFF4CAF50)      // Icons on dark success cards

// Legacy aliases for compatibility
val WallGreen = WallSecondary
val WallGreenDark = Color(0xFF146C43)

// =============================================================================
// Warning Colors (Amber)
// =============================================================================
val WallTertiary = Color(0xFFE6A700)            // Warning states
val WallTertiaryContainer = Color(0xFF2D2617)  // Dark warning containers
val WallOnTertiaryContainer = Color(0xFFFFE082) // Text on warning containers
val WallWarningAccent = Color(0xFFFFD54F)      // Icons on dark warning cards

// Legacy aliases for compatibility
val WallOrange = WallTertiary
val WallOrangeDark = Color(0xFFE69500)

// =============================================================================
// Hint/Info Colors (Blue)
// =============================================================================
val WallInfo = Color(0xFF4FC3F7)               // Info/hint states
val WallInfoContainer = Color(0xFF172A33)      // Dark hint containers
val WallOnInfoContainer = Color(0xFFB3E5FC)    // Text on hint containers
val WallHintAccent = Color(0xFF4FC3F7)         // Icons on dark hint cards

// =============================================================================
// Surface Colors
// =============================================================================
val WallBackground = Color(0xFF0F0F0F)         // App background
val WallSurface = Color(0xFF1A1A1A)            // Cards, sheets
val WallSurfaceVariant = Color(0xFF242424)     // Elevated surfaces, inputs
val WallOnSurface = Color(0xFFFFFFFF)          // Primary text
val WallOnSurfaceVariant = Color(0xFFB3B3B3)   // Secondary text
val WallOutline = Color(0xFF404040)            // Borders, dividers

// =============================================================================
// Text Colors
// =============================================================================
val WallTextOnPrimary = Color(0xFFFFFFFF)      // White text on primary
val WallTextSecondary = Color(0xFFFFE1CD)      // Signature peach accent

// =============================================================================
// Badge/Accent Colors
// =============================================================================
val WallBadgeBg = Color(0xFFFFE1CD)            // Light mode badges
val WallBadgeText = Color(0xFF932300)          // Text on light badges
val WallBadgeBgDark = Color(0xFF3D2E26)        // Dark mode badges

// =============================================================================
// Status Card Colors (Dark Mode)
// =============================================================================

// Error (Caught) - Dark red tinted
val WallErrorContainer = Color(0xFF2D1A17)     // Dark error card background
val WallErrorAccent = Color(0xFFFF6B4D)        // Error icon/title color
val WallOnErrorContainer = Color(0xFFFFB4A1)   // Error body text

// Warning - Dark amber tinted
val WallWarningContainer = Color(0xFF2D2617)   // Dark warning card background
// WallWarningAccent already defined above
val WallOnWarningContainer = Color(0xFFFFE082) // Warning body text

// Success - Dark green tinted
val WallSuccessContainer = Color(0xFF172D1F)   // Dark success card background
// WallSuccessAccent already defined above
val WallOnSuccessContainer = Color(0xFF8BDFB3) // Success body text

// Hint - Dark blue tinted
val WallHintContainer = Color(0xFF172A33)      // Dark hint card background
// WallHintAccent already defined above
val WallOnHintContainer = Color(0xFFB3E5FC)    // Hint body text

// Neutral - Elevated surface
val WallNeutralContainer = Color(0xFF242424)   // Neutral card background
val WallNeutralAccent = Color(0xFFB3B3B3)      // Neutral icon color
val WallOnNeutralContainer = Color(0xFFB3B3B3) // Neutral body text

// =============================================================================
// Legacy Status Background Colors (kept for reference, prefer dark containers)
// =============================================================================
val WallErrorBg = WallErrorContainer           // Now uses dark container
val WallWarningBg = WallWarningContainer       // Now uses dark container
val WallSuccessBg = WallSuccessContainer       // Now uses dark container
val WallHintBg = WallHintContainer             // Now uses dark container

// =============================================================================
// Legacy Text Colors (kept for compatibility, prefer new semantic colors)
// =============================================================================
val WallTextDark = Color(0xFF000000)           // DEPRECATED: Use WallOnSurface for dark mode
val WallTextDarkSecondary = Color(0xDE000000)  // DEPRECATED: Use WallOnSurfaceVariant for dark mode

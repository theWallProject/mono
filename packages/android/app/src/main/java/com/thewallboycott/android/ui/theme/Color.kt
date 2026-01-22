package com.thewallboycott.android.ui.theme

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
// Hint Colors (Golden Yellow - alternatives/suggestions)
// =============================================================================
val WallInfo = Color(0xFFF9A825)               // Info/hint states - golden yellow
val WallInfoContainer = Color(0xFFFFFDE7)      // Light yellow containers
val WallOnInfoContainer = Color(0xFF5D4E37)    // Warm brown text on hint containers
val WallHintAccent = Color(0xFFF9A825)         // Golden yellow accent for hints

// =============================================================================
// Surface Colors (Light theme with white backgrounds)
// =============================================================================
val WallBackground = Color(0xFFFFFFFF)         // White app background
val WallSurface = Color(0xFFFFFFFF)            // White cards, sheets
val WallSurfaceVariant = Color(0xFFF5F5F5)     // Light gray elevated surfaces
val WallSurfaceDark = Color(0xFF932300)        // Dark orange surface (TopAppBar, menus)
val WallOnSurface = Color(0xFF1A1A1A)          // Dark text on white
val WallOnSurfaceVariant = Color(0xFF666666)   // Secondary text
val WallOutline = Color(0xFFE0E0E0)            // Light borders, dividers

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
// Status Card Colors (Light Mode)
// =============================================================================

// Error (Israeli Apps) - Bright red
val WallErrorContainer = Color(0xFFFFEBEE)     // Light red card background
val WallErrorAccent = Color(0xFFD32F2F)        // Bright red accent for titles
val WallOnErrorContainer = Color(0xFF5D4037)   // Brown body text

// Warning - Light amber tinted
val WallWarningContainer = Color(0xFFFFF8E1)   // Light amber card background
// WallWarningAccent already defined above
val WallOnWarningContainer = Color(0xFF5D4037) // Brown body text

// Success - Light green tinted
val WallSuccessContainer = Color(0xFFE8F5E9)   // Light green card background
// WallSuccessAccent already defined above
val WallOnSuccessContainer = Color(0xFF2E7D32) // Green body text

// Hint - Light yellow/golden (alternatives/suggestions)
val WallHintContainer = Color(0xFFFFFDE7)      // Light yellow hint card background
// WallHintAccent already defined above
val WallOnHintContainer = Color(0xFF5D4E37)    // Warm brown body text

// Neutral/Safe - Light elevated surface
val WallNeutralContainer = Color(0xFFF5F5F5)   // Light gray card background
val WallNeutralAccent = Color(0xFF4CAF50)      // Green for safe apps
val WallOnNeutralContainer = Color(0xFF666666) // Gray body text

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

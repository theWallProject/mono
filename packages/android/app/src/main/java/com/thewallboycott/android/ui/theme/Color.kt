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
// Success Colors (Green) - Unified to single green palette
// =============================================================================
val WallSecondary = Color(0xFF2E7D32)          // Primary green - buttons, success states
val WallSecondaryContainer = Color(0xFFE8F5E9) // Light green containers
val WallOnSecondaryContainer = Color(0xFF1B5E20) // Dark green text on containers
val WallSuccessAccent = Color(0xFF2E7D32)      // Unified green accent (was #4CAF50)

// Legacy aliases for compatibility
val WallGreen = WallSecondary
val WallGreenDark = Color(0xFF1B5E20)

// =============================================================================
// Warning/Error Colors (Unified Dark Red - matches brand)
// =============================================================================
val WallTertiary = WallPrimary                  // Unified to brand color
val WallTertiaryContainer = Color(0xFFFFEDE9)   // Light tinted container (matches error)
val WallOnTertiaryContainer = Color(0xFF5D4037) // Brown body text
val WallWarningAccent = WallPrimary             // Unified to brand dark red

// Legacy aliases for compatibility
val WallOrange = WallTertiary
val WallOrangeDark = WallPrimaryDark

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

// Error/Warning (Israeli Apps) - Unified dark red (brand color)
val WallErrorContainer = Color(0xFFFFEDE9)     // Light tinted red card background
val WallErrorAccent = WallPrimary              // Brand dark red for titles
val WallOnErrorContainer = Color(0xFF5D4037)   // Brown body text

// Warning - Same as Error (unified)
val WallWarningContainer = WallErrorContainer  // Same as error container
val WallOnWarningContainer = WallOnErrorContainer // Same as error text

// Success - Light green tinted
val WallSuccessContainer = Color(0xFFE8F5E9)   // Light green card background
// WallSuccessAccent already defined above (0xFF2E7D32)
val WallOnSuccessContainer = Color(0xFF1B5E20) // Darker green body text

// Hint - Light yellow/golden (alternatives/suggestions)
val WallHintContainer = Color(0xFFFFFDE7)      // Light yellow hint card background
// WallHintAccent already defined above
val WallOnHintContainer = Color(0xFF5D4E37)    // Warm brown body text

// BDS - Lighter red (On the BDS List)
val WallBdsContainer = Color(0xFFFCE4EC)       // Very light pink/red BDS card background
val WallBdsAccent = Color(0xFFE57373)          // Lighter red accent for BDS titles
val WallOnBdsContainer = Color(0xFF5D4037)     // Brown body text

// Neutral/Safe - Light elevated surface
val WallNeutralContainer = Color(0xFFF5F5F5)   // Light gray card background
val WallNeutralAccent = Color(0xFF388E3C)      // Slightly different green for safe apps
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

package com.thewall.android.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val WallLightColorScheme = lightColorScheme(
    // Primary (Brand - Burnt Orange)
    primary = WallPrimary,
    onPrimary = WallTextOnPrimary,
    primaryContainer = WallPrimaryContainer,
    onPrimaryContainer = WallOnPrimaryContainer,

    // Secondary (Success - Green)
    secondary = WallSecondary,
    onSecondary = WallTextOnPrimary,
    secondaryContainer = WallSecondaryContainer,
    onSecondaryContainer = WallOnSecondaryContainer,

    // Tertiary (Warning - Amber)
    tertiary = WallTertiary,
    onTertiary = WallTextOnPrimary,
    tertiaryContainer = WallTertiaryContainer,
    onTertiaryContainer = WallOnTertiaryContainer,

    // Error (uses brand primary for consistency)
    error = WallPrimary,
    onError = WallTextOnPrimary,
    errorContainer = WallErrorContainer,
    onErrorContainer = WallOnErrorContainer,

    // Background & Surface (White)
    background = WallBackground,
    onBackground = WallOnSurface,
    surface = WallSurface,
    onSurface = WallOnSurface,
    surfaceVariant = WallSurfaceVariant,
    onSurfaceVariant = WallOnSurfaceVariant,

    // Outline
    outline = WallOutline,
    outlineVariant = WallOutline.copy(alpha = 0.5f)
)

@Composable
fun TheWallBoycottAssistantTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = WallLightColorScheme,
        typography = Typography,
        content = content
    )
}

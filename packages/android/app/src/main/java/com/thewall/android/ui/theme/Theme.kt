package com.thewall.android.ui.theme

import android.os.Build
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val WallDarkColorScheme = darkColorScheme(
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
    onTertiary = WallBackground,
    tertiaryContainer = WallTertiaryContainer,
    onTertiaryContainer = WallOnTertiaryContainer,

    // Error (uses brand primary for consistency)
    error = WallPrimary,
    onError = WallTextOnPrimary,
    errorContainer = WallErrorContainer,
    onErrorContainer = WallOnErrorContainer,

    // Background & Surface
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
    // Disable dynamic color to use consistent brand colors
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            dynamicDarkColorScheme(context)
        }
        else -> WallDarkColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

package com.thewall.android.ui.theme

import android.os.Build
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val WallDarkColorScheme = darkColorScheme(
    primary = WallPrimary,
    onPrimary = WallTextOnPrimary,
    primaryContainer = WallPrimaryDark,
    onPrimaryContainer = WallTextSecondary,
    secondary = WallGreen,
    onSecondary = WallTextOnPrimary,
    secondaryContainer = WallGreenDark,
    onSecondaryContainer = WallTextOnPrimary,
    tertiary = WallOrange,
    onTertiary = WallTextDark,
    tertiaryContainer = WallOrangeDark,
    onTertiaryContainer = WallTextOnPrimary,
    error = WallPrimary,
    onError = WallTextOnPrimary,
    errorContainer = WallErrorBg,
    onErrorContainer = WallPrimaryDark,
    background = WallBackground,
    onBackground = WallTextOnPrimary,
    surface = WallSurface,
    onSurface = WallTextOnPrimary,
    surfaceVariant = WallSurfaceVariant,
    onSurfaceVariant = WallTextSecondary,
    outline = WallPrimary.copy(alpha = 0.5f)
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

package com.thewallboycott.android.ui.screens

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.thewallboycott.android.R
import com.thewallboycott.android.data.AppPreferences
import com.thewallboycott.android.data.AppPreferences.SupportedLanguage
import com.thewallboycott.android.ui.theme.WallBackground
import com.thewallboycott.android.ui.theme.WallOnSurface
import com.thewallboycott.android.ui.theme.WallOnSurfaceVariant
import com.thewallboycott.android.ui.theme.WallPrimary
import com.thewallboycott.android.ui.theme.WallSurfaceVariant

/**
 * Settings screen with language switcher.
 *
 * Displays a list of supported languages as selectable options within a card.
 * The first option is always "System Default" which resolves to the best matching
 * supported language based on the device locale. Selecting a language immediately
 * applies it via AppCompat's per-app locale API, which recreates the activity.
 *
 * Design matches the existing card-based layout pattern used in SupportScreen.
 */
@Composable
fun SettingsScreen() {
    val context = LocalContext.current
    val activity = context.findActivity()
    val appPreferences = remember { AppPreferences(context) }
    val scrollState = rememberScrollState()

    // Read LocalConfiguration so this composable recomposes whenever the
    // system configuration changes (locale, layout direction, etc.).
    // This is the key fix: without it, a configuration change delivered via
    // onConfigurationChanged (instead of activity recreation) would update
    // RTL layout direction but leave stringResource() calls returning stale
    // values from the previous locale.
    @Suppress("UNUSED_VARIABLE")
    val configuration = LocalConfiguration.current

    val storedTag = appPreferences.getStoredLanguageTag()
    val isSystemDefault = storedTag.isEmpty()
    val resolvedSystemLanguage = appPreferences.resolveSystemLanguage()

    val canScrollDown by remember {
        derivedStateOf {
            scrollState.value < scrollState.maxValue
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(16.dp)
        ) {
            // Section header
            Text(
                text = stringResource(R.string.settings_language),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = WallOnSurface,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            // Language options card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = WallSurfaceVariant)
            ) {
                Column {
                    // System Default option
                    LanguageOptionRow(
                        title = stringResource(R.string.settings_system_default),
                        subtitle = stringResource(
                            R.string.settings_system_resolved,
                            resolvedSystemLanguage.nativeName
                        ),
                        icon = { SystemDefaultIcon() },
                        isSelected = isSystemDefault,
                        onClick = { appPreferences.setLanguage("", activity) }
                    )

                    HorizontalDivider(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        color = WallOnSurfaceVariant.copy(alpha = 0.12f)
                    )

                    // Individual language options
                    SupportedLanguage.entries.forEachIndexed { index, language ->
                        LanguageOptionRow(
                            title = language.nativeName,
                            subtitle = if (language.nativeName != language.englishName) {
                                language.englishName
                            } else {
                                null
                            },
                            icon = null,
                            isSelected = !isSystemDefault && storedTag == language.tag,
                            onClick = { appPreferences.setLanguage(language.tag, activity) }
                        )

                        // Divider between language options (not after the last one)
                        if (index < SupportedLanguage.entries.size - 1) {
                            HorizontalDivider(
                                modifier = Modifier.padding(horizontal = 16.dp),
                                color = WallOnSurfaceVariant.copy(alpha = 0.12f)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Info card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = WallSurfaceVariant.copy(alpha = 0.5f)
                )
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Start
                ) {
                    Icon(
                        Icons.Default.Info,
                        contentDescription = null,
                        tint = WallOnSurfaceVariant,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = stringResource(R.string.settings_language_info),
                        style = MaterialTheme.typography.bodySmall,
                        color = WallOnSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }

        // Scroll indicator - fade gradient at bottom when more content available
        if (canScrollDown) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .height(40.dp)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Transparent,
                                WallBackground
                            )
                        )
                    )
            )
        }
    }
}

/**
 * A single selectable language option row within the language card.
 *
 * @param title Primary label (native language name)
 * @param subtitle Secondary label (English name, or resolved language for system default)
 * @param icon Optional leading icon composable (used for System Default)
 * @param isSelected Whether this option is currently active
 * @param onClick Callback when this option is tapped
 */
@Composable
private fun LanguageOptionRow(
    title: String,
    subtitle: String?,
    icon: (@Composable () -> Unit)?,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Optional leading icon
        if (icon != null) {
            icon()
            Spacer(modifier = Modifier.width(12.dp))
        }

        // Text labels
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                color = if (isSelected) WallPrimary else WallOnSurface
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = WallOnSurfaceVariant
                )
            }
        }

        // Radio button
        RadioButton(
            selected = isSelected,
            onClick = onClick,
            colors = RadioButtonDefaults.colors(
                selectedColor = WallPrimary,
                unselectedColor = WallOnSurfaceVariant
            )
        )
    }
}

/** Globe icon used for the System Default language option. */
@Composable
private fun SystemDefaultIcon() {
    Icon(
        Icons.Default.Language,
        contentDescription = null,
        tint = WallOnSurfaceVariant,
        modifier = Modifier.size(24.dp)
    )
}

/**
 * Walk the [ContextWrapper] chain to find the hosting [Activity].
 * Returns null when called from a non-Activity context (e.g. a Service or test).
 */
private fun Context.findActivity(): Activity? {
    var ctx = this
    while (ctx is ContextWrapper) {
        if (ctx is Activity) return ctx
        ctx = ctx.baseContext
    }
    return null
}

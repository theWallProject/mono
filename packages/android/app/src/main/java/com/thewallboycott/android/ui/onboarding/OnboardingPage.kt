package com.thewallboycott.android.ui.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.thewallboycott.android.ui.theme.WallOnSurface
import com.thewallboycott.android.ui.theme.WallOnSurfaceVariant

/**
 * Reusable onboarding page layout.
 * Provides consistent structure for headline, body text, and visual content.
 */
@Composable
fun OnboardingPage(
    headline: String,
    body: String,
    modifier: Modifier = Modifier,
    visual: @Composable () -> Unit = {},
    footer: @Composable () -> Unit = {}
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Visual content (icon, animation, etc.)
        visual()

        Spacer(modifier = Modifier.height(32.dp))

        // Headline
        Text(
            text = headline,
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.Bold
            ),
            color = WallOnSurface,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Body text
        Text(
            text = body,
            style = MaterialTheme.typography.bodyLarge,
            color = WallOnSurfaceVariant,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Footer content (buttons, badges, etc.)
        footer()
    }
}

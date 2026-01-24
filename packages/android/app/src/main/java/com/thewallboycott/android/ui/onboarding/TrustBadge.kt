package com.thewallboycott.android.ui.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.thewallboycott.android.ui.theme.WallOnSurfaceVariant
import com.thewallboycott.android.ui.theme.WallPrimary

/**
 * Trust badge with icon and label.
 * Used in onboarding to highlight key features.
 */
@Composable
fun TrustBadge(
    icon: ImageVector,
    label: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            modifier = Modifier.size(24.dp),
            tint = WallPrimary
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = WallOnSurfaceVariant
        )
    }
}

package com.thewallboycott.android.ui.onboarding

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.thewallboycott.android.ui.theme.WallOutline
import com.thewallboycott.android.ui.theme.WallPrimary

/**
 * Dot indicator for horizontal pager.
 * Shows current page position with animated transitions.
 */
@Composable
fun PageIndicator(
    pageCount: Int,
    currentPage: Int,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        repeat(pageCount) { index ->
            val isSelected = index == currentPage

            val size by animateDpAsState(
                targetValue = if (isSelected) 10.dp else 8.dp,
                animationSpec = tween(durationMillis = 200),
                label = "dot_size"
            )

            val color by animateColorAsState(
                targetValue = if (isSelected) WallPrimary else WallOutline,
                animationSpec = tween(durationMillis = 200),
                label = "dot_color"
            )

            Box(
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape)
                    .background(color)
            )
        }
    }
}

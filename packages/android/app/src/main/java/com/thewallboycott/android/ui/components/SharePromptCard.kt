package com.thewallboycott.android.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.thewallboycott.android.R
import com.thewallboycott.android.share.ShareContent
import com.thewallboycott.android.share.ShareScenario
import com.thewallboycott.android.ui.theme.*

/**
 * A compact share prompt card that appears inline after key user actions.
 * Features:
 * - Headline and subtext
 * - Primary share button
 * - Dismiss button (X)
 * - Animated entrance/exit
 *
 * @param content The share content to display
 * @param onShareClick Called when the user taps the share button
 * @param onDismiss Called when the user dismisses the prompt
 * @param modifier Modifier for the card
 * @param scenario The share scenario (affects styling)
 */
@Composable
fun SharePromptCard(
    content: ShareContent,
    onShareClick: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    scenario: ShareScenario = ShareScenario.GENERAL
) {
    var visible by remember { mutableStateOf(true) }

    // Determine colors based on scenario
    val (containerColor, accentColor) = when (scenario) {
        ShareScenario.NO_APPS_FOUND -> WallSuccessContainer to WallSuccessAccent
        ShareScenario.APPS_FOUND -> WallSuccessContainer to WallSuccessAccent
        ShareScenario.APP_REMOVED -> WallHintContainer to WallHintAccent
        ShareScenario.NEW_SUPPORTER -> WallHintContainer to WallHintAccent
        else -> WallSurfaceVariant to WallPrimary
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + expandVertically(),
        exit = fadeOut() + shrinkVertically()
    ) {
        Card(
            modifier = modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = containerColor),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Share,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = content.headline,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = accentColor
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = content.subtext,
                    style = MaterialTheme.typography.bodyMedium,
                    color = WallOnSurface.copy(alpha = 0.7f)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = {
                        onShareClick()
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = accentColor,
                        contentColor = WallTextOnPrimary
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        Icons.Default.Share,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = content.buttonText,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

/**
 * A minimal inline share button for result cards.
 */
@Composable
fun ShareButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    text: String = "Share",
    accentColor: androidx.compose.ui.graphics.Color = WallPrimary
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = accentColor
        )
    ) {
        Icon(
            Icons.Default.Share,
            contentDescription = null,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Medium
        )
    }
}

/**
 * Share icon button for toolbar/app bar.
 */
@Composable
fun ShareIconButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    tint: androidx.compose.ui.graphics.Color = WallTextOnPrimary
) {
    IconButton(
        onClick = onClick,
        modifier = modifier
    ) {
        Icon(
            Icons.Default.Share,
            contentDescription = stringResource(R.string.cd_share),
            tint = tint
        )
    }
}

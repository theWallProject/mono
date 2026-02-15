package com.thewallboycott.android.ui.screens

import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thewallboycott.android.R
import com.thewallboycott.android.ui.theme.WallPrimary
import com.thewallboycott.android.ui.theme.WallTextOnPrimary

/** Number of taps required to trigger debug scan */
private const val DEBUG_TAP_COUNT = 4

/** Maximum time between taps in milliseconds */
private const val DEBUG_TAP_INTERVAL_MS = 1000L

/**
 * Reusable Wall logo component - orange circle with white shield.
 * Shield fills 60% of the circle diameter.
 */
@Composable
fun WallLogo(size: Dp, modifier: Modifier = Modifier) {
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(WallPrimary)
            .then(modifier),  // Apply clickable after visual modifiers
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_wall_shield),
            contentDescription = stringResource(R.string.cd_wall_logo),
            modifier = Modifier.size(size * 0.6f)
        )
    }
}

@Composable
fun StartScreen(
    onScanClicked: () -> Unit,
    onDebugTrigger: () -> Unit = {}
) {
    Log.d("StartScreen", "StartScreen composable rendered")

    // Easter egg: tap logo 4 times in a row (max 1 sec between taps) to trigger debug scan
    var tapCount by remember { mutableIntStateOf(0) }
    var lastTapTime by remember { mutableLongStateOf(0L) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Logo and Title Row - Icon on left, Text on right
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            WallLogo(
                size = 100.dp,
                modifier = Modifier.clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() }
                ) {
                    val currentTime = System.currentTimeMillis()
                    val timeSinceLastTap = currentTime - lastTapTime
                    Log.d("StartScreen", "Tap! timeSinceLastTap=$timeSinceLastTap, tapCount=$tapCount")

                    if (timeSinceLastTap <= DEBUG_TAP_INTERVAL_MS) {
                        tapCount++
                        Log.d("StartScreen", "Within interval, tapCount now=$tapCount")
                        if (tapCount >= DEBUG_TAP_COUNT) {
                            Log.d("StartScreen", "Triggering debug scan!")
                            onDebugTrigger()
                            tapCount = 0
                        }
                    } else {
                        Log.d("StartScreen", "Too slow, resetting to 1")
                        tapCount = 1
                    }
                    lastTapTime = currentTime
                }
            )

            Spacer(modifier = Modifier.width(20.dp))

            // Text Column
            Column {
                // App Name
                Text(
                    text = stringResource(R.string.scan_title),
                    style = MaterialTheme.typography.displaySmall.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = MaterialTheme.colorScheme.onBackground
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Tagline
                Text(
                    text = stringResource(R.string.scan_tagline),
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        // Description
        Text(
            text = stringResource(R.string.scan_description),
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        // Main CTA Button
        Button(
            onClick = onScanClicked,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = WallPrimary,
                contentColor = WallTextOnPrimary
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = stringResource(R.string.scan_button),
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold
                )
            )
        }
    }
}

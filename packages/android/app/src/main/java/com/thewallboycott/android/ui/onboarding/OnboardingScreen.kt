package com.thewallboycott.android.ui.onboarding

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.ui.unit.dp
import com.thewallboycott.android.R
import com.thewallboycott.android.ui.screens.WallLogo
import com.thewallboycott.android.ui.theme.WallBackground
import com.thewallboycott.android.ui.theme.WallOnSurface
import com.thewallboycott.android.ui.theme.WallOnSurfaceVariant
import com.thewallboycott.android.ui.theme.WallPrimary
import com.thewallboycott.android.ui.theme.WallSuccessAccent
import com.thewallboycott.android.ui.theme.WallTextOnPrimary
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val PAGE_COUNT = 4

/**
 * Main onboarding screen container.
 * Uses HorizontalPager for swipe navigation between 4 pages.
 */
@Composable
fun OnboardingScreen(
    onComplete: () -> Unit
) {
    val pagerState = rememberPagerState(pageCount = { PAGE_COUNT })
    val coroutineScope = rememberCoroutineScope()

    fun goToNextPage() {
        coroutineScope.launch {
            pagerState.animateScrollToPage(pagerState.currentPage + 1)
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = WallBackground
    ) {
Box(modifier = Modifier.fillMaxSize()) {
             // Pager with pages
             HorizontalPager(
                 state = pagerState,
                 modifier = Modifier.fillMaxSize()
             ) { page ->
                 when (page) {
                    0 -> WelcomePage(onNext = ::goToNextPage)
                    1 -> ShareToScanPage(onNext = ::goToNextPage)
                    2 -> NotificationPage(
                        onContinue = {
                             coroutineScope.launch {
                                 pagerState.animateScrollToPage(3)
                             }
                         }
                     )
                     3 -> CompletionPage(onComplete = onComplete)
                 }
             }

            // Skip button (top right) - visible on pages 0-2
            if (pagerState.currentPage < PAGE_COUNT - 1) {
                TextButton(
                    onClick = onComplete,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .statusBarsPadding()
                        .padding(16.dp)
                ) {
                    Text(
                        text = stringResource(R.string.btn_skip),
                        color = WallOnSurfaceVariant
                    )
                }
            }

            // Page indicator (bottom center)
            PageIndicator(
                pageCount = PAGE_COUNT,
                currentPage = pagerState.currentPage,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 32.dp)
            )
        }
    }
}

/**
 * Page 1: Welcome
 * Shows WallLogo with pulse animation, headline, body text, and trust badges.
 */
@Composable
private fun WelcomePage(onNext: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    OnboardingPage(
        headline = stringResource(R.string.onboarding_welcome_headline),
        body = stringResource(R.string.onboarding_welcome_body),
        visual = {
            Box(modifier = Modifier.scale(scale)) {
                WallLogo(size = 100.dp)
            }
        },
        footer = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                // Trust badges
                Row(
                    horizontalArrangement = Arrangement.spacedBy(32.dp)
                ) {
                    TrustBadge(
                        icon = Icons.Filled.WifiOff,
                        label = stringResource(R.string.trust_badge_offline)
                    )
                    TrustBadge(
                        icon = Icons.Filled.Lock,
                        label = stringResource(R.string.trust_badge_private)
                    )
                    TrustBadge(
                        icon = Icons.Filled.Check,
                        label = stringResource(R.string.trust_badge_free)
                    )
                }

                // Next button
                Button(
                    onClick = onNext,
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
                        text = stringResource(R.string.btn_next),
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }
            }
        }
    )
}

/**
 * Page 2: Share to Scan
 * Visual showing share flow: Share icon → arrow → WallLogo.
 */
@Composable
private fun ShareToScanPage(onNext: () -> Unit) {
    OnboardingPage(
        headline = stringResource(R.string.onboarding_share_headline),
        body = stringResource(R.string.onboarding_share_body),
        visual = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Share icon
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(WallPrimary.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Share,
                        contentDescription = stringResource(R.string.cd_share),
                        modifier = Modifier.size(32.dp),
                        tint = WallPrimary
                    )
                }

                // Arrow
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    modifier = Modifier.size(24.dp),
                    tint = WallOnSurfaceVariant
                )

                // WallLogo (smaller)
                WallLogo(size = 64.dp)
            }
        },
        footer = {
            // Next button
            Button(
                onClick = onNext,
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
                    text = stringResource(R.string.btn_next),
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold
                    )
                )
            }
        }
    )
}

/**
 * Page 3: Notification Permission
 * Requests POST_NOTIFICATIONS permission on Android 13+.
 */
@Composable
private fun NotificationPage(
    onContinue: () -> Unit
) {
    var permissionState by remember { mutableIntStateOf(0) } // 0=pending, 1=granted, 2=denied

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        permissionState = if (isGranted) 1 else 2
    }

    // Auto-advance after permission result
    LaunchedEffect(permissionState) {
        when (permissionState) {
            1 -> {
                delay(1000)
                onContinue()
            }
            2 -> {
                delay(2000)
                onContinue()
            }
        }
    }

    OnboardingPage(
        headline = stringResource(R.string.onboarding_notif_headline),
        body = when (permissionState) {
            1 -> stringResource(R.string.onboarding_notif_enabled_body)
            2 -> stringResource(R.string.onboarding_notif_denied_body)
            else -> stringResource(R.string.onboarding_notif_body)
        },
        visual = {
            // Bell icon with shield overlay
            Box(
                modifier = Modifier.size(80.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Notifications,
                    contentDescription = stringResource(R.string.cd_notifications),
                    modifier = Modifier.size(64.dp),
                    tint = when (permissionState) {
                        1 -> WallSuccessAccent
                        2 -> WallOnSurfaceVariant
                        else -> WallPrimary
                    }
                )
                // Shield overlay (bottom right)
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(WallBackground),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (permissionState == 1) Icons.Filled.Check else Icons.Filled.Shield,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = when (permissionState) {
                            1 -> WallSuccessAccent
                            else -> WallPrimary
                        }
                    )
                }
            }
        },
        footer = {
            if (permissionState == 0) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Enable Notifications button
                    Button(
                        onClick = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            } else {
                                // On older Android, notifications are enabled by default
                                permissionState = 1
                            }
                        },
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
                            text = stringResource(R.string.notif_enable),
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                    }

                    // Maybe Later text button
                    TextButton(onClick = onContinue) {
                        Text(
                            text = stringResource(R.string.btn_maybe_later),
                            color = WallOnSurfaceVariant
                        )
                    }
                }
            }
        }
    )
}

/**
 * Page 4: Updates & Completion
 * Final page with CTA to start scanning.
 */
@Composable
private fun CompletionPage(
    onComplete: () -> Unit
) {
    OnboardingPage(
        headline = stringResource(R.string.onboarding_complete_headline),
        body = stringResource(R.string.onboarding_complete_body),
        visual = {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(WallPrimary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.RocketLaunch,
                    contentDescription = stringResource(R.string.cd_getting_started),
                    modifier = Modifier.size(48.dp),
                    tint = WallPrimary
                )
            }
        },
        footer = {
            Button(
                onClick = onComplete,
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
                    text = stringResource(R.string.btn_start_scanning),
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold
                    )
                )
            }
        }
    )
}

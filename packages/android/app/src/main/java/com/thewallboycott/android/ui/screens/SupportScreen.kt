package com.thewallboycott.android.ui.screens

import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Report
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import com.thewallboycott.android.R
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thewallboycott.android.data.billing.BillingConnectionState
import com.thewallboycott.android.data.billing.BillingManager
import com.thewallboycott.android.share.ShareManager
import com.thewallboycott.android.ui.components.SupporterShareDialog
import com.thewallboycott.android.ui.theme.*

@Composable
fun SupportScreen() {
    val context = LocalContext.current
    val activity = context as? Activity
    val scrollState = rememberScrollState()

    val billingManager = remember { BillingManager(context) }
    val shareManager = remember { ShareManager(context) }
    val isSubscribed by billingManager.isSubscribed.collectAsState()
    val connectionState by billingManager.connectionState.collectAsState()

    // Track previous subscription state to detect new subscriptions
    var wasSubscribed by remember { mutableStateOf(isSubscribed) }
    var showSupporterShareDialog by remember { mutableStateOf(false) }

    // Detect when subscription status changes from false to true (new subscription)
    LaunchedEffect(isSubscribed) {
        if (isSubscribed && !wasSubscribed && shareManager.shouldShowSupporterPrompt()) {
            showSupporterShareDialog = true
            shareManager.markSupporterPromptShown()
        }
        wasSubscribed = isSubscribed
    }

    LaunchedEffect(Unit) {
        billingManager.startConnection()
    }

    DisposableEffect(Unit) {
        onDispose {
            billingManager.endConnection()
        }
    }

    // Check if we can scroll more
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
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Donation Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = WallSurfaceVariant)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "The Wall tools are free. All of them—every tool standing today and every one we'll build tomorrow. No ads. No tracking. No premium tier. Just quality tools that hit hard.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = WallOnSurface,
                        textAlign = TextAlign.Start
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Your donation doesn't unlock features—it unlocks hours. More money, more dev time, better tools, faster updates. Simple math.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = WallOnSurface,
                        textAlign = TextAlign.Start
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "And every dollar? It's a digital bullet fired straight into the heart of an occupation that wants us gone. You're not funding an app—you're funding defiance, written in code.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = WallOnSurface,
                        textAlign = TextAlign.Start
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "We're building a wall around their economy. Each dollar is a brick that helps seal it shut.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = WallPrimary,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Start
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Donate Wall Image with Button Overlay
            if (isSubscribed) {
                // Supporter Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = WallHintContainer)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.Star,
                            contentDescription = null,
                            tint = WallHintAccent,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "You're a Supporter!",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = WallHintAccent
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Thank you for keeping The Wall alive.",
                            style = MaterialTheme.typography.bodySmall,
                            color = WallOnHintContainer,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            } else {
                // Donate wall image with button overlay
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .widthIn(max = 400.dp)
                        .aspectRatio(1f),
                    contentAlignment = Alignment.Center
                ) {
                    // Background wall image
                    Image(
                        painter = painterResource(id = R.drawable.donate_wall),
                        contentDescription = "Donate a brick",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Fit
                    )

                    // Button positioned over the hole (slightly above center)
                    Button(
                        onClick = {
                            activity?.let { billingManager.launchSubscriptionFlow(it) }
                        },
                        enabled = connectionState == BillingConnectionState.CONNECTED,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = WallPrimary,
                            contentColor = WallTextOnPrimary
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .align(Alignment.Center)
                            .offset(y = (2).dp)
                            .padding(horizontal = 16.dp)
                    ) {
                        Icon(
                            Icons.Default.Favorite,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("$1/month", fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Ko-fi alternative
            OutlinedButton(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://ko-fi.com/thewalladdon"))
                    context.startActivity(intent)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = WallOnSurfaceVariant
                )
            ) {
                Image(
                    painter = painterResource(id = R.drawable.kofi_logo),
                    contentDescription = "Ko-fi",
                    modifier = Modifier.height(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Prefer Ko-fi? Donate there",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }

        Spacer(modifier = Modifier.height(24.dp))

        // Contact & Report Section
        Text(
            text = "Contact & Feedback",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = WallOnSurface,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp)
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Report Button
            ActionCard(
                modifier = Modifier.weight(1f),
                icon = Icons.Default.Report,
                title = "Report Issue",
                subtitle = "Spotted a mistake?",
                onClick = {
                    val intent = Intent(Intent.ACTION_SENDTO).apply {
                        data = Uri.parse("mailto:")
                        putExtra(Intent.EXTRA_EMAIL, arrayOf("the.wall.addon@proton.me"))
                        putExtra(Intent.EXTRA_SUBJECT, "Contact - The Wall Android")
                        putExtra(Intent.EXTRA_TEXT, "Please describe the issue:\n\n")
                    }
                    context.startActivity(Intent.createChooser(intent, "Send Report"))
                }
            )

            // Contact Button
            ActionCard(
                modifier = Modifier.weight(1f),
                icon = Icons.Default.Email,
                title = "Contact Us",
                subtitle = "We'd love to hear from you",
                onClick = {
                    val intent = Intent(Intent.ACTION_SENDTO).apply {
                        data = Uri.parse("mailto:")
                        putExtra(Intent.EXTRA_EMAIL, arrayOf("the.wall.addon@proton.me"))
                        putExtra(Intent.EXTRA_SUBJECT, "Contact - The Wall Android")
                    }
                    context.startActivity(Intent.createChooser(intent, "Send Email"))
                }
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

            // Browser Extension Promotion Card (moved to bottom)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WallPrimary)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Wall Logo
                    WallLogo(size = 64.dp)

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Expand Your Impact",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = WallTextOnPrimary,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Boycott while you browse. Our extension flags 20k Israeli-linked companies across social media, so you never accidentally support apartheid.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = WallTextOnPrimary.copy(alpha = 0.9f),
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://the-wall.win"))
                            context.startActivity(intent)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = WallTextOnPrimary,
                            contentColor = WallPrimary
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            Icons.Default.Language,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Get the Extension",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 16.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Footer
            Text(
                text = "Built with love. Free Palestine.",
                style = MaterialTheme.typography.bodySmall,
                color = WallOnSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))
        }

        // Scroll indicator - fade gradient at bottom when more content available (shorter version)
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

    // Supporter share dialog - shown once after successful subscription
    if (showSupporterShareDialog) {
        SupporterShareDialog(
            content = shareManager.getSupporterContent(),
            shareManager = shareManager,
            onDismiss = { showSupporterShareDialog = false },
            onShareComplete = { showSupporterShareDialog = false }
        )
    }
}

@Composable
private fun ActionCard(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = WallSurfaceVariant),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Icon and title in a row, centered
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = WallPrimary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = WallOnSurface
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = WallOnSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
    }
}

package com.thewallboycott.android.ui.urllookup

import android.content.Intent
import android.net.Uri
import android.util.Log
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
import androidx.compose.runtime.derivedStateOf
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.ui.window.PopupProperties
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thewallboycott.android.data.models.Alternative
import com.thewallboycott.android.data.models.AutocompleteSuggestion
import com.thewallboycott.android.data.models.ReasonLevel
import com.thewallboycott.android.data.logic.UrlChecker
import com.thewallboycott.android.data.models.UrlCheckResult
import com.thewallboycott.android.data.reasonsMap
import com.thewallboycott.android.share.ImageTemplate
import com.thewallboycott.android.share.ShareContent
import com.thewallboycott.android.share.ShareManager
import com.thewallboycott.android.ui.components.ShareButton
import com.thewallboycott.android.ui.components.ShareDialog
import com.thewallboycott.android.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun UrlLookupScreen(
    initialUrl: String? = null,
    onUrlHandled: () -> Unit = {}
) {
    var url by remember { mutableStateOf(initialUrl ?: "") }
    var result by remember { mutableStateOf<UrlCheckResult?>(null) }
    var hasSearched by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var suggestions by remember { mutableStateOf<List<AutocompleteSuggestion>>(emptyList()) }
    var showSuggestions by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val urlChecker = remember { UrlChecker(context) }
    val shareManager = remember { ShareManager(context) }
    var showShareDialog by remember { mutableStateOf(false) }
    var shareContent by remember { mutableStateOf<ShareContent?>(null) }
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    fun performCheck(checkUrl: String) {
        if (checkUrl.isBlank()) return
        isLoading = true
        hasSearched = true
        showSuggestions = false
        scope.launch {
            try {
                Log.d("UrlLookup", "Checking URL: $checkUrl")
                result = urlChecker.checkUrl(checkUrl)
                Log.d("UrlLookup", "Result: $result")
            } catch (e: Exception) {
                Log.e("UrlLookup", "Error checking URL: ${e.message}", e)
                result = null
            } finally {
                isLoading = false
            }
        }
    }

    // Debounced autocomplete search (only when typing, not after selecting a suggestion)
    LaunchedEffect(url) {
        // Don't show autocomplete if search is loading or already performed
        if (isLoading) {
            return@LaunchedEffect
        }

        if (url.length >= 4) {
            delay(300) // 300ms debounce
            // Check again after delay in case state changed
            if (isLoading) {
                return@LaunchedEffect
            }
            try {
                val results = urlChecker.searchAutocomplete(url)
                suggestions = results
                showSuggestions = results.isNotEmpty()
            } catch (e: Exception) {
                Log.e("UrlLookup", "Error fetching suggestions: ${e.message}", e)
                suggestions = emptyList()
                showSuggestions = false
            }
        } else {
            suggestions = emptyList()
            showSuggestions = false
        }
    }

    // --- Automatic Scan Logic ---
    LaunchedEffect(initialUrl) {
        if (initialUrl != null) {
            Log.d(
                "ShareDebug",
                "UrlLookupScreen: LaunchedEffect received initialUrl: '$initialUrl'"
            )
            url = initialUrl // Update the textbox with the shared URL
            performCheck(initialUrl)
            onUrlHandled() // Notify the activity that the URL has been processed
        } else {
            Log.d("ShareDebug", "UrlLookupScreen: LaunchedEffect received null initialUrl.")
        }
    }

    val canScrollDown by remember {
        derivedStateOf { scrollState.value < scrollState.maxValue }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(scrollState)
        ) {
        // Description text
        Text(
            text = "Check any company, website, or social profile for Zionist ties before you commit.",
            style = MaterialTheme.typography.bodyMedium,
            color = WallOnSurfaceVariant,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // Search field with autocomplete suggestions
        Column {
            OutlinedTextField(
                value = url,
                onValueChange = { url = it },
                label = { Text("Search company or paste URL") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = WallPrimary,
                    focusedLabelColor = WallPrimary,
                    cursorColor = WallPrimary
                ),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Suggestions list - shown inline without popup animation
            androidx.compose.animation.AnimatedVisibility(
                visible = showSuggestions && suggestions.isNotEmpty(),
                enter = androidx.compose.animation.fadeIn() + androidx.compose.animation.expandVertically(),
                exit = androidx.compose.animation.fadeOut() + androidx.compose.animation.shrinkVertically()
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = WallSurfaceVariant),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column {
                        suggestions.forEach { suggestion ->
                            Text(
                                text = suggestion.displayText,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        url = suggestion.fillValue
                                        showSuggestions = false
                                        performCheck(suggestion.fillValue)
                                    }
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                                color = WallOnSurface
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Button(
            onClick = { performCheck(url) },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            enabled = !isLoading,
            colors = ButtonDefaults.buttonColors(
                containerColor = WallPrimary,
                contentColor = WallTextOnPrimary
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                "Check",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
            )
        }
        Spacer(modifier = Modifier.height(16.dp))

        // Result section (right after button)
        if (isLoading) {
            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = WallPrimary)
            }
            Spacer(modifier = Modifier.height(16.dp))
        } else if (hasSearched) {
            // Helper function to send report email
            fun sendReportEmail(isFlagged: Boolean, resultName: String?) {
                val subject = if (isFlagged) {
                    "[FLAGGED] Report mistake: ${resultName ?: url}"
                } else {
                    "[NOT FLAGGED] Report mistake: $url"
                }
                val body = buildString {
                    append("URL: $url\n")
                    append("Result type: ${if (isFlagged) "Flagged" else "Not flagged"}\n")
                    if (resultName != null) append("Matched name: $resultName\n")
                    append("\n[Please describe the mistake here]")
                }
                val intent = Intent(Intent.ACTION_SENDTO).apply {
                    data = Uri.parse("mailto:")
                    putExtra(Intent.EXTRA_EMAIL, arrayOf("the.wall.addon@proton.me"))
                    putExtra(Intent.EXTRA_SUBJECT, subject)
                    putExtra(Intent.EXTRA_TEXT, body)
                }
                context.startActivity(Intent.createChooser(intent, "Report Mistake"))
            }

            when (val res = result) {
                is UrlCheckResult.Match -> MatchResultCard(
                    result = res,
                    onShareClick = {
                        val reasonSummary = res.reasons.mapNotNull { reasonsMap[it]?.message }.firstOrNull()
                        shareContent = shareManager.getUrlMatchContent(res.name, reasonSummary)
                        showShareDialog = true
                    },
                    onReportClick = { sendReportEmail(isFlagged = true, resultName = res.name) }
                )
                is UrlCheckResult.Hint -> HintResultCard(
                    result = res,
                    onShareClick = {
                        shareContent = shareManager.getUrlMatchContent(res.name, res.hintText)
                        showShareDialog = true
                    },
                    onReportClick = { sendReportEmail(isFlagged = true, resultName = res.name) }
                )
                null -> NoMatchResultCard(
                    searchedUrl = url,
                    onShareClick = {
                        shareContent = shareManager.getUrlCleanContent(url)
                        showShareDialog = true
                    },
                    onReportClick = { sendReportEmail(isFlagged = false, resultName = null) }
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Help section (always visible)
        HelpSection(
            onExampleClick = { example ->
                url = example
                performCheck(example)
            }
        )
        Spacer(modifier = Modifier.height(12.dp))

        // Pro Tip section (right after help)
        ProTipCard()

        Spacer(modifier = Modifier.height(16.dp))
    }

    // Scroll fade indicator at bottom (shorter version - 40dp)
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

    // Share dialog for URL lookup results
    if (showShareDialog && shareContent != null) {
        ShareDialog(
            content = shareContent!!,
            shareManager = shareManager,
            imageTemplate = ImageTemplate.GENERAL,
            onDismiss = {
                showShareDialog = false
                shareContent = null
            },
            onShareComplete = {
                showShareDialog = false
                shareContent = null
            }
        )
    }
}
}

@Composable
fun HelpSection(onExampleClick: (String) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = WallSurfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "What can you search?",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = WallOnSurface
            )
            Spacer(modifier = Modifier.height(12.dp))

            HelpExampleRow(
                label = "Company:",
                example = "Wix",
                onClick = { onExampleClick("Wix") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "Website:",
                example = "fiverr.com",
                onClick = { onExampleClick("fiverr.com") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "LinkedIn:",
                example = "linkedin.com/company/mondaydotcom",
                onClick = { onExampleClick("linkedin.com/company/mondaydotcom") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "Facebook:",
                example = "facebook.com/wix",
                onClick = { onExampleClick("facebook.com/wix") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "Twitter/X:",
                example = "x.com/fiverr",
                onClick = { onExampleClick("x.com/fiverr") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "Instagram:",
                example = "instagram.com/wix",
                onClick = { onExampleClick("instagram.com/wix") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "GitHub:",
                example = "github.com/wix",
                onClick = { onExampleClick("github.com/wix") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "YouTube:",
                example = "youtube.com/@mondaydotcom",
                onClick = { onExampleClick("youtube.com/@mondaydotcom") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "TikTok:",
                example = "tiktok.com/@fiverr",
                onClick = { onExampleClick("tiktok.com/@fiverr") }
            )
            Spacer(modifier = Modifier.height(6.dp))
            HelpExampleRow(
                label = "Threads:",
                example = "threads.com/@wix",
                onClick = { onExampleClick("threads.com/@wix") }
            )
        }
    }
}

@Composable
fun HelpExampleRow(
    label: String,
    example: String,
    onClick: () -> Unit
) {
    Row {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = WallOnSurfaceVariant
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = buildAnnotatedString {
                withStyle(
                    style = SpanStyle(
                        color = WallPrimary,
                        textDecoration = TextDecoration.Underline,
                        fontWeight = FontWeight.Medium
                    )
                ) {
                    append(example)
                }
            },
            modifier = Modifier.clickable { onClick() },
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

@Composable
fun ProTipCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = WallSurfaceVariant)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Share,
                contentDescription = null,
                tint = WallPrimary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = "Pro Tip",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = WallOnSurface
                )
                Text(
                    text = "Share links from other apps to check them instantly.",
                    style = MaterialTheme.typography.bodySmall,
                    color = WallOnSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun NoMatchResultCard(
    searchedUrl: String = "",
    onShareClick: () -> Unit = {},
    onReportClick: () -> Unit = {}
) {
    ResultCard(
        icon = Icons.Default.CheckCircle,
        title = "Looking Good",
        titleColor = WallSuccessAccent,
        containerColor = WallSuccessContainer,
        bodyColor = WallOnSuccessContainer,
        onShareClick = onShareClick,
        onReportClick = onReportClick
    ) {
        Text(
            "This link isn't flagged in our database. Browse freely.",
            style = MaterialTheme.typography.bodyLarge,
            color = WallOnSuccessContainer
        )
    }
}

@Composable
fun MatchResultCard(
    result: UrlCheckResult.Match,
    onShareClick: () -> Unit = {},
    onReportClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val mappedReasons = result.reasons.mapNotNull { reasonsMap[it] }
    val overallLevel =
        if (mappedReasons.any { it.level == ReasonLevel.ERROR }) ReasonLevel.ERROR else ReasonLevel.WARNING

    val icon = if (overallLevel == ReasonLevel.ERROR) Icons.Default.Error else Icons.Default.Warning
    val title = result.name
    val titleColor = if (overallLevel == ReasonLevel.ERROR) WallErrorAccent else WallWarningAccent
    val containerColor = if (overallLevel == ReasonLevel.ERROR) WallErrorContainer else WallWarningContainer
    val bodyColor = if (overallLevel == ReasonLevel.ERROR) WallOnErrorContainer else WallOnWarningContainer

    ResultCard(icon, title, titleColor, containerColor, bodyColor, onShareClick, onReportClick) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            mappedReasons.forEach { reason ->
                Text(
                    "• ${reason.message}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = bodyColor
                )
            }
            result.comment?.let {
                Text(
                    "Comment: $it",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = bodyColor
                )
            }

            // Show alternatives sub-card if available
            if (!result.alt.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = WallSecondaryContainer),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Try These Instead:",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = WallOnSecondaryContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        result.alt.forEach { alternative ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(vertical = 4.dp)
                            ) {
                                Text(
                                    text = alternative.n,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = WallOnSecondaryContainer,
                                    modifier = Modifier.weight(1f)
                                )
                                Button(
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(alternative.ws))
                                        context.startActivity(intent)
                                    },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = WallSecondary,
                                        contentColor = WallTextOnPrimary
                                    ),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                                ) {
                                    Text("View", fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun HintResultCard(
    result: UrlCheckResult.Hint,
    onShareClick: () -> Unit = {},
    onReportClick: () -> Unit = {}
) {
    ResultCard(
        icon = Icons.Default.Info,
        title = "Hint: ${result.name}",
        titleColor = WallHintAccent,
        containerColor = WallHintContainer,
        bodyColor = WallOnHintContainer,
        onShareClick = onShareClick,
        onReportClick = onReportClick
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                result.hintText,
                style = MaterialTheme.typography.bodyLarge,
                color = WallOnHintContainer
            )
            result.hintUrl.let {
                Text(
                    "Suggestion: $it",
                    style = MaterialTheme.typography.bodyMedium,
                    color = WallOnHintContainer.copy(alpha = 0.7f)
                )
            }
        }
    }
}


@Composable
fun ResultCard(
    icon: ImageVector,
    title: String,
    titleColor: androidx.compose.ui.graphics.Color,
    containerColor: androidx.compose.ui.graphics.Color,
    bodyColor: androidx.compose.ui.graphics.Color = WallOnSurfaceVariant,
    onShareClick: () -> Unit = {},
    onReportClick: () -> Unit = {},
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = titleColor,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge.copy(
                        color = titleColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    ),
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            content()
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                ShareButton(
                    onClick = onShareClick,
                    text = "Share",
                    accentColor = titleColor
                )
                TextButton(
                    onClick = onReportClick,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Report mistake",
                        style = MaterialTheme.typography.labelSmall,
                        color = bodyColor.copy(alpha = 0.7f)
                    )
                }
            }
        }
    }
}

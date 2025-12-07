package com.thewall.android.ui.urllookup

import android.content.Intent
import android.net.Uri
import android.util.Log
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thewall.android.data.models.ReasonLevel
import com.thewall.android.data.logic.UrlChecker
import com.thewall.android.data.models.UrlCheckResult
import com.thewall.android.data.reasonsMap
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
    val context = LocalContext.current
    val urlChecker = remember { UrlChecker(context) }
    val scope = rememberCoroutineScope()

    fun performCheck(checkUrl: String) {
        if (checkUrl.isBlank()) return
        isLoading = true
        hasSearched = true
        scope.launch {
            try {
                result = urlChecker.checkUrl(checkUrl)
            } finally {
                isLoading = false
            }
        }
    }

    // --- Automatic Scan Logic ---
    LaunchedEffect(initialUrl) {
        if (initialUrl != null) {
            Log.d(
                "ShareDebug",
                "UrlLookupScreen: LaunchedEffect received initialUrl: '$initialUrl'"
            )
            performCheck(initialUrl)
            onUrlHandled() // Notify the activity that the URL has been processed
        } else {
            Log.d("ShareDebug", "UrlLookupScreen: LaunchedEffect received null initialUrl.")
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        OutlinedTextField(
            value = url,
            onValueChange = { url = it },
            label = { Text("Enter a website or social media URL") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = { performCheck(url) },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading
        ) {
            Text("Check URL")
        }
        Spacer(modifier = Modifier.height(16.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (hasSearched) {
            when (val res = result) {
                is UrlCheckResult.Match -> MatchResultCard(res)
                is UrlCheckResult.Hint -> HintResultCard(res)
                null -> NoMatchResultCard()
            }
        }

        // This spacer pushes the button to the bottom of the screen
        Spacer(Modifier.weight(1f))

        OutlinedButton(
            onClick = {
                val subject =
                    if (url.isNotBlank()) "Report error for: $url" else "Report from URL Lookup Screen"
                val body = if (url.isNotBlank()) {
                    "I believe there is an error with the result for this URL: $url\n\n[Please add more details here]"
                } else {
                    "I encountered an issue on the URL Lookup screen.\n\n[Please add more details here]"
                }

                val intent = Intent(Intent.ACTION_SENDTO).apply {
                    data = Uri.parse("mailto:")
                    putExtra(Intent.EXTRA_EMAIL, arrayOf("dummy@example.com"))
                    putExtra(Intent.EXTRA_SUBJECT, subject)
                    putExtra(Intent.EXTRA_TEXT, body)
                }
                context.startActivity(Intent.createChooser(intent, "Send Email"))
            },
            modifier = Modifier.align(Alignment.CenterHorizontally)
        ) {
            Text("Report an Issue")
        }
    }
}

@Composable
fun NoMatchResultCard() {
    ResultCard(
        icon = Icons.Default.CheckCircle,
        title = "Seems OK",
        titleColor = Color(0xFF006400),
        containerColor = Color(0xFFE8F5E9)
    ) {
        Text(
            "This URL does not appear in our database.",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.Black.copy(alpha = 0.87f)
        )
    }
}

@Composable
fun MatchResultCard(result: UrlCheckResult.Match) {
    val mappedReasons = result.reasons.mapNotNull { reasonsMap[it] }
    val overallLevel =
        if (mappedReasons.any { it.level == ReasonLevel.ERROR }) ReasonLevel.ERROR else ReasonLevel.WARNING

    val icon = if (overallLevel == ReasonLevel.ERROR) Icons.Default.Error else Icons.Default.Warning
    val title = result.name
    val titleColor = if (overallLevel == ReasonLevel.ERROR) Color(0xFFB00020) else Color(0xFFFFA000)
    val containerColor =
        if (overallLevel == ReasonLevel.ERROR) Color(0xFFFDE7E9) else Color(0xFFFFF8E1)
    val bodyTextColor = Color.Black.copy(alpha = 0.87f)

    ResultCard(icon, title, titleColor, containerColor) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            mappedReasons.forEach { reason ->
                Text(
                    "• ${reason.message}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = bodyTextColor
                )
            }
            result.comment?.let {
                Text(
                    "Comment: $it",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = bodyTextColor
                )
            }
        }
    }
}

@Composable
fun HintResultCard(result: UrlCheckResult.Hint) {
    val bodyTextColor = Color.Black.copy(alpha = 0.87f)
    ResultCard(
        icon = Icons.Default.Warning,
        title = "Hint: ${result.name}",
        titleColor = Color.Black,
        containerColor = Color(0xFFE1F5FE) // Light Blue
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(result.hintText, style = MaterialTheme.typography.bodyLarge, color = bodyTextColor)
            result.hintUrl.let {
                Text(
                    "Suggestion: $it",
                    style = MaterialTheme.typography.bodyMedium,
                    color = bodyTextColor.copy(alpha = 0.7f)
                )
            }
        }
    }
}


@Composable
fun ResultCard(
    icon: ImageVector,
    title: String,
    titleColor: Color,
    containerColor: Color,
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                    )
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            content()
        }
    }
}

package com.thewallboycott.android.ui.components

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.thewallboycott.android.share.ImageTemplate
import com.thewallboycott.android.share.ShareContent
import com.thewallboycott.android.share.ShareImageGenerator
import com.thewallboycott.android.share.ShareManager
import com.thewallboycott.android.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * A full share experience bottom sheet with image preview and share options.
 *
 * @param content The share content
 * @param shareManager The share manager for executing shares
 * @param imageTemplate Optional image template to show preview
 * @param imageData Additional data for image generation (count for flagged, name for removed)
 * @param onDismiss Called when the sheet is dismissed
 * @param onShareComplete Called after a successful share
 */
private enum class ShareMode { IMAGE, TEXT }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShareBottomSheet(
    content: ShareContent,
    shareManager: ShareManager,
    imageTemplate: ImageTemplate?,
    imageData: Any? = null,
    onDismiss: () -> Unit,
    onShareComplete: () -> Unit
) {
    val context = LocalContext.current
    val imageGenerator = remember { ShareImageGenerator(context) }

    // Generate preview image if template is provided
    var previewBitmap by remember { mutableStateOf<Bitmap?>(null) }

    // Default to IMAGE mode if image is available, otherwise TEXT
    var selectedMode by remember { mutableStateOf(if (imageTemplate != null) ShareMode.IMAGE else ShareMode.TEXT) }

    LaunchedEffect(imageTemplate) {
        if (imageTemplate != null) {
            previewBitmap = withContext(Dispatchers.Default) {
                when (imageTemplate) {
                    ImageTemplate.CLEAN_SCAN -> imageGenerator.generateCleanScanImage()
                    ImageTemplate.FLAGGED_APPS -> {
                        val count = (imageData as? Int) ?: 1
                        imageGenerator.generateFlaggedAppsImage(count)
                    }
                    ImageTemplate.APP_REMOVED -> {
                        val appName = (imageData as? String) ?: "App"
                        imageGenerator.generateAppRemovedImage(appName)
                    }
                    ImageTemplate.SUPPORTER -> imageGenerator.generateSupporterImage()
                    ImageTemplate.GENERAL -> imageGenerator.generateGeneralImage()
                }
            }
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = WallSurface,
        contentColor = WallOnSurface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Text(
                text = content.headline,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = WallPrimary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Mode selector (only if image is available)
            if (imageTemplate != null && previewBitmap != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(WallSurfaceVariant)
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // Image tab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (selectedMode == ShareMode.IMAGE) WallPrimary else WallSurfaceVariant)
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        TextButton(
                            onClick = { selectedMode = ShareMode.IMAGE },
                            colors = ButtonDefaults.textButtonColors(
                                contentColor = if (selectedMode == ShareMode.IMAGE) WallTextOnPrimary else WallOnSurfaceVariant
                            )
                        ) {
                            Icon(
                                Icons.Default.Image,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Image", fontWeight = FontWeight.Medium)
                        }
                    }

                    // Text tab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (selectedMode == ShareMode.TEXT) WallPrimary else WallSurfaceVariant)
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        TextButton(
                            onClick = { selectedMode = ShareMode.TEXT },
                            colors = ButtonDefaults.textButtonColors(
                                contentColor = if (selectedMode == ShareMode.TEXT) WallTextOnPrimary else WallOnSurfaceVariant
                            )
                        ) {
                            Icon(
                                Icons.Default.TextFields,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Text", fontWeight = FontWeight.Medium)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }

            // Content based on selected mode
            if (selectedMode == ShareMode.IMAGE && previewBitmap != null) {
                // Image preview
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .background(WallSurfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        bitmap = previewBitmap!!.asImageBitmap(),
                        contentDescription = "Share preview",
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(16.dp))
                    )
                }
            } else {
                // Text preview
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = WallSurfaceVariant)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = content.shareText,
                            style = MaterialTheme.typography.bodyMedium,
                            color = WallOnSurface
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Share button
            Button(
                onClick = {
                    if (selectedMode == ShareMode.IMAGE && imageTemplate != null) {
                        shareManager.shareWithImage(content, imageTemplate, imageData)
                    } else {
                        shareManager.shareText(content)
                    }
                    onShareComplete()
                    onDismiss()
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = WallPrimary,
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
                    text = "Share",
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Not now button
            TextButton(
                onClick = onDismiss
            ) {
                Text(
                    text = "Not now",
                    color = WallOnSurfaceVariant
                )
            }
        }
    }
}

/**
 * A modal dialog for post-subscription share prompt.
 */
@Composable
fun SupporterShareDialog(
    content: ShareContent,
    shareManager: ShareManager,
    onDismiss: () -> Unit,
    onShareComplete: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = WallSurface,
        icon = {
            Icon(
                Icons.Default.Share,
                contentDescription = null,
                tint = WallHintAccent,
                modifier = Modifier.size(40.dp)
            )
        },
        title = {
            Text(
                text = content.headline,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = WallHintAccent,
                textAlign = TextAlign.Center
            )
        },
        text = {
            Text(
                text = content.subtext,
                style = MaterialTheme.typography.bodyMedium,
                color = WallOnSurface,
                textAlign = TextAlign.Center
            )
        },
        confirmButton = {
            Button(
                onClick = {
                    shareManager.shareWithImage(content, ImageTemplate.SUPPORTER)
                    onShareComplete()
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = WallHintAccent,
                    contentColor = WallTextOnPrimary
                )
            ) {
                Icon(
                    Icons.Default.Share,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(content.buttonText)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Maybe later", color = WallOnSurfaceVariant)
            }
        }
    )
}

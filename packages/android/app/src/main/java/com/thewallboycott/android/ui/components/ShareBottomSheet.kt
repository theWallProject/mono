package com.thewallboycott.android.ui.components

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
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
import androidx.compose.ui.window.DialogProperties
import com.thewallboycott.android.share.AppRemovedData
import com.thewallboycott.android.share.ImageTemplate
import com.thewallboycott.android.share.ShareContent
import com.thewallboycott.android.share.ShareImageGenerator
import com.thewallboycott.android.share.ShareManager
import com.thewallboycott.android.share.ShareManager.FlaggedAppsData
import com.thewallboycott.android.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * A share dialog with image preview.
 * Always shares with image+text when an image template is provided.
 *
 * @param content The share content
 * @param shareManager The share manager for executing shares
 * @param imageTemplate Optional image template to show preview
 * @param imageData Additional data for image generation (count for flagged, name for removed)
 * @param onDismiss Called when the dialog is dismissed
 * @param onShareComplete Called after a successful share
 */
@Composable
fun ShareDialog(
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

    LaunchedEffect(imageTemplate) {
        if (imageTemplate != null) {
            previewBitmap = withContext(Dispatchers.Default) {
                when (imageTemplate) {
                    ImageTemplate.CLEAN_SCAN -> imageGenerator.generateCleanScanImage()
                    ImageTemplate.FLAGGED_APPS -> {
                        when (imageData) {
                            is FlaggedAppsData -> imageGenerator.generateFlaggedAppsImage(
                                imageData.count,
                                imageData.appNames,
                                imageData.appIcons
                            )
                            is Int -> imageGenerator.generateFlaggedAppsImage(imageData)
                            else -> imageGenerator.generateFlaggedAppsImage(1)
                        }
                    }
                    ImageTemplate.APP_REMOVED -> {
                        when (imageData) {
                            is AppRemovedData -> imageGenerator.generateAppRemovedImage(imageData.appName, imageData.appIcon)
                            is String -> imageGenerator.generateAppRemovedImage(imageData)
                            else -> imageGenerator.generateAppRemovedImage("App")
                        }
                    }
                    ImageTemplate.SUPPORTER -> imageGenerator.generateSupporterImage()
                    ImageTemplate.GENERAL -> imageGenerator.generateGeneralImage()
                }
            }
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false),
        modifier = Modifier
            .fillMaxWidth(0.9f)
            .wrapContentHeight(),
        containerColor = WallSurface,
        title = {
            Text(
                text = content.headline,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = WallPrimary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Image preview
                if (previewBitmap != null) {
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
                } else if (imageTemplate == null) {
                    // Text-only preview (no image template provided)
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
                } else {
                    // Loading state while generating image
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .background(WallSurfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            color = WallPrimary,
                            modifier = Modifier.size(48.dp)
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (imageTemplate != null) {
                        shareManager.shareWithImage(content, imageTemplate, imageData)
                    } else {
                        shareManager.shareText(content)
                    }
                    onShareComplete()
                    onDismiss()
                },
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
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = "Not now",
                    color = WallOnSurfaceVariant
                )
            }
        }
    )
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

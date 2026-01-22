package com.thewallboycott.android.ui.screens

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.google.accompanist.drawablepainter.rememberDrawablePainter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.data.models.Reason
import com.thewallboycott.android.data.models.ReasonLevel
import com.thewallboycott.android.data.reasonsMap
import com.thewallboycott.android.share.ImageTemplate
import com.thewallboycott.android.share.ShareManager
import com.thewallboycott.android.share.ShareScenario
import com.thewallboycott.android.ui.components.ShareBottomSheet
import com.thewallboycott.android.ui.components.SharePromptCard
import com.thewallboycott.android.ui.theme.*
import com.thewallboycott.android.util.readFile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

private data class AppScanResults(
    val blacklisted: List<Pair<PackageInfo, AllItem>>,
    val hinted: List<Pair<PackageInfo, AllItem>>,
    val other: List<PackageInfo>
)

private suspend fun performAppScan(context: Context): AppScanResults = withContext(Dispatchers.IO) {
    Log.d("AppListScreen", "Background thread started for app scan")
    val gson = Gson()
    val assetManager = context.assets

    val allJson = readFile(assetManager, "ALL.json")
    val allItemsType = object : TypeToken<List<AllItem>>() {}.type
    val allItems = gson.fromJson<List<AllItem>>(allJson, allItemsType)
    Log.d("AppListScreen", "ALL.json loaded with ${allItems.size} items")

    val (hints, blacklist) = allItems.partition { it.isHint == true }
    Log.d("AppListScreen", "Separated ${hints.size} hints and ${blacklist.size} blacklist items")

    val installedApps = context.packageManager.getInstalledPackages(PackageManager.GET_META_DATA)
    Log.d("AppListScreen", "Found ${installedApps.size} installed apps")

    val blacklistedApps = mutableListOf<Pair<PackageInfo, AllItem>>()
    val hintedApps = mutableListOf<Pair<PackageInfo, AllItem>>()
    val otherApps = mutableListOf<PackageInfo>()

    val nonSystemApps = installedApps.filter {
        (it.applicationInfo?.flags ?: 0) and (ApplicationInfo.FLAG_SYSTEM or ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0
    }

    nonSystemApps.forEach { app ->
        val matchingBlacklistItem = blacklist.find { item ->
            (item.androidAppIds?.contains(app.packageName) == true) ||
                    (item.androidDevId?.let { app.packageName.startsWith(it) } == true)
        }
        val matchingHintItem = hints.find { item ->
            (item.androidAppIds?.contains(app.packageName) == true) ||
                    (item.androidDevId?.let { app.packageName.startsWith(it) } == true)
        }

        when {
            matchingBlacklistItem != null -> blacklistedApps.add(app to matchingBlacklistItem)
            matchingHintItem != null -> hintedApps.add(app to matchingHintItem)
            else -> otherApps.add(app)
        }
    }

    AppScanResults(blacklistedApps, hintedApps, otherApps)
}


fun AllItem.getEffectiveLevel(reasonsMap: Map<String, Reason>): ReasonLevel {
    if (this.isHint == true) return ReasonLevel.WARNING
    val hasError = this.r.any { reasonsMap[it]?.level == ReasonLevel.ERROR }
    return if (hasError) ReasonLevel.ERROR else ReasonLevel.WARNING
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppListScreen() {
    var isLoading by remember { mutableStateOf(true) }
    var blacklistedApps by remember { mutableStateOf<List<Pair<PackageInfo, AllItem>>>(emptyList()) }
    var hintedApps by remember { mutableStateOf<List<Pair<PackageInfo, AllItem>>>(emptyList()) }
    var otherApps by remember { mutableStateOf<List<PackageInfo>>(emptyList()) }
    var refreshTrigger by remember { mutableStateOf(0) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var showPermissionRationale by remember { mutableStateOf(false) }

    // Share functionality
    val shareManager = remember { ShareManager(context) }
    var showSharePrompt by remember { mutableStateOf(false) }
    var shareScenario by remember { mutableStateOf<ShareScenario?>(null) }
    var pendingUninstallAppName by remember { mutableStateOf<String?>(null) }
    var showAppRemovedSheet by remember { mutableStateOf(false) }
    var removedAppName by remember { mutableStateOf<String?>(null) }
    var showGeneralShareSheet by remember { mutableStateOf(false) }
    var scanCompleted by remember { mutableStateOf(false) }

    fun refresh() {
        refreshTrigger++
    }

    val requestPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            refresh()
        }
    }

    fun askForNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            when {
                ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED -> {
                    refresh()
                }
                else -> {
                    showPermissionRationale = true
                }
            }
        } else {
            refresh()
        }
    }

    val uninstallLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) {
        Log.d("AppListScreen", "Returned from uninstall prompt. Refreshing list.")
        // Always show share prompt after returning from uninstall
        val appName = pendingUninstallAppName
        if (appName != null) {
            removedAppName = appName
            showAppRemovedSheet = true
        }
        pendingUninstallAppName = null
        refresh()
    }

    LaunchedEffect(refreshTrigger) {
        if (refreshTrigger > 0) {
            Log.d("AppListScreen", "LaunchedEffect started (trigger: $refreshTrigger)")
            isLoading = true
            scanCompleted = false
            showSharePrompt = false
            scope.launch {
                val results = performAppScan(context)
                withContext(Dispatchers.Main) {
                    blacklistedApps = results.blacklisted
                    hintedApps = results.hinted
                    otherApps = results.other
                    isLoading = false
                    scanCompleted = true
                    Log.d("AppListScreen", "isLoading set to false")

                    // Determine share scenario after scan completes (with delay)
                    delay(1500) // 1.5s delay as per plan
                    val flaggedCount = results.blacklisted.size
                    if (flaggedCount == 0 && results.hinted.isEmpty()) {
                        // No apps found - celebration moment
                        if (shareManager.shouldShowNoAppsPrompt()) {
                            shareScenario = ShareScenario.NO_APPS_FOUND
                            showSharePrompt = true
                            shareManager.markNoAppsPromptShown()
                        }
                    } else if (flaggedCount > 0) {
                        // Apps found - revelation moment
                        if (shareManager.shouldShowAppsFoundPrompt()) {
                            shareScenario = ShareScenario.APPS_FOUND
                            showSharePrompt = true
                            shareManager.markAppsFoundPromptShown()
                        }
                    }
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        refresh()
    }

    if (showPermissionRationale) {
        AlertDialog(
            onDismissRequest = { showPermissionRationale = false },
            title = { Text("Stay Informed") },
            text = { Text("Enable notifications to get alerts when you install an app that conflicts with your values. Knowledge is power.") },
            confirmButton = {
                Button(
                    onClick = {
                        showPermissionRationale = false
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = WallPrimaryDark,
                        contentColor = WallTextOnPrimary
                    )
                ) { Text("Continue") }
            },
            dismissButton = {
                TextButton(onClick = { showPermissionRationale = false }) { Text("Cancel") }
            }
        )
    }

    Scaffold(
        containerColor = WallPrimary,
        topBar = {
            TopAppBar(
                title = { Text("Remove Israeli Apps", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = WallPrimary,
                    titleContentColor = WallTextOnPrimary,
                    scrolledContainerColor = WallPrimary
                ),
                actions = {
                    // General share button
                    IconButton(
                        onClick = { showGeneralShareSheet = true },
                        enabled = !isLoading
                    ) {
                        Icon(
                            Icons.Default.Share,
                            contentDescription = "Share The Wall",
                            tint = WallTextOnPrimary
                        )
                    }
                    IconButton(onClick = { askForNotificationPermission() }, enabled = !isLoading) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh Scan",
                            tint = WallTextOnPrimary
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(WallBackground),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = WallPrimary)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(WallBackground),
                contentPadding = PaddingValues(16.dp)
            ) {
                // Always show Israeli Apps section
                item {
                    Text(
                        if (blacklistedApps.isNotEmpty()) "Israeli Apps - EWWW!" else "Israeli Apps",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(bottom = 8.dp),
                        fontWeight = FontWeight.Bold,
                        color = WallErrorAccent
                    )
                }

                if (blacklistedApps.isEmpty()) {
                    // Show success card when no Israeli apps found
                    item {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 8.dp),
                            colors = CardDefaults.cardColors(containerColor = WallSuccessContainer),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = WallSuccessAccent,
                                        modifier = Modifier.size(32.dp)
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            "You're Making a Difference!",
                                            style = MaterialTheme.typography.titleLarge,
                                            color = WallSuccessAccent,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            "No flagged apps found. Your choices matter.",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = WallSuccessAccent.copy(alpha = 0.8f)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                                Button(
                                    onClick = {
                                        val content = shareManager.getChallengeContent()
                                        shareManager.shareText(content)
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = WallSuccessAccent,
                                        contentColor = WallSuccessContainer
                                    ),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Share,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        "Dare a Friend to Scan Theirs",
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }

                    // Share prompt for "no apps found" scenario (inside the section)
                    if (showSharePrompt && shareScenario == ShareScenario.NO_APPS_FOUND) {
                        item {
                            SharePromptCard(
                                content = shareManager.getNoAppsFoundContent(),
                                onShareClick = {
                                    val content = shareManager.getNoAppsFoundContent()
                                    shareManager.shareText(content)
                                },
                                onDismiss = {
                                    showSharePrompt = false
                                    shareManager.dismissNoAppsPrompt()
                                },
                                scenario = ShareScenario.NO_APPS_FOUND
                            )
                        }
                    }
                } else {
                    // Show blacklisted apps
                    items(blacklistedApps) { (app, itemInfo) ->
                        val pm = context.packageManager
                        val appName = app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName
                        AppInfoCard(app = app, itemInfo = itemInfo, onUninstallClicked = { packageName ->
                            pendingUninstallAppName = appName
                            val intent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$packageName"))
                            uninstallLauncher.launch(intent)
                        })
                    }

                    // Share prompt for "apps found" scenario
                    if (showSharePrompt && shareScenario == ShareScenario.APPS_FOUND) {
                        item {
                            val firstAppName = blacklistedApps.firstOrNull()?.let { (app, _) ->
                                app.applicationInfo?.loadLabel(context.packageManager)?.toString()
                            }
                            SharePromptCard(
                                content = shareManager.getAppsFoundContent(
                                    flaggedCount = blacklistedApps.size,
                                    firstAppName = firstAppName
                                ),
                                onShareClick = {
                                    val content = shareManager.getAppsFoundContent(
                                        flaggedCount = blacklistedApps.size,
                                        firstAppName = firstAppName
                                    )
                                    shareManager.shareText(content)
                                },
                                onDismiss = {
                                    showSharePrompt = false
                                    shareManager.dismissAppsFoundPrompt()
                                },
                                scenario = ShareScenario.APPS_FOUND
                            )
                        }
                    }
                }

                if (hintedApps.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Better Alternatives Available",
                            style = MaterialTheme.typography.headlineSmall,
                            modifier = Modifier.padding(bottom = 8.dp),
                            fontWeight = FontWeight.Bold,
                            color = WallHintAccent
                        )
                    }
                    items(hintedApps) { (app, itemInfo) ->
                        val pm = context.packageManager
                        val appName = app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName
                        AppInfoCard(app = app, itemInfo = itemInfo, onUninstallClicked = { packageName ->
                            pendingUninstallAppName = appName
                            val intent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$packageName"))
                            uninstallLauncher.launch(intent)
                        })
                    }
                }

                if (otherApps.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Aligned With Your Values",
                            style = MaterialTheme.typography.headlineSmall,
                            modifier = Modifier.padding(bottom = 8.dp),
                            fontWeight = FontWeight.Bold,
                            color = WallNeutralAccent
                        )
                    }
                    items(otherApps) { app ->
                        AppInfoCard(app = app, itemInfo = null, onUninstallClicked = {})
                    }
                }

                // Warn your friends button - always visible at the end
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = {
                            val content = shareManager.getGeneralContent()
                            shareManager.shareText(content)
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
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Warn Your Friends",
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }

    // Bottom sheet for app removed share prompt
    if (showAppRemovedSheet && removedAppName != null) {
        ShareBottomSheet(
            content = shareManager.getAppRemovedContent(removedAppName!!),
            shareManager = shareManager,
            imageTemplate = ImageTemplate.APP_REMOVED,
            imageData = removedAppName,
            onDismiss = {
                showAppRemovedSheet = false
                shareManager.dismissAppRemovedPrompt()
                removedAppName = null
            },
            onShareComplete = {
                showAppRemovedSheet = false
                removedAppName = null
            }
        )
    }

    // Bottom sheet for general share
    if (showGeneralShareSheet) {
        ShareBottomSheet(
            content = shareManager.getGeneralContent(),
            shareManager = shareManager,
            imageTemplate = ImageTemplate.GENERAL,
            onDismiss = { showGeneralShareSheet = false },
            onShareComplete = { showGeneralShareSheet = false }
        )
    }
}

@Composable
fun AppInfoCard(
    app: PackageInfo,
    itemInfo: AllItem?,
    onUninstallClicked: (String) -> Unit
) {
    val context = LocalContext.current
    val pm = context.packageManager
    val appName = remember(app) { app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName }
    val appIcon = remember(app) { app.applicationInfo?.loadIcon(pm) }

    val effectiveLevel = itemInfo?.getEffectiveLevel(reasonsMap)
    val isHint = itemInfo?.isHint == true

    // Dark container colors based on status
    val cardColor = when {
        isHint -> WallHintContainer
        effectiveLevel == ReasonLevel.ERROR -> WallErrorContainer
        effectiveLevel == ReasonLevel.WARNING -> WallWarningContainer
        else -> WallNeutralContainer
    }

    // Accent colors for app icon background tint (subtle blend)
    val iconBgColor = when {
        isHint -> WallHintAccent.copy(alpha = 0.15f)
        effectiveLevel == ReasonLevel.ERROR -> WallErrorAccent.copy(alpha = 0.15f)
        effectiveLevel == ReasonLevel.WARNING -> WallWarningAccent.copy(alpha = 0.15f)
        else -> WallNeutralAccent.copy(alpha = 0.1f)
    }

    // Title text color - matches section header colors
    val titleColor = when {
        isHint -> WallHintAccent
        effectiveLevel == ReasonLevel.ERROR -> WallErrorAccent
        effectiveLevel == ReasonLevel.WARNING -> WallWarningAccent
        else -> WallNeutralAccent
    }

    // Body text color (lighter variant for readability)
    val bodyColor = when {
        isHint -> WallOnHintContainer
        effectiveLevel == ReasonLevel.ERROR -> WallOnErrorContainer
        effectiveLevel == ReasonLevel.WARNING -> WallOnWarningContainer
        else -> WallOnNeutralContainer
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            // App icon with tinted background to blend with row
            appIcon?.let {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(iconBgColor),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = rememberDrawablePainter(drawable = it),
                        contentDescription = "$appName icon",
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(8.dp))
                    )
                }
            }
            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = appName,
                    fontWeight = FontWeight.Bold,
                    color = titleColor
                )
                if (itemInfo != null) {
                    if (itemInfo.isHint == true) {
                        Text(
                            text = itemInfo.hintText ?: "A better alternative exists",
                            style = MaterialTheme.typography.bodySmall,
                            color = bodyColor
                        )
                    } else {
                        val reasons = itemInfo.r.mapNotNull { reasonsMap[it] }
                        val reasonMessages = reasons.joinToString(separator = "\n") { "• ${it.message}" }
                        Text(
                            text = reasonMessages,
                            style = MaterialTheme.typography.bodySmall,
                            color = bodyColor
                        )
                    }
                } else {
                    Text(
                        text = app.packageName,
                        style = MaterialTheme.typography.bodySmall,
                        color = bodyColor.copy(alpha = 0.6f)
                    )
                }
            }

            if (itemInfo != null) {
                if (itemInfo.isHint == true && itemInfo.hintAndroidId != null) {
                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=${itemInfo.hintAndroidId}"))
                            context.startActivity(intent)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = WallPrimaryDark,
                            contentColor = WallTextOnPrimary
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Switch")
                    }
                } else {
                    IconButton(onClick = { onUninstallClicked(app.packageName) }) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Uninstall App",
                            tint = WallPrimary
                        )
                    }
                }
            }
        }
    }
}

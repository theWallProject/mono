package com.thewallboycott.android.ui.screens

import android.Manifest
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import java.net.URLEncoder
import android.util.Log
import androidx.core.graphics.drawable.toBitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import com.thewallboycott.android.R
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.accompanist.drawablepainter.rememberDrawablePainter
import com.thewallboycott.android.data.AppScanner
import com.thewallboycott.android.data.AssetDatabaseProvider
import com.thewallboycott.android.data.OfferPreferences
import com.thewallboycott.android.data.SystemPackageScanner
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.data.models.Reason
import com.thewallboycott.android.data.models.ReasonLevel
import com.thewallboycott.android.data.reasonsMap
import com.thewallboycott.android.share.AppRemovedData
import com.thewallboycott.android.share.ImageTemplate
import com.thewallboycott.android.share.ShareManager
import com.thewallboycott.android.share.ShareScenario
import com.thewallboycott.android.ui.components.ShareDialog
import com.thewallboycott.android.ui.components.SharePromptCard
import com.thewallboycott.android.ui.theme.*
import androidx.compose.runtime.derivedStateOf
import androidx.lifecycle.ViewModelProvider
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

fun AllItem.getEffectiveLevel(reasonsMap: Map<String, Reason>): ReasonLevel {
    if (this.isHint == true) return ReasonLevel.WARNING
    val hasError = this.r.any { reasonsMap[it]?.level == ReasonLevel.ERROR }
    return if (hasError) ReasonLevel.ERROR else ReasonLevel.WARNING
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppListScreen(
    externalRefreshTrigger: Int = 0,
    viewModel: AppListViewModel = run {
        val context = LocalContext.current
        viewModel(factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                return AppListViewModel(
                    AppScanner(AssetDatabaseProvider(context), SystemPackageScanner(context))
                ) as T
            }
        })
    }
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val isLoading = state.isLoading
    val blacklistedApps = state.blacklistedApps
    val bdsApps = state.bdsApps
    val hintedApps = state.hintedApps
    val otherApps = state.otherApps
    var internalRefreshTrigger by remember { mutableStateOf(0) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // Share functionality
    val shareManager = remember { ShareManager(context) }
    var showSharePrompt by remember { mutableStateOf(false) }
    var shareScenario by remember { mutableStateOf<ShareScenario?>(null) }
    var pendingUninstallAppName by remember { mutableStateOf<String?>(null) }
    var pendingUninstallPackageName by remember { mutableStateOf<String?>(null) }
    var pendingUninstallAppIcon by remember { mutableStateOf<Bitmap?>(null) }
    var pendingUninstallItemInfo by remember { mutableStateOf<AllItem?>(null) }
    val offerPrefs = remember { OfferPreferences(context) }
    var savedOffers by remember { mutableStateOf(offerPrefs.getSavedOffers()) }
    var showAppRemovedSheet by remember { mutableStateOf(false) }
    var removedAppName by remember { mutableStateOf<String?>(null) }
    var removedAppIcon by remember { mutableStateOf<Bitmap?>(null) }
    var showGeneralShareSheet by remember { mutableStateOf(false) }
    var showFlaggedAppsShareDialog by remember { mutableStateOf(false) }
    var showCleanScanShareDialog by remember { mutableStateOf(false) }
    var notificationPermissionGranted by remember {
        mutableStateOf(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
            } else true
        )
    }
    var notificationCardDismissed by remember { mutableStateOf(false) }

    fun refresh() {
        internalRefreshTrigger++
    }

    val requestPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        notificationPermissionGranted = isGranted
        if (isGranted) {
            refresh()
        }
    }

    val uninstallLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) {
        Log.d("AppListScreen", "Returned from uninstall prompt. Refreshing list.")
        val appName = pendingUninstallAppName
        val packageName = pendingUninstallPackageName
        val appIcon = pendingUninstallAppIcon

        // Only show share prompt if the app was actually uninstalled
        if (appName != null && packageName != null) {
            val isStillInstalled = try {
                context.packageManager.getPackageInfo(packageName, 0)
                true
            } catch (_: PackageManager.NameNotFoundException) {
                false
            }

            if (!isStillInstalled) {
                Log.d("AppListScreen", "App $appName was uninstalled, showing share prompt")
                removedAppName = appName
                removedAppIcon = appIcon
                showAppRemovedSheet = true

                // Save offer if the app had alternatives
                pendingUninstallItemInfo?.let { itemInfo ->
                    if (!itemInfo.alt.isNullOrEmpty()) {
                        offerPrefs.saveOffer(
                            packageName = packageName,
                            appName = appName,
                            entityName = itemInfo.n,
                            alternatives = itemInfo.alt
                        )
                        savedOffers = offerPrefs.getSavedOffers()
                        Log.d("AppListScreen", "Saved offer for $appName with ${itemInfo.alt.size} alternatives")
                    }
                }
            } else {
                Log.d("AppListScreen", "App $appName uninstall was cancelled")
            }
        }

        pendingUninstallAppName = null
        pendingUninstallPackageName = null
        pendingUninstallAppIcon = null
        pendingUninstallItemInfo = null
        refresh()
    }

    // Combine internal and external triggers
    val combinedTrigger = internalRefreshTrigger + externalRefreshTrigger

    LaunchedEffect(combinedTrigger) {
        if (combinedTrigger > 0) {
            Log.d("AppListScreen", "LaunchedEffect started (trigger: $combinedTrigger)")
            showSharePrompt = false
            viewModel.scan()
        }
    }

    // Share scenario logic after scan completes
    LaunchedEffect(state.scanCompleted) {
        if (state.scanCompleted) {
            delay(1500) // 1.5s delay as per plan
            val flaggedCount = blacklistedApps.size + bdsApps.size
            if (flaggedCount == 0 && hintedApps.isEmpty()) {
                if (shareManager.shouldShowNoAppsPrompt()) {
                    shareScenario = ShareScenario.NO_APPS_FOUND
                    showSharePrompt = true
                    shareManager.markNoAppsPromptShown()
                }
            } else if (flaggedCount > 0) {
                if (shareManager.shouldShowAppsFoundPrompt()) {
                    shareScenario = ShareScenario.APPS_FOUND
                    showSharePrompt = true
                    shareManager.markAppsFoundPromptShown()
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        refresh()
    }

    Box(modifier = Modifier.fillMaxSize().background(WallBackground)) {
        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = WallPrimary)
            }
        } else {
            val listState = rememberLazyListState()
            val canScrollDown by remember {
                derivedStateOf { listState.canScrollForward }
            }

            // Filter hints to only show those with Switch action (hintAndroidId)
            val hintsWithSwitch = hintedApps.filter { (_, itemInfo) -> itemInfo.hintAndroidId != null }

            Box(modifier = Modifier.fillMaxSize()) {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp)
                ) {
                    // Notification permission card at top - show if not granted and not dismissed
                    if (!notificationPermissionGranted && !notificationCardDismissed && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        item {
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = WallSurfaceVariant)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Icon(
                                            Icons.Default.Notifications,
                                            contentDescription = null,
                                            tint = WallPrimary,
                                            modifier = Modifier.size(24.dp)
                                        )
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Text(
                                            text = stringResource(R.string.notif_title),
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = WallOnSurface,
                                            modifier = Modifier.weight(1f)
                                        )
                                        IconButton(
                                            onClick = { notificationCardDismissed = true },
                                            modifier = Modifier.size(24.dp)
                                        ) {
                                            Icon(
                                                Icons.Default.Close,
                                                contentDescription = stringResource(R.string.cd_dismiss),
                                                tint = WallOnSurfaceVariant,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = stringResource(R.string.notif_description),
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = WallOnSurfaceVariant
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Button(
                                        onClick = {
                                            requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = WallPrimary,
                                            contentColor = WallTextOnPrimary
                                        ),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Notifications,
                                            contentDescription = null,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            stringResource(R.string.notif_turn_on),
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Israeli Apps section - only show title if there are flagged apps
                    if (blacklistedApps.isNotEmpty()) {
                        item {
                            Text(
                                stringResource(R.string.section_israeli_apps),
                                style = MaterialTheme.typography.headlineSmall,
                                modifier = Modifier.padding(bottom = 8.dp),
                                fontWeight = FontWeight.Bold,
                                color = WallErrorAccent
                            )
                        }

                        // Show blacklisted apps
                        items(blacklistedApps) { (app, itemInfo) ->
                            val pm = context.packageManager
                            val appName = app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName
                            AppInfoCard(app = app, itemInfo = itemInfo, onUninstallClicked = { packageName ->
                                pendingUninstallAppName = appName
                                pendingUninstallPackageName = packageName
                                pendingUninstallItemInfo = itemInfo
                                // Cache icon before uninstall (icon becomes unavailable after uninstall)
                                pendingUninstallAppIcon = try {
                                    app.applicationInfo?.loadIcon(pm)?.toBitmap()
                                } catch (_: Exception) {
                                    null
                                }
                                val intent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$packageName"))
                                uninstallLauncher.launch(intent)
                            })
                        }

                        // Share prompt - always show when there are flagged apps
                        item {
                            val firstAppName = blacklistedApps.firstOrNull()?.let { (app, _) ->
                                app.applicationInfo?.loadLabel(context.packageManager)?.toString()
                            }
                            SharePromptCard(
                                content = shareManager.getAppsFoundContent(
                                    flaggedCount = blacklistedApps.size + bdsApps.size,
                                    firstAppName = firstAppName
                                ),
                                onShareClick = {
                                    showFlaggedAppsShareDialog = true
                                },
                                onDismiss = {
                                    // No-op, always visible
                                },
                                scenario = ShareScenario.APPS_FOUND
                            )
                        }
                    }

                    // BDS Section - "On the BDS List"
                    if (bdsApps.isNotEmpty()) {
                        item {
                            Spacer(modifier = Modifier.height(if (blacklistedApps.isNotEmpty()) 16.dp else 0.dp))
                            Text(
                                stringResource(R.string.section_bds_list),
                                style = MaterialTheme.typography.headlineSmall,
                                modifier = Modifier.padding(bottom = 8.dp),
                                fontWeight = FontWeight.Bold,
                                color = WallBdsAccent
                            )
                        }
                        items(bdsApps) { (app, itemInfo) ->
                            val pm = context.packageManager
                            val appName = app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName
                            BdsAppInfoCard(app = app, itemInfo = itemInfo, onUninstallClicked = { packageName ->
                                pendingUninstallAppName = appName
                                pendingUninstallPackageName = packageName
                                pendingUninstallItemInfo = itemInfo
                                // Cache icon before uninstall (icon becomes unavailable after uninstall)
                                pendingUninstallAppIcon = try {
                                    app.applicationInfo?.loadIcon(pm)?.toBitmap()
                                } catch (_: Exception) {
                                    null
                                }
                                val intent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$packageName"))
                                uninstallLauncher.launch(intent)
                            })
                        }
                    }

                    // Replacement cards for uninstalled apps with alternatives
                    if (savedOffers.isNotEmpty()) {
                        item {
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                stringResource(R.string.replacement_section_title),
                                style = MaterialTheme.typography.headlineSmall,
                                modifier = Modifier.padding(bottom = 8.dp),
                                fontWeight = FontWeight.Bold,
                                color = WallSuccessAccent
                            )
                        }
                        items(savedOffers, key = { it.packageName }) { offer ->
                            ReplacementOfferCard(
                                offer = offer,
                                onDismiss = {
                                    offerPrefs.removeOffer(offer.packageName)
                                    savedOffers = offerPrefs.getSavedOffers()
                                }
                            )
                        }
                    }

                    // Success card - only show when no flagged apps
                    if (blacklistedApps.isEmpty() && bdsApps.isEmpty()) {
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
                                                stringResource(R.string.status_clean),
                                                style = MaterialTheme.typography.titleLarge,
                                                color = WallSuccessAccent,
                                                fontWeight = FontWeight.Bold
                                            )
                                            Text(
                                                stringResource(R.string.status_clean_description),
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = WallSuccessAccent.copy(alpha = 0.8f)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Button(
                                        onClick = {
                                            showCleanScanShareDialog = true
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
                                            stringResource(R.string.btn_dare_friend),
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
                        }

                        // Share prompt for "no apps found" scenario
                        if (showSharePrompt && shareScenario == ShareScenario.NO_APPS_FOUND) {
                            item {
                                SharePromptCard(
                                    content = shareManager.getNoAppsFoundContent(),
                                    onShareClick = {
                                        showCleanScanShareDialog = true
                                    },
                                    onDismiss = {
                                        showSharePrompt = false
                                        shareManager.dismissNoAppsPrompt()
                                    },
                                    scenario = ShareScenario.NO_APPS_FOUND
                                )
                            }
                        }
                    }

                    // Better Alternatives section - only show items with Switch action
                    if (hintsWithSwitch.isNotEmpty()) {
                        item {
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                stringResource(R.string.section_alternatives),
                                style = MaterialTheme.typography.headlineSmall,
                                modifier = Modifier.padding(bottom = 8.dp),
                                fontWeight = FontWeight.Bold,
                                color = WallSecondary
                            )
                        }
                        items(hintsWithSwitch) { (app, itemInfo) ->
                            val pm = context.packageManager
                            val appName = app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName
                            HintAppCard(app = app, itemInfo = itemInfo, onUninstallClicked = { packageName ->
                                pendingUninstallAppName = appName
                                pendingUninstallPackageName = packageName
                                pendingUninstallItemInfo = itemInfo
                                // Cache icon before uninstall (icon becomes unavailable after uninstall)
                                pendingUninstallAppIcon = try {
                                    app.applicationInfo?.loadIcon(pm)?.toBitmap()
                                } catch (_: Exception) {
                                    null
                                }
                                val intent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$packageName"))
                                uninstallLauncher.launch(intent)
                            })
                        }
                    }

                    if (otherApps.isNotEmpty()) {
                        item {
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                stringResource(R.string.section_aligned),
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

                    // Bottom padding
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                    }
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
            }
        }
    }

    // Dialog for app removed share prompt
    if (showAppRemovedSheet && removedAppName != null) {
        ShareDialog(
            content = shareManager.getAppRemovedContent(removedAppName!!),
            shareManager = shareManager,
            imageTemplate = ImageTemplate.APP_REMOVED,
            imageData = AppRemovedData(removedAppName!!, removedAppIcon),
            onDismiss = {
                showAppRemovedSheet = false
                shareManager.dismissAppRemovedPrompt()
                removedAppName = null
                removedAppIcon = null
            },
            onShareComplete = {
                showAppRemovedSheet = false
                removedAppName = null
                removedAppIcon = null
            }
        )
    }

    // Dialog for general share
    if (showGeneralShareSheet) {
        ShareDialog(
            content = shareManager.getGeneralContent(),
            shareManager = shareManager,
            imageTemplate = ImageTemplate.GENERAL,
            onDismiss = { showGeneralShareSheet = false },
            onShareComplete = { showGeneralShareSheet = false }
        )
    }

    // Dialog for flagged apps share
    if (showFlaggedAppsShareDialog) {
        val pm = context.packageManager
        val firstAppName = blacklistedApps.firstOrNull()?.let { (app, _) ->
            app.applicationInfo?.loadLabel(pm)?.toString()
        }
        val allFlaggedApps = blacklistedApps + bdsApps
        val allAppNames = allFlaggedApps.map { (app, _) ->
            app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName
        }
        val allAppIcons = allFlaggedApps.map { (app, _) ->
            try {
                app.applicationInfo?.loadIcon(pm)?.toBitmap()
            } catch (_: Exception) {
                null
            }
        }
        ShareDialog(
            content = shareManager.getAppsFoundContent(
                flaggedCount = allFlaggedApps.size,
                firstAppName = firstAppName
            ),
            shareManager = shareManager,
            imageTemplate = ImageTemplate.FLAGGED_APPS,
            imageData = ShareManager.FlaggedAppsData(
                count = allFlaggedApps.size,
                appNames = allAppNames,
                appIcons = allAppIcons
            ),
            onDismiss = { showFlaggedAppsShareDialog = false },
            onShareComplete = { showFlaggedAppsShareDialog = false }
        )
    }

    // Dialog for clean scan share (challenge / no apps found)
    if (showCleanScanShareDialog) {
        ShareDialog(
            content = shareManager.getChallengeContent(),
            shareManager = shareManager,
            imageTemplate = ImageTemplate.CLEAN_SCAN,
            onDismiss = { showCleanScanShareDialog = false },
            onShareComplete = { showCleanScanShareDialog = false }
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
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
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
                            contentDescription = stringResource(R.string.cd_app_icon, appName),
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
                                text = itemInfo.hintText ?: stringResource(R.string.hint_alternative_exists),
                                style = MaterialTheme.typography.bodySmall,
                                color = bodyColor
                            )
                        } else {
                            val reasons = itemInfo.r.mapNotNull { reasonsMap[it] }
                            Column {
                                reasons.forEach { reason ->
                                    Text(
                                        text = "• ${stringResource(reason.messageResId)}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = bodyColor
                                    )
                                }
                            }
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
                                containerColor = WallSecondary,
                                contentColor = WallTextOnPrimary
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(stringResource(R.string.btn_switch))
                        }
                    } else {
                        IconButton(onClick = { onUninstallClicked(app.packageName) }) {
                            Icon(
                                Icons.Default.Delete,
                                contentDescription = stringResource(R.string.cd_uninstall_app),
                                tint = WallPrimary
                            )
                        }
                    }
                } else {
                    // Flag/report button for safe apps
                    val reportSubject = stringResource(R.string.report_subject, appName)
                    val reportBody = stringResource(R.string.report_body, appName, app.packageName)
                    val chooserTitle = stringResource(R.string.chooser_report_app)
                    IconButton(
                        onClick = {
                            val encodedSubject = URLEncoder.encode(reportSubject, "UTF-8").replace("+", "%20")
                            val encodedBody = URLEncoder.encode(reportBody, "UTF-8").replace("+", "%20")
                            val intent = Intent(Intent.ACTION_SENDTO).apply {
                                data = Uri.parse("mailto:app@thewall.bot?subject=$encodedSubject&body=$encodedBody")
                            }
                            context.startActivity(Intent.createChooser(intent, chooserTitle))
                        }
                    ) {
                        Icon(
                            Icons.Default.Flag,
                            contentDescription = stringResource(R.string.cd_report_app),
                            tint = WallOnSurfaceVariant
                        )
                    }
                }
            }

            // Show alternatives sub-card if available
            if (itemInfo != null && !itemInfo.alt.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = WallSecondaryContainer),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = stringResource(R.string.btn_try_these_instead),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = WallOnSecondaryContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        itemInfo.alt.forEach { alternative ->
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
                                    Text(stringResource(R.string.btn_view), fontWeight = FontWeight.SemiBold)
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
fun BdsAppInfoCard(
    app: PackageInfo,
    itemInfo: AllItem,
    onUninstallClicked: (String) -> Unit
) {
    val context = LocalContext.current
    val pm = context.packageManager
    val appName = remember(app) { app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName }
    val appIcon = remember(app) { app.applicationInfo?.loadIcon(pm) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = WallBdsContainer),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // App icon with tinted background
                appIcon?.let {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(WallBdsAccent.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = rememberDrawablePainter(drawable = it),
                            contentDescription = stringResource(R.string.cd_app_icon, appName),
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
                        color = WallBdsAccent
                    )
                    val reasons = itemInfo.r.mapNotNull { reasonsMap[it] }
                    Column {
                        reasons.forEach { reason ->
                            Text(
                                text = "• ${stringResource(reason.messageResId)}",
                                style = MaterialTheme.typography.bodySmall,
                                color = WallOnBdsContainer
                            )
                        }
                    }
                }

                IconButton(onClick = { onUninstallClicked(app.packageName) }) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = stringResource(R.string.cd_uninstall_app),
                        tint = WallBdsAccent
                    )
                }
            }

            // Show alternatives sub-card if available
            if (!itemInfo.alt.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = WallSecondaryContainer),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = stringResource(R.string.btn_try_these_instead),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = WallOnSecondaryContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        itemInfo.alt.forEach { alternative ->
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
                                    Text(stringResource(R.string.btn_view), fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Card for hint apps (Better Alternatives Available section).
 * Shows the installed app with delete button, and a nested sub-card
 * promoting the alternative with a Switch button.
 */
@Composable
fun HintAppCard(
    app: PackageInfo,
    itemInfo: AllItem,
    onUninstallClicked: (String) -> Unit
) {
    val context = LocalContext.current
    val pm = context.packageManager
    val appName = remember(app) { app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName }
    val appIcon = remember(app) { app.applicationInfo?.loadIcon(pm) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = WallNeutralContainer),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Main row: Installed app with delete button
            Row(verticalAlignment = Alignment.CenterVertically) {
                // App icon with subtle background
                appIcon?.let {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(WallOnNeutralContainer.copy(alpha = 0.08f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = rememberDrawablePainter(drawable = it),
                            contentDescription = stringResource(R.string.cd_app_icon, appName),
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                        )
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = appName,
                        fontWeight = FontWeight.SemiBold,
                        color = WallOnSurface
                    )
                    Text(
                        text = stringResource(R.string.status_installed),
                        style = MaterialTheme.typography.bodySmall,
                        color = WallOnNeutralContainer
                    )
                }

                // Delete button (same as blacklist items)
                IconButton(onClick = { onUninstallClicked(app.packageName) }) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = stringResource(R.string.cd_uninstall_app),
                        tint = WallPrimary
                    )
                }
            }

            // Nested alternative sub-card
            if (itemInfo.hintAndroidId != null) {
                Spacer(modifier = Modifier.height(8.dp))

                // Alternative card with green theme
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = WallSecondaryContainer),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = itemInfo.hintText ?: stringResource(R.string.hint_alternative_exists),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            color = WallOnSecondaryContainer,
                            modifier = Modifier.weight(1f)
                        )

                        Spacer(modifier = Modifier.width(12.dp))

                        // Switch button
                        Button(
                            onClick = {
                                val intent = Intent(
                                    Intent.ACTION_VIEW,
                                    Uri.parse("market://details?id=${itemInfo.hintAndroidId}")
                                )
                                context.startActivity(intent)
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = WallSecondary,
                                contentColor = WallTextOnPrimary
                            ),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            Text(stringResource(R.string.btn_switch), fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}

/**
 * Replacement card shown for uninstalled apps that had alternatives.
 * Appears in place of the removed app to offer alternatives.
 */
@Composable
fun ReplacementOfferCard(
    offer: OfferPreferences.SavedOffer,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = WallSuccessContainer),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Header row with icon, title and dismiss button
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = WallSuccessAccent,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = stringResource(R.string.replacement_title, offer.appName),
                        fontWeight = FontWeight.Bold,
                        color = WallSuccessAccent
                    )
                }

                IconButton(onClick = onDismiss) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = stringResource(R.string.cd_dismiss),
                        tint = WallOnSuccessContainer.copy(alpha = 0.6f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Alternatives list
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = WallSecondaryContainer),
                shape = RoundedCornerShape(10.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = stringResource(R.string.btn_try_these_instead),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = WallOnSecondaryContainer
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    offer.alternatives.forEach { alt ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = alt.n,
                                style = MaterialTheme.typography.bodyMedium,
                                color = WallOnSecondaryContainer,
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(
                                onClick = {
                                    val url = if (alt.ws.startsWith("http")) alt.ws else "https://${alt.ws}"
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                    context.startActivity(intent)
                                },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    Icons.AutoMirrored.Filled.OpenInNew,
                                    contentDescription = stringResource(R.string.cd_open_link),
                                    tint = WallSecondary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

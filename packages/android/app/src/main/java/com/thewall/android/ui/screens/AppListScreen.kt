package com.thewall.android.ui.screens

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
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.google.accompanist.drawablepainter.rememberDrawablePainter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewall.android.data.models.AllItem
import com.thewall.android.data.models.Reason
import com.thewall.android.data.models.ReasonLevel
import com.thewall.android.data.reasonsMap
import com.thewall.android.util.readFile
import kotlinx.coroutines.Dispatchers
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
            (item.androidAppIds?.contains(app.packageName) == true)
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
        refresh()
    }

    LaunchedEffect(refreshTrigger) {
        if (refreshTrigger > 0) {
            Log.d("AppListScreen", "LaunchedEffect started (trigger: $refreshTrigger)")
            isLoading = true
            scope.launch {
                val results = performAppScan(context)
                withContext(Dispatchers.Main) {
                    blacklistedApps = results.blacklisted
                    hintedApps = results.hinted
                    otherApps = results.other
                    isLoading = false
                    Log.d("AppListScreen", "isLoading set to false")
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
            title = { Text("Permission Required") },
            text = { Text("To notify you about newly installed boycotted apps in the background, this app requires notification permissions.") },
            confirmButton = {
                Button(onClick = {
                    showPermissionRationale = false
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                }) { Text("Continue") }
            },
            dismissButton = {
                Button(onClick = { showPermissionRationale = false }) { Text("Cancel") }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scanned Apps", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { askForNotificationPermission() }, enabled = !isLoading) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh Scan")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(paddingValues),
                contentPadding = PaddingValues(16.dp)
            ) {
                if (blacklistedApps.isEmpty() && hintedApps.isEmpty()) {
                    item {
                        Text(
                            "Device is Clean!",
                            style = MaterialTheme.typography.titleLarge,
                            color = Color(0xFF006400),
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                    }
                }

                if (blacklistedApps.isNotEmpty()) {
                    item {
                        Text(
                            "Caught Apps",
                            style = MaterialTheme.typography.headlineSmall,
                            modifier = Modifier.padding(bottom = 8.dp),
                            fontWeight = FontWeight.Bold,
                            color = Color.Red
                        )
                    }
                    items(blacklistedApps) { (app, itemInfo) ->
                        AppInfoCard(app = app, itemInfo = itemInfo, onUninstallClicked = {
                            val intent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$it"))
                            uninstallLauncher.launch(intent)
                        })
                    }
                }

                if (hintedApps.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Suggestions",
                            style = MaterialTheme.typography.headlineSmall,
                            modifier = Modifier.padding(bottom = 8.dp),
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFFFA500) // Orange
                        )
                    }
                    items(hintedApps) { (app, itemInfo) ->
                        AppInfoCard(app = app, itemInfo = itemInfo, onUninstallClicked = {
                            val intent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$it"))
                            uninstallLauncher.launch(intent)
                        })
                    }
                }

                if (otherApps.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "All Other Apps",
                            style = MaterialTheme.typography.headlineSmall,
                            modifier = Modifier.padding(bottom = 8.dp),
                            fontWeight = FontWeight.Bold
                        )
                    }
                    items(otherApps) { app ->
                        AppInfoCard(app = app, itemInfo = null, onUninstallClicked = {})
                    }
                }
            }
        }
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

    val cardColor = when (effectiveLevel) {
        ReasonLevel.ERROR -> Color.Red.copy(alpha = 0.2f)
        ReasonLevel.WARNING -> Color.Yellow.copy(alpha = 0.3f)
        null -> MaterialTheme.colorScheme.surfaceVariant
    }

    val icon = when (effectiveLevel) {
        ReasonLevel.ERROR -> Icons.Default.Warning
        ReasonLevel.WARNING -> Icons.Default.Info
        null -> Icons.Default.CheckCircle
    }

    val iconColor = when (effectiveLevel) {
        ReasonLevel.ERROR -> Color.Red
        ReasonLevel.WARNING -> Color(0xFFFFA500) // Orange
        null -> Color.Green
    }

    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = "Status Icon",
                tint = iconColor,
                modifier = Modifier.padding(end = 8.dp)
            )

            appIcon?.let {
                Image(
                    painter = rememberDrawablePainter(drawable = it),
                    contentDescription = "$appName icon",
                    modifier = Modifier.size(40.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(text = appName, fontWeight = FontWeight.Bold)
                if (itemInfo != null) {
                    if (itemInfo.isHint == true) {
                        Text(
                            text = itemInfo.hintText ?: "Suggestion available",
                            style = MaterialTheme.typography.bodySmall
                        )
                    } else {
                        val reasons = itemInfo.r.mapNotNull { reasonsMap[it] }
                        val reasonMessages = reasons.joinToString(separator = "\n") { "- ${it.message}" }
                        Text(text = reasonMessages, style = MaterialTheme.typography.bodySmall)
                    }
                } else {
                    Text(text = app.packageName, style = MaterialTheme.typography.bodySmall)
                }
            }

            if (itemInfo != null) {
                if (itemInfo.isHint == true && itemInfo.hintAndroidId != null) {
                    Button(onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=${itemInfo.hintAndroidId}"))
                        context.startActivity(intent)
                    }) {
                        Text("Install")
                    }
                } else {
                    IconButton(onClick = { onUninstallClicked(app.packageName) }) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Uninstall App",
                            tint = Color.Red.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
    }
}

package com.thewall.android.ui.screens

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
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
import com.google.accompanist.drawablepainter.rememberDrawablePainter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewall.android.MainActivity
import com.thewall.android.data.BlacklistItem
import com.thewall.android.data.Reason
import com.thewall.android.data.ReasonLevel
import com.thewall.android.data.getEffectiveLevel
import com.thewall.android.data.reasonsMap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

private data class AppScanResults(
    val blacklisted: List<Pair<PackageInfo, BlacklistItem>>,
    val other: List<PackageInfo>
)

private suspend fun performAppScan(context: Context): AppScanResults {
    Log.d("AppListScreen", "Background thread started for app scan")
    val gson = Gson()
    val assetManager = context.assets

    // Load blacklist
    val blacklistJson = MainActivity.readFile(assetManager, "blacklist.json")
    val blacklistType = object : TypeToken<List<BlacklistItem>>() {}.type
    val blacklist = gson.fromJson<List<BlacklistItem>>(blacklistJson, blacklistType)
    Log.d("AppListScreen", "Blacklist loaded with ${blacklist.size} items")

    // Get installed apps
    val installedApps =
        context.packageManager.getInstalledPackages(PackageManager.GET_META_DATA)
    Log.d("AppListScreen", "Found ${installedApps.size} installed apps")

    // Match apps: check exact matches for androidAppIds, prefix matches for androidDevId
    val (bad, good) = installedApps.partition { app ->
        blacklist.any { item ->
            (item.androidAppIds != null && item.androidAppIds.isNotEmpty() && app.packageName in item.androidAppIds) ||
                    (item.androidDevId != null && app.packageName.startsWith(item.androidDevId))
        }
    }
    val blacklistedApps = bad.map { app ->
        app to blacklist.first { item ->
            (item.androidAppIds != null && item.androidAppIds.isNotEmpty() && app.packageName in item.androidAppIds) ||
                    (item.androidDevId != null && app.packageName.startsWith(item.androidDevId))
        }
    }
    val otherApps = good.filter {
        (it.applicationInfo?.flags
            ?: 0) and (ApplicationInfo.FLAG_SYSTEM or ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0
    }
    return AppScanResults(blacklistedApps, otherApps)
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppListScreen() {
    var isLoading by remember { mutableStateOf(true) }
    var blacklistedApps by remember { mutableStateOf<List<Pair<PackageInfo, BlacklistItem>>>(emptyList()) }
    var otherApps by remember { mutableStateOf<List<PackageInfo>>(emptyList()) }
    var refreshTrigger by remember { mutableStateOf(0) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    fun refresh() {
        refreshTrigger++
    }

    val uninstallLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) {
        // This block is executed when the user returns from the uninstall prompt.
        // We refresh the list regardless of whether they completed the uninstall.
        Log.d("AppListScreen", "Returned from uninstall prompt. Refreshing list.")
        refresh()
    }

    LaunchedEffect(refreshTrigger) {
        Log.d("AppListScreen", "LaunchedEffect started (trigger: $refreshTrigger)")
        isLoading = true
        scope.launch(Dispatchers.IO) {
            val results = performAppScan(context)
            withContext(Dispatchers.Main) {
                blacklistedApps = results.blacklisted
                otherApps = results.other
                isLoading = false
                Log.d("AppListScreen", "isLoading set to false")
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scanned Apps", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { refresh() }, enabled = !isLoading) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh Scan")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp)
            ) {

                if (blacklistedApps.isEmpty()) {
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
                    items(blacklistedApps) { (app, blacklistInfo) ->
                        AppInfo(
                            app = app,
                            blacklistInfo = blacklistInfo,
                            reasonsMap = reasonsMap,
                            onUninstallClicked = { packageName ->
                                val intent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$packageName"))
                                uninstallLauncher.launch(intent)
                            }
                        )
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
                        AppInfo(app = app, blacklistInfo = null, reasonsMap = reasonsMap, onUninstallClicked = {})
                    }
                }
            }
        }
    }
}

@Composable
fun AppInfo(
    app: PackageInfo,
    blacklistInfo: BlacklistItem?,
    reasonsMap: Map<String, Reason>,
    onUninstallClicked: (String) -> Unit
) {
    val context = LocalContext.current
    val pm = context.packageManager
    val appName = remember(app) {
        app.applicationInfo?.loadLabel(pm)?.toString() ?: app.packageName
    }
    val appIcon = remember(app) { app.applicationInfo?.loadIcon(pm) }

    val effectiveLevel = blacklistInfo?.getEffectiveLevel(reasonsMap)

    val cardColor = when (effectiveLevel) {
        ReasonLevel.ERROR -> Color.Red.copy(alpha = 0.2f)
        ReasonLevel.WARNING -> Color.Yellow.copy(alpha = 0.3f)
        null -> MaterialTheme.colorScheme.surfaceVariant
    }

    val icon = when (effectiveLevel) {
        ReasonLevel.ERROR -> Icons.Default.Warning
        ReasonLevel.WARNING -> Icons.Default.Warning
        null -> Icons.Default.CheckCircle
    }

    val iconColor = when (effectiveLevel) {
        ReasonLevel.ERROR -> Color.Red
        ReasonLevel.WARNING -> Color(0xFFFFA500) // Orange
        null -> Color.Green
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
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
                if (blacklistInfo != null) {
                    val reasons = blacklistInfo.reasonIds.mapNotNull { reasonsMap[it] }
                    val reasonMessages =
                        reasons.joinToString(separator = "\n") { "- ${it.message}" }
                    Text(text = reasonMessages, style = MaterialTheme.typography.bodySmall)
                } else {
                    Text(text = app.packageName, style = MaterialTheme.typography.bodySmall)
                }
            }

            if (blacklistInfo != null) {
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

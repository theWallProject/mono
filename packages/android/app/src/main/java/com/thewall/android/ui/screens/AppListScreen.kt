package com.thewall.android.ui.screens

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import kotlinx.coroutines.withContext

@Composable
fun AppListScreen() {
    var isLoading by remember { mutableStateOf(true) }
    var blacklistedApps by remember {
        mutableStateOf<List<Pair<PackageInfo, BlacklistItem>>>(
            emptyList()
        )
    }
    var otherApps by remember { mutableStateOf<List<PackageInfo>>(emptyList()) }
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        Log.d("AppListScreen", "LaunchedEffect started")
        isLoading = true
        withContext(Dispatchers.IO) {
            Log.d("AppListScreen", "Background thread started")
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

            // Match apps: package name should start with androidDevId (e.g., "com.wix.app" matches "com.wix")
            val (bad, good) = installedApps.partition { app ->
                blacklist.any { item -> app.packageName.startsWith(item.androidDevId) }
            }
            blacklistedApps = bad.map { app ->
                app to blacklist.first { item -> app.packageName.startsWith(item.androidDevId) }
            }
            otherApps = good.filter {
                (it.applicationInfo?.flags
                    ?: 0) and (ApplicationInfo.FLAG_SYSTEM or ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0
            }
        }
        isLoading = false
        Log.d("AppListScreen", "isLoading set to false")
    }

    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp)
        ) {
            item {
                Column(modifier = Modifier.padding(bottom = 16.dp)) {
                    Text(
                        "The Wall",
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    if (blacklistedApps.isEmpty()) {
                        Text(
                            "Device is Clean!",
                            style = MaterialTheme.typography.bodyLarge,
                            color = Color.Green
                        )
                    }
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
                    AppInfo(app = app, blacklistInfo = blacklistInfo, reasonsMap = reasonsMap)
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
                    AppInfo(app = app, blacklistInfo = null, reasonsMap = reasonsMap)
                }
            }
        }
    }
}

@Composable
fun AppInfo(app: PackageInfo, blacklistInfo: BlacklistItem?, reasonsMap: Map<String, Reason>) {
    val pm = LocalContext.current.packageManager
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
            Column {
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
        }
    }
}
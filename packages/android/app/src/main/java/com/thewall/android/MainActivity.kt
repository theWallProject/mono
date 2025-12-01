package com.thewall.android

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.res.AssetManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.google.accompanist.drawablepainter.rememberDrawablePainter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewall.android.ui.theme.TheWallBoycottAssistantTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {

    // A launcher to request the permission result back from the Settings screen.
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        // This block executes when we return from the settings screen.
        // We don't need to check the result; we just re-check the permission state.
        // The onResume will handle the navigation if permission was granted.
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TheWallBoycottAssistantTheme {
                MainScreen()
            }
        }
    }

    private fun hasQueryAllPackagesPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            checkSelfPermission(android.Manifest.permission.QUERY_ALL_PACKAGES) == PackageManager.PERMISSION_GRANTED
        } else {
            true // Permission is not needed for older Android versions.
        }
    }

    private fun requestQueryAllPackagesPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
                data = "package:$packageName".toUri()
            }
            permissionLauncher.launch(intent)
        }
    }

    @Composable
    private fun MainScreen() {
        var screen by remember { mutableStateOf<Screen>(Screen.Start) }

        // This effect runs whenever the `screen` state changes to List.
        LaunchedEffect(screen) {
            if (screen is Screen.List && !(screen as Screen.List).permissionGranted) {
                if (hasQueryAllPackagesPermission()) {
                    screen = Screen.List(permissionGranted = true)
                }
            }
        }

        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            when (val currentScreen = screen) {
                is Screen.Start -> {
                    StartScreen(
                        onScanClicked = {
                            screen = if (hasQueryAllPackagesPermission()) {
                                Screen.List(permissionGranted = true)
                            } else {
                                Screen.Permission
                            }
                        }
                    )
                }

                is Screen.Permission -> {
                    PermissionRequestScreen(
                        onRequestPermission = {
                            requestQueryAllPackagesPermission()
                            // After requesting, we want to check again when the user returns.
                            // We'll go to the list screen, which will re-evaluate on resume.
                            screen = Screen.List(permissionGranted = false)
                        }
                    )
                }

                is Screen.List -> {
                    if (currentScreen.permissionGranted) {
                        AppListScreen()
                    } else {
                        // This will show while we wait for the user to grant the permission
                        // after they've returned from settings. onResume will trigger the update.
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CircularProgressIndicator()
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("Waiting for permission...")
                            }
                        }
                    }
                }
            }
        }

        // Re-check permission every time the app comes into the foreground.
        val lifecycleOwner = LocalLifecycleOwner.current
        DisposableEffect(lifecycleOwner) {
            val observer = LifecycleEventObserver { _, event ->
                if (event == Lifecycle.Event.ON_RESUME) {
                    if (screen is Screen.List && !(screen as Screen.List).permissionGranted) {
                        if (hasQueryAllPackagesPermission()) {
                            screen = Screen.List(permissionGranted = true)
                        }
                    }
                }
            }
            lifecycleOwner.lifecycle.addObserver(observer)
            onDispose {
                lifecycleOwner.lifecycle.removeObserver(observer)
            }
        }
    }
}

sealed class Screen {
    object Start : Screen()
    object Permission : Screen()
    data class List(val permissionGranted: Boolean) : Screen()
}

@Composable
fun StartScreen(onScanClicked: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("The Wall", style = MaterialTheme.typography.headlineLarge)
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onScanClicked) {
            Text("Scan Installed Apps")
        }
    }
}


@Composable
fun PermissionRequestScreen(onRequestPermission: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            "Permission Required",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "This app needs special permission to scan all installed applications. This is required to check your apps against the boycott list.",
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onRequestPermission) {
            Text("Open Settings")
        }
    }
}

enum class ReasonLevel {
    WARNING,
    ERROR
}

data class Reason(
    val message: String,
    val level: ReasonLevel
)

data class BlacklistItem(
    val developerId: String,
    val reasonIds: List<String>
)

val reasonsMap = mapOf(
    "HQ" to Reason("Headquartered in Israel", ReasonLevel.ERROR),
    "INVESTOR" to Reason("Significant investment from Israeli VCs", ReasonLevel.WARNING),
    "FOUNDER" to Reason("Founded by Israeli entrepreneurs", ReasonLevel.ERROR),
    "BDS" to Reason("On the BDS boycott list", ReasonLevel.ERROR)
)

fun BlacklistItem.getEffectiveLevel(reasonsMap: Map<String, Reason>): ReasonLevel {
    val hasError = this.reasonIds.any { reasonsMap[it]?.level == ReasonLevel.ERROR }
    return if (hasError) ReasonLevel.ERROR else ReasonLevel.WARNING
}

fun AssetManager.readFile(fileName: String): String =
    open(fileName).bufferedReader().use { it.readText() }

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
            val blacklistJson = assetManager.readFile("blacklist.json")
            val blacklistType = object : TypeToken<List<BlacklistItem>>() {}.type
            val blacklist = gson.fromJson<List<BlacklistItem>>(blacklistJson, blacklistType)
            val blacklistMap = blacklist.associateBy { it.developerId }
            Log.d("AppListScreen", "Blacklist loaded with ${blacklist.size} items")

            // Get installed apps
            val installedApps =
                context.packageManager.getInstalledPackages(PackageManager.GET_META_DATA)
            Log.d("AppListScreen", "Found ${installedApps.size} installed apps")

            val (bad, good) = installedApps.partition { blacklistMap.containsKey(it.packageName) }
            blacklistedApps = bad.map { it to blacklistMap[it.packageName]!! }
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
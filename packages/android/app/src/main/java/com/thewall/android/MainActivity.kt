package com.thewall.android

import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
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
import com.google.accompanist.drawablepainter.rememberDrawablePainter
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
        DisposableEffect(Unit) {
            val lifecycleObserver = androidx.lifecycle.LifecycleEventObserver { _, event ->
                if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                    if (screen is Screen.List && !(screen as Screen.List).permissionGranted) {
                        if (hasQueryAllPackagesPermission()) {
                            screen = Screen.List(permissionGranted = true)
                        }
                    }
                }
            }
            this@MainActivity.lifecycle.addObserver(lifecycleObserver)
            onDispose {
                this@MainActivity.lifecycle.removeObserver(lifecycleObserver)
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
        Text("Ready to Scan", style = MaterialTheme.typography.headlineMedium)
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

val hardcodedBlacklist = setOf(
    "com.facebook.katana",      // Facebook
    "com.instagram.android",    // Instagram
    "com.twitter.android",      // Twitter / X
    "com.whatsapp",             // WhatsApp
    "com.facebook.orca",        // Facebook Messenger
    "com.google.android.youtube"// YouTube
)

@Composable
fun AppListScreen() {
    var installedApps by remember { mutableStateOf<List<PackageInfo>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        isLoading = true
        val apps = withContext(Dispatchers.IO) {
            context.packageManager.getInstalledPackages(PackageManager.GET_META_DATA)
        }
        installedApps = apps
        isLoading = false
    }

    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    } else {
        val (caughtApps, safeApps) = installedApps.partition {
            hardcodedBlacklist.contains(it.packageName)
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(8.dp)
        ) {
            item {
                Column(modifier = Modifier.padding(8.dp)) {
                    Text(
                        "App Scanner Results",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }

            if (caughtApps.isNotEmpty()) {
                item {
                    Text(
                        "Caught Apps",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(8.dp),
                        fontWeight = FontWeight.Bold,
                        color = Color.Red
                    )
                }
                items(caughtApps) { app ->
                    AppInfo(app = app, isCaught = true)
                }
            }

            if (safeApps.isNotEmpty()) {
                item {
                    Text(
                        "Safe Apps",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(8.dp),
                        fontWeight = FontWeight.Bold
                    )
                }
                items(safeApps) { app ->
                    AppInfo(app = app, isCaught = false)
                }
            }
        }
    }
}

@Composable
fun AppInfo(app: PackageInfo, isCaught: Boolean) {
    val pm = LocalContext.current.packageManager
    val appName = remember(app) {
        val applicationInfo = app.applicationInfo
        if (applicationInfo != null) {
            applicationInfo.loadLabel(pm).toString()
        } else {
            Log.w("AppInfo", "ApplicationInfo is null for package: ${app.packageName}")
            app.packageName
        }
    }
    val appIcon = remember(app) { app.applicationInfo?.loadIcon(pm) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCaught) Color.Red.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isCaught) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Warning",
                    tint = Color.Red,
                    modifier = Modifier.padding(end = 8.dp)
                )
            }
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
                Text(text = app.packageName, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
package com.thewall.android

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.AssetManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Scanner
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.core.net.toUri
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.thewall.android.background.ScanWorker
import com.thewall.android.ui.screens.AppListScreen
import com.thewall.android.ui.screens.PermissionRequestScreen
import com.thewall.android.ui.screens.StartScreen
import com.thewall.android.ui.theme.TheWallBoycottAssistantTheme
import com.thewall.android.ui.urllookup.UrlLookupScreen
import java.util.concurrent.TimeUnit

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {}

    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) {}

    private var sharedUrl by mutableStateOf<String?>(null)
    private var navigateToScreen by mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent)
        schedulePeriodicScan()
        setContent {
            TheWallBoycottAssistantTheme {
                MainScreen(
                    initialUrl = sharedUrl,
                    navigateToScreen = navigateToScreen,
                    onUrlHandled = { sharedUrl = null },
                    onNavigationHandled = { navigateToScreen = null },
                    requestNotificationPermission = { askForNotificationPermission() }
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
        setContent {
            TheWallBoycottAssistantTheme {
                MainScreen(
                    initialUrl = sharedUrl,
                    navigateToScreen = navigateToScreen,
                    onUrlHandled = { sharedUrl = null },
                    onNavigationHandled = { navigateToScreen = null },
                    requestNotificationPermission = { askForNotificationPermission() }
                )
            }
        }
    }

    private fun handleIntent(intent: Intent?) {
        if (intent?.action == Intent.ACTION_SEND && "text/plain" == intent.type) {
            sharedUrl = intent.getStringExtra(Intent.EXTRA_TEXT)
        }
        intent?.getStringExtra(ScanWorker.NAVIGATE_TO_SCREEN_EXTRA)?.let {
            navigateToScreen = it
        }
    }
    
    private fun schedulePeriodicScan() {
        // --- BREADCRUMB: Background Job Frequency ---
        // This is where the frequency of the periodic background scan is controlled.
        // The minimum interval allowed by Android is 15 minutes.
        val scanWorkRequest = PeriodicWorkRequestBuilder<ScanWorker>(15, TimeUnit.MINUTES).build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "PERIODIC_APP_SCAN",
            ExistingPeriodicWorkPolicy.KEEP,
            scanWorkRequest
        )
    }

    private fun hasQueryAllPackagesPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            checkSelfPermission(android.Manifest.permission.QUERY_ALL_PACKAGES) == PackageManager.PERMISSION_GRANTED
        } else {
            true
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

    private fun askForNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    @Composable
    private fun MainScreen(
        initialUrl: String?,
        navigateToScreen: String?,
        onUrlHandled: () -> Unit,
        onNavigationHandled: () -> Unit,
        requestNotificationPermission: () -> Unit
    ) {
        val defaultScreen = when {
            initialUrl != null -> Screen.UrlLookup
            navigateToScreen == ScanWorker.APP_SCAN_SCREEN -> Screen.List
            else -> Screen.List
        }
        var currentScreen by remember { mutableStateOf<Screen>(defaultScreen) }
        var scanState by remember { mutableStateOf(if (navigateToScreen == ScanWorker.APP_SCAN_SCREEN) ScanState.Scanning else ScanState.Idle) }
        var permissionGranted by remember { mutableStateOf(hasQueryAllPackagesPermission()) }

        LaunchedEffect(Unit) {
            requestNotificationPermission()
        }

        LaunchedEffect(initialUrl, navigateToScreen) {
            if (initialUrl != null) {
                currentScreen = Screen.UrlLookup
            }
            if (navigateToScreen == ScanWorker.APP_SCAN_SCREEN) {
                currentScreen = Screen.List
                scanState = ScanState.Scanning
                onNavigationHandled()
            }
        }

        val lifecycleOwner = LocalLifecycleOwner.current
        DisposableEffect(lifecycleOwner) {
            val observer = LifecycleEventObserver { _, event ->
                if (event == Lifecycle.Event.ON_RESUME) {
                    val hasPermission = hasQueryAllPackagesPermission()
                    if (hasPermission && !permissionGranted) {
                        scanState = ScanState.Scanning
                    }
                    permissionGranted = hasPermission
                }
            }
            lifecycleOwner.lifecycle.addObserver(observer)
            onDispose {
                lifecycleOwner.lifecycle.removeObserver(observer)
            }
        }

        Scaffold(
            bottomBar = {
                NavigationBar {
                    NavigationBarItem(
                        icon = { Icon(Icons.Filled.Scanner, contentDescription = "Scan Apps") },
                        label = { Text("Scan Apps") },
                        selected = currentScreen is Screen.List,
                        onClick = { currentScreen = Screen.List }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Filled.Search, contentDescription = "URL Lookup") },
                        label = { Text("URL Lookup") },
                        selected = currentScreen is Screen.UrlLookup,
                        onClick = { currentScreen = Screen.UrlLookup }
                    )
                }
            }
        ) { innerPadding ->
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                color = MaterialTheme.colorScheme.background
            ) {
                when (currentScreen) {
                    is Screen.List -> {
                        when (scanState) {
                            ScanState.Idle -> StartScreen(onScanClicked = { scanState = ScanState.Scanning })
                            ScanState.Scanning -> {
                                if (permissionGranted) {
                                    AppListScreen()
                                } else {
                                    PermissionRequestScreen(onRequestPermission = { requestQueryAllPackagesPermission() })
                                }
                            }
                        }
                    }
                    is Screen.UrlLookup -> UrlLookupScreen(
                        initialUrl = initialUrl,
                        onUrlHandled = onUrlHandled
                    )
                }
            }
        }
    }

    companion object {
        fun readFile(assetManager: AssetManager, fileName: String): String =
            assetManager.open(fileName).bufferedReader().use { it.readText() }
    }
}

sealed class Screen {
    object List : Screen()
    object UrlLookup : Screen()
}

enum class ScanState {
    Idle,
    Scanning
}

package com.thewall.android

import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.AssetManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
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
import androidx.core.net.toUri
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.thewall.android.ui.screens.AppListScreen
import com.thewall.android.ui.screens.PermissionRequestScreen
import com.thewall.android.ui.screens.StartScreen
import com.thewall.android.ui.theme.TheWallBoycottAssistantTheme
import com.thewall.android.ui.urllookup.UrlLookupScreen

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {}

    // State to hold the shared URL
    private var sharedUrl by mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("ShareDebug", "onCreate called. Intent action: ${intent?.action}")
        handleIntent(intent)
        setContent {
            TheWallBoycottAssistantTheme {
                MainScreen(
                    initialUrl = sharedUrl,
                    onUrlHandled = {
                        Log.d("ShareDebug", "URL handled, clearing sharedUrl.")
                        sharedUrl = null
                    } // Clear the URL after handling
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        Log.d("ShareDebug", "onNewIntent called. Intent action: ${intent.action}")
        handleIntent(intent)
        // We need to recompose with the new URL
        setContent {
            TheWallBoycottAssistantTheme {
                MainScreen(
                    initialUrl = sharedUrl,
                    onUrlHandled = {
                        Log.d("ShareDebug", "URL handled, clearing sharedUrl.")
                        sharedUrl = null
                    }
                )
            }
        }
    }

    private fun handleIntent(intent: Intent?) {
        if (intent?.action == Intent.ACTION_SEND && "text/plain" == intent.type) {
            val receivedUrl = intent.getStringExtra(Intent.EXTRA_TEXT)
            Log.d("ShareDebug", "handleIntent: Received text: '$receivedUrl'")
            if (receivedUrl != null) {
                sharedUrl = receivedUrl
                Log.d("ShareDebug", "handleIntent: sharedUrl state updated to: '$sharedUrl'")
            } else {
                Log.d("ShareDebug", "handleIntent: Received null text.")
            }
        } else {
            Log.d(
                "ShareDebug",
                "handleIntent: Intent was not a valid share intent. Action: ${intent?.action}, Type: ${intent?.type}"
            )
        }
    }

    private fun hasQueryAllPackagesPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            checkSelfPermission(android.Manifest.permission.QUERY_ALL_PACKAGES) == PackageManager.PERMISSION_GRANTED
        } else {
            true // Not needed for older Android versions.
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
    private fun MainScreen(initialUrl: String?, onUrlHandled: () -> Unit) {
        // If we received a URL, start on the UrlLookup screen. Otherwise, default to List.
        var currentScreen by remember { mutableStateOf<Screen>(if (initialUrl != null) Screen.UrlLookup else Screen.List) }
        var scanState by remember { mutableStateOf(ScanState.Idle) }
        var permissionGranted by remember { mutableStateOf(hasQueryAllPackagesPermission()) }

        // When a new shared URL comes in while the app is open, we need to react
        LaunchedEffect(initialUrl) {
            if (initialUrl != null) {
                Log.d(
                    "ShareDebug",
                    "MainScreen: LaunchedEffect detected new initialUrl: '$initialUrl'"
                )
                currentScreen = Screen.UrlLookup
            }
        }

        val lifecycleOwner = LocalLifecycleOwner.current
        DisposableEffect(lifecycleOwner) {
            val observer = LifecycleEventObserver { _, event ->
                if (event == Lifecycle.Event.ON_RESUME) {
                    val hasPermission = hasQueryAllPackagesPermission()
                    // If permission was just granted, move to the list.
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
                            ScanState.Idle -> {
                                StartScreen(onScanClicked = { scanState = ScanState.Scanning })
                            }
                            ScanState.Scanning -> {
                                if (permissionGranted) {
                                    AppListScreen()
                                } else {
                                    PermissionRequestScreen(
                                        onRequestPermission = { requestQueryAllPackagesPermission() }
                                    )
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

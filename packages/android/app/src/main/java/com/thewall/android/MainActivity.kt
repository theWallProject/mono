package com.thewall.android

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
    private fun MainScreen() {
        var currentScreen by remember { mutableStateOf<Screen>(Screen.List) }
        var scanState by remember { mutableStateOf(ScanState.Idle) }
        var permissionGranted by remember { mutableStateOf(hasQueryAllPackagesPermission()) }

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

                    is Screen.UrlLookup -> UrlLookupScreen()
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

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
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Scanner
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.thewall.android.ui.screens.AppListScreen
import com.thewall.android.ui.screens.PermissionRequestScreen
import com.thewall.android.ui.screens.StartScreen
import com.thewall.android.ui.theme.TheWallBoycottAssistantTheme

@OptIn(ExperimentalMaterial3Api::class)
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

        Scaffold(
            bottomBar = {
                NavigationBar {
                    NavigationBarItem(
                        icon = { Icon(Icons.Filled.Scanner, contentDescription = "Scan Apps") },
                        label = { Text("Scan Apps") },
                        selected = true,
                        onClick = { /* No-op, since we only have one screen */ }
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

    companion object {
        fun readFile(assetManager: AssetManager, fileName: String): String =
            assetManager.open(fileName).bufferedReader().use { it.readText() }
    }
}

sealed class Screen {
    object Start : Screen()
    object Permission : Screen()
    data class List(val permissionGranted: Boolean) : Screen()
}

package com.thewallboycott.android

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.ui.res.painterResource
import com.thewallboycott.android.R
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.net.toUri
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.thewallboycott.android.ui.theme.WallPrimary
import com.thewallboycott.android.ui.theme.WallTextOnPrimary
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf
import com.thewallboycott.android.background.ScanWorker
import com.thewallboycott.android.data.OnboardingPreferences
import com.thewallboycott.android.share.ShareManager
import com.thewallboycott.android.ui.onboarding.OnboardingScreen
import com.thewallboycott.android.ui.screens.AppListScreen
import com.thewallboycott.android.ui.screens.PermissionRequestScreen
import com.thewallboycott.android.ui.screens.StartScreen
import com.thewallboycott.android.ui.screens.SupportScreen
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import com.thewallboycott.android.ui.urllookup.UrlLookupScreen
import java.util.concurrent.TimeUnit

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {}

    private var sharedUrl by mutableStateOf<String?>(null)
    private var navigateToScreen by mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable edge-to-edge with burnt orange status bar
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(0xFFB72B00.toInt()),
            navigationBarStyle = SystemBarStyle.dark(0xFFB72B00.toInt())
        )

        handleIntent(intent)
        schedulePeriodicScan()

        setContent {
            TheWallBoycottAssistantTheme {
                val onboardingPrefs = remember { OnboardingPreferences(this@MainActivity) }
                var showOnboarding by rememberSaveable {
                    mutableStateOf(!onboardingPrefs.isOnboardingCompleted())
                }
                var startScanAfterOnboarding by rememberSaveable { mutableStateOf(false) }

                if (showOnboarding) {
                    OnboardingScreen(
                        onComplete = {
                            onboardingPrefs.setOnboardingCompleted()
                            startScanAfterOnboarding = true
                            showOnboarding = false
                        }
                    )
                } else {
                    MainScreen(
                        initialUrl = sharedUrl,
                        navigateToScreen = if (startScanAfterOnboarding) ScanWorker.APP_SCAN_SCREEN else navigateToScreen,
                        onUrlHandled = { sharedUrl = null },
                        onNavigationHandled = {
                            startScanAfterOnboarding = false
                            navigateToScreen = null
                        }
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent?.action == Intent.ACTION_SEND && "text/plain" == intent.type) {
            sharedUrl = intent.getStringExtra(Intent.EXTRA_TEXT)
        }
        intent?.getStringExtra(ScanWorker.NAVIGATE_TO_SCREEN_EXTRA)?.let {
            navigateToScreen = it
        }
        // Debug: trigger scan via ADB
        if (intent?.hasExtra("TRIGGER_SCAN") == true) {
            val scanRequest = OneTimeWorkRequestBuilder<ScanWorker>().build()
            WorkManager.getInstance(this).enqueue(scanRequest)
        }
    }

    private fun schedulePeriodicScan() {
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

    @Composable
    private fun MainScreen(
        initialUrl: String?,
        navigateToScreen: String?,
        onUrlHandled: () -> Unit,
        onNavigationHandled: () -> Unit
    ) {
        var currentScreen by rememberSaveable(stateSaver = Screen.Saver) {
            val defaultScreen = when {
                initialUrl != null -> Screen.UrlLookup
                navigateToScreen == ScanWorker.APP_SCAN_SCREEN -> Screen.List
                else -> Screen.List
            }
            mutableStateOf(defaultScreen)
        }
        var scanState by rememberSaveable {
            mutableStateOf(if (navigateToScreen == ScanWorker.APP_SCAN_SCREEN) ScanState.Scanning else ScanState.Idle)
        }
        var permissionGranted by rememberSaveable { mutableStateOf(hasQueryAllPackagesPermission()) }
        var refreshTrigger by rememberSaveable { mutableIntStateOf(0) }
        val context = LocalContext.current
        val shareManager = remember { ShareManager(context) }

        // Effect to handle navigation from intent extras
        if (navigateToScreen == ScanWorker.APP_SCAN_SCREEN) {
            currentScreen = Screen.List
            scanState = ScanState.Scanning
            onNavigationHandled()
        }
         if (initialUrl != null) {
            currentScreen = Screen.UrlLookup
        }


        // Effect to check for permission changes on resume
        val lifecycleOwner = LocalLifecycleOwner.current
        DisposableEffect(lifecycleOwner) {
            val observer = LifecycleEventObserver { _, event ->
                if (event == Lifecycle.Event.ON_RESUME) {
                    val hasPermission = hasQueryAllPackagesPermission()
                    if (hasPermission && !permissionGranted) {
                        scanState = ScanState.Scanning // Auto-scan after permission is granted
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
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_wall_shield),
                                contentDescription = "The Wall",
                                modifier = Modifier.size(28.dp),
                                colorFilter = androidx.compose.ui.graphics.ColorFilter.tint(WallTextOnPrimary)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = when (currentScreen) {
                                    is Screen.List -> "The Wall"
                                    is Screen.UrlLookup -> "Lookup"
                                    is Screen.Support -> "Support"
                                },
                                fontWeight = FontWeight.Bold
                            )
                        }
                    },
                    actions = {
                        // Refresh button - only for My Apps screen when scanning
                        if (currentScreen is Screen.List && scanState == ScanState.Scanning) {
                            IconButton(onClick = { refreshTrigger++ }) {
                                Icon(
                                    Icons.Filled.Refresh,
                                    contentDescription = "Refresh",
                                    tint = WallTextOnPrimary
                                )
                            }
                        }
                        // Share button - for all screens
                        IconButton(onClick = {
                            val content = shareManager.getGeneralContent()
                            shareManager.shareText(content)
                        }) {
                            Icon(
                                Icons.Filled.Share,
                                contentDescription = "Share",
                                tint = WallTextOnPrimary
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = WallPrimary,
                        titleContentColor = WallTextOnPrimary,
                        scrolledContainerColor = WallPrimary
                    )
                )
            },
            bottomBar = {
                val isListSelected = currentScreen is Screen.List
                val isUrlSelected = currentScreen is Screen.UrlLookup
                val isSupportSelected = currentScreen is Screen.Support

                NavigationBar(
                    containerColor = WallPrimary,
                    contentColor = WallTextOnPrimary
                ) {
                    NavigationBarItem(
                        icon = {
                            Icon(
                                Icons.Filled.PhoneAndroid,
                                contentDescription = "My Apps",
                                modifier = Modifier.size(if (isListSelected) 28.dp else 24.dp)
                            )
                        },
                        label = {
                            Text(
                                "My Apps",
                                fontSize = 14.sp,
                                fontWeight = if (isListSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        selected = isListSelected,
                        onClick = { currentScreen = Screen.List },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = WallTextOnPrimary,
                            selectedTextColor = WallTextOnPrimary,
                            unselectedIconColor = WallTextOnPrimary.copy(alpha = 0.7f),
                            unselectedTextColor = WallTextOnPrimary.copy(alpha = 0.7f),
                            indicatorColor = Color.Transparent
                        )
                    )
                    NavigationBarItem(
                        icon = {
                            Icon(
                                Icons.Filled.Search,
                                contentDescription = "Lookup",
                                modifier = Modifier.size(if (isUrlSelected) 28.dp else 24.dp)
                            )
                        },
                        label = {
                            Text(
                                "Lookup",
                                fontSize = 14.sp,
                                fontWeight = if (isUrlSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        selected = isUrlSelected,
                        onClick = { currentScreen = Screen.UrlLookup },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = WallTextOnPrimary,
                            selectedTextColor = WallTextOnPrimary,
                            unselectedIconColor = WallTextOnPrimary.copy(alpha = 0.7f),
                            unselectedTextColor = WallTextOnPrimary.copy(alpha = 0.7f),
                            indicatorColor = Color.Transparent
                        )
                    )
                    NavigationBarItem(
                        icon = {
                            Icon(
                                Icons.Filled.Favorite,
                                contentDescription = "Support",
                                modifier = Modifier.size(if (isSupportSelected) 28.dp else 24.dp)
                            )
                        },
                        label = {
                            Text(
                                "Support",
                                fontSize = 14.sp,
                                fontWeight = if (isSupportSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        selected = isSupportSelected,
                        onClick = { currentScreen = Screen.Support },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = WallTextOnPrimary,
                            selectedTextColor = WallTextOnPrimary,
                            unselectedIconColor = WallTextOnPrimary.copy(alpha = 0.7f),
                            unselectedTextColor = WallTextOnPrimary.copy(alpha = 0.7f),
                            indicatorColor = Color.Transparent
                        )
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
                            ScanState.Idle -> StartScreen(
                                onScanClicked = { scanState = ScanState.Scanning },
                                onDebugTrigger = {
                                    // Easter egg: trigger background scan with forced notifications
                                    val scanRequest = OneTimeWorkRequestBuilder<ScanWorker>()
                                        .setInputData(workDataOf(ScanWorker.INPUT_FORCE_NOTIFY to true))
                                        .build()
                                    WorkManager.getInstance(context).enqueue(scanRequest)
                                }
                            )
                            ScanState.Scanning -> {
                                if (permissionGranted) {
                                    AppListScreen(externalRefreshTrigger = refreshTrigger)
                                } else {
                                    PermissionRequestScreen(onRequestPermission = ::requestQueryAllPackagesPermission)
                                }
                            }
                        }
                    }
                    is Screen.UrlLookup -> UrlLookupScreen(
                        initialUrl = initialUrl,
                        onUrlHandled = onUrlHandled
                    )
                    is Screen.Support -> SupportScreen()
                }
            }
        }
    }
}

sealed class Screen {
    data object List : Screen()
    data object UrlLookup : Screen()
    data object Support : Screen()

    companion object {
        val Saver: Saver<Screen, String> = Saver(
            save = { screen ->
                when (screen) {
                    List -> "list"
                    UrlLookup -> "url"
                    Support -> "support"
                }
            },
            restore = { value ->
                when (value) {
                    "list" -> List
                    "url" -> UrlLookup
                    "support" -> Support
                    else -> List
                }
            }
        )
    }
}

enum class ScanState {
    Idle,
    Scanning
}

package com.thewallboycott.android

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.SystemBarStyle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.core.net.toUri
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.thewallboycott.android.ui.AppScaffold
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf
import com.thewallboycott.android.background.ScanWorker
import com.thewallboycott.android.data.AppPreferences
import com.thewallboycott.android.data.OnboardingPreferences
import com.thewallboycott.android.share.ImageTemplate
import com.thewallboycott.android.share.ShareManager
import com.thewallboycott.android.ui.components.ShareDialog
import com.thewallboycott.android.ui.onboarding.OnboardingScreen
import com.thewallboycott.android.ui.screens.AppListScreen
import com.thewallboycott.android.ui.screens.PermissionRequestScreen
import com.thewallboycott.android.ui.screens.StartScreen
import com.thewallboycott.android.ui.screens.SettingsScreen
import com.thewallboycott.android.ui.screens.SupportScreen
import com.thewallboycott.android.ui.theme.TheWallBoycottAssistantTheme
import com.thewallboycott.android.ui.urllookup.UrlLookupScreen
import java.util.concurrent.TimeUnit

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : AppCompatActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {}

    private var sharedUrl by mutableStateOf<String?>(null)
    private var navigateToScreen by mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install splash screen before super.onCreate()
        installSplashScreen()

        // Restore saved locale BEFORE super.onCreate() to ensure resources
        // load with the correct language on cold start
        AppPreferences.applyStoredLocale(this)

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
        val scanWorkRequest = PeriodicWorkRequestBuilder<ScanWorker>(6, TimeUnit.HOURS).build()
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
            val intent = Intent(android.provider.Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
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
            mutableStateOf(ScanState.Scanning) // Auto-start scanning
        }
        var permissionGranted by rememberSaveable { mutableStateOf(hasQueryAllPackagesPermission()) }
        var refreshTrigger by rememberSaveable { mutableIntStateOf(0) }
        val context = LocalContext.current
        val shareManager = remember { ShareManager(context) }
        var showGeneralShareDialog by remember { mutableStateOf(false) }

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

        AppScaffold(
            currentScreen = currentScreen,
            scanState = scanState,
            onScreenSelected = { currentScreen = it },
            onRefresh = { refreshTrigger++ },
            onShare = { showGeneralShareDialog = true },
            onSettings = { currentScreen = Screen.Settings }
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
                is Screen.Settings -> SettingsScreen()
            }
        }

        // General share dialog
        if (showGeneralShareDialog) {
            ShareDialog(
                content = shareManager.getGeneralContent(),
                shareManager = shareManager,
                imageTemplate = ImageTemplate.GENERAL,
                onDismiss = { showGeneralShareDialog = false },
                onShareComplete = { showGeneralShareDialog = false }
            )
        }
    }
}

sealed class Screen {
    data object List : Screen()
    data object UrlLookup : Screen()
    data object Support : Screen()
    data object Settings : Screen()

    companion object {
        val Saver: Saver<Screen, String> = Saver(
            save = { screen ->
                when (screen) {
                    List -> "list"
                    UrlLookup -> "url"
                    Support -> "support"
                    Settings -> "settings"
                }
            },
            restore = { value ->
                when (value) {
                    "list" -> List
                    "url" -> UrlLookup
                    "support" -> Support
                    "settings" -> Settings
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

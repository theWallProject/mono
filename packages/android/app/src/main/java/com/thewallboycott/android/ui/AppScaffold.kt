package com.thewallboycott.android.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
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
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thewallboycott.android.R
import com.thewallboycott.android.Screen
import com.thewallboycott.android.ScanState
import com.thewallboycott.android.ui.theme.WallPrimary
import com.thewallboycott.android.ui.theme.WallTextOnPrimary

/**
 * The app's main scaffold with top bar and bottom navigation.
 *
 * Extracted from [com.thewallboycott.android.MainActivity.MainScreen] so that
 * tests can render full-app screenshots that include the header and navigation
 * bar — exactly matching what users see.
 *
 * @param currentScreen Which tab is currently selected.
 * @param scanState Whether the app scanner is idle or scanning.
 * @param onScreenSelected Called when a bottom nav tab is tapped.
 * @param onRefresh Called when the refresh action button is tapped.
 * @param onShare Called when the share action button is tapped.
 * @param onSettings Called when the settings action button is tapped.
 * @param content The screen content to render inside the scaffold.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScaffold(
    currentScreen: Screen,
    scanState: ScanState = ScanState.Idle,
    onScreenSelected: (Screen) -> Unit = {},
    onRefresh: () -> Unit = {},
    onShare: () -> Unit = {},
    onSettings: () -> Unit = {},
    content: @Composable () -> Unit
) {
    val isListSelected = currentScreen is Screen.List
    val isUrlSelected = currentScreen is Screen.UrlLookup
    val isSupportSelected = currentScreen is Screen.Support

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_wall_shield),
                            contentDescription = stringResource(R.string.scan_title),
                            modifier = Modifier.size(28.dp),
                            colorFilter = ColorFilter.tint(WallTextOnPrimary)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = when (currentScreen) {
                                is Screen.List -> stringResource(R.string.scan_title)
                                is Screen.UrlLookup -> stringResource(R.string.nav_lookup)
                                is Screen.Support -> stringResource(R.string.nav_support)
                                is Screen.Settings -> stringResource(R.string.settings_title)
                            },
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                actions = {
                    if (currentScreen is Screen.List && scanState == ScanState.Scanning) {
                        IconButton(onClick = onRefresh) {
                            Icon(
                                Icons.Filled.Refresh,
                                contentDescription = stringResource(R.string.cd_refresh),
                                tint = WallTextOnPrimary
                            )
                        }
                    }
                    IconButton(onClick = onShare) {
                        Icon(
                            Icons.Filled.Share,
                            contentDescription = stringResource(R.string.cd_share),
                            tint = WallTextOnPrimary
                        )
                    }
                    IconButton(onClick = onSettings) {
                        Icon(
                            Icons.Filled.Settings,
                            contentDescription = stringResource(R.string.cd_settings),
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
            NavigationBar(
                containerColor = WallPrimary,
                contentColor = WallTextOnPrimary
            ) {
                NavigationBarItem(
                    icon = {
                        Icon(
                            Icons.Filled.PhoneAndroid,
                            contentDescription = stringResource(R.string.nav_my_apps),
                            modifier = Modifier.size(if (isListSelected) 28.dp else 24.dp)
                        )
                    },
                    label = {
                        Text(
                            stringResource(R.string.nav_my_apps),
                            fontSize = 14.sp,
                            fontWeight = if (isListSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    selected = isListSelected,
                    onClick = { onScreenSelected(Screen.List) },
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
                            contentDescription = stringResource(R.string.nav_lookup),
                            modifier = Modifier.size(if (isUrlSelected) 28.dp else 24.dp)
                        )
                    },
                    label = {
                        Text(
                            stringResource(R.string.nav_lookup),
                            fontSize = 14.sp,
                            fontWeight = if (isUrlSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    selected = isUrlSelected,
                    onClick = { onScreenSelected(Screen.UrlLookup) },
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
                            contentDescription = stringResource(R.string.nav_support),
                            modifier = Modifier.size(if (isSupportSelected) 28.dp else 24.dp)
                        )
                    },
                    label = {
                        Text(
                            stringResource(R.string.nav_support),
                            fontSize = 14.sp,
                            fontWeight = if (isSupportSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    selected = isSupportSelected,
                    onClick = { onScreenSelected(Screen.Support) },
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
            content()
        }
    }
}

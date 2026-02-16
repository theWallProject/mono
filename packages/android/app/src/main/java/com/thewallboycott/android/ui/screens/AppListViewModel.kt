package com.thewallboycott.android.ui.screens

import android.content.pm.PackageInfo
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thewallboycott.android.data.AppScanner
import com.thewallboycott.android.data.models.AllItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * UI state for the app scan screen.
 */
data class AppListUiState(
    val isLoading: Boolean = true,
    val blacklistedApps: List<Pair<PackageInfo, AllItem>> = emptyList(),
    val bdsApps: List<Pair<PackageInfo, AllItem>> = emptyList(),
    val hintedApps: List<Pair<PackageInfo, AllItem>> = emptyList(),
    val otherApps: List<PackageInfo> = emptyList(),
    val scanCompleted: Boolean = false
)

/**
 * ViewModel for [AppListScreen].
 *
 * Delegates scanning to [AppScanner] and exposes results as [StateFlow].
 * Extracted to enable UI testing with fake data.
 */
class AppListViewModel(private val appScanner: AppScanner) : ViewModel() {

    private val _uiState = MutableStateFlow(AppListUiState())
    val uiState: StateFlow<AppListUiState> = _uiState.asStateFlow()

    companion object {
        private const val TAG = "AppListViewModel"
    }

    /**
     * Triggers a scan. Call from LaunchedEffect or on refresh.
     */
    fun scan() {
        _uiState.value = _uiState.value.copy(isLoading = true, scanCompleted = false)
        viewModelScope.launch {
            try {
                val results = appScanner.scan()
                _uiState.value = AppListUiState(
                    isLoading = false,
                    blacklistedApps = results.blacklisted,
                    bdsApps = results.bdsApps,
                    hintedApps = results.hinted,
                    otherApps = results.other,
                    scanCompleted = true
                )
                Log.d(TAG, "Scan complete: ${results.blacklisted.size} blacklisted, ${results.bdsApps.size} BDS, ${results.hinted.size} hinted")
            } catch (e: Exception) {
                Log.e(TAG, "Scan failed", e)
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }
}

package com.thewallboycott.android.ui.screens

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.thewallboycott.android.data.AppScanner
import com.thewallboycott.android.data.DatabaseProvider
import com.thewallboycott.android.data.PackageScanner
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.data.models.Alternative
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [AppListViewModel] — verifies scan state management,
 * result categorization, and error handling.
 *
 * Uses [UnconfinedTestDispatcher] so that `viewModelScope.launch` runs eagerly,
 * while [AppScanner.scan] (which uses `withContext(Dispatchers.Default)`)
 * executes on a real thread pool. We await completion by polling [AppListUiState.scanCompleted].
 */
@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(AndroidJUnit4::class)
class AppListViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    // ==================== Helpers ====================

    private fun fakePackage(packageName: String): PackageInfo {
        return PackageInfo().apply {
            this.packageName = packageName
            applicationInfo = ApplicationInfo().apply {
                this.flags = 0
            }
        }
    }

    private fun createViewModel(
        dbItems: List<AllItem> = emptyList(),
        installedPackages: List<PackageInfo> = emptyList()
    ): AppListViewModel {
        val dbProvider = object : DatabaseProvider {
            override suspend fun getAllItems(): List<AllItem> = dbItems
        }
        val pkgScanner = object : PackageScanner {
            override fun getInstalledPackages(): List<PackageInfo> = installedPackages
        }
        return AppListViewModel(AppScanner(dbProvider, pkgScanner))
    }

    /**
     * Waits for the ViewModel scan to complete, with a timeout.
     * AppScanner.scan() runs on Dispatchers.Default internally, so we poll.
     */
    private suspend fun AppListViewModel.awaitScanComplete(timeoutMs: Long = 10_000) {
        val start = System.currentTimeMillis()
        while (!uiState.value.scanCompleted && !uiState.value.isLoading.not()) {
            if (System.currentTimeMillis() - start > timeoutMs) {
                throw AssertionError("Scan did not complete within ${timeoutMs}ms")
            }
            kotlinx.coroutines.delay(50)
        }
        // Also wait if still loading (scanCompleted may not be set yet)
        while (uiState.value.isLoading) {
            if (System.currentTimeMillis() - start > timeoutMs) {
                throw AssertionError("Scan did not finish loading within ${timeoutMs}ms")
            }
            kotlinx.coroutines.delay(50)
        }
    }

    // ==================== Initial State ====================

    @Test
    fun initialState_isLoading() {
        val viewModel = createViewModel()
        val state = viewModel.uiState.value

        assertTrue("Should start in loading state", state.isLoading)
        assertFalse("Should not be scan completed", state.scanCompleted)
        assertTrue("Blacklisted should be empty", state.blacklistedApps.isEmpty())
        assertTrue("BDS should be empty", state.bdsApps.isEmpty())
        assertTrue("Hinted should be empty", state.hintedApps.isEmpty())
        assertTrue("Other should be empty", state.otherApps.isEmpty())
    }

    // ==================== Scan Completion ====================

    @Test
    fun scan_completesSuccessfully() = runTest {
        val viewModel = createViewModel(
            installedPackages = listOf(fakePackage("com.safe.app"))
        )

        viewModel.scan()
        viewModel.awaitScanComplete()

        val state = viewModel.uiState.value
        assertFalse("Should not be loading after scan", state.isLoading)
        assertTrue("Should be scan completed", state.scanCompleted)
    }

    @Test
    fun scan_emptyDatabase_allAppsAreOther() = runTest {
        val viewModel = createViewModel(
            installedPackages = listOf(
                fakePackage("com.safe.app1"),
                fakePackage("com.safe.app2")
            )
        )

        viewModel.scan()
        viewModel.awaitScanComplete()

        val state = viewModel.uiState.value
        assertTrue(state.blacklistedApps.isEmpty())
        assertTrue(state.bdsApps.isEmpty())
        assertTrue(state.hintedApps.isEmpty())
        assertEquals(2, state.otherApps.size)
    }

    @Test
    fun scan_emptyInstalled_returnsEmptyResults() = runTest {
        val viewModel = createViewModel(
            dbItems = listOf(
                AllItem(id = "test", r = listOf("h"), n = "Test", androidDevId = "com.test")
            )
        )

        viewModel.scan()
        viewModel.awaitScanComplete()

        val state = viewModel.uiState.value
        assertTrue(state.blacklistedApps.isEmpty())
        assertTrue(state.bdsApps.isEmpty())
        assertTrue(state.hintedApps.isEmpty())
        assertTrue(state.otherApps.isEmpty())
        assertTrue(state.scanCompleted)
    }

    // ==================== Categorization ====================

    @Test
    fun scan_categorizesFlaggedApps() = runTest {
        val israeliEntry = AllItem(
            id = "israeli_co",
            r = listOf("h"),
            n = "Israeli Company",
            androidDevId = "com.israeli"
        )
        val viewModel = createViewModel(
            dbItems = listOf(israeliEntry),
            installedPackages = listOf(
                fakePackage("com.israeli.app"),
                fakePackage("com.safe.app")
            )
        )

        viewModel.scan()
        viewModel.awaitScanComplete()

        val state = viewModel.uiState.value
        assertEquals(1, state.blacklistedApps.size)
        assertEquals("Israeli Company", state.blacklistedApps[0].second.n)
        assertEquals(1, state.otherApps.size)
    }

    @Test
    fun scan_categorizesBdsApps() = runTest {
        val bdsEntry = AllItem(
            id = "bds_co",
            r = listOf("BDS_PRIO"),
            n = "BDS Company",
            androidAppIds = listOf("com.bds.app")
        )
        val viewModel = createViewModel(
            dbItems = listOf(bdsEntry),
            installedPackages = listOf(fakePackage("com.bds.app"))
        )

        viewModel.scan()
        viewModel.awaitScanComplete()

        val state = viewModel.uiState.value
        assertTrue(state.blacklistedApps.isEmpty())
        assertEquals(1, state.bdsApps.size)
        assertEquals("BDS Company", state.bdsApps[0].second.n)
    }

    @Test
    fun scan_categorizesHintedApps() = runTest {
        val hintEntry = AllItem(
            id = "hint_app",
            r = emptyList(),
            n = "Hint App",
            isHint = true,
            hintText = "Try alternative",
            androidAppIds = listOf("com.hintable.app")
        )
        val viewModel = createViewModel(
            dbItems = listOf(hintEntry),
            installedPackages = listOf(fakePackage("com.hintable.app"))
        )

        viewModel.scan()
        viewModel.awaitScanComplete()

        val state = viewModel.uiState.value
        assertTrue(state.blacklistedApps.isEmpty())
        assertEquals(1, state.hintedApps.size)
        assertEquals("Hint App", state.hintedApps[0].second.n)
    }

    @Test
    fun scan_mixedResults_categorizedCorrectly() = runTest {
        val israeliEntry = AllItem(
            id = "co_a",
            r = listOf("h"),
            n = "Company A",
            androidDevId = "com.companya"
        )
        val bdsEntry = AllItem(
            id = "co_b",
            r = listOf("BDS_GRASS"),
            n = "Company B",
            androidAppIds = listOf("com.companyb.app")
        )
        val hintEntry = AllItem(
            id = "hint_c",
            r = emptyList(),
            n = "Alternative C",
            isHint = true,
            hintText = "Try C",
            androidAppIds = listOf("com.companyc.app")
        )

        val viewModel = createViewModel(
            dbItems = listOf(israeliEntry, bdsEntry, hintEntry),
            installedPackages = listOf(
                fakePackage("com.companya.mainapp"),
                fakePackage("com.companyb.app"),
                fakePackage("com.companyc.app"),
                fakePackage("com.safe.app")
            )
        )

        viewModel.scan()
        viewModel.awaitScanComplete()

        val state = viewModel.uiState.value
        assertEquals("blacklisted: 1", 1, state.blacklistedApps.size)
        assertEquals("bdsApps: 1", 1, state.bdsApps.size)
        assertEquals("hintedApps: 1", 1, state.hintedApps.size)
        assertEquals("otherApps: 1", 1, state.otherApps.size)
    }

    // ==================== Rescan ====================

    @Test
    fun scan_canBeCalledMultipleTimes() = runTest {
        val israeliEntry = AllItem(
            id = "co_a",
            r = listOf("h"),
            n = "Company A",
            androidDevId = "com.companya"
        )
        val viewModel = createViewModel(
            dbItems = listOf(israeliEntry),
            installedPackages = listOf(fakePackage("com.companya.app"))
        )

        viewModel.scan()
        viewModel.awaitScanComplete()
        assertEquals(1, viewModel.uiState.value.blacklistedApps.size)

        // Second scan should work fine
        viewModel.scan()
        viewModel.awaitScanComplete()

        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertTrue(state.scanCompleted)
        assertEquals(1, state.blacklistedApps.size)
    }

    // ==================== Alternatives ====================

    @Test
    fun scan_appWithAlternatives_preservedInResults() = runTest {
        val entry = AllItem(
            id = "wix_test",
            r = listOf("h"),
            n = "Wix",
            androidDevId = "com.wix",
            alt = listOf(
                Alternative("Jimdo", "https://www.jimdo.com"),
                Alternative("Webnode", "https://www.webnode.com")
            )
        )

        val viewModel = createViewModel(
            dbItems = listOf(entry),
            installedPackages = listOf(fakePackage("com.wix.android"))
        )

        viewModel.scan()
        viewModel.awaitScanComplete()

        val flagged = viewModel.uiState.value.blacklistedApps
        assertEquals(1, flagged.size)
        assertEquals(2, flagged[0].second.alt?.size)
        assertEquals("Jimdo", flagged[0].second.alt!![0].n)
    }
}

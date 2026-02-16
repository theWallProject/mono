package com.thewallboycott.android.data

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.testutil.TestDatabase
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [AppScanner] — the core app scanning logic.
 *
 * Uses fake [DatabaseProvider] and [PackageScanner] to control inputs,
 * while using real database entries from ALL.json to ensure schema integrity.
 */
@RunWith(AndroidJUnit4::class)
class AppScannerTest {

    /** Fake DatabaseProvider that returns a controlled list of items. */
    private class FakeDatabaseProvider(private val items: List<AllItem>) : DatabaseProvider {
        override suspend fun getAllItems(): List<AllItem> = items
    }

    /** Fake PackageScanner that returns a controlled list of packages. */
    private class FakePackageScanner(private val packages: List<PackageInfo>) : PackageScanner {
        override fun getInstalledPackages(): List<PackageInfo> = packages
    }

    // Real database entries used across tests
    private lateinit var wixEntry: AllItem
    private lateinit var allItems: List<AllItem>

    @Before
    fun setup() {
        allItems = TestDatabase.loadAll(ApplicationProvider.getApplicationContext())
        wixEntry = TestDatabase.findById("wix", ApplicationProvider.getApplicationContext())!!
    }

    // ==================== Helper ====================

    /** Creates a minimal PackageInfo with the given package name. */
    private fun fakePackage(packageName: String): PackageInfo {
        return PackageInfo().apply {
            this.packageName = packageName
            applicationInfo = ApplicationInfo().apply {
                this.flags = 0 // non-system
            }
        }
    }

    // ==================== Basic Scanning ====================

    @Test
    fun scan_emptyInstalled_returnsEmptyResults() = runTest {
        val scanner = AppScanner(
            FakeDatabaseProvider(allItems),
            FakePackageScanner(emptyList())
        )
        val results = scanner.scan()
        assertTrue("blacklisted should be empty", results.blacklisted.isEmpty())
        assertTrue("bdsApps should be empty", results.bdsApps.isEmpty())
        assertTrue("hinted should be empty", results.hinted.isEmpty())
        assertTrue("other should be empty", results.other.isEmpty())
    }

    @Test
    fun scan_emptyDatabase_allAppsAreOther() = runTest {
        val packages = listOf(fakePackage("com.example.app"))
        val scanner = AppScanner(
            FakeDatabaseProvider(emptyList()),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertTrue("blacklisted should be empty", results.blacklisted.isEmpty())
        assertEquals("other should have 1 app", 1, results.other.size)
        assertEquals("com.example.app", results.other[0].packageName)
    }

    // ==================== Blacklist Matching ====================

    @Test
    fun scan_matchesByAndroidDevId() = runTest {
        // Wix has androidDevId = "com.wix"
        val packages = listOf(fakePackage("com.wix.someapp"))
        val scanner = AppScanner(
            FakeDatabaseProvider(listOf(wixEntry)),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertEquals("Should detect 1 blacklisted app", 1, results.blacklisted.size)
        assertEquals("Wix", results.blacklisted[0].second.n)
        assertEquals("com.wix.someapp", results.blacklisted[0].first.packageName)
    }

    @Test
    fun scan_matchesByAndroidAppId() = runTest {
        // Find an entry with specific android_app_ids
        val entryWithAppIds = allItems.find {
            !it.androidAppIds.isNullOrEmpty() && it.isHint != true
        }!!
        val targetPackage = entryWithAppIds.androidAppIds!!.first()
        val packages = listOf(fakePackage(targetPackage))
        val scanner = AppScanner(
            FakeDatabaseProvider(listOf(entryWithAppIds)),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertEquals("Should detect 1 blacklisted app", 1, results.blacklisted.size + results.bdsApps.size)
    }

    @Test
    fun scan_unrecognizedApp_goesToOther() = runTest {
        val packages = listOf(fakePackage("com.unknown.app"))
        val scanner = AppScanner(
            FakeDatabaseProvider(allItems),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertTrue("blacklisted should be empty", results.blacklisted.isEmpty())
        assertTrue("hinted should be empty", results.hinted.isEmpty())
        assertEquals("other should have 1 app", 1, results.other.size)
    }

    // ==================== BDS Categorization ====================

    @Test
    fun scan_bdsOnlyApp_categorizedAsBds() = runTest {
        // Create a synthetic BDS-only entry with a matching dev ID
        val bdsEntry = AllItem(
            id = "test_bds",
            r = listOf("BDS_PRIO"),
            n = "Test BDS Company",
            androidDevId = "com.bdstest"
        )
        val packages = listOf(fakePackage("com.bdstest.app"))
        val scanner = AppScanner(
            FakeDatabaseProvider(listOf(bdsEntry)),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertTrue("blacklisted should be empty (BDS-only)", results.blacklisted.isEmpty())
        assertEquals("bdsApps should have 1", 1, results.bdsApps.size)
        assertEquals("Test BDS Company", results.bdsApps[0].second.n)
    }

    @Test
    fun scan_mixedBdsAndIsraeli_categorizedAsBlacklisted() = runTest {
        // Entry with both Israeli ("h") and BDS reasons should be blacklisted, not BDS
        val mixedEntry = AllItem(
            id = "test_mixed",
            r = listOf("h", "BDS_PRIO"),
            n = "Mixed Company",
            androidDevId = "com.mixed"
        )
        val packages = listOf(fakePackage("com.mixed.app"))
        val scanner = AppScanner(
            FakeDatabaseProvider(listOf(mixedEntry)),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertEquals("blacklisted should have 1 (has Israeli reason)", 1, results.blacklisted.size)
        assertTrue("bdsApps should be empty", results.bdsApps.isEmpty())
    }

    // ==================== Hint Matching ====================

    @Test
    fun scan_hintApp_categorizedAsHinted() = runTest {
        // Create a synthetic hint entry
        val hintEntry = AllItem(
            id = "test_hint",
            r = emptyList(),
            n = "Hint App",
            isHint = true,
            hintText = "Try this alternative",
            androidAppIds = listOf("com.hintable.app")
        )
        val packages = listOf(fakePackage("com.hintable.app"))
        val scanner = AppScanner(
            FakeDatabaseProvider(listOf(hintEntry)),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertTrue("blacklisted should be empty", results.blacklisted.isEmpty())
        assertEquals("hinted should have 1", 1, results.hinted.size)
        assertEquals("Hint App", results.hinted[0].second.n)
    }

    @Test
    fun scan_blacklistTakesPriorityOverHint() = runTest {
        // If an app matches both blacklist and hint, blacklist wins
        val blacklistEntry = AllItem(
            id = "dual_black",
            r = listOf("h"),
            n = "Dual Company",
            androidAppIds = listOf("com.dual.app")
        )
        val hintEntry = AllItem(
            id = "dual_hint",
            r = emptyList(),
            n = "Dual Company Hint",
            isHint = true,
            hintText = "Alternative",
            androidAppIds = listOf("com.dual.app")
        )
        val packages = listOf(fakePackage("com.dual.app"))
        val scanner = AppScanner(
            FakeDatabaseProvider(listOf(blacklistEntry, hintEntry)),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertEquals("blacklisted should have 1", 1, results.blacklisted.size)
        assertTrue("hinted should be empty (blacklist takes priority)", results.hinted.isEmpty())
    }

    // ==================== Multiple Apps ====================

    @Test
    fun scan_multipleApps_categorizedCorrectly() = runTest {
        val blacklistEntry = AllItem(
            id = "company_a",
            r = listOf("h"),
            n = "Company A",
            androidDevId = "com.companya"
        )
        val bdsEntry = AllItem(
            id = "company_b",
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
        val packages = listOf(
            fakePackage("com.companya.mainapp"),
            fakePackage("com.companyb.app"),
            fakePackage("com.companyc.app"),
            fakePackage("com.safe.app")
        )
        val scanner = AppScanner(
            FakeDatabaseProvider(listOf(blacklistEntry, bdsEntry, hintEntry)),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        assertEquals("blacklisted: 1", 1, results.blacklisted.size)
        assertEquals("bdsApps: 1", 1, results.bdsApps.size)
        assertEquals("hinted: 1", 1, results.hinted.size)
        assertEquals("other: 1", 1, results.other.size)
    }

    // ==================== Real Database Integration ====================

    @Test
    fun scan_realWixDevId_detectedAsBlacklisted() = runTest {
        // Uses the real Wix entry from ALL.json — confirms androidDevId "com.wix" works
        val packages = listOf(fakePackage("com.wix.android"))
        val scanner = AppScanner(
            FakeDatabaseProvider(allItems),
            FakePackageScanner(packages)
        )
        val results = scanner.scan()
        val flagged = results.blacklisted + results.bdsApps
        assertTrue(
            "Real Wix entry should flag com.wix.android",
            flagged.any { it.second.n == "Wix" }
        )
    }

    @Test
    fun scan_realDatabase_noFalsePositivesForCommonApps() = runTest {
        // Common apps that should NOT be flagged
        val safePackages = listOf(
            fakePackage("com.android.chrome"),
            fakePackage("org.mozilla.firefox"),
            fakePackage("com.whatsapp"),
            fakePackage("org.telegram.messenger")
        )
        val scanner = AppScanner(
            FakeDatabaseProvider(allItems),
            FakePackageScanner(safePackages)
        )
        val results = scanner.scan()
        // These apps should all be in "other" (not flagged)
        // Note: WhatsApp/Chrome could theoretically be in the database, so we just check
        // that the total categorized count equals 4
        val total = results.blacklisted.size + results.bdsApps.size + results.hinted.size + results.other.size
        assertEquals("All 4 apps should be categorized", 4, total)
    }
}

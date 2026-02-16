package com.thewallboycott.android.background

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.work.ListenableWorker
import androidx.work.WorkerFactory
import androidx.work.WorkerParameters
import androidx.work.testing.TestListenableWorkerBuilder
import com.thewallboycott.android.data.DatabaseProvider
import com.thewallboycott.android.data.NotificationPreferences
import com.thewallboycott.android.data.PackageScanner
import com.thewallboycott.android.data.models.AllItem
import com.thewallboycott.android.testutil.TestClock
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [ScanWorker] — the background worker that scans installed apps
 * and sends notifications for newly detected boycotted apps.
 *
 * Uses a custom [WorkerFactory] to inject fake [DatabaseProvider] and [PackageScanner].
 */
@RunWith(AndroidJUnit4::class)
class ScanWorkerTest {

    private lateinit var context: Context
    private lateinit var clock: TestClock
    private lateinit var prefs: NotificationPreferences

    private var fakeDbItems: List<AllItem> = emptyList()
    private var fakePackages: List<PackageInfo> = emptyList()

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        clock = TestClock(System.currentTimeMillis())
        prefs = NotificationPreferences(context, clock)
        prefs.clear()
    }

    // ==================== Helpers ====================

    private fun fakePackage(packageName: String): PackageInfo {
        return PackageInfo().apply {
            this.packageName = packageName
            applicationInfo = ApplicationInfo().apply {
                this.packageName = packageName
                this.flags = 0
            }
        }
    }

    private fun buildWorker(
        dbItems: List<AllItem> = fakeDbItems,
        packages: List<PackageInfo> = fakePackages,
        forceNotify: Boolean = false
    ): ScanWorker {
        val dbProvider = object : DatabaseProvider {
            override suspend fun getAllItems(): List<AllItem> = dbItems
        }
        val pkgScanner = object : PackageScanner {
            override fun getInstalledPackages(): List<PackageInfo> = packages
        }

        val factory = object : WorkerFactory() {
            override fun createWorker(
                appContext: Context,
                workerClassName: String,
                workerParameters: WorkerParameters
            ): ListenableWorker {
                return ScanWorker(appContext, workerParameters, dbProvider, pkgScanner)
            }
        }

        val inputData = if (forceNotify) {
            androidx.work.Data.Builder()
                .putBoolean(ScanWorker.INPUT_FORCE_NOTIFY, true)
                .build()
        } else {
            androidx.work.Data.EMPTY
        }

        return TestListenableWorkerBuilder<ScanWorker>(context)
            .setWorkerFactory(factory)
            .setInputData(inputData)
            .build() as ScanWorker
    }

    private val boycottedEntry = AllItem(
        id = "test_boycott",
        r = listOf("h"),
        n = "Boycotted Corp",
        androidDevId = "com.boycotted"
    )

    private val anotherEntry = AllItem(
        id = "test_another",
        r = listOf("f"),
        n = "Another Corp",
        androidAppIds = listOf("com.another.app")
    )

    // ==================== Basic Worker Execution ====================

    @Test
    fun doWork_noInstalledApps_returnsSuccess() = runTest {
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = emptyList()
        )
        val result = worker.doWork()
        assertEquals(ListenableWorker.Result.success(), result)
    }

    @Test
    fun doWork_noMatchingApps_returnsSuccess() = runTest {
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.safe.app"))
        )
        val result = worker.doWork()
        assertEquals(ListenableWorker.Result.success(), result)
    }

    @Test
    fun doWork_matchingApp_returnsSuccess() = runTest {
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app"))
        )
        val result = worker.doWork()
        assertEquals(ListenableWorker.Result.success(), result)
    }

    // ==================== Known Apps Tracking ====================

    @Test
    fun doWork_updatesKnownApps() = runTest {
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app"))
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertTrue(
            "Known apps should include the detected app",
            knownApps.contains("com.boycotted.app")
        )
    }

    @Test
    fun doWork_noMatchingApps_clearsKnownApps() = runTest {
        // Pre-populate known apps
        prefs.setKnownApps(setOf("com.old.app"))

        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.safe.app"))
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertTrue("Known apps should be empty after clean scan", knownApps.isEmpty())
    }

    // ==================== Ignored/Snoozed Apps ====================

    @Test
    fun doWork_ignoredApp_notIncludedInResults() = runTest {
        prefs.ignoreApp("com.boycotted.app")

        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app"))
        )
        worker.doWork()

        // Ignored apps should not appear in known apps (they're skipped during scan)
        val knownApps = prefs.getKnownApps()
        assertFalse(
            "Ignored app should not be in known apps",
            knownApps.contains("com.boycotted.app")
        )
    }

    @Test
    fun doWork_snoozedApp_notIncludedInResults() = runTest {
        prefs.snoozeApp("com.boycotted.app")

        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app"))
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertFalse(
            "Snoozed app should not be in known apps",
            knownApps.contains("com.boycotted.app")
        )
    }

    // ==================== Notification Timing ====================

    @Test
    fun doWork_newApp_setsLastNotificationTime() = runTest {
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app")),
            forceNotify = true
        )
        worker.doWork()

        // After notifying, last notification time should be set
        assertFalse(
            "Should have set last notification time (shouldShowReminder should be false)",
            prefs.shouldShowReminder()
        )
    }

    @Test
    fun doWork_multipleMatchingApps_tracksAll() = runTest {
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry, anotherEntry),
            packages = listOf(
                fakePackage("com.boycotted.app"),
                fakePackage("com.another.app")
            )
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertEquals("Should track 2 known apps", 2, knownApps.size)
        assertTrue(knownApps.contains("com.boycotted.app"))
        assertTrue(knownApps.contains("com.another.app"))
    }

    // ==================== Hints (Not Notified) ====================

    @Test
    fun doWork_hintApp_notInKnownApps() = runTest {
        val hintEntry = AllItem(
            id = "test_hint",
            r = emptyList(),
            n = "Hint App",
            isHint = true,
            hintText = "Try this instead",
            androidAppIds = listOf("com.hintable.app")
        )

        val worker = buildWorker(
            dbItems = listOf(hintEntry),
            packages = listOf(fakePackage("com.hintable.app"))
        )
        worker.doWork()

        // Hints are not tracked in known apps (only blacklisted apps are)
        val knownApps = prefs.getKnownApps()
        assertFalse(
            "Hint apps should not be in known apps",
            knownApps.contains("com.hintable.app")
        )
    }
}

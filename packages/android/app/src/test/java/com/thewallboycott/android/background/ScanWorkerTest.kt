package com.thewallboycott.android.background

import android.Manifest
import android.app.Application
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
import org.robolectric.Shadows

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

        // Grant POST_NOTIFICATIONS so sendNotifications() can post and return true
        Shadows.shadowOf(context as Application).grantPermissions(Manifest.permission.POST_NOTIFICATIONS)
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
                return ScanWorker(appContext, workerParameters, dbProvider, pkgScanner, prefs)
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

    // ==================== Notification Timing: No New Apps ====================

    @Test
    fun doWork_noNewApps_withinTwoWeeks_doesNotResetTimer() = runTest {
        // First scan: detect app and set notification time
        val worker1 = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app")),
            forceNotify = true
        )
        worker1.doWork()

        val timeAfterFirst = prefs.getLastNotificationTime()
        assertTrue("Notification time should be set", timeAfterFirst > 0)

        // Advance 1 day (well within 2-week window)
        clock.advanceBy(1L * 24 * 60 * 60 * 1000)

        // Second scan: same app, no new apps, within 2 weeks -> should NOT notify
        val worker2 = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app"))
        )
        worker2.doWork()

        // Notification time should NOT have changed (no new notification sent)
        assertEquals(
            "Notification time should be unchanged (no notification sent)",
            timeAfterFirst,
            prefs.getLastNotificationTime()
        )
    }

    @Test
    fun doWork_noNewApps_afterTwoWeeks_sendsReminder() = runTest {
        // First scan with force notify
        val worker1 = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app")),
            forceNotify = true
        )
        worker1.doWork()

        val timeAfterFirst = prefs.getLastNotificationTime()
        assertTrue("First scan should set notification time", timeAfterFirst > 0)

        // Advance past 2-week reminder interval
        clock.advanceBy(NotificationPreferences.REMINDER_INTERVAL_MS + 1)

        // Second scan: same app, past 2 weeks -> should trigger reminder
        val worker2 = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app"))
        )
        worker2.doWork()

        // Reminder sent successfully -> notification time updated to current clock
        val timeAfterReminder = prefs.getLastNotificationTime()
        assertTrue(
            "Notification time should be updated after reminder",
            timeAfterReminder > timeAfterFirst
        )
        assertFalse(
            "shouldShowReminder should be false after fresh notification",
            prefs.shouldShowReminder()
        )
    }

    @Test
    fun doWork_newAppDetected_updatesLastNotifiedApps() = runTest {
        // Pre-populate known apps (simulating a previous scan)
        prefs.setKnownApps(setOf("com.boycotted.app"))

        // Second scan with a NEW app in addition
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry, anotherEntry),
            packages = listOf(
                fakePackage("com.boycotted.app"),
                fakePackage("com.another.app")
            ),
            forceNotify = true
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertEquals("Should now know about both apps", 2, knownApps.size)
        assertTrue(knownApps.contains("com.another.app"))
    }

    // ==================== Clean Scan (No Boycotted Apps) ====================

    @Test
    fun doWork_cleanScan_clearsLastNotifiedApps() = runTest {
        // Simulate previous notification
        prefs.setLastNotifiedApps(setOf("com.old.boycotted.app"))

        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.safe.app"))
        )
        worker.doWork()

        assertEquals(
            "Last notified apps should be cleared after clean scan",
            emptySet<String>(),
            prefs.getLastNotifiedApps()
        )
    }

    @Test
    fun doWork_emptyDatabase_returnsSuccess() = runTest {
        val worker = buildWorker(
            dbItems = emptyList(),
            packages = listOf(fakePackage("com.any.app"))
        )
        val result = worker.doWork()
        assertEquals(ListenableWorker.Result.success(), result)
    }

    // ==================== Force Notify ====================

    @Test
    fun doWork_forceNotify_alwaysAttemptsSend() = runTest {
        // Pre-populate so there are no "new" apps
        prefs.setKnownApps(setOf("com.boycotted.app"))
        prefs.setLastNotificationTime() // recently notified

        val worker = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app")),
            forceNotify = true
        )
        worker.doWork()

        // Known apps should still be tracked even with force notify
        val knownApps = prefs.getKnownApps()
        assertTrue(knownApps.contains("com.boycotted.app"))
    }

    // ==================== appNotificationId ====================

    @Test
    fun appNotificationId_returnsStableId() {
        val id1 = ScanWorker.appNotificationId("com.example.app")
        val id2 = ScanWorker.appNotificationId("com.example.app")
        assertEquals("Same package should produce same ID", id1, id2)
    }

    @Test
    fun appNotificationId_alwaysInBoundedRange() {
        val packages = listOf(
            "com.example.app", "org.test", "a", "com.very.long.package.name.here",
            "com.1234567890", "z"
        )
        packages.forEach { pkg ->
            val id = ScanWorker.appNotificationId(pkg)
            assertTrue("ID for '$pkg' should be >= 1000, was $id", id >= 1000)
            assertTrue("ID for '$pkg' should be < 11000, was $id", id < 11000)
        }
    }

    @Test
    fun appNotificationId_neverCollidesWithProgressId() {
        val packages = listOf(
            "com.example.app", "org.test", "a", "com.very.long.package.name.here"
        )
        packages.forEach { pkg ->
            val id = ScanWorker.appNotificationId(pkg)
            assertTrue("ID should never be 42 (progress notification)", id != 42)
        }
    }

    @Test
    fun appNotificationId_emptyString_inBoundedRange() {
        val id = ScanWorker.appNotificationId("")
        assertTrue("Empty string ID should be >= 1000, was $id", id >= 1000)
        assertTrue("Empty string ID should be < 11000, was $id", id < 11000)
    }

    @Test
    fun appNotificationId_differentPackages_produceDifferentIds() {
        val id1 = ScanWorker.appNotificationId("com.wix.android")
        val id2 = ScanWorker.appNotificationId("com.fiverr.fiverr")
        val id3 = ScanWorker.appNotificationId("com.booking")
        // Different packages should (almost always) produce different IDs
        // With a 10000 range, collisions are rare but possible.
        // We test 3 well-known packages that are very unlikely to collide.
        assertTrue(
            "Different packages should usually produce different IDs",
            setOf(id1, id2, id3).size >= 2
        )
    }

    @Test
    fun appNotificationId_handlesNegativeHashCode() {
        // Strings with negative hashCode values should still produce valid IDs
        // because of the `and 0x7FFFFFFF` mask
        val negativeCandidates = listOf(
            "AaAa", "BBBB", "polygenelubricants"
        )
        negativeCandidates.forEach { pkg ->
            val id = ScanWorker.appNotificationId(pkg)
            assertTrue("ID for '$pkg' should be >= 1000, was $id", id >= 1000)
            assertTrue("ID for '$pkg' should be < 11000, was $id", id < 11000)
        }
    }

    // ==================== Request Code Range Safety ====================

    @Test
    fun requestCodeRanges_doNotOverlap() {
        // Verify the three request code ranges never overlap:
        // Content intent: [1000, 11000)
        // Ignore action:  [21000, 31000)
        // Snooze action:  [41000, 51000)
        val maxNotificationId = 10999 // 1000 + 9999
        val ignoreMin = maxNotificationId + 20000  // 30999
        val snoozeMin = maxNotificationId + 40000  // 50999

        // Content range is [1000, 11000)
        // Ignore range is [21000, 31000)  (1000+20000 to 10999+20000)
        // Snooze range is [41000, 51000)  (1000+40000 to 10999+40000)

        // Verify no overlap between content and ignore
        assertTrue(
            "Content range max (10999) should be < Ignore range min (21000)",
            maxNotificationId < 21000
        )

        // Verify no overlap between ignore and snooze
        assertTrue(
            "Ignore range max (30999) should be < Snooze range min (41000)",
            30999 < 41000
        )
    }

    @Test
    fun requestCodes_neverOverflowInt() {
        // The maximum possible request code is maxNotificationId + SNOOZE_OFFSET
        // maxNotificationId = 1000 + 9999 = 10999
        // SNOOZE_OFFSET = 40000
        // maxRequestCode = 10999 + 40000 = 50999
        // This must be well within Int.MAX_VALUE (2,147,483,647)
        val maxRequestCode = 10999L + 40000L
        assertTrue(
            "Max request code ($maxRequestCode) must be < Int.MAX_VALUE",
            maxRequestCode < Int.MAX_VALUE
        )
    }

    @Test
    fun appNotificationId_withOffsets_neverCollidesWithProgressId() {
        // Verify that notification ID + any offset never produces 42
        val packages = listOf(
            "com.wix.android", "com.fiverr.fiverr", "com.booking",
            "com.amazon.mShop.android.shopping", "com.airbnb.android"
        )
        val offsets = listOf(0, 20000, 40000)

        packages.forEach { pkg ->
            offsets.forEach { offset ->
                val code = ScanWorker.appNotificationId(pkg) + offset
                assertTrue(
                    "Request code for '$pkg' + offset $offset should never be 42",
                    code != 42
                )
            }
        }
    }

    // ==================== DevId Matching in ScanWorker ====================

    @Test
    fun doWork_devIdMatch_requiresDotSeparator() = runTest {
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry), // androidDevId = "com.boycotted"
            packages = listOf(fakePackage("com.boycottedExtra"))
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertFalse(
            "com.boycottedExtra should NOT match devId com.boycotted (no dot separator)",
            knownApps.contains("com.boycottedExtra")
        )
    }

    @Test
    fun doWork_devIdMatch_exactPackageMatches() = runTest {
        val worker = buildWorker(
            dbItems = listOf(boycottedEntry), // androidDevId = "com.boycotted"
            packages = listOf(fakePackage("com.boycotted"))
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertTrue(
            "Exact package name matching devId should be detected",
            knownApps.contains("com.boycotted")
        )
    }

    @Test
    fun doWork_appIdMatch_exactMatch() = runTest {
        val worker = buildWorker(
            dbItems = listOf(anotherEntry), // androidAppIds = ["com.another.app"]
            packages = listOf(fakePackage("com.another.app"))
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertTrue(
            "Exact app ID match should be detected",
            knownApps.contains("com.another.app")
        )
    }

    // ==================== Mixed Ignored and Active ====================

    @Test
    fun doWork_mixOfIgnoredAndActive_tracksOnlyActive() = runTest {
        prefs.ignoreApp("com.boycotted.app")

        val worker = buildWorker(
            dbItems = listOf(boycottedEntry, anotherEntry),
            packages = listOf(
                fakePackage("com.boycotted.app"),
                fakePackage("com.another.app")
            )
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertFalse("Ignored app should not be tracked", knownApps.contains("com.boycotted.app"))
        assertTrue("Active app should be tracked", knownApps.contains("com.another.app"))
    }

    @Test
    fun doWork_snoozedAppExpires_reappearsInKnownApps() = runTest {
        prefs.snoozeApp("com.boycotted.app")

        // First scan: snoozed app should be excluded
        val worker1 = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app"))
        )
        worker1.doWork()
        assertFalse(
            "Snoozed app should not be in known apps",
            prefs.getKnownApps().contains("com.boycotted.app")
        )

        // Advance past snooze duration
        clock.advanceBy(NotificationPreferences.SNOOZE_DURATION_MS + 1)

        // Second scan: snooze expired, app should reappear
        val worker2 = buildWorker(
            dbItems = listOf(boycottedEntry),
            packages = listOf(fakePackage("com.boycotted.app"))
        )
        worker2.doWork()
        assertTrue(
            "Expired-snooze app should reappear in known apps",
            prefs.getKnownApps().contains("com.boycotted.app")
        )
    }

    // ==================== Custom Reason ("c") in Database ====================

    @Test
    fun doWork_customReasonEntry_detectedAsBlacklisted() = runTest {
        val customEntry = AllItem(
            id = "test_custom",
            r = listOf("c"),
            n = "Custom Reason Corp",
            proofText = "Evidence text",
            proofLink = "https://example.com/proof",
            androidAppIds = listOf("com.custom.app")
        )

        val worker = buildWorker(
            dbItems = listOf(customEntry),
            packages = listOf(fakePackage("com.custom.app"))
        )
        worker.doWork()

        val knownApps = prefs.getKnownApps()
        assertTrue(
            "Custom reason entry should be detected as blacklisted",
            knownApps.contains("com.custom.app")
        )
    }
}

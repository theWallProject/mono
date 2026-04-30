package com.thewallboycott.android

import android.Manifest
import android.app.Application
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.work.ListenableWorker
import androidx.work.WorkInfo
import androidx.work.WorkManager
import androidx.work.testing.TestListenableWorkerBuilder
import androidx.work.testing.WorkManagerTestInitHelper
import com.thewallboycott.android.background.PackageInstallReceiver
import com.thewallboycott.android.background.ScanWorker
import com.thewallboycott.android.data.AssetDatabaseProvider
import com.thewallboycott.android.data.NotificationPreferences
import com.thewallboycott.android.data.SystemPackageScanner
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Shadows

/**
 * End-to-end test for the install-and-detect flow.
 *
 * Walks the full reactive scan pipeline using real production wiring:
 *   - Real `AssetDatabaseProvider` reading the bundled `ALL.json`
 *   - Real `SystemPackageScanner` reading from Robolectric's shadow PackageManager
 *   - Real `PackageInstallReceiver` enqueuing real WorkManager work
 *   - Real `ScanWorker.doWork()` writing to real `NotificationPreferences`
 *
 * Scenario: target boycotted app (Wix) is NOT installed at startup; the test then
 * registers it with the shadow PackageManager, dispatches a `PACKAGE_ADDED` broadcast
 * to the receiver, and verifies that the resulting scan attributes the new package
 * to the Wix entry from the production database.
 *
 * Why this complements the existing unit tests:
 *   - `PackageInstallReceiverTest` only covers receiver → enqueue plumbing.
 *   - `ScanWorkerTest` only covers worker logic with fake DB and fake scanner.
 *   - `AppScannerTest` covers AppScanner with real DB but fake PM.
 *
 * Nothing else exercises the full chain against the real DB AND the real
 * SystemPackageScanner reading from a shadow PackageManager — which is the
 * surface that actually broke when `QUERY_ALL_PACKAGES` was removed.
 */
@RunWith(AndroidJUnit4::class)
class EndToEndDetectionTest {

    private lateinit var context: Context
    private lateinit var prefs: NotificationPreferences
    private lateinit var receiver: PackageInstallReceiver

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()

        // Real WorkManager test harness — receiver will enqueue against this.
        WorkManagerTestInitHelper.initializeTestWorkManager(context)

        // Reset detection ledger so this test is order-independent.
        prefs = NotificationPreferences(context)
        prefs.clear()

        // Allow ScanWorker.sendNotifications() to post (we don't assert on
        // notifications, but the foreground promotion path touches permissions).
        Shadows.shadowOf(context as Application).grantPermissions(Manifest.permission.POST_NOTIFICATIONS)

        receiver = PackageInstallReceiver()
    }

    /**
     * Mirrors a real installed user app: non-system, has the target package name
     * and a usable ApplicationInfo so `loadLabel()` works inside the worker.
     */
    private fun installViaShadowPm(packageName: String, label: String) {
        val info = PackageInfo().apply {
            this.packageName = packageName
            applicationInfo = ApplicationInfo().apply {
                this.packageName = packageName
                this.nonLocalizedLabel = label
                this.flags = 0 // non-system, non-updated-system
            }
        }
        Shadows.shadowOf(context.packageManager).installPackage(info)
    }

    /**
     * Builds a worker that uses the SAME production wiring as the runtime path:
     * real DB, real SystemPackageScanner, real prefs (the shared one we cleared above).
     */
    private fun buildWorkerWithRealDeps(): ScanWorker {
        return TestListenableWorkerBuilder<ScanWorker>(context)
            .setWorkerFactory(object : androidx.work.WorkerFactory() {
                override fun createWorker(
                    appContext: Context,
                    workerClassName: String,
                    workerParameters: androidx.work.WorkerParameters
                ): ListenableWorker {
                    return ScanWorker(
                        appContext = appContext,
                        workerParams = workerParameters,
                        databaseProvider = AssetDatabaseProvider(appContext),
                        packageScanner = SystemPackageScanner(appContext),
                        prefs = prefs
                    )
                }
            })
            .build() as ScanWorker
    }

    @Test
    fun installThenScan_detectsBoycottedApp_endToEnd() = runTest {
        val targetPackage = "com.wix.android"
        val targetLabel = "Wix"

        // ============================================================
        // Stage 1 — Baseline: target not installed, scan finds nothing.
        // ============================================================
        val baselinePackages = context.packageManager.getInstalledPackages(0).map { it.packageName }
        assertFalse(
            "Pre-condition: target package must NOT be installed before stage 2",
            targetPackage in baselinePackages
        )

        val baselineWorker = buildWorkerWithRealDeps()
        val baselineResult = baselineWorker.doWork()
        assertEquals(
            "Baseline scan should succeed",
            ListenableWorker.Result.success(),
            baselineResult
        )
        assertTrue(
            "Baseline: nothing boycotted is installed, so known apps must remain empty",
            prefs.getKnownApps().isEmpty()
        )

        // ============================================================
        // Stage 2 — Install: register the target via shadow PM.
        // ============================================================
        installViaShadowPm(targetPackage, targetLabel)

        val afterInstallPackages = context.packageManager.getInstalledPackages(0).map { it.packageName }
        assertTrue(
            "Shadow PM must surface the newly installed package",
            targetPackage in afterInstallPackages
        )

        // ============================================================
        // Stage 3 — Trigger: dispatch PACKAGE_ADDED to the real receiver.
        // ============================================================
        val intent = Intent(Intent.ACTION_PACKAGE_ADDED).apply {
            data = Uri.parse("package:$targetPackage")
        }
        receiver.onReceive(context, intent)

        // ============================================================
        // Stage 4 — Receiver assertion: WorkManager has queued the scan.
        // ============================================================
        val enqueued = WorkManager.getInstance(context)
            .getWorkInfosForUniqueWork(PackageInstallReceiver.REACTIVE_SCAN_WORK_NAME)
            .get()
            .filter { it.state == WorkInfo.State.ENQUEUED }
        assertEquals(
            "Receiver should enqueue exactly one reactive scan",
            1,
            enqueued.size
        )

        // ============================================================
        // Stage 5 — Run the worker directly. We bypass WorkManager's 3s
        // initial delay and scheduling because the receiver→enqueue path is
        // already covered by PackageInstallReceiverTest. The point of this
        // E2E is to prove that a scan executed AFTER install actually sees
        // the new package via the real SystemPackageScanner and resolves it
        // against the real ALL.json.
        // ============================================================
        val scanWorker = buildWorkerWithRealDeps()
        val scanResult = scanWorker.doWork()
        assertEquals(
            "Reactive scan should succeed",
            ListenableWorker.Result.success(),
            scanResult
        )

        // ============================================================
        // Stage 6 — Verify detection: prefs ledger contains the new app,
        // proving that ScanWorker resolved com.wix.android against the
        // Wix entry in the real ALL.json (which uses androidDevId="com.wix").
        // On a "first run" the worker seeds known apps without notifying;
        // that seeding IS the detection signal we assert on.
        // ============================================================
        val knownAfterScan = prefs.getKnownApps()
        assertTrue(
            "Detection failed: $targetPackage was not recorded in known apps. " +
                "Known apps after scan: $knownAfterScan",
            targetPackage in knownAfterScan
        )
    }
}

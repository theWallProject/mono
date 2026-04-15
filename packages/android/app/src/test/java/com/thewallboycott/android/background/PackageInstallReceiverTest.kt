package com.thewallboycott.android.background

import android.content.Intent
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.work.WorkInfo
import androidx.work.WorkManager
import androidx.work.testing.WorkManagerTestInitHelper
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Tests for [PackageInstallReceiver] — the broadcast receiver that triggers
 * a reactive scan when a new app is installed.
 */
@RunWith(AndroidJUnit4::class)
class PackageInstallReceiverTest {

    private lateinit var context: android.content.Context
    private lateinit var receiver: PackageInstallReceiver

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        WorkManagerTestInitHelper.initializeTestWorkManager(context)
        receiver = PackageInstallReceiver()
    }

    private fun getPendingWork(): List<WorkInfo> {
        return WorkManager.getInstance(context)
            .getWorkInfosForUniqueWork(PackageInstallReceiver.REACTIVE_SCAN_WORK_NAME)
            .get()
            .filter { it.state == WorkInfo.State.ENQUEUED }
    }

    // ==================== Happy Path ====================

    @Test
    fun `PACKAGE_ADDED enqueues a reactive scan`() {
        val intent = Intent(Intent.ACTION_PACKAGE_ADDED).apply {
            data = android.net.Uri.parse("package:com.example.someapp")
        }

        receiver.onReceive(context, intent)

        val work = getPendingWork()
        assertEquals("Expected exactly one enqueued scan", 1, work.size)
    }

    // ==================== Filter: Null Data ====================

    @Test
    fun `null data does not crash or enqueue work`() {
        val intent = Intent(Intent.ACTION_PACKAGE_ADDED)
        // data is null by default

        receiver.onReceive(context, intent)

        val work = getPendingWork()
        assertTrue("Should not enqueue work when data is null", work.isEmpty())
    }

    // ==================== Filter: Self-Install ====================

    @Test
    fun `self-install does not enqueue work`() {
        val intent = Intent(Intent.ACTION_PACKAGE_ADDED).apply {
            data = android.net.Uri.parse("package:${context.packageName}")
        }

        receiver.onReceive(context, intent)

        val work = getPendingWork()
        assertTrue("Should not scan when own package is installed", work.isEmpty())
    }

    // ==================== Filter: EXTRA_REPLACING ====================

    @Test
    fun `EXTRA_REPLACING skips enqueue for update ADDED phase`() {
        val intent = Intent(Intent.ACTION_PACKAGE_ADDED).apply {
            data = android.net.Uri.parse("package:com.example.someapp")
            putExtra(Intent.EXTRA_REPLACING, true)
        }

        receiver.onReceive(context, intent)

        val work = getPendingWork()
        assertTrue("Should skip the ADDED phase of an update", work.isEmpty())
    }

    // ==================== Filter: Wrong Action ====================

    @Test
    fun `PACKAGE_REMOVED does not trigger scan`() {
        val intent = Intent(Intent.ACTION_PACKAGE_REMOVED).apply {
            data = android.net.Uri.parse("package:com.example.someapp")
        }

        receiver.onReceive(context, intent)

        val work = getPendingWork()
        assertTrue("Should not scan on package removal", work.isEmpty())
    }

    @Test
    fun `unknown action does not enqueue work`() {
        val intent = Intent("com.example.UNKNOWN_ACTION").apply {
            data = android.net.Uri.parse("package:com.example.someapp")
        }

        receiver.onReceive(context, intent)

        val work = getPendingWork()
        assertTrue("Should not scan on unknown action", work.isEmpty())
    }

    // ==================== KEEP Policy ====================

    @Test
    fun `multiple installs use KEEP policy - first work is kept`() {
        val intent1 = Intent(Intent.ACTION_PACKAGE_ADDED).apply {
            data = android.net.Uri.parse("package:com.example.app1")
        }
        val intent2 = Intent(Intent.ACTION_PACKAGE_ADDED).apply {
            data = android.net.Uri.parse("package:com.example.app2")
        }

        receiver.onReceive(context, intent1)
        receiver.onReceive(context, intent2)

        val allWork = WorkManager.getInstance(context)
            .getWorkInfosForUniqueWork(PackageInstallReceiver.REACTIVE_SCAN_WORK_NAME)
            .get()

        // KEEP policy: second enqueue is dropped, only one work item exists
        val enqueuedOrRunning = allWork.filter {
            it.state == WorkInfo.State.ENQUEUED || it.state == WorkInfo.State.RUNNING
        }
        assertEquals(
            "KEEP policy should preserve the first enqueued work",
            1,
            enqueuedOrRunning.size
        )
    }

    // ==================== EXTRA_REPLACING=false still enqueues ====================

    @Test
    fun `EXTRA_REPLACING false still enqueues work`() {
        val intent = Intent(Intent.ACTION_PACKAGE_ADDED).apply {
            data = android.net.Uri.parse("package:com.example.someapp")
            putExtra(Intent.EXTRA_REPLACING, false)
        }

        receiver.onReceive(context, intent)

        val work = getPendingWork()
        assertEquals("Should enqueue when EXTRA_REPLACING is false", 1, work.size)
    }
}

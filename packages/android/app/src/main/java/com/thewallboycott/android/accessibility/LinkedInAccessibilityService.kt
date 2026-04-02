package com.thewallboycott.android.accessibility

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.channels.trySendBlocking
import com.thewallboycott.android.data.AssetDatabaseProvider
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Accessibility service that monitors LinkedIn and detects flagged companies.
 * 
 * This service:
 * 1. Detects when LinkedIn is in the foreground
 * 2. Polls the accessibility tree every 5 seconds
 * 3. Extracts company names using screen profiles
 * 4. Matches against the boycott database
 * 
 * All heavy processing is done on background threads (Dispatchers.Default)
 * to avoid blocking the main thread and LinkedIn's UI.
 * 
 * Required permissions:
 * - BIND_ACCESSIBILITY_SERVICE (manifest)
 * - User must enable in Settings > Accessibility
 * 
 * Configuration: res/xml/accessibility_service_config.xml
 */
class LinkedInAccessibilityService : AccessibilityService() {
    
    companion object {
        private const val TAG = "LinkedInAccessibility"
        private const val POLL_INTERVAL_MS = 3000L
        private const val LOG_BATCH_SIZE = 50
        private const val LOG_FLUSH_INTERVAL_MS = 100L
        
        const val LINKEDIN_PACKAGE = "com.linkedin.android"
        
        fun isServiceEnabled(context: android.content.Context): Boolean {
            val expectedService = "${context.packageName}/${LinkedInAccessibilityService::class.java.name}"
            val enabledServices = android.provider.Settings.Secure.getString(
                context.contentResolver,
                android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            
            return enabledServices.contains(expectedService)
        }
    }
    
    // Severity levels for async logging
    private enum class LogSeverity { V, D, I, W, E }
    
    // Log entry for async processing
    private data class LogEntry(
        val severity: LogSeverity,
        val tag: String,
        val message: String
    )
    
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val backgroundScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    private var nameMatcher: CompanyNameMatcher? = null
    private val isLinkedInForeground = AtomicBoolean(false)
    private var linkedInWasInBackground = false
    private var currentClassName: String? = null
    private val isProcessing = AtomicBoolean(false)
    private var pollingJob: Job? = null
    private var loggingJob: Job? = null
    
    // Thread-safe queue for async logging
    private val logQueue = Channel<LogEntry>(capacity = Channel.UNLIMITED)
    
    override fun onServiceConnected() {
        super.onServiceConnected()
        asyncLog(LogSeverity.I, TAG, "Service connected")
        initializeNameMatcher()
        startLoggingConsumer()
        startPolling()
    }
    
    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                handleWindowStateChanged(event)
            }
            else -> {
                // Check if we left LinkedIn (for events that don't trigger WINDOW_STATE_CHANGED)
                checkForLinkedInExit(event)
            }
        }
    }
    
    /**
     * Quick check on ALL events to detect LinkedIn exit faster.
     * This catches cases where WINDOW_STATE_CHANGED isn't fired for home button.
     */
    private fun checkForLinkedInExit(event: AccessibilityEvent) {
        if (!isLinkedInForeground.get()) return
        
        val packageName = event.packageName?.toString()
        
        // Log all events we receive while LinkedIn is in foreground (for debugging)
        if (packageName != LINKEDIN_PACKAGE && packageName != null && !packageName.startsWith("com.linkedin")) {
            asyncLog(LogSeverity.I, TAG, "=== QUICK EXIT DETECTED (event type ${event.eventType}) ===")
            asyncLog(LogSeverity.I, TAG, "  package: $packageName")
            asyncLog(LogSeverity.I, TAG, "  className: ${event.className}")
            asyncLog(LogSeverity.I, TAG, "  ACTION: Hiding overlay immediately")
            
            isLinkedInForeground.set(false)
            linkedInWasInBackground = true
            
            try {
                LinkedInOverlayService.hideOverlay(applicationContext)
                asyncLog(LogSeverity.I, TAG, "  ACTION: hideOverlay() call completed")
            } catch (e: Exception) {
                asyncLog(LogSeverity.E, TAG, "  hideOverlay() FAILED: ${e.message}")
            }
        }
    }
    
    override fun onInterrupt() {
        asyncLog(LogSeverity.W, TAG, "Accessibility service interrupted")
    }
    
    override fun onDestroy() {
        asyncLog(LogSeverity.I, TAG, "Service destroyed")
        pollingJob?.cancel()
        loggingJob?.cancel()
        nameMatcher?.clear()
        super.onDestroy()
    }
    
    // ========== Async Logging ==========
    
    /**
     * Queue a log entry for async processing.
     * Non-blocking - returns immediately.
     */
    private fun asyncLog(severity: LogSeverity, tag: String, message: String) {
        logQueue.trySendBlocking(LogEntry(severity, tag, message))
    }
    
    /**
     * Start the background consumer that flushes logs in batches.
     */
    private fun startLoggingConsumer() {
        loggingJob = backgroundScope.launch {
            val batch = mutableListOf<LogEntry>()
            
            while (true) {
                // Collect batch
                batch.clear()
                var itemsCollected = 0
                
                while (itemsCollected < LOG_BATCH_SIZE) {
                    val entry = logQueue.tryReceive().getOrNull() ?: break
                    batch.add(entry)
                    itemsCollected++
                }
                
                // Flush batch to Logcat
                if (batch.isNotEmpty()) {
                    flushLogBatch(batch)
                }
                
                // Small delay before next batch
                delay(LOG_FLUSH_INTERVAL_MS)
            }
        }
    }
    
    /**
     * Flush a batch of logs to Logcat.
     * Called from background thread.
     */
    private fun flushLogBatch(batch: List<LogEntry>) {
        for (entry in batch) {
            when (entry.severity) {
                LogSeverity.V -> Log.v(entry.tag, entry.message)
                LogSeverity.D -> Log.d(entry.tag, entry.message)
                LogSeverity.I -> Log.i(entry.tag, entry.message)
                LogSeverity.W -> Log.w(entry.tag, entry.message)
                LogSeverity.E -> Log.e(entry.tag, entry.message)
            }
        }
    }
    
    // ========== Initialization ==========
    
    private fun initializeNameMatcher() {
        nameMatcher = CompanyNameMatcher(AssetDatabaseProvider(applicationContext))
        
        serviceScope.launch {
            val success = nameMatcher?.initialize() ?: false
            if (success) {
                asyncLog(LogSeverity.I, TAG, "Matcher initialized: ${nameMatcher?.size()} companies")
            } else {
                asyncLog(LogSeverity.E, TAG, "Matcher initialization FAILED")
            }
        }
    }
    
    // ========== Polling ==========
    
    private fun startPolling() {
        pollingJob = backgroundScope.launch {
            while (true) {
                delay(POLL_INTERVAL_MS)
                
                if (isLinkedInForeground.get() && isProcessing.compareAndSet(false, true)) {
                    try {
                        processCurrentScreen()
                    } finally {
                        isProcessing.set(false)
                    }
                }
            }
        }
    }
    
    // ========== Event Handling ==========
    
    private fun handleWindowStateChanged(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString()
        val className = event.className?.toString()
        
        asyncLog(LogSeverity.I, TAG, "=== WINDOW STATE CHANGED ===")
        asyncLog(LogSeverity.I, TAG, "  package: $packageName")
        asyncLog(LogSeverity.I, TAG, "  className: $className")
        asyncLog(LogSeverity.I, TAG, "  isLinkedInForeground (before): ${isLinkedInForeground.get()}")
        asyncLog(LogSeverity.I, TAG, "  linkedInWasInBackground: $linkedInWasInBackground")
        
        if (packageName == LINKEDIN_PACKAGE) {
            currentClassName = className
            val wasInForeground = isLinkedInForeground.getAndSet(true)
            asyncLog(LogSeverity.I, TAG, "  ACTION: Setting isLinkedInForeground = true (was: $wasInForeground)")
            
            if (linkedInWasInBackground) {
                asyncLog(LogSeverity.I, TAG, "  ACTION: LinkedIn resumed from background - resetting dismissal")
                LinkedInOverlayService.resetDismissal(applicationContext)
                linkedInWasInBackground = false
            }
        } else {
            // Left LinkedIn - always hide overlay regardless of previous state
            val wasInForeground = isLinkedInForeground.get()
            asyncLog(LogSeverity.I, TAG, "  ACTION: Left LinkedIn (wasInForeground: $wasInForeground)")
            
            if (wasInForeground) {
                asyncLog(LogSeverity.I, TAG, "  ACTION: Setting linkedInWasInBackground = true")
                linkedInWasInBackground = true
            }
            
            asyncLog(LogSeverity.I, TAG, "  ACTION: Hiding overlay (system-triggered)")
            isLinkedInForeground.set(false)
            
            try {
                LinkedInOverlayService.hideOverlay(applicationContext)
                asyncLog(LogSeverity.I, TAG, "  ACTION: hideOverlay() call completed successfully")
            } catch (e: Exception) {
                asyncLog(LogSeverity.E, TAG, "  ACTION: hideOverlay() call FAILED: ${e.message}")
            }
        }
        
        asyncLog(LogSeverity.I, TAG, "  isLinkedInForeground (after): ${isLinkedInForeground.get()}")
    }
    
    // ========== Processing ==========
    
    private suspend fun processCurrentScreen() = withContext(Dispatchers.Default) {
        asyncLog(LogSeverity.D, TAG, "=== PROCESSING CURRENT SCREEN ===")
        
        val rootNode: AccessibilityNodeInfo? = rootInActiveWindow
        
        if (rootNode == null) {
            asyncLog(LogSeverity.V, TAG, "rootInActiveWindow is null")
            return@withContext
        }
        
        // Double-check: only process if LinkedIn is actually in foreground
        val rootNodePackage = rootNode.packageName?.toString()
        @Suppress("DEPRECATION")
        rootNode.recycle()
        
        if (rootNodePackage != LINKEDIN_PACKAGE) {
            asyncLog(LogSeverity.I, TAG, "=== LEFT LINKEDIN (detected in polling) ===")
            asyncLog(LogSeverity.I, TAG, "  rootNodePackage: $rootNodePackage")
            asyncLog(LogSeverity.I, TAG, "  ACTION: Hiding overlay (LinkedIn not in foreground)")
            
            isLinkedInForeground.set(false)
            linkedInWasInBackground = true
            
            try {
                LinkedInOverlayService.hideOverlay(applicationContext)
                asyncLog(LogSeverity.I, TAG, "  ACTION: hideOverlay() call completed")
            } catch (e: Exception) {
                asyncLog(LogSeverity.E, TAG, "  ACTION: hideOverlay() call FAILED: ${e.message}")
            }
            
            return@withContext
        }
        
        // Re-fetch node after recycle (we recycled it above for the check)
        val linkedInRoot: AccessibilityNodeInfo? = rootInActiveWindow
        
        if (linkedInRoot == null) {
            asyncLog(LogSeverity.V, TAG, "LinkedIn root is null after check")
            return@withContext
        }
        
        try {
            // Log full tree structure for analysis
            asyncLog(LogSeverity.I, TAG, "--- FULL TREE DUMP ---")
            logTreeAsync(linkedInRoot)
            
            // Log summary statistics
            logSummaryAsync(linkedInRoot)
            
            // Log all view IDs
            logViewIdsAsync(linkedInRoot)
            
            // Log all text content
            logTextsAsync(linkedInRoot)
            
            // Detect screen profile
            val profile = ScreenProfile.detect(linkedInRoot, LINKEDIN_PACKAGE, currentClassName)
            asyncLog(LogSeverity.I, TAG, "Detected profile: ${profile.id} - ${profile.getDescription()}")
            
            // Extract company names
            val companyNames = try {
                profile.extractCompanyNames(linkedInRoot)
            } catch (e: NotImplementedError) {
                asyncLog(LogSeverity.D, TAG, "Company extraction not implemented for profile: ${profile.id}")
                emptyList()
            }
            
            asyncLog(LogSeverity.I, TAG, "Extracted ${companyNames.size} company names")
            companyNames.forEach { name ->
                asyncLog(LogSeverity.D, TAG, "  Company: $name")
            }
            
            // Match against database
            if (companyNames.isNotEmpty()) {
                matchCompanies(companyNames)
            }
            
        } catch (e: Exception) {
            asyncLog(LogSeverity.E, TAG, "Error processing screen: ${e.message}")
        } finally {
            @Suppress("DEPRECATION")
            linkedInRoot.recycle()
        }
    }
    
    // ========== Tree Logging (Async) ==========
    
    private fun logTreeAsync(root: AccessibilityNodeInfo) {
        val sb = StringBuilder()
        sb.append("=== ACCESSIBILITY TREE DUMP START ===\n")
        sb.append("Package: ${root.packageName}\n")
        sb.append("Window: ${root.windowId}\n")
        sb.append("Root class: ${root.className}\n")
        sb.append("---\n")
        
        fun traverse(node: AccessibilityNodeInfo, depth: Int) {
            val indent = "  ".repeat(depth)
            val viewId = node.viewIdResourceName?.substringAfterLast(':') ?: "null"
            val text = node.text?.toString()?.take(50) ?: ""
            val contentDesc = node.contentDescription?.toString()?.take(30) ?: ""
            val flags = buildString {
                if (node.isClickable) append('C')
                if (node.isScrollable) append('S')
                if (node.isEnabled) append('-')
                if (node.isFocusable) append('F')
            }
            val bounds = android.graphics.Rect()
            @Suppress("DEPRECATION")
            node.getBoundsInScreen(bounds)
            
            sb.append("$indent[${depth}]${node.className} | $viewId | '$text' | '$contentDesc' | $flags | $bounds\n")
            
            for (i in 0 until node.childCount) {
                @Suppress("DEPRECATION")
                node.getChild(i)?.let { traverse(it, depth + 1) }
            }
        }
        
        @Suppress("DEPRECATION")
        traverse(root, 0)
        
        sb.append("=== ACCESSIBILITY TREE DUMP END ===")
        
        // Split and log each line
        sb.lines().forEach { line ->
            if (line.isNotEmpty()) {
                asyncLog(LogSeverity.V, "LinkedInTree", line)
            }
        }
    }
    
    private fun logSummaryAsync(root: AccessibilityNodeInfo) {
        var totalNodes = 0
        var textViews = 0
        var maxDepth = 0
        
        fun traverse(node: AccessibilityNodeInfo, depth: Int) {
            totalNodes++
            textViews += if (node.className?.contains("TextView") == true) 1 else 0
            maxDepth = maxOf(maxDepth, depth)
            
            for (i in 0 until node.childCount) {
                node.getChild(i)?.let { traverse(it, depth + 1) }
            }
        }
        
        @Suppress("DEPRECATION")
        traverse(root, 0)
        
        asyncLog(LogSeverity.I, "LinkedInTree", "=== TREE SUMMARY ===")
        asyncLog(LogSeverity.I, "LinkedInTree", "Total nodes: $totalNodes")
        asyncLog(LogSeverity.I, "LinkedInTree", "TextViews: $textViews")
        asyncLog(LogSeverity.I, "LinkedInTree", "Max depth: $maxDepth")
    }
    
    private fun logViewIdsAsync(root: AccessibilityNodeInfo) {
        val viewIds = mutableSetOf<String>()
        
        fun traverse(node: AccessibilityNodeInfo) {
            node.viewIdResourceName?.let { 
                val localId = it.substringAfterLast(':')
                viewIds.add(localId)
            }
            
            for (i in 0 until node.childCount) {
                node.getChild(i)?.let { traverse(it) }
            }
        }
        
        @Suppress("DEPRECATION")
        traverse(root)
        
        asyncLog(LogSeverity.I, "LinkedInTree", "=== VIEW IDS (${viewIds.size}) ===")
        viewIds.sorted().forEach { id ->
            asyncLog(LogSeverity.D, "LinkedInTree", "  $id")
        }
    }
    
    private fun logTextsAsync(root: AccessibilityNodeInfo) {
        val texts = mutableSetOf<String>()
        
        fun traverse(node: AccessibilityNodeInfo) {
            node.text?.toString()?.trim()?.takeIf { it.isNotEmpty() && it.length <= 100 }?.let { texts.add(it) }
            node.contentDescription?.toString()?.trim()?.takeIf { it.isNotEmpty() && it.length <= 100 }?.let { texts.add(it) }
            
            for (i in 0 until node.childCount) {
                node.getChild(i)?.let { traverse(it) }
            }
        }
        
        @Suppress("DEPRECATION")
        traverse(root)
        
        asyncLog(LogSeverity.I, "LinkedInTree", "=== TEXT CONTENT (${texts.size}) ===")
        texts.sorted().forEach { text ->
            asyncLog(LogSeverity.D, "LinkedInTree", "  $text")
        }
    }
    
    // ========== Matching ==========
    
    private suspend fun matchCompanies(names: List<String>) {
        val matcher = nameMatcher
        
        if (matcher == null || !matcher.isInitialized()) {
            return
        }
        
        val matches = matcher.findAll(names)
        
        if (matches.isNotEmpty()) {
            asyncLog(LogSeverity.I, TAG, "=== FLAGGED COMPANIES DETECTED (${matches.size}) ===")
            matches.forEach { result ->
                asyncLog(LogSeverity.W, TAG, "  FLAGGED: '${result.matchedName}' -> ${result.item.id}")
            }
            
            val flaggedCompanies = matches.map { result ->
                FlaggedCompany(
                    id = result.item.id,
                    name = result.matchedName,
                    reasons = result.item.r.joinToString(", "),
                    linkedinUrl = result.item.li
                )
            }
            
            LinkedInOverlayService.showOverlay(applicationContext, flaggedCompanies)
        } else {
            LinkedInOverlayService.hideOverlay(applicationContext)
        }
    }
}
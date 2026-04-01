package com.thewallboycott.android.accessibility

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import com.thewallboycott.android.data.AssetDatabaseProvider

/**
 * Accessibility service that monitors LinkedIn and detects flagged companies.
 * 
 * This service:
 * 1. Detects when LinkedIn is in the foreground
 * 2. Polls the accessibility tree every 5 seconds
 * 3. Logs the tree structure for analysis
 * 4. Extracts company names once profiles are implemented
 * 5. Matches against the boycott database
 * 
 * For MVP: Focus on extensive logging to understand the LinkedIn tree structure.
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
        private const val POLL_INTERVAL_MS = 5000L
        
        /**
         * LinkedIn's package name.
         */
        const val LINKEDIN_PACKAGE = "com.linkedin.android"
        
        /**
         * Check if this service is enabled.
         */
        fun isServiceEnabled(context: android.content.Context): Boolean {
            val expectedService = "${context.packageName}/${LinkedInAccessibilityService::class.java.name}"
            val enabledServices = android.provider.Settings.Secure.getString(
                context.contentResolver,
                android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            
            return enabledServices.contains(expectedService)
        }
    }
    
    // Coroutine scope for async operations
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    
    // Handler for periodic polling
    private val handler = Handler(Looper.getMainLooper())
    
    // Company name matcher (initialized lazily)
    private var nameMatcher: CompanyNameMatcher? = null
    
    // Whether LinkedIn is currently in foreground
    private var isLinkedInForeground = false
    
    // Track if LinkedIn was in background (to reset overlay dismissal)
    private var linkedInWasInBackground = false
    
    // Current activity/fragment class name
    private var currentClassName: String? = null
    
    // Polling runnable
    private val pollingRunnable = object : Runnable {
        override fun run() {
            if (isLinkedInForeground) {
                Log.d(TAG, "Polling triggered - LinkedIn is in foreground")
                processCurrentScreen()
            } else {
                Log.v(TAG, "Polling skipped - LinkedIn not in foreground")
            }
            handler.postDelayed(this, POLL_INTERVAL_MS)
        }
    }
    
    // Track if service is running
    private var isServiceRunning = false
    
    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.i(TAG, "=== SERVICE CONNECTED ===")
        Log.i(TAG, "Service is now ready to receive accessibility events")
        Log.i(TAG, "Package filter configured for: $LINKEDIN_PACKAGE")
        
        isServiceRunning = true
        
        // Initialize the name matcher
        initializeNameMatcher()
        
        // Start polling
        handler.post(pollingRunnable)
    }
    
    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Log ALL accessibility events for debugging
        logAccessibilityEvent(event)
        
        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                // Active window changed - could be activity or fragment switch
                val packageName = event.packageName?.toString()
                val className = event.className?.toString()
                
                Log.d(TAG, "WINDOW_STATE_CHANGED: package=$packageName, className=$className")
                
                if (packageName == LINKEDIN_PACKAGE) {
                    currentClassName = className
                    isLinkedInForeground = true
                    
                    // Reset dismissal if LinkedIn was in background and came back
                    if (linkedInWasInBackground) {
                        Log.i(TAG, "LinkedIn came back from background, resetting dismissal")
                        LinkedInOverlayService.resetDismissal(applicationContext)
                        linkedInWasInBackground = false
                    }
                    
                    Log.i(TAG, "LinkedIn window changed: $className")
                } else if (packageName == packageName) {
                    // Our app came to foreground
                    isLinkedInForeground = false
                    linkedInWasInBackground = true
                    Log.d(TAG, "Our app came to foreground")
                    // Hide overlay when LinkedIn goes to background
                    LinkedInOverlayService.hideOverlay(applicationContext)
                } else {
                    // Some other app
                    isLinkedInForeground = false
                    linkedInWasInBackground = true
                    Log.v(TAG, "Other app in foreground: $packageName")
                    // Hide overlay when LinkedIn goes to background
                    LinkedInOverlayService.hideOverlay(applicationContext)
                }
            }
            
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                // Content changed within a window
                if (event.packageName == LINKEDIN_PACKAGE) {
                    Log.v(TAG, "Content changed in LinkedIn: className=${event.className}")
                    // Don't log full tree on content changes (too noisy)
                }
            }
            
            AccessibilityEvent.TYPE_VIEW_FOCUSED,
            AccessibilityEvent.TYPE_VIEW_CLICKED,
            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED -> {
                // User interaction events - log verbosely
                if (event.packageName == LINKEDIN_PACKAGE) {
                    Log.v(TAG, "User interaction: ${event.eventType} ${event.className}")
                }
            }
            
            else -> {
                // Other events
                if (event.packageName == LINKEDIN_PACKAGE) {
                    Log.v(TAG, "Event ${event.eventType}: ${event.className}")
                }
            }
        }
    }
    
    override fun onInterrupt() {
        Log.w(TAG, "Accessibility service interrupted")
    }
    
    override fun onDestroy() {
        Log.i(TAG, "=== SERVICE DESTROYED ===")
        isServiceRunning = false
        handler.removeCallbacks(pollingRunnable)
        nameMatcher?.clear()
        super.onDestroy()
    }
    
    // ========== Private methods ==========
    
    private fun initializeNameMatcher() {
        Log.d(TAG, "Initializing CompanyNameMatcher...")
        nameMatcher = CompanyNameMatcher(AssetDatabaseProvider(applicationContext))
        
        serviceScope.launch {
            val success = nameMatcher?.initialize() ?: false
            if (success) {
                Log.i(TAG, "CompanyNameMatcher initialized: ${nameMatcher?.size()} companies")
            } else {
                Log.e(TAG, "CompanyNameMatcher initialization FAILED")
            }
        }
    }
    
    private fun logAccessibilityEvent(event: AccessibilityEvent) {
        val sb = StringBuilder()
        sb.append("Event[${event.eventType}]: ")
        sb.append("pkg=${event.packageName}, ")
        sb.append("class=${event.className}, ")
        sb.append("text=${event.text}, ")
        sb.append("contentDesc=${event.contentDescription}, ")
        sb.append("source=${event.source?.className}")
        
        Log.v(TAG, sb.toString())
    }
    
    /**
     * Process the current screen: log tree, detect profile, extract names.
     */
    private fun processCurrentScreen() {
        Log.d(TAG, "=== PROCESSING CURRENT SCREEN ===")
        
        val rootNode: AccessibilityNodeInfo? = rootInActiveWindow
        
        if (rootNode == null) {
            Log.e(TAG, "rootInActiveWindow is NULL - cannot process screen")
            return
        }
        
        try {
            // Log full tree structure for analysis
            Log.i(TAG, "--- FULL TREE DUMP ---")
            TreeLogger.log(rootNode)
            
            // Log summary statistics
            TreeLogger.logSummary(rootNode)
            
            // Log all view IDs (for identifying LinkedIn's IDs)
            TreeLogger.logViewIds(rootNode)
            
            // Log all text content (for identifying company name patterns)
            TreeLogger.logTexts(rootNode)
            
            // Try to detect screen profile
            try {
                val profile = ScreenProfile.detect(rootNode, LINKEDIN_PACKAGE, currentClassName)
                Log.i(TAG, "Detected profile: ${profile.id} - ${profile.getDescription()}")
                
                // Try to extract company names
                try {
                    val companyNames = profile.extractCompanyNames(rootNode)
                    Log.i(TAG, "Extracted ${companyNames.size} company names")
                    companyNames.forEach { name ->
                        Log.d(TAG, "  Company: $name")
                    }
                    
                    // Match against database
                    if (companyNames.isNotEmpty()) {
                        matchCompanies(companyNames)
                    }
                } catch (e: NotImplementedError) {
                    Log.d(TAG, "Company extraction not implemented for profile: ${profile.id}")
                    
                    // MVP: For unknown/unsupported screens, log all text for debugging
                    if (profile == ScreenProfile.Unknown) {
                        val allTexts = extractAllText(rootNode)
                        Log.d(TAG, "All visible text: ${allTexts.joinToString(", ")}")
                        
                        // Try naive matching against database
                        if (allTexts.isNotEmpty()) {
                            Log.i(TAG, "Attempting naive match on ${allTexts.size} text fragments")
                            matchCompanies(allTexts)
                        }
                    }
                }
            } catch (e: NotImplementedError) {
                Log.d(TAG, "Screen profile detection not implemented")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error processing screen", e)
            throw e // Fail fast
        } finally {
            @Suppress("DEPRECATION")
            rootNode.recycle()
        }
    }
    
    /**
     * Extract all visible text from accessibility tree (naive approach).
     */
    private fun extractAllText(root: AccessibilityNodeInfo): List<String> {
        val texts = mutableListOf<String>()
        
        fun traverse(node: AccessibilityNodeInfo) {
            // Get text content
            node.text?.toString()?.trim()?.takeIf { it.isNotEmpty() }?.let { 
                texts.add(it) 
            }
            
            // Get content description
            node.contentDescription?.toString()?.trim()?.takeIf { it.isNotEmpty() }?.let { 
                texts.add(it) 
            }
            
            // Traverse children
            for (i in 0 until node.childCount) {
                node.getChild(i)?.let { traverse(it) }
            }
        }
        
        traverse(root)
        
        // Remove duplicates and very short strings
        return texts
            .distinct()
            .filter { it.length >= 2 } // Filter out single characters
            .take(100) // Limit to prevent log spam
    }
    
    /**
     * Match company names against the database.
     */
    private fun matchCompanies(names: List<String>) {
        val matcher = nameMatcher
        
        if (matcher == null) {
            Log.w(TAG, "CompanyNameMatcher not initialized - cannot match")
            return
        }
        
        if (!matcher.isInitialized()) {
            Log.w(TAG, "CompanyNameMatcher not ready yet")
            return
        }
        
        val matches = matcher.findAll(names)
        
        if (matches.isNotEmpty()) {
            Log.i(TAG, "=== FLAGGED COMPANIES DETECTED (${matches.size}) ===")
            val flaggedCompanies = matches.map { result ->
                Log.w(TAG, "  FLAGGED: '${result.matchedName}' -> ${result.item.id} (reasons: ${result.item.r})")
                FlaggedCompany(
                    id = result.item.id,
                    name = result.matchedName,
                    reasons = result.item.r.joinToString(", "),
                    linkedinUrl = result.item.li
                )
            }
            
            // Show overlay
            LinkedInOverlayService.showOverlay(applicationContext, flaggedCompanies)
        } else {
            Log.d(TAG, "No matched companies found")
            // Hide overlay when no matches
            LinkedInOverlayService.hideOverlay(applicationContext)
        }
    }
}
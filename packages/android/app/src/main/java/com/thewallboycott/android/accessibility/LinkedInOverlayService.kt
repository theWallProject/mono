package com.thewallboycott.android.accessibility

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.thewallboycott.android.R

/**
 * Foreground service that displays a persistent overlay when flagged companies are detected in LinkedIn.
 * 
 * The overlay:
 * - Appears in the top-left corner of the screen
 * - Shows a list of flagged company names
 * - Each name is tappable (opens LinkedIn page if available)
 * - Has a dismiss button
 * 
 * This service is controlled by LinkedInAccessibilityService.
 */
class LinkedInOverlayService : Service() {
    
    companion object {
        private const val TAG = "LinkedInOverlay"
        private const val NOTIFICATION_CHANNEL_ID = "linkedin_overlay_channel"
        private const val NOTIFICATION_ID = 1001
        
        const val ACTION_SHOW_OVERLAY = "com.thewallboycott.android.action.SHOW_OVERLAY"
        const val ACTION_HIDE_OVERLAY = "com.thewallboycott.android.action.HIDE_OVERLAY"
        const val ACTION_DISMISS_OVERLAY = "com.thewallboycott.android.action.DISMISS_OVERLAY"  // User clicked X
        const val EXTRA_COMPANIES = "companies"
        
        /**
         * Start the overlay service with the given companies.
         */
        fun showOverlay(context: Context, companies: List<FlaggedCompany>) {
            val intent = Intent(context, LinkedInOverlayService::class.java).apply {
                action = ACTION_SHOW_OVERLAY
                putExtra(EXTRA_COMPANIES, ArrayList(companies))
            }
            context.startService(intent)
        }
        
        /**
         * Hide the overlay (system-triggered, e.g., LinkedIn went to background).
         * Does NOT set userDismissed - user can see overlay again when returning to LinkedIn.
         */
        fun hideOverlay(context: Context) {
            Log.i(TAG, "=== hideOverlay() STATIC METHOD CALLED ===")
            Log.i(TAG, "  Creating HIDE_OVERLAY intent")
            val intent = Intent(context, LinkedInOverlayService::class.java).apply {
                action = ACTION_HIDE_OVERLAY
            }
            context.startService(intent)
            Log.i(TAG, "  startService() called for HIDE_OVERLAY")
        }
        
        /**
         * Dismiss the overlay (user-triggered, clicked X button).
         * Sets userDismissed - overlay won't show until LinkedIn restarts.
         */
        fun dismissOverlay(context: Context) {
            val intent = Intent(context, LinkedInOverlayService::class.java).apply {
                action = ACTION_DISMISS_OVERLAY
            }
            context.startService(intent)
        }
        
        /**
         * Reset dismissal state (called when LinkedIn restarts or comes to foreground).
         */
        fun resetDismissal(context: Context) {
            val intent = Intent(context, LinkedInOverlayService::class.java).apply {
                action = "com.thewallboycott.android.action.RESET_DISMISSAL"
            }
            context.startService(intent)
        }
    }
    
    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private var isOverlayShowing = false
    private var currentCompanies: List<FlaggedCompany> = emptyList()
    private var userDismissed = false
    
    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "Overlay service created")
        
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        
        // Reset dismissal state on service creation (fresh start)
        userDismissed = false
        
        // Start as foreground service
        startForeground(NOTIFICATION_ID, createNotification())
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.i(TAG, "=== onStartCommand ===")
        Log.i(TAG, "  action: ${intent?.action}")
        Log.i(TAG, "  isOverlayShowing: $isOverlayShowing")
        Log.i(TAG, "  userDismissed: $userDismissed")
        
        when (intent?.action) {
            ACTION_SHOW_OVERLAY -> {
                @Suppress("DEPRECATION", "UNCHECKED_CAST")
                val companies = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getSerializableExtra(EXTRA_COMPANIES, ArrayList::class.java) as? ArrayList<FlaggedCompany>
                } else {
                    intent.getSerializableExtra(EXTRA_COMPANIES) as? ArrayList<FlaggedCompany>
                } ?: emptyList()
                
                Log.i(TAG, "  SHOW_OVERLAY: ${companies.size} companies")
                showOverlay(companies)
            }
            ACTION_HIDE_OVERLAY -> {
                // System-triggered hide (LinkedIn went to background)
                // Do NOT set userDismissed - user can see overlay when returning
                Log.i(TAG, "  HIDE_OVERLAY: System-triggered hide, NOT setting userDismissed")
                Log.i(TAG, "  HIDE_OVERLAY: Current isOverlayShowing = $isOverlayShowing")
                hideOverlay()
                Log.i(TAG, "  HIDE_OVERLAY: After hideOverlay(), isOverlayShowing = $isOverlayShowing")
            }
            ACTION_DISMISS_OVERLAY -> {
                // User clicked X button - set userDismissed
                Log.i(TAG, "  DISMISS_OVERLAY: User clicked X - setting userDismissed = true")
                userDismissed = true
                hideOverlay()
            }
            "com.thewallboycott.android.action.RESET_DISMISSAL" -> {
                Log.i(TAG, "  RESET_DISMISSAL: Setting userDismissed = false")
                userDismissed = false
            }
        }
        
        return START_NOT_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onDestroy() {
        Log.i(TAG, "Overlay service destroyed")
        hideOverlay()
        super.onDestroy()
    }
    
    // ========== Private methods ==========
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                getString(R.string.linkedin_overlay_notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.linkedin_overlay_notification_channel_description)
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle(getString(R.string.linkedin_overlay_notification_title))
            .setContentText(getString(R.string.linkedin_overlay_notification_text))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }
    
    private fun showOverlay(companies: List<FlaggedCompany>) {
        if (companies.isEmpty()) {
            Log.d(TAG, "No companies to show, hiding overlay")
            hideOverlay()
            return
        }
        
        // Don't show if user dismissed (until LinkedIn restarts)
        if (userDismissed) {
            Log.d(TAG, "User dismissed overlay, skipping")
            return
        }
        
        // Check if companies are the same as current - avoid flash
        if (companies == currentCompanies && isOverlayShowing) {
            Log.d(TAG, "Same companies already showing, skipping update")
            return
        }
        
        currentCompanies = companies
        Log.i(TAG, "Showing overlay with ${companies.size} companies")
        
        // If overlay is already showing, just update the content
        if (isOverlayShowing && overlayView != null) {
            updateOverlayContent(companies)
            Log.d(TAG, "Updated existing overlay content")
            return
        }
        
        // Otherwise create and show new overlay
        overlayView = createOverlayView(companies)
        
        try {
            windowManager.addView(overlayView, createLayoutParams())
            isOverlayShowing = true
            Log.i(TAG, "Overlay added to window")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to add overlay view", e)
        }
    }
    
    private fun hideOverlay() {
        Log.i(TAG, "=== hideOverlay() INSTANCE METHOD ===")
        Log.i(TAG, "  isOverlayShowing: $isOverlayShowing")
        Log.i(TAG, "  overlayView: ${overlayView != null}")
        
        if (isOverlayShowing && overlayView != null) {
            Log.i(TAG, "  ACTION: Removing overlay from window manager")
            try {
                windowManager.removeView(overlayView)
                Log.i(TAG, "  ACTION: Overlay REMOVED successfully")
            } catch (e: Exception) {
                Log.e(TAG, "  ERROR: Failed to remove overlay view: ${e.message}", e)
            }
            isOverlayShowing = false
            currentCompanies = emptyList()
            Log.i(TAG, "  ACTION: isOverlayShowing set to false")
        } else {
            Log.i(TAG, "  ACTION: No overlay to remove (isOverlayShowing=$isOverlayShowing, overlayView=$overlayView)")
        }
    }
    
    private fun updateOverlayContent(companies: List<FlaggedCompany>) {
        val scrollView = overlayView as? android.widget.ScrollView ?: return
        val container = scrollView.getChildAt(0) as? android.widget.LinearLayout ?: return
        
        // Find the company views (skip header at index 0)
        val companyViews = (1 until container.childCount).map { container.getChildAt(it) }
        
        // Remove old company views
        companyViews.forEach { container.removeView(it) }
        
        // Add new company views
        val marginPx = (8 * resources.displayMetrics.density).toInt()
        companies.forEach { company ->
            val companyView = createCompanyTextView(company, marginPx)
            container.addView(companyView)
        }
    }
    
    private fun createCompanyTextView(company: FlaggedCompany, marginPx: Int): TextView {
        return TextView(this).apply {
            text = "• ${company.name}"
            setTextColor(android.graphics.Color.WHITE)
            textSize = 14f
            setPadding(0, marginPx / 2, 0, marginPx / 2)
            
            if (company.linkedinUrl != null) {
                setTextColor(android.graphics.Color.parseColor("#4FC3F7"))
                setOnClickListener {
                    openLinkedInCompany(company.linkedinUrl)
                }
            }
        }
    }
    
    private fun createOverlayView(companies: List<FlaggedCompany>): View {
        val dpScale = resources.displayMetrics.density
        val paddingPx = (12 * dpScale).toInt()
        val marginPx = (8 * dpScale).toInt()
        
        // Main container
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#CC000000"))
            setPadding(paddingPx, paddingPx, paddingPx, paddingPx)
            
            // Rounded corners
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#E6000000"))
                cornerRadius = 12 * dpScale
            }
        }
        
        // Header with title and dismiss button
        val headerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, marginPx)
        }
        
        val titleView = TextView(this).apply {
            text = getString(R.string.linkedin_overlay_title)
            setTextColor(Color.WHITE)
            textSize = 14f
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        
        val dismissButton = TextView(this).apply {
            text = "×"
            setTextColor(Color.parseColor("#FF6B6B"))
            textSize = 24f
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            setPadding(marginPx, 0, 0, 0)
            setOnClickListener {
                Log.i(TAG, "Dismiss button clicked - user dismissed")
                dismissOverlay(applicationContext)
            }
        }
        
        headerLayout.addView(titleView)
        headerLayout.addView(dismissButton)
        container.addView(headerLayout)
        
        // Company list
        companies.forEach { company ->
            val companyView = TextView(this).apply {
                text = "• ${company.name}"
                setTextColor(Color.WHITE)
                textSize = 14f
                setPadding(0, marginPx / 2, 0, marginPx / 2)
                
                // Only make clickable if has LinkedIn URL
                if (company.linkedinUrl != null) {
                    setTextColor(Color.parseColor("#4FC3F7"))
                    setOnClickListener {
                        openLinkedInCompany(company.linkedinUrl)
                    }
                }
            }
            container.addView(companyView)
        }
        
        // Wrap in ScrollView for long lists
        val scrollView = ScrollView(this).apply {
            addView(container)
            isVerticalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
        }
        
        return scrollView
    }
    
    private fun openLinkedInCompany(url: String) {
        try {
            // LinkedIn URLs from database are like "company-name"
            // We need to open them in the LinkedIn app or browser
            val linkedInUri = Uri.parse(url)
            val intent = Intent(Intent.ACTION_VIEW, linkedInUri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
            Log.i(TAG, "Opened LinkedIn: $url")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open LinkedIn URL: $url", e)
        }
    }
    
    private fun createLayoutParams(): WindowManager.LayoutParams {
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }
        
        return WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            android.graphics.PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 16
            y = 100 // Below status bar
        }
    }
}

/**
 * Data class representing a flagged company detected in LinkedIn.
 */
data class FlaggedCompany(
    val id: String,
    val name: String,
    val reasons: String,
    val linkedinUrl: String? = null
) : java.io.Serializable
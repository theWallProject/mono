package com.thewallboycott.android.accessibility

import android.util.Log
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Defines screen detection profiles for LinkedIn.
 * 
 * Each profile knows how to:
 * 1. Detect if it matches the current screen
 * 2. Extract company names from that screen type
 * 
 * Tree structure analysis from LinkedIn feed:
 * 
 * FEED STRUCTURE:
 * ```
 * [1] DrawerLayout | id/home_drawer_layout
 * [2]   ScrollView | id/main_content
 * [3]     LinearLayout | id/home_top_bar
 * [3]     ComposeView | id/sdui_compose_view
 * [4]       View (outer container)
 * [5]         View 
 * [6]           View
 * [7]             View | lazyColumn | scrollable  <-- FEED CONTAINER
 * [8]               View (post stack item)
 * [9]                 View (post container)
 * [10]                  View (clickable post)
 * [11]                    Button (profile picture)
 * [11]                    View (actor container) | contentDesc="Name Verified Profile 1st"
 * [12]                      TextView | "Name Here"  <-- PERSON/COMPANY NAME
 * [12]                      TextView | "   • 1st"
 * ```
 * 
 * PROMOTED/Sponsored company posts:
 * ```
 * [10]                  View (promoted post)
 * [11]                    Button | contentDesc="View company: Company Name"
 * [11]                    TextView | "Company Name"  <-- COMPANY NAME
 * [11]                    TextView | "5,266,485 followers"
 * [11]                    TextView | "Promoted"  <-- SPONSORED MARKER
 * ```
 * 
 * Company patterns:
 * - ContentDescription starting with "View company:" indicates a company page
 * - TextView with "Promoted" sibling indicates sponsored content
 * - "followers" text near name indicates company/organization
 */
sealed class ScreenProfile(val id: String) {
    
    companion object {
        private const val TAG = "ScreenProfile"
        
        /**
         * LinkedIn's main activity class for feed screen.
         */
        const val MAIN_ACTIVITY = "com.linkedin.android.infra.navigation.MainActivity"
        
        /**
         * View ID for the ComposeView that contains the feed.
         */
        const val SDUI_COMPOSE_VIEW_ID = "sdui_compose_view"
        
        /**
         * View ID for the LazyColumn (Jetpack Compose lazy column).
         */
        const val LAZY_COLUMN_VIEW_ID = "lazyColumn"
        
        /**
         * Content description prefix for company profile buttons.
         */
        const val VIEW_COMPANY_PREFIX = "View company:"
        
        /**
         * Text marker for promoted/sponsored content.
         */
        const val PROMOTED_MARKER = "Promoted"
        
        /**
         * Text marker for followers count (indicates company page).
         */
        const val FOLLOWERS_MARKER = "followers"
        
        /**
         * All implemented profiles in priority order.
         * Unknown is implicitly the fallback.
         */
        val ALL_PROFILES: List<ScreenProfile> = listOf(
            Feed,
            CompanyPage,
            Jobs,
            Search
        )
        
        /**
         * Detect which profile matches the current screen.
         * Returns Unknown if no profile matches.
         */
        fun detect(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): ScreenProfile {
            for (profile in ALL_PROFILES) {
                try {
                    if (profile.matches(rootNode, packageName, className)) {
                        Log.i(TAG, "Detected profile: ${profile.id}")
                        return profile
                    }
                } catch (e: NotImplementedError) {
                    // Profile not yet implemented, skip
                    Log.v(TAG, "Profile ${profile.id} not implemented")
                    continue
                }
            }
            Log.i(TAG, "No profile matched, returning Unknown")
            return Unknown
        }
    }
    
    /**
     * Check if this profile matches the current accessibility tree.
     */
    abstract fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean
    
    /**
     * Extract company names from this screen type.
     */
    abstract fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String>
    
    /**
     * Get human-readable description of this profile.
     */
    abstract fun getDescription(): String
    
    /**
     * Profile for LinkedIn main feed.
     * 
     * Detection criteria:
     * - Activity class: com.linkedin.android.infra.navigation.MainActivity
     * - Has ComposeView with id "sdui_compose_view"
     * - Has LazyColumn view (scrollable container)
     * 
     * Company extraction strategy:
     * 1. Find "View company:" content descriptions → extract company name
     * 2. Find "Promoted" TextViews and look for company name sibling
     * 3. Find TextViews with "followers" sibling
     */
    @Suppress("DEPRECATION")
    object Feed : ScreenProfile("feed") {
        
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            // Check package
            if (packageName != "com.linkedin.android") {
                Log.d(TAG, "Feed.matches: Wrong package: $packageName")
                return false
            }
            
            // Check activity class
            if (className != MAIN_ACTIVITY) {
                Log.d(TAG, "Feed.matches: Wrong activity: $className (expected $MAIN_ACTIVITY)")
                return false
            }
            
            // Check for feed container (ComposeView with sdui_compose_view)
            val composeView = NodeQuery.create()
                .withViewId(SDUI_COMPOSE_VIEW_ID)
                .findFirstIn(rootNode)
            
            if (composeView == null) {
                Log.d(TAG, "Feed.matches: No sdui_compose_view found")
                return false
            }
            
            // Check for lazy column
            val lazyColumn = NodeQuery.create()
                .withViewId(LAZY_COLUMN_VIEW_ID)
                .findFirstIn(composeView)
            
            composeView.recycle()
            
            if (lazyColumn == null) {
                Log.d(TAG, "Feed.matches: No lazyColumn found in ComposeView")
                return false
            }
            
            lazyColumn.recycle()
            
            Log.i(TAG, "Feed.matches: MATCHED - Feed screen detected")
            return true
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            val companies = mutableListOf<String>()
            val processedNames = mutableSetOf<String>()
            
            try {
                // Strategy 1: Find "View company:" content descriptions
                extractFromCompanyButtons(rootNode, companies, processedNames)
                
                // Strategy 2: Find promoted/sponsored content with company names
                extractFromPromotedPosts(rootNode, companies, processedNames)
                
                // Strategy 3: Find posts with followers count (company indicator)
                extractFromFollowersCount(rootNode, companies, processedNames)
                
            } catch (e: Exception) {
                Log.e(TAG, "Feed.extractCompanyNames: Error during extraction", e)
                throw e // Fail fast
            }
            
            Log.i(TAG, "Feed.extractCompanyNames: Found ${companies.size} companies: ${companies.joinToString()}")
            return companies
        }
        
        /**
         * Extract company names from "View company:" buttons.
         * These are explicit company page links in posts.
         */
        private fun extractFromCompanyButtons(
            rootNode: AccessibilityNodeInfo,
            companies: MutableList<String>,
            processedNames: MutableSet<String>
        ) {
            // Find all buttons with contentDescription starting with "View company:"
            NodeQuery.findAll(rootNode) { node ->
                node.contentDescription?.toString()?.startsWith(VIEW_COMPANY_PREFIX) == true
            }.forEach { node ->
                val contentDesc = node.contentDescription?.toString() ?: return@forEach
                
                // Extract company name from "View company: Company Name"
                val companyName = contentDesc.removePrefix(VIEW_COMPANY_PREFIX).trim()
                
                if (companyName.isNotEmpty() && companyName !in processedNames) {
                    Log.d(TAG, "Found company from button: '$companyName'")
                    companies.add(companyName)
                    processedNames.add(companyName)
                }
                
                node.recycle()
            }
        }
        
        /**
         * Extract company names from promoted/sponsored posts.
         * These have "Promoted" TextViews nearby.
         */
        private fun extractFromPromotedPosts(
            rootNode: AccessibilityNodeInfo,
            companies: MutableList<String>,
            processedNames: MutableSet<String>
        ) {
            // Find TextViews containing "Promoted"
            val promotedNodes = NodeQuery.findAll(rootNode) { node ->
                node.text?.toString()?.contains(PROMOTED_MARKER) == true
            }
            
            promotedNodes.forEach { promotedNode ->
                // Find company name near the "Promoted" label
                // Look for TextViews in the same parent container
                val parent = promotedNode.parent
                if (parent != null) {
                    // Look for company name TextView in the same container
                    for (i in 0 until parent.childCount) {
                        parent.getChild(i)?.let { sibling ->
                            val text = sibling.text?.toString()?.trim()
                            if (text != null && 
                                text.isNotEmpty() && 
                                text != PROMOTED_MARKER &&
                                !text.contains(FOLLOWERS_MARKER) &&
                                text !in processedNames &&
                                !isGenericText(text)) {
                                
                                // Check if there's a "followers" TextView nearby (confirms company)
                                val hasFollowers = hasFollowersSibling(parent)
                                
                                if (hasFollowers) {
                                    Log.d(TAG, "Found company from promoted: '$text'")
                                    companies.add(text)
                                    processedNames.add(text)
                                }
                            }
                            sibling.recycle()
                        }
                    }
                    parent.recycle()
                }
                promotedNode.recycle()
            }
        }
        
        /**
         * Extract company names from posts with followers count.
         */
        private fun extractFromFollowersCount(
            rootNode: AccessibilityNodeInfo,
            companies: MutableList<String>,
            processedNames: MutableSet<String>
        ) {
            // Find TextViews containing "followers"
            NodeQuery.findAll(rootNode) { node ->
                node.text?.toString()?.contains(FOLLOWERS_MARKER, ignoreCase = true) == true
            }.forEach { followersNode ->
                // Company name should be in the same parent
                val parent = followersNode.parent
                if (parent != null) {
                    for (i in 0 until parent.childCount) {
                        parent.getChild(i)?.let { sibling ->
                            val text = sibling.text?.toString()?.trim()
                            if (text != null && 
                                text.isNotEmpty() && 
                                text !in processedNames &&
                                !text.contains(FOLLOWERS_MARKER) &&
                                !isGenericText(text)) {
                                
                                Log.d(TAG, "Found company from followers: '$text'")
                                companies.add(text)
                                processedNames.add(text)
                            }
                            sibling.recycle()
                        }
                    }
                    parent.recycle()
                }
                followersNode.recycle()
            }
        }
        
        /**
         * Check if parent has a "followers" TextView sibling.
         */
        private fun hasFollowersSibling(node: AccessibilityNodeInfo): Boolean {
            for (i in 0 until node.childCount) {
                node.getChild(i)?.let { child ->
                    val text = child.text?.toString()
                    child.recycle()
                    if (text?.contains(FOLLOWERS_MARKER, ignoreCase = true) == true) {
                        return true
                    }
                }
            }
            return false
        }
        
        /**
         * Check if text is generic/uninteresting (buttons, UI labels, etc.).
         */
        private fun isGenericText(text: String): Boolean {
            val genericPhrases = setOf(
                "View image", "View more options", "Hide Post", "Like", "Comment", 
                "Repost", "Send", "Open actor", "Reaction button", "Home", "Post",
                "My Network", "Notifications", "Jobs", "Search",
                "Promoted", "Sponsored", "Ad", "Advertisement",
                "Follow", "Following", "Connect", "Message", "Accept", "Decline"
            )
            return text in genericPhrases || 
                   text.startsWith("View", ignoreCase = true) ||
                   text.contains("button", ignoreCase = true) ||
                   text.matches(Regex("\\d+ .*")) // "77 reactions", "18 comments", etc.
        }
        
        override fun getDescription(): String = "LinkedIn Feed (home timeline)"
    }
    
    /**
     * Profile for LinkedIn company pages.
     * Contains company name in header, about section, etc.
     * 
     * Detection criteria:
     * - Has `pages_top_card` view (company header card)
     * - Has `pages_top_card_title` with company name
     * 
     * Company extraction strategy:
     * - Get company name from `search_bar_text` (cleanest)
     * - Or from `pages_top_card_title` (may have "Verified" suffix)
     */
    @Suppress("DEPRECATION")
    object CompanyPage : ScreenProfile("company_page") {
        
        private const val PAGES_TOP_CARD_ID = "pages_top_card"
        private const val PAGES_TOP_CARD_TITLE_ID = "pages_top_card_title"
        private const val SEARCH_BAR_TEXT_ID = "search_bar_text"
        
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            // Check package
            if (packageName != "com.linkedin.android") {
                Log.d(TAG, "CompanyPage.matches: Wrong package: $packageName")
                return false
            }
            
            // Check for pages_top_card (company header)
            val pagesTopCard = NodeQuery.create()
                .withViewId(PAGES_TOP_CARD_ID)
                .findFirstIn(rootNode)
            
            if (pagesTopCard == null) {
                Log.d(TAG, "CompanyPage.matches: No pages_top_card found")
                return false
            }
            
            pagesTopCard.recycle()
            
            Log.i(TAG, "CompanyPage.matches: MATCHED - Company page detected")
            return true
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            val companies = mutableListOf<String>()
            
            try {
                // Get from pages_top_card_title (may have "Verified" suffix)
                val titleNode = NodeQuery.create()
                    .withViewId(PAGES_TOP_CARD_TITLE_ID)
                    .findFirstIn(rootNode)
                
                if (titleNode != null) {
                    // Try contentDescription first (e.g., "Fiverr x, Verified")
                    val contentDesc = titleNode.contentDescription?.toString()?.trim()
                    if (!contentDesc.isNullOrEmpty()) {
                        // Remove "Verified" suffix if present
                        val name = contentDesc
                            .removeSuffix(", Verified")
                            .removeSuffix(" Verified")
                            .trim()
                        if (name.isNotEmpty()) {
                            Log.d(TAG, "CompanyPage: Found company from title contentDesc: '$name'")
                            companies.add(name)
                        }
                    } else {
                        // Fall back to text
                        val text = titleNode.text?.toString()?.trim()
                        if (!text.isNullOrEmpty()) {
                            // Remove " x" suffix (e.g., "Fiverr x" -> "Fiverr")
                            val name = text.removeSuffix(" x").trim()
                            if (name.isNotEmpty()) {
                                Log.d(TAG, "CompanyPage: Found company from title text: '$name'")
                                companies.add(name)
                            }
                        }
                    }
                    titleNode.recycle()
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "CompanyPage.extractCompanyNames: Error during extraction", e)
                throw e
            }
            
            Log.i(TAG, "CompanyPage.extractCompanyNames: Found ${companies.size} companies: ${companies.joinToString()}")
            return companies
        }
        
        override fun getDescription(): String = "LinkedIn Company Page"
    }
    
    /**
     * Profile for LinkedIn job listings.
     * Job cards contain company names.
     */
    object Jobs : ScreenProfile("jobs") {
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            // Check for Jobs tab being active or jobs-specific views
            // Placeholder - needs more analysis
            return false
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            throw NotImplementedError("Jobs extraction not implemented")
        }
        
        override fun getDescription(): String = "LinkedIn Jobs"
    }
    
    /**
     * Profile for LinkedIn search results.
     * Could contain companies, people, posts.
     */
    object Search : ScreenProfile("search") {
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            // Placeholder - needs more analysis
            return false
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            throw NotImplementedError("Search extraction not implemented")
        }
        
        override fun getDescription(): String = "LinkedIn Search Results"
    }
    
    /**
     * Unknown/unhandled screen type.
     * Used when we can't identify the screen.
     */
    object Unknown : ScreenProfile("unknown") {
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            // Unknown profile always matches (fallback)
            return true
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            // No extraction for unknown screens
            return emptyList()
        }
        
        override fun getDescription(): String = "Unknown Screen"
    }
}
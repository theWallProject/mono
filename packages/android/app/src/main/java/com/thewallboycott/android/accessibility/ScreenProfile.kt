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
            UserProfile,          // User profile with work history (must be before Feed)
            JobSearchNative,      // Native RecyclerView job search
            JobSearchResults,     // Compose-based job search results
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
     * Profile for native job search results (RecyclerView-based).
     * This is different from Compose-based job search.
     * 
     * Detection criteria:
     * - Has `careers_job_list_fragment_recycler_view` (native RecyclerView)
     * - Has `search_filters_list` (filter chips)
     * - Has `ad_entity_lockup_subtitle` (company names)
     * 
     * Company extraction strategy:
     * - Find all `ad_entity_lockup_subtitle` TextViews
     * - These contain company names: "KGiSL", "Nicoll Curtin", "Michael Page", etc.
     */
    @Suppress("DEPRECATION")
    object JobSearchNative : ScreenProfile("job_search_native") {
        
        private const val CAREERS_RECYCLER_ID = "careers_job_list_fragment_recycler_view"
        private const val SEARCH_FILTERS_ID = "search_filters_list"
        private const val COMPANY_SUBTITLE_ID = "ad_entity_lockup_subtitle"
        
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            // Check package
            if (packageName != "com.linkedin.android") {
                Log.d(TAG, "JobSearchNative.matches: Wrong package: $packageName")
                return false
            }
            
            // Check for careers job list recycler (native RecyclerView)
            val careersRecycler = NodeQuery.create()
                .withViewId(CAREERS_RECYCLER_ID)
                .findFirstIn(rootNode)
            
            if (careersRecycler != null) {
                careersRecycler.recycle()
                Log.i(TAG, "JobSearchNative.matches: MATCHED - Native job search detected (careers_recycler)")
                return true
            }
            
            // Also check for search filters list (present in job search)
            val searchFilters = NodeQuery.create()
                .withViewId(SEARCH_FILTERS_ID)
                .findFirstIn(rootNode)
            
            if (searchFilters != null) {
                searchFilters.recycle()
                Log.i(TAG, "JobSearchNative.matches: MATCHED - Native job search detected (search_filters)")
                return true
            }
            
            Log.d(TAG, "JobSearchNative.matches: No native job search views found")
            return false
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            val companies = mutableListOf<String>()
            val processedNames = mutableSetOf<String>()
            
            // Find all company subtitle TextViews (ad_entity_lockup_subtitle)
            NodeQuery.findAll(rootNode) { node ->
                node.viewIdResourceName?.contains(COMPANY_SUBTITLE_ID) == true
            }.forEach { node ->
                val companyName = node.text?.toString()?.trim()
                
                if (companyName != null && 
                    companyName.isNotEmpty() && 
                    companyName !in processedNames) {
                    Log.d(TAG, "JobSearchNative: Found company '$companyName'")
                    companies.add(companyName)
                    processedNames.add(companyName)
                }
                
                node.recycle()
            }
            
            Log.i(TAG, "JobSearchNative.extractCompanyNames: Found ${companies.size} companies: ${companies.joinToString()}")
            return companies
        }
        
        override fun getDescription(): String = "LinkedIn Job Search (Native)"
    }
    
    /**
     * Profile for LinkedIn job search results.
     * Has similar structure to Feed but with job-specific filters.
     * 
     * Detection criteria:
     * - Has `sdui_compose_view` and `lazyColumn` (like Feed)
     * - Has `lazyRow` with filter buttons ("Jobs", "Date posted", "Easy Apply", "Remote")
     * - Has "results" text (e.g., "34 results")
     * - Has "View job" content descriptions
     * 
     * Company extraction strategy:
     * - In job cards, company name is the second TextView after job title
     * - Pattern: [Job TitleTextView] → [Company Name TextView] → [Location TextView]
     */
    @Suppress("DEPRECATION")
    object JobSearchResults : ScreenProfile("job_search_results") {
        
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            // Check package
            if (packageName != "com.linkedin.android") {
                Log.d(TAG, "JobSearchResults.matches: Wrong package: $packageName")
                return false
            }
            
            // Check for job-specific markers:
            // 1. "results" text (e.g., "34 results")
            // 2. "View job" content description
            // 3. Filter tabs in lazyRow
            
            var hasResultsText = false
            var hasViewJobDesc = false
            var hasJobsFilter = false
            
            // Check for "results" text
            NodeQuery.findAll(rootNode) { node ->
                node.text?.toString()?.contains("results") == true
            }.forEach { node ->
                hasResultsText = true
                node.recycle()
            }
            
            // Check for "View job" content description
            NodeQuery.findAll(rootNode) { node ->
                node.contentDescription?.toString()?.contains("View job") == true
            }.forEach { node ->
                hasViewJobDesc = true
                node.recycle()
            }
            
            // Check for Jobs filter in lazyRow
            NodeQuery.findAll(rootNode) { node ->
                node.text?.toString() == "Jobs"
            }.forEach { node ->
                // Check if parent has "Filter by" in content description
                val parent = node.parent
                if (parent != null) {
                    val parentDesc = parent.contentDescription?.toString()
                    if (parentDesc?.contains("Filter by") == true) {
                        hasJobsFilter = true
                    }
                    parent.recycle()
                }
                node.recycle()
            }
            
            val isJobSearch = hasResultsText && hasViewJobDesc
            if (isJobSearch) {
                Log.i(TAG, "JobSearchResults.matches: MATCHED - Job search results detected (results=$hasResultsText, viewJob=$hasViewJobDesc, jobsFilter=$hasJobsFilter)")
            }
            
            return isJobSearch
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            val companies = mutableListOf<String>()
            val processedNames = mutableSetOf<String>()
            
            // Find job cards by looking for "View job" content description
            // Then extract company name (second TextView in job card)
            NodeQuery.findAll(rootNode) { node ->
                node.contentDescription?.toString()?.contains("View job") == true
            }.forEach { viewJobNode ->
                // Get the parent job card
                val jobCard = viewJobNode.parent ?: return@forEach
                
                try {
                    // Find TextViews in the job card
                    // Structure: [Job Title] → [Company Name] → [Location]
                    val textViews = mutableListOf<AccessibilityNodeInfo>()
                    
                    fun collectTextViews(node: AccessibilityNodeInfo, depth: Int = 0) {
                        if (depth > 5) return // Limit depth
                        
                        if (node.text != null && node.text.isNotEmpty()) {
                            textViews.add(node)
                        }
                        
                        for (i in 0 until node.childCount) {
                            node.getChild(i)?.let { collectTextViews(it, depth + 1) }
                        }
                    }
                    
                    collectTextViews(jobCard)
                    
                    // Find company name (second TextView after job title)
                    // Job title usually contains job-related keywords or is the first non-location text
                    for (i in 0 until textViews.size - 1) {
                        val currentText = textViews[i].text?.toString()?.trim() ?: continue
                        val nextText = textViews[i + 1].text?.toString()?.trim() ?: continue
                        
                        // Skip if current is location or generic text
                        if (isLocationText(currentText) || isGenericJobText(currentText)) continue
                        
                        // Company name is often short and follows job title
                        // Check if next text is a company name (short, no special chars)
                        if (nextText.length <= 50 && !isLocationText(nextText) && !isGenericJobText(nextText)) {
                            // Additional check: company names are usually short and don't contain job keywords
                            if (!containsJobKeywords(nextText) && nextText !in processedNames) {
                                Log.d(TAG, "JobSearchResults: Found company '$nextText' (after '$currentText')")
                                companies.add(nextText)
                                processedNames.add(nextText)
                                break // Only take first valid company per job card
                            }
                        }
                    }
                    
                    textViews.forEach { it.recycle() }
                    
                } finally {
                    jobCard.recycle()
                }
                
                viewJobNode.recycle()
            }
            
            Log.i(TAG, "JobSearchResults.extractCompanyNames: Found ${companies.size} companies: ${companies.joinToString()}")
            return companies
        }
        
        private fun isLocationText(text: String): Boolean {
            // Location patterns: "City, Country", "City (On-site)", "City (Hybrid)", "City (Remote)"
            return text.contains("(On-site)") ||
                   text.contains("(Hybrid)") ||
                   text.contains("(Remote)") ||
                   text.matches(Regex(".*[,\u00b7].*")) || // Contains comma or middle dot
                   text.contains("Israel") ||
                   text.contains("Tel Aviv") ||
                   text.contains("Be'er Sheva")
        }
        
        private fun isGenericJobText(text: String): Boolean {
            val generic = setOf(
                "View job", "Easy Apply", "Actively reviewing applicants", "Be an early applicant",
                "1 day ago", "1 week ago", "2 weeks ago", "results", "Viewed",
                "Promoted", "Sponsored"
            )
            return text in generic || text.contains("·")
        }
        
        private fun containsJobKeywords(text: String): Boolean {
            val keywords = listOf("Developer", "Engineer", "Manager", "Lead", "Senior", "Junior",
                "Fullstack", "Frontend", "Backend", "Director", "Analyst", "Designer", "Architect")
            return keywords.any { text.contains(it, ignoreCase = true) }
        }
        
        override fun getDescription(): String = "LinkedIn Job Search Results"
    }
    
/**
     * Profile for LinkedIn user profile pages (work experience).
     * Shows work history with company names.
     * 
     * Detection criteria:
     * - Has "Experience" text with count (e.g., "Experience (8)")
     * - Has "Back button" content description
     * 
     * Company extraction strategy:
     * - Logo content descriptions: "Amazon logo" → "Amazon"
     */
    @Suppress("DEPRECATION")
    object UserProfile : ScreenProfile("user_profile") {
        
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            if (packageName != "com.linkedin.android") {
                Log.d(TAG, "UserProfile.matches: Wrong package: $packageName")
                return false
            }
            
            var hasExperience = false
            var hasBackButton = false
            
            // Check for "Experience (N)" pattern
            NodeQuery.findAll(rootNode) { node ->
                val text = node.text?.toString() ?: return@findAll false
                if (text.contains("Experience") && text.contains("(")) {
                    hasExperience = true
                }
                false
            }
            
            // Check for "Back button" content description
            NodeQuery.findAll(rootNode) { node ->
                val contentDesc = node.contentDescription?.toString() ?: return@findAll false
                if (contentDesc == "Back button") {
                    hasBackButton = true
                }
                false
            }
            
            if (hasExperience && hasBackButton) {
                Log.i(TAG, "UserProfile.matches: MATCHED - User profile detected")
                return true
            }
            
            Log.d(TAG, "UserProfile.matches: Not a user profile")
            return false
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            val companies = mutableListOf<String>()
            val processedNames = mutableSetOf<String>()
            
            // Extract company names from logo content descriptions: "Company logo" → "Company"
            NodeQuery.findAll(rootNode) { node ->
                node.contentDescription?.toString()?.endsWith(" logo") == true
            }.forEach { node ->
                val contentDesc = node.contentDescription?.toString()!!
                val companyName = contentDesc.removeSuffix(" logo").trim()
                
                if (companyName.isNotEmpty() && companyName !in processedNames) {
                    Log.d(TAG, "UserProfile: Found company '$companyName'")
                    companies.add(companyName)
                    processedNames.add(companyName)
                }
                
                node.recycle()
            }
            
            Log.i(TAG, "UserProfile.extractCompanyNames: Found ${companies.size} companies: ${companies.joinToString()}")
            return companies
        }
        
        override fun getDescription(): String = "LinkedIn User Profile"
    }
    
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
            
            // Exclude user profile pages (have "Experience (N)" header)
            // Check for "Back button" content description which is present on profile pages
            var hasBackButton = false
            NodeQuery.findAll(rootNode) { node ->
                if (node.contentDescription?.toString() == "Back button") {
                    hasBackButton = true
                }
                false
            }
            
            // Also check for Experience section with count
            if (hasBackButton) {
                // Check if there's Experience section
                NodeQuery.findAll(rootNode) { node ->
                    val text = node.text?.toString() ?: return@findAll false
                    text.contains("Experience") && text.contains("(")
                }.forEach { 
                    hasBackButton = true
                    it.recycle()
                }
            }
            
            if (hasBackButton) {
                Log.d(TAG, "Feed.matches: Excluding - looks like user profile (has Back button + Experience)")
                return false
            }
            
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
            
            // Get from pages_top_card_title
            // Note: LinkedIn shows "Company x" for verified/premium pages
            // The "x" is a verification badge, and contentDesc includes "Verified"
            val titleNode = NodeQuery.create()
                .withViewId(PAGES_TOP_CARD_TITLE_ID)
                .findFirstIn(rootNode)
                ?: throw IllegalStateException("pages_top_card_title not found in CompanyPage")
            
            try {
                val contentDesc = titleNode.contentDescription?.toString()?.trim()
                    ?: throw IllegalStateException("pages_top_card_title has no contentDescription")
                
                // LinkedIn format: 
                // - Unverified: "Company Name"
                // - Verified: "Company x, Verified"
                // Only strip " x" if "Verified" is present
                val name = if (contentDesc.contains("Verified")) {
                    contentDesc
                        .replace(Regex(",\\s*Verified$"), "")
                        .replace(Regex("\\s+x$"), "")
                        .trim()
                } else {
                    contentDesc
                }
                
                if (name.isEmpty()) {
                    throw IllegalStateException("Company name is empty after cleaning contentDesc: '$contentDesc'")
                }
                
                Log.d(TAG, "CompanyPage: Extracted '$name' from contentDesc '$contentDesc'")
                companies.add(name)
                
            } finally {
                titleNode.recycle()
            }
            
            Log.i(TAG, "CompanyPage.extractCompanyNames: Found ${companies.size} companies: ${companies.joinToString()}")
            return companies
        }
        
        override fun getDescription(): String = "LinkedIn Company Page"
    }
    
    /**
     * Profile for LinkedIn job listings.
     * Job cards contain company names in `ad_entity_lockup_subtitle`.
     * 
     * Detection criteria:
     * - Has `job_collections_discovery_search_bar_container` or
     * - Has `job_search_collection_list_fragment_recycler_view`
     * 
     * Company extraction strategy:
     * - Find all `ad_entity_lockup_subtitle` TextViews
     * - These contain company names posting jobs
     */
    @Suppress("DEPRECATION")
    object Jobs : ScreenProfile("jobs") {
        
        private const val JOBS_SEARCH_BAR_CONTAINER_ID = "job_collections_discovery_search_bar_container"
        private const val JOBS_LIST_RECYCLER_ID = "job_search_collection_list_fragment_recycler_view"
        private const val COMPANY_SUBTITLE_ID = "ad_entity_lockup_subtitle"
        
        override fun matches(rootNode: AccessibilityNodeInfo, packageName: String, className: String?): Boolean {
            // Check package
            if (packageName != "com.linkedin.android") {
                Log.d(TAG, "Jobs.matches: Wrong package: $packageName")
                return false
            }
            
            // Check for jobs-specific view IDs
            val searchBarContainer = NodeQuery.create()
                .withViewId(JOBS_SEARCH_BAR_CONTAINER_ID)
                .findFirstIn(rootNode)
            
            if (searchBarContainer != null) {
                searchBarContainer.recycle()
                Log.i(TAG, "Jobs.matches: MATCHED - Jobs screen detected (search_bar_container)")
                return true
            }
            
            val jobsList = NodeQuery.create()
                .withViewId(JOBS_LIST_RECYCLER_ID)
                .findFirstIn(rootNode)
            
            if (jobsList != null) {
                jobsList.recycle()
                Log.i(TAG, "Jobs.matches: MATCHED - Jobs screen detected (jobs_list_recycler)")
                return true
            }
            
            Log.d(TAG, "Jobs.matches: No jobs views found")
            return false
        }
        
        override fun extractCompanyNames(rootNode: AccessibilityNodeInfo): List<String> {
            val companies = mutableListOf<String>()
            val processedNames = mutableSetOf<String>()
            
            // Find all company subtitle TextViews (ad_entity_lockup_subtitle)
            NodeQuery.findAll(rootNode) { node ->
                node.viewIdResourceName?.contains(COMPANY_SUBTITLE_ID) == true
            }.forEach { node ->
                val companyName = node.text?.toString()?.trim()
                
                if (companyName != null && 
                    companyName.isNotEmpty() && 
                    companyName !in processedNames) {
                    Log.d(TAG, "Jobs: Found company '$companyName'")
                    companies.add(companyName)
                    processedNames.add(companyName)
                }
                
                node.recycle()
            }
            
            Log.i(TAG, "Jobs.extractCompanyNames: Found ${companies.size} companies: ${companies.joinToString()}")
            return companies
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
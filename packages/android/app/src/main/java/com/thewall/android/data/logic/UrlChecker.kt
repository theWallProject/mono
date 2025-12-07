package com.thewall.android.data.logic

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewall.android.data.models.APIEndpointConfig
import com.thewall.android.data.models.APIEndpointRule
import com.thewall.android.data.models.AllItem
import com.thewall.android.data.models.RuleInfo
import com.thewall.android.data.models.UrlCheckResult
import com.thewall.android.util.readFile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.URI

// ----------------------------------------------------------------------------------
// --- WARNING: SYNC BREADCRUMB (CRITICAL) ------------------------------------------
// ----------------------------------------------------------------------------------
// This entire class is a manual Kotlin port of the URL checking logic from the
// TypeScript `common` package.
//
// SOURCE OF TRUTH: `packages/common/src/index.ts`
//
// If ANY logic changes in that file (regex rules, domain handling, selector logic),
// those changes MUST be manually ported to this Kotlin file. Failure to do so
// will result in logic divergence between the browser addon and the Android app,
// leading to different and incorrect results for the same URL.
// ----------------------------------------------------------------------------------
class UrlChecker(private val context: Context) {

    // Cache for the parsed database to avoid reloading it every time.
    private var database: List<AllItem>? = null

    private val config: APIEndpointConfig by lazy {
        buildApiEndpointConfig()
    }

    private suspend fun getDatabase(): List<AllItem> {
        database?.let { return it }
        // --- Performance Note ---
        // This is executed on a background thread by the caller (`checkUrl`).
        // It loads and parses the large JSON file from assets.
        return withContext(Dispatchers.IO) {
            val jsonString = readFile(context.assets, "ALL.json")
            val listType = object : TypeToken<List<AllItem>>() {}.type
            val db: List<AllItem> = Gson().fromJson(jsonString, listType)
            database = db // Cache the result
            db
        }
    }


    private fun buildApiEndpointConfig(): APIEndpointConfig {
        // --- WARNING: SYNC BREADCRUMB ---
        // The regex rules below are a direct copy from the `API_ENDPOINT_CONFIG` object
        // in `packages/common/src/index.ts`.
        // If you add, remove, or modify a rule in the common package, you MUST
        // replicate that change here. Pay close attention to escaping characters,
        // as Kotlin and TypeScript regex handling can have subtle differences.
        return APIEndpointConfig(
            rules = listOf(
                APIEndpointRule(
                    "linkedin.com",
                    // Captures the company name from /company/{name} or /showcase/{name}
                    // Excludes /school/ paths.
                    "(?:https?://)?(?:www\\.)?(?:linkedin\\.com)/(?!school)(?:company|showcase)/([^/?]+)"
                ),
                APIEndpointRule(
                    "facebook.com",
                    // Captures the page name from facebook.com/{name}
                    // Excludes common paths like /events, /groups, etc.
                    "(?:facebook\\.com)/(?!events|groups|marketplace|watch|gaming|login)([^/?]+)"
                ),
                APIEndpointRule(
                    "twitter.com",
                    // Captures the handle from twitter.com/{handle}, x.com/{handle}, or t.co/{handle}
                    // Excludes paths like /search, /hashtag, etc.
                    "(?<!\\w)(?:twitter\\.com|x\\.com|t\\.co)/(?!search|hashtag|i/|intent|settings)([^/?]+)"
                ),
                APIEndpointRule(
                    "instagram.com",
                    // Captures the username from instagram.com/{username}
                    // Excludes common paths like /explore, /reels, etc.
                    "(?:instagram\\.com)/(?!explore|reels|p/|stories|tv/|direct|accounts)([^/?]+)"
                ),
                APIEndpointRule(
                    "github.com",
                    // Captures the username or org name from github.com/{name}
                    // Excludes paths for issues, pull requests, etc. and gist.github.com
                    "(?<!gist\\.)(?:github\\.com)/(?!settings|.*/(?:issues|pull|releases|actions|security))([^/]+)"
                ),
                APIEndpointRule(
                    "youtube.com",
                    // Captures channel/user name from various YouTube URL formats like:
                    // /user/{name}, /c/{name}, /@{name}, or just /{name}
                    // Excludes common paths like /watch, /feed, etc.
                    "(?:https?://)?(?:www\\.)?(?:youtube\\.com)/(?:(?:user/([^/?]+))|(?:c/(?!(?:@)?(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)@?([^/?]+))|(?:@(?!(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)([^/?]+))|(?!(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)(?!(?:c/|@|user/))([^/?]+))"
                ),
                APIEndpointRule(
                    "youtube.com",
                    // Captures the channel ID from youtube.com/channel/{ID}
                    "(?:https?://)?(?:www\\.)?(?:youtube\\.com)/channel/([^/?]+)"
                ),
                APIEndpointRule(
                    "tiktok.com",
                    // Captures the username from tiktok.com/{username}
                    // Excludes paths like /video, /discover, etc.
                    "(?:tiktok\\.com)/(?!.*/video/|discover|foryou|trending|music|upload)([^/?]+)"
                ),
                APIEndpointRule(
                    "threads.com",
                    // Captures the username from threads.com/{username}
                    // Excludes paths like /post, /search, etc.
                    "(?:threads\\.com)/(?!.*/post/|search|explore|activity|settings)([^/?]+)"
                )
            )
        )
    }

    /**
     * --- WARNING: SYNC BREADCRUMB ---
     * This is the main entry point. Its logic flow is a port of `checkUrl` from the common package.
     * It runs the entire check on a background thread to prevent blocking the UI.
     */
    suspend fun checkUrl(url: String): UrlCheckResult? = withContext(Dispatchers.Default) {
        val db = getDatabase() // Load the database if needed (uses Dispatchers.IO).

        val rule = findMatchingRule(url)
        if (rule != null) {
            val selector = extractSelector(url, rule)
            if (selector != null) {
                val selectorKey = getSelectorKey(rule.domain, url)
                if (selectorKey != null) {
                    val findResult = findInDatabaseBySelector(selector, selectorKey, rule.domain, db)
                    if (findResult != null) {
                        return@withContext formatResult(findResult, selector, selectorKey)
                    }
                }
            }
        }

        val domain = getMainDomain(url)
        if (domain.isNotEmpty()) {
            val findResult = findInDatabaseByDomain(domain, db)
            if (findResult != null) {
                return@withContext formatResult(findResult, domain, "ws")
            }
        }

        return@withContext null
    }

    private fun getMainDomain(url: String): String {
        return try {
            val uri = if (url.startsWith("http://") || url.startsWith("https://")) {
                URI(url)
            } else {
                URI("https://$url")
            }
            var domain = uri.host ?: ""
            if (domain.startsWith("www.")) {
                domain = domain.substring(4)
            }
            domain
        } catch (e: Exception) {
            ""
        }
    }

    // --- WARNING: SYNC BREADCRUMB ---
    // The following functions are all direct ports of their TypeScript counterparts in the common package.
    // (e.g., `normalizeUrl`, `getRegexFlags`, `findMatchingRule`, `extractSelector`,
    // `findInDatabaseBySelector`, `getSelectorKey`).
    // If the TypeScript implementation changes, these must be updated.

    private fun normalizeUrl(url: String): String {
        return url.replace(Regex("^(https?://)www\\.", RegexOption.IGNORE_CASE), "$1")
    }

    private fun getRegexFlags(domain: String): Set<RegexOption> {
        return if (domain == "youtube.com" || domain == "twitter.com" || domain == "linkedin.com") {
            setOf(RegexOption.IGNORE_CASE)
        } else {
            emptySet()
        }
    }

    private fun findMatchingRule(url: String): APIEndpointRule? {
        val normalizedUrl = normalizeUrl(url)
        return config.rules.find { rule ->
            val ruleRegex = Regex(rule.regex, getRegexFlags(rule.domain))
            ruleRegex.containsMatchIn(normalizedUrl)
        }
    }

    private fun extractSelector(url: String, rule: APIEndpointRule): String? {
        val normalizedUrl = normalizeUrl(url)
        val regex = Regex(rule.regex, getRegexFlags(rule.domain))
        val results = regex.find(normalizedUrl)
        return results?.groupValues?.drop(1)?.firstOrNull { it.isNotEmpty() }
    }

    private fun findInDatabaseBySelector(
        selector: String,
        selectorKey: String,
        domain: String,
        database: List<AllItem>
    ): AllItem? {
        if (selectorKey == "il") {
            return null
        }
        return database.find { row ->
            val dbValue = when (selectorKey) {
                "ws" -> row.ws
                "li" -> row.li
                "fb" -> row.fb
                "tw" -> row.tw
                "ig" -> row.ig
                "gh" -> row.gh
                "ytp" -> row.ytp
                "ytc" -> row.ytc
                "tt" -> row.tt
                "th" -> row.th
                else -> null
            }
            if (dbValue == null) {
                return@find false
            }
            val normalizedDbValue = dbValue.replace(Regex("^@"), "")
            val normalizedSelector = selector.replace(Regex("^@"), "")

            val isCaseInsensitive =
                domain == "youtube.com" || domain == "twitter.com" || domain == "linkedin.com"

            if (isCaseInsensitive) {
                normalizedDbValue.equals(normalizedSelector, ignoreCase = true)
            } else {
                normalizedDbValue == normalizedSelector
            }
        }
    }

    private fun findInDatabaseByDomain(domain: String, database: List<AllItem>): AllItem? {
        return database.find { it.ws == domain }
    }

    private fun formatResult(
        findResult: AllItem,
        selector: String,
        selectorKey: String
    ): UrlCheckResult {
        return if (findResult.isHint == true && findResult.hintText != null) {
            UrlCheckResult.Hint(
                name = findResult.n,
                hintText = findResult.hintText,
                hintUrl = findResult.hintUrl ?: "",
                rule = RuleInfo(selector, selectorKey)
            )
        } else {
            UrlCheckResult.Match(
                reasons = findResult.r,
                name = findResult.n,
                alt = findResult.alt,
                stockSymbol = findResult.s,
                comment = findResult.c,
                link = findResult.ws,
                rule = RuleInfo(selector, selectorKey)
            )
        }
    }

    private fun getSelectorKey(domain: String, url: String?): String? {
        return when (domain) {
            "facebook.com" -> "fb"
            "twitter.com", "x.com" -> "tw"
            "linkedin.com" -> "li"
            "instagram.com" -> "ig"
            "github.com" -> "gh"
            "youtube.com" -> {
                if (url == null) return null
                if (url.contains("/channel/")) "ytc" else "ytp"
            }
            "tiktok.com" -> "tt"
            "threads.com" -> "th"
            else -> null // Return null for unexpected domains
        }
    }
}

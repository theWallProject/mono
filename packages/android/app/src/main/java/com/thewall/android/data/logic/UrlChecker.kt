package com.thewall.android.data.logic

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.thewall.android.data.Alternative
import com.thewall.android.data.FinalDBFile
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

    private val database: List<FinalDBFile> by lazy {
        loadDatabase()
    }

    private val config: APIEndpointConfig by lazy {
        buildApiEndpointConfig()
    }

    private fun loadDatabase(): List<FinalDBFile> {
        // This function assumes `ALL.json` exists in assets. This is handled by a
        // Gradle task in `build.gradle.kts`. See that file for its own sync warning.
        val jsonString = context.assets.open("ALL.json").bufferedReader().use { it.readText() }
        val listType = object : TypeToken<List<FinalDBFile>>() {}.type
        return Gson().fromJson(jsonString, listType)
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
                    "(?:https?://)?(?:www\\.)?(?:linkedin\\.com)/(?!school)(?:company|showcase)/([^/?]+)"
                ),
                APIEndpointRule(
                    "facebook.com",
                    "(?:facebook\\.com)/(?!events|groups|marketplace|watch|gaming|login)([^/?]+)"
                ),
                APIEndpointRule(
                    "twitter.com",
                    "(?<!\\w)(?:twitter\\.com|x\\.com|t\\.co)/(?!search|hashtag|i/|intent|settings)([^/?]+)"
                ),
                APIEndpointRule(
                    "instagram.com",
                    "(?:instagram\\.com)/(?!explore|reels|p/|stories|tv/|direct|accounts)([^/?]+)"
                ),
                APIEndpointRule(
                    "github.com",
                    "(?<!gist\\.)(?:github\\.com)/(?!settings|.*/(?:issues|pull|releases|actions|security))([^/]+)"
                ),
                APIEndpointRule(
                    "youtube.com",
                    "(?:https?://)?(?:www\\.)?(?:youtube\\.com)/(?:(?:user/([^/?]+))|(?:c/(?!(?:@)?(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)@?([^/?]+))|(?:@(?!(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)([^/?]+))|(?!(?:about|channel|embed|feed|live|playlist|results|shorts|trending|user/|watch)\\b)(?!(?:c/|@|user/))([^/?]+))"
                ),
                APIEndpointRule(
                    "youtube.com",
                    "(?:https?://)?(?:www\\.)?(?:youtube\\.com)/channel/([^/?]+)"
                ),
                APIEndpointRule(
                    "tiktok.com",
                    "(?:tiktok\\.com)/(?!.*/video/|discover|foryou|trending|music|upload)([^/?]+)"
                ),
                APIEndpointRule(
                    "threads.com",
                    "(?:threads\\.com)/(?!.*/post/|search|explore|activity|settings)([^/?]+)"
                )
            )
        )
    }

    /**
     * --- WARNING: SYNC BREADCRUMB ---
     * This is the main entry point. Its logic flow is a port of `checkUrl` from the common package.
     */
    fun checkUrl(url: String): UrlCheckResult? {
        val rule = findMatchingRule(url)
        if (rule != null) {
            val selector = extractSelector(url, rule)
            if (selector != null) {
                val selectorKey = getSelectorKey(rule.domain, url)
                val findResult =
                    findInDatabaseBySelector(selector, selectorKey, rule.domain, database)
                if (findResult != null) {
                    return formatResult(findResult, selector, selectorKey)
                }
            }
        }

        val domain = getMainDomain(url)
        if (domain.isNotEmpty()) {
            val findResult = findInDatabaseByDomain(domain, database)
            if (findResult != null) {
                return formatResult(findResult, domain, "ws")
            }
        }

        return null
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
        database: List<FinalDBFile>
    ): FinalDBFile? {
        if (selectorKey == "il") {
            return null
        }
        return database.find { row ->
            val dbValue = when (selectorKey) {
                "ws" -> row.website
                "li" -> row.linkedin
                "fb" -> row.facebook
                "tw" -> row.twitter
                "ig" -> row.instagram
                "gh" -> row.github
                "ytp" -> row.youtubeProfile
                "ytc" -> row.youtubeChannel
                "tt" -> row.tiktok
                "th" -> row.threads
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

    private fun findInDatabaseByDomain(domain: String, database: List<FinalDBFile>): FinalDBFile? {
        return database.find { it.website == domain }
    }

    private fun formatResult(
        findResult: FinalDBFile,
        selector: String,
        selectorKey: String
    ): UrlCheckResult {
        return if (findResult.isHint == true && findResult.hintText != null) {
            UrlCheckResult.Hint(
                name = findResult.name,
                hintText = findResult.hintText,
                hintUrl = findResult.hintUrl ?: "",
                rule = RuleInfo(selector, selectorKey)
            )
        } else {
            UrlCheckResult.Match(
                reasons = findResult.reasons,
                name = findResult.name,
                alt = findResult.alternatives,
                stockSymbol = findResult.stockSymbol,
                comment = findResult.comment,
                link = findResult.website,
                rule = RuleInfo(selector, selectorKey)
            )
        }
    }

    private fun getSelectorKey(domain: String, url: String? = null): String {
        return when (domain) {
            "facebook.com" -> "fb"
            "twitter.com", "x.com" -> "tw"
            "linkedin.com" -> "li"
            "instagram.com" -> "ig"
            "github.com" -> "gh"
            "youtube.com" -> {
                if (url == null) {
                    throw IllegalArgumentException("getSelectorKey: url is required for youtube.com domain")
                }
                if (url.contains("/channel/")) "ytc" else "ytp"
            }

            "tiktok.com" -> "tt"
            "threads.com" -> "th"
            else -> throw IllegalArgumentException("getSelectorKey: unexpected domain $domain")
        }
    }
}

data class APIEndpointConfig(val rules: List<APIEndpointRule>)
data class APIEndpointRule(val domain: String, val regex: String)

sealed class UrlCheckResult {
    data class Hint(
        val name: String,
        val hintText: String,
        val hintUrl: String,
        val rule: RuleInfo
    ) : UrlCheckResult()

    data class Match(
        val reasons: List<String>,
        val name: String,
        val alt: List<Alternative>?,
        val stockSymbol: String?,
        val comment: String?,
        val link: String?,
        val rule: RuleInfo
    ) : UrlCheckResult()
}

data class RuleInfo(
    val selector: String,
    val key: String
)

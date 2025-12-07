package com.thewall.android.data.models

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

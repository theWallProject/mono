package com.thewall.android.data

enum class ReasonLevel {
    WARNING,
    ERROR
}

data class Reason(
    val message: String,
    val level: ReasonLevel
)

data class BlacklistItem(
    val androidDevId: String?,
    val androidAppIds: List<String>?,
    val reasonIds: List<String>
)

// ----------------------------------------------------------------------------------
// --- WARNING: SYNC BREADCRUMB -----------------------------------------------------
// ----------------------------------------------------------------------------------
// This map translates reason codes (e.g., "h") into user-friendly messages.
// The source of truth for these reasons is in the `common` package.
// If the reasons are updated there, this map MUST be updated to match.
// This is used by both the App Scanner and the URL Lookup features.
// ----------------------------------------------------------------------------------
val reasonsMap = mapOf(
    "h" to Reason("Headquartered in Israel", ReasonLevel.ERROR),
    "i" to Reason("Significant investment from Israeli VCs", ReasonLevel.WARNING),
    "f" to Reason("Founded by Israeli entrepreneurs", ReasonLevel.ERROR),
    "b" to Reason("On the BDS boycott list", ReasonLevel.ERROR)
)

fun BlacklistItem.getEffectiveLevel(reasonsMap: Map<String, Reason>): ReasonLevel {
    val hasError = this.reasonIds.any { reasonsMap[it]?.level == ReasonLevel.ERROR }
    return if (hasError) ReasonLevel.ERROR else ReasonLevel.WARNING
}

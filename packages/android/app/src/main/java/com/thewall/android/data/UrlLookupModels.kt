package com.thewall.android.data

import com.google.gson.annotations.SerializedName

// ----------------------------------------------------------------------------------
// --- WARNING: SYNC BREADCRUMB -----------------------------------------------------
// ----------------------------------------------------------------------------------
// These data classes are a manual representation of the schema for `ALL.json`.
// The source of truth for this schema is maintained in the `common` package.
// If the schema in `packages/common/src/schemas/final-db-file.schema.json`
// (or equivalent) is updated, these Kotlin classes MUST be updated to match.
// Failure to do so will cause runtime crashes during JSON deserialization.
//
// The SerializedName("...") annotation links the JSON key (e.g., "ws") to the
// Kotlin property (e.g., website). Ensure these match the schema.
// ----------------------------------------------------------------------------------

data class FinalDBFile(
    @SerializedName("id") val id: String,
    @SerializedName("ws") val website: String?,
    @SerializedName("li") val linkedin: String?,
    @SerializedName("fb") val facebook: String?,
    @SerializedName("tw") val twitter: String?,
    @SerializedName("ig") val instagram: String?,
    @SerializedName("gh") val github: String?,
    @SerializedName("ytp") val youtubeProfile: String?,
    @SerializedName("ytc") val youtubeChannel: String?,
    @SerializedName("tt") val tiktok: String?,
    @SerializedName("th") val threads: String?,
    @SerializedName("r") val reasons: List<String>,
    @SerializedName("n") val name: String,
    @SerializedName("c") val comment: String?,
    @SerializedName("s") val stockSymbol: String?,
    @SerializedName("alt") val alternatives: List<Alternative>?,
    @SerializedName("hint") val isHint: Boolean?,
    @SerializedName("hintText") val hintText: String?,
    @SerializedName("hintUrl") val hintUrl: String?
)

data class Alternative(
    @SerializedName("n") val name: String,
    @SerializedName("ws") val website: String
)

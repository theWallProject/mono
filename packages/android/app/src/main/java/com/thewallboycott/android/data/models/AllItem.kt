package com.thewallboycott.android.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AllItem(
    /** Unique identifier */
    val id: String,
    /** Website */
    val ws: String? = null,
    /** LinkedIn */
    val li: String? = null,
    /** Facebook */
    val fb: String? = null,
    /** Twitter */
    val tw: String? = null,
    /** Instagram */
    val ig: String? = null,
    /** Github */
    val gh: String? = null,
    /** YouTube Profile */
    val ytp: String? = null,
    /** YouTube Channel */
    val ytc: String? = null,
    /** TikTok */
    val tt: String? = null,
    /** Threads */
    val th: String? = null,
    /** Reasons for being on the list */
    val r: List<String>,
    /** Name of the entity */
    val n: String,
    /** Proof text - evidence/explanation for why company is flagged */
    @SerialName("proof_text")
    val proofText: String? = null,
    /** Proof link - URL to source/evidence */
    @SerialName("proof_link")
    val proofLink: String? = null,
    /** Stock Symbol */
    val s: String? = null,
    /** Alternative names */
    val alt: List<Alternative>? = null,
    /** Hint flag */
    val isHint: Boolean? = null,
    /** Hint text */
    val hintText: String? = null,
    /** Hint URL */
    val hintUrl: String? = null,
    /** Hint company ID for company-level dismissal */
    val hintCompanyId: String? = null,
    /** Android developer ID like "com.wix" (not full app package IDs) */
    @SerialName("android_dev_id")
    val androidDevId: String? = null,
    /** Array of full Android app package IDs for exact matching */
    @SerialName("android_app_ids")
    val androidAppIds: List<String>? = null,
    /**
     * Curated expansions for `android_dev_id` prefixes. The build-time queries
     * manifest generator reads this from ALL.json; runtime scanning uses
     * androidAppIds for matching, so this field is only deserialized to keep
     * Json {ignoreUnknownKeys} off and surface schema drift early.
     */
    @SerialName("android_curated_app_ids")
    val androidCuratedAppIds: List<String>? = null,
    /** Hint for an alternative Android app */
    @SerialName("hint_android_id")
    val hintAndroidId: String? = null
)

package com.thewall.android.data.models

import com.google.gson.annotations.SerializedName

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
    /** Comment */
    val c: String? = null,
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
    /** Android developer ID like "com.wix" (not full app package IDs) */
    @SerializedName("android_dev_id")
    val androidDevId: String? = null,
    /** Array of full Android app package IDs for exact matching */
    @SerializedName("android_app_ids")
    val androidAppIds: List<String>? = null
)

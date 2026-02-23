package com.thewallboycott.android.data.models

import kotlinx.serialization.Serializable

@Serializable
data class Alternative(
    /** name */
    val n: String,
    /** website */
    val ws: String
)

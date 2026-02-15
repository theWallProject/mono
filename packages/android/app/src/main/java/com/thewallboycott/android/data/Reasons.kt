package com.thewallboycott.android.data

import com.thewallboycott.android.R
import com.thewallboycott.android.data.models.Reason
import com.thewallboycott.android.data.models.ReasonLevel

// ----------------------------------------------------------------------------------
// --- WARNING: SYNC BREADCRUMB -----------------------------------------------------
// ----------------------------------------------------------------------------------
// This map translates reason codes (e.g., "h") into user-friendly messages.
// The source of truth for these reasons is in the `common` package.
// If the reasons are updated there, this map MUST be updated to match.
// This is used by both the App Scanner and the URL Lookup features.
// ----------------------------------------------------------------------------------
val reasonsMap = mapOf(
    "h" to Reason(R.string.reason_headquarters, ReasonLevel.ERROR),
    "i" to Reason(R.string.reason_investor, ReasonLevel.WARNING),
    "f" to Reason(R.string.reason_founder, ReasonLevel.ERROR),
    "u" to Reason(R.string.reason_url, ReasonLevel.ERROR),
    "BDS_PRIO" to Reason(R.string.reason_bds_priority, ReasonLevel.ERROR),
    "BDS_GRASS" to Reason(R.string.reason_bds_grassroots, ReasonLevel.ERROR),
    "BDS_PRESSURE" to Reason(R.string.reason_bds_pressure, ReasonLevel.WARNING)
)

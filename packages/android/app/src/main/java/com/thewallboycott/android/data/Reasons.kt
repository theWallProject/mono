package com.thewallboycott.android.data

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
    "h" to Reason("Headquarters: Israel", ReasonLevel.ERROR),
    "i" to Reason("Has one or more Israeli investors", ReasonLevel.WARNING),
    "f" to Reason("Founder from Israel", ReasonLevel.ERROR),
    "u" to Reason("Israeli URL", ReasonLevel.ERROR),
    "BDS_PRIO" to Reason("BDS Priority Target — Consumer Boycott", ReasonLevel.ERROR),
    "BDS_GRASS" to Reason("BDS Target — Grassroots Campaign", ReasonLevel.ERROR),
    "BDS_PRESSURE" to Reason("BDS Target — Pressure Campaign", ReasonLevel.WARNING)
)

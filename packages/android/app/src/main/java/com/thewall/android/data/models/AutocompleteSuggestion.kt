package com.thewall.android.data.models

/**
 * Represents a suggestion for the autocomplete dropdown in URL lookup.
 * Used for company name and website partial matches.
 */
data class AutocompleteSuggestion(
    /** Display text shown in dropdown (e.g., "Wix (wix.com)") */
    val displayText: String,
    /** Value to fill in textbox when suggestion is clicked */
    val fillValue: String,
    /** Company name for deduplication */
    val companyName: String
)

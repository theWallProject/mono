package com.thewallboycott.android.share

/**
 * Defines the different share scenarios and their content.
 * Each scenario captures a specific emotional moment in the user journey.
 */

/**
 * Represents a share scenario with all the content needed for sharing.
 */
data class ShareContent(
    val headline: String,
    val subtext: String,
    val buttonText: String,
    val shareText: String,
    val imageTemplate: ImageTemplate? = null
)

/**
 * Template types for generated share images.
 */
enum class ImageTemplate {
    CLEAN_SCAN,      // Green gradient, "0" with checkmark - for no apps found
    FLAGGED_APPS,    // Red gradient, warning icon - for apps found
    APP_REMOVED,     // Orange-to-green gradient, crossed-out icon - for app removal
    SUPPORTER,       // Gold gradient, star badge - for new supporters
    GENERAL          // Shield logo, phone mockup - for general sharing
}

/**
 * Share scenario types matching key emotional moments.
 */
enum class ShareScenario {
    NO_APPS_FOUND,      // Scan completes with 0 flagged apps
    APPS_FOUND,         // Scan completes with 1+ flagged apps
    APP_REMOVED,        // User returns from successful uninstall intent
    URL_MATCH_FOUND,    // URL lookup finds a flagged company
    URL_CLEAN,          // URL lookup finds no match
    NEW_SUPPORTER,      // Successful subscription
    GENERAL             // Always-visible share button
}

/**
 * Data class for dynamic share content that varies based on scan results.
 */
data class ScanShareData(
    val flaggedCount: Int = 0,
    val firstAppName: String? = null,
    val removedAppName: String? = null
)

/**
 * Data class for URL lookup share content.
 */
data class UrlShareData(
    val companyName: String,
    val reasonSummary: String? = null,
    val isMatch: Boolean
)

/**
 * Constants for share content.
 */
object ShareConstants {
    const val APP_URL = "https://the-wall.win"
    const val HASHTAGS = "#theWall #BDS #Boycott"
    const val DATABASE_SIZE = "20,000+"
}

/**
 * Generates share content for each scenario.
 */
object ShareContentGenerator {

    /**
     * Generate content for the "no apps found" celebration moment.
     */
    fun noAppsFound(): ShareContent = ShareContent(
        headline = "Your phone walks the talk",
        subtext = "Show others a clean conscience is one scan away",
        buttonText = "Share Your Results",
        shareText = """
            |Just scanned my phone with The Wall.
            |
            |Result: 0 apps funding apartheid.
            |
            |Your phone might not be as clean as you think.
            |Scan yours: ${ShareConstants.APP_URL}
            |
            |${ShareConstants.HASHTAGS}
        """.trimMargin(),
        imageTemplate = ImageTemplate.CLEAN_SCAN
    )

    /**
     * Generate content for the "apps found" revelation moment.
     */
    fun appsFound(data: ScanShareData): ShareContent = ShareContent(
        headline = "Now you know",
        subtext = "Help others see what's hiding on their phones",
        buttonText = "Share Discovery",
        shareText = """
            |The Wall just found ${data.flaggedCount} app${if (data.flaggedCount > 1) "s" else ""} on my phone connected to Israeli apartheid.
            |${data.firstAppName?.let { "\nI had no idea about $it." } ?: ""}
            |
            |What's hiding on YOUR phone?
            |${ShareConstants.APP_URL}
            |
            |${ShareConstants.HASHTAGS}
        """.trimMargin(),
        imageTemplate = ImageTemplate.FLAGGED_APPS
    )

    /**
     * Generate content for the "app removed" achievement moment.
     */
    fun appRemoved(appName: String): ShareContent = ShareContent(
        headline = "One app down",
        subtext = "Your action might inspire someone else to check their phone",
        buttonText = "Share Your Stand",
        shareText = """
            |Just uninstalled $appName after The Wall revealed its Israeli ties.
            |
            |Every deletion is a small act of resistance.
            |
            |Check your phone: ${ShareConstants.APP_URL}
            |
            |${ShareConstants.HASHTAGS}
        """.trimMargin(),
        imageTemplate = ImageTemplate.APP_REMOVED
    )

    /**
     * Generate content for URL lookup match found.
     */
    fun urlMatchFound(data: UrlShareData): ShareContent = ShareContent(
        headline = "Worth sharing",
        subtext = "Help others make informed choices",
        buttonText = "Share Finding",
        shareText = """
            |I just checked ${data.companyName} on The Wall.
            |
            |Result: Flagged${data.reasonSummary?.let { " - $it" } ?: ""}
            |
            |Know before you buy: ${ShareConstants.APP_URL}
        """.trimMargin(),
        imageTemplate = null
    )

    /**
     * Generate content for URL lookup clean result.
     */
    fun urlClean(companyName: String): ShareContent = ShareContent(
        headline = "Good news travels",
        subtext = "Share this clean result",
        buttonText = "Share",
        shareText = """
            |Just checked $companyName on The Wall.
            |
            |Result: Not flagged in the database.
            |
            |Check companies yourself: ${ShareConstants.APP_URL}
        """.trimMargin(),
        imageTemplate = null
    )

    /**
     * Generate content for new supporter pride moment.
     */
    fun newSupporter(): ShareContent = ShareContent(
        headline = "You're keeping The Wall alive",
        subtext = "Let others know they can support the cause too",
        buttonText = "Share Your Support",
        shareText = """
            |Just became a supporter of The Wall - the free app helping people boycott Israeli apartheid.
            |
            |$1/month to keep it running for everyone.
            |
            |Join the resistance: ${ShareConstants.APP_URL}
            |
            |${ShareConstants.HASHTAGS}
        """.trimMargin(),
        imageTemplate = ImageTemplate.SUPPORTER
    )

    /**
     * Generate content for general scanner share (always visible).
     */
    fun general(): ShareContent = ShareContent(
        headline = "Spread Awareness",
        subtext = "Help others discover The Wall",
        buttonText = "Share The Wall",
        shareText = """
            |The Wall scans your phone and reveals apps connected to Israeli apartheid.
            |
            |${ShareConstants.DATABASE_SIZE} companies in the database. One tap to know.
            |
            |${ShareConstants.APP_URL}
            |
            |${ShareConstants.HASHTAGS}
        """.trimMargin(),
        imageTemplate = ImageTemplate.GENERAL
    )

    /**
     * Generate content for challenging friends - dare style.
     */
    fun challenge(): ShareContent = ShareContent(
        headline = "Dare a Friend",
        subtext = "Challenge them to prove their phone is clean",
        buttonText = "Send the Challenge",
        shareText = """
            |I just scanned my phone. Zero Israeli apps. Clean conscience.
            |
            |Think YOUR phone is clean? I dare you to prove it.
            |
            |Scan here: ${ShareConstants.APP_URL}
            |
            |${ShareConstants.HASHTAGS}
        """.trimMargin(),
        imageTemplate = ImageTemplate.CLEAN_SCAN
    )

    /**
     * Get share content for a given scenario.
     */
    fun getContent(
        scenario: ShareScenario,
        scanData: ScanShareData? = null,
        urlData: UrlShareData? = null,
        appName: String? = null
    ): ShareContent = when (scenario) {
        ShareScenario.NO_APPS_FOUND -> noAppsFound()
        ShareScenario.APPS_FOUND -> appsFound(scanData ?: ScanShareData())
        ShareScenario.APP_REMOVED -> appRemoved(appName ?: "the app")
        ShareScenario.URL_MATCH_FOUND -> urlMatchFound(urlData ?: UrlShareData("this company", null, true))
        ShareScenario.URL_CLEAN -> urlClean(urlData?.companyName ?: "this company")
        ShareScenario.NEW_SUPPORTER -> newSupporter()
        ShareScenario.GENERAL -> general()
    }
}

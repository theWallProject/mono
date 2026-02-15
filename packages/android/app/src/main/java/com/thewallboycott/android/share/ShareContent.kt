package com.thewallboycott.android.share

import android.content.Context
import com.thewallboycott.android.R

data class ShareContent(
    val headline: String,
    val subtext: String,
    val buttonText: String,
    val shareText: String,
    val imageTemplate: ImageTemplate? = null
)

enum class ImageTemplate {
    CLEAN_SCAN, FLAGGED_APPS, APP_REMOVED, SUPPORTER, GENERAL
}

enum class ShareScenario {
    NO_APPS_FOUND, APPS_FOUND, APP_REMOVED, URL_MATCH_FOUND, URL_CLEAN, NEW_SUPPORTER, GENERAL
}

data class ScanShareData(
    val flaggedCount: Int = 0,
    val firstAppName: String? = null,
    val removedAppName: String? = null
)

data class UrlShareData(
    val companyName: String,
    val reasonSummary: String? = null,
    val isMatch: Boolean
)
object ShareContentGenerator {

    fun noAppsFound(context: Context): ShareContent {
        return ShareContent(
            headline = context.getString(R.string.share_no_apps_headline),
            subtext = context.getString(R.string.share_no_apps_subtext),
            buttonText = context.getString(R.string.btn_share_results),
            shareText = context.getString(R.string.share_no_apps_body,
                context.getString(R.string.share_app_url),
                context.getString(R.string.share_hashtags)),
            imageTemplate = ImageTemplate.CLEAN_SCAN
        )
    }

    fun appsFound(context: Context, data: ScanShareData): ShareContent {
        return ShareContent(
            headline = context.getString(R.string.share_found_headline),
            subtext = context.getString(R.string.share_found_subtext),
            buttonText = context.getString(R.string.btn_share_discovery),
            shareText = buildString {
                appendLine(context.resources.getQuantityString(R.plurals.share_found_body_plural, data.flaggedCount, data.flaggedCount))
                if (data.firstAppName != null) {
                    appendLine(context.getString(R.string.share_found_had_no_idea, data.firstAppName))
                }
                appendLine()
                appendLine(context.getString(R.string.share_found_whats_hiding))
                appendLine(context.getString(R.string.share_app_url))
                appendLine()
                appendLine(context.getString(R.string.share_hashtags))
            },
            imageTemplate = ImageTemplate.FLAGGED_APPS
        )
    }

    fun appRemoved(context: Context, appName: String): ShareContent {
        return ShareContent(
            headline = context.getString(R.string.share_removed_headline),
            subtext = context.getString(R.string.share_removed_subtext),
            buttonText = context.getString(R.string.btn_share_stand),
            shareText = context.getString(R.string.share_removed_body,
                appName,
                context.getString(R.string.share_app_url),
                context.getString(R.string.share_hashtags)),
            imageTemplate = ImageTemplate.APP_REMOVED
        )
    }

    fun urlMatchFound(context: Context, data: UrlShareData): ShareContent {
        val bodyText = if (data.reasonSummary != null) {
            context.getString(R.string.share_url_match_body_with_reason, data.companyName, data.reasonSummary, context.getString(R.string.share_app_url))
        } else {
            context.getString(R.string.share_url_match_body_without_reason, data.companyName, context.getString(R.string.share_app_url))
        }

        return ShareContent(
            headline = context.getString(R.string.share_url_match_headline),
            subtext = context.getString(R.string.share_url_match_subtext),
            buttonText = context.getString(R.string.btn_share_finding),
            shareText = bodyText,
            imageTemplate = null
        )
    }

    fun urlClean(context: Context, companyName: String): ShareContent {
        return ShareContent(
            headline = context.getString(R.string.share_url_clean_headline),
            subtext = context.getString(R.string.share_url_clean_subtext),
            buttonText = context.getString(R.string.btn_share),
            shareText = context.getString(R.string.share_url_clean_body, companyName, context.getString(R.string.share_app_url)),
            imageTemplate = null
        )
    }

    fun newSupporter(context: Context): ShareContent {
        return ShareContent(
            headline = context.getString(R.string.share_supporter_headline),
            subtext = context.getString(R.string.share_supporter_subtext),
            buttonText = context.getString(R.string.btn_share_your_support),
            shareText = context.getString(R.string.share_supporter_body,
                context.getString(R.string.share_app_url),
                context.getString(R.string.share_hashtags)),
            imageTemplate = ImageTemplate.SUPPORTER
        )
    }

    fun general(context: Context): ShareContent {
        return ShareContent(
            headline = context.getString(R.string.share_general_headline),
            subtext = context.getString(R.string.share_general_subtext),
            buttonText = context.getString(R.string.btn_share),
            shareText = context.getString(R.string.share_general_body,
                context.getString(R.string.share_database_size),
                context.getString(R.string.share_app_url),
                context.getString(R.string.share_hashtags)),
            imageTemplate = ImageTemplate.GENERAL
        )
    }

    fun challenge(context: Context): ShareContent {
        return ShareContent(
            headline = context.getString(R.string.share_challenge_headline),
            subtext = context.getString(R.string.share_challenge_subtext),
            buttonText = context.getString(R.string.btn_send_challenge),
            shareText = context.getString(R.string.share_challenge_body,
                context.getString(R.string.share_app_url),
                context.getString(R.string.share_hashtags)),
            imageTemplate = ImageTemplate.CLEAN_SCAN
        )
    }

    fun getContent(
        context: Context,
        scenario: ShareScenario,
        scanData: ScanShareData? = null,
        urlData: UrlShareData? = null,
        appName: String? = null
    ): ShareContent = when (scenario) {
        ShareScenario.NO_APPS_FOUND -> noAppsFound(context)
        ShareScenario.APPS_FOUND -> appsFound(context, scanData ?: ScanShareData())
        ShareScenario.APP_REMOVED -> appRemoved(context, appName ?: context.getString(R.string.share_fallback_app_name))
        ShareScenario.URL_MATCH_FOUND -> urlMatchFound(context, urlData ?: UrlShareData(context.getString(R.string.share_fallback_company_name), null, true))
        ShareScenario.URL_CLEAN -> urlClean(context, urlData?.companyName ?: context.getString(R.string.share_fallback_company_name))
        ShareScenario.NEW_SUPPORTER -> newSupporter(context)
        ShareScenario.GENERAL -> general(context)
    }
}

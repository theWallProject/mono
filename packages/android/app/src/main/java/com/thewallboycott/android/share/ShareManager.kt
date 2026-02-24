package com.thewallboycott.android.share

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import androidx.core.content.FileProvider
import com.thewallboycott.android.R
import java.io.File
import java.io.FileOutputStream

/**
 * Data class for app removed share scenario.
 * Contains the app name and optional icon bitmap (captured before uninstall).
 */
data class AppRemovedData(
    val appName: String,
    val appIcon: Bitmap? = null,
    val reasons: List<String> = emptyList(),
    val hasAlternatives: Boolean = false
)

/**
 * Central orchestration for all sharing functionality.
 * Manages content generation, frequency caps, and share intents.
 */
class ShareManager(private val context: Context) {

    private val preferences = SharePreferences(context)
    private val imageGenerator = ShareImageGenerator(context)

    /**
     * Initialize a new session (call when app starts).
     */
    fun startSession() {
        preferences.startNewSession()
    }

    // ========================================================================
    // Should Show Prompts
    // ========================================================================

    /**
     * Check if the "no apps found" share prompt should be shown.
     */
    fun shouldShowNoAppsPrompt(): Boolean {
        return preferences.shouldShowNoAppsPrompt()
    }

    /**
     * Check if the "apps found" share prompt should be shown.
     */
    fun shouldShowAppsFoundPrompt(): Boolean {
        return preferences.shouldShowAppsFoundPrompt()
    }

    /**
     * Check if the "app removed" share prompt should be shown.
     */
    fun shouldShowAppRemovedPrompt(): Boolean {
        return preferences.shouldShowAppRemovedPrompt()
    }

    /**
     * Check if the new supporter share prompt should be shown.
     */
    fun shouldShowSupporterPrompt(): Boolean {
        return preferences.shouldShowSupporterPrompt()
    }

    // ========================================================================
    // Mark Prompts Shown / Dismissed
    // ========================================================================

    /**
     * Mark that the "no apps found" prompt was shown.
     */
    fun markNoAppsPromptShown() {
        preferences.markNoAppsPromptShown()
    }

    /**
     * Record dismissal of the "no apps found" prompt.
     */
    fun dismissNoAppsPrompt() {
        preferences.recordNoAppsDismiss()
    }

    /**
     * Mark that the "apps found" prompt was shown.
     */
    fun markAppsFoundPromptShown() {
        preferences.markAppsFoundPromptShown()
    }

    /**
     * Record dismissal of the "apps found" prompt.
     */
    fun dismissAppsFoundPrompt() {
        preferences.recordAppsFoundDismiss()
    }

    /**
     * Record dismissal of the "app removed" prompt.
     */
    fun dismissAppRemovedPrompt() {
        preferences.recordAppRemovedDismiss()
    }

    /**
     * Mark that the supporter prompt was shown.
     */
    fun markSupporterPromptShown() {
        preferences.markSupporterPromptShown()
    }

    // ========================================================================
    // Get Share Content
    // ========================================================================

    /**
     * Get content for the "no apps found" scenario.
     */
    fun getNoAppsFoundContent(): ShareContent {
        return ShareContentGenerator.noAppsFound(context)
    }

    /**
     * Get content for the "apps found" scenario.
     */
    fun getAppsFoundContent(flaggedCount: Int, firstAppName: String?): ShareContent {
        return ShareContentGenerator.appsFound(
            context,
            ScanShareData(
                flaggedCount = flaggedCount,
                firstAppName = firstAppName
            )
        )
    }

    /**
     * Get content for the "app removed" scenario.
     * @param reasons The reason codes from the removed app's database entry (e.g., "h", "f", "i", "u", "BDS_PRIO").
     * @param hasAlternatives Whether the removed app had better alternatives in the database.
     */
    fun getAppRemovedContent(
        appName: String,
        reasons: List<String> = emptyList(),
        hasAlternatives: Boolean = false
    ): ShareContent {
        return ShareContentGenerator.appRemoved(context, appName, reasons, hasAlternatives)
    }

    /**
     * Get content for URL match found.
     */
    fun getUrlMatchContent(companyName: String, reasonSummary: String?): ShareContent {
        return ShareContentGenerator.urlMatchFound(
            context,
            UrlShareData(
                companyName = companyName,
                reasonSummary = reasonSummary,
                isMatch = true
            )
        )
    }

    /**
     * Get content for URL clean result.
     */
    fun getUrlCleanContent(companyName: String): ShareContent {
        return ShareContentGenerator.urlClean(context, companyName)
    }

    /**
     * Get content for new supporter.
     */
    fun getSupporterContent(): ShareContent {
        return ShareContentGenerator.newSupporter(context)
    }

    /**
     * Get content for general sharing.
     */
    fun getGeneralContent(): ShareContent {
        return ShareContentGenerator.general(context)
    }

    /**
     * Get content for challenge/dare sharing.
     */
    fun getChallengeContent(): ShareContent {
        return ShareContentGenerator.challenge(context)
    }

    // ========================================================================
    // Share Execution
    // ========================================================================

    /**
     * Execute a share with text only.
     */
    fun shareText(content: ShareContent) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, content.shareText)
        }
        context.startActivity(
            Intent.createChooser(intent, context.getString(R.string.chooser_share_via)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
        recordShare()
    }

    /**
     * Data class for flagged apps additional info.
     * @param count Total number of flagged apps
     * @param appNames List of app names to display (up to 2)
     * @param appIcons List of app icons corresponding to appNames (same order)
     */
    data class FlaggedAppsData(
        val count: Int,
        val appNames: List<String> = emptyList(),
        val appIcons: List<Bitmap?> = emptyList()
    )

    /**
     * Execute a share with text and image.
     */
    fun shareWithImage(content: ShareContent, imageTemplate: ImageTemplate, additionalData: Any? = null) {
        val bitmap = when (imageTemplate) {
            ImageTemplate.CLEAN_SCAN -> imageGenerator.generateCleanScanImage()
            ImageTemplate.FLAGGED_APPS -> {
                when (additionalData) {
                    is FlaggedAppsData -> imageGenerator.generateFlaggedAppsImage(
                        additionalData.count,
                        additionalData.appNames,
                        additionalData.appIcons
                    )
                    is Int -> imageGenerator.generateFlaggedAppsImage(additionalData)
                    else -> imageGenerator.generateFlaggedAppsImage(1)
                }
            }
            ImageTemplate.APP_REMOVED -> {
                when (additionalData) {
                    is AppRemovedData -> imageGenerator.generateAppRemovedImage(
                        additionalData.appName,
                        additionalData.appIcon,
                        additionalData.reasons,
                        additionalData.hasAlternatives
                    )
                    is String -> imageGenerator.generateAppRemovedImage(additionalData)
                    else -> imageGenerator.generateAppRemovedImage(context.getString(R.string.share_fallback_app_name))
                }
            }
            ImageTemplate.SUPPORTER -> imageGenerator.generateSupporterImage()
            ImageTemplate.GENERAL -> imageGenerator.generateGeneralImage()
        }

        val imageUri = saveBitmapAndGetUri(bitmap)
        if (imageUri != null) {
            shareWithImageUri(content.shareText, imageUri)
        } else {
            // Fallback to text-only share
            shareText(content)
        }
        recordShare()
    }

    /**
     * Save bitmap to cache and get a content URI for sharing.
     */
    private fun saveBitmapAndGetUri(bitmap: Bitmap): Uri? {
        return try {
            val cacheDir = File(context.cacheDir, "share_images")
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }
            val file = File(cacheDir, "share_${System.currentTimeMillis()}.png")
            FileOutputStream(file).use { out ->
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
            }
            FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Share text with an image URI.
     */
    private fun shareWithImageUri(text: String, imageUri: Uri) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "image/png"
            putExtra(Intent.EXTRA_TEXT, text)
            putExtra(Intent.EXTRA_STREAM, imageUri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(
            Intent.createChooser(intent, context.getString(R.string.chooser_share_via)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
    }

    // ========================================================================
    // Gamification
    // ========================================================================

    /**
     * Record that a share was made and check for milestones.
     * Returns the new milestone tier if one was reached, null otherwise.
     */
    private fun recordShare(): Int? {
        val newTotal = preferences.incrementShareCount()
        return preferences.checkNewMilestone(newTotal)
    }

    /**
     * Get the total share count.
     */
    fun getTotalShares(): Int {
        return preferences.getTotalShares()
    }

    /**
     * Get the milestone name for the current share count.
     */
    fun getCurrentMilestoneName(): String {
        val tier = preferences.getMilestoneTier(getTotalShares())
        return preferences.getMilestoneName(tier)
    }

    /**
     * Check if a share results in a new milestone.
     * Call this after sharing and show a toast if non-null.
     */
    fun checkAndRecordMilestone(): Pair<String, Int>? {
        val total = getTotalShares()
        val tier = preferences.checkNewMilestone(total)
        return tier?.let { preferences.getMilestoneName(it) to it }
    }
}

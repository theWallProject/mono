package com.thewallboycott.android.testutil

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import android.graphics.drawable.BitmapDrawable
import androidx.test.core.app.ApplicationProvider
import org.robolectric.Shadows
import android.content.Context

/**
 * Creates realistic fake [PackageInfo] entries for use in screenshot tests.
 *
 * Unlike bare [PackageInfo] objects, these have:
 * - **Proper app names** via [ApplicationInfo.nonLocalizedLabel] so `loadLabel()` returns
 *   a human-readable name instead of the raw package name.
 * - **Colored letter icons** registered via Robolectric's [ShadowPackageManager] so
 *   `loadIcon()` returns a distinctive icon instead of the default Android robot.
 *
 * The icons are simple colored circles with a white letter, designed to look plausible
 * in Play Store screenshots without using any trademarked assets.
 */
object FakePackages {

    /**
     * Predefined color palette for app icons.
     * Each color is chosen to be visually distinct and roughly evoke the brand.
     */
    private object IconColors {
        const val WIX_BLUE = 0xFF0C6EFC.toInt()
        const val BOOKING_NAVY = 0xFF003580.toInt()
        const val CNN_RED = 0xFFCC0000.toInt()
        const val FIVERR_GREEN = 0xFF1DBF73.toInt()
        const val MONDAY_PURPLE = 0xFF6C63FF.toInt()
        const val ETORO_GREEN = 0xFF44B549.toInt()
        const val AMAZON_ORANGE = 0xFFFF9900.toInt()
        const val AIRBNB_CORAL = 0xFFFF5A5F.toInt()
        const val CHATGPT_TEAL = 0xFF10A37F.toInt()
        const val BBC_MAROON = 0xFFBB1919.toInt()
        const val SAFE_GRAY = 0xFF607D8B.toInt()
        const val SAFE_TEAL = 0xFF009688.toInt()
        const val BLUESKY_BLUE = 0xFF0085FF.toInt()
        const val EXPRESS_VPN_RED = 0xFFDA3940.toInt()
    }

    /**
     * Creates a [PackageInfo] with a human-readable label and registers a colored
     * letter icon with Robolectric's shadow package manager.
     *
     * @param packageName The Android package name (e.g., "com.wix.android")
     * @param label The human-readable app name shown in the UI (e.g., "Wix")
     * @param iconLetter The letter to display in the icon (defaults to first char of label)
     * @param iconColor The background color for the icon circle (ARGB int)
     */
    fun create(
        packageName: String,
        label: String,
        iconLetter: Char = label.first().uppercaseChar(),
        iconColor: Int = IconColors.SAFE_GRAY
    ): PackageInfo {
        val context: Context = ApplicationProvider.getApplicationContext()
        val pm = context.packageManager
        val shadowPm = Shadows.shadowOf(pm)

        val packageInfo = PackageInfo().apply {
            this.packageName = packageName
            applicationInfo = ApplicationInfo().apply {
                this.packageName = packageName
                this.nonLocalizedLabel = label
                this.flags = 0
            }
        }

        // Register the package with Robolectric's shadow
        shadowPm.installPackage(packageInfo)

        // Create and register a distinctive colored-letter icon.
        // loadIcon() resolves through pm.loadUnbadgedItemIcon() which checks
        // the unbadged icon map — NOT the applicationIcons map used by
        // pm.getApplicationIcon(). We set both for completeness.
        val icon = createLetterIcon(iconLetter, iconColor)
        val drawable = BitmapDrawable(context.resources, icon)
        shadowPm.setUnbadgedApplicationIcon(packageName, drawable)
        shadowPm.setApplicationIcon(packageName, drawable)

        return packageInfo
    }

    // ==================== Preset Factories ====================

    /** Wix — Israeli HQ, website builder */
    fun wix() = create("com.wix.android", "Wix", iconColor = IconColors.WIX_BLUE)

    /** Fiverr — Israeli HQ, freelance marketplace */
    fun fiverr() = create("com.fiverr.fiverr", "Fiverr", iconColor = IconColors.FIVERR_GREEN)

    /** monday.com — Israeli HQ, project management */
    fun monday() = create("com.monday.monday", "monday.com", 'M', IconColors.MONDAY_PURPLE)

    /** eToro — Israeli HQ, trading platform */
    fun etoro() = create("com.etoro.openbook", "eToro", 'E', IconColors.ETORO_GREEN)

    /** Booking.com — BDS pressure target */
    fun booking() = create("com.booking", "Booking.com", 'B', IconColors.BOOKING_NAVY)

    /** Amazon — BDS pressure target */
    fun amazon() = create("com.amazon.mShop.android.shopping", "Amazon", iconColor = IconColors.AMAZON_ORANGE)

    /** Airbnb — BDS pressure target */
    fun airbnb() = create("com.airbnb.android", "Airbnb", iconColor = IconColors.AIRBNB_CORAL)

    /** CNN — News hint (Newscord alternative) */
    fun cnn() = create("com.cnn.mobile.android.phone", "CNN", iconColor = IconColors.CNN_RED)

    /** BBC — News hint (Newscord alternative) */
    fun bbc() = create("bbc.mobile.news.ww", "BBC News", 'B', IconColors.BBC_MAROON)

    /** ChatGPT — AI hint (Thaura alternative) */
    fun chatgpt() = create("com.openai.chatgpt", "ChatGPT", 'G', IconColors.CHATGPT_TEAL)

    /** Bluesky — Investor-linked */
    fun bluesky() = create("xyz.blueskyweb.app", "Bluesky", 'B', IconColors.BLUESKY_BLUE)

    /** ExpressVPN — Founder-linked */
    fun expressvpn() = create("com.expressvpn.vpn", "ExpressVPN", 'E', IconColors.EXPRESS_VPN_RED)

    /** Generic safe app 1 */
    fun safeApp1() = create("com.safe.app1", "Signal", 'S', IconColors.SAFE_TEAL)

    /** Generic safe app 2 */
    fun safeApp2() = create("com.safe.app2", "Firefox", 'F', IconColors.SAFE_GRAY)

    /** Generic safe app (single) */
    fun safeApp() = create("com.safe.app", "Telegram", 'T', IconColors.SAFE_TEAL)

    // ==================== Icon Generation ====================

    /**
     * Creates a 96x96 bitmap with a colored circle and a white letter centered on it.
     * This produces a simple but distinctive app icon suitable for screenshots.
     */
    private fun createLetterIcon(letter: Char, backgroundColor: Int, size: Int = 96): Bitmap {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw colored circle background
        val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = backgroundColor
            style = Paint.Style.FILL
        }
        val center = size / 2f
        canvas.drawCircle(center, center, center, bgPaint)

        // Draw white letter
        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = 0xFFFFFFFF.toInt()
            textSize = size * 0.5f
            typeface = Typeface.DEFAULT_BOLD
            textAlign = Paint.Align.CENTER
        }

        // Center the text vertically
        val textBounds = Rect()
        textPaint.getTextBounds(letter.toString(), 0, 1, textBounds)
        val textY = center - textBounds.exactCenterY()

        canvas.drawText(letter.toString(), center, textY, textPaint)

        return bitmap
    }
}

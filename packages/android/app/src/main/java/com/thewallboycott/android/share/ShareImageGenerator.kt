package com.thewallboycott.android.share

import android.content.Context
import android.graphics.*
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.toBitmap
import com.thewallboycott.android.R

/**
 * Generates share images using Canvas rendering.
 * Creates Instagram-friendly 1080x1080 square images with branded templates.
 *
 * All templates follow a unified design:
 * - Orange background (#B72B00)
 * - White shield icon (no circle) at y=180
 * - Header text (white, 42px) at y=360-410
 * - Optional app icon (120px) at y=540
 * - App name (Israeli blue #0038B8, 72px bold) at y=700 (or y=600 if no icon)
 * - CTA text (white, 36px) at y=820-865
 * - Footer with darker orange background at y=980-1080
 */
class ShareImageGenerator(private val context: Context) {

    companion object {
        // Canvas dimensions (Instagram-friendly square)
        private const val IMAGE_SIZE = 1080

        // Brand colors
        private const val COLOR_PRIMARY = 0xFFB72B00.toInt()       // Burnt orange (WallPrimary)
        private const val COLOR_PRIMARY_DARK = 0xFF932300.toInt()  // Darker orange for footer
        private const val COLOR_WHITE = 0xFFFFFFFF.toInt()
        private const val COLOR_ISRAELI_BLUE = 0xFF0038B8.toInt()  // Israeli flag blue for app names
        private const val COLOR_SUCCESS_GREEN = 0xFF4CAF50.toInt() // Success green for clean scan

        // Footer text
        private const val FOOTER_URL = "the-wall.win"
    }

    // ========================================================================
    // Template Generation Methods
    // ========================================================================

    /**
     * Generate the "Clean Scan" image template.
     * Header: "My phone is clean!"
     * App Name Area: "0 israeli apps found"
     * CTA: "Scan YOUR phone and see for yourself!"
     */
    fun generateCleanScanImage(): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw solid orange background
        canvas.drawColor(COLOR_PRIMARY)

        // Draw logo centered at y=180
        drawLogo(canvas, 180f, 750f)

        // Draw header text at y=420
        val headerPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 52f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_clean_header), IMAGE_SIZE / 2f, 420f, headerPaint)

        // Draw "0 Israeli apps found 🎉" in success green at y=600
        val appNamePaint = Paint().apply {
            color = COLOR_SUCCESS_GREEN
            textSize = 72f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_clean_count), IMAGE_SIZE / 2f, 600f, appNamePaint)

        // Draw CTA text at y=820
        val ctaPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            alpha = 230
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_clean_cta), IMAGE_SIZE / 2f, 820f, ctaPaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    /**
     * Generate the "Flagged Apps" image template.
     * Header: "I found {count} israeli app{s} on my phone!"
     * App Name Area: Up to 2 app names in Israeli blue with icons on the left, "and more!" if more than 2
     * CTA: "Scan your phone NOW and protect yourself!"
     */
    fun generateFlaggedAppsImage(
        count: Int,
        appNames: List<String> = emptyList(),
        appIcons: List<Bitmap?> = emptyList()
    ): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw solid orange background
        canvas.drawColor(COLOR_PRIMARY)

        // Draw logo centered at y=180
        drawLogo(canvas, 180f, 750f)

        // Draw header text at y=420
        val headerPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 48f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(context.resources.getQuantityString(R.plurals.share_image_flagged_header, count, count), IMAGE_SIZE / 2f, 420f, headerPaint)

        // Draw app names in Israeli blue with icons
        val appNamePaint = Paint().apply {
            color = COLOR_ISRAELI_BLUE
            textSize = 56f
            textAlign = Paint.Align.LEFT
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }

        // Calculate starting Y position based on number of items to display
        val hasMoreThanTwo = appNames.size > 2
        val displayCount = minOf(appNames.size, 2)
        val totalLines = displayCount + if (hasMoreThanTwo) 1 else 0
        val lineHeight = 90f // Increased for icon + spacing
        val iconSize = 64f
        val iconTextGap = 16f
        val startY = 580f - ((totalLines - 1) * lineHeight / 2f)

        // Draw first app with icon
        if (appNames.isNotEmpty()) {
            val displayName = truncateAppName(appNames[0], 16)
            val textWidth = appNamePaint.measureText(displayName)
            val totalWidth = iconSize + iconTextGap + textWidth
            val startX = (IMAGE_SIZE - totalWidth) / 2f

            // Draw icon if available
            val icon1 = appIcons.getOrNull(0)
            if (icon1 != null) {
                drawAppIcon(canvas, icon1, startX + iconSize / 2f, startY - iconSize / 4f, iconSize)
            }
            // Draw app name
            canvas.drawText(displayName, startX + iconSize + iconTextGap, startY, appNamePaint)
        }

        // Draw second app with icon if exists
        if (appNames.size >= 2) {
            val displayName = truncateAppName(appNames[1], 16)
            val textWidth = appNamePaint.measureText(displayName)
            val totalWidth = iconSize + iconTextGap + textWidth
            val startX = (IMAGE_SIZE - totalWidth) / 2f
            val y = startY + lineHeight

            // Draw icon if available
            val icon2 = appIcons.getOrNull(1)
            if (icon2 != null) {
                drawAppIcon(canvas, icon2, startX + iconSize / 2f, y - iconSize / 4f, iconSize)
            }
            // Draw app name
            canvas.drawText(displayName, startX + iconSize + iconTextGap, y, appNamePaint)
        }

        // Draw "and more!" if more than 2 apps
        if (hasMoreThanTwo) {
            val morePaint = Paint().apply {
                color = COLOR_WHITE
                textSize = 40f
                textAlign = Paint.Align.CENTER
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                isAntiAlias = true
            }
            canvas.drawText(context.getString(R.string.share_image_flagged_and_more), IMAGE_SIZE / 2f, startY + lineHeight * 2, morePaint)
        }

        // Draw CTA text at y=820
        val ctaPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            alpha = 230
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_flagged_cta), IMAGE_SIZE / 2f, 820f, ctaPaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    /**
     * Generate the "App Removed" image template.
     * Header: "I removed this israeli app from my phone:"
     * App Icon: Optional, displayed at y=480
     * App Name: In Israeli blue at y=700 (or y=600 if no icon)
     * CTA: "Scan your phone NOW and protect yourself!"
     */
    fun generateAppRemovedImage(appName: String, appIcon: Bitmap? = null): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw solid orange background
        canvas.drawColor(COLOR_PRIMARY)

        // Draw logo centered at y=180
        drawLogo(canvas, 180f, 750f)

        // Draw header text at y=420
        val headerPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 42f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_removed_header), IMAGE_SIZE / 2f, 420f, headerPaint)

        // Draw app icon if available at y=540
        val appNameY: Float
        if (appIcon != null) {
            drawAppIcon(canvas, appIcon, IMAGE_SIZE / 2f, 540f, 120f)
            appNameY = 720f
        } else {
            appNameY = 600f
        }

        // Draw app name in white
        val appNamePaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 72f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        val displayName = truncateAppName(appName, 18)
        canvas.drawText(displayName, IMAGE_SIZE / 2f, appNameY, appNamePaint)

        // Draw CTA text at y=865
        val ctaPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            alpha = 230
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_removed_cta), IMAGE_SIZE / 2f, 865f, ctaPaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    /**
     * Generate the "Supporter" image template.
     * Header: "I support the resistance!"
     * App Name Area: "THE WALL"
     * CTA: "$1/month keeps the app free for everyone"
     */
    fun generateSupporterImage(): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw solid orange background
        canvas.drawColor(COLOR_PRIMARY)

        // Draw logo centered at y=180
        drawLogo(canvas, 180f, 750f)

        // Draw header text at y=420
        val headerPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 52f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_supporter_header), IMAGE_SIZE / 2f, 420f, headerPaint)

        // Draw subtitle in Israeli blue at y=560
        val subtitlePaint = Paint().apply {
            color = COLOR_ISRAELI_BLUE
            textSize = 64f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_supporter_subtitle), IMAGE_SIZE / 2f, 560f, subtitlePaint)

        // Draw CTA text at y=820
        val ctaPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            alpha = 230
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_supporter_cta), IMAGE_SIZE / 2f, 820f, ctaPaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    /**
     * Generate the "General" share image template.
     * Header: "Know what's on your phone"
     * App Name Area: "THE WALL"
     * CTA: "20,000+ companies tracked. One tap to know."
     */
    fun generateGeneralImage(): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw solid orange background
        canvas.drawColor(COLOR_PRIMARY)

        // Draw logo centered at y=180
        drawLogo(canvas, 180f, 750f)

        // Draw header text at y=420
        val headerPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 52f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_general_header), IMAGE_SIZE / 2f, 420f, headerPaint)

        // Draw subtitle in Israeli blue at y=560
        val subtitlePaint = Paint().apply {
            color = COLOR_ISRAELI_BLUE
            textSize = 64f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_general_subtitle), IMAGE_SIZE / 2f, 560f, subtitlePaint)

        // Draw CTA text at y=820
        val ctaPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            alpha = 230
            isAntiAlias = true
        }
        canvas.drawText(context.getString(R.string.share_image_general_cta), IMAGE_SIZE / 2f, 820f, ctaPaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    // ========================================================================
    // Helper Drawing Methods
    // ========================================================================

    // Cached logo bitmap to avoid regenerating on every share image
    private var cachedLogoBitmap: Bitmap? = null

    /**
     * Draw the full "THE WALL - Boycott Assistance" logo centered horizontally.
     * Logo aspect ratio is 351:107 (about 3.28:1)
     * @param cy Center Y position for the logo
     * @param width Desired width of the logo
     */
    private fun drawLogo(canvas: Canvas, cy: Float, width: Float) {
        // Use cached bitmap if available, otherwise create it
        val logoBitmap = cachedLogoBitmap ?: run {
            val drawable = ContextCompat.getDrawable(context, R.drawable.ic_share_logo)
            drawable?.toBitmap(351, 107)?.also { cachedLogoBitmap = it }
        } ?: return

        // Calculate scaled dimensions maintaining aspect ratio (351:107)
        val aspectRatio = 351f / 107f
        val scaledWidth = width
        val scaledHeight = width / aspectRatio

        // Scale the bitmap
        val scaledBitmap = Bitmap.createScaledBitmap(logoBitmap, scaledWidth.toInt(), scaledHeight.toInt(), true)

        // Center horizontally
        val left = (IMAGE_SIZE - scaledWidth) / 2f
        val top = cy - scaledHeight / 2f

        canvas.drawBitmap(scaledBitmap, left, top, null)
    }

    /**
     * Draw an app icon with rounded corners.
     * @param icon The app icon bitmap
     * @param cx Center x position
     * @param cy Center y position
     * @param size Size of the icon (width/height)
     */
    private fun drawAppIcon(canvas: Canvas, icon: Bitmap, cx: Float, cy: Float, size: Float) {
        // Scale icon to desired size
        val scaledIcon = Bitmap.createScaledBitmap(icon, size.toInt(), size.toInt(), true)

        // Create rounded corners
        val output = Bitmap.createBitmap(size.toInt(), size.toInt(), Bitmap.Config.ARGB_8888)
        val iconCanvas = Canvas(output)

        val paint = Paint().apply {
            isAntiAlias = true
        }

        // Draw rounded rect clip
        val rect = RectF(0f, 0f, size, size)
        val cornerRadius = size * 0.2f // 20% corner radius
        iconCanvas.drawRoundRect(rect, cornerRadius, cornerRadius, paint)

        // Apply source-in to clip the icon
        paint.xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_IN)
        iconCanvas.drawBitmap(scaledIcon, 0f, 0f, paint)

        // Draw the rounded icon on main canvas
        val left = cx - size / 2f
        val top = cy - size / 2f
        canvas.drawBitmap(output, left, top, null)

        // Clean up
        scaledIcon.recycle()
        output.recycle()
    }

    /**
     * Draw the footer with darker orange background and URL.
     */
    private fun drawFooter(canvas: Canvas) {
        // Draw darker orange footer background (y=980-1080, so 100px height)
        val footerBgPaint = Paint().apply {
            color = COLOR_PRIMARY_DARK
        }
        canvas.drawRect(0f, IMAGE_SIZE - 100f, IMAGE_SIZE.toFloat(), IMAGE_SIZE.toFloat(), footerBgPaint)

        // Draw URL
        val urlPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            isAntiAlias = true
        }
        canvas.drawText(FOOTER_URL, IMAGE_SIZE / 2f, IMAGE_SIZE - 40f, urlPaint)
    }

    /**
     * Truncate app name if too long, adding ellipsis.
     */
    private fun truncateAppName(name: String, maxLength: Int): String {
        return if (name.length > maxLength) {
            name.take(maxLength - 3) + "..."
        } else {
            name
        }
    }
}

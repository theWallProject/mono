package com.thewallboycott.android.share

import android.content.Context
import android.graphics.*
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.toBitmap
import com.thewallboycott.android.R

/**
 * Generates share images using Canvas rendering.
 * Creates Instagram-friendly 1080x1080 square images with branded templates.
 */
class ShareImageGenerator(private val context: Context) {

    companion object {
        // Canvas dimensions (Instagram-friendly square)
        private const val IMAGE_SIZE = 1080

        // Brand colors
        private const val COLOR_PRIMARY = 0xFFB72B00.toInt()       // Burnt orange
        private const val COLOR_PRIMARY_DARK = 0xFF932300.toInt()
        private const val COLOR_WHITE = 0xFFFFFFFF.toInt()
        private const val COLOR_TEXT_DARK = 0xFF1A1A1A.toInt()

        // Template-specific colors
        private const val COLOR_GREEN_LIGHT = 0xFFE8F5E9.toInt()
        private const val COLOR_GREEN_DARK = 0xFFC8E6C9.toInt()
        private const val COLOR_GREEN_ACCENT = 0xFF4CAF50.toInt()

        private const val COLOR_RED_LIGHT = 0xFFFFEBEE.toInt()
        private const val COLOR_RED_DARK = 0xFFFFCDD2.toInt()
        private const val COLOR_RED_ACCENT = 0xFFD32F2F.toInt()

        private const val COLOR_GOLD_LIGHT = 0xFFFFF8E1.toInt()
        private const val COLOR_GOLD_DARK = 0xFFFFE082.toInt()
        private const val COLOR_GOLD_ACCENT = 0xFFF9A825.toInt()

        // Footer text
        private const val FOOTER_URL = "the-wall.win/android"
    }

    // ========================================================================
    // Template Generation Methods
    // ========================================================================

    /**
     * Generate the "Clean Scan" image template.
     * Green gradient, large "0" with checkmark, shield logo, "CLEAN SCAN" badge.
     */
    fun generateCleanScanImage(): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw green gradient background
        drawGradientBackground(canvas, COLOR_GREEN_LIGHT, COLOR_GREEN_DARK)

        // Draw shield logo at top
        drawShieldLogo(canvas, IMAGE_SIZE / 2f, 200f, 120f)

        // Draw large "0" in center
        val zeroPaint = Paint().apply {
            color = COLOR_GREEN_ACCENT
            textSize = 300f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText("0", IMAGE_SIZE / 2f, IMAGE_SIZE / 2f + 60f, zeroPaint)

        // Draw checkmark next to the 0
        drawCheckmark(canvas, IMAGE_SIZE / 2f + 180f, IMAGE_SIZE / 2f - 60f, 60f)

        // Draw "CLEAN SCAN" badge
        drawBadge(canvas, "CLEAN SCAN", IMAGE_SIZE / 2f, 720f, COLOR_GREEN_ACCENT)

        // Draw subtitle
        val subtitlePaint = Paint().apply {
            color = COLOR_TEXT_DARK
            textSize = 48f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            isAntiAlias = true
        }
        canvas.drawText("No flagged apps found", IMAGE_SIZE / 2f, 820f, subtitlePaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    /**
     * Generate the "Flagged Apps" image template.
     * Red gradient, warning icon, count display.
     */
    fun generateFlaggedAppsImage(count: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw red gradient background
        drawGradientBackground(canvas, COLOR_RED_LIGHT, COLOR_RED_DARK)

        // Draw shield logo at top
        drawShieldLogo(canvas, IMAGE_SIZE / 2f, 200f, 120f)

        // Draw warning icon
        drawWarningIcon(canvas, IMAGE_SIZE / 2f, 380f, 80f)

        // Draw count
        val countPaint = Paint().apply {
            color = COLOR_RED_ACCENT
            textSize = 200f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(count.toString(), IMAGE_SIZE / 2f, IMAGE_SIZE / 2f + 100f, countPaint)

        // Draw "APPS FLAGGED" badge
        drawBadge(canvas, "APPS FLAGGED", IMAGE_SIZE / 2f, 720f, COLOR_RED_ACCENT)

        // Draw subtitle
        val subtitlePaint = Paint().apply {
            color = COLOR_TEXT_DARK
            textSize = 44f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            isAntiAlias = true
        }
        canvas.drawText("Connected to Israeli apartheid", IMAGE_SIZE / 2f, 820f, subtitlePaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    /**
     * Generate the "App Removed" image template.
     * Orange-to-green gradient, crossed-out app icon, "REMOVED" stamp.
     */
    fun generateAppRemovedImage(appName: String): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw orange-to-green gradient background
        drawGradientBackground(canvas, COLOR_GOLD_LIGHT, COLOR_GREEN_LIGHT)

        // Draw shield logo at top
        drawShieldLogo(canvas, IMAGE_SIZE / 2f, 200f, 120f)

        // Draw app icon placeholder with X
        drawCrossedOutIcon(canvas, IMAGE_SIZE / 2f, IMAGE_SIZE / 2f - 40f, 120f)

        // Draw "REMOVED" stamp
        drawStamp(canvas, "REMOVED", IMAGE_SIZE / 2f, IMAGE_SIZE / 2f + 120f)

        // Draw app name (truncated if needed)
        val displayName = if (appName.length > 25) appName.take(22) + "..." else appName
        val namePaint = Paint().apply {
            color = COLOR_TEXT_DARK
            textSize = 48f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText(displayName, IMAGE_SIZE / 2f, 780f, namePaint)

        // Draw subtitle
        val subtitlePaint = Paint().apply {
            color = COLOR_TEXT_DARK
            textSize = 40f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            isAntiAlias = true
        }
        canvas.drawText("One less app funding apartheid", IMAGE_SIZE / 2f, 840f, subtitlePaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    /**
     * Generate the "Supporter" image template.
     * Gold gradient, star badge, premium feel.
     */
    fun generateSupporterImage(): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw gold gradient background
        drawGradientBackground(canvas, COLOR_GOLD_LIGHT, COLOR_GOLD_DARK)

        // Draw shield logo at top
        drawShieldLogo(canvas, IMAGE_SIZE / 2f, 200f, 120f)

        // Draw star
        drawStar(canvas, IMAGE_SIZE / 2f, IMAGE_SIZE / 2f - 60f, 100f)

        // Draw "SUPPORTER" badge
        drawBadge(canvas, "SUPPORTER", IMAGE_SIZE / 2f, 680f, COLOR_GOLD_ACCENT)

        // Draw subtitle
        val subtitlePaint = Paint().apply {
            color = COLOR_TEXT_DARK
            textSize = 44f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            isAntiAlias = true
        }
        canvas.drawText("Keeping The Wall alive", IMAGE_SIZE / 2f, 780f, subtitlePaint)

        // Draw "$1/month" badge
        val pricePaint = Paint().apply {
            color = COLOR_GOLD_ACCENT
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText("$1/month makes a difference", IMAGE_SIZE / 2f, 840f, pricePaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    /**
     * Generate the "General" share image template.
     * Shield logo, database size badge, brand colors.
     */
    fun generateGeneralImage(): Bitmap {
        val bitmap = Bitmap.createBitmap(IMAGE_SIZE, IMAGE_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw white background
        canvas.drawColor(COLOR_WHITE)

        // Draw primary color header band
        val headerPaint = Paint().apply {
            color = COLOR_PRIMARY
        }
        canvas.drawRect(0f, 0f, IMAGE_SIZE.toFloat(), 350f, headerPaint)

        // Draw shield logo in header
        drawShieldLogo(canvas, IMAGE_SIZE / 2f, 180f, 140f, COLOR_WHITE)

        // Draw app name
        val titlePaint = Paint().apply {
            color = COLOR_PRIMARY
            textSize = 72f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText("THE WALL", IMAGE_SIZE / 2f, 480f, titlePaint)

        // Draw tagline
        val taglinePaint = Paint().apply {
            color = COLOR_TEXT_DARK
            textSize = 44f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            isAntiAlias = true
        }
        canvas.drawText("Boycott Israeli Apartheid", IMAGE_SIZE / 2f, 550f, taglinePaint)

        // Draw database size badge
        drawBadge(canvas, "20,000+ Companies Tracked", IMAGE_SIZE / 2f, 680f, COLOR_PRIMARY)

        // Draw features
        val featurePaint = Paint().apply {
            color = COLOR_TEXT_DARK
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT
            isAntiAlias = true
        }
        canvas.drawText("Scan apps • Check URLs • Stay informed", IMAGE_SIZE / 2f, 780f, featurePaint)

        // Draw footer
        drawFooter(canvas)

        return bitmap
    }

    // ========================================================================
    // Helper Drawing Methods
    // ========================================================================

    private fun drawGradientBackground(canvas: Canvas, colorStart: Int, colorEnd: Int) {
        val gradient = LinearGradient(
            0f, 0f, 0f, IMAGE_SIZE.toFloat(),
            colorStart, colorEnd,
            Shader.TileMode.CLAMP
        )
        val paint = Paint().apply {
            shader = gradient
        }
        canvas.drawRect(0f, 0f, IMAGE_SIZE.toFloat(), IMAGE_SIZE.toFloat(), paint)
    }

    private fun drawShieldLogo(canvas: Canvas, cx: Float, cy: Float, size: Float, color: Int = COLOR_PRIMARY) {
        // Draw circle background
        val bgPaint = Paint().apply {
            this.color = color
            style = Paint.Style.FILL
            isAntiAlias = true
        }
        canvas.drawCircle(cx, cy, size, bgPaint)

        // Load and draw the actual shield icon
        val drawable = ContextCompat.getDrawable(context, R.drawable.ic_wall_shield)
        if (drawable != null) {
            val iconSize = (size * 1.4f).toInt()
            val iconBitmap = drawable.toBitmap(iconSize, (iconSize * 1.2f).toInt())
            val left = cx - iconSize / 2f
            val top = cy - iconSize / 2f
            canvas.drawBitmap(iconBitmap, left, top, null)
        }
    }

    private fun drawCheckmark(canvas: Canvas, cx: Float, cy: Float, size: Float) {
        val paint = Paint().apply {
            color = COLOR_GREEN_ACCENT
            style = Paint.Style.STROKE
            strokeWidth = size / 4
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
            isAntiAlias = true
        }

        val path = Path().apply {
            moveTo(cx - size * 0.5f, cy)
            lineTo(cx - size * 0.1f, cy + size * 0.4f)
            lineTo(cx + size * 0.5f, cy - size * 0.4f)
        }
        canvas.drawPath(path, paint)
    }

    private fun drawWarningIcon(canvas: Canvas, cx: Float, cy: Float, size: Float) {
        val paint = Paint().apply {
            color = COLOR_RED_ACCENT
            style = Paint.Style.FILL
            isAntiAlias = true
        }

        // Draw triangle
        val path = Path().apply {
            moveTo(cx, cy - size)
            lineTo(cx + size, cy + size * 0.7f)
            lineTo(cx - size, cy + size * 0.7f)
            close()
        }
        canvas.drawPath(path, paint)

        // Draw exclamation mark
        val textPaint = Paint().apply {
            color = COLOR_WHITE
            textSize = size * 1.2f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText("!", cx, cy + size * 0.3f, textPaint)
    }

    private fun drawCrossedOutIcon(canvas: Canvas, cx: Float, cy: Float, size: Float) {
        // Draw app icon placeholder (rounded square)
        val paint = Paint().apply {
            color = 0xFFE0E0E0.toInt()
            style = Paint.Style.FILL
            isAntiAlias = true
        }
        val rect = RectF(cx - size, cy - size, cx + size, cy + size)
        canvas.drawRoundRect(rect, 24f, 24f, paint)

        // Draw X over it
        val xPaint = Paint().apply {
            color = COLOR_RED_ACCENT
            style = Paint.Style.STROKE
            strokeWidth = 16f
            strokeCap = Paint.Cap.ROUND
            isAntiAlias = true
        }
        canvas.drawLine(cx - size * 0.7f, cy - size * 0.7f, cx + size * 0.7f, cy + size * 0.7f, xPaint)
        canvas.drawLine(cx + size * 0.7f, cy - size * 0.7f, cx - size * 0.7f, cy + size * 0.7f, xPaint)
    }

    private fun drawStar(canvas: Canvas, cx: Float, cy: Float, size: Float) {
        val paint = Paint().apply {
            color = COLOR_GOLD_ACCENT
            style = Paint.Style.FILL
            isAntiAlias = true
        }

        val path = Path()
        val outerRadius = size
        val innerRadius = size * 0.4f
        val points = 5

        for (i in 0 until points * 2) {
            val radius = if (i % 2 == 0) outerRadius else innerRadius
            val angle = Math.PI * i / points - Math.PI / 2
            val x = cx + (radius * Math.cos(angle)).toFloat()
            val y = cy + (radius * Math.sin(angle)).toFloat()
            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        path.close()
        canvas.drawPath(path, paint)
    }

    private fun drawBadge(canvas: Canvas, text: String, cx: Float, cy: Float, color: Int) {
        val textPaint = Paint().apply {
            this.color = COLOR_WHITE
            textSize = 40f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }

        // Measure text for badge size
        val textWidth = textPaint.measureText(text)
        val paddingH = 40f
        val paddingV = 20f

        // Draw badge background
        val bgPaint = Paint().apply {
            this.color = color
            isAntiAlias = true
        }
        val rect = RectF(
            cx - textWidth / 2 - paddingH,
            cy - paddingV - 20f,
            cx + textWidth / 2 + paddingH,
            cy + paddingV
        )
        canvas.drawRoundRect(rect, 30f, 30f, bgPaint)

        // Draw text
        canvas.drawText(text, cx, cy, textPaint)
    }

    private fun drawStamp(canvas: Canvas, text: String, cx: Float, cy: Float) {
        val textPaint = Paint().apply {
            color = COLOR_GREEN_ACCENT
            textSize = 56f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }

        // Draw border
        val borderPaint = Paint().apply {
            color = COLOR_GREEN_ACCENT
            style = Paint.Style.STROKE
            strokeWidth = 6f
            isAntiAlias = true
        }

        val textWidth = textPaint.measureText(text)
        val padding = 30f
        val rect = RectF(
            cx - textWidth / 2 - padding,
            cy - 40f,
            cx + textWidth / 2 + padding,
            cy + 20f
        )
        canvas.drawRoundRect(rect, 8f, 8f, borderPaint)

        // Draw text
        canvas.drawText(text, cx, cy, textPaint)
    }

    private fun drawFooter(canvas: Canvas) {
        // Draw footer background
        val footerBgPaint = Paint().apply {
            color = COLOR_PRIMARY
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
}

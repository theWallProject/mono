package com.thewallboycott.android.testutil

/**
 * Robolectric device qualifier strings for different screen sizes.
 * Used with `@Config(qualifiers = ...)` to simulate phone/tablet rendering.
 *
 * Format: `w{dp}dp-h{dp}dp-{density}` where density is ldpi/mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi.
 */
object TestDevices {
    /** Pixel 5 — 1080x2340 @ 440dpi (xxhdpi bucket) */
    const val PHONE = "w393dp-h851dp-xxhdpi"

    /** Pixel C tablet — 2560x1800 @ 308dpi (xhdpi bucket) */
    const val TABLET = "w900dp-h1264dp-xhdpi"
}

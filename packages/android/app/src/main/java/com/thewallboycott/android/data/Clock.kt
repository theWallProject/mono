package com.thewallboycott.android.data

/**
 * Abstraction over [System.currentTimeMillis] to enable deterministic testing
 * of time-dependent logic (snooze expiry, reminder intervals, cooldowns).
 */
interface Clock {
    fun currentTimeMillis(): Long
}

/**
 * Default production implementation that delegates to [System.currentTimeMillis].
 */
object SystemClock : Clock {
    override fun currentTimeMillis(): Long = System.currentTimeMillis()
}

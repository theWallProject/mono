package com.thewallboycott.android.testutil

import com.thewallboycott.android.data.Clock

/**
 * Controllable clock for deterministic time-dependent tests.
 * Starts at [initialTimeMillis] and can be advanced manually.
 */
class TestClock(initialTimeMillis: Long = 0L) : Clock {

    var timeMillis: Long = initialTimeMillis
        private set

    override fun currentTimeMillis(): Long = timeMillis

    /** Advance time by [millis] milliseconds. */
    fun advanceBy(millis: Long) {
        require(millis >= 0) { "Cannot advance by negative time" }
        timeMillis += millis
    }

    /** Set time to an absolute value. */
    fun setTime(millis: Long) {
        timeMillis = millis
    }
}

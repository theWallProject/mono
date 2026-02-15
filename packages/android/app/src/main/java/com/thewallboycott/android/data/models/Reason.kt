package com.thewallboycott.android.data.models

import androidx.annotation.StringRes

data class Reason(
    @param:StringRes val messageResId: Int,
    val level: ReasonLevel
)

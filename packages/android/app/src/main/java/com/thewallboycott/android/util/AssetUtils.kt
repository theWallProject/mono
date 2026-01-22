package com.thewallboycott.android.util

import android.content.res.AssetManager

fun readFile(assetManager: AssetManager, fileName: String): String =
    assetManager.open(fileName).bufferedReader().use { it.readText() }

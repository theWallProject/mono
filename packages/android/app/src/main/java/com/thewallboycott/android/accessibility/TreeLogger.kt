package com.thewallboycott.android.accessibility

import android.graphics.Rect
import android.util.Log
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Utility for logging accessibility node trees for debugging and analysis.
 * 
 * Output format:
 * ```
 * [depth] className | viewId | text | contentDescription | clickable | bounds | isEditable
 * ```
 * 
 * Example:
 * ```
 * [0] FrameLayout | null | null | null | false | [0,0][1080,2400] | false
 * [1] LinearLayout | com.linkedin:id/root_container | null | null | true | [0,0][1080,2400] | false
 * [2] TextView | com.linkedin:id/post_actor | Google | Post by Google | true | [50,150][500,200] | false
 * ```
 */
object TreeLogger {
    private const val TAG = "LinkedInTree"
    
    /**
     * Maximum depth to traverse to prevent infinite loops.
     */
    private const val DEFAULT_MAX_DEPTH = 30
    
    /**
     * Dump entire tree as list of formatted lines.
     */
    fun dump(node: AccessibilityNodeInfo, maxDepth: Int = DEFAULT_MAX_DEPTH): List<String> {
        val lines = mutableListOf<String>()
        dumpNode(node, 0, maxDepth, lines)
        return lines
    }
    
    /**
     * Dump tree and log to Logcat.
     */
    fun log(node: AccessibilityNodeInfo, maxDepth: Int = DEFAULT_MAX_DEPTH) {
        Log.i(TAG, "=== ACCESSIBILITY TREE DUMP START ===")
        Log.i(TAG, "Package: ${node.packageName}")
        Log.i(TAG, "Window: ${node.windowId}")
        Log.i(TAG, "Root class: ${node.className}")
        Log.i(TAG, "---")
        
        dump(node, maxDepth).forEach { line ->
            Log.v(TAG, line)
        }
        
        Log.i(TAG, "=== ACCESSIBILITY TREE DUMP END ===")
    }
    
    /**
     * Log tree summary (counts and key findings).
     */
    fun logSummary(node: AccessibilityNodeInfo) {
        val stats = computeStats(node)
        Log.i(TAG, "=== TREE SUMMARY ===")
        Log.i(TAG, "Total nodes: ${stats.totalNodes}")
        Log.i(TAG, "TextViews: ${stats.textViews}")
        Log.i(TAG, "Clickables: ${stats.clickables}")
        Log.i(TAG, "Max depth: ${stats.maxDepth}")
        Log.i(TAG, "Unique texts: ${stats.uniqueTexts.size}")
        Log.i(TAG, "Unique viewIds: ${stats.uniqueViewIds.size}")
        Log.i(TAG, "Unique classNames: ${stats.uniqueClassNames.size}")
        
        if (stats.uniqueViewIds.isNotEmpty()) {
            Log.i(TAG, "--- VIEW IDS ---")
            stats.uniqueViewIds.sorted().forEach { Log.d(TAG, "  $it") }
        }
        
        if (stats.uniqueTexts.isNotEmpty() && stats.uniqueTexts.size <= 50) {
            Log.i(TAG, "--- TEXTS ---")
            stats.uniqueTexts.sorted().forEach { Log.d(TAG, "  $it") }
        }
    }
    
    /**
     * Log unique view IDs found in tree (for identifying LinkedIn's ID patterns).
     */
    fun logViewIds(node: AccessibilityNodeInfo) {
        val viewIds = mutableSetOf<String>()
        traverse(node) { n ->
            n.viewIdResourceName?.let { viewIds.add(it) }
        }
        
        Log.i(TAG, "=== VIEW IDS (${viewIds.size}) ===")
        viewIds.sorted().forEach { Log.d(TAG, "  $it") }
    }
    
    /**
     * Log all text content in tree (for identifying company name patterns).
     */
    fun logTexts(node: AccessibilityNodeInfo) {
        val texts = mutableSetOf<String>()
        traverse(node) { n ->
            n.text?.toString()?.trim()?.takeIf { it.isNotEmpty() }?.let { texts.add(it) }
            n.contentDescription?.toString()?.trim()?.takeIf { it.isNotEmpty() }?.let { texts.add(it) }
        }
        
        Log.i(TAG, "=== TEXT CONTENT (${texts.size}) ===")
        texts.sorted().forEach { Log.d(TAG, "  $it") }
    }
    
    /**
     * Log nodes matching a specific viewId pattern.
     */
    fun logNodesWithViewId(node: AccessibilityNodeInfo, pattern: String) {
        val matches = mutableListOf<String>()
        traverse(node) { n ->
            if (n.viewIdResourceName?.contains(pattern, ignoreCase = true) == true) {
                val text = n.text?.toString() ?: "null"
                val desc = n.contentDescription?.toString() ?: "null"
                val className = n.className?.toString()?.substringAfterLast('.') ?: "unknown"
                matches.add("[${n.viewIdResourceName}] $className | text='$text' | desc='$desc'")
            }
        }
        
        Log.i(TAG, "=== NODES WITH VIEW ID '$pattern' (${matches.size}) ===")
        matches.forEach { Log.d(TAG, "  $it") }
    }
    
    /**
     * Dump node as JSON-like structure for debugging.
     */
    fun toJson(node: AccessibilityNodeInfo, indent: Int = 0): String {
        val sb = StringBuilder()
        val pad = "  ".repeat(indent)
        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        
        sb.append("$pad{\n")
        sb.append("$pad  \"className\": \"${node.className}\",\n")
        sb.append("$pad  \"viewId\": \"${node.viewIdResourceName}\",\n")
        sb.append("$pad  \"text\": \"${escapeJson(node.text?.toString())}\",\n")
        sb.append("$pad  \"contentDescription\": \"${escapeJson(node.contentDescription?.toString())}\",\n")
        sb.append("$pad  \"clickable\": ${node.isClickable},\n")
        sb.append("$pad  \"enabled\": ${node.isEnabled},\n")
        sb.append("$pad  \"scrollable\": ${node.isScrollable},\n")
        sb.append("$pad  \"bounds\": \"${bounds}\",\n")
        sb.append("$pad  \"childCount\": ${node.childCount},\n")
        sb.append("$pad  \"children\": [\n")
        
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                sb.append(toJson(child, indent + 2))
                if (i < node.childCount - 1) sb.append(",")
                sb.append("\n")
            }
        }
        
        sb.append("$pad  ]\n")
        sb.append("$pad}")
        
        return sb.toString()
    }
    
    // ========== Private helpers ==========
    
    private fun dumpNode(node: AccessibilityNodeInfo, depth: Int, maxDepth: Int, lines: MutableList<String>) {
        if (depth > maxDepth) {
            lines.add("[${depth}] ${"MAX_DEPTH_REACHED"}")
            return
        }
        
        val indent = "  ".repeat(depth)
        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        
        val className = node.className?.toString()?.substringAfterLast('.') ?: "null"
        val viewId = node.viewIdResourceName?.substringAfterLast(':') ?: "null"
        val text = escapeString(node.text?.toString())
        val contentDesc = escapeString(node.contentDescription?.toString())
        val clickable = if (node.isClickable) "C" else "-"
        val scrollable = if (node.isScrollable) "S" else "-"
        val editable = if (node.isEditable) "E" else "-"
        val focusable = if (node.isFocusable) "F" else "-"
        
        val line = "[${depth}]${indent}${className} | ${viewId} | '${text}' | '${contentDesc}' | ${clickable}${scrollable}${editable}${focusable} | ${bounds}"
        lines.add(line)
        
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                dumpNode(child, depth + 1, maxDepth, lines)
            }
        }
    }
    
    private fun traverse(node: AccessibilityNodeInfo, action: (AccessibilityNodeInfo) -> Unit) {
        action(node)
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { traverse(it, action) }
        }
    }
    
    private fun escapeString(s: String?): String {
        if (s == null) return ""
        return s
            .replace("\n", "\\n")
            .replace("\t", "\\t")
            .take(100) // Truncate long strings
    }
    
    private fun escapeJson(s: String?): String {
        if (s == null) return ""
        return s
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\t", "\\t")
    }
    
    /**
     * Compute statistics about the tree.
     */
    fun computeStats(node: AccessibilityNodeInfo): TreeStats {
        var totalNodes = 0
        var textViews = 0
        var clickables = 0
        var maxDepth = 0
        val uniqueTexts = mutableSetOf<String>()
        val uniqueViewIds = mutableSetOf<String>()
        val uniqueClassNames = mutableSetOf<String>()
        
        fun traverse(current: AccessibilityNodeInfo, depth: Int) {
            totalNodes++
            maxDepth = maxOf(maxDepth, depth)
            
            if (current.className?.contains("TextView") == true) textViews++
            if (current.isClickable) clickables++
            
            current.text?.toString()?.takeIf { it.isNotBlank() }?.let { uniqueTexts.add(it) }
            current.contentDescription?.toString()?.takeIf { it.isNotBlank() }?.let { uniqueTexts.add(it) }
            current.viewIdResourceName?.let { uniqueViewIds.add(it) }
            current.className?.toString()?.let { uniqueClassNames.add(it) }
            
            for (i in 0 until current.childCount) {
                current.getChild(i)?.let { traverse(it, depth + 1) }
            }
        }
        
        traverse(node, 0)
        
        return TreeStats(
            totalNodes = totalNodes,
            textViews = textViews,
            clickables = clickables,
            maxDepth = maxDepth,
            uniqueTexts = uniqueTexts,
            uniqueViewIds = uniqueViewIds,
            uniqueClassNames = uniqueClassNames
        )
    }
    
    data class TreeStats(
        val totalNodes: Int,
        val textViews: Int,
        val clickables: Int,
        val maxDepth: Int,
        val uniqueTexts: Set<String>,
        val uniqueViewIds: Set<String>,
        val uniqueClassNames: Set<String>
    )
}
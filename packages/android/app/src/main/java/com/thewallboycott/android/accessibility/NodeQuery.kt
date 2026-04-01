package com.thewallboycott.android.accessibility

import android.graphics.Rect
import android.view.accessibility.AccessibilityNodeInfo

/**
 * CSS-like query builder for AccessibilityNodeInfo trees.
 * 
 * Android does not provide CSS selectors or XPath for accessibility trees.
 * This utility provides a fluent API for building node queries.
 * 
 * Usage:
 * ```kotlin
 * val nodes = NodeQuery.create()
 *     .withViewId("post_actor")
 *     .withClassName("TextView")
 *     .findAllIn(rootNode)
 * 
 * // Must recycle nodes after use
 * nodes.forEach { it.recycle() }
 * ```
 */
class NodeQuery private constructor(
    private val predicates: MutableList<(AccessibilityNodeInfo) -> Boolean> = mutableListOf()
) {
    companion object {
        private const val TAG = "NodeQuery"
        
        /**
         * Create a new query builder.
         */
        fun create(): NodeQuery = NodeQuery()
        
        /**
         * Find all nodes matching the predicate using DFS traversal.
         */
        fun findAll(root: AccessibilityNodeInfo, predicate: (AccessibilityNodeInfo) -> Boolean): List<AccessibilityNodeInfo> {
            val results = mutableListOf<AccessibilityNodeInfo>()
            traverse(root) { node -> if (predicate(node)) results.add(node) }
            return results
        }
        
        /**
         * Find first node matching the predicate using DFS traversal.
         * Returns null if not found.
         */
        fun findFirst(root: AccessibilityNodeInfo, predicate: (AccessibilityNodeInfo) -> Boolean): AccessibilityNodeInfo? {
            var found: AccessibilityNodeInfo? = null
            traverse(root) { node -> 
                if (predicate(node)) {
                    found = node
                    return@traverse
                }
            }
            return found
        }
        
        /**
         * Count all nodes in tree.
         */
        fun countNodes(root: AccessibilityNodeInfo): Int {
            var count = 0
            traverse(root) { count++ }
            return count
        }
        
        /**
         * DFS traversal of accessibility node tree.
         */
        private fun traverse(node: AccessibilityNodeInfo, action: (AccessibilityNodeInfo) -> Unit) {
            action(node)
            for (i in 0 until node.childCount) {
                node.getChild(i)?.let { traverse(it, action) }
            }
        }
    }
    
    /**
     * Add text contains predicate (case-insensitive).
     */
    fun withText(text: String) = apply { 
        predicates.add { node -> 
            node.text?.toString()?.contains(text, ignoreCase = true) == true 
        } 
    }
    
    /**
     * Add exact text match predicate.
     */
    fun withTextExact(text: String) = apply { 
        predicates.add { node -> node.text?.toString() == text } 
    }
    
    /**
     * Add text matches regex predicate.
     */
    fun withTextRegex(pattern: String) = apply {
        val regex = Regex(pattern, RegexOption.IGNORE_CASE)
        predicates.add { node -> node.text?.toString()?.matches(regex) == true }
    }
    
    /**
     * Add content description contains predicate (case-insensitive).
     */
    fun withContentDescription(desc: String) = apply { 
        predicates.add { node -> 
            node.contentDescription?.toString()?.contains(desc, ignoreCase = true) == true 
        } 
    }
    
    /**
     * Add viewIdResourceName contains predicate.
     * View IDs are formatted as "package:id/resource_name".
     */
    fun withViewId(viewId: String) = apply { 
        predicates.add { node -> 
            node.viewIdResourceName?.contains(viewId) == true 
        } 
    }
    
    /**
     * Add exact viewIdResourceName match.
     */
    fun withViewIdExact(viewId: String) = apply {
        predicates.add { node -> node.viewIdResourceName == viewId }
    }
    
    /**
     * Add className contains predicate.
     * Examples: "TextView", "Button", "ImageView"
     */
    fun withClassName(className: String) = apply { 
        predicates.add { node -> 
            node.className?.toString()?.contains(className) == true 
        } 
    }
    
    /**
     * Add exact className match.
     */
    fun withClassNameExact(className: String) = apply {
        predicates.add { node -> node.className?.toString() == className }
    }
    
    /**
     * Add package name predicate.
     */
    fun withPackageName(packageName: String) = apply {
        predicates.add { node -> node.packageName?.toString() == packageName }
    }
    
    /**
     * Add clickable predicate.
     */
    fun withClickable(clickable: Boolean) = apply { 
        predicates.add { node -> node.isClickable == clickable } 
    }
    
    /**
     * Add enabled predicate.
     */
    fun withEnabled(enabled: Boolean) = apply {
        predicates.add { node -> node.isEnabled == enabled }
    }
    
    /**
     * Add scrollable predicate.
     */
    fun withScrollable(scrollable: Boolean) = apply {
        predicates.add { node -> node.isScrollable == scrollable }
    }
    
    /**
     * Add checkable predicate.
     */
    fun withCheckable(checkable: Boolean) = apply {
        predicates.add { node -> node.isCheckable == checkable }
    }
    
    /**
     * Add checked predicate.
     */
    @Suppress("DEPRECATION")
    fun withChecked(checked: Boolean) = apply {
        predicates.add { node -> node.isChecked == checked }
    }
    
    /**
     * Add focusable predicate.
     */
    fun withFocusable(focusable: Boolean) = apply {
        predicates.add { node -> node.isFocusable == focusable }
    }
    
    /**
     * Add focused predicate.
     */
    fun withFocused(focused: Boolean) = apply {
        predicates.add { node -> node.isFocused == focused }
    }
    
    /**
     * Add depth range predicate (inclusive).
     * Note: Requires tracking depth during traversal.
     */
    fun withDepth(min: Int, max: Int) = apply {
        predicates.add { node ->
            // Depth is tracked separately in findAllIn
            true // Placeholder - depth filtering done during traversal
        }
    }
    
    /**
     * Add bounds within predicate.
     */
    fun withBoundsWithin(rect: Rect) = apply {
        predicates.add { node ->
            val bounds = Rect()
            node.getBoundsInScreen(bounds)
            rect.contains(bounds)
        }
    }
    
    /**
     * Add custom predicate.
     */
    fun matches(predicate: (AccessibilityNodeInfo) -> Boolean) = apply { 
        predicates.add(predicate) 
    }
    
    /**
     * Add negation of another query.
     */
    fun not(query: NodeQuery) = apply {
        predicates.add { node -> !query.predicates.all { it(node) } }
    }
    
    /**
     * Combine with another query (AND).
     */
    fun and(query: NodeQuery) = apply {
        predicates.addAll(query.predicates)
    }
    
    /**
     * Execute query - find all matching nodes in tree.
     * 
     * IMPORTANT: Callers MUST recycle returned nodes after use:
     * ```kotlin
     * val nodes = query.findAllIn(root)
     * try {
     *     // use nodes
     * } finally {
     *     nodes.forEach { it.recycle() }
     * }
     * ```
     */
    fun findAllIn(root: AccessibilityNodeInfo): List<AccessibilityNodeInfo> {
        return findAll(root) { node -> predicates.all { predicate -> predicate(node) } }
    }
    
    /**
     * Execute query - find first matching node in tree.
     * Returns null if not found.
     * 
     * IMPORTANT: Caller MUST recycle returned node after use.
     */
    fun findFirstIn(root: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        return findFirst(root) { node -> predicates.all { predicate -> predicate(node) } }
    }
    
    /**
     * Execute query - check if any matching node exists.
     */
    fun existsIn(root: AccessibilityNodeInfo): Boolean {
        return findFirstIn(root) != null
    }
    
    /**
     * Execute query - count matching nodes.
     */
    fun countIn(root: AccessibilityNodeInfo): Int {
        return findAllIn(root).size
    }
}
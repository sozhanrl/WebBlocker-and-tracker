package com.openfocus.app.service.accessibility

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.openfocus.app.manager.BlockingStateManager
import com.openfocus.app.manager.LockdownManager
import com.openfocus.app.receiver.LockdownReceiver
import com.openfocus.app.ui.screens.blockscreen.BlockScreenActivity
import com.openfocus.app.ui.screens.blockscreen.WebsiteBlockedActivity

/**
 * OpenFocusAccessibilityService
 *
 * Real Android Accessibility Service for NEET Tracker / FocusForge:
 * 1. Monitors foreground applications to enforce study blocklists.
 * 2. Inspects Browser URL bars (Chrome, Brave, Firefox, Edge, Samsung Internet, etc.)
 *    to intercept and block restricted domains (such as asurascans.com) directly in the browser!
 * 3. Enforces the 5-Warning ladder:
 *    - Warnings 1..4: Redirects to Home & displays Warning HUD block screen.
 *    - Warning 5: Triggers 5-minute study lockout (Device Admin lockNow() + 5-minute countdown).
 *    - Continued attempts: Escalates to 30-minute study lockout (Device Admin lockNow() + 30-minute countdown).
 *
 * PRIVACY: Reads only foreground package names and browser address bar URLs to enforce user block rules.
 * Never inspects or transmits keystrokes, passwords, private chats, or message contents.
 */
class OpenFocusAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "FocusAccessibility"

        @Volatile
        var isServiceRunning: Boolean = false
            private set

        private val BROWSER_PACKAGES = setOf(
            "com.brave.browser",
            "com.brave.browser_nightly",
            "com.brave.browser_beta",
            "com.android.chrome",
            "com.chrome.beta",
            "com.chrome.canary",
            "com.chrome.dev",
            "org.mozilla.firefox",
            "org.mozilla.firefox_beta",
            "org.mozilla.fenix",
            "com.sec.android.app.sbrowser",
            "com.sec.android.app.sbrowser.beta",
            "com.microsoft.emmx",
            "com.opera.browser",
            "com.opera.mini.native",
            "com.opera.touch",
            "com.opera.gx",
            "com.duckduckgo.mobile.android",
            "com.vivaldi.browser",
            "com.kiwibrowser.browser",
            "com.ucmobile.intl",
            "com.UCMobile.intl",
            "com.mi.globalbrowser",
            "com.android.browser"
        )
    }

    private lateinit var stateManager: BlockingStateManager
    private var lockdownReceiver: LockdownReceiver? = null
    private var routineReceiver: com.openfocus.app.receiver.RoutineNotificationReceiver? = null
    private var lastInterceptTimeMs = 0L
    private var lastInterceptTarget: String? = null

    override fun onCreate() {
        super.onCreate()
        isServiceRunning = true
        stateManager = BlockingStateManager.getInstance(this)
        registerLockdownBroadcastReceiver()
        registerRoutineBroadcastReceiver()
        com.openfocus.app.manager.RoutineNotificationManager.updateNotification(this)
        Log.i(TAG, "OpenFocusAccessibilityService created and active")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isServiceRunning = true
        stateManager = BlockingStateManager.getInstance(this)
        registerLockdownBroadcastReceiver()
        registerRoutineBroadcastReceiver()
        com.openfocus.app.manager.RoutineNotificationManager.updateNotification(this)
        Log.i(TAG, "Accessibility Service successfully connected to Android OS")
    }

    private fun registerLockdownBroadcastReceiver() {
        if (lockdownReceiver == null) {
            try {
                lockdownReceiver = LockdownReceiver()
                val filter = IntentFilter().apply {
                    addAction(Intent.ACTION_SCREEN_ON)
                    addAction(Intent.ACTION_USER_PRESENT)
                }
                registerReceiver(lockdownReceiver, filter)
                Log.i(TAG, "LockdownReceiver registered for SCREEN_ON & USER_PRESENT")
            } catch (e: Exception) {
                Log.e(TAG, "Error registering LockdownReceiver: ${e.message}")
            }
        }
    }

    private fun registerRoutineBroadcastReceiver() {
        if (routineReceiver == null) {
            try {
                routineReceiver = com.openfocus.app.receiver.RoutineNotificationReceiver()
                val filter = IntentFilter().apply {
                    addAction(Intent.ACTION_TIME_TICK)
                    addAction(Intent.ACTION_TIME_CHANGED)
                    addAction(Intent.ACTION_TIMEZONE_CHANGED)
                }
                registerReceiver(routineReceiver, filter)
                Log.i(TAG, "RoutineNotificationReceiver registered for TIME_TICK")
            } catch (e: Exception) {
                Log.e(TAG, "Error registering RoutineNotificationReceiver: ${e.message}")
            }
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val eventType = event.eventType
        if (eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED &&
            eventType != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
            return
        }

        val packageName = event.packageName?.toString() ?: return

        // Ignore own app, system UI, launchers, input methods, and Android settings
        val myPackage = applicationContext.packageName
        if (packageName == myPackage ||
            packageName == "com.android.systemui" ||
            packageName == "com.android.settings" ||
            packageName.contains("inputmethod", ignoreCase = true) ||
            packageName.contains("keyboard", ignoreCase = true) ||
            packageName.contains("launcher", ignoreCase = true) ||
            packageName.contains("quickstep", ignoreCase = true)
        ) {
            return
        }

        // 1. Check if an active lockout (5 or 30 minutes) is currently in effect
        if (LockdownManager.isLockdownActive(this)) {
            val isAppBlocked = stateManager.isAppBlocked(packageName)
            val isBrowser = isBrowserPackage(packageName)

            if (isAppBlocked) {
                LockdownManager.enforceLockdownIfActive(this)
                return
            }

            if (isBrowser) {
                val currentUrl = extractUrlFromActiveWindow(packageName)
                if (!currentUrl.isNullOrBlank()) {
                    val domain = normalizeDomain(currentUrl)
                    if (stateManager.isDomainBlocked(domain)) {
                        LockdownManager.enforceLockdownIfActive(this)
                        return
                    }
                }
            }
            return
        }

        // 2. Verify if focus session / global blocking is active
        if (!stateManager.isBlockingEnforced()) {
            return
        }

        // 3. Check for Blocked Application
        if (stateManager.isAppBlocked(packageName)) {
            handleBlockedApp(packageName)
            return
        }

        // 4. Check for Blocked Website in Browser (Brave, Chrome, etc.)
        if (isBrowserPackage(packageName)) {
            val url = extractUrlFromActiveWindow(packageName)
            if (!url.isNullOrBlank()) {
                val normalizedDomain = normalizeDomain(url)
                val isBlocked = stateManager.isDomainBlocked(normalizedDomain) ||
                    (stateManager.isAdultContentBlockingEnabled() && stateManager.isAdultDomainOrUrl(url))
                if (isBlocked) {
                    handleBlockedWebsite(normalizedDomain, packageName)
                }
            }
        }
    }

    private fun isBrowserPackage(pkg: String): Boolean {
        if (BROWSER_PACKAGES.contains(pkg)) return true
        val lower = pkg.lowercase()
        return lower.contains("browser") || lower.contains("chrome") || lower.contains("firefox")
    }

    private fun extractUrlFromActiveWindow(packageName: String): String? {
        val rootNode = try {
            rootInActiveWindow
        } catch (e: Exception) {
            null
        } ?: return null

        try {
            // Target the actual primary browser address bar view IDs
            val candidateIds = when {
                packageName.contains("brave") -> listOf("com.brave.browser:id/url_bar", "url_bar")
                packageName.contains("chrome") -> listOf("com.android.chrome:id/url_bar", "url_bar")
                packageName.contains("emmx") -> listOf("com.microsoft.emmx:id/url_bar", "url_bar")
                packageName.contains("firefox") -> listOf("org.mozilla.firefox:id/toolbar", "org.mozilla.firefox:id/url_bar_title", "url_bar_title")
                packageName.contains("sbrowser") -> listOf("com.sec.android.app.sbrowser:id/location_bar_edit_text", "location_bar_edit_text")
                packageName.contains("opera") -> listOf("com.opera.browser:id/url_field", "url_field")
                else -> listOf("url_bar", "location_bar_edit_text", "location_bar", "url_field", "address_bar")
            }

            for (id in candidateIds) {
                val nodes = rootNode.findAccessibilityNodeInfosByViewId(id)
                if (!nodes.isNullOrEmpty()) {
                    for (node in nodes) {
                        if (!node.isVisibleToUser) continue
                        val resName = node.viewIdResourceName?.lowercase() ?: ""
                        // Strictly reject shortcut tiles, most visited tiles, history suggestions, or tab switchers
                        if (resName.contains("tile") ||
                            resName.contains("most_visited") ||
                            resName.contains("suggestion") ||
                            resName.contains("tab_switcher") ||
                            resName.contains("tab_strip")
                        ) {
                            continue
                        }

                        val rawText = (node.text?.toString() ?: node.contentDescription?.toString())?.trim()
                        if (isValidBrowserAddressBarUrl(rawText)) {
                            return rawText
                        }
                    }
                }
            }

            // Safe fallback: ONLY find an EditText specifically functioning as the address bar
            return findAddressBarEditText(rootNode, 0)
        } catch (e: Exception) {
            Log.d(TAG, "Note during URL extraction: ${e.message}")
            return null
        }
    }

    private fun isValidBrowserAddressBarUrl(rawText: String?): Boolean {
        if (rawText.isNullOrBlank()) return false
        val lower = rawText.trim().lowercase()

        // Ignore internal browser pages and NTP (New Tab Page)
        if (lower.startsWith("chrome://") ||
            lower.startsWith("chrome-native://") ||
            lower.startsWith("brave://") ||
            lower.startsWith("about:") ||
            lower.startsWith("content://") ||
            lower.startsWith("file://")
        ) {
            return false
        }

        // Ignore placeholder search hints on New Tab Page / empty address bars
        if (lower.startsWith("search or type") ||
            lower.startsWith("type a url") ||
            lower.startsWith("search or enter") ||
            lower == "search" ||
            lower == "new tab" ||
            lower == "home"
        ) {
            return false
        }

        // A valid website address must contain a dot and no spaces
        if (!lower.contains(".") || lower.contains(" ")) {
            return false
        }

        return true
    }

    private fun findAddressBarEditText(node: AccessibilityNodeInfo?, depth: Int): String? {
        if (node == null || depth > 4) return null

        val resName = node.viewIdResourceName?.lowercase() ?: ""
        // Strictly exclude non-address-bar elements
        if (resName.contains("tile") ||
            resName.contains("most_visited") ||
            resName.contains("suggestion") ||
            resName.contains("tab_strip") ||
            resName.contains("tab_switcher")
        ) {
            return null
        }

        if (node.className == "android.widget.EditText" && node.isVisibleToUser) {
            if (resName.contains("url_bar") || resName.contains("location_bar") || resName.contains("address")) {
                val text = node.text?.toString()?.trim()
                if (isValidBrowserAddressBarUrl(text)) {
                    return text
                }
            }
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val found = findAddressBarEditText(child, depth + 1)
            if (found != null) return found
        }
        return null
    }

    private fun normalizeDomain(rawUrl: String): String {
        var clean = rawUrl.trim().lowercase()
        clean = clean.replace("https://", "").replace("http://", "")
        clean = clean.split("/")[0]
        clean = clean.split("?")[0]
        clean = clean.split("#")[0]
        clean = clean.split(":")[0]
        if (clean.startsWith("www.")) clean = clean.substring(4)
        if (clean.startsWith("m.")) clean = clean.substring(2)
        if (clean.startsWith("amp.")) clean = clean.substring(4)
        return clean.trim()
    }

    private fun handleBlockedApp(packageName: String) {
        val now = System.currentTimeMillis()
        if (packageName == lastInterceptTarget && (now - lastInterceptTimeMs) < 1500L) {
            return
        }

        lastInterceptTimeMs = now
        lastInterceptTarget = packageName

        val appName = try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }

        Log.w(TAG, "🛑 BLOCKED APP DETECTED: $appName ($packageName)")

        // Record violation with 5-warning / 5-min / 30-min ladder
        val result = LockdownManager.recordAttempt(this, packageName, "app", appName)

        if (result.isLockdown) {
            Log.w(TAG, "Lockdown triggered for app $packageName (Stage ${result.stage})")
            return
        }

        // Launch BlockScreenActivity directly over the blocked app with mascot HUD
        val blockingStatus = stateManager.getBlockingStatus()
        val intent = Intent(this, BlockScreenActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            putExtra(BlockScreenActivity.EXTRA_TARGET_ID, packageName)
            putExtra(BlockScreenActivity.EXTRA_TARGET_NAME, appName)
            putExtra(BlockScreenActivity.EXTRA_TARGET_TYPE, "app")
            putExtra(BlockScreenActivity.EXTRA_STRIKE_COUNT, result.strikeCount)
            putExtra(BlockScreenActivity.EXTRA_WARNING_NUMBER, result.strikeCount)
            putExtra(BlockScreenActivity.EXTRA_MAX_WARNINGS, 5)
            putExtra(BlockScreenActivity.EXTRA_TODAY_COUNT, result.todayBlockCount)
            putExtra(BlockScreenActivity.EXTRA_ACTIVE_SUBJECT, blockingStatus.activeSubject)
        }
        startActivity(intent)
    }

    private fun handleBlockedWebsite(domain: String, browserPackage: String) {
        val now = System.currentTimeMillis()
        if (domain == lastInterceptTarget && (now - lastInterceptTimeMs) < 5000L) {
            return
        }

        lastInterceptTimeMs = now
        lastInterceptTarget = domain

        Log.w(TAG, "🛑 BLOCKED WEBSITE DETECTED in browser ($browserPackage): '$domain'")

        // Navigate browser away from blocked URL directly to native Home / New Tab start page (Images 1 & 2)
        returnBrowserToStartPage(browserPackage)

        // Record violation with 5-warning / 5-min / 30-min ladder
        val result = LockdownManager.recordAttempt(this, domain, "website", domain)

        if (result.isLockdown) {
            Log.w(TAG, "Lockdown triggered for domain $domain (Stage ${result.stage})")
            return
        }

        val category = if (stateManager.isAdultDomainOrUrl(domain)) {
            "18+ Adult & Hentai Content"
        } else {
            "Restricted Website"
        }

        // Launch WebsiteBlockedActivity directly over browser with mascot HUD
        val intent = Intent(this, WebsiteBlockedActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            putExtra(WebsiteBlockedActivity.EXTRA_DOMAIN, domain)
            putExtra(WebsiteBlockedActivity.EXTRA_STRIKE_COUNT, result.strikeCount)
            putExtra(WebsiteBlockedActivity.EXTRA_TODAY_COUNT, result.todayBlockCount)
            putExtra(WebsiteBlockedActivity.EXTRA_CATEGORY, category)
            putExtra(WebsiteBlockedActivity.EXTRA_BROWSER_PACKAGE, browserPackage)
        }
        startActivity(intent)
    }

    /**
     * Navigates the browser away from the blocked URL directly to its native Home / Start screen
     * (Chrome New Tab Page with Google search & shortcuts, or Brave New Tab Page with privacy stats & wallpaper).
     */
    private fun returnBrowserToStartPage(packageName: String) {
        try {
            val rootNode = rootInActiveWindow
            var navigated = false

            if (rootNode != null) {
                // 1. Look for Home button in Chrome, Brave, Samsung Internet, Edge, etc.
                val homeIds = listOf(
                    "$packageName:id/home_button",
                    "home_button",
                    "$packageName:id/toolbar_home_button",
                    "toolbar_home_button"
                )
                for (id in homeIds) {
                    val nodes = rootNode.findAccessibilityNodeInfosByViewId(id)
                    if (!nodes.isNullOrEmpty()) {
                        for (node in nodes) {
                            if (node.isClickable && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
                                Log.i(TAG, "Navigated $packageName to Start Page via Home button ($id)")
                                navigated = true
                                break
                            }
                        }
                    }
                    if (navigated) break
                }

                // 2. If Home button not found by ID, look for contentDescription containing "Home"
                if (!navigated) {
                    val homeDescNodes = rootNode.findAccessibilityNodeInfosByText("Home")
                    if (!homeDescNodes.isNullOrEmpty()) {
                        for (node in homeDescNodes) {
                            if (node.isClickable && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
                                Log.i(TAG, "Navigated $packageName to Start Page via text/description 'Home'")
                                navigated = true
                                break
                            }
                        }
                    }
                }
            }

            // 3. Fallback: Perform Global Action Back to pop off the blocked URL back to New Tab / Start page
            if (!navigated) {
                performGlobalAction(GLOBAL_ACTION_BACK)
                Log.i(TAG, "Navigated $packageName to Start Page via GLOBAL_ACTION_BACK")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error returning browser to start page: ${e.message}")
            try {
                performGlobalAction(GLOBAL_ACTION_BACK)
            } catch (_: Exception) {}
        }
    }

    override fun onInterrupt() {
        Log.i(TAG, "OpenFocusAccessibilityService interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
        if (lockdownReceiver != null) {
            try {
                unregisterReceiver(lockdownReceiver)
            } catch (_: Exception) {}
            lockdownReceiver = null
        }
        if (routineReceiver != null) {
            try {
                unregisterReceiver(routineReceiver)
            } catch (_: Exception) {}
            routineReceiver = null
        }
        Log.i(TAG, "OpenFocusAccessibilityService destroyed")
    }
}

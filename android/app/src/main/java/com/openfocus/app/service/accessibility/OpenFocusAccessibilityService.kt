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
    private var lastInterceptTimeMs = 0L
    private var lastInterceptTarget: String? = null

    override fun onCreate() {
        super.onCreate()
        isServiceRunning = true
        stateManager = BlockingStateManager.getInstance(this)
        registerLockdownBroadcastReceiver()
        Log.i(TAG, "OpenFocusAccessibilityService created and active")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isServiceRunning = true
        stateManager = BlockingStateManager.getInstance(this)
        registerLockdownBroadcastReceiver()
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
            // First search known browser address bar view IDs
            val candidateIds = when {
                packageName.contains("brave") -> listOf("com.brave.browser:id/url_bar", "url_bar")
                packageName.contains("chrome") -> listOf("com.android.chrome:id/url_bar", "url_bar")
                packageName.contains("emmx") -> listOf("com.microsoft.emmx:id/url_bar", "url_bar")
                packageName.contains("firefox") -> listOf("org.mozilla.firefox:id/toolbar", "org.mozilla.firefox:id/url_bar_title", "url_bar_title")
                packageName.contains("sbrowser") -> listOf("com.sec.android.app.sbrowser:id/location_bar_edit_text", "location_bar_edit_text")
                packageName.contains("opera") -> listOf("com.opera.browser:id/url_field", "url_field")
                else -> listOf("url_bar", "location_bar", "address_bar", "search_box")
            }

            for (id in candidateIds) {
                val nodes = rootNode.findAccessibilityNodeInfosByViewId(id)
                if (!nodes.isNullOrEmpty()) {
                    for (node in nodes) {
                        val text = node.text?.toString()
                        if (!text.isNullOrBlank() && text.contains(".")) {
                            return text
                        }
                    }
                }
            }

            // Fallback: search for EditText or nodes containing a dot
            return findUrlRecursively(rootNode, 0)
        } catch (e: Exception) {
            Log.d(TAG, "Note during URL extraction: ${e.message}")
            return null
        }
    }

    private fun findUrlRecursively(node: AccessibilityNodeInfo?, depth: Int): String? {
        if (node == null || depth > 8) return null

        val text = node.text?.toString()
        if (!text.isNullOrBlank()) {
            val lower = text.trim().lowercase()
            if ((node.className == "android.widget.EditText" || node.viewIdResourceName?.contains("url", ignoreCase = true) == true) &&
                lower.contains(".") && !lower.contains(" ") && !lower.startsWith("search")
            ) {
                return text
            }
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val found = findUrlRecursively(child, depth + 1)
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
        if (domain == lastInterceptTarget && (now - lastInterceptTimeMs) < 2000L) {
            return
        }

        lastInterceptTimeMs = now
        lastInterceptTarget = domain

        Log.w(TAG, "🛑 BLOCKED WEBSITE DETECTED in browser ($browserPackage): '$domain'")

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
        }
        startActivity(intent)
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
        Log.i(TAG, "OpenFocusAccessibilityService destroyed")
    }
}

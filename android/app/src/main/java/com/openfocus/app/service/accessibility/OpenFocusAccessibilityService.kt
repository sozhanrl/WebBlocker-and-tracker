package com.openfocus.app.service.accessibility

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.openfocus.app.manager.BlockingStateManager
import com.openfocus.app.manager.LockdownManager
import com.openfocus.app.receiver.LockdownReceiver
import com.openfocus.app.ui.screens.blockscreen.BlockScreenActivity

/**
 * OpenFocusAccessibilityService
 *
 * Real foreground-app detection service for NEET Tracker / FocusForge.
 *
 * PRIVACY GUARANTEE:
 * - Reads ONLY the foreground package name on window state change.
 * - NEVER reads keystrokes, passwords, private chats, messages, photos, or window text.
 * - All blocking rules and warning counters are processed 100% locally on-device.
 */
class OpenFocusAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "FocusAccessibility"

        @Volatile
        var isServiceRunning: Boolean = false
            private set
    }

    private lateinit var stateManager: BlockingStateManager
    private var lockdownReceiver: LockdownReceiver? = null
    private var lastBlockedTimeMs = 0L
    private var lastInterceptedPackage: String? = null

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
                Log.i(TAG, "LockdownReceiver registered dynamically for SCREEN_ON & USER_PRESENT")
            } catch (e: Exception) {
                Log.e(TAG, "Error registering LockdownReceiver: ${e.message}")
            }
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }

        // Extract strictly the foreground package name only
        val packageName = event.packageName?.toString() ?: return

        // Ignore our own app, system UI, launchers, input methods, and settings
        val myPackage = applicationContext.packageName
        if (packageName == myPackage ||
            packageName == "com.android.systemui" ||
            packageName == "com.google.android.inputmethod.latin" ||
            packageName == "com.sec.android.inputmethod" ||
            packageName == "com.samsung.android.honeyboard" ||
            packageName.contains("launcher", ignoreCase = true) ||
            packageName.contains("quickstep", ignoreCase = true) ||
            packageName.contains("systemui", ignoreCase = true) ||
            packageName == "com.android.settings") {
            return
        }

        // Check if an active 5-Minute Focus Lockout is currently enforced
        val isLockdownActive = LockdownManager.isLockdownActive(this)
        val isAppBlockedInList = stateManager.isAppBlocked(packageName)

        if (isLockdownActive) {
            // During active lockdown, if user tries to open any blocked app, enforce lockout immediately!
            if (isAppBlockedInList) {
                handleLockoutInterception(packageName)
            }
            return
        }

        // Check if blocking is active based on focus session / global blocking state
        if (!stateManager.isBlockingEnforced()) {
            return
        }

        // Check if this package is in the user's blocked apps list
        if (isAppBlockedInList) {
            handleBlockedAppInterception(packageName)
        }
    }

    private fun handleBlockedAppInterception(packageName: String) {
        val now = System.currentTimeMillis()

        // Debounce: prevent launch loops within 1.2 seconds for the same package
        if (packageName == lastInterceptedPackage && (now - lastBlockedTimeMs) < 1200) {
            return
        }

        lastBlockedTimeMs = now
        lastInterceptedPackage = packageName

        val appName = try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }

        // Increment 5-strike violation counter ("violations:<packageName>")
        val strikeCount = LockdownManager.incrementStrikes(this, packageName)
        Log.w(TAG, "🛑 BLOCKED APP INTERCEPTED: $appName ($packageName) -> Strike $strikeCount/5")

        // Step 1: Immediately take user to Home to exit the blocked application
        try {
            performGlobalAction(GLOBAL_ACTION_HOME)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to perform home action: ${e.message}")
        }

        // Step 2: If strike 5 reached, trigger 5-minute Device Admin lockdown!
        if (strikeCount >= 5) {
            LockdownManager.triggerLockdown(this, packageName, "app", appName)
            return
        }

        // Step 3: Otherwise, launch the BlockScreenActivity with Strike details (strikes 1..4)
        val blockingStatus = stateManager.getBlockingStatus()
        val intent = Intent(this, BlockScreenActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            putExtra(BlockScreenActivity.EXTRA_TARGET_ID, packageName)
            putExtra(BlockScreenActivity.EXTRA_TARGET_NAME, appName)
            putExtra(BlockScreenActivity.EXTRA_TARGET_TYPE, "app")
            putExtra(BlockScreenActivity.EXTRA_STRIKE_COUNT, strikeCount)
            putExtra(BlockScreenActivity.EXTRA_WARNING_NUMBER, strikeCount)
            putExtra(BlockScreenActivity.EXTRA_MAX_WARNINGS, 5)
            putExtra(BlockScreenActivity.EXTRA_IS_LOCKOUT, false)
            putExtra(BlockScreenActivity.EXTRA_ACTIVE_SUBJECT, blockingStatus.activeSubject)
        }
        startActivity(intent)
    }

    private fun handleLockoutInterception(packageName: String) {
        val now = System.currentTimeMillis()
        if (packageName == lastInterceptedPackage && (now - lastBlockedTimeMs) < 1200) {
            return
        }

        lastBlockedTimeMs = now
        lastInterceptedPackage = packageName

        val appName = try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }

        try {
            performGlobalAction(GLOBAL_ACTION_HOME)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to perform home action during lockout: ${e.message}")
        }

        LockdownManager.enforceLockdownIfActive(this)
    }

    override fun onInterrupt() {
        Log.w(TAG, "OpenFocusAccessibilityService interrupted")
    }

    override fun onUnbind(intent: Intent?): Boolean {
        isServiceRunning = false
        Log.i(TAG, "OpenFocusAccessibilityService unbound")
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
        if (lockdownReceiver != null) {
            try {
                unregisterReceiver(lockdownReceiver)
                lockdownReceiver = null
            } catch (e: Exception) {
                // Ignore
            }
        }
        Log.i(TAG, "OpenFocusAccessibilityService destroyed")
    }
}

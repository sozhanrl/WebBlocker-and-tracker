package com.openfocus.app.bridge

import android.accessibilityservice.AccessibilityServiceInfo
import android.app.AlarmManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.net.VpnService
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.accessibility.AccessibilityManager
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.app.NotificationManagerCompat
import com.openfocus.app.manager.BatteryOptimizationHelper
import com.openfocus.app.manager.BlockingStateManager
import com.openfocus.app.manager.InstalledAppsManager
import com.openfocus.app.manager.LockdownManager
import com.openfocus.app.manager.UsageStatsTracker
import com.openfocus.app.receiver.FocusDeviceAdminReceiver
import com.openfocus.app.service.accessibility.OpenFocusAccessibilityService
import com.openfocus.app.service.timer.FocusTimerService
import com.openfocus.app.service.vpn.OpenFocusVpnService
import org.json.JSONArray
import org.json.JSONObject

/**
 * AndroidFocusBridge
 *
 * Exposes native Android blocking services, package manager, usage stats,
 * and system settings intents directly to the WebView via @JavascriptInterface.
 */
class AndroidFocusBridge(private val context: Context) {

    companion object {
        private const val TAG = "AndroidFocusBridge"
    }

    private val prefs: SharedPreferences = context.getSharedPreferences("focus_blocker_prefs", Context.MODE_PRIVATE)
    private val stateManager: BlockingStateManager = BlockingStateManager.getInstance(context)
    private val installedAppsManager: InstalledAppsManager = InstalledAppsManager(context)
    private val usageStatsTracker: UsageStatsTracker = UsageStatsTracker(context)
    private val batteryHelper: BatteryOptimizationHelper = BatteryOptimizationHelper(context)
    private val mainHandler = Handler(Looper.getMainLooper())

    @JavascriptInterface
    fun isNative(): String {
        return JSONObject().apply {
            put("isNative", true)
            put("platform", "android")
        }.toString()
    }

    @JavascriptInterface
    fun getInstalledApps(includeSystemApps: Boolean): String {
        return try {
            val apps = installedAppsManager.getInstalledLaunchableApps(includeSystemApps)
            JSONObject().apply { put("apps", apps) }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching installed apps: ${e.message}", e)
            JSONObject().apply { put("apps", JSONArray()) }.toString()
        }
    }

    @JavascriptInterface
    fun getUsageStats(startTimeMs: Long, endTimeMs: Long): String {
        return try {
            val now = System.currentTimeMillis()
            val start = if (startTimeMs > 0) startTimeMs else now - 86400000L
            val end = if (endTimeMs > 0) endTimeMs else now
            val stats = usageStatsTracker.getAppUsageStats(start, end)
            JSONObject().apply { put("stats", stats) }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching usage stats: ${e.message}", e)
            JSONObject().apply { put("stats", JSONArray()) }.toString()
        }
    }

    @JavascriptInterface
    fun updateBlockList(jsonStr: String): String {
        return try {
            val json = JSONObject(jsonStr)
            val blockedPkgs = json.optJSONArray("blockedPackages")
            val blockedDomains = json.optJSONArray("blockedDomains")
            val isStrict = json.optBoolean("isStrict", false)
            val allowEmergency = json.optBoolean("allowEmergencyUnlock", true)
            val activeSubject = json.optString("activeSubject", "NEET 2027 Study")
            val isBlockingActive = json.optBoolean("isBlockingActive", true)

            if (blockedPkgs != null) {
                val pkgSet = HashSet<String>()
                for (i in 0 until blockedPkgs.length()) {
                    val pkg = blockedPkgs.getString(i)
                    if (!pkg.isNullOrBlank()) pkgSet.add(pkg.trim())
                }
                stateManager.updateBlockedApps(pkgSet)
            }

            if (blockedDomains != null) {
                val domainSet = HashSet<String>()
                for (i in 0 until blockedDomains.length()) {
                    val domain = blockedDomains.getString(i)
                    if (!domain.isNullOrBlank()) domainSet.add(domain.trim().lowercase())
                }
                stateManager.updateBlockedDomains(domainSet)
            }

            val isAdultBlockingEnabled = json.optBoolean("isAdultBlockingEnabled", false)
            stateManager.setAdultContentBlockingEnabled(isAdultBlockingEnabled)

            prefs.edit()
                .putBoolean("is_blocking_active", isBlockingActive)
                .putBoolean("is_strict_mode", isStrict)
                .putBoolean("allow_emergency_unlock", allowEmergency)
                .putString("active_subject_name", activeSubject)
                .apply()

            JSONObject().apply { put("success", true) }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update block list: ${e.message}", e)
            JSONObject().apply { put("success", false) }.toString()
        }
    }

    @JavascriptInterface
    fun updateBlockedApps(jsonStr: String): String {
        return try {
            val array = JSONArray(jsonStr)
            val pkgSet = HashSet<String>()
            for (i in 0 until array.length()) {
                val pkg = array.getString(i)
                if (!pkg.isNullOrBlank()) pkgSet.add(pkg.trim())
            }
            stateManager.updateBlockedApps(pkgSet)
            JSONObject().apply { put("success", true) }.toString()
        } catch (e: Exception) {
            JSONObject().apply { put("success", false) }.toString()
        }
    }

    @JavascriptInterface
    fun updateBlockedDomains(jsonStr: String): String {
        return try {
            val array = JSONArray(jsonStr)
            val domainSet = HashSet<String>()
            for (i in 0 until array.length()) {
                val domain = array.getString(i)
                if (!domain.isNullOrBlank()) domainSet.add(domain.trim().lowercase())
            }
            stateManager.updateBlockedDomains(domainSet)
            JSONObject().apply { put("success", true) }.toString()
        } catch (e: Exception) {
            JSONObject().apply { put("success", false) }.toString()
        }
    }

    @JavascriptInterface
    fun getBlockingStatus(): String {
        val status = stateManager.getBlockingStatus()
        return JSONObject().apply {
            put("isBlockingActive", status.isBlockingActive)
            put("isFocusSessionActive", status.isFocusSessionActive)
            put("isFocusSessionPaused", status.isFocusSessionPaused)
            put("isStrictMode", status.isStrictMode)
            put("activeSubject", status.activeSubject)
            put("blockedAppsCount", status.blockedAppsCount)
            put("blockedDomainsCount", status.blockedDomainsCount)
            put("isAdultShieldActive", status.isAdultShieldActive)
            put("isLockoutActive", status.isLockoutActive)
            put("lockoutRemainingSec", status.lockoutRemainingSec)
        }.toString()
    }

    @JavascriptInterface
    fun getWarningStatus(targetType: String, targetId: String): String {
        val status = stateManager.getWarningStatus(targetType, targetId)
        return JSONObject().apply {
            put("targetId", status.targetId)
            put("targetType", status.targetType)
            put("warningCount", status.warningCount)
            put("maxWarnings", status.maxWarnings)
            put("lastWarningTimeMs", status.lastWarningTimeMs)
            put("lockoutCount", status.lockoutCount)
            put("lastLockoutTimeMs", status.lastLockoutTimeMs)
        }.toString()
    }

    @JavascriptInterface
    fun recordBlockedAttempt(targetType: String, targetId: String, targetName: String): String {
        val result = LockdownManager.recordAttempt(context, targetId, targetType, targetName)
        return JSONObject().apply {
            put("warningNumber", result.strikeCount)
            put("maxWarnings", result.maxStrikes)
            put("isLockoutTriggered", result.isLockdown)
            put("lockoutRemainingSec", result.remainingSeconds)
            put("stage", result.stage)
            put("targetId", result.targetKey)
            put("targetType", targetType)
            put("targetName", result.targetName)
        }.toString()
    }

    @JavascriptInterface
    fun startFiveMinuteLockout(
        targetType: String,
        targetId: String,
        targetName: String,
        durationMinutes: Int
    ): String {
        val dur = if (durationMinutes > 0) durationMinutes else 5
        LockdownManager.triggerLockdown(context, targetId, targetType, targetName, durationMinutes = dur, stage = 1)
        val remSec = LockdownManager.getRemainingLockdownSec(context)
        return JSONObject().apply {
            put("isLockoutActive", true)
            put("lockoutUntilMs", System.currentTimeMillis() + (remSec * 1000L))
            put("remainingSeconds", remSec)
            put("targetId", targetId)
            put("targetType", targetType)
            put("targetName", targetName)
        }.toString()
    }

    @JavascriptInterface
    fun getLockoutStatus(): String {
        val isLock = LockdownManager.isLockdownActive(context)
        val remSec = LockdownManager.getRemainingLockdownSec(context)
        return JSONObject().apply {
            put("isLockoutActive", isLock)
            put("lockoutUntilMs", if (isLock) System.currentTimeMillis() + (remSec * 1000L) else 0L)
            put("remainingSeconds", remSec)
            put("targetId", prefs.getString("lockout_target_id", ""))
            put("targetType", prefs.getString("lockout_target_type", ""))
            put("targetName", prefs.getString("lockout_target_name", ""))
            put("subjectName", prefs.getString("active_subject_name", "NEET 2027 Study"))
        }.toString()
    }

    @JavascriptInterface
    fun cancelLockoutIfAllowed(): String {
        val allowEmergency = prefs.getBoolean("allow_emergency_unlock", true)
        if (allowEmergency) {
            LockdownManager.cancelLockdown(context)
            return JSONObject().apply { put("success", true) }.toString()
        }
        return JSONObject().apply { put("success", false) }.toString()
    }

    @JavascriptInterface
    fun getBlockedEvents(): String {
        val events = stateManager.getBlockedEvents()
        return JSONObject().apply { put("events", events) }.toString()
    }

    @JavascriptInterface
    fun resetDailyWarnings(): String {
        stateManager.resetDailyWarnings()
        return JSONObject().apply { put("success", true) }.toString()
    }

    @JavascriptInterface
    fun startFocusSession(
        durationMinutes: Int,
        subjectName: String,
        isStrict: Boolean,
        remainingSeconds: Long
    ): String {
        return try {
            val timerIntent = Intent(context, FocusTimerService::class.java).apply {
                action = FocusTimerService.ACTION_START
                putExtra(FocusTimerService.EXTRA_DURATION_MINUTES, durationMinutes)
                putExtra(FocusTimerService.EXTRA_SUBJECT_NAME, subjectName)
                putExtra(FocusTimerService.EXTRA_REMAINING_SECONDS, remainingSeconds)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(timerIntent)
            } else {
                context.startService(timerIntent)
            }
            stateManager.startFocusSession(durationMinutes, subjectName, isStrict, remainingSeconds)
            JSONObject().apply { put("success", true) }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Error starting focus session: ${e.message}", e)
            JSONObject().apply { put("success", false) }.toString()
        }
    }

    @JavascriptInterface
    fun stopFocusSession(): String {
        return try {
            val timerIntent = Intent(context, FocusTimerService::class.java).apply {
                action = FocusTimerService.ACTION_STOP
            }
            context.startService(timerIntent)
            stateManager.stopFocusSession()
            JSONObject().apply { put("success", true) }.toString()
        } catch (e: Exception) {
            JSONObject().apply { put("success", false) }.toString()
        }
    }

    @JavascriptInterface
    fun checkPermissions(): String {
        val hasUsage = usageStatsTracker.hasUsageStatsPermission()
        val hasAccessibility = isAccessibilityServiceEnabled()
        val isAccessibilityRunning = OpenFocusAccessibilityService.isServiceRunning
        val hasNotification = NotificationManagerCompat.from(context).areNotificationsEnabled()
        val hasBattery = batteryHelper.isIgnoringBatteryOptimizations()

        val vpnIntent = VpnService.prepare(context)
        val hasVpn = (vpnIntent == null)
        val isVpnRunning = OpenFocusVpnService.isVpnRunning
        val isVpnStarting = OpenFocusVpnService.isStarting
        val anotherVpn = OpenFocusVpnService.anotherVpnActive
        val blockedDomainsCount = prefs.getStringSet("blocked_domains", emptySet())?.size ?: 0
        val lastVpnError = OpenFocusVpnService.lastVpnError

        val hasExactAlarm = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager)?.canScheduleExactAlarms() ?: true
        } else {
            true
        }

        val hasDeviceAdmin = LockdownManager.hasDeviceAdmin(context)
        val isLock = LockdownManager.isLockdownActive(context)
        val remSec = LockdownManager.getRemainingLockdownSec(context)

        return JSONObject().apply {
            put("hasUsageStats", hasUsage)
            put("hasAccessibility", hasAccessibility)
            put("isAccessibilityRunning", isAccessibilityRunning)
            put("hasNotification", hasNotification)
            put("hasBatteryOptimizationIgnored", hasBattery)
            put("hasVpnPermission", hasVpn)
            put("isVpnRunning", isVpnRunning)
            put("isVpnStarting", isVpnStarting)
            put("anotherVpnActive", anotherVpn)
            put("blockedDomainsCount", blockedDomainsCount)
            put("lastVpnError", lastVpnError ?: "")
            put("hasExactAlarm", hasExactAlarm)
            put("hasDeviceAdmin", hasDeviceAdmin)
            put("isLockoutActive", isLock)
            put("lockoutRemainingSec", remSec)
        }.toString()
    }

    @JavascriptInterface
    fun getStrikeCounts(): String {
        val strikesMap = LockdownManager.getAllStrikeCounts(context)
        val jsStrikes = JSONObject()
        for ((target, count) in strikesMap) {
            jsStrikes.put(target, count)
        }
        return JSONObject().apply {
            put("strikes", jsStrikes)
            put("isLockdownActive", LockdownManager.isLockdownActive(context))
            put("lockoutRemainingSec", LockdownManager.getRemainingLockdownSec(context))
        }.toString()
    }

    @JavascriptInterface
    fun startVpnProtection(): String {
        val vpnIntent = VpnService.prepare(context)
        if (vpnIntent != null) {
            vpnIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(vpnIntent)
            return JSONObject().apply {
                put("started", false)
                put("needsPermission", true)
            }.toString()
        }

        return try {
            val serviceIntent = Intent(context, OpenFocusVpnService::class.java).apply {
                action = OpenFocusVpnService.ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            JSONObject().apply {
                put("started", true)
                put("needsPermission", false)
            }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start VPN service: ${e.message}", e)
            JSONObject().apply {
                put("started", false)
                put("needsPermission", false)
                put("error", e.message ?: "Failed to start VPN")
            }.toString()
        }
    }

    @JavascriptInterface
    fun stopVpnProtection(): String {
        return try {
            val serviceIntent = Intent(context, OpenFocusVpnService::class.java).apply {
                action = OpenFocusVpnService.ACTION_STOP
            }
            context.startService(serviceIntent)
            JSONObject().apply { put("stopped", true) }.toString()
        } catch (e: Exception) {
            JSONObject().apply { put("stopped", false) }.toString()
        }
    }

    @JavascriptInterface
    fun requestPermission(type: String): String {
        mainHandler.post {
            try {
                when (type) {
                    "accessibility" -> {
                        Toast.makeText(
                            context,
                            "Tap 'Downloaded apps' -> 'OpenFocus Focus Guard' -> Turn ON",
                            Toast.LENGTH_LONG
                        ).show()
                        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(intent)
                    }
                    "usage_stats" -> {
                        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(intent)
                    }
                    "device_admin" -> {
                        val componentName = ComponentName(context, FocusDeviceAdminReceiver::class.java)
                        val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                            putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, componentName)
                            putExtra(
                                DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                                "Enable Device Admin for Focus Lockdown to lock the screen when you repeatedly attempt to open blocked apps or websites."
                            )
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(intent)
                    }
                    "vpn" -> {
                        val vpnIntent = VpnService.prepare(context)
                        if (vpnIntent != null) {
                            vpnIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            context.startActivity(vpnIntent)
                        } else {
                            startVpnProtection()
                        }
                    }
                    "battery_optimization" -> {
                        val intent = batteryHelper.requestIgnoreBatteryOptimizationsIntent()
                        context.startActivity(intent)
                    }
                    "notification" -> {
                        val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                                putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                        } else {
                            Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                                data = Uri.parse("package:${context.packageName}")
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                        }
                        context.startActivity(intent)
                    }
                    "exact_alarm" -> {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                                data = Uri.parse("package:${context.packageName}")
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            context.startActivity(intent)
                        }
                    }
                    else -> {
                        openAppSettings()
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error opening settings for permission $type: ${e.message}", e)
                try {
                    openAppSettings()
                } catch (_: Exception) {}
            }
        }
        return JSONObject().apply { put("granted", true) }.toString()
    }

    @JavascriptInterface
    fun openAppSettings() {
        mainHandler.post {
            try {
                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.parse("package:${context.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                Log.e(TAG, "Error opening app settings: ${e.message}")
            }
        }
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        if (OpenFocusAccessibilityService.isServiceRunning) return true

        try {
            val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager
            val services = am?.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
            if (services != null) {
                for (service in services) {
                    val info = service.resolveInfo?.serviceInfo
                    if (info != null && info.packageName == context.packageName) {
                        if (info.name == OpenFocusAccessibilityService::class.java.name ||
                            info.name.endsWith("OpenFocusAccessibilityService")) {
                            return true
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error checking AccessibilityManager: ${e.message}")
        }

        try {
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false

            val expectedComponent = "${context.packageName}/${OpenFocusAccessibilityService::class.java.name}"
            val simpleComponent = "${context.packageName}/.service.accessibility.OpenFocusAccessibilityService"

            return enabledServices.split(":").any {
                it.equals(expectedComponent, ignoreCase = true) ||
                it.equals(simpleComponent, ignoreCase = true) ||
                (it.contains(context.packageName) && it.contains("OpenFocusAccessibilityService"))
            }
        } catch (e: Exception) {
            return false
        }
    }
}

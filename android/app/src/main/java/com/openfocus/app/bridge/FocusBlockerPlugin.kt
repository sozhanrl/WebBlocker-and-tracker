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
import android.provider.Settings
import android.util.Log
import android.view.accessibility.AccessibilityManager
import androidx.core.app.NotificationManagerCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.openfocus.app.manager.BatteryOptimizationHelper
import com.openfocus.app.manager.BlockingStateManager
import com.openfocus.app.manager.InstalledAppsManager
import com.openfocus.app.manager.LockdownManager
import com.openfocus.app.manager.UsageStatsTracker
import com.openfocus.app.receiver.FocusDeviceAdminReceiver
import com.openfocus.app.service.accessibility.OpenFocusAccessibilityService
import com.openfocus.app.service.timer.FocusTimerService
import com.openfocus.app.service.vpn.OpenFocusVpnService

/**
 * FocusBlockerPlugin
 *
 * Capacitor bridge exposing native Android blocking, installed app loader,
 * usage stats, warning system, 5-minute lockout, and permission diagnostics to React.
 */
@CapacitorPlugin(name = "FocusBlocker")
class FocusBlockerPlugin : Plugin() {

    companion object {
        private const val TAG = "FocusBlockerPlugin"
        private const val VPN_REQUEST_CODE = 9001
    }

    private lateinit var prefs: SharedPreferences
    private lateinit var stateManager: BlockingStateManager
    private lateinit var installedAppsManager: InstalledAppsManager
    private lateinit var usageStatsTracker: UsageStatsTracker
    private lateinit var batteryHelper: BatteryOptimizationHelper

    override fun load() {
        super.load()
        val ctx = context
        prefs = ctx.getSharedPreferences("focus_blocker_prefs", Context.MODE_PRIVATE)
        stateManager = BlockingStateManager.getInstance(ctx)
        installedAppsManager = InstalledAppsManager(ctx)
        usageStatsTracker = UsageStatsTracker(ctx)
        batteryHelper = BatteryOptimizationHelper(ctx)
        Log.i(TAG, "FocusBlocker Capacitor Plugin loaded with BlockingStateManager")
    }

    @PluginMethod
    fun isNative(call: PluginCall) {
        val ret = JSObject().apply {
            put("isNative", true)
            put("platform", "android")
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        try {
            val includeSystemApps = call.getBoolean("includeSystemApps", false) ?: false
            val apps = installedAppsManager.getInstalledLaunchableApps(includeSystemApps)
            val ret = JSObject().apply {
                put("apps", apps)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get installed apps: ${e.message}", e)
            call.reject("Failed to get installed apps: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getUsageStats(call: PluginCall) {
        try {
            val now = System.currentTimeMillis()
            val startTimeMs = call.getLong("startTimeMs") ?: (now - 86400000L)
            val endTimeMs = call.getLong("endTimeMs") ?: now

            val stats = usageStatsTracker.getAppUsageStats(startTimeMs, endTimeMs)
            val ret = JSObject().apply {
                put("stats", stats)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get usage stats: ${e.message}", e)
            call.reject("Failed to get usage stats: ${e.message}", e)
        }
    }

    @PluginMethod
    fun updateBlockList(call: PluginCall) {
        try {
            val blockedPkgs = call.getArray("blockedPackages")
            val blockedDomains = call.getArray("blockedDomains")
            val isStrict = call.getBoolean("isStrict", false) ?: false
            val allowEmergency = call.getBoolean("allowEmergencyUnlock", true) ?: true
            val activeSubject = call.getString("activeSubject", "NEET 2027 Study")
            val isBlockingActive = call.getBoolean("isBlockingActive", true) ?: true

            if (blockedPkgs != null) {
                val pkgSet = HashSet<String>()
                for (i in 0 until blockedPkgs.length()) {
                    val pkg = blockedPkgs.getString(i)
                    if (!pkg.isNullOrBlank()) {
                        pkgSet.add(pkg.trim())
                    }
                }
                stateManager.updateBlockedApps(pkgSet)
            }

            if (blockedDomains != null) {
                val domainSet = HashSet<String>()
                for (i in 0 until blockedDomains.length()) {
                    val domain = blockedDomains.getString(i)
                    if (!domain.isNullOrBlank()) {
                        domainSet.add(domain.trim().lowercase())
                    }
                }
                stateManager.updateBlockedDomains(domainSet)
            }

            val isAdultBlockingEnabled = call.getBoolean("isAdultBlockingEnabled", false) ?: false
            stateManager.setAdultContentBlockingEnabled(isAdultBlockingEnabled)

            prefs.edit()
                .putBoolean("is_blocking_active", isBlockingActive)
                .putBoolean("is_strict_mode", isStrict)
                .putBoolean("allow_emergency_unlock", allowEmergency)
                .putString("active_subject_name", activeSubject)
                .apply()

            val ret = JSObject().apply { put("success", true) }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update block list: ${e.message}", e)
            call.reject("Failed to update block list: ${e.message}", e)
        }
    }

    @PluginMethod
    fun updateBlockedApps(call: PluginCall) {
        try {
            val blockedPkgs = call.getArray("blockedPackages")
            val pkgSet = HashSet<String>()
            if (blockedPkgs != null) {
                for (i in 0 until blockedPkgs.length()) {
                    val pkg = blockedPkgs.getString(i)
                    if (!pkg.isNullOrBlank()) pkgSet.add(pkg.trim())
                }
            }
            stateManager.updateBlockedApps(pkgSet)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Failed to update blocked apps: ${e.message}", e)
        }
    }

    @PluginMethod
    fun updateBlockedDomains(call: PluginCall) {
        try {
            val blockedDomains = call.getArray("blockedDomains")
            val domainSet = HashSet<String>()
            if (blockedDomains != null) {
                for (i in 0 until blockedDomains.length()) {
                    val domain = blockedDomains.getString(i)
                    if (!domain.isNullOrBlank()) domainSet.add(domain.trim().lowercase())
                }
            }
            stateManager.updateBlockedDomains(domainSet)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Failed to update blocked domains: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getBlockingStatus(call: PluginCall) {
        try {
            val status = stateManager.getBlockingStatus()
            val ret = JSObject().apply {
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
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to get blocking status: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getWarningStatus(call: PluginCall) {
        try {
            val targetType = call.getString("targetType") ?: "app"
            val targetId = call.getString("targetId") ?: ""
            val status = stateManager.getWarningStatus(targetType, targetId)
            val ret = JSObject().apply {
                put("targetId", status.targetId)
                put("targetType", status.targetType)
                put("warningCount", status.warningCount)
                put("maxWarnings", status.maxWarnings)
                put("lastWarningTimeMs", status.lastWarningTimeMs)
                put("lockoutCount", status.lockoutCount)
                put("lastLockoutTimeMs", status.lastLockoutTimeMs)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to get warning status: ${e.message}", e)
        }
    }

    @PluginMethod
    fun recordBlockedAttempt(call: PluginCall) {
        try {
            val targetType = call.getString("targetType") ?: "app"
            val targetId = call.getString("targetId") ?: ""
            val targetName = call.getString("targetName") ?: targetId
            val result = stateManager.recordBlockedAttempt(targetType, targetId, targetName)
            val ret = JSObject().apply {
                put("warningNumber", result.warningNumber)
                put("maxWarnings", result.maxWarnings)
                put("isLockoutTriggered", result.isLockoutTriggered)
                put("lockoutRemainingSec", result.lockoutRemainingSec)
                put("targetId", result.targetId)
                put("targetType", result.targetType)
                put("targetName", result.targetName)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to record blocked attempt: ${e.message}", e)
        }
    }

    @PluginMethod
    fun startFiveMinuteLockout(call: PluginCall) {
        try {
            val targetType = call.getString("targetType") ?: "app"
            val targetId = call.getString("targetId") ?: "focus_lockout"
            val targetName = call.getString("targetName") ?: "Study Distraction"
            val durationMinutes = call.getInt("durationMinutes") ?: 5
            val status = stateManager.startFiveMinuteLockout(targetType, targetId, targetName, durationMinutes)
            val ret = JSObject().apply {
                put("isLockoutActive", status.isLockoutActive)
                put("lockoutUntilMs", status.lockoutUntilMs)
                put("remainingSeconds", status.remainingSeconds)
                put("targetId", status.targetId)
                put("targetType", status.targetType)
                put("targetName", status.targetName)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to start lockout: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getLockoutStatus(call: PluginCall) {
        try {
            val status = stateManager.getLockoutStatus()
            val ret = JSObject().apply {
                put("isLockoutActive", status.isLockoutActive)
                put("lockoutUntilMs", status.lockoutUntilMs)
                put("remainingSeconds", status.remainingSeconds)
                put("targetId", status.targetId)
                put("targetType", status.targetType)
                put("targetName", status.targetName)
                put("subjectName", status.subjectName)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to get lockout status: ${e.message}", e)
        }
    }

    @PluginMethod
    fun cancelLockoutIfAllowed(call: PluginCall) {
        try {
            val success = stateManager.cancelLockoutIfAllowed()
            call.resolve(JSObject().apply { put("success", success) })
        } catch (e: Exception) {
            call.reject("Failed to cancel lockout: ${e.message}", e)
        }
    }

    @PluginMethod
    fun cancelActiveLockdown(call: PluginCall) {
        try {
            LockdownManager.clearAllLockdownsAndStrikes(context)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Failed to clear lockdown: ${e.message}", e)
        }
    }

    @PluginMethod
    fun syncDailyRoutine(call: PluginCall) {
        try {
            val routineJson = call.getString("routineJson") ?: "[]"
            com.openfocus.app.manager.RoutineNotificationManager.saveRoutineJson(context, routineJson)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Failed to sync routine: ${e.message}", e)
        }
    }

    @PluginMethod
    fun setRoutineNotificationEnabled(call: PluginCall) {
        try {
            val enabled = call.getBoolean("enabled", true) ?: true
            com.openfocus.app.manager.RoutineNotificationManager.setNotificationEnabled(context, enabled)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Failed to set routine notification: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getRoutineNotificationStatus(call: PluginCall) {
        try {
            val enabled = com.openfocus.app.manager.RoutineNotificationManager.isNotificationEnabled(context)
            call.resolve(JSObject().apply { put("enabled", enabled) })
        } catch (e: Exception) {
            call.reject("Failed to get routine notification status: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getBlockedEvents(call: PluginCall) {
        try {
            val events = stateManager.getBlockedEvents()
            call.resolve(JSObject().apply { put("events", events) })
        } catch (e: Exception) {
            call.reject("Failed to get blocked events: ${e.message}", e)
        }
    }

    @PluginMethod
    fun resetDailyWarnings(call: PluginCall) {
        try {
            stateManager.resetDailyWarnings()
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Failed to reset daily warnings: ${e.message}", e)
        }
    }

    @PluginMethod
    fun startFocusSession(call: PluginCall) {
        try {
            val durationMinutes = call.getInt("durationMinutes") ?: 25
            val subjectName = call.getString("subjectName") ?: "NEET 2027 Study"
            val isStrict = call.getBoolean("isStrict") ?: false
            val remainingSeconds = call.getLong("remainingSeconds") ?: (durationMinutes * 60L)

            val ctx = context
            val timerIntent = Intent(ctx, FocusTimerService::class.java).apply {
                action = FocusTimerService.ACTION_START
                putExtra(FocusTimerService.EXTRA_DURATION_MINUTES, durationMinutes)
                putExtra(FocusTimerService.EXTRA_SUBJECT_NAME, subjectName)
                putExtra(FocusTimerService.EXTRA_REMAINING_SECONDS, remainingSeconds)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(timerIntent)
            } else {
                ctx.startService(timerIntent)
            }

            stateManager.startFocusSession(durationMinutes, subjectName, isStrict, remainingSeconds)
            val ret = JSObject().apply { put("success", true) }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start focus session: ${e.message}", e)
            call.reject("Failed to start focus session: ${e.message}", e)
        }
    }

    @PluginMethod
    fun stopFocusSession(call: PluginCall) {
        try {
            val ctx = context
            val timerIntent = Intent(ctx, FocusTimerService::class.java).apply {
                action = FocusTimerService.ACTION_STOP
            }
            ctx.startService(timerIntent)
            stateManager.stopFocusSession()
            val ret = JSObject().apply { put("success", true) }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop focus session: ${e.message}", e)
            call.reject("Failed to stop focus session: ${e.message}", e)
        }
    }

    @PluginMethod
    override fun checkPermissions(call: PluginCall) {
        val ctx = context
        val act = activity

        val hasUsage = usageStatsTracker.hasUsageStatsPermission()
        val hasAccessibility = isAccessibilityServiceEnabled()
        val isAccessibilityRunning = OpenFocusAccessibilityService.isServiceRunning
        val hasNotification = NotificationManagerCompat.from(ctx).areNotificationsEnabled()
        val hasBattery = batteryHelper.isIgnoringBatteryOptimizations()

        val vpnIntent = VpnService.prepare(act ?: ctx)
        val hasVpn = (vpnIntent == null)
        val isVpnRunning = OpenFocusVpnService.isVpnRunning
        val isVpnStarting = OpenFocusVpnService.isStarting
        val anotherVpn = OpenFocusVpnService.anotherVpnActive
        val blockedDomainsCount = prefs.getStringSet("blocked_domains", emptySet())?.size ?: 0
        val lastVpnError = OpenFocusVpnService.lastVpnError

        val hasExactAlarm = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager)?.canScheduleExactAlarms() ?: true
        } else {
            true
        }

        val hasDeviceAdmin = LockdownManager.hasDeviceAdmin(ctx)
        val lockout = stateManager.getLockoutStatus()

        val ret = JSObject().apply {
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
            put("isLockoutActive", lockout.isLockoutActive)
            put("lockoutRemainingSec", lockout.remainingSeconds)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun getStrikeCounts(call: PluginCall) {
        try {
            val ctx = context
            val strikesMap = LockdownManager.getAllStrikeCounts(ctx)
            val jsStrikes = JSObject()
            for ((target, count) in strikesMap) {
                jsStrikes.put(target, count)
            }
            val ret = JSObject().apply {
                put("strikes", jsStrikes)
                put("isLockdownActive", LockdownManager.isLockdownActive(ctx))
                put("lockoutRemainingSec", LockdownManager.getRemainingLockdownSec(ctx))
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to get strike counts: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getDiagnostics(call: PluginCall) {
        checkPermissions(call)
    }

    @PluginMethod
    fun startVpnProtection(call: PluginCall) {
        val ctx = context
        val act = activity

        val vpnIntent = VpnService.prepare(act ?: ctx)
        if (vpnIntent != null) {
            if (act != null) {
                act.startActivityForResult(vpnIntent, VPN_REQUEST_CODE)
            } else {
                vpnIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(vpnIntent)
            }
            val ret = JSObject().apply {
                put("started", false)
                put("needsPermission", true)
            }
            call.resolve(ret)
            return
        }

        try {
            val serviceIntent = Intent(ctx, OpenFocusVpnService::class.java).apply {
                action = OpenFocusVpnService.ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(serviceIntent)
            } else {
                ctx.startService(serviceIntent)
            }
            val ret = JSObject().apply {
                put("started", true)
                put("needsPermission", false)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start VPN service: ${e.message}", e)
            call.reject("Failed to start VPN service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun stopVpnProtection(call: PluginCall) {
        try {
            val ctx = context
            val serviceIntent = Intent(ctx, OpenFocusVpnService::class.java).apply {
                action = OpenFocusVpnService.ACTION_STOP
            }
            ctx.startService(serviceIntent)
            val ret = JSObject().apply { put("stopped", true) }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop VPN: ${e.message}", e)
            call.reject("Failed to stop VPN: ${e.message}", e)
        }
    }

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        val type = call.getString("type") ?: ""
        val ctx = context
        val act = activity

        try {
            when (type) {
                "usage_stats" -> {
                    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    ctx.startActivity(intent)
                }
                "accessibility" -> {
                    val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    ctx.startActivity(intent)
                }
                "notification" -> {
                    val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                            putExtra(Settings.EXTRA_APP_PACKAGE, ctx.packageName)
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                    } else {
                        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.parse("package:${ctx.packageName}")
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                    }
                    ctx.startActivity(intent)
                }
                "battery_optimization" -> {
                    val intent = batteryHelper.requestIgnoreBatteryOptimizationsIntent()
                    ctx.startActivity(intent)
                }
                "vpn" -> {
                    val vpnIntent = VpnService.prepare(act ?: ctx)
                    if (vpnIntent != null) {
                        if (act != null) {
                            act.startActivityForResult(vpnIntent, VPN_REQUEST_CODE)
                        } else {
                            vpnIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            ctx.startActivity(vpnIntent)
                        }
                    }
                }
                "exact_alarm" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                            data = Uri.parse("package:${ctx.packageName}")
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        ctx.startActivity(intent)
                    }
                }
                "device_admin" -> {
                    val componentName = ComponentName(ctx, FocusDeviceAdminReceiver::class.java)
                    val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                        putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, componentName)
                        putExtra(
                            DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                            "Enable Device Admin for 5-Strike Lockdown to lock the screen when you repeatedly attempt to open blocked apps or websites."
                        )
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    ctx.startActivity(intent)
                }
                else -> {
                    openAppSettings(call)
                    return
                }
            }
            val ret = JSObject().apply { put("granted", true) }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to request permission $type: ${e.message}", e)
            call.reject("Failed to request permission $type: ${e.message}", e)
        }
    }

    @PluginMethod
    fun openAppSettings(call: PluginCall) {
        val ctx = context
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.parse("package:${ctx.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        ctx.startActivity(intent)
        call.resolve()
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

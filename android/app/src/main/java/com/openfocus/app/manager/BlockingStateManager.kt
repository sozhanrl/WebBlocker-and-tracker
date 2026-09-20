package com.openfocus.app.manager

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * BlockingStateManager - Central Singleton for FocusForge / NEET Tracker
 *
 * Coordinates blocking state, 5-warning tracking, 5-minute focus lockout,
 * focus sessions, and event logging across AccessibilityService, VpnService,
 * BlockScreenActivity, FocusTimerService, and the Capacitor JavaScript bridge.
 */
class BlockingStateManager private constructor(private val context: Context) {

    companion object {
        private const val TAG = "BlockingStateManager"
        private const val PREFS_NAME = "focus_blocker_prefs"

        // Default configurations
        const val DEFAULT_MAX_WARNINGS = 5
        const val DEFAULT_LOCKOUT_DURATION_SEC = 300L // 5 minutes

        @Volatile
        private var INSTANCE: BlockingStateManager? = null

        fun getInstance(context: Context): BlockingStateManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: BlockingStateManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    data class WarningResult(
        val warningNumber: Int,
        val maxWarnings: Int,
        val isLockoutTriggered: Boolean,
        val lockoutRemainingSec: Long,
        val targetId: String,
        val targetType: String,
        val targetName: String
    )

    data class LockoutStatus(
        val isLockoutActive: Boolean,
        val lockoutUntilMs: Long,
        val remainingSeconds: Long,
        val targetId: String?,
        val targetType: String?,
        val targetName: String?,
        val subjectName: String?
    )

    data class WarningStatus(
        val targetId: String,
        val targetType: String,
        val warningCount: Int,
        val maxWarnings: Int,
        val lastWarningTimeMs: Long,
        val lockoutCount: Int,
        val lastLockoutTimeMs: Long
    )

    data class BlockingStatus(
        val isBlockingActive: Boolean,
        val isFocusSessionActive: Boolean,
        val isFocusSessionPaused: Boolean,
        val isStrictMode: Boolean,
        val activeSubject: String,
        val blockedAppsCount: Int,
        val blockedDomainsCount: Int,
        val isAdultShieldActive: Boolean,
        val isLockoutActive: Boolean,
        val lockoutRemainingSec: Long
    )

    // =========================================================================
    // 1. WARNING & LOCKOUT EVALUATION ENGINE
    // =========================================================================

    /**
     * Records an access attempt to a blocked target (app, website, or adult website).
     * Increments the persistent warning counter (1..5).
     * Upon reaching warning 5, triggers a 5-minute full-screen Focus Lockout.
     */
    @Synchronized
    fun recordBlockedAttempt(targetType: String, targetId: String, targetName: String): WarningResult {
        checkDailyReset()

        val cleanId = targetId.trim().lowercase()
        val cleanType = targetType.trim().lowercase()
        val displayName = targetName.ifBlank { cleanId }
        val now = System.currentTimeMillis()

        // Check if already in active lockout
        val currentLockout = getLockoutStatus()
        if (currentLockout.isLockoutActive) {
            logBlockedEvent("lockout_enforced", cleanType, cleanId, displayName, 5)
            return WarningResult(
                warningNumber = 5,
                maxWarnings = DEFAULT_MAX_WARNINGS,
                isLockoutTriggered = false,
                lockoutRemainingSec = currentLockout.remainingSeconds,
                targetId = cleanId,
                targetType = cleanType,
                targetName = displayName
            )
        }

        // Retrieve existing warning count for this target
        val countKey = "warn_count_${cleanType}_$cleanId"
        val timeKey = "warn_time_${cleanType}_$cleanId"
        val lockCountKey = "lock_count_${cleanType}_$cleanId"

        val currentCount = prefs.getInt(countKey, 0)
        val newCount = currentCount + 1
        var isLockoutTriggered = false
        var lockoutSec = 0L

        val editor = prefs.edit()
        editor.putInt(countKey, newCount)
        editor.putLong(timeKey, now)

        if (newCount >= DEFAULT_MAX_WARNINGS) {
            // Reached 5 warnings -> Start 5-Minute Focus Lockout
            isLockoutTriggered = true
            lockoutSec = DEFAULT_LOCKOUT_DURATION_SEC
            val lockoutUntilMs = now + (lockoutSec * 1000L)

            val totalLocks = prefs.getInt(lockCountKey, 0) + 1
            editor.putInt(lockCountKey, totalLocks)
            editor.putLong("lock_time_${cleanType}_$cleanId", now)

            // Persist global lockout state
            editor.putBoolean("is_lockout_active", true)
            editor.putLong("lockout_until_ms", lockoutUntilMs)
            editor.putString("lockout_target_id", cleanId)
            editor.putString("lockout_target_type", cleanType)
            editor.putString("lockout_target_name", displayName)

            Log.w(TAG, "🚨 5 WARNINGS REACHED for $cleanId ($cleanType) -> 5-Minute Focus Lockout STARTED until $lockoutUntilMs")
            logBlockedEvent("lockout_started", cleanType, cleanId, displayName, newCount)
        } else {
            Log.i(TAG, "⚠️ Warning $newCount/$DEFAULT_MAX_WARNINGS recorded for $cleanId ($cleanType)")
            logBlockedEvent("warning_issued", cleanType, cleanId, displayName, newCount)
        }

        editor.apply()

        return WarningResult(
            warningNumber = minOf(newCount, DEFAULT_MAX_WARNINGS),
            maxWarnings = DEFAULT_MAX_WARNINGS,
            isLockoutTriggered = isLockoutTriggered,
            lockoutRemainingSec = lockoutSec,
            targetId = cleanId,
            targetType = cleanType,
            targetName = displayName
        )
    }

    /**
     * Manually triggers a 5-minute focus lockout for a target.
     */
    @Synchronized
    fun startFiveMinuteLockout(
        targetType: String,
        targetId: String,
        targetName: String,
        durationMinutes: Int = 5
    ): LockoutStatus {
        val cleanId = targetId.trim().lowercase()
        val cleanType = targetType.trim().lowercase()
        val displayName = targetName.ifBlank { cleanId }
        val now = System.currentTimeMillis()
        val durationSec = maxOf(60L, durationMinutes * 60L)
        val lockoutUntilMs = now + (durationSec * 1000L)

        prefs.edit()
            .putBoolean("is_lockout_active", true)
            .putLong("lockout_until_ms", lockoutUntilMs)
            .putString("lockout_target_id", cleanId)
            .putString("lockout_target_type", cleanType)
            .putString("lockout_target_name", displayName)
            .apply()

        logBlockedEvent("lockout_started_manual", cleanType, cleanId, displayName, DEFAULT_MAX_WARNINGS)

        return LockoutStatus(
            isLockoutActive = true,
            lockoutUntilMs = lockoutUntilMs,
            remainingSeconds = durationSec,
            targetId = cleanId,
            targetType = cleanType,
            targetName = displayName,
            subjectName = prefs.getString("active_subject_name", "NEET 2027 Study")
        )
    }

    /**
     * Checks whether an active lockout is currently in effect.
     * Automatically clears expired lockout states.
     */
    @Synchronized
    fun getLockoutStatus(): LockoutStatus {
        val isFlagActive = prefs.getBoolean("is_lockout_active", false)
        val lockoutUntilMs = prefs.getLong("lockout_until_ms", 0L)
        val now = System.currentTimeMillis()

        if (!isFlagActive || lockoutUntilMs <= now) {
            if (isFlagActive) {
                // Lockout has naturally expired
                prefs.edit()
                    .putBoolean("is_lockout_active", false)
                    .putLong("lockout_until_ms", 0L)
                    .remove("lockout_target_id")
                    .remove("lockout_target_type")
                    .remove("lockout_target_name")
                    .apply()
                logBlockedEvent("lockout_expired", "system", "lockout", "5-Minute Focus Lockout", 0)
            }
            return LockoutStatus(
                isLockoutActive = false,
                lockoutUntilMs = 0L,
                remainingSeconds = 0L,
                targetId = null,
                targetType = null,
                targetName = null,
                subjectName = null
            )
        }

        val remainingSec = (lockoutUntilMs - now) / 1000L
        return LockoutStatus(
            isLockoutActive = true,
            lockoutUntilMs = lockoutUntilMs,
            remainingSeconds = maxOf(0L, remainingSec),
            targetId = prefs.getString("lockout_target_id", null),
            targetType = prefs.getString("lockout_target_type", null),
            targetName = prefs.getString("lockout_target_name", null),
            subjectName = prefs.getString("active_subject_name", "NEET 2027 Study")
        )
    }

    /**
     * Cancels active lockout if emergency unlock is permitted by configuration.
     */
    @Synchronized
    fun cancelLockoutIfAllowed(): Boolean {
        val allowEmergency = prefs.getBoolean("allow_emergency_unlock", true)
        if (!allowEmergency) {
            return false
        }

        prefs.edit()
            .putBoolean("is_lockout_active", false)
            .putLong("lockout_until_ms", 0L)
            .remove("lockout_target_id")
            .remove("lockout_target_type")
            .remove("lockout_target_name")
            .apply()

        logBlockedEvent("lockout_cancelled_emergency", "system", "emergency", "Emergency Unlock", 0)
        return true
    }

    /**
     * Retrieves warning count and lockout statistics for a specific target.
     */
    fun getWarningStatus(targetType: String, targetId: String): WarningStatus {
        checkDailyReset()
        val cleanId = targetId.trim().lowercase()
        val cleanType = targetType.trim().lowercase()

        val count = prefs.getInt("warn_count_${cleanType}_$cleanId", 0)
        val time = prefs.getLong("warn_time_${cleanType}_$cleanId", 0L)
        val lockCount = prefs.getInt("lock_count_${cleanType}_$cleanId", 0)
        val lockTime = prefs.getLong("lock_time_${cleanType}_$cleanId", 0L)

        return WarningStatus(
            targetId = cleanId,
            targetType = cleanType,
            warningCount = count,
            maxWarnings = DEFAULT_MAX_WARNINGS,
            lastWarningTimeMs = time,
            lockoutCount = lockCount,
            lastLockoutTimeMs = lockTime
        )
    }

    // =========================================================================
    // 2. FOCUS SESSIONS & BLOCKING CONFIGURATION
    // =========================================================================

    fun startFocusSession(
        durationMinutes: Int,
        subjectName: String,
        isStrict: Boolean,
        remainingSeconds: Long
    ) {
        prefs.edit()
            .putBoolean("is_focus_session_active", true)
            .putBoolean("is_focus_session_paused", false)
            .putString("active_subject_name", subjectName)
            .putLong("focus_session_start_time", System.currentTimeMillis())
            .putLong("focus_session_duration_sec", remainingSeconds)
            .putBoolean("is_strict_mode", isStrict)
            .apply()
        logBlockedEvent("focus_session_started", "session", subjectName, "$durationMinutes min session", 0)
    }

    fun stopFocusSession() {
        prefs.edit()
            .putBoolean("is_focus_session_active", false)
            .putBoolean("is_focus_session_paused", false)
            .apply()
        logBlockedEvent("focus_session_stopped", "session", "stop", "Focus session finished", 0)
    }

    fun updateBlockedApps(packages: Set<String>) {
        prefs.edit()
            .putStringSet("blocked_packages", packages)
            .apply()
    }

    fun updateBlockedDomains(domains: Set<String>) {
        val cleanSet = domains.map { it.trim().lowercase() }.filter { it.isNotBlank() }.toSet()
        prefs.edit()
            .putStringSet("blocked_domains", cleanSet)
            .apply()
    }

    fun setAdultContentBlockingEnabled(enabled: Boolean) {
        prefs.edit()
            .putBoolean("is_adult_blocking_enabled", enabled)
            .apply()
    }

    fun isAdultContentBlockingEnabled(): Boolean {
        return prefs.getBoolean("is_adult_blocking_enabled", false)
    }

    fun isAppBlocked(packageName: String): Boolean {
        val blockedPackages = prefs.getStringSet("blocked_packages", emptySet()) ?: emptySet()
        return blockedPackages.contains(packageName)
    }

    fun isDomainBlocked(normalizedDomain: String): Boolean {
        val cleanDomain = normalizedDomain.trim().lowercase()
        val blockedDomains = prefs.getStringSet("blocked_domains", emptySet()) ?: emptySet()

        for (blocked in blockedDomains) {
            val cleanBlocked = blocked.trim().lowercase()
            if (cleanBlocked.isEmpty()) continue
            if (cleanDomain == cleanBlocked || cleanDomain.endsWith(".$cleanBlocked")) {
                return true
            }
        }
        return false
    }

    fun isBlockingEnforced(): Boolean {
        val isBlockingActive = prefs.getBoolean("is_blocking_active", true)
        val isFocusActive = prefs.getBoolean("is_focus_session_active", false)
        val isPaused = prefs.getBoolean("is_focus_session_paused", false)
        val isStrict = prefs.getBoolean("is_strict_mode", false)

        if (!isBlockingActive && !isFocusActive) return false
        if (isPaused && !isStrict) return false

        // Check temporary emergency unlock expiry
        val emergencyUntil = prefs.getLong("emergency_unlock_until", 0L)
        if (System.currentTimeMillis() < emergencyUntil) {
            return false
        }

        return true
    }

    fun getBlockingStatus(): BlockingStatus {
        val lockout = getLockoutStatus()
        val blockedApps = prefs.getStringSet("blocked_packages", emptySet())?.size ?: 0
        val blockedDomains = prefs.getStringSet("blocked_domains", emptySet())?.size ?: 0

        return BlockingStatus(
            isBlockingActive = prefs.getBoolean("is_blocking_active", true),
            isFocusSessionActive = prefs.getBoolean("is_focus_session_active", false),
            isFocusSessionPaused = prefs.getBoolean("is_focus_session_paused", false),
            isStrictMode = prefs.getBoolean("is_strict_mode", false),
            activeSubject = prefs.getString("active_subject_name", "NEET 2027 Study") ?: "NEET 2027 Study",
            blockedAppsCount = blockedApps,
            blockedDomainsCount = blockedDomains,
            isAdultShieldActive = isAdultContentBlockingEnabled(),
            isLockoutActive = lockout.isLockoutActive,
            lockoutRemainingSec = lockout.remainingSeconds
        )
    }

    // =========================================================================
    // 3. DAILY RESET & LOGGING
    // =========================================================================

    private fun checkDailyReset() {
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val lastReset = prefs.getString("last_warning_reset_date", "")

        if (todayStr != lastReset) {
            resetDailyWarnings()
            prefs.edit().putString("last_warning_reset_date", todayStr).apply()
        }
    }

    @Synchronized
    fun resetDailyWarnings() {
        val editor = prefs.edit()
        val allKeys = prefs.all.keys
        for (key in allKeys) {
            if (key.startsWith("warn_count_") || key.startsWith("warn_time_")) {
                editor.remove(key)
            }
        }
        editor.apply()
        Log.i(TAG, "Daily warning counts reset successfully")
    }

    @Synchronized
    fun logBlockedEvent(
        eventType: String,
        targetType: String,
        targetId: String,
        targetName: String,
        warningNumber: Int
    ) {
        try {
            val rawEvents = prefs.getString("blocked_events_json", "[]") ?: "[]"
            val array = JSONArray(rawEvents)

            val event = JSONObject().apply {
                put("id", "evt_${System.currentTimeMillis()}")
                put("timestamp", System.currentTimeMillis())
                put("eventType", eventType)
                put("targetType", targetType)
                put("targetId", targetId)
                put("targetName", targetName)
                put("warningNumber", warningNumber)
                put("subject", prefs.getString("active_subject_name", "NEET 2027 Study"))
            }

            // Keep max 100 recent events in ring buffer
            if (array.length() >= 100) {
                val newArray = JSONArray()
                for (i in (array.length() - 99) until array.length()) {
                    newArray.put(array.getJSONObject(i))
                }
                newArray.put(event)
                prefs.edit().putString("blocked_events_json", newArray.toString()).apply()
            } else {
                array.put(event)
                prefs.edit().putString("blocked_events_json", array.toString()).apply()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error writing blocked event log: ${e.message}")
        }
    }

    fun getBlockedEvents(): JSONArray {
        return try {
            val raw = prefs.getString("blocked_events_json", "[]") ?: "[]"
            JSONArray(raw)
        } catch (e: Exception) {
            JSONArray()
        }
    }
}

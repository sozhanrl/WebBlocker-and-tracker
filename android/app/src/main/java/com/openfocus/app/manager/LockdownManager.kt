package com.openfocus.app.manager

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.Log
import com.openfocus.app.receiver.FocusDeviceAdminReceiver
import com.openfocus.app.ui.screens.blockscreen.LockdownOverlayActivity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * LockdownManager
 *
 * Implements the 5-warning ladder and escalating lockout:
 * - Warnings 1..4: Informational HUD block screen with 3-second reflection countdown.
 * - Warning 5: Stage 1 Focus Lockout (5 minutes). Device screen is locked via Device Admin lockNow(),
 *   and full-screen unskippable countdown is displayed.
 * - Continued Attempts: Stage 2 Focus Lockout (30 minutes). Screen locked and extended countdown applied.
 *
 * Preserves emergency functionality, never erases user data, and supports emergency bypass.
 */
object LockdownManager {

    private const val TAG = "LockdownManager"
    private const val PREFS_NAME = "focus_blocker_prefs"

    const val LOCKDOWN_STAGE_1_MS = 5 * 60_000L   // 5 minutes
    const val LOCKDOWN_STAGE_2_MS = 30 * 60_000L  // 30 minutes
    private const val VIOLATION_DEBOUNCE_MS = 2000L

    data class ViolationResult(
        val strikeCount: Int,
        val maxStrikes: Int = 5,
        val isLockdown: Boolean,
        val stage: Int, // 0 = warning (1..4), 1 = 5 min, 2 = 30 min
        val remainingSeconds: Long,
        val targetKey: String,
        val targetName: String,
        val todayBlockCount: Int = 1
    )

    fun getTodayBlockCount(context: Context): Int {
        val prefs = getPrefs(context)
        val todayKey = getTodayDateKey()
        val count = prefs.getInt("today_block_count_$todayKey", 0)
        return if (count <= 0) 1 else count
    }

    fun incrementTodayBlockCount(context: Context): Int {
        val prefs = getPrefs(context)
        val todayKey = getTodayDateKey()
        val current = prefs.getInt("today_block_count_$todayKey", 0) + 1
        prefs.edit().putInt("today_block_count_$todayKey", current).apply()
        return current
    }

    private fun getTodayDateKey(): String {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
        return sdf.format(java.util.Date())
    }

    fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    /**
     * Checks if Device Admin permission is currently active.
     */
    fun hasDeviceAdmin(context: Context): Boolean {
        return try {
            val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
            val adminComponent = ComponentName(context, FocusDeviceAdminReceiver::class.java)
            dpm?.isAdminActive(adminComponent) ?: false
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Records a blocked attempt for a target (app package or website domain).
     * Enforces the 5-strike warning ladder and 5-min / 30-min lockout escalation.
     */
    fun recordAttempt(
        context: Context,
        targetKey: String,
        targetType: String,
        targetName: String
    ): ViolationResult {
        val cleanKey = targetKey.trim().lowercase()
        val displayName = targetName.ifBlank { cleanKey }
        val prefs = getPrefs(context)
        val now = System.currentTimeMillis()

        // 1. Debounce rapid window/content change events (2 seconds)
        val lastViolationTime = prefs.getLong("last_violation_time:$cleanKey", 0L)
        if (now - lastViolationTime < VIOLATION_DEBOUNCE_MS) {
            val currentStrikes = prefs.getInt("violations:$cleanKey", 1)
            val isLock = isLockdownActive(context)
            val stage = prefs.getInt("lockout_stage", 0)
            val remSec = getRemainingLockdownSec(context)
            return ViolationResult(
                strikeCount = currentStrikes,
                maxStrikes = 5,
                isLockdown = isLock,
                stage = stage,
                remainingSeconds = remSec,
                targetKey = cleanKey,
                targetName = displayName
            )
        }

        prefs.edit().putLong("last_violation_time:$cleanKey", now).apply()

        // 2. Check if a lockout is ALREADY currently active
        val currentLockdownUntil = prefs.getLong("lockdown_until", 0L)
        if (now < currentLockdownUntil) {
            Log.w(TAG, "Attempt during active lockdown on '$cleanKey'. Escalating to 30-min Stage 2.")
            triggerLockdown(context, cleanKey, targetType, displayName, durationMinutes = 30, stage = 2)
            val remSec = getRemainingLockdownSec(context)
            return ViolationResult(
                strikeCount = 5,
                maxStrikes = 5,
                isLockdown = true,
                stage = 2,
                remainingSeconds = remSec,
                targetKey = cleanKey,
                targetName = displayName
            )
        }

        // 3. Check if target previously completed a 5-minute lockout
        val previousLockouts = prefs.getInt("lockouts_completed:$cleanKey", 0)
        if (previousLockouts > 0) {
            // Continued attempt after previous 5-min lockout -> trigger 30-min Stage 2 directly
            Log.w(TAG, "Repeated attempt on '$cleanKey' after previous lockout. Escalating to 30 minutes.")
            triggerLockdown(context, cleanKey, targetType, displayName, durationMinutes = 30, stage = 2)
            return ViolationResult(
                strikeCount = 5,
                maxStrikes = 5,
                isLockdown = true,
                stage = 2,
                remainingSeconds = 1800L,
                targetKey = cleanKey,
                targetName = displayName
            )
        }

        // 4. Normal 5-strike warning progression
        val currentStrikes = prefs.getInt("violations:$cleanKey", 0)
        val newStrikes = currentStrikes + 1
        prefs.edit().putInt("violations:$cleanKey", newStrikes).apply()
        val todayCount = incrementTodayBlockCount(context)

        Log.i(TAG, "Recorded strike $newStrikes/5 for '$cleanKey' (today total: $todayCount)")

        if (newStrikes >= 5) {
            // 5th strike reached: trigger 5-minute Stage 1 lockout!
            Log.w(TAG, "5th strike reached for '$cleanKey'. Triggering 5-minute study lockout.")
            triggerLockdown(context, cleanKey, targetType, displayName, durationMinutes = 5, stage = 1)
            return ViolationResult(
                strikeCount = 5,
                maxStrikes = 5,
                isLockdown = true,
                stage = 1,
                remainingSeconds = 300L,
                targetKey = cleanKey,
                targetName = displayName,
                todayBlockCount = todayCount
            )
        }

        return ViolationResult(
            strikeCount = newStrikes,
            maxStrikes = 5,
            isLockdown = false,
            stage = 0,
            remainingSeconds = 0L,
            targetKey = cleanKey,
            targetName = displayName,
            todayBlockCount = todayCount
        )
    }

    /**
     * Triggers a device lockdown (5 or 30 minutes).
     * Locks screen via Device Admin lockNow() if granted, and launches LockdownOverlayActivity.
     */
    fun triggerLockdown(
        context: Context,
        targetId: String = "",
        targetType: String = "",
        targetName: String = "",
        durationMinutes: Int = 5,
        stage: Int = 1
    ) {
        val prefs = getPrefs(context)
        val now = System.currentTimeMillis()
        val durationMs = durationMinutes * 60_000L
        val lockdownUntil = now + durationMs

        val editor = prefs.edit()
        editor.putLong("lockdown_until", lockdownUntil)
        editor.putBoolean("is_lockout_active", true)
        editor.putLong("lockout_until_ms", lockdownUntil)
        editor.putInt("lockout_stage", stage)
        editor.putInt("lockout_duration_minutes", durationMinutes)

        if (targetId.isNotBlank()) {
            val cleanKey = targetId.trim().lowercase()
            editor.putString("lockout_target_id", cleanKey)
            editor.putString("lockout_target_type", targetType)
            editor.putString("lockout_target_name", targetName)
            editor.putInt("violations:$cleanKey", 0)

            val currentCompleted = prefs.getInt("lockouts_completed:$cleanKey", 0)
            editor.putInt("lockouts_completed:$cleanKey", currentCompleted + 1)
        }
        editor.apply()

        Log.w(TAG, "🚨 STAGE $stage LOCKDOWN ACTIVE: $durationMinutes min until $lockdownUntil for '$targetId'")

        // 1. Lock screen immediately via Device Admin lockNow() if available
        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
        val adminComponent = ComponentName(context, FocusDeviceAdminReceiver::class.java)

        if (dpm != null && dpm.isAdminActive(adminComponent)) {
            try {
                dpm.lockNow()
                Log.i(TAG, "DevicePolicyManager.lockNow() locked the screen")
            } catch (e: Exception) {
                Log.e(TAG, "Error calling lockNow(): ${e.message}")
            }
        } else {
            Log.w(TAG, "Device Admin not granted. Full-screen countdown overlay will enforce focus restriction.")
        }

        // 2. Launch full-screen unskippable countdown overlay
        try {
            val overlayIntent = Intent(context, LockdownOverlayActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                putExtra(LockdownOverlayActivity.EXTRA_LOCKDOWN_UNTIL, lockdownUntil)
                putExtra(LockdownOverlayActivity.EXTRA_TARGET_NAME, targetName.ifBlank { targetId })
                putExtra(LockdownOverlayActivity.EXTRA_DURATION_MINUTES, durationMinutes)
                putExtra(LockdownOverlayActivity.EXTRA_STAGE, stage)
            }
            context.startActivity(overlayIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting LockdownOverlayActivity: ${e.message}")
        }
    }

    /**
     * Enforces re-lock if lockdown is still running (called on SCREEN_ON / USER_PRESENT).
     */
    fun enforceLockdownIfActive(context: Context) {
        val prefs = getPrefs(context)
        val lockdownUntil = prefs.getLong("lockdown_until", 0L)
        val now = System.currentTimeMillis()

        if (now < lockdownUntil) {
            Log.w(TAG, "Lockdown is active (${(lockdownUntil - now) / 1000}s remaining). Displaying overlay.")

            try {
                val stage = prefs.getInt("lockout_stage", 1)
                val durationMin = prefs.getInt("lockout_duration_minutes", 5)
                val targetName = prefs.getString("lockout_target_name", "Blocked Target") ?: "Blocked Target"

                val overlayIntent = Intent(context, LockdownOverlayActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                    putExtra(LockdownOverlayActivity.EXTRA_LOCKDOWN_UNTIL, lockdownUntil)
                    putExtra(LockdownOverlayActivity.EXTRA_TARGET_NAME, targetName)
                    putExtra(LockdownOverlayActivity.EXTRA_DURATION_MINUTES, durationMin)
                    putExtra(LockdownOverlayActivity.EXTRA_STAGE, stage)
                }
                context.startActivity(overlayIntent)
            } catch (e: Exception) {
                Log.e(TAG, "Error showing LockdownOverlayActivity: ${e.message}")
            }
        }
    }

    fun isLockdownActive(context: Context): Boolean {
        val prefs = getPrefs(context)
        val lockdownUntil = prefs.getLong("lockdown_until", 0L)
        return System.currentTimeMillis() < lockdownUntil
    }

    fun getRemainingLockdownSec(context: Context): Long {
        val prefs = getPrefs(context)
        val lockdownUntil = prefs.getLong("lockdown_until", 0L)
        val now = System.currentTimeMillis()
        return maxOf(0L, (lockdownUntil - now) / 1000L)
    }

    fun cancelLockdown(context: Context) {
        getPrefs(context).edit()
            .putLong("lockdown_until", 0L)
            .putBoolean("is_lockout_active", false)
            .putLong("lockout_until_ms", 0L)
            .putInt("lockout_stage", 0)
            .remove("lockout_target_id")
            .remove("lockout_target_name")
            .remove("lockout_target_type")
            .apply()
        Log.i(TAG, "Lockdown cancelled")
    }

    fun clearAllLockdownsAndStrikes(context: Context) {
        val prefs = getPrefs(context)
        val editor = prefs.edit()
        for (key in prefs.all.keys) {
            if (key.startsWith("violations:") || key.startsWith("lockouts_completed:") || key.startsWith("last_violation_time:")) {
                editor.remove(key)
            }
        }
        editor.putLong("lockdown_until", 0L)
        editor.putBoolean("is_lockout_active", false)
        editor.putLong("lockout_until_ms", 0L)
        editor.putInt("lockout_stage", 0)
        editor.remove("lockout_target_id")
        editor.remove("lockout_target_name")
        editor.remove("lockout_target_type")
        editor.apply()
        Log.i(TAG, "All focus lockdowns and violation strikes cleared successfully")
    }

    fun getStrikes(context: Context, targetKey: String): Int {
        checkAndResetDailyStrikes(context)
        val cleanKey = targetKey.trim().lowercase()
        return getPrefs(context).getInt("violations:$cleanKey", 0)
    }

    fun incrementStrikes(context: Context, targetKey: String): Int {
        checkAndResetDailyStrikes(context)
        val cleanKey = targetKey.trim().lowercase()
        val prefs = getPrefs(context)
        val current = prefs.getInt("violations:$cleanKey", 0)
        val updated = current + 1
        prefs.edit().putInt("violations:$cleanKey", updated).apply()
        return updated
    }

    fun resetStrikesForTarget(context: Context, targetKey: String) {
        val cleanKey = targetKey.trim().lowercase()
        getPrefs(context).edit()
            .remove("violations:$cleanKey")
            .remove("lockouts_completed:$cleanKey")
            .apply()
    }

    fun checkAndResetDailyStrikes(context: Context) {
        val prefs = getPrefs(context)
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val lastReset = prefs.getString("violations_reset_date", "")

        if (todayStr != lastReset) {
            val editor = prefs.edit()
            for (key in prefs.all.keys) {
                if (key.startsWith("violations:") || key.startsWith("lockouts_completed:")) {
                    editor.remove(key)
                }
            }
            editor.putString("violations_reset_date", todayStr)
            editor.apply()
            Log.i(TAG, "Daily violation strike counters rolled over for $todayStr")
        }
    }

    fun getAllStrikeCounts(context: Context): Map<String, Int> {
        checkAndResetDailyStrikes(context)
        val prefs = getPrefs(context)
        val result = HashMap<String, Int>()
        for ((key, value) in prefs.all) {
            if (key.startsWith("violations:") && value is Int) {
                val target = key.substringAfter("violations:")
                result[target] = value
            }
        }
        return result
    }
}

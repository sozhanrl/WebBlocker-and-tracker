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
 * Coordinates 5-strike device lockdown via DeviceAdmin lockNow(),
 * persistent lockdown_until tracking, re-lock verification, and
 * daily strike rollover ("violations:<target>").
 */
object LockdownManager {

    private const val TAG = "LockdownManager"
    private const val PREFS_NAME = "focus_blocker_prefs"
    const val LOCKDOWN_DURATION_MS = 5 * 60_000L // 5 minutes

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
     * Triggers a 5-minute device lockdown after 5 strikes on the same target.
     * Locks screen immediately via Device Admin lockNow(), persists lockdown_until,
     * resets that specific target's strike counter, and launches LockdownOverlayActivity.
     */
    fun triggerLockdown(
        context: Context,
        targetId: String = "",
        targetType: String = "",
        targetName: String = ""
    ) {
        val prefs = getPrefs(context)
        val now = System.currentTimeMillis()
        val lockdownUntil = now + LOCKDOWN_DURATION_MS

        val editor = prefs.edit()
        editor.putLong("lockdown_until", lockdownUntil)
        editor.putBoolean("is_lockout_active", true)
        editor.putLong("lockout_until_ms", lockdownUntil)
        if (targetId.isNotBlank()) {
            editor.putString("lockout_target_id", targetId)
            editor.putString("lockout_target_type", targetType)
            editor.putString("lockout_target_name", targetName)
            // Reset that specific target's strike counter
            editor.putInt("violations:$targetId", 0)
            editor.remove("warn_count_${targetType}_$targetId")
        }
        editor.apply()

        Log.w(TAG, "🚨 5-STRIKE LOCKDOWN TRIGGERED for '$targetId' until $lockdownUntil")

        // 1. Lock screen immediately via Device Admin if permission granted
        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
        val adminComponent = ComponentName(context, FocusDeviceAdminReceiver::class.java)

        if (dpm != null && dpm.isAdminActive(adminComponent)) {
            try {
                dpm.lockNow()
                Log.i(TAG, "DevicePolicyManager.lockNow() executed successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Error executing lockNow(): ${e.message}")
            }
        } else {
            Log.w(TAG, "Device Admin not active. Relying on full-screen countdown overlay.")
        }

        // 2. Launch full-screen unskippable countdown overlay
        try {
            val overlayIntent = Intent(context, LockdownOverlayActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                putExtra(LockdownOverlayActivity.EXTRA_LOCKDOWN_UNTIL, lockdownUntil)
                putExtra(LockdownOverlayActivity.EXTRA_TARGET_NAME, targetName.ifBlank { targetId })
            }
            context.startActivity(overlayIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Error launching LockdownOverlayActivity: ${e.message}")
        }
    }

    /**
     * Re-locks the screen if lockdown is still active (used on SCREEN_ON / USER_PRESENT).
     */
    fun enforceLockdownIfActive(context: Context) {
        val prefs = getPrefs(context)
        val lockdownUntil = prefs.getLong("lockdown_until", 0L)
        val now = System.currentTimeMillis()

        if (now < lockdownUntil) {
            Log.w(TAG, "Lockdown is active (${(lockdownUntil - now) / 1000}s left). Enforcing screen re-lock & overlay.")

            val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
            val adminComponent = ComponentName(context, FocusDeviceAdminReceiver::class.java)
            if (dpm != null && dpm.isAdminActive(adminComponent)) {
                try {
                    dpm.lockNow()
                } catch (e: Exception) {
                    Log.e(TAG, "Error during re-lock: ${e.message}")
                }
            }

            // Also ensure overlay activity is top
            try {
                val overlayIntent = Intent(context, LockdownOverlayActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                    putExtra(LockdownOverlayActivity.EXTRA_LOCKDOWN_UNTIL, lockdownUntil)
                }
                context.startActivity(overlayIntent)
            } catch (e: Exception) {
                // Ignore
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
            .apply()
        Log.i(TAG, "Lockdown cancelled")
    }

    // =========================================================================
    // STRIKE COUNTERS (Key format: "violations:<packageName>" / "violations:<domain>")
    // =========================================================================

    fun checkAndResetDailyStrikes(context: Context) {
        val prefs = getPrefs(context)
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val lastReset = prefs.getString("violations_reset_date", "")

        if (todayStr != lastReset) {
            val editor = prefs.edit()
            for (key in prefs.all.keys) {
                if (key.startsWith("violations:")) {
                    editor.remove(key)
                }
            }
            editor.putString("violations_reset_date", todayStr)
            editor.apply()
            Log.i(TAG, "Daily violation strike counters rolled over for $todayStr")
        }
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
        Log.i(TAG, "Strike $updated/5 recorded for '$cleanKey'")
        return updated
    }

    fun resetStrikesForTarget(context: Context, targetKey: String) {
        val cleanKey = targetKey.trim().lowercase()
        getPrefs(context).edit().remove("violations:$cleanKey").apply()
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

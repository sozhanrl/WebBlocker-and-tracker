package com.openfocus.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.openfocus.app.manager.LockdownManager

/**
 * LockdownReceiver
 *
 * Dynamically registered receiver that intercepts SCREEN_ON and USER_PRESENT
 * to re-lock the device and present the lockdown countdown if a 5-minute
 * focus lockdown is active.
 */
class LockdownReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "LockdownReceiver"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val action = intent.action
        Log.d(TAG, "Received broadcast action: $action")

        if (action == Intent.ACTION_SCREEN_ON || action == Intent.ACTION_USER_PRESENT) {
            if (LockdownManager.isLockdownActive(context)) {
                val remSec = LockdownManager.getRemainingLockdownSec(context)
                Log.d(TAG, "Screen wake during active focus lockdown ($remSec sec remaining). Guarded by AccessibilityService.")
                // Note: Do NOT invoke dpm.lockNow() or launch overlays on screen wake.
                // OpenFocusAccessibilityService will enforce restrictions if the user opens the restricted target.
            }
        }
    }
}

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
 * to re-lock the device and present the lockdown countdown if a focus lockdown
 * (5 or 30 minutes) is currently active.
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
                Log.w(TAG, "User attempted screen unlock during active lockdown -> re-locking and showing countdown overlay")
                LockdownManager.enforceLockdownIfActive(context)
            }
        }
    }
}

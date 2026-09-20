package com.openfocus.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED || action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            Log.d("BootReceiver", "Device boot completed or package updated. Restoring FocusForge routines...")

            val prefs = context.getSharedPreferences("focus_blocker_prefs", Context.MODE_PRIVATE)
            val isBlockingActive = prefs.getBoolean("is_blocking_active", true)

            // Reset transient timer flags on device reboot
            prefs.edit()
                .putBoolean("is_focus_session_active", false)
                .putLong("emergency_unlock_until", 0L)
                .apply()
        }
    }
}

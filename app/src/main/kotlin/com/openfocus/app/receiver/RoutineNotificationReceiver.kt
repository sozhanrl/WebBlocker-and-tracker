package com.openfocus.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.openfocus.app.manager.RoutineNotificationManager

/**
 * RoutineNotificationReceiver
 *
 * Intercepts Android OS system time ticks (ACTION_TIME_TICK) every minute,
 * as well as device boot and clock changes, to update the persistent
 * NEET Daily Study Routine notification.
 */
class RoutineNotificationReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "RoutineNotifReceiver"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val action = intent.action
        Log.d(TAG, "Received routine action: $action")

        when (action) {
            Intent.ACTION_TIME_TICK,
            Intent.ACTION_TIME_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED -> {
                RoutineNotificationManager.updateNotification(context)
            }
        }
    }
}

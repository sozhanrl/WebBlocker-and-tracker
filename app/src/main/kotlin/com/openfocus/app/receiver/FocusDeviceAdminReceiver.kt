package com.openfocus.app.receiver

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.Toast

/**
 * FocusDeviceAdminReceiver
 *
 * Implements DeviceAdminReceiver to support USES_POLICY_FORCE_LOCK.
 * Used exclusively by LockdownManager to call lockNow() during 5-minute
 * and 30-minute study lockdowns after warnings on blocked targets.
 */
class FocusDeviceAdminReceiver : DeviceAdminReceiver() {

    companion object {
        private const val TAG = "FocusDeviceAdmin"
    }

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Log.i(TAG, "Device Admin enabled for Focus Lockdown")
        Toast.makeText(context, "Focus Lockdown Guard Enabled", Toast.LENGTH_SHORT).show()
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Log.i(TAG, "Device Admin disabled")
    }
}

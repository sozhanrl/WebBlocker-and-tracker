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
 * focus lockdowns after 5 strikes on a blocked app/website.
 */
class FocusDeviceAdminReceiver : DeviceAdminReceiver() {

    companion object {
        private const val TAG = "FocusDeviceAdmin"
    }

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Log.i(TAG, "Device Admin enabled for 5-Strike Focus Lockdown")
        Toast.makeText(context, "5-Strike Focus Lockdown Enabled", Toast.LENGTH_SHORT).show()
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Log.i(TAG, "Device Admin disabled")
    }
}

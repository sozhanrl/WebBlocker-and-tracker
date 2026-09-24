package com.openfocus.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.openfocus.app.bridge.FocusBlockerPlugin
import com.openfocus.app.manager.RoutineNotificationManager

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(FocusBlockerPlugin::class.java)
        super.onCreate(savedInstanceState)
        RoutineNotificationManager.updateNotification(this)
    }
}

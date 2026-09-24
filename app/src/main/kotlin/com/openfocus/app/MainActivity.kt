package com.openfocus.app

import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.openfocus.app.manager.RoutineNotificationManager
import com.openfocus.app.receiver.RoutineNotificationReceiver
import com.openfocus.app.ui.navigation.OpenFocusNavHost
import com.openfocus.app.ui.theme.OpenFocusTheme
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main entry point of the OpenFocus application.
 * Sets up the Compose UI with navigation, theming, and routine notifications.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private var routineReceiver: RoutineNotificationReceiver? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install splash screen before calling super.onCreate
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Clear any residual countdown lockouts so the device is immediately unlocked
        com.openfocus.app.manager.LockdownManager.clearAllLockdownsAndStrikes(this)

        // Initialize persistent NEET daily routine notification
        RoutineNotificationManager.updateNotification(this)

        setContent {
            OpenFocusTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    OpenFocusNavHost()
                }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        if (routineReceiver == null) {
            try {
                routineReceiver = RoutineNotificationReceiver()
                val filter = IntentFilter().apply {
                    addAction(Intent.ACTION_TIME_TICK)
                    addAction(Intent.ACTION_TIME_CHANGED)
                    addAction(Intent.ACTION_TIMEZONE_CHANGED)
                }
                registerReceiver(routineReceiver, filter)
            } catch (_: Exception) {}
        }
        RoutineNotificationManager.updateNotification(this)
    }

    override fun onStop() {
        super.onStop()
        if (routineReceiver != null) {
            try {
                unregisterReceiver(routineReceiver)
            } catch (_: Exception) {}
            routineReceiver = null
        }
    }
}

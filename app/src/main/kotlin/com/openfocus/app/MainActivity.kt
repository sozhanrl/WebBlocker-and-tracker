package com.openfocus.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.openfocus.app.ui.navigation.OpenFocusNavHost
import com.openfocus.app.ui.theme.OpenFocusTheme
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main entry point of the OpenFocus application.
 * Sets up the Compose UI with navigation and theming.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install splash screen before calling super.onCreate
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            OpenFocusTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    OpenFocusNavHost()
                }
            }
        }
    }
}

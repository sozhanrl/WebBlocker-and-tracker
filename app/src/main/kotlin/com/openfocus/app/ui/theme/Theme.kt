package com.openfocus.app.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// ===== DARK COLOR SCHEME =====
private val DarkColorScheme = darkColorScheme(
    primary = AccentBlue,
    onPrimary = Color.White,
    primaryContainer = NavyCard,
    onPrimaryContainer = AccentBlue,
    secondary = AccentGreen,
    onSecondary = NavyDeep,
    secondaryContainer = NavyCardSecondary,
    onSecondaryContainer = AccentGreen,
    tertiary = AccentPurple,
    onTertiary = Color.White,
    tertiaryContainer = NavyCardSecondary,
    onTertiaryContainer = AccentPurple,
    error = AccentRed,
    onError = Color.White,
    errorContainer = Color(0xFF4D1A25),
    onErrorContainer = AccentRed,
    background = NavyDeep,
    onBackground = TextPrimary,
    surface = NavyCard,
    onSurface = TextPrimary,
    surfaceVariant = NavyCardSecondary,
    onSurfaceVariant = TextSecondary,
    outline = BorderSubtle,
    outlineVariant = BorderCard,
    inverseSurface = Color(0xFFD4E4F3),
    inverseOnSurface = NavyDeep,
    inversePrimary = AccentBlueDim,
    surfaceTint = AccentBlue,
    scrim = Color(0x99000000)
)

// ===== LIGHT COLOR SCHEME =====
private val LightColorScheme = lightColorScheme(
    primary = LightAccentBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD6E8FF),
    onPrimaryContainer = Color(0xFF001D36),
    secondary = LightAccentGreen,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFCCF5E8),
    onSecondaryContainer = Color(0xFF00211A),
    tertiary = Color(0xFF6B46C1),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFE8D9FF),
    onTertiaryContainer = Color(0xFF1A0050),
    error = Color(0xFFD32F2F),
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = LightTextSecondary,
    outline = Color(0xFF8BAAB8),
    outlineVariant = Color(0xFFBDD4E2),
    inverseSurface = Color(0xFF1A3244),
    inverseOnSurface = Color(0xFFE8F4FF),
    inversePrimary = AccentBlue,
    surfaceTint = LightAccentBlue,
    scrim = Color(0x99000000)
)

/**
 * OpenFocus app theme.
 * Supports dark mode, light mode, and system default.
 * Dynamic color is supported on Android 12+ but defaults to our brand palette.
 *
 * @param darkTheme Whether to use dark theme. Defaults to system setting.
 * @param dynamicColor Whether to use Material You dynamic colors (Android 12+).
 *                     Disabled by default to maintain brand identity.
 */
@Composable
fun OpenFocusTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Color.Transparent.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = OpenFocusTypography,
        content = content
    )
}

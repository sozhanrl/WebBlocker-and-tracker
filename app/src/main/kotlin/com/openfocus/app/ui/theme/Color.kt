package com.openfocus.app.ui.theme

import androidx.compose.ui.graphics.Color

// ===== DARK THEME COLORS =====
// Primary palette — deep navy blues
val NavyDeep = Color(0xFF101D2B)        // Primary background
val NavyCard = Color(0xFF203447)         // Card background
val NavyCardSecondary = Color(0xFF263D50) // Secondary card
val NavyElevated = Color(0xFF2D4A61)     // Elevated surfaces

// Accent colors
val AccentBlue = Color(0xFF3287E8)       // Primary accent / interactive
val AccentBlueDim = Color(0xFF1E6EC4)    // Pressed/dim accent
val AccentGreen = Color(0xFF32C997)      // Success / streak
val AccentOrange = Color(0xFFFF8C42)     // Warning / NORMAL mode
val AccentRed = Color(0xFFFF4D6D)        // Error / danger / STRICT mode
val AccentPurple = Color(0xFF8B5CF6)     // Focus timer

// Text colors
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFF8BA5BB)    // Muted blue-gray
val TextTertiary = Color(0xFF5C7A8E)

// Dividers and borders
val BorderSubtle = Color(0xFF2A4157)
val BorderCard = Color(0xFF334D63)

// Status colors
val StatusOff = Color(0xFF64748B)
val StatusNormal = AccentBlue
val StatusStrict = AccentRed

// ===== LIGHT THEME COLORS =====
val LightBackground = Color(0xFFF0F4F8)
val LightSurface = Color(0xFFFFFFFF)
val LightSurfaceVariant = Color(0xFFE8F0F7)
val LightCard = Color(0xFFFFFFFF)
val LightCardSecondary = Color(0xFFF5F9FD)

val LightAccentBlue = Color(0xFF1A6FD4)
val LightAccentGreen = Color(0xFF0FAF80)
val LightTextPrimary = Color(0xFF0D1B2A)
val LightTextSecondary = Color(0xFF4A6582)

// ===== SEMANTIC COLORS =====
val BlockingActiveColor = AccentGreen
val BlockingInactiveColor = StatusOff
val FocusActiveColor = AccentPurple
val StreakColor = Color(0xFFFFB347)      // Warm orange for streak

// Chart colors
val ChartColor1 = AccentBlue
val ChartColor2 = AccentGreen
val ChartColor3 = AccentOrange
val ChartColor4 = AccentPurple
val ChartColor5 = Color(0xFFFF6B9D)

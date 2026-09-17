# FocusForge — Native Android Bridge & System Architecture

This document provides the native Android architecture required when packaging **FocusForge** as a hybrid or native Android application (via Capacitor, React Native, or a native Kotlin WebView wrapper).

---

## 1. Required System Permissions & Disclosures

| Permission | Purpose | User Flow / Settings Intent |
|------------|---------|-----------------------------|
| `PACKAGE_USAGE_STATS` | Retrieve screen time and app usage statistics | `Settings.ACTION_USAGE_ACCESS_SETTINGS` |
| `BIND_ACCESSIBILITY_SERVICE` | Real-time foreground app detection to trigger the block screen overlay | `Settings.ACTION_ACCESSIBILITY_SETTINGS` |
| `FOREGROUND_SERVICE` & `POST_NOTIFICATIONS` | Background Pomodoro timer & persistent notification channel | Android 13+ runtime permission prompt |
| `BIND_VPN_SERVICE` *(Optional)* | Local DNS loopback filter (`127.0.0.1`) for domain blocking | `VpnService.prepare(context)` |
| `RECEIVE_BOOT_COMPLETED` | Reschedule active study routines after device restart | Manifest declaration |

> [!IMPORTANT]
> In web browsers, app blocking is simulated via in-app interceptions and redirects. Real operating system app blocking strictly requires the native Android services detailed below.

---

## 2. Core Native Services Architecture

```
android/
├── app/src/main/
│   ├── AndroidManifest.xml
│   └── kotlin/com/focusforge/app/
│       ├── bridge/
│       │   └── FocusForgeBridge.kt           # JavaScript <-> Native Kotlin Bridge
│       ├── service/
│       │   ├── AppBlockAccessibilityService.kt # Foreground App Interceptor
│       │   ├── StudyTimerForegroundService.kt  # Background Study Timer
│       │   └── LocalDnsVpnService.kt           # Local Domain Blocker
│       ├── manager/
│       │   ├── UsageStatsTracker.kt           # Screen-time analytics
│       │   └── ScheduleWorker.kt              # WorkManager routine scheduler
│       └── ui/
│           └── NativeBlockOverlayActivity.kt  # System Alert Window block screen
```

---

## 3. Kotlin Service Specifications

### A. Accessibility Service (`AppBlockAccessibilityService.kt`)
```kotlin
class AppBlockAccessibilityService : AccessibilityService() {

    private val blockedPackages = mutableSetOf(
        "com.instagram.android",
        "com.google.android.youtube",
        "com.facebook.katana"
    )

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val foregroundPackage = event.packageName?.toString() ?: return

            if (isStudySessionActive() && blockedPackages.contains(foregroundPackage)) {
                // Launch Native Block Screen Overlay immediately
                val intent = Intent(this, NativeBlockOverlayActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    putExtra("BLOCKED_PACKAGE", foregroundPackage)
                }
                startActivity(intent)
            }
        }
    }

    override fun onInterrupt() {}
}
```

### B. UsageStatsTracker (`UsageStatsTracker.kt`)
```kotlin
class UsageStatsTracker(private val context: Context) {

    fun getDailyAppUsage(startTime: Long, endTime: Long): Map<String, Long> {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        return stats.associate { it.packageName to it.totalTimeInForeground }
    }
}
```

### C. Background Timer (`StudyTimerForegroundService.kt`)
Uses `NotificationCompat.Builder` with a high-priority ongoing notification showing remaining time, NEET subject, and pause/resume actions.

---

## 4. WebView / Capacitor JavaScript Interface

When running in the Android shell, the web app calls:
```javascript
// Check native capability
if (window.FocusForgeAndroid) {
    // Sync block list with native AccessibilityService
    window.FocusForgeAndroid.updateBlockedPackages(JSON.stringify(['com.instagram.android', 'com.google.android.youtube']));

    // Request usage stats permission
    window.FocusForgeAndroid.requestUsagePermission();
}
```

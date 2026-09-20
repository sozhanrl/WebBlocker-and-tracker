# FocusForge / OpenFocus — Native Android Bridge & System Architecture

This document provides the native Android architecture required and implemented in **FocusForge / OpenFocus** (`com.openfocus.app`), built with Capacitor + React/TS + Kotlin Native Services.

---

## 1. Required System Permissions & Policies

| Permission / Policy | Purpose | User Flow / Settings Intent |
| :--- | :--- | :--- |
| `PACKAGE_USAGE_STATS` | Retrieve real-time screen time and app usage statistics | `Settings.ACTION_USAGE_ACCESS_SETTINGS` |
| `BIND_ACCESSIBILITY_SERVICE` | Real-time foreground app window detection (`TYPE_WINDOW_STATE_CHANGED`) to intercept blocked apps | `Settings.ACTION_ACCESSIBILITY_SETTINGS` |
| `BIND_DEVICE_ADMIN` / `<force-lock />` | Immediate screen locking via `DevicePolicyManager.lockNow()` on 5th strike | `DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN` |
| `FOREGROUND_SERVICE` & `POST_NOTIFICATIONS` | Background Pomodoro timer & persistent notification channel | Android 13+ runtime permission prompt |
| `BIND_VPN_SERVICE` | Local on-device DNS loopback filter (`10.200.0.2:53` -> `127.0.0.1`) for domain blocking | `VpnService.prepare(context)` |
| `RECEIVE_BOOT_COMPLETED` | Reschedule active study routines after device restart | Manifest declaration |

---

## 2. Core Native Architecture Structure

```
android/app/src/main/
├── AndroidManifest.xml
├── res/
│   ├── xml/
│   │   ├── accessibility_service_config.xml
│   │   └── device_admin_policy.xml           # USES_POLICY_FORCE_LOCK
│   └── layout/
│       ├── activity_block_screen.xml          # App HUD Warning & Lockout Screen
│       ├── activity_website_blocked.xml       # Domain Interstitial Screen
│       └── activity_lockdown_overlay.xml      # Immersive 5-min Countdown Overlay
└── java/com/openfocus/app/
    ├── bridge/
    │   └── FocusBlockerPlugin.kt              # Capacitor Plugin (Strikes, Permissions, Blocking)
    ├── manager/
    │   ├── BlockingStateManager.kt            # Central thread-safe state manager
    │   ├── LockdownManager.kt                 # 5-Strike tracking & Device Admin lockNow()
    │   ├── InstalledAppsManager.kt            # Real PackageManager launchable app loader
    │   ├── UsageStatsTracker.kt               # App usage analytics
    │   └── BatteryOptimizationHelper.kt       # OEM background persistence
    ├── receiver/
    │   ├── FocusDeviceAdminReceiver.kt        # Device Admin Receiver
    │   ├── LockdownReceiver.kt                # Runtime listener for SCREEN_ON & USER_PRESENT
    │   └── BootReceiver.kt                    # Device reboot recovery
    ├── service/
    │   ├── accessibility/
    │   │   └── OpenFocusAccessibilityService.kt # Foreground App Interceptor & Strike Trigger
    │   ├── vpn/
    │   │   └── OpenFocusVpnService.kt         # On-device DNS sinkhole & Domain Strike Trigger
    │   └── timer/
    │       └── FocusTimerService.kt           # Foreground study countdown notification
    └── ui/screens/blockscreen/
        ├── BlockScreenActivity.kt             # App Warning (1-4) & Lockout Screen
        ├── WebsiteBlockedActivity.kt          # Domain Warning (1-4) & Lockdown Screen
        └── LockdownOverlayActivity.kt         # Unskippable immersive 5-minute lockdown overlay
```

---

## 3. 5-Strike Warning & Device Lockdown System

### A. Strike Tracking & Daily Rollover
- **Storage:** `SharedPreferences("focus_blocker_prefs")`
- **Key Pattern:**
  - Apps: `"violations:<packageName>"` (e.g. `"violations:com.instagram.android"`)
  - Domains: `"violations:<domain>"` (e.g. `"violations:pornhub.com"`)
- **Daily Rollover:** Stored under `"violations_reset_date"` (`yyyy-MM-dd`). Any strike query or increment automatically purges prior day counters.
- **Lockdown Trigger Reset:** When 5 strikes are reached on target `T`, `LockdownManager.triggerLockdown` resets `T`'s violation count to `0`.

### B. Sanctioned Non-Root Lockdown Mechanics
1. **Screen Lock:** Upon 5th strike, `LockdownManager.triggerLockdown()` executes `DevicePolicyManager.lockNow()`, setting `lockdown_until = System.currentTimeMillis() + 300_000L`.
2. **Re-Lock Loop:** A dynamically registered `LockdownReceiver` listens for `Intent.ACTION_SCREEN_ON` and `Intent.ACTION_USER_PRESENT`. If `now < lockdown_until`, it immediately calls `devicePolicyManager.lockNow()` again.
3. **Unskippable Immersive Overlay:** `LockdownOverlayActivity` presents a live `MM:SS` countdown timer (`"Locked — back in 4:32"`), uses `SHOW_WHEN_LOCKED` / `TURN_SCREEN_ON`, and overrides `onBackPressed` as a no-op.

---

## 4. Capacitor JS / TS Native Bridge Interface

```typescript
// Permission diagnostics
const permissions = await getNativeBridge().checkPermissions();
console.log('Device Admin active:', permissions.hasDeviceAdmin);

// Request Device Admin for 5-Strike Lockdown
await getNativeBridge().requestPermission({ type: 'device_admin' });

// Query live strike counts
const { strikes, isLockdownActive, lockdownRemainingSec } = await getNativeBridge().getStrikeCounts();
```


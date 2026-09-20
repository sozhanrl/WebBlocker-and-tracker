# Mobile Implementation Architecture — NEET Tracker 2027

This document specifies the technical architecture of **NEET Tracker 2027**, detailing the dual-layer design connecting the cross-platform frontend (Responsive Web, PWA, and Capacitor WebView) with native Android operating system services.

---

## 1. System Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NEET Tracker 2027 Client                              │
│                                                                             │
│  [ React 18 + Vite + Tailwind CSS (Dark Navy #0B132B / #1C2541) ]           │
│  ├── Dashboard (Dynamic 5 May 2027 Countdown, Study Streak, Progress)       │
│  ├── NEET Chapter Planner (Physics, Chemistry, Botany, Zoology)             │
│  ├── Daily Checklist (14-Block Timetable, Active Highlight, Missed Reasons) │
│  ├── Focus Timer (Pomodoro Engine, Web Audio Synthesizer, Break Intervals)  │
│  ├── App & Website Blocker Interfaces (Schedules, Quotas, Strict Mode)      │
│  └── Storage & Sync (Local Storage Offline Cache + Supabase PostgreSQL)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Capacitor Bridge / Native Plugin IPC
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Android Native OS Services                            │
│                                                                             │
│  ├── 1. AccessibilityService (Window change events & block overlay)         │
│  ├── 2. UsageStatsManager (App screen time & usage quota enforcement)       │
│  ├── 3. VpnService (On-device DNS sinkhole loopback 127.0.0.1:53)          │
│  ├── 4. ForegroundService (Persistent study timer & lock notification)      │
│  └── 5. DeviceAdminReceiver (Device lockdown, anti-uninstall protection)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Platform Capability Boundaries (Web vs. Native Android)

### What Runs in Web / PWA (Browser Context):
1. **Chapter & Syllabus Planner**: Offline-capable storage of all NEET chapters with progress %, practice question logging (+4/-1 correct/wrong), and notes.
2. **Daily Timetable & Checklist**: Detection of the current routine block, block countdowns, date navigation, and missed-task logging with reasons.
3. **Pomodoro Focus Timer**: AudioContext synthesized chime, Web Notifications API, and session logging.
4. **Blocker Rules Management**: Configuring blocked package names, blocked domains, schedules, and strict mode.
5. **Simulated In-App Warning**: Modal overlays educating the student when browsing internal test screens.

### Why Web-Only Code Cannot Block Other Android Apps or Device Browsers:
- **Sandbox Isolation**: The browser runs inside an operating system sandbox and cannot monitor or terminate other processes (such as Instagram, YouTube, or Chrome).
- **Network Stack Restrictions**: A web page cannot intercept TCP/UDP packets or DNS queries initiated by external applications.

---

## 3. Native Android Architecture Components

### A. Kotlin `AccessibilityService` (Application Blocker)
- **Purpose**: Detects when the user brings a restricted application (e.g., `com.instagram.android`) into the foreground.
- **Implementation**:
  - Listens to `AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED`.
  - Extracts the active package name from `event.packageName`.
  - Checks if the package exists in the active `blocked_apps` SharedPreferences.
  - If blocked and current time falls within focus hours or exceeds daily limits:
    - Launches `LockdownOverlayActivity` with `FLAG_ACTIVITY_NEW_TASK`.
    - Dispatches a global `GLOBAL_ACTION_HOME` intent to return the user to the home launcher.
- **Permission**: `android.permission.BIND_ACCESSIBILITY_SERVICE` (Requires explicit user grant in Android Settings).

### B. `UsageStatsManager` (Screen Time & Quotas)
- **Purpose**: Accurately tracks foreground usage minutes per package over the past 24 hours.
- **Permission**: `android.permission.PACKAGE_USAGE_STATS` (Requires Special App Access > Usage Access).

### C. `VpnService` On-Device DNS Sinkhole (Website & Adult Content Blocker)
- **Purpose**: Intercepts outgoing port 53 DNS queries device-wide across all browsers and apps without proxying data to external servers.
- **Mechanism**:
  - Establishes a local virtual TUN interface (`10.0.0.2/32`).
  - Reads DNS queries from the TUN file descriptor.
  - Compares the requested hostname against the curated blocklist (64,000+ adult domains and custom user domains).
  - If blocked: Synthesizes a local DNS response pointing to `127.0.0.1` (sinkhole) with `RCODE_NXDOMAIN` or `NOERROR`.
  - If allowed: Forwards query to upstream DNS (e.g. Cloudflare `1.1.1.1` or Google `8.8.8.8`).
- **Privacy Guarantee**: Operates completely on-device. Zero browsing logs or search histories are transmitted to any cloud backend.

### D. `ForegroundService` with Notification
- **Purpose**: Prevents the Android system from killing the focus timer and blocking monitors during background operation.
- **Permission**: `android.permission.FOREGROUND_SERVICE` and `POST_NOTIFICATIONS`.

### E. `DeviceAdminReceiver` & Device Policy (5-Strike Warning & Anti-Tamper)
- **Purpose**: Enforces strict discipline mode by disabling camera, preventing app uninstallation during active study blocks, or triggering a temporary screen lock upon repeat infractions.
- **Permission**: `android.permission.BIND_DEVICE_ADMIN`.

---

## 4. Supabase Database Schema & Row-Level Security

All tables utilize UUID primary keys, user ownership references to `auth.users(id)`, and strict Row Level Security (RLS):

```sql
-- Example RLS Policy for NEET Chapters
ALTER TABLE public.neet_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chapter records"
ON public.neet_chapters
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Supported Database Entities:
1. `profiles`: Aspirant study goals, target exam date (`2027-05-05`), streak days.
2. `neet_chapters`: 81 NCERT chapters with progress, accuracy, and notes.
3. `daily_task_records`: Date-partitioned routine status and missed reasons.
4. `weekly_targets`: Weekly 4-subject goals and carry-forward archives.
5. `focus_sessions`: Logged Pomodoro focus blocks and difficulty ratings.
6. `mock_tests`: Sunday chapter-wise test records with (+4/-1) scores.
7. `blocked_apps` & `blocked_domains`: User rules synced across devices.

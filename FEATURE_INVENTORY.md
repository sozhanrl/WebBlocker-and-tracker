# FEATURE_INVENTORY.md
## Comprehensive Audit of Project 1 (NEET Checklist), Project 2 (WebBlocker / FocusForge), and Source 3 (Checklist Routines Screenshot)

This document contains a complete inventory of every feature, component, route, state model, database table, and service across all three sources integrated into **FocusForge — NEET 2027 Tracker + Checklist Routines + Study Planner + WebBlocker**.

---

## 1. Project 1: NEET Checklist (`P:\neet checklist`)

| Feature Name | File / Location | UI / Screen Component | Database Table | State & Storage | Key Behavior & Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Complete 81-Chapter NEET Syllabus** | `index.html` | NEET Checklist / Subject Tabs | `neet_chapters`, `chapter_progress` | LocalStorage + Supabase UPSERT | Full NCERT syllabus across Physics (20 units), Chemistry (20 units), Botany (24 units), Zoology (27 units). Supports questions solved, correct, wrong, unattempted, accuracy %, revision count, notes, status pills (*Not Started*, *In Progress*, *Revision*, *Completed*, *Weak Area*, *On Hold*). |
| **Biology Organization Modes** | `index.html`, `config.js` | NEET Settings / Subject Tabs | `neet_settings` | LocalStorage + Supabase | Allows toggling between *Separate Botany and Zoology* (default), *Combined Biology*, and *Custom Subject Assignment*. |
| **Weekly NEET Target Engine** | `index.html` | Weekly Targets Section | `weekly_neet_targets` | LocalStorage + Supabase | Allows setting weekly chapter targets for Physics, Chemistry, Botany, Zoology; track completion, carry-forward missed targets, and view weekly archive history. |
| **Sunday Mock Test Logger** | `index.html` | Mock Test Modal & Tab | `mock_tests` | LocalStorage + Supabase | Standard NEET (+4 / -1) scoring formula, question breakdown, subject-wise logging, weak topic diagnosis, and historical score trend table. |
| **Spaced Revision System** | `index.html` | Revision Planner Section | `neet_chapters`, `calendar_events` | LocalStorage + Supabase | Tracks Revision 1 (1d), Revision 2 (3d), Revision 3 (7d), Revision 4 (15d/30d), next revision date, overdue alerts, and revision score. |
| **Question Bank & MCQ Tracker** | `index.html` | Chapter Analytics Modal | `neet_chapters`, `mock_tests` | LocalStorage + Supabase | Tracks question attempts by chapter with accuracy %, correct/incorrect breakdown, and difficulty level. |
| **Daily Routine & Checklists** | `index.html` | Daily Checklists Tab | `checklists`, `checklist_items` | LocalStorage + Supabase | Daily time-blocked routine including morning routine, engineering college classes (2:00 PM – 7:00 PM), and evening deep study. |
| **Sleep & Circadian Tracker** | `index.html` | Sleep Tracking Widget | `sleep_records` | LocalStorage + Supabase | Bedtime tracking (10:00 PM prompt), wake times, and sleep consistency streaks. |
| **Calendar & Time Blocking** | `index.html` | Calendar Tab | `calendar_events` | LocalStorage + Supabase | Visual calendar events linked to tasks, mock tests, and revision deadlines. |
| **Supabase Multi-Device Auth & Sync** | `config.js`, `supabase-schema.sql` | Auth Modal / Settings | `profiles`, 14 tables with RLS | Supabase Auth (PKCE) | Persistent session across devices, local vs global logout, real-time UPSERT sync with offline fallback. |
| **Installable PWA & Service Worker** | `manifest.json`, `sw.js` | Browser / Mobile Homescreen | N/A | Cache API, Service Worker v7 | Full offline access to checklists, timers, and local chapter data with background caching. |

---

## 2. Project 2: WebBlocker / FocusForge (`P:\webBlocker`)

| Feature Name | File / Location | UI / Screen Component | Database Table | State & Storage | Key Behavior & Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Interactive Home Dashboard** | `src/App.tsx`, `src/components/dashboard/` | `FocusScoreCard`, `TodayGoalCard`, `QuickActions`, `NeetCountdownCard` | `daily_analytics`, `profiles` | `AppContext`, `StorageEngine` | Dynamic greeting, NEET 2027 countdown badge, radial focus score (78%), productive vs distracted time, today's 6h target progress bar, and 5 quick action buttons. |
| **Focus Mode & Timer Engine** | `src/context/FocusTimerContext.tsx`, `src/components/focus/` | `FocusSetupModal`, `ActiveFocusOverlay`, `SessionCompleteModal` | `focus_sessions`, `study_sessions` | `FocusTimerContext`, React state | Animated SVG countdown ring, preset & custom durations (15m, 25m, 45m, 60m, 90m), subject tagging, Strict Mode with 30s unlock safeguard, confetti animation, distraction prevention counter. |
| **Categorized App Blocker** | `src/components/blocker/AppBlocker.tsx` | App Blocker View | `blocked_apps` | `AppContext`, `StorageEngine` | Search & filter by categories (Social, Games, Entertainment, Browsers, Messaging, Shopping), toggle switches, daily usage limits (e.g. 15m/day or strict 0m), simulated block trigger. |
| **Website & Domain Blocker** | `src/components/blocker/WebsiteBlocker.tsx` | Website Blocker View | `blocked_websites` | `AppContext`, `StorageEngine` | Add domain/URL with category and validation, toggle block status, instant delete, and test block screen simulator. |
| **Recurring Blocking Schedules** | `src/components/blocker/BlockingSchedules.tsx` | Blocking Schedules View | `blocking_schedules` | `AppContext`, `StorageEngine` | Pre-configured slots (*Morning Study Block*, *Evening Deep Study*, *College Hours*, *Sunday Mock Lockout*), custom schedule modal with repeat days and strict mode. |
| **Custom Block Screen Overlay** | `src/components/blocker/SimulatedBlockScreen.tsx` | Blocker Overlay Modal | N/A | `AppContext` | High-impact BlockSite-style blocker with NEET motivation quotes, reason for block, and *“Back to Study Timer”* redirect button. |
| **NEET Pomodoro Engine** | `src/components/study/PomodoroTimer.tsx` | Study Timer View | `study_sessions` | `FocusTimerContext`, `AppContext` | Interval presets (25/5, 50/10, 90/15, custom), NEET subject selector (Physics, Chemistry, Botany, Zoology, Maths), notes scratchpad, and difficulty rating reflection. |
| **Analytics & Insights (Recharts)** | `src/components/analytics/AnalyticsCharts.tsx` | Analytics View | `daily_analytics` | `AppContext` | Daily focus time bar chart (productive vs distracted hours), NEET subject distribution pie chart, weekly study hours line chart vs 6h target line, top distraction culprits. |
| **Daily Tasks Checklist** | `src/components/tasks/TaskChecklist.tsx`, `AddTaskModal.tsx` | Tasks View | `study_tasks` | `AppContext`, `StorageEngine` | Priority study tasks (Urgent, High, Med, Low) with subject filters, completion checkboxes, and one-click *“Focus”* timer launcher. |
| **Profile, Settings & JSON Backup** | `src/components/settings/ProfileScreen.tsx`, `SupabaseConfigModal.tsx`, `AuthModal.tsx` | Profile View & Modals | `user_settings`, `profiles` | `AppContext`, `supabase.ts` | Dark mode toggle, export JSON backup, import JSON backup, reset data, and direct Supabase URL/key configuration. |
| **Android Native Bridge Specification** | `android/ARCHITECTURE.md` | Android Services Spec | N/A | Android OS Services | Complete architectural spec for `AccessibilityService` (foreground app detection), `UsageStatsManager`, `ForegroundService` (timer notification), and `VpnService` (local DNS filter). |

---

## 3. Source 3: Uploaded Screenshot (NEET Tracker Checklist Routines)

| Feature Name | File / Location | UI / Screen Component | Database Table | State & Storage | Key Behavior & Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Header Top Navigation & Brand** | `src/components/layout/Header.tsx`, `DesktopNav.tsx` | App Header & Nav Bar | `profiles` | `AppContext` | Top-left brand: `NEET Tracker` with `2027` badge. Live interactive `[✓ Synced]` pill, notification tray with unread badge, user profile avatar, and 12-tab desktop nav. |
| **Checklist Routines Hub** | `src/components/checklists/ChecklistRoutinesHub.tsx` | Checklist Routines Main Page | `checklists`, `checklist_items` | `AppContext`, `StorageEngine` | Section header: *"Checklist Routines — Dedicated daily discipline checklists and step-by-step routines"*, `+ Create Checklist` button, recurrence filters (*All Routines*, *daily*, *weekly*, *custom*), and search bar. |
| **NEET 13-Block Routine Card** | `src/components/checklists/ChecklistRoutinesHub.tsx` | Routine Card Component | `checklists`, `checklist_items` | `AppContext`, `StorageEngine` | Exact schedule from screenshot: 05:00–07:00 Block 1, 07:00–07:30 Breakfast, 07:30–10:00 Block 2, 10:00–10:15 Break, 10:15–11:45 Block 3, 11:45–12:00 Break, 12:00–13:00 Block 4, 13:00–14:00 Lunch, 14:00–18:00 College, 18:00–18:30 Fitness, 18:30–19:30 Block 5, 19:30–20:00 Dinner, 20:00–21:45 Question solving Block 6, 22:00 Bedtime. |
| **Interactive Progress & Checkbox Logic** | `src/components/checklists/ChecklistRoutinesHub.tsx` | Routine Card Progress | `checklists` | `AppContext`, `StorageEngine` | Dynamic progress percentage calculation `(e.g. 0% Completed (0/14))`, visual progress bar filling dynamically, strike-through styling, reset all checks, duplicate, and delete. |
| **Study Block to Focus Mode Trigger** | `src/components/checklists/ChecklistRoutinesHub.tsx` | Routine Item Row | `focus_sessions` | `FocusTimerContext` | Each study block item features a `⚡ Focus` button that opens Focus Mode configured with the block's subject and duration. |
| **Interactive Study Calendar** | `src/components/calendar/CalendarHub.tsx`, `AddEventModal.tsx` | Calendar View | `calendar_events` | `AppContext`, `StorageEngine` | Full monthly timetable grid and daily agenda timeline with categorized slots for Mock Tests, Spaced Revision, College Timetable, and Study Routines. |
| **Persistent Username/Password Auth** | `src/components/settings/AuthModal.tsx` | Auth Modal | `profiles`, `auth.users` | `AppContext`, `localStorage`, `Supabase` | Supports login with username or email, secure session token persistence with "Remember Me" toggle, and guest student fallback. |
| **Cloud Synchronization System** | `src/context/AppContext.tsx`, `src/lib/storage.ts` | Global Context | 19 Supabase Tables | `AppContext`, `SyncState` | Full bi-directional data synchronization with `Synced`, `Syncing`, `Offline`, `Sync Failed` states and instant manual sync trigger. |

---

## 4. Final Unified Application Structure

```
FocusForge — NEET 2027 Tracker + Checklist Routines + Study Planner + WebBlocker
├── 1. Dashboard (Combined Focus Score + Today's Plan + NEET Countdown + Quick Actions)
├── 2. Tasks (Daily Study Tasks with Subject & Priority Filters + Quick Timer Launcher)
├── 3. Checklists (Checklist Routines Hub + 13-Block Daily Schedule + Custom Routine Creator)
├── 4. Calendar (Interactive Monthly Timetable + Daily Agenda + Exam & Revision Slots)
├── 5. Focus Mode (Pomodoro Timer + Full-Screen Overlay + Strict Blocker Integration)
├── 6. NEET Planner (81 NCERT Units Checklist + Question Counters (+4/-1) + Accuracy Tracking)
├── 7. Weekly Targets (Weekly 4-Subject Sprint Targets + Carry-Forward Missed Targets)
├── 8. App Blocker (App Usage Limits + Category Filters + Instant App Blocker)
├── 9. Website Blocker (Domain/URL Blocker + Wildcard Support + Block Screen Simulation)
├── 10. Blocking Schedules (Automated Recurring Blocking Slots + College Hours Auto-Block)
├── 11. Mock Tests (720-Marks NEET Simulator + Timed Test Engine + Weak Topic Analysis)
├── 12. College Timetable (Engineering Routine Editor + Class Hours 14:00–19:00 Synchronization)
├── 13. Analytics & Insights (Recharts Focus Bars + Subject Distribution Pie + NEET Score Trajectory)
├── 14. Settings & Profile (Persistent Username/Password Auth + Supabase Cloud + Local Backup/Restore)
├── 15. Android Native Architecture (AccessibilityService + UsageStats + VPN + Foreground Timer + Device Admin Lockdown)
├── 16. Adult Content Shield (Curated 64k+ Domain Blocklist + On-Device DNS Sinkhole + 30s Unlock Delay)
└── 17. 5-Strike Warning & Device Lockdown (DeviceAdminReceiver + LockdownManager + LockdownOverlayActivity + Daily Strike Rollover)
```

---

## 5. Adult Content Shield — Implementation & QA Verification Checklist

| Test Item | Verification Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **1. Blocklist Generator & Script** | Run `npm run update:blocklist` (`scripts/fetch-adult-blocklist.ts`). | Downloads StevenBlack porn-only blocklist, normalizes to apex domains, dedupes, and generates `src/lib/adultContentList.ts` (64,265 domains). | **PASS** |
| **2. Shield Toggle ON (Bulk Population)** | Navigate to Website Blocker tab. Toggle "Adult Content Shield" to **ON**. | Bulk adds all domains from `adultContentList.ts` to `blockedWebsites` with category `"Adult Content"`. Card updates to display *Curated Domains Active*. | **PASS** |
| **3. Reactive Native Sync to VPN Engine** | Inspect `AppContext.tsx` sync effect -> `getNativeBridge().updateBlockList()`. | Sends active domain list to Capacitor native bridge `FocusBlockerPlugin.kt`, which persists to Android `SharedPreferences` (`blocked_domains`). | **PASS** |
| **4. On-Device DNS Sinkhole Verification** | Start VPN Protection (`OpenFocusVpnService.kt`). Query/visit a blocked test domain (e.g. `pornhub.com`, `069porn.com`, or subdomains). | `OpenFocusVpnService` intercepts port 53 DNS query, returns `127.0.0.1` sinkhole A-record, and logs: `🚫 DNS SINKHOLE: Blocked domain ... -> 127.0.0.1`. | **PASS** |
| **5. 30-Second Unlock Delay Safeguard** | Toggle "Adult Content Shield" switch to **OFF**. | Initiates 30-second emergency countdown delay banner. Shield remains active during countdown. | **PASS** |
| **6. Cancel Unlock / Abort** | Tap *"Keep Shield Active"* button during the 30s countdown. | Countdown stops immediately. Shield remains locked and active. | **PASS** |
| **7. Completed Unlock Deletion Isolation** | Let the 30s countdown reach `0s`. | Cleans up only `"Adult Content"` category items from `blockedWebsites`, leaving custom blocked websites (e.g. `youtube.com`, `instagram.com`) intact. | **PASS** |
| **8. Persistent DNS Filtering Banner** | Check Website Blocker header. | Displays clear guidance: *"Uses on-device DNS filtering — for full protection, disable 'Secure DNS' / 'Private DNS' in your browser and Android network settings..."*. | **PASS** |

---

## 6. 5-Strike Warning & Device Lockdown Architecture

| Component | File Location | Key Capabilities & Android System Behavior |
| :--- | :--- | :--- |
| **Device Admin Receiver** | `receiver/FocusDeviceAdminReceiver.kt`, `res/xml/device_admin_policy.xml` | Declares `<force-lock />` policy. Allows non-root screen locking via `DevicePolicyManager.lockNow()`. |
| **Lockdown Manager** | `manager/LockdownManager.kt` | Tracks daily strikes (`violations:<target>`), triggers 5-minute lockdown (`lockdown_until`), re-locks on screen-on, resets target strike upon lockdown trigger, and handles daily date rollover (`violations_reset_date`). |
| **Dynamic Screen-On Receiver** | `receiver/LockdownReceiver.kt` | Dynamically registered at runtime in `OpenFocusAccessibilityService.onServiceConnected` for `ACTION_SCREEN_ON` and `ACTION_USER_PRESENT`. Re-locks screen if `now < lockdown_until`. |
| **Unskippable Lockdown Overlay** | `ui/screens/blockscreen/LockdownOverlayActivity.kt` | Immersive full-screen overlay displaying live `MM:SS` countdown timer (`"Locked — back in 4:32"`). Overrides `onBackPressed` as no-op. |
| **Website Block Interstitial** | `ui/screens/blockscreen/WebsiteBlockedActivity.kt` | Lightweight Activity launched from VPN Service context with `FLAG_ACTIVITY_NEW_TASK`. Shows prominent `"⚠️ Warning {STRIKE_COUNT}/5 — {domain}"` banner. |
| **Capacitor Plugin & Frontend** | `bridge/FocusBlockerPlugin.kt`, `src/lib/nativeBridge.ts`, `AndroidPermissionsCard.tsx` | Exposes `hasDeviceAdmin`, `'device_admin'` permission intent (`Settings.ACTION_ADD_DEVICE_ADMIN`), and `getStrikeCounts()`. Displays clear, plain-language non-root notice in settings. |



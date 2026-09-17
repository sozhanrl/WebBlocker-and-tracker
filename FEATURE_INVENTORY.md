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
└── 15. Android Native Architecture (AccessibilityService + UsageStats + VPN + Foreground Timer)
```

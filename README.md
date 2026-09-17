# FocusForge — AI Study Focus & Productivity Tracker (NEET 2027)

**FocusForge** is a modern, mobile-first study focus and productivity application inspired by BlockSite, crafted specifically for competitive exam aspirants (such as **NEET 2027**).

---

## Key Features

1. **Multi-Step Onboarding Flow**: Goal personalization, screen-time target selector, distraction filter, and circadian wake-up routine builder.
2. **Interactive Home Dashboard**: Focus Score radial ring, daily study hours progress bar, NEET 2027 countdown badge, quick actions, and study streak.
3. **Focus Mode & Timer**:
   - Customizable study countdown (15m, 25m, 45m, 60m, 90m, or Custom).
   - Strict Mode with 30-second emergency unlock safeguard.
   - Live distraction blocker and celebration confetti on completion.
4. **Distraction Blocker Engine**:
   - Categorized app blocker (Social Media, Games, Entertainment, Browsers, Messaging).
   - Website & domain blocker with custom URL matching.
   - Recurring study schedule automation (e.g. Mon–Fri 6–8 AM & 8–10 PM).
   - High-impact simulated block screen with NEET motivation quotes.
5. **NEET Pomodoro Study Timer**:
   - Study/break intervals: 25/5, 50/10, 90/15, or custom.
   - NEET subject tagging: **Physics**, **Chemistry**, **Botany**, **Zoology**, **Mathematics**.
   - Session notes scratchpad & post-study difficulty rating reflection.
6. **NEET 2027 Syllabus Tracker**:
   - NCERT Class 11 & 12 high-weightage chapter breakdown.
   - Status tracking: *Not Started*, *In Progress*, *Revision*, *Completed*.
   - Revision counter, target completion dates, and subject readiness bars.
7. **Analytics & Insights**:
   - Interactive **Recharts** charts: Daily focus time bar chart, weekly study hours line chart vs 6-hour target, subject distribution pie chart, and distraction culprit breakdown.
   - Date range filters: Today, This Week, This Month.
8. **Daily Study Tasks & Checklist**:
   - Priority task manager with subject tags, estimated minutes, and instant "Start Focus" button.
9. **Offline-First & Supabase Hybrid**:
   - Operates immediately out-of-the-box using reactive local storage with realistic student data.
   - Optional full cloud sync to **Supabase PostgreSQL** with complete SQL migration schema included.
10. **Android Native Bridge Architecture**:
   - Complete technical spec for packaging via Capacitor/Android with `AccessibilityService`, `UsageStatsManager`, and foreground services.

---

## Tech Stack

- **Frontend**: React 18 / 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Glassmorphism, Dark Mode palette (`#0B132B`, `#1C2541`)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend / Database**: Supabase (PostgreSQL with Row Level Security) + LocalStorage Fallback

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## Supabase Setup (Optional)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and run `supabase/schema.sql`.
3. In FocusForge, open **Profile & Settings** → **Configure Supabase** and enter your Project URL and Anon API Key.

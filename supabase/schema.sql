-- =========================================================================
-- FocusForge — Master PostgreSQL Schema for Supabase
-- Uniting NEET 2027 Study OS + WebBlocker with Row-Level Security
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    exam_goal TEXT DEFAULT 'NEET 2027 (Target: 680+ Marks)',
    exam_date DATE DEFAULT '2027-05-02',
    daily_target_minutes INTEGER DEFAULT 360,
    wake_up_time TIME DEFAULT '05:30:00',
    study_start_time TIME DEFAULT '06:30:00',
    engineering_class_start TIME DEFAULT '14:00:00',
    engineering_class_end TIME DEFAULT '19:00:00',
    biology_mode TEXT DEFAULT 'separate' CHECK (biology_mode IN ('separate', 'combined', 'custom')),
    streak_days INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 75,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. USER GOALS
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_goals TEXT[] DEFAULT '{}',
    distractions TEXT[] DEFAULT '{}',
    daily_screen_time_goal_hours NUMERIC(4,1) DEFAULT 6.0,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    weekly_physics_target INTEGER DEFAULT 1,
    weekly_chemistry_target INTEGER DEFAULT 1,
    weekly_botany_target INTEGER DEFAULT 1,
    weekly_zoology_target INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. NEET CHAPTERS (81 High-Yield NCERT Chapters + Custom)
CREATE TABLE IF NOT EXISTS public.neet_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('Physics', 'Chemistry', 'Botany', 'Zoology', 'Mathematics', 'Other')),
    title TEXT NOT NULL,
    unit_name TEXT,
    class_level TEXT DEFAULT 'Class 11' CHECK (class_level IN ('Class 11', 'Class 12')),
    weightage_percentage INTEGER DEFAULT 5,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Revision', 'Completed', 'Weak Area', 'On Hold')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    target_completion_date DATE,
    actual_completion_date DATE,
    last_revision_date DATE,
    next_revision_date DATE,
    revision_count INTEGER DEFAULT 0,
    study_time_minutes INTEGER DEFAULT 0,
    questions_solved INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    questions_wrong INTEGER DEFAULT 0,
    questions_unattempted INTEGER DEFAULT 0,
    accuracy_percentage NUMERIC(5,2) DEFAULT 0,
    mock_test_score INTEGER,
    difficulty TEXT DEFAULT 'Moderate' CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Very Hard')),
    notes TEXT,
    formulas TEXT,
    important_concepts TEXT,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    is_weak_topic BOOLEAN DEFAULT FALSE,
    custom_tags TEXT[] DEFAULT '{}',
    is_custom_chapter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_user_subject_chapter UNIQUE (user_id, subject, title)
);

-- 4. WEEKLY NEET TARGETS
CREATE TABLE IF NOT EXISTS public.weekly_neet_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    physics_chapter_id TEXT,
    chemistry_chapter_id TEXT,
    botany_chapter_id TEXT,
    zoology_chapter_id TEXT,
    physics_completed BOOLEAN DEFAULT FALSE,
    chemistry_completed BOOLEAN DEFAULT FALSE,
    botany_completed BOOLEAN DEFAULT FALSE,
    zoology_completed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'In Progress' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Missed', 'Carried Forward')),
    notes TEXT DEFAULT '',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_user_week_start UNIQUE (user_id, week_start)
);

-- 5. BLOCKED APPS
CREATE TABLE IF NOT EXISTS public.blocked_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    package_name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_blocked BOOLEAN DEFAULT TRUE,
    daily_limit_minutes INTEGER DEFAULT 0,
    used_today_minutes INTEGER DEFAULT 0,
    icon_name TEXT DEFAULT 'Smartphone',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. BLOCKED WEBSITES
CREATE TABLE IF NOT EXISTS public.blocked_websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Social Media',
    is_blocked BOOLEAN DEFAULT TRUE,
    block_subdomains BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. BLOCKING SCHEDULES
CREATE TABLE IF NOT EXISTS public.blocking_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}',
    is_enabled BOOLEAN DEFAULT TRUE,
    is_strict_mode BOOLEAN DEFAULT FALSE,
    blocked_app_ids TEXT[] DEFAULT '{}',
    blocked_website_ids TEXT[] DEFAULT '{}',
    subject_tag TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. FOCUS SESSIONS
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT now() NOT NULL,
    duration_minutes INTEGER NOT NULL,
    subject TEXT,
    chapter_title TEXT,
    task_title TEXT,
    distractions_prevented_count INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT TRUE,
    is_strict_mode BOOLEAN DEFAULT FALSE,
    difficulty TEXT,
    notes TEXT
);

-- 9. STUDY SESSIONS
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    chapter_title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Very Hard')),
    completed_target BOOLEAN DEFAULT TRUE,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    notes TEXT
);

-- 10. MOCK TESTS
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    test_date DATE DEFAULT CURRENT_DATE,
    duration_minutes INTEGER DEFAULT 200,
    total_marks INTEGER DEFAULT 720,
    score INTEGER NOT NULL,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    unanswered_count INTEGER DEFAULT 0,
    accuracy NUMERIC(5,2) DEFAULT 0,
    physics_score INTEGER DEFAULT 0,
    chemistry_score INTEGER DEFAULT 0,
    botany_score INTEGER DEFAULT 0,
    zoology_score INTEGER DEFAULT 0,
    weak_topics TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. QUESTION BANK
CREATE TABLE IF NOT EXISTS public.question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_option_index INTEGER NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'Moderate',
    year TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 12. QUESTION ATTEMPTS
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    selected_option_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. REVISION SCHEDULE
CREATE TABLE IF NOT EXISTS public.revision_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    chapter_title TEXT NOT NULL,
    subject TEXT NOT NULL,
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
    scheduled_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 14. STUDY TASKS
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    due_date DATE DEFAULT CURRENT_DATE,
    estimated_minutes INTEGER DEFAULT 60,
    actual_minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Missed', 'Deferred')),
    has_reminder BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 15. CHECKLISTS & ROUTINES
CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Daily Routine',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIME,
    end_time TIME,
    is_completed BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0
);

-- 15B. CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    start_time TIME,
    end_time TIME,
    type TEXT DEFAULT 'routine',
    subject TEXT,
    chapter_title TEXT,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 16. SLEEP RECORDS
CREATE TABLE IF NOT EXISTS public.sleep_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    bedtime TIME NOT NULL DEFAULT '22:00:00',
    wake_time TIME NOT NULL DEFAULT '05:30:00',
    hours_slept NUMERIC(4,2) DEFAULT 7.5,
    adhered_to_bedtime BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_user_sleep_date UNIQUE (user_id, date)
);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'study',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 18. USER SETTINGS
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_dark_mode BOOLEAN DEFAULT TRUE,
    focus_mode TEXT DEFAULT 'NORMAL',
    sound_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    break_reminders BOOLEAN DEFAULT TRUE,
    break_interval_minutes INTEGER DEFAULT 25,
    emergency_unlock_allowed BOOLEAN DEFAULT TRUE,
    emergency_unlock_delay_seconds INTEGER DEFAULT 30,
    exam_countdown_date DATE DEFAULT '2027-05-02',
    biology_mode TEXT DEFAULT 'separate',
    engineering_schedule_enabled BOOLEAN DEFAULT TRUE,
    engineering_class_start TIME DEFAULT '14:00:00',
    engineering_class_end TIME DEFAULT '19:00:00',
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 19. DAILY ANALYTICS
CREATE TABLE IF NOT EXISTS public.daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    productive_minutes INTEGER DEFAULT 0,
    distracted_minutes INTEGER DEFAULT 0,
    screen_time_minutes INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 75,
    focus_sessions_count INTEGER DEFAULT 0,
    tasks_completed_count INTEGER DEFAULT 0,
    mock_tests_taken INTEGER DEFAULT 0,
    questions_solved INTEGER DEFAULT 0,
    CONSTRAINT uq_user_daily_analytics UNIQUE (user_id, date)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neet_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_neet_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocking_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own profiles" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users own goals" ON public.user_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own neet_chapters" ON public.neet_chapters FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own weekly_targets" ON public.weekly_neet_targets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own blocked_apps" ON public.blocked_apps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own blocked_websites" ON public.blocked_websites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own schedules" ON public.blocking_schedules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own focus_sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own study_sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own mock_tests" ON public.mock_tests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own question_attempts" ON public.question_attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own revision_schedule" ON public.revision_schedule FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own study_tasks" ON public.study_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own checklists" ON public.checklists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own calendar_events" ON public.calendar_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own sleep_records" ON public.sleep_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own user_settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own daily_analytics" ON public.daily_analytics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_neet_chapters_user_subject ON public.neet_chapters (user_id, subject);
CREATE INDEX IF NOT EXISTS idx_neet_chapters_status ON public.neet_chapters (user_id, status);
CREATE INDEX IF NOT EXISTS idx_weekly_targets_user_week ON public.weekly_neet_targets (user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user_date ON public.mock_tests (user_id, test_date);
CREATE INDEX IF NOT EXISTS idx_study_tasks_user_date ON public.study_tasks (user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.calendar_events (user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_date ON public.daily_analytics (user_id, date);

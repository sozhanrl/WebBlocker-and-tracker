-- =========================================================================
-- NEET Tracker 2027 — Production PostgreSQL Database Migration
-- Uniting Study OS + Daily Routine + Chapter Planner + Blocker Rules
-- With Multi-Device Synchronization & Strict Row-Level Security (RLS)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'NEET Aspirant',
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    exam_goal TEXT DEFAULT 'NEET 2027 (Target: 680+ Marks)',
    exam_date DATE DEFAULT '2027-05-05',
    daily_target_minutes INTEGER DEFAULT 360,
    wake_up_time TIME DEFAULT '05:00:00',
    study_start_time TIME DEFAULT '05:00:00',
    streak_days INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 75,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. CHAPTERS (81 High-Yield NCERT Units)
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. phy-1, chem-1
    subject TEXT NOT NULL CHECK (subject IN ('Physics', 'Chemistry', 'Botany', 'Zoology')),
    name TEXT NOT NULL,
    class_level TEXT DEFAULT 'Class 11' CHECK (class_level IN ('Class 11', 'Class 12')),
    weightage_percentage INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. CHAPTER PROGRESS (User-Specific Tracking)
CREATE TABLE IF NOT EXISTS public.chapter_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Needs Revision')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    questions_solved INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    revision_count INTEGER DEFAULT 0,
    planned_date DATE,
    completed_date DATE,
    last_studied_date DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_user_subject_chapter UNIQUE (user_id, subject, name)
);

-- 4. WEEKLY TARGETS
CREATE TABLE IF NOT EXISTS public.weekly_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    physics_target_count INTEGER DEFAULT 1,
    chemistry_target_count INTEGER DEFAULT 1,
    botany_target_count INTEGER DEFAULT 1,
    zoology_target_count INTEGER DEFAULT 1,
    physics_chapter_name TEXT,
    chemistry_chapter_name TEXT,
    botany_chapter_name TEXT,
    zoology_chapter_name TEXT,
    physics_completed BOOLEAN DEFAULT FALSE,
    chemistry_completed BOOLEAN DEFAULT FALSE,
    botany_completed BOOLEAN DEFAULT FALSE,
    zoology_completed BOOLEAN DEFAULT FALSE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. DAILY TASKS (Master Routine Blueprint)
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    time_block TEXT NOT NULL,
    task_name TEXT NOT NULL,
    category TEXT DEFAULT 'study' CHECK (category IN ('study', 'personal', 'break', 'college', 'exercise', 'sleep')),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. DAILY TASK RECORDS (Historical Execution Log)
CREATE TABLE IF NOT EXISTS public.daily_task_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    task_identifier TEXT NOT NULL,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Missed', 'Skipped')),
    missed_reason TEXT CHECK (missed_reason IN ('College', 'Health', 'Family', 'Lack of sleep', 'Overslept', 'Phone distraction', 'Travel', 'Tiredness', 'Emergency', 'Other')),
    missed_explanation TEXT,
    recovery_plan TEXT,
    rescheduled_time TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_user_date_task UNIQUE (user_id, record_date, task_identifier)
);

-- 7. FOCUS SESSIONS
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT,
    chapter_name TEXT,
    duration_minutes INTEGER NOT NULL,
    session_type TEXT DEFAULT 'pomodoro',
    completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    notes TEXT DEFAULT ''
);

-- 8. MOCK TESTS (Sunday Chapter-Wise & Full-Length)
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    subject TEXT NOT NULL,
    chapters_covered TEXT[] DEFAULT '{}',
    total_questions INTEGER DEFAULT 180,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    unattempted_questions INTEGER DEFAULT 0,
    score INTEGER NOT NULL, -- (correct * 4) - (wrong * 1)
    time_taken_minutes INTEGER DEFAULT 200,
    weak_topics TEXT[] DEFAULT '{}',
    review_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. BLOCKER SETTINGS
CREATE TABLE IF NOT EXISTS public.blocker_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    strict_mode BOOLEAN DEFAULT FALSE,
    focus_only BOOLEAN DEFAULT TRUE,
    adult_shield_enabled BOOLEAN DEFAULT TRUE,
    safe_search_enabled BOOLEAN DEFAULT TRUE,
    local_ai_classifier_enabled BOOLEAN DEFAULT TRUE,
    emergency_unlock_delay_seconds INTEGER DEFAULT 30,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. BLOCKED DOMAINS
CREATE TABLE IF NOT EXISTS public.blocked_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    category TEXT DEFAULT 'Custom',
    enabled BOOLEAN DEFAULT TRUE,
    focus_only BOOLEAN DEFAULT FALSE,
    strict_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_user_domain UNIQUE (user_id, domain)
);

-- 11. NOTIFICATION SETTINGS
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    morning_reminder BOOLEAN DEFAULT TRUE,
    study_block_reminder BOOLEAN DEFAULT TRUE,
    focus_session_reminder BOOLEAN DEFAULT TRUE,
    missed_task_reminder BOOLEAN DEFAULT TRUE,
    weekly_chapter_reminder BOOLEAN DEFAULT TRUE,
    sunday_mock_reminder BOOLEAN DEFAULT TRUE,
    sleep_reminder BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME DEFAULT '23:00:00',
    quiet_hours_end TIME DEFAULT '06:00:00',
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 12. USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'dark_navy',
    sound_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each authenticated student accesses ONLY their personal study data
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_task_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocker_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles Policy
CREATE POLICY "Users can manage their profile" ON public.profiles
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Chapters (Public Read)
CREATE POLICY "Anyone can view standard chapters" ON public.chapters
    FOR SELECT USING (true);

-- Chapter Progress Policy
CREATE POLICY "Users can manage their chapter progress" ON public.chapter_progress
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Weekly Targets Policy
CREATE POLICY "Users can manage their weekly targets" ON public.weekly_targets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily Tasks & Records
CREATE POLICY "Users can manage their daily tasks" ON public.daily_tasks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their task records" ON public.daily_task_records
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Focus Sessions
CREATE POLICY "Users can manage their focus sessions" ON public.focus_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Mock Tests
CREATE POLICY "Users can manage their mock tests" ON public.mock_tests
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Blocker Settings & Domains
CREATE POLICY "Users can manage their blocker settings" ON public.blocker_settings
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their blocked domains" ON public.blocked_domains
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notification Settings & Preferences
CREATE POLICY "Users can manage their notification settings" ON public.notification_settings
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_chapter_progress_user ON public.chapter_progress(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_task_records_user_date ON public.daily_task_records(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user_date ON public.mock_tests(user_id, test_date);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON public.focus_sessions(user_id, completed_at);

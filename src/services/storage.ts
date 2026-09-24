import { NeetChapterRecord, ALL_NEET_CHAPTERS_DATA, NeetSubjectName, NeetChapterStatus } from '../data/neetChapters';

export interface DailyRoutineItem {
  id: string;
  time: string; // e.g. "05:00–07:00"
  task: string;
  category: 'study' | 'personal' | 'break' | 'college' | 'exercise' | 'sleep';
  defaultCompleted?: boolean;
}

// --- DAY-SPECIFIC TIMETABLES & ROUTINES ---

export const ROUTINE_MONDAY: DailyRoutineItem[] = [
  { id: 'rt-mon-1', time: '05:00–07:00', task: 'NEET Study Block 1: Physics (Mechanics & Laws of Motion)', category: 'study' },
  { id: 'rt-mon-2', time: '07:00–07:30', task: 'Breakfast and Bath (Morning Refresh)', category: 'personal' },
  { id: 'rt-mon-3', time: '07:30–10:00', task: 'NEET Study Block 2: Chemistry (Organic / Physical Numericals)', category: 'study' },
  { id: 'rt-mon-4', time: '10:00–10:15', task: 'Morning Break (Hydration & Stretch)', category: 'break' },
  { id: 'rt-mon-5', time: '10:15–11:45', task: 'NEET Study Block 3: Botany (NCERT Line-by-Line Reading)', category: 'study' },
  { id: 'rt-mon-6', time: '11:45–12:00', task: 'Midday Break (Eye Rest)', category: 'break' },
  { id: 'rt-mon-7', time: '12:00–13:00', task: 'NEET Study Block 4: Zoology (Human Physiology High-Yield)', category: 'study' },
  { id: 'rt-mon-8', time: '13:00–14:00', task: 'Lunch & Travel to College', category: 'personal' },
  { id: 'rt-mon-9', time: '14:00–14:50', task: 'UI/UX Design - TH (A2+TA2 - SJT221)', category: 'college' },
  { id: 'rt-mon-10', time: '15:00–15:50', task: 'Deep Learning - TH (F2+TF2 - SJT619)', category: 'college' },
  { id: 'rt-mon-11', time: '16:00–16:50', task: 'Cyber Security - TH (D2+TD2 - SJTG24)', category: 'college' },
  { id: 'rt-mon-12', time: '17:00–17:50', task: 'Software Metrics - TH (B2+TB2 - SJT115)', category: 'college' },
  { id: 'rt-mon-13', time: '18:00–18:50', task: 'Adv Competitive Coding - I - SS (G2+TG2 - SJT619)', category: 'college' },
  { id: 'rt-mon-14', time: '18:50–19:15', task: 'Evening Refresh & Tea Break', category: 'break' },
  { id: 'rt-mon-15', time: '19:15–20:00', task: 'NEET Study Block 5: Spaced Revision & Formula Sheets', category: 'study' },
  { id: 'rt-mon-16', time: '20:00–20:30', task: 'Dinner & Family Time', category: 'personal' },
  { id: 'rt-mon-17', time: '20:30–22:00', task: 'NEET Question Solving Block 6 (50 MCQ Speed Sprint)', category: 'study' },
  { id: 'rt-mon-18', time: '22:00–05:00', task: 'Bedtime Sleep (Recovery)', category: 'sleep' }
];

export const ROUTINE_TUESDAY: DailyRoutineItem[] = [
  { id: 'rt-tue-1', time: '05:00–07:00', task: 'NEET Study Block 1: Physics (Mechanics Problem Solving)', category: 'study' },
  { id: 'rt-tue-2', time: '07:00–07:30', task: 'Breakfast and Bath (Morning Refresh)', category: 'personal' },
  { id: 'rt-tue-3', time: '07:30–10:00', task: 'NEET Study Block 2: Chemistry (Inorganic Trends & NCERT)', category: 'study' },
  { id: 'rt-tue-4', time: '10:00–10:15', task: 'Morning Break (Hydration & Stretch)', category: 'break' },
  { id: 'rt-tue-5', time: '10:15–11:45', task: 'NEET Study Block 3: Botany (Plant Physiology Focus)', category: 'study' },
  { id: 'rt-tue-6', time: '11:45–12:00', task: 'Midday Break (Eye Rest)', category: 'break' },
  { id: 'rt-tue-7', time: '12:00–13:00', task: 'NEET Study Block 4: Zoology (Animal Kingdom / Genetics)', category: 'study' },
  { id: 'rt-tue-8', time: '13:00–14:00', task: 'Lunch & Travel to College', category: 'personal' },
  { id: 'rt-tue-9', time: '14:00–14:50', task: 'Software Metrics - TH (B2+TB2 - SJT115)', category: 'college' },
  { id: 'rt-tue-10', time: '15:00–15:50', task: 'Adv Competitive Coding - I - SS (G2+TG2 - SJT619)', category: 'college' },
  { id: 'rt-tue-11', time: '16:00–16:50', task: 'Software Configuration Management - TH (E2+TE2 - SJT204)', category: 'college' },
  { id: 'rt-tue-12', time: '17:00–17:50', task: 'Design Patterns - TH (C2+TC2 - SJT114)', category: 'college' },
  { id: 'rt-tue-13', time: '17:50–18:30', task: 'Badminton / Fitness & Refresh', category: 'exercise' },
  { id: 'rt-tue-14', time: '18:30–19:30', task: 'NEET Study Block 5: Spaced Revision (Physics / Chemistry)', category: 'study' },
  { id: 'rt-tue-15', time: '19:30–20:00', task: 'Dinner', category: 'personal' },
  { id: 'rt-tue-16', time: '20:00–21:45', task: 'NEET Question Solving Block 6 (50 MCQ Sprint)', category: 'study' },
  { id: 'rt-tue-17', time: '21:45–22:00', task: 'Night Routine & Wind Down', category: 'personal' },
  { id: 'rt-tue-18', time: '22:00–05:00', task: 'Bedtime Sleep (Recovery)', category: 'sleep' }
];

export const ROUTINE_WEDNESDAY: DailyRoutineItem[] = [
  { id: 'rt-wed-1', time: '05:00–07:00', task: 'NEET Study Block 1: Physics (Electrodynamics & Optics)', category: 'study' },
  { id: 'rt-wed-2', time: '07:00–07:30', task: 'Breakfast and Bath (Morning Refresh)', category: 'personal' },
  { id: 'rt-wed-3', time: '07:30–10:00', task: 'NEET Study Block 2: Chemistry (Physical Chemistry Calculations)', category: 'study' },
  { id: 'rt-wed-4', time: '10:00–10:15', task: 'Morning Break (Hydration & Stretch)', category: 'break' },
  { id: 'rt-wed-5', time: '10:15–11:45', task: 'NEET Study Block 3: Botany (Genetics & Biotechnology)', category: 'study' },
  { id: 'rt-wed-6', time: '11:45–12:00', task: 'Midday Break (Eye Rest)', category: 'break' },
  { id: 'rt-wed-7', time: '12:00–13:00', task: 'NEET Study Block 4: Zoology (Cell Biology & Genetics)', category: 'study' },
  { id: 'rt-wed-8', time: '13:00–14:00', task: 'Lunch & Travel to College', category: 'personal' },
  { id: 'rt-wed-9', time: '14:00–14:50', task: 'Design Patterns - TH (C2+TC2 - SJT114)', category: 'college' },
  { id: 'rt-wed-10', time: '15:00–15:50', task: 'UI/UX Design - TH (A2+TA2 - SJT221)', category: 'college' },
  { id: 'rt-wed-11', time: '16:00–16:50', task: 'Deep Learning - TH (F2+TF2 - SJT619)', category: 'college' },
  { id: 'rt-wed-12', time: '17:00–17:50', task: 'Cyber Security - TH (D2+TD2 - SJTG24)', category: 'college' },
  { id: 'rt-wed-13', time: '17:50–18:30', task: 'Badminton / Fitness & Refresh', category: 'exercise' },
  { id: 'rt-wed-14', time: '18:30–19:30', task: 'NEET Study Block 5: Spaced Revision (Botany / Zoology)', category: 'study' },
  { id: 'rt-wed-15', time: '19:30–20:00', task: 'Dinner', category: 'personal' },
  { id: 'rt-wed-16', time: '20:00–21:45', task: 'NEET Question Solving Block 6 (50 MCQ Sprint)', category: 'study' },
  { id: 'rt-wed-17', time: '21:45–22:00', task: 'Night Routine & Wind Down', category: 'personal' },
  { id: 'rt-wed-18', time: '22:00–05:00', task: 'Bedtime Sleep (Recovery)', category: 'sleep' }
];

export const ROUTINE_THURSDAY: DailyRoutineItem[] = [
  { id: 'rt-thu-1', time: '05:00–07:00', task: 'NEET Study Block 1: Physics (Modern Physics & Thermodynamics)', category: 'study' },
  { id: 'rt-thu-2', time: '07:00–07:30', task: 'Breakfast and Bath (Morning Refresh)', category: 'personal' },
  { id: 'rt-thu-3', time: '07:30–10:00', task: 'NEET Study Block 2: Chemistry (Coordination & Organic Reactions)', category: 'study' },
  { id: 'rt-thu-4', time: '10:00–10:15', task: 'Morning Break (Hydration & Stretch)', category: 'break' },
  { id: 'rt-thu-5', time: '10:15–11:30', task: 'NEET Study Block 3: Biology (NCERT Intensive Line-by-Line)', category: 'study' },
  { id: 'rt-thu-6', time: '11:40–13:20', task: 'UI/UX Design Lab - LO (L23+L24 - SJT217)', category: 'college' },
  { id: 'rt-thu-7', time: '13:20–14:00', task: 'Lunch Break & Travel to Class', category: 'personal' },
  { id: 'rt-thu-8', time: '14:00–14:50', task: 'Cyber Security - TH (D2+TD2 - SJTG24)', category: 'college' },
  { id: 'rt-thu-9', time: '15:00–15:50', task: 'Software Metrics - TH (B2+TB2 - SJT115)', category: 'college' },
  { id: 'rt-thu-10', time: '16:00–16:50', task: 'Adv Competitive Coding - I - SS (G2+TG2 - SJT619)', category: 'college' },
  { id: 'rt-thu-11', time: '17:00–17:50', task: 'Software Configuration Management - TH (E2+TE2 - SJT204)', category: 'college' },
  { id: 'rt-thu-12', time: '17:50–18:30', task: 'Badminton / Fitness & Refresh', category: 'exercise' },
  { id: 'rt-thu-13', time: '18:30–19:30', task: 'NEET Study Block 5: Spaced Revision (Physics / Chemistry)', category: 'study' },
  { id: 'rt-thu-14', time: '19:30–20:00', task: 'Dinner', category: 'personal' },
  { id: 'rt-thu-15', time: '20:00–21:45', task: 'NEET Question Solving Block 6 (50 MCQ Sprint)', category: 'study' },
  { id: 'rt-thu-16', time: '21:45–22:00', task: 'Night Routine & Wind Down', category: 'personal' },
  { id: 'rt-thu-17', time: '22:00–05:00', task: 'Bedtime Sleep (Recovery)', category: 'sleep' }
];

export const ROUTINE_FRIDAY: DailyRoutineItem[] = [
  { id: 'rt-fri-1', time: '05:00–07:00', task: 'NEET Study Block 1: Physics (Full Syllabus Numericals)', category: 'study' },
  { id: 'rt-fri-2', time: '07:00–07:30', task: 'Breakfast and Bath (Morning Refresh)', category: 'personal' },
  { id: 'rt-fri-3', time: '07:30–10:00', task: 'NEET Study Block 2: Chemistry (Organic Mechanisms & Reactions)', category: 'study' },
  { id: 'rt-fri-4', time: '10:00–10:15', task: 'Morning Break (Hydration & Stretch)', category: 'break' },
  { id: 'rt-fri-5', time: '10:15–11:45', task: 'NEET Study Block 3: Botany (Ecology & Environment)', category: 'study' },
  { id: 'rt-fri-6', time: '11:45–12:00', task: 'Midday Break (Eye Rest)', category: 'break' },
  { id: 'rt-fri-7', time: '12:00–13:00', task: 'NEET Study Block 4: Zoology (Human Reproduction & Health)', category: 'study' },
  { id: 'rt-fri-8', time: '13:00–14:00', task: 'Lunch & Travel to College', category: 'personal' },
  { id: 'rt-fri-9', time: '14:00–14:50', task: 'Software Configuration Management - TH (E2+TE2 - SJT204)', category: 'college' },
  { id: 'rt-fri-10', time: '15:00–15:50', task: 'Design Patterns - TH (C2+TC2 - SJT114)', category: 'college' },
  { id: 'rt-fri-11', time: '16:00–16:50', task: 'UI/UX Design - TH (A2+TA2 - SJT221)', category: 'college' },
  { id: 'rt-fri-12', time: '17:00–17:50', task: 'Deep Learning - TH (F2+TF2 - SJT619)', category: 'college' },
  { id: 'rt-fri-13', time: '17:50–18:30', task: 'Badminton / Fitness & Refresh', category: 'exercise' },
  { id: 'rt-fri-14', time: '18:30–19:30', task: 'NEET Study Block 5: Weekly Topic Synthesis', category: 'study' },
  { id: 'rt-fri-15', time: '19:30–20:00', task: 'Dinner', category: 'personal' },
  { id: 'rt-fri-16', time: '20:00–21:45', task: 'NEET Question Solving Block 6 (50 MCQ Sprint)', category: 'study' },
  { id: 'rt-fri-17', time: '21:45–22:00', task: 'Night Routine & Saturday Prep', category: 'personal' },
  { id: 'rt-fri-18', time: '22:00–05:00', task: 'Bedtime Sleep (Recovery)', category: 'sleep' }
];

export const ROUTINE_SATURDAY: DailyRoutineItem[] = [
  { id: 'rt-sat-1', time: '05:00–07:00', task: 'NEET Study Block 1: Physics (Weak Areas Review & Numerical Practice)', category: 'study' },
  { id: 'rt-sat-2', time: '07:00–07:30', task: 'Breakfast and Bath (Morning Refresh)', category: 'personal' },
  { id: 'rt-sat-3', time: '07:30–10:00', task: 'NEET Study Block 2: Chemistry (Formulas & Reaction Drills)', category: 'study' },
  { id: 'rt-sat-4', time: '10:00–10:15', task: 'Morning Break (Hydration & Stretch)', category: 'break' },
  { id: 'rt-sat-5', time: '10:15–11:45', task: 'NEET Study Block 3: Botany (NCERT Diagram & Tables Revision)', category: 'study' },
  { id: 'rt-sat-6', time: '11:45–12:00', task: 'Midday Break (Eye Rest)', category: 'break' },
  { id: 'rt-sat-7', time: '12:00–13:00', task: 'NEET Study Block 4: Zoology (PYQs & Rapid Fire Drills)', category: 'study' },
  { id: 'rt-sat-8', time: '13:00–14:00', task: 'Lunch & Midday Rest', category: 'personal' },
  { id: 'rt-sat-9', time: '14:00–18:00', task: 'College Class / Engineering Lab & Project Study', category: 'college' },
  { id: 'rt-sat-10', time: '18:00–18:30', task: 'Badminton / Fitness & Refresh', category: 'exercise' },
  { id: 'rt-sat-11', time: '18:30–19:30', task: 'NEET Study Block 5: Sunday Mock Test Pre-Review', category: 'study' },
  { id: 'rt-sat-12', time: '19:30–20:00', task: 'Dinner', category: 'personal' },
  { id: 'rt-sat-13', time: '20:00–21:45', task: 'NEET Question Solving Block 6 (50 High-Speed MCQ Sprint)', category: 'study' },
  { id: 'rt-sat-14', time: '21:45–22:00', task: 'Sunday Mock Test Setup & Mindset Prep', category: 'personal' },
  { id: 'rt-sat-15', time: '22:00–08:00', task: 'Bedtime Sleep (Full 10h Recovery Sleep until 8:00 AM)', category: 'sleep' }
];

export const ROUTINE_SUNDAY: DailyRoutineItem[] = [
  { id: 'rt-sun-1', time: '08:00–09:00', task: 'Wake Up at 8:00 AM, Breakfast & Morning Refresh', category: 'personal' },
  { id: 'rt-sun-2', time: '09:00–09:30', task: 'Mock Test Setup & Mindset Alignment (OMR & Formula Warmup)', category: 'study' },
  { id: 'rt-sun-3', time: '09:30–12:30', task: 'NEET Chapterwise Mock Test Sprint (Physics, Chem, Biology)', category: 'study' },
  { id: 'rt-sun-4', time: '12:30–13:30', task: 'Lunch & Post-Test Relaxation', category: 'personal' },
  { id: 'rt-sun-5', time: '13:30–17:00', task: 'Free Time: Hobbies, Movies & Relaxation', category: 'break' },
  { id: 'rt-sun-6', time: '17:00–19:30', task: 'Free Time: Evening Outing, Friends & Social Rest', category: 'break' },
  { id: 'rt-sun-7', time: '19:30–20:30', task: 'Dinner with Family', category: 'personal' },
  { id: 'rt-sun-8', time: '20:30–22:00', task: 'Free Time: Wind Down & Week Planning', category: 'break' },
  { id: 'rt-sun-9', time: '22:00–05:00', task: 'Bedtime Sleep (Rest for Monday 5:00 AM Wake Up)', category: 'sleep' }
];

export const ROUTINES_BY_DAY: Record<number, DailyRoutineItem[]> = {
  0: ROUTINE_SUNDAY,
  1: ROUTINE_MONDAY,
  2: ROUTINE_TUESDAY,
  3: ROUTINE_WEDNESDAY,
  4: ROUTINE_THURSDAY,
  5: ROUTINE_FRIDAY,
  6: ROUTINE_SATURDAY
};

export const DEFAULT_DAILY_ROUTINE: DailyRoutineItem[] = ROUTINE_MONDAY;


export type MissedReason =
  | 'College'
  | 'Health'
  | 'Family'
  | 'Lack of sleep'
  | 'Overslept'
  | 'Phone distraction'
  | 'Travel'
  | 'Tiredness'
  | 'Emergency'
  | 'Other';

export interface MissedTaskRecord {
  reason: MissedReason;
  explanation: string;
  recoveryPlan: string;
  rescheduledTime?: string;
  recordedAt: string;
}

export type RoutineTaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Missed' | 'Skipped';

export interface DateTaskEntry {
  status: RoutineTaskStatus;
  completedAt?: string;
  missedDetails?: MissedTaskRecord;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  tasks: Record<string, DateTaskEntry>; // taskId -> status
}

export interface BlockedAppRule {
  id: string;
  name: string;
  packageName: string;
  enabled: boolean;
  focusOnly: boolean;
  strictMode: boolean;
  scheduleStart?: string;
  scheduleEnd?: string;
  dailyLimitMinutes?: number;
  usedMinutesToday?: number;
  addedAt: string;
}

export interface BlockedDomainRule {
  id: string;
  domain: string;
  enabled: boolean;
  category?: 'Adult / Explicit' | 'Social Media' | 'Entertainment' | 'Gaming' | 'Custom';
  focusOnly: boolean;
  strictMode: boolean;
  blockSubdomains?: boolean;
  addedAt: string;
}

export interface BlockerHistoryEvent {
  id: string;
  type: 'app' | 'website';
  target: string;
  action: 'blocked' | 'warning_shown' | 'temporary_unlock' | 'override';
  timestamp: string;
  reason?: string;
}

export interface FocusSessionLog {
  id: string;
  subject?: NeetSubjectName;
  chapterName?: string;
  durationMinutes: number;
  type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
  completedAt: string;
  notes?: string;
}

export interface MockTestEntry {
  id: string;
  subject: NeetSubjectName | 'Full NEET Mock (All 4 Subjects)';
  chaptersCovered: string[];
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattemptedQuestions: number;
  score: number; // (correct * 4) - (wrong * 1)
  timeTakenMinutes: number;
  weakTopics: string[];
  reviewNotes: string;
  testDate: string;
}

export interface WeeklyBlueprint {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string;
  targets: {
    physicsChapterId: string;
    chemistryChapterId: string;
    botanyChapterId: string;
    zoologyChapterId: string;
    physicsTargetCount?: number;
    chemistryTargetCount?: number;
    botanyTargetCount?: number;
    zoologyTargetCount?: number;
  };
  completed: {
    physics: boolean;
    chemistry: boolean;
    botany: boolean;
    zoology: boolean;
  };
  archived?: boolean;
}

const STORAGE_KEYS = {
  CHAPTERS: 'neet_tracker_chapters_v2',
  CUSTOM_ROUTINE: 'neet_tracker_routine_custom',
  CUSTOM_ROUTINES_BY_DAY: 'neet_tracker_routines_by_day',
  DAILY_RECORDS: 'neet_tracker_daily_records',
  BLOCKED_APPS: 'neet_tracker_blocked_apps',
  BLOCKED_DOMAINS: 'neet_tracker_blocked_domains',
  BLOCK_HISTORY: 'neet_tracker_block_history',
  PROTECTION_SETTINGS: 'neet_tracker_protection_settings',
  FOCUS_SESSIONS: 'neet_tracker_focus_sessions',
  MOCK_TESTS: 'neet_tracker_mock_tests',
  WEEKLY_BLUEPRINT: 'neet_tracker_weekly_blueprint',
  WEEKLY_HISTORY: 'neet_tracker_weekly_history'
};

export class StorageService {
  // ---------------- CHAPTERS ----------------
  static getChapters(): NeetChapterRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(ALL_NEET_CHAPTERS_DATA));
        return ALL_NEET_CHAPTERS_DATA;
      }
      return JSON.parse(raw);
    } catch {
      return ALL_NEET_CHAPTERS_DATA;
    }
  }

  static saveChapters(chapters: NeetChapterRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
    } catch (e) {
      console.error('Failed to save chapters:', e);
    }
  }

  static updateChapter(id: string, updates: Partial<NeetChapterRecord>): NeetChapterRecord[] {
    const chapters = this.getChapters();
    const idx = chapters.findIndex((c) => c.id === id);
    if (idx !== -1) {
      chapters[idx] = {
        ...chapters[idx],
        ...updates,
        last_updated: new Date().toISOString()
      };
      this.saveChapters(chapters);
    }
    return chapters;
  }

  static resetChapterStatus(id: string): NeetChapterRecord[] {
    return this.updateChapter(id, {
      status: 'Not Started',
      completion_percentage: 0,
      questions_solved: 0,
      correct_answers: 0,
      incorrect_answers: 0,
      revision_count: 0,
      planned_date: null,
      completed_date: null
    });
  }

  // ---------------- DAILY ROUTINE & CHECKLIST ----------------
  static getRoutineForDay(dayOfWeek: number): DailyRoutineItem[] {
    try {
      const rawMap = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES_BY_DAY);
      if (rawMap) {
        const parsedMap = JSON.parse(rawMap);
        if (parsedMap && parsedMap[dayOfWeek] && Array.isArray(parsedMap[dayOfWeek])) {
          return parsedMap[dayOfWeek];
        }
      }
      return ROUTINES_BY_DAY[dayOfWeek] || DEFAULT_DAILY_ROUTINE;
    } catch {
      return ROUTINES_BY_DAY[dayOfWeek] || DEFAULT_DAILY_ROUTINE;
    }
  }

  static getRoutineForDate(dateStr: string): DailyRoutineItem[] {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      const dayOfWeek = isNaN(d.getDay()) ? new Date().getDay() : d.getDay();
      return this.getRoutineForDay(dayOfWeek);
    } catch {
      return this.getRoutine();
    }
  }

  static getRoutine(): DailyRoutineItem[] {
    const today = new Date().getDay();
    return this.getRoutineForDay(today);
  }

  static saveRoutineForDay(dayOfWeek: number, items: DailyRoutineItem[]): void {
    try {
      const rawMap = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES_BY_DAY);
      const parsedMap = rawMap ? JSON.parse(rawMap) : {};
      parsedMap[dayOfWeek] = items;
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES_BY_DAY, JSON.stringify(parsedMap));

      // If updating today's routine, also sync with bridge and legacy storage
      if (dayOfWeek === new Date().getDay()) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINE, JSON.stringify(items));
        if (typeof window !== 'undefined') {
          const bridge = (window as any).AndroidBridge;
          if (bridge?.syncDailyRoutine) {
            bridge.syncDailyRoutine(JSON.stringify(items));
          }
        }
      }
    } catch (_e) {}
  }

  static saveRoutine(items: DailyRoutineItem[], forDate?: string): void {
    const dayOfWeek = forDate ? new Date(forDate + 'T12:00:00').getDay() : new Date().getDay();
    this.saveRoutineForDay(dayOfWeek, items);
  }

  static getDailyRecord(dateStr: string): Record<string, DateTaskEntry> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
      const all: Record<string, Record<string, DateTaskEntry>> = raw ? JSON.parse(raw) : {};
      return all[dateStr] || {};
    } catch {
      return {};
    }
  }

  static setTaskStatusForDate(
    dateStr: string,
    taskId: string,
    status: RoutineTaskStatus,
    missedDetails?: MissedTaskRecord
  ): Record<string, DateTaskEntry> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
      const all: Record<string, Record<string, DateTaskEntry>> = raw ? JSON.parse(raw) : {};
      if (!all[dateStr]) {
        all[dateStr] = {};
      }
      all[dateStr][taskId] = {
        status,
        completedAt: status === 'Completed' ? new Date().toISOString() : undefined,
        missedDetails: status === 'Missed' ? missedDetails : undefined
      };
      localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(all));
      return all[dateStr];
    } catch (e) {
      console.error('Failed to set task status:', e);
      return {};
    }
  }

  static getAllDailyRecords(): Record<string, Record<string, DateTaskEntry>> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  // ---------------- WEEKLY STATS ----------------
  static getWeeklyCompletionStats(): { totalScheduled: number; totalCompleted: number; percent: number } {
    const all = this.getAllDailyRecords();
    const today = new Date();
    let totalScheduled = 0;
    let totalCompleted = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayRecord = all[dateKey] || {};
      const routine = this.getRoutine();
      routine.forEach((r) => {
        totalScheduled++;
        if (dayRecord[r.id]?.status === 'Completed') {
          totalCompleted++;
        }
      });
    }

    const percent = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    return { totalScheduled, totalCompleted, percent };
  }

  // ---------------- BLOCKED APPS ----------------
  static getBlockedApps(): BlockedAppRule[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED_APPS);
      if (raw) return JSON.parse(raw);
      const initial: BlockedAppRule[] = [
        { id: 'app-insta', name: 'Instagram', packageName: 'com.instagram.android', enabled: true, focusOnly: false, strictMode: true, addedAt: '2026-09-01' },
        { id: 'app-yt', name: 'YouTube / Shorts', packageName: 'com.google.android.youtube', enabled: true, focusOnly: true, strictMode: false, dailyLimitMinutes: 30, addedAt: '2026-09-01' },
        { id: 'app-bgmi', name: 'BGMI / Mobile Games', packageName: 'com.pubg.imobile', enabled: true, focusOnly: false, strictMode: true, addedAt: '2026-09-01' },
        { id: 'app-snap', name: 'Snapchat', packageName: 'com.snapchat.android', enabled: true, focusOnly: false, strictMode: false, addedAt: '2026-09-01' }
      ];
      localStorage.setItem(STORAGE_KEYS.BLOCKED_APPS, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  }

  static saveBlockedApps(apps: BlockedAppRule[]): void {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_APPS, JSON.stringify(apps));
  }

  // ---------------- BLOCKED DOMAINS ----------------
  static getBlockedDomains(): BlockedDomainRule[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED_DOMAINS);
      if (raw) return JSON.parse(raw);
      const initial: BlockedDomainRule[] = [
        { id: 'dom-1', domain: 'instagram.com', enabled: true, category: 'Social Media', focusOnly: false, strictMode: true, addedAt: '2026-09-01' },
        { id: 'dom-2', domain: 'youtube.com/shorts', enabled: true, category: 'Entertainment', focusOnly: true, strictMode: false, addedAt: '2026-09-01' },
        { id: 'dom-3', domain: 'reddit.com', enabled: true, category: 'Social Media', focusOnly: true, strictMode: false, addedAt: '2026-09-01' }
      ];
      localStorage.setItem(STORAGE_KEYS.BLOCKED_DOMAINS, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  }

  static saveBlockedDomains(domains: BlockedDomainRule[]): void {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_DOMAINS, JSON.stringify(domains));
  }

  // ---------------- BLOCK HISTORY ----------------
  static getBlockHistory(): BlockerHistoryEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BLOCK_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static logBlockEvent(event: Omit<BlockerHistoryEvent, 'id' | 'timestamp'>): void {
    const list = this.getBlockHistory();
    const newEntry: BlockerHistoryEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.BLOCK_HISTORY, JSON.stringify(list.slice(0, 100)));
  }

  // ---------------- MOCK TESTS ----------------
  static getMockTests(): MockTestEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MOCK_TESTS);
      if (raw) return JSON.parse(raw);
      const initial: MockTestEntry[] = [
        {
          id: 'mock-sample-1',
          subject: 'Full NEET Mock (All 4 Subjects)',
          chaptersCovered: ['Kinematics', 'Chemical Bonding', 'Cell: Unit of Life', 'Human Physiology'],
          totalQuestions: 180,
          correctAnswers: 154,
          wrongAnswers: 18,
          unattemptedQuestions: 8,
          score: (154 * 4) - 18, // 598
          timeTakenMinutes: 195,
          weakTopics: ['Rotational inertia', 'GOC reaction mechanism'],
          reviewNotes: 'Great biology score! Need extra focus on rotational physics formulas.',
          testDate: '2026-09-14'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  }

  static saveMockTests(tests: MockTestEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(tests));
  }

  static addMockTest(entry: MockTestEntry): MockTestEntry[] {
    const list = this.getMockTests();
    list.unshift(entry);
    this.saveMockTests(list);
    return list;
  }

  static deleteMockTest(id: string): MockTestEntry[] {
    const list = this.getMockTests().filter((m) => m.id !== id);
    this.saveMockTests(list);
    return list;
  }

  // ---------------- FOCUS SESSIONS ----------------
  static getFocusSessions(): FocusSessionLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static logFocusSession(session: Omit<FocusSessionLog, 'id' | 'completedAt'>): void {
    const sessions = this.getFocusSessions();
    sessions.unshift({
      ...session,
      id: `foc-${Date.now()}`,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions.slice(0, 100)));
  }

  // ---------------- EXPORT & IMPORT JSON ----------------
  static exportAllData(): string {
    const payload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      chapters: this.getChapters(),
      customRoutine: this.getRoutine(),
      dailyRecords: this.getAllDailyRecords(),
      blockedApps: this.getBlockedApps(),
      blockedDomains: this.getBlockedDomains(),
      blockHistory: this.getBlockHistory(),
      mockTests: this.getMockTests(),
      focusSessions: this.getFocusSessions()
    };
    return JSON.stringify(payload, null, 2);
  }

  static importValidatedData(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid JSON file structure.' };
      }
      if (Array.isArray(data.chapters)) {
        this.saveChapters(data.chapters);
      }
      if (data.dailyRecords && typeof data.dailyRecords === 'object') {
        localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(data.dailyRecords));
      }
      if (Array.isArray(data.blockedApps)) {
        this.saveBlockedApps(data.blockedApps);
      }
      if (Array.isArray(data.blockedDomains)) {
        this.saveBlockedDomains(data.blockedDomains);
      }
      if (Array.isArray(data.mockTests)) {
        this.saveMockTests(data.mockTests);
      }
      return { success: true, message: 'Data imported and restored successfully!' };
    } catch (e: any) {
      return { success: false, message: `Import error: ${e.message || 'Corrupted JSON'}` };
    }
  }
}

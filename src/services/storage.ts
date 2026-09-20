import { NeetChapterRecord, ALL_NEET_CHAPTERS_DATA, NeetSubjectName, NeetChapterStatus } from '../data/neetChapters';

export interface DailyRoutineItem {
  id: string;
  time: string; // e.g. "05:00–07:00"
  task: string;
  category: 'study' | 'personal' | 'break' | 'college' | 'exercise' | 'sleep';
  defaultCompleted?: boolean;
}

export const DEFAULT_DAILY_ROUTINE: DailyRoutineItem[] = [
  { id: 'rt-1', time: '05:00–07:00', task: 'NEET Study Block 1', category: 'study' },
  { id: 'rt-2', time: '07:00–07:30', task: 'Breakfast and bath', category: 'personal' },
  { id: 'rt-3', time: '07:30–10:00', task: 'NEET Study Block 2', category: 'study' },
  { id: 'rt-4', time: '10:00–10:15', task: 'Break', category: 'break' },
  { id: 'rt-5', time: '10:15–11:45', task: 'NEET Study Block 3', category: 'study' },
  { id: 'rt-6', time: '11:45–12:00', task: 'Break', category: 'break' },
  { id: 'rt-7', time: '12:00–13:00', task: 'NEET Study Block 4', category: 'study' },
  { id: 'rt-8', time: '13:00–14:00', task: 'Lunch', category: 'personal' },
  { id: 'rt-9', time: '14:00–18:00', task: 'College', category: 'college' },
  { id: 'rt-10', time: '18:00–18:30', task: 'Badminton', category: 'exercise' },
  { id: 'rt-11', time: '18:30–19:30', task: 'Study Block 5', category: 'study' },
  { id: 'rt-12', time: '19:30–20:00', task: 'Dinner', category: 'personal' },
  { id: 'rt-13', time: '20:00–21:45', task: 'Question solving', category: 'study' },
  { id: 'rt-14', time: '22:00', task: 'Sleep', category: 'sleep' }
];

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
  static getRoutine(): DailyRoutineItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINE);
      return raw ? JSON.parse(raw) : DEFAULT_DAILY_ROUTINE;
    } catch {
      return DEFAULT_DAILY_ROUTINE;
    }
  }

  static saveRoutine(items: DailyRoutineItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINE, JSON.stringify(items));
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

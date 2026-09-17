import {
  UserProfile,
  UserGoals,
  BlockedApp,
  BlockedWebsite,
  BlockingSchedule,
  NeetChapter,
  WeeklyNeetTarget,
  MockTestRecord,
  QuestionItem,
  RevisionScheduleItem,
  StudyTask,
  SleepRecord,
  AppNotification,
  UserSettings,
  DailyAnalytics,
  StudySession,
  FocusSession,
  ChecklistRoutine,
  CalendarEvent,
  ChecklistHistoryEntry,
  ChecklistItem
} from '../types';
import { ALL_81_NEET_CHAPTERS } from './neetSyllabus81';
import { SEED_QUESTION_BANK } from './questionBankSeed';

const STORAGE_KEYS = {
  USER_PROFILE: 'ff_user_profile',
  USER_GOALS: 'ff_user_goals',
  BLOCKED_APPS: 'ff_blocked_apps',
  BLOCKED_WEBSITES: 'ff_blocked_websites',
  BLOCKING_SCHEDULES: 'ff_blocking_schedules',
  NEET_CHAPTERS: 'ff_neet_chapters_81',
  WEEKLY_TARGETS: 'ff_weekly_neet_targets',
  WEEKLY_ARCHIVE: 'ff_weekly_archive_history',
  MOCK_TESTS: 'ff_mock_test_records',
  QUESTION_BANK: 'ff_question_bank_items',
  REVISION_SCHEDULE: 'ff_revision_schedule_items',
  STUDY_TASKS: 'ff_study_tasks',
  SLEEP_RECORDS: 'ff_sleep_records',
  NOTIFICATIONS: 'ff_notifications',
  USER_SETTINGS: 'ff_user_settings',
  DAILY_ANALYTICS: 'ff_daily_analytics',
  STUDY_SESSIONS: 'ff_study_sessions',
  FOCUS_SESSIONS: 'ff_focus_sessions'
};

// Seed User Profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-sozhan',
  name: 'Sozhan Rajendira',
  username: 'sozhan_rajendira',
  email: 'sozhanrajendira@gmail.com',
  examGoal: 'NEET 2027 (Target: 680+ Marks)',
  examDate: '2027-05-02',
  dailyTargetMinutes: 360, // 6 Hours
  wakeUpTime: '05:30',
  studyStartTime: '06:30',
  engineeringClassStart: '14:00', // 2:00 PM Engineering Class
  engineeringClassEnd: '19:00',   // 7:00 PM
  streakDays: 14,
  totalStudyMinutes: 5240,
  focusScore: 78,
  onboardingCompleted: true,
  biologyMode: 'separate',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
};

// Seed Goals
export const DEFAULT_USER_GOALS: UserGoals = {
  primaryGoals: ['Score 680+ in NEET 2027', 'Master 81 NCERT Chapters', 'Manage Engineering Class & NEET', 'Zero Social Media Distraction'],
  distractions: ['Instagram Reels', 'YouTube Shorts', 'Games & BGMI', 'Social Browsing'],
  dailyScreenTimeGoalHours: 6,
  notificationsEnabled: true,
  weeklyPhysicsTarget: 1,
  weeklyChemistryTarget: 1,
  weeklyBotanyTarget: 1,
  weeklyZoologyTarget: 1
};

// Seed Apps
export const DEFAULT_BLOCKED_APPS: BlockedApp[] = [
  {
    id: 'app-insta',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'Social Media',
    isBlocked: true,
    dailyLimitMinutes: 15,
    usedTodayMinutes: 28,
    iconName: 'Instagram'
  },
  {
    id: 'app-yt',
    name: 'YouTube & Shorts',
    packageName: 'com.google.android.youtube',
    category: 'Entertainment',
    isBlocked: true,
    dailyLimitMinutes: 30,
    usedTodayMinutes: 45,
    iconName: 'Youtube'
  },
  {
    id: 'app-bgmi',
    name: 'BGMI / Mobile Games',
    packageName: 'com.pubg.imobile',
    category: 'Games',
    isBlocked: true,
    dailyLimitMinutes: 0,
    usedTodayMinutes: 0,
    iconName: 'Gamepad2'
  },
  {
    id: 'app-fb',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    category: 'Social Media',
    isBlocked: true,
    dailyLimitMinutes: 15,
    usedTodayMinutes: 5,
    iconName: 'Share2'
  },
  {
    id: 'app-whatsapp',
    name: 'WhatsApp (Status & Reels)',
    packageName: 'com.whatsapp',
    category: 'Messaging',
    isBlocked: false,
    dailyLimitMinutes: 45,
    usedTodayMinutes: 32,
    iconName: 'MessageCircle'
  },
  {
    id: 'app-chrome',
    name: 'Chrome & Browsers',
    packageName: 'com.android.chrome',
    category: 'Browsers',
    isBlocked: false,
    dailyLimitMinutes: 60,
    usedTodayMinutes: 35,
    iconName: 'Globe'
  },
  {
    id: 'app-netflix',
    name: 'Netflix',
    packageName: 'com.netflix.mediaclient',
    category: 'Entertainment',
    isBlocked: true,
    dailyLimitMinutes: 0,
    usedTodayMinutes: 0,
    iconName: 'Tv'
  },
  {
    id: 'app-amazon',
    name: 'Amazon Shopping',
    packageName: 'com.amazon.mShop.android.shopping',
    category: 'Shopping',
    isBlocked: false,
    dailyLimitMinutes: 20,
    usedTodayMinutes: 8,
    iconName: 'ShoppingBag'
  }
];

// Seed Websites
export const DEFAULT_BLOCKED_WEBSITES: BlockedWebsite[] = [
  {
    id: 'web-1',
    url: 'instagram.com',
    name: 'Instagram Web',
    category: 'Social Media',
    isBlocked: true,
    blockSubdomains: true,
    addedAt: '2026-09-01'
  },
  {
    id: 'web-2',
    url: 'youtube.com/shorts',
    name: 'YouTube Shorts',
    category: 'Entertainment',
    isBlocked: true,
    blockSubdomains: true,
    addedAt: '2026-09-01'
  },
  {
    id: 'web-3',
    url: 'facebook.com',
    name: 'Facebook',
    category: 'Social Media',
    isBlocked: true,
    blockSubdomains: true,
    addedAt: '2026-09-02'
  },
  {
    id: 'web-4',
    url: 'netflix.com',
    name: 'Netflix Stream',
    category: 'Entertainment',
    isBlocked: true,
    blockSubdomains: true,
    addedAt: '2026-09-03'
  },
  {
    id: 'web-5',
    url: 'reddit.com',
    name: 'Reddit Frontpage',
    category: 'Social Media',
    isBlocked: true,
    blockSubdomains: true,
    addedAt: '2026-09-05'
  }
];

// Seed Schedules
export const DEFAULT_SCHEDULES: BlockingSchedule[] = [
  {
    id: 'sch-1',
    title: 'Morning NEET Deep Study',
    startTime: '05:30',
    endTime: '08:30',
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon - Sat
    isEnabled: true,
    isStrictMode: true,
    blockedAppIds: ['app-insta', 'app-yt', 'app-bgmi', 'app-fb'],
    blockedWebsiteIds: ['web-1', 'web-2', 'web-3', 'web-5'],
    subjectTag: 'Physics'
  },
  {
    id: 'sch-eng',
    title: 'Engineering College Class Block',
    startTime: '14:00',
    endTime: '19:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Mon - Fri
    isEnabled: true,
    isStrictMode: false,
    blockedAppIds: ['app-bgmi', 'app-netflix', 'app-insta'],
    blockedWebsiteIds: ['web-1', 'web-4']
  },
  {
    id: 'sch-2',
    title: 'Evening Revision & Problem Solving',
    startTime: '20:00',
    endTime: '22:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Everyday
    isEnabled: true,
    isStrictMode: false,
    blockedAppIds: ['app-insta', 'app-yt', 'app-bgmi', 'app-fb', 'app-netflix'],
    blockedWebsiteIds: ['web-1', 'web-2', 'web-3', 'web-4', 'web-5'],
    subjectTag: 'Chemistry'
  },
  {
    id: 'sch-3',
    title: 'Sunday Mock Test Lockout',
    startTime: '14:00',
    endTime: '17:20',
    daysOfWeek: [0], // Sunday
    isEnabled: true,
    isStrictMode: true,
    blockedAppIds: ['app-insta', 'app-yt', 'app-bgmi', 'app-fb', 'app-whatsapp', 'app-netflix'],
    blockedWebsiteIds: ['web-1', 'web-2', 'web-3', 'web-4', 'web-5']
  }
];

// Seed Weekly Targets (4-Subject Sprint Goals)
export const DEFAULT_WEEKLY_TARGETS: WeeklyNeetTarget[] = [
  {
    id: 'target-phy',
    subject: 'Physics',
    chapterId: 'phy-3',
    chapterTitle: 'Laws of Motion & Friction',
    weekStart: '2026-09-14',
    weekEnd: '2026-09-20',
    targetStudyHours: 8,
    targetQuestionsCount: 80,
    completedQuestionsCount: 65,
    isCompleted: false,
    revisionGoal: 'Pseudo forces and friction angle problems',
    status: 'In Progress'
  },
  {
    id: 'target-chem',
    subject: 'Chemistry',
    chapterId: 'chem-4',
    chapterTitle: 'Chemical Thermodynamics & Energetics',
    weekStart: '2026-09-14',
    weekEnd: '2026-09-20',
    targetStudyHours: 7,
    targetQuestionsCount: 75,
    completedQuestionsCount: 75,
    isCompleted: true,
    revisionGoal: 'Hess law and Gibbs free energy numericals',
    status: 'Completed'
  },
  {
    id: 'target-bot',
    subject: 'Botany',
    chapterId: 'bot-4',
    chapterTitle: 'Morphology of Flowering Plants',
    weekStart: '2026-09-14',
    weekEnd: '2026-09-20',
    targetStudyHours: 6,
    targetQuestionsCount: 90,
    completedQuestionsCount: 50,
    isCompleted: false,
    revisionGoal: 'Aestivation, placentation and floral diagrams',
    status: 'In Progress'
  },
  {
    id: 'target-zoo',
    subject: 'Zoology',
    chapterId: 'zoo-7',
    chapterTitle: 'Excretory Products and their Elimination',
    weekStart: '2026-09-14',
    weekEnd: '2026-09-20',
    targetStudyHours: 6,
    targetQuestionsCount: 70,
    completedQuestionsCount: 35,
    isCompleted: false,
    revisionGoal: 'Counter-current mechanism and RAAS regulation',
    status: 'In Progress'
  }
];

export const DEFAULT_WEEKLY_ARCHIVE: WeeklyNeetTarget[] = [
  {
    id: 'target-arch-1',
    subject: 'Physics',
    chapterTitle: 'Kinematics in 1D & 2D',
    weekStart: '2026-09-07',
    weekEnd: '2026-09-13',
    targetStudyHours: 8,
    targetQuestionsCount: 80,
    completedQuestionsCount: 80,
    isCompleted: true,
    status: 'Completed',
    completedAt: '2026-09-13'
  }
];

// Seed Mock Tests
export const DEFAULT_MOCK_TESTS: MockTestRecord[] = [
  {
    id: 'mock-1',
    title: 'Sunday Full Length NEET Mock 01',
    date: '2026-09-14',
    testDate: '2026-09-14',
    durationMinutes: 200,
    totalMarks: 720,
    score: 615,
    correctCount: 158,
    wrongCount: 17,
    unansweredCount: 5,
    correctQuestions: 158,
    wrongQuestions: 17,
    unattemptedQuestions: 5,
    totalQuestions: 180,
    accuracy: 90,
    accuracyPercentage: 90,
    physicsScore: 145,
    chemistryScore: 155,
    botanyScore: 160,
    zoologyScore: 155,
    biologyScore: 315,
    weakTopics: ['Rotational Motion', 'Equilibrium pH calculations', 'Neural Synapse transmission'],
    notes: 'Great biology score! Need to improve rotational mechanics speed.'
  },
  {
    id: 'mock-2',
    title: 'Sunday Full Length NEET Mock 02',
    date: '2026-09-07',
    testDate: '2026-09-07',
    durationMinutes: 200,
    totalMarks: 720,
    score: 588,
    correctCount: 152,
    wrongCount: 20,
    unansweredCount: 8,
    correctQuestions: 152,
    wrongQuestions: 20,
    unattemptedQuestions: 8,
    totalQuestions: 180,
    accuracy: 88,
    accuracyPercentage: 88,
    physicsScore: 135,
    chemistryScore: 148,
    botanyScore: 155,
    zoologyScore: 150,
    biologyScore: 305,
    weakTopics: ['Friction pseudo forces', 'GOC resonance structures'],
    notes: 'Calculated negative marking carefully (+4 / -1).'
  }
];

// Seed Spaced Revisions
export const DEFAULT_REVISIONS: RevisionScheduleItem[] = [
  {
    id: 'rev-1',
    chapterId: 'phy-11',
    chapterTitle: 'Electrostatics & Potential',
    subject: 'Physics',
    revisionNumber: 3,
    stage: 3, // 7 days revision
    scheduledDate: '2026-09-18',
    completed: false,
    isCompleted: false,
    notes: 'Recheck Gauss Law formulas and dielectric slab numericals.'
  },
  {
    id: 'rev-2',
    chapterId: 'chem-3',
    chapterTitle: 'Chemical Bonding and Molecular Structure',
    subject: 'Chemistry',
    revisionNumber: 2,
    stage: 2, // 3 days revision
    scheduledDate: '2026-09-19',
    completed: false,
    isCompleted: false,
    notes: 'Revise MOT molecular orbital diagrams and bond order calculations.'
  },
  {
    id: 'rev-3',
    chapterId: 'bot-6',
    chapterTitle: 'Cell: The Unit of Life',
    subject: 'Botany',
    revisionNumber: 4,
    stage: 4, // 15 days revision
    scheduledDate: '2026-09-20',
    completed: false,
    isCompleted: false,
    notes: 'NCERT diagram review for chloroplast and mitochondria.'
  }
];

// Seed Tasks
export const DEFAULT_TASKS: StudyTask[] = [
  {
    id: 'tsk-1',
    title: 'Complete Physics: Laws of Motion Friction Numericals',
    subject: 'Physics',
    chapter: 'Laws of Motion',
    priority: 'High',
    dueDate: '2026-09-18',
    estimatedMinutes: 90,
    status: 'In Progress',
    hasReminder: true
  },
  {
    id: 'tsk-2',
    title: 'Revise Chemistry: Chemical Bonding Hybridization & VSEPR',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding and Molecular Structure',
    priority: 'Medium',
    dueDate: '2026-09-18',
    estimatedMinutes: 60,
    status: 'Completed',
    hasReminder: false
  },
  {
    id: 'tsk-3',
    title: 'Solve 50 Botany Genetics MCQs from NCERT Booster',
    subject: 'Botany',
    chapter: 'Principles of Inheritance and Variation',
    priority: 'Urgent',
    dueDate: '2026-09-19',
    estimatedMinutes: 75,
    status: 'Not Started',
    hasReminder: true
  },
  {
    id: 'tsk-4',
    title: 'Zoology: Human Circulatory System ECG Waves and Heart Cycle',
    subject: 'Zoology',
    chapter: 'Body Fluids and Circulation',
    priority: 'High',
    dueDate: '2026-09-19',
    estimatedMinutes: 50,
    status: 'Not Started',
    hasReminder: true
  },
  {
    id: 'tsk-5',
    title: 'Analyze Mock Test Weak Areas in Rotational Motion',
    subject: 'Physics',
    chapter: 'Rotational Motion',
    priority: 'Urgent',
    dueDate: '2026-09-20',
    estimatedMinutes: 45,
    status: 'Not Started',
    hasReminder: false
  }
];

// Seed Sleep Records
export const DEFAULT_SLEEP_RECORDS: SleepRecord[] = [
  { id: 'slp-1', date: '2026-09-16', bedtime: '22:15', bedTime: '22:15', wakeTime: '05:30', totalHours: 7.25, hoursSlept: 7.25, qualityRating: 5, adheredToBedtime: true },
  { id: 'slp-2', date: '2026-09-15', bedtime: '22:00', bedTime: '22:00', wakeTime: '05:30', totalHours: 7.5, hoursSlept: 7.5, qualityRating: 4, adheredToBedtime: true },
  { id: 'slp-3', date: '2026-09-14', bedtime: '22:30', bedTime: '22:30', wakeTime: '05:30', totalHours: 7.0, hoursSlept: 7.0, qualityRating: 4, adheredToBedtime: true }
];

// Seed Notifications
export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: '🔥 14-Day NEET Study Streak!',
    message: 'Incredible discipline, Rajendira! You have studied at least 4 hours daily for 2 full weeks.',
    type: 'streak',
    timestamp: '10 minutes ago',
    isRead: false
  },
  {
    id: 'notif-2',
    title: '📚 Scheduled Study Session Starting Soon',
    message: 'Morning NEET Deep Study begins at 5:30 AM. Social media apps will be restricted.',
    type: 'reminder',
    timestamp: '1 hour ago',
    isRead: false
  },
  {
    id: 'notif-3',
    title: '🎯 Weekly NEET Target Update',
    message: 'You have completed 1 of 4 target chapters this week (Chemical Thermodynamics). Keep it up!',
    type: 'study',
    timestamp: '3 hours ago',
    isRead: true
  },
  {
    id: 'notif-4',
    title: '🛡️ Distraction Blocked by FocusForge',
    message: 'Instagram was blocked 4 times during your active focus block.',
    type: 'warning',
    timestamp: '5 hours ago',
    isRead: true
  }
];

// Seed Analytics
export const DEFAULT_ANALYTICS: DailyAnalytics[] = [
  { date: '2026-09-11', productiveMinutes: 320, distractedMinutes: 65, screenTimeMinutes: 385, focusScore: 83, focusSessionsCount: 4, tasksCompletedCount: 3, questionsSolved: 65 },
  { date: '2026-09-12', productiveMinutes: 380, distractedMinutes: 50, screenTimeMinutes: 430, focusScore: 88, focusSessionsCount: 5, tasksCompletedCount: 4, questionsSolved: 90 },
  { date: '2026-09-13', productiveMinutes: 290, distractedMinutes: 95, screenTimeMinutes: 385, focusScore: 75, focusSessionsCount: 3, tasksCompletedCount: 2, questionsSolved: 45 },
  { date: '2026-09-14', productiveMinutes: 410, distractedMinutes: 40, screenTimeMinutes: 450, focusScore: 91, focusSessionsCount: 5, tasksCompletedCount: 5, mockTestsTaken: 1, questionsSolved: 180 },
  { date: '2026-09-15', productiveMinutes: 350, distractedMinutes: 70, screenTimeMinutes: 420, focusScore: 83, focusSessionsCount: 4, tasksCompletedCount: 3, questionsSolved: 75 },
  { date: '2026-09-16', productiveMinutes: 390, distractedMinutes: 55, screenTimeMinutes: 445, focusScore: 87, focusSessionsCount: 5, tasksCompletedCount: 4, questionsSolved: 85 },
  { date: '2026-09-17', productiveMinutes: 260, distractedMinutes: 75, screenTimeMinutes: 335, focusScore: 78, focusSessionsCount: 3, tasksCompletedCount: 2, questionsSolved: 50 }
];

// Seed Settings
export const DEFAULT_USER_SETTINGS: UserSettings = {
  isDarkMode: true,
  focusMode: 'NORMAL',
  soundEnabled: true,
  vibrationEnabled: true,
  breakReminders: true,
  breakIntervalMinutes: 25,
  emergencyUnlockAllowed: true,
  emergencyUnlockDelaySeconds: 30,
  examCountdownDate: '2027-05-02',
  biologyMode: 'separate',
  biologyOrganizationMode: 'separate',
  engineeringScheduleEnabled: true,
  engineeringClassStart: '14:00',
  engineeringClassEnd: '19:00'
};

export const DEFAULT_STUDY_SESSIONS: StudySession[] = [
  {
    id: 'ses-1',
    subject: 'Physics',
    chapterTitle: 'Kinematics',
    durationMinutes: 90,
    completedAt: '2026-09-17T08:00:00Z',
    difficulty: 'Moderate',
    completedTarget: true,
    questionsAttempted: 25,
    questionsCorrect: 22,
    notes: 'Completed 25 numericals on projectile motion and relative velocity.'
  },
  {
    id: 'ses-2',
    subject: 'Chemistry',
    chapterTitle: 'Chemical Bonding and Molecular Structure',
    durationMinutes: 60,
    completedAt: '2026-09-17T11:30:00Z',
    difficulty: 'Easy',
    completedTarget: true,
    questionsAttempted: 30,
    questionsCorrect: 28,
    notes: 'VSEPR theory and hybridization revision finished.'
  },
  {
    id: 'ses-3',
    subject: 'Botany',
    chapterTitle: 'Cell: The Unit of Life',
    durationMinutes: 110,
    completedAt: '2026-09-17T16:00:00Z',
    difficulty: 'Moderate',
    completedTarget: true,
    questionsAttempted: 40,
    questionsCorrect: 38,
    notes: 'Endomembrane system and mitochondria structure memorized.'
  }
];

// Generic storage accessors with type safety
export function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Seed Checklist Routines matching screenshot specifications
export const DEFAULT_CHECKLIST_ROUTINES: ChecklistRoutine[] = [
  {
    id: 'chk-neet-13block',
    title: 'NEET Monday–Saturday 13-Block Routine',
    description: 'Master daily engineering college + 6-hour NEET study routine',
    category: 'NEET Study',
    recurrence: 'Monday-Saturday',
    color: '#0EA5E9',
    icon: 'BookOpen',
    isPinned: true,
    isFavorite: true,
    createdAt: '2026-09-01T00:00:00Z',
    streakDays: 14,
    items: [
      { id: 'it-1', text: '05:00–07:00 NEET study Block 1 (Physics Problem Solving)', timeRange: '05:00–07:00', completed: false, isStudyBlock: true, subject: 'Physics' },
      { id: 'it-2', text: '07:00–07:30 Breakfast + bath', timeRange: '07:00–07:30', completed: false },
      { id: 'it-3', text: '07:30–10:00 NEET study Block 2 (Chemistry Physical/Organic)', timeRange: '07:30–10:00', completed: false, isStudyBlock: true, subject: 'Chemistry' },
      { id: 'it-4', text: '10:00–10:15 Break 1', timeRange: '10:00–10:15', completed: false },
      { id: 'it-5', text: '10:15–11:45 NEET study Block 3 (Botany NCERT Reading)', timeRange: '10:15–11:45', completed: false, isStudyBlock: true, subject: 'Botany' },
      { id: 'it-6', text: '11:45–12:00 Break 2', timeRange: '11:45–12:00', completed: false },
      { id: 'it-7', text: '12:00–13:00 NEET study Block 4 (Zoology Diagram Review)', timeRange: '12:00–13:00', completed: false, isStudyBlock: true, subject: 'Zoology' },
      { id: 'it-8', text: '13:00–14:00 Lunch', timeRange: '13:00–14:00', completed: false },
      { id: 'it-9', text: '14:00–18:00 University college (Distraction Blocker Active)', timeRange: '14:00–18:00', completed: false, linkedScheduleId: 'sch-eng' },
      { id: 'it-10', text: '18:00–18:30 Badminton / Fitness', timeRange: '18:00–18:30', completed: false },
      { id: 'it-11', text: '18:30–19:30 NEET study Block 5 (Spaced Revision Quota)', timeRange: '18:30–19:30', completed: false, isStudyBlock: true },
      { id: 'it-12', text: '19:30–20:00 Dinner', timeRange: '19:30–20:00', completed: false },
      { id: 'it-13', text: '20:00–21:45 NEET question solving Block 6 (50 MCQ Sprint)', timeRange: '20:00–21:45', completed: false, isStudyBlock: true },
      { id: 'it-14', text: '22:00–22:00 Bedtime Sleep (7 Hours Recovery)', timeRange: '22:00–22:00', completed: false }
    ]
  },
  {
    id: 'chk-morning-discipline',
    title: 'Morning Discipline Routine',
    description: 'High-energy morning kickstart protocol',
    category: 'Morning Discipline',
    recurrence: 'Daily',
    color: '#10B981',
    icon: 'Sun',
    isPinned: true,
    isFavorite: false,
    createdAt: '2026-09-01T00:00:00Z',
    streakDays: 14,
    items: [
      { id: 'm-1', text: 'Wake up at 5:00 AM sharp', timeRange: '05:00', completed: false },
      { id: 'm-2', text: 'Drink 500ml water', timeRange: '05:05', completed: false },
      { id: 'm-3', text: 'Quick formula recap (15 min)', timeRange: '05:15–05:30', completed: false, isStudyBlock: true },
      { id: 'm-4', text: 'Begin High Focus Physics Block 1', timeRange: '05:30–07:00', completed: false, isStudyBlock: true, subject: 'Physics' }
    ]
  },
  {
    id: 'chk-evening-review',
    title: 'Evening Mock & Revision Routine',
    description: 'Daily question quota & mistake analysis',
    category: 'Evening Review',
    recurrence: 'Daily',
    color: '#F59E0B',
    icon: 'Moon',
    isPinned: false,
    isFavorite: true,
    createdAt: '2026-09-01T00:00:00Z',
    streakDays: 9,
    items: [
      { id: 'e-1', text: 'Review weak topics from previous mock test', completed: false },
      { id: 'e-2', text: 'Solve 30 Physics numericals under timer (+4/-1)', completed: false, isStudyBlock: true, subject: 'Physics' },
      { id: 'e-3', text: 'Log question correct/wrong count', completed: false },
      { id: 'e-4', text: 'Check off today\'s spaced revision items', completed: false }
    ]
  }
];

// Seed Calendar Events
export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'cal-1', title: 'Grand Mock Test 03 (720 Marks)', date: '2026-09-21', startTime: '14:00', endTime: '17:20', type: 'mock_test' },
  { id: 'cal-2', title: 'Electrostatics Spaced Revision #3', date: '2026-09-18', startTime: '06:00', type: 'revision', subject: 'Physics' },
  { id: 'cal-3', title: 'Chemical Bonding Hybridization Review', date: '2026-09-19', startTime: '08:00', type: 'study_task', subject: 'Chemistry' },
  { id: 'cal-4', title: 'Engineering College Mid-Sem Practical', date: '2026-09-22', startTime: '14:00', endTime: '18:00', type: 'college' }
];

export const DEFAULT_CHECKLIST_HISTORY: ChecklistHistoryEntry[] = [
  { id: 'hist-1', checklistId: 'chk-neet-13block', checklistTitle: 'NEET Monday–Saturday 13-Block Routine', date: '2026-09-16', completedItemsCount: 13, totalItemsCount: 14, completionPercentage: 93 },
  { id: 'hist-2', checklistId: 'chk-morning-discipline', checklistTitle: 'Morning Discipline Routine', date: '2026-09-16', completedItemsCount: 4, totalItemsCount: 4, completionPercentage: 100 },
  { id: 'hist-3', checklistId: 'chk-neet-13block', checklistTitle: 'NEET Monday–Saturday 13-Block Routine', date: '2026-09-15', completedItemsCount: 14, totalItemsCount: 14, completionPercentage: 100 }
];

// Master Storage API Engine
export const StorageEngine = {
  getUserProfile: (): UserProfile => getStoredItem(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE),
  setUserProfile: (profile: UserProfile) => setStoredItem(STORAGE_KEYS.USER_PROFILE, profile),

  getUserGoals: (): UserGoals => getStoredItem(STORAGE_KEYS.USER_GOALS, DEFAULT_USER_GOALS),
  setUserGoals: (goals: UserGoals) => setStoredItem(STORAGE_KEYS.USER_GOALS, goals),

  getBlockedApps: (): BlockedApp[] => getStoredItem(STORAGE_KEYS.BLOCKED_APPS, DEFAULT_BLOCKED_APPS),
  setBlockedApps: (apps: BlockedApp[]) => setStoredItem(STORAGE_KEYS.BLOCKED_APPS, apps),

  getBlockedWebsites: (): BlockedWebsite[] => getStoredItem(STORAGE_KEYS.BLOCKED_WEBSITES, DEFAULT_BLOCKED_WEBSITES),
  setBlockedWebsites: (sites: BlockedWebsite[]) => setStoredItem(STORAGE_KEYS.BLOCKED_WEBSITES, sites),

  getSchedules: (): BlockingSchedule[] => getStoredItem(STORAGE_KEYS.BLOCKING_SCHEDULES, DEFAULT_SCHEDULES),
  setSchedules: (schedules: BlockingSchedule[]) => setStoredItem(STORAGE_KEYS.BLOCKING_SCHEDULES, schedules),

  getNeetChapters: (): NeetChapter[] => getStoredItem(STORAGE_KEYS.NEET_CHAPTERS, ALL_81_NEET_CHAPTERS),
  setNeetChapters: (chapters: NeetChapter[]) => setStoredItem(STORAGE_KEYS.NEET_CHAPTERS, chapters),

  getWeeklyTargets: (): WeeklyNeetTarget[] => getStoredItem(STORAGE_KEYS.WEEKLY_TARGETS, DEFAULT_WEEKLY_TARGETS),
  setWeeklyTargets: (targets: WeeklyNeetTarget[]) => setStoredItem(STORAGE_KEYS.WEEKLY_TARGETS, targets),

  // Backwards compatible singular getters
  getWeeklyTarget: (): WeeklyNeetTarget => {
    const list = StorageEngine.getWeeklyTargets();
    return list[0] || DEFAULT_WEEKLY_TARGETS[0];
  },
  setWeeklyTarget: (target: WeeklyNeetTarget) => {
    const list = StorageEngine.getWeeklyTargets();
    const updated = list.map(t => t.id === target.id ? target : t);
    StorageEngine.setWeeklyTargets(updated);
  },

  carryForwardTargets: (): WeeklyNeetTarget[] => {
    const current = StorageEngine.getWeeklyTargets();
    const carried = current.map(t => {
      if (!t.isCompleted) {
        return { ...t, status: 'Carried Forward' as const, revisionGoal: 'Carried over from last week sprint' };
      }
      return t;
    });
    StorageEngine.setWeeklyTargets(carried);
    return carried;
  },

  archiveWeeklyReview: (notes?: string): WeeklyNeetTarget[] => {
    const current = StorageEngine.getWeeklyTargets();
    const archive = StorageEngine.getWeeklyArchive();
    const nextArchive = [...current, ...archive];
    setStoredItem(STORAGE_KEYS.WEEKLY_ARCHIVE, nextArchive);

    // Reset weekly goals with fresh cycle
    const freshTargets = current.map(t => ({
      ...t,
      completedQuestionsCount: 0,
      isCompleted: false,
      status: 'In Progress' as const,
      notes: notes || t.notes
    }));
    StorageEngine.setWeeklyTargets(freshTargets);
    return freshTargets;
  },

  getWeeklyArchive: (): WeeklyNeetTarget[] => getStoredItem(STORAGE_KEYS.WEEKLY_ARCHIVE, DEFAULT_WEEKLY_ARCHIVE),
  setWeeklyArchive: (archive: WeeklyNeetTarget[]) => setStoredItem(STORAGE_KEYS.WEEKLY_ARCHIVE, archive),

  getMockTests: (): MockTestRecord[] => getStoredItem(STORAGE_KEYS.MOCK_TESTS, DEFAULT_MOCK_TESTS),
  setMockTests: (tests: MockTestRecord[]) => setStoredItem(STORAGE_KEYS.MOCK_TESTS, tests),

  getQuestionBank: (): QuestionItem[] => getStoredItem(STORAGE_KEYS.QUESTION_BANK, SEED_QUESTION_BANK),
  setQuestionBank: (questions: QuestionItem[]) => setStoredItem(STORAGE_KEYS.QUESTION_BANK, questions),

  getRevisions: (): RevisionScheduleItem[] => getStoredItem(STORAGE_KEYS.REVISION_SCHEDULE, DEFAULT_REVISIONS),
  setRevisions: (items: RevisionScheduleItem[]) => setStoredItem(STORAGE_KEYS.REVISION_SCHEDULE, items),
  getRevisionSchedule: (): RevisionScheduleItem[] => StorageEngine.getRevisions(),
  setRevisionSchedule: (items: RevisionScheduleItem[]) => StorageEngine.setRevisions(items),

  completeRevisionInterval: (scheduleId: string, nextIntervalDays: number = 7): RevisionScheduleItem[] => {
    const current = StorageEngine.getRevisions();
    const updated = current.map(r => {
      if (r.id === scheduleId) {
        return {
          ...r,
          completed: true,
          isCompleted: true,
          completedDate: new Date().toISOString().split('T')[0]
        };
      }
      return r;
    });
    StorageEngine.setRevisions(updated);
    return updated;
  },

  // Checklist Routines
  getChecklists: (): ChecklistRoutine[] => getStoredItem('ff_checklist_routines', DEFAULT_CHECKLIST_ROUTINES),
  setChecklists: (routines: ChecklistRoutine[]) => setStoredItem('ff_checklist_routines', routines),

  toggleChecklistItem: (checklistId: string, itemId: string): ChecklistRoutine[] => {
    const current = StorageEngine.getChecklists();
    const updated = current.map((chk) => {
      if (chk.id === checklistId) {
        const nextItems = chk.items.map((it) => {
          if (it.id === itemId) {
            const nextVal = !(it.isCompleted ?? it.completed);
            return { ...it, completed: nextVal, isCompleted: nextVal };
          }
          return it;
        });
        return { ...chk, items: nextItems };
      }
      return chk;
    });
    StorageEngine.setChecklists(updated);
    return updated;
  },

  resetChecklist: (checklistId: string): ChecklistRoutine[] => {
    const current = StorageEngine.getChecklists();
    const updated = current.map((chk) => {
      if (chk.id === checklistId) {
        const nextItems = chk.items.map((it) => ({
          ...it,
          completed: false,
          isCompleted: false
        }));
        return {
          ...chk,
          items: nextItems,
          lastResetDate: new Date().toISOString().split('T')[0]
        };
      }
      return chk;
    });
    StorageEngine.setChecklists(updated);
    return updated;
  },

  // Calendar Events
  getCalendarEvents: (): CalendarEvent[] => getStoredItem('ff_calendar_events', DEFAULT_CALENDAR_EVENTS),
  setCalendarEvents: (events: CalendarEvent[]) => setStoredItem('ff_calendar_events', events),

  // Checklist History
  getChecklistHistory: (): ChecklistHistoryEntry[] => getStoredItem('ff_checklist_history', DEFAULT_CHECKLIST_HISTORY),
  setChecklistHistory: (history: ChecklistHistoryEntry[]) => setStoredItem('ff_checklist_history', history),

  getTasks: (): StudyTask[] => getStoredItem(STORAGE_KEYS.STUDY_TASKS, DEFAULT_TASKS),
  setTasks: (tasks: StudyTask[]) => setStoredItem(STORAGE_KEYS.STUDY_TASKS, tasks),

  getSleepRecords: (): SleepRecord[] => getStoredItem(STORAGE_KEYS.SLEEP_RECORDS, DEFAULT_SLEEP_RECORDS),
  setSleepRecords: (records: SleepRecord[]) => setStoredItem(STORAGE_KEYS.SLEEP_RECORDS, records),

  getNotifications: (): AppNotification[] => getStoredItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS),
  setNotifications: (notifs: AppNotification[]) => setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifs),

  getSettings: (): UserSettings => getStoredItem(STORAGE_KEYS.USER_SETTINGS, DEFAULT_USER_SETTINGS),
  setSettings: (settings: UserSettings) => setStoredItem(STORAGE_KEYS.USER_SETTINGS, settings),

  getAnalytics: (): DailyAnalytics[] => getStoredItem(STORAGE_KEYS.DAILY_ANALYTICS, DEFAULT_ANALYTICS),
  setAnalytics: (analytics: DailyAnalytics[]) => setStoredItem(STORAGE_KEYS.DAILY_ANALYTICS, analytics),

  getStudySessions: (): StudySession[] => getStoredItem(STORAGE_KEYS.STUDY_SESSIONS, DEFAULT_STUDY_SESSIONS),
  setStudySessions: (sessions: StudySession[]) => setStoredItem(STORAGE_KEYS.STUDY_SESSIONS, sessions),

  // Reset all
  resetAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },

  // Export all as JSON string
  exportAllDataAsJson: (): string => {
    return JSON.stringify({
      userProfile: StorageEngine.getUserProfile(),
      userGoals: StorageEngine.getUserGoals(),
      blockedApps: StorageEngine.getBlockedApps(),
      blockedWebsites: StorageEngine.getBlockedWebsites(),
      schedules: StorageEngine.getSchedules(),
      chapters: StorageEngine.getNeetChapters(),
      weeklyTargets: StorageEngine.getWeeklyTargets(),
      weeklyArchive: StorageEngine.getWeeklyArchive(),
      mockTests: StorageEngine.getMockTests(),
      questionBank: StorageEngine.getQuestionBank(),
      revisionSchedule: StorageEngine.getRevisions(),
      checklists: StorageEngine.getChecklists(),
      calendarEvents: StorageEngine.getCalendarEvents(),
      checklistHistory: StorageEngine.getChecklistHistory(),
      tasks: StorageEngine.getTasks(),
      sleepRecords: StorageEngine.getSleepRecords(),
      notifications: StorageEngine.getNotifications(),
      settings: StorageEngine.getSettings(),
      analytics: StorageEngine.getAnalytics(),
      studySessions: StorageEngine.getStudySessions(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  exportDataJSON: (): string => StorageEngine.exportAllDataAsJson(),

  // Import JSON
  importAllDataFromJson: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.userProfile) StorageEngine.setUserProfile(data.userProfile);
      if (data.userGoals) StorageEngine.setUserGoals(data.userGoals);
      if (data.blockedApps) StorageEngine.setBlockedApps(data.blockedApps);
      if (data.blockedWebsites) StorageEngine.setBlockedWebsites(data.blockedWebsites);
      if (data.schedules) StorageEngine.setSchedules(data.schedules);
      if (data.chapters) StorageEngine.setNeetChapters(data.chapters);
      if (data.weeklyTargets) StorageEngine.setWeeklyTargets(data.weeklyTargets);
      if (data.weeklyArchive) StorageEngine.setWeeklyArchive(data.weeklyArchive);
      if (data.mockTests) StorageEngine.setMockTests(data.mockTests);
      if (data.questionBank) StorageEngine.setQuestionBank(data.questionBank);
      if (data.revisionSchedule) StorageEngine.setRevisions(data.revisionSchedule);
      if (data.checklists) StorageEngine.setChecklists(data.checklists);
      if (data.calendarEvents) StorageEngine.setCalendarEvents(data.calendarEvents);
      if (data.tasks) StorageEngine.setTasks(data.tasks);
      if (data.sleepRecords) StorageEngine.setSleepRecords(data.sleepRecords);
      if (data.settings) StorageEngine.setSettings(data.settings);
      if (data.analytics) StorageEngine.setAnalytics(data.analytics);
      if (data.studySessions) StorageEngine.setStudySessions(data.studySessions);
      return true;
    } catch (e) {
      console.error("Failed to import data:", e);
      return false;
    }
  },

  importDataJSON: (jsonString: string): boolean => StorageEngine.importAllDataFromJson(jsonString)
};



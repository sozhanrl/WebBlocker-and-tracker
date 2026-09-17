export type NeetSubject = 'Physics' | 'Chemistry' | 'Botany' | 'Zoology' | 'Biology' | 'Mathematics' | 'Other';

export type ChapterStatus = 'Not Started' | 'In Progress' | 'Revision' | 'Completed' | 'Weak Area' | 'On Hold';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Missed' | 'Deferred';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type AppCategory = 'Social Media' | 'Entertainment' | 'Games' | 'Shopping' | 'Browsers' | 'Messaging' | 'Short Videos' | 'Other';

export type FocusModeStatus = 'OFF' | 'NORMAL' | 'STRICT';

export type BiologyOrganizationMode = 'separate' | 'combined' | 'custom';

export type SyncState = 'Synced' | 'Syncing' | 'Offline' | 'Sync Failed';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  examGoal: string; // e.g. "NEET 2027 (Target: 680+)"
  examDate?: string; // e.g. "2027-05-02"
  dailyTargetMinutes: number; // e.g. 360 (6 hours)
  wakeUpTime: string; // "05:30"
  studyStartTime: string; // "06:30"
  engineeringClassStart?: string; // "14:00"
  engineeringClassEnd?: string; // "19:00"
  engineeringCollegeStartTime?: string;
  engineeringCollegeEndTime?: string;
  autoBlockDuringCollege?: boolean;
  streakDays: number;
  totalStudyMinutes: number;
  focusScore: number; // 0-100
  onboardingCompleted: boolean;
  avatarUrl?: string;
  biologyMode?: BiologyOrganizationMode;
  biologyOrganizationMode?: BiologyOrganizationMode;
}


export interface UserGoals {
  primaryGoals: string[];
  distractions: string[];
  dailyScreenTimeGoalHours: number;
  notificationsEnabled: boolean;
  weeklyPhysicsTarget: number;
  weeklyChemistryTarget: number;
  weeklyBotanyTarget: number;
  weeklyZoologyTarget: number;
}

export interface BlockedApp {
  id: string;
  name: string;
  packageName: string;
  category: AppCategory;
  isBlocked: boolean;
  dailyLimitMinutes?: number;
  usedTodayMinutes: number;
  iconName: string;
}

export interface BlockedWebsite {
  id: string;
  url: string;
  name: string;
  category: string;
  isBlocked: boolean;
  blockSubdomains?: boolean;
  addedAt: string;
}

export interface BlockingSchedule {
  id: string;
  title: string;
  startTime: string; // "06:00"
  endTime: string;   // "08:00"
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  isEnabled: boolean;
  isStrictMode: boolean;
  blockedAppIds: string[];
  blockedWebsiteIds: string[];
  subjectTag?: NeetSubject;
}

export interface FocusSession {
  id: string;
  startTime: string;
  durationMinutes: number;
  subject?: NeetSubject;
  chapterTitle?: string;
  taskTitle?: string;
  distractionsPreventedCount: number;
  isCompleted: boolean;
  isStrictMode: boolean;
  difficulty?: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
  notes?: string;
}

export interface StudySession {
  id: string;
  subject: NeetSubject;
  chapterTitle: string;
  durationMinutes: number;
  completedAt: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
  completedTarget: boolean;
  questionsAttempted?: number;
  questionsCorrect?: number;
  notes?: string;
}

export type ClassLevel = 'Class 11' | 'Class 12' | 'Class 11 & 12' | 'General';

export interface NeetChapter {
  id: string;
  subject: NeetSubject;
  title: string;
  unitNumber?: number;
  unitName?: string;
  classLevel: ClassLevel;
  weightagePercentage: number; // Estimated NEET weightage %
  status: ChapterStatus;
  completionPercentage?: number; // 0-100%
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  lastRevisionDate?: string;
  nextRevisionDate?: string;
  revisionCount: number;
  studyTimeMinutes?: number;
  questionsSolved?: number;
  correctCount?: number;
  wrongCount?: number;
  unattemptedCount?: number;
  questionsCorrect?: number;
  questionsWrong?: number;
  questionsUnattempted?: number;
  accuracyPercentage?: number;
  mockTestScore?: number;
  difficulty?: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
  notes?: string;
  formulas?: string;
  keyFormulas?: string[];
  importantConcepts?: string;
  isBookmarked?: boolean;
  priority?: TaskPriority;
  isWeakTopic?: boolean;
  customTags?: string[];
  isCustom?: boolean;
  isCustomChapter?: boolean;
}


export interface WeeklyNeetTarget {
  id: string;
  subject: NeetSubject;
  chapterId?: string;
  chapterTitle?: string;
  weekStart?: string; // YYYY-MM-DD
  weekEnd?: string;   // YYYY-MM-DD
  targetStudyHours?: number;
  targetQuestionsCount?: number;
  completedQuestionsCount?: number;
  isCompleted?: boolean;
  revisionGoal?: string;
  physicsChapterId?: string;
  chemistryChapterId?: string;
  botanyChapterId?: string;
  zoologyChapterId?: string;
  physicsCompleted?: boolean;
  chemistryCompleted?: boolean;
  botanyCompleted?: boolean;
  zoologyCompleted?: boolean;
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Missed' | 'Carried Forward';
  notes?: string;
  completedAt?: string;
}

export interface MockTestRecord {
  id: string;
  title: string;
  date?: string;
  testDate?: string;
  durationMinutes?: number;
  totalMarks: number; // e.g. 720
  score: number;
  correctCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  correctQuestions?: number;
  wrongQuestions?: number;
  unattemptedQuestions?: number;
  totalQuestions?: number;
  accuracy?: number;
  accuracyPercentage?: number;
  physicsScore?: number;
  chemistryScore?: number;
  botanyScore?: number;
  zoologyScore?: number;
  biologyScore?: number;
  weakTopics?: string[];
  notes?: string;
}

export interface QuestionItem {
  id: string;
  subject: NeetSubject;
  chapter?: string;
  chapterTitle?: string;
  question?: string;
  questionText?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
  year?: string;
  userAttempt?: {
    selectedOptionIndex: number;
    isCorrect: boolean;
    timeTakenSeconds: number;
  };
  isBookmarked?: boolean;
}

export interface RevisionScheduleItem {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subject: NeetSubject;
  revisionNumber?: number;
  stage?: 1 | 2 | 3 | 4 | 5; // 1d, 3d, 7d, 15d, 30d
  scheduledDate: string;
  completed?: boolean;
  isCompleted?: boolean;
  completedDate?: string;
  score?: number;
  notes?: string;
}

export interface StudyTask {

  id: string;
  title: string;
  subject: NeetSubject;
  chapter?: string;
  priority: TaskPriority;
  dueDate: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  status: TaskStatus;
  hasReminder: boolean;
  notes?: string;
}

export interface SleepRecord {
  id?: string;
  date: string;
  bedtime?: string;
  bedTime?: string;
  wakeTime: string;
  totalHours?: number;
  hoursSlept?: number;
  qualityRating?: number;
  adheredToBedtime?: boolean;
  notes?: string;
}

export type ChecklistRecurrence =
  | 'daily'
  | 'weekly'
  | 'custom'
  | 'Daily'
  | 'Monday-Friday'
  | 'Monday-Saturday'
  | 'Weekly'
  | 'Monthly'
  | 'Custom'
  | 'Once';

export interface ChecklistItem {
  id: string;
  title?: string;
  text?: string;
  timeRange?: string; // e.g. "05:00–07:00"
  timeBlock?: string;
  completed?: boolean;
  isCompleted?: boolean;
  durationMinutes?: number;
  description?: string;
  notes?: string;
  priority?: TaskPriority;
  subject?: NeetSubject;
  chapterTitle?: string;
  isStudyBlock?: boolean;
  linkedTaskId?: string;
  linkedScheduleId?: string;
}

export interface ChecklistRoutine {
  id: string;
  title: string;
  description?: string;
  category?: string;
  recurrence: ChecklistRecurrence;
  items: ChecklistItem[];
  color?: string;
  icon?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  lastResetDate?: string;
  streakDays?: number;
}

export interface ChecklistHistoryEntry {
  id: string;
  checklistId: string;
  checklistTitle: string;
  date: string; // YYYY-MM-DD
  completedItemsCount: number;
  totalItemsCount: number;
  completionPercentage: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  startTime?: string;
  endTime?: string;
  type: 'routine' | 'study_task' | 'mock_test' | 'revision' | 'college' | 'custom' | 'session';
  subject?: NeetSubject;
  chapterTitle?: string;
  description?: string;
  isCompleted?: boolean;
  notes?: string;
}

export interface AppNotification {

  id: string;
  title: string;
  message: string;
  type: 'study' | 'streak' | 'reminder' | 'warning' | 'achievement' | 'mock' | 'revision';
  timestamp: string;
  isRead: boolean;
}

export interface UserSettings {
  isDarkMode: boolean;
  focusMode: FocusModeStatus;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  breakReminders: boolean;
  breakIntervalMinutes: number;
  emergencyUnlockAllowed: boolean;
  emergencyUnlockDelaySeconds: number;
  examCountdownDate: string; // default "2027-05-02"
  biologyMode?: BiologyOrganizationMode;
  biologyOrganizationMode?: BiologyOrganizationMode;
  engineeringScheduleEnabled?: boolean;
  engineeringClassStart?: string; // "14:00"
  engineeringClassEnd?: string;   // "19:00"
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface DailyAnalytics {
  date: string; // YYYY-MM-DD
  productiveMinutes: number;
  distractedMinutes: number;
  screenTimeMinutes: number;
  focusScore: number;
  focusSessionsCount: number;
  tasksCompletedCount: number;
  mockTestsTaken?: number;
  questionsSolved?: number;
}

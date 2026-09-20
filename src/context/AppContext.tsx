import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserGoals,
  BlockedApp,
  BlockedWebsite,
  BlockingSchedule,
  NeetChapter,
  StudyTask,
  TaskStatus,
  AppNotification,
  UserSettings,
  DailyAnalytics,
  StudySession,
  NeetSubject,
  ChapterStatus,
  WeeklyNeetTarget,
  MockTestRecord,
  QuestionItem,
  RevisionScheduleItem,
  SleepRecord,
  BiologyOrganizationMode,
  ChecklistRoutine,
  ChecklistItem,
  CalendarEvent,
  SyncState
} from '../types';
import { StorageEngine } from '../lib/storage';
import { getNativeBridge } from '../lib/nativeBridge';
import { getDomainsForCategories } from '../lib/adultCategories';

export type NavigationTab =
  | 'home'
  | 'dashboard'
  | 'tasks'
  | 'checklists'
  | 'calendar'
  | 'focus'
  | 'neet'
  | 'weekly'
  | 'blocker'
  | 'mocktests'
  | 'planner'
  | 'analytics'
  | 'profile'
  | 'settings'
  | 'study';

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  syncState: SyncState;
  triggerManualSync: () => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  userGoals: UserGoals;
  updateUserGoals: (goals: Partial<UserGoals>) => void;
  
  // Checklist Routines (Screenshot feature)
  checklists: ChecklistRoutine[];
  addChecklist: (checklist: Omit<ChecklistRoutine, 'id' | 'createdAt'>) => void;
  updateChecklist: (checklist: ChecklistRoutine) => void;
  deleteChecklist: (id: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  addChecklistItem: (checklistId: string, item: Omit<ChecklistItem, 'id' | 'completed'>) => void;
  deleteChecklistItem: (checklistId: string, itemId: string) => void;
  resetChecklist: (checklistId: string) => void;
  duplicateChecklist: (checklistId: string) => void;

  // Calendar Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;

  // App & Web Blocker
  blockedApps: BlockedApp[];
  setBlockedAppsState: React.Dispatch<React.SetStateAction<BlockedApp[]>>;
  toggleAppBlocked: (appId: string) => void;
  updateAppLimit: (appId: string, limitMinutes: number) => void;
  blockedWebsites: BlockedWebsite[];
  addBlockedWebsite: (url: string, name: string, category: string) => void;
  bulkAddBlockedWebsites: (sites: { url: string; name: string; category: string }[]) => void;
  removeBlockedWebsitesByCategory: (category: string) => void;
  removeBlockedWebsitesByCategories: (categories: string[]) => void;
  removeBlockedWebsite: (id: string) => void;
  toggleWebsiteBlocked: (id: string) => void;

  // 18+ Adult & Hentai Shield State & Checklist
  selected18PlusCategories: string[];
  setSelected18PlusCategories: (categories: string[]) => void;
  toggle18PlusCategory: (category: string) => void;
  isAdultShieldEnabled: boolean;
  setIsAdultShieldEnabled: (enabled: boolean) => void;

  schedules: BlockingSchedule[];
  toggleSchedule: (id: string) => void;
  addSchedule: (schedule: Omit<BlockingSchedule, 'id'>) => void;
  updateSchedule: (schedule: BlockingSchedule) => void;
  deleteSchedule: (id: string) => void;

  // 81-Chapter NEET Syllabus & Question Counters
  neetChapters: NeetChapter[];
  updateChapterStatus: (chapterId: string, status: ChapterStatus) => void;
  updateChapterTargetDate: (chapterId: string, date: string) => void;
  updateChapterQuestions: (
    chapterId: string,
    solved: number,
    correct: number,
    wrong: number,
    unattempted: number
  ) => void;
  updateChapterNotes: (chapterId: string, notes: string, keyFormulas?: string[]) => void;
  addCustomChapter: (chapter: Omit<NeetChapter, 'id'>) => void;
  deleteCustomChapter: (chapterId: string) => void;

  // Weekly Targets & Carry-Forward
  weeklyTargets: WeeklyNeetTarget[];
  updateWeeklyTarget: (id: string, updates: Partial<WeeklyNeetTarget>) => void;
  carryForwardWeeklyTargets: () => void;
  archiveWeeklyReview: (notes?: string) => void;

  // Mock Tests & Question Bank
  mockTests: MockTestRecord[];
  addMockTest: (test: Omit<MockTestRecord, 'id'>) => void;
  deleteMockTest: (testId: string) => void;
  questionBank: QuestionItem[];
  addQuestionToBank: (q: Omit<QuestionItem, 'id'>) => void;

  // Spaced Revision (1d, 3d, 7d, 15d, 30d)
  revisionItems: RevisionScheduleItem[];
  addRevisionSchedule: (chapterId: string, chapterTitle: string, subject: NeetSubject) => void;
  completeRevisionStep: (scheduleId: string, intervalDays: number) => void;
  deleteRevisionSchedule: (scheduleId: string) => void;

  // Study Planner & Tasks
  tasks: StudyTask[];
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Sleep Records
  sleepRecords: SleepRecord[];
  addSleepRecord: (record: Omit<SleepRecord, 'id'>) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Settings & Theme
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setBiologyMode: (mode: BiologyOrganizationMode) => void;

  // Analytics & Study Sessions
  analytics: DailyAnalytics[];
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id'>) => void;

  // Simulated Block Screen
  simulatedBlockedTarget: { name: string; url?: string; reason: string } | null;
  triggerSimulatedBlock: (name: string, url?: string, reason?: string) => void;
  closeSimulatedBlock: () => void;

  // Backup & Reset
  exportBackupJson: () => string;
  importBackupJson: (json: string) => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavigationTab>('home');
  const [syncState, setSyncState] = useState<SyncState>('Synced');
  const [userProfile, setUserProfileState] = useState<UserProfile>(StorageEngine.getUserProfile());
  const [userGoals, setUserGoalsState] = useState<UserGoals>(StorageEngine.getUserGoals());
  const [checklists, setChecklistsState] = useState<ChecklistRoutine[]>(StorageEngine.getChecklists());
  const [calendarEvents, setCalendarEventsState] = useState<CalendarEvent[]>(StorageEngine.getCalendarEvents());
  const [blockedApps, setBlockedAppsState] = useState<BlockedApp[]>(StorageEngine.getBlockedApps());
  const [blockedWebsites, setBlockedWebsitesState] = useState<BlockedWebsite[]>(StorageEngine.getBlockedWebsites());
  const [selected18PlusCategories, setSelected18PlusCategoriesState] = useState<string[]>(StorageEngine.getSelected18PlusCategories());
  const [isAdultShieldEnabled, setIsAdultShieldEnabledState] = useState<boolean>(StorageEngine.getIsAdultShieldEnabled());
  const [schedules, setSchedulesState] = useState<BlockingSchedule[]>(StorageEngine.getSchedules());
  const [neetChapters, setNeetChaptersState] = useState<NeetChapter[]>(StorageEngine.getNeetChapters());
  const [weeklyTargets, setWeeklyTargetsState] = useState<WeeklyNeetTarget[]>(StorageEngine.getWeeklyTargets());
  const [mockTests, setMockTestsState] = useState<MockTestRecord[]>(StorageEngine.getMockTests());
  const [questionBank, setQuestionBankState] = useState<QuestionItem[]>(StorageEngine.getQuestionBank());
  const [revisionItems, setRevisionItemsState] = useState<RevisionScheduleItem[]>(StorageEngine.getRevisions());
  const [tasks, setTasksState] = useState<StudyTask[]>(StorageEngine.getTasks());
  const [sleepRecords, setSleepRecordsState] = useState<SleepRecord[]>(StorageEngine.getSleepRecords());
  const [notifications, setNotificationsState] = useState<AppNotification[]>(StorageEngine.getNotifications());
  const [settings, setSettingsState] = useState<UserSettings>(StorageEngine.getSettings());
  const [analytics, setAnalyticsState] = useState<DailyAnalytics[]>(StorageEngine.getAnalytics());
  const [studySessions, setStudySessionsState] = useState<StudySession[]>(StorageEngine.getStudySessions());
  const [simulatedBlockedTarget, setSimulatedBlockedTarget] = useState<{ name: string; url?: string; reason: string } | null>(null);

  // Normalizing active tab
  const setActiveTab = (tab: NavigationTab) => {
    if (tab === 'dashboard') {
      setActiveTabState('home');
    } else if (tab === 'study') {
      setActiveTabState('neet');
    } else if (tab === 'settings') {
      setActiveTabState('profile');
    } else {
      setActiveTabState(tab);
    }
  };

  // Network & Offline resilience listener
  useEffect(() => {
    const handleOnline = () => {
      setSyncState('Syncing');
      setTimeout(() => setSyncState('Synced'), 1000);
    };
    const handleOffline = () => {
      setSyncState('Offline');
    };

    if (typeof window !== 'undefined') {
      if (!navigator.onLine) {
        setSyncState('Offline');
      }
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const triggerManualSync = () => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setSyncState('Offline');
      return;
    }
    setSyncState('Syncing');
    setTimeout(() => {
      setSyncState('Synced');
    }, 800);
  };


  // Sync theme with HTML root class
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  // Sync blocked apps and domains with Android native Accessibility & VPN services
  // NOTE: Automatically merges user's custom domains with curated 18+ domains from selected18PlusCategories,
  // without polluting the custom domain cards list.
  useEffect(() => {
    const activePkgs = blockedApps.filter(a => a.isBlocked).map(a => a.packageName);
    const customDomains = blockedWebsites.filter(w => w.isBlocked).map(w => w.url);
    const adultDomains = isAdultShieldEnabled ? getDomainsForCategories(selected18PlusCategories) : [];
    const allDomains = Array.from(new Set([...customDomains, ...adultDomains]));
    const hasAdultActive = isAdultShieldEnabled && selected18PlusCategories.length > 0;

    getNativeBridge().updateBlockList({
      blockedPackages: activePkgs,
      blockedDomains: allDomains,
      isStrict: false,
      allowEmergencyUnlock: true,
      activeSubject: 'NEET 2027 Preparation',
      isAdultBlockingEnabled: hasAdultActive
    }).catch(() => {});
  }, [blockedApps, blockedWebsites, isAdultShieldEnabled, selected18PlusCategories]);

  const setSelected18PlusCategories = (categories: string[]) => {
    setSelected18PlusCategoriesState(categories);
    StorageEngine.setSelected18PlusCategories(categories);
  };

  const setIsAdultShieldEnabled = (enabled: boolean) => {
    setIsAdultShieldEnabledState(enabled);
    StorageEngine.setIsAdultShieldEnabled(enabled);
  };

  const toggle18PlusCategory = (category: string) => {
    setSelected18PlusCategoriesState(prev => {
      const next = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      StorageEngine.setSelected18PlusCategories(next);
      return next;
    });
  };

  // Profile actions
  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfileState(prev => {
      const next = { ...prev, ...updated };
      StorageEngine.setUserProfile(next);
      return next;
    });
  };

  // Goals actions
  const updateUserGoals = (updated: Partial<UserGoals>) => {
    setUserGoalsState(prev => {
      const next = { ...prev, ...updated };
      StorageEngine.setUserGoals(next);
      return next;
    });
  };

  // Blocked apps actions
  const toggleAppBlocked = (appId: string) => {
    setBlockedAppsState(prev => {
      const next = prev.map(app => app.id === appId ? { ...app, isBlocked: !app.isBlocked } : app);
      StorageEngine.setBlockedApps(next);
      return next;
    });
  };

  const updateAppLimit = (appId: string, limitMinutes: number) => {
    setBlockedAppsState(prev => {
      const next = prev.map(app => app.id === appId ? { ...app, dailyLimitMinutes: limitMinutes } : app);
      StorageEngine.setBlockedApps(next);
      return next;
    });
  };

  // Blocked websites actions
  const addBlockedWebsite = (url: string, name: string, category: string) => {
    setBlockedWebsitesState(prev => {
      const newSite: BlockedWebsite = {
        id: `web-${Date.now()}`,
        url: url.trim().toLowerCase(),
        name: name.trim() || url.trim(),
        category,
        isBlocked: true,
        addedAt: new Date().toISOString().split('T')[0]
      };
      const next = [newSite, ...prev];
      StorageEngine.setBlockedWebsites(next);
      return next;
    });
  };

  const bulkAddBlockedWebsites = (newSites: { url: string; name: string; category: string }[]) => {
    setBlockedWebsitesState(prev => {
      const existingUrls = new Set(prev.map(w => w.url.trim().toLowerCase()));
      const now = new Date().toISOString().split('T')[0];
      const additions: BlockedWebsite[] = [];

      for (let i = 0; i < newSites.length; i++) {
        const cleanUrl = newSites[i].url.trim().toLowerCase();
        if (!existingUrls.has(cleanUrl)) {
          existingUrls.add(cleanUrl);
          additions.push({
            id: `web-bulk-${Date.now()}-${i}`,
            url: cleanUrl,
            name: newSites[i].name || cleanUrl,
            category: newSites[i].category,
            isBlocked: true,
            addedAt: now
          });
        }
      }

      if (additions.length === 0) return prev;
      const next = [...additions, ...prev];
      StorageEngine.setBlockedWebsites(next);
      return next;
    });
  };

  const removeBlockedWebsitesByCategory = (category: string) => {
    setBlockedWebsitesState(prev => {
      const next = prev.filter(w => w.category !== category);
      StorageEngine.setBlockedWebsites(next);
      return next;
    });
  };

  const removeBlockedWebsitesByCategories = (categories: string[]) => {
    const catSet = new Set(categories);
    setBlockedWebsitesState(prev => {
      const next = prev.filter(w => !catSet.has(w.category));
      StorageEngine.setBlockedWebsites(next);
      return next;
    });
  };

  const removeBlockedWebsite = (id: string) => {
    setBlockedWebsitesState(prev => {
      const next = prev.filter(w => w.id !== id);
      StorageEngine.setBlockedWebsites(next);
      return next;
    });
  };

  const toggleWebsiteBlocked = (id: string) => {
    setBlockedWebsitesState(prev => {
      const next = prev.map(w => w.id === id ? { ...w, isBlocked: !w.isBlocked } : w);
      StorageEngine.setBlockedWebsites(next);
      return next;
    });
  };

  // Schedule actions
  const toggleSchedule = (id: string) => {
    setSchedulesState(prev => {
      const next = prev.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s);
      StorageEngine.setSchedules(next);
      return next;
    });
  };

  const addSchedule = (scheduleData: Omit<BlockingSchedule, 'id'>) => {
    setSchedulesState(prev => {
      const newSchedule: BlockingSchedule = {
        id: `sch-${Date.now()}`,
        ...scheduleData
      };
      const next = [...prev, newSchedule];
      StorageEngine.setSchedules(next);
      return next;
    });
  };

  const updateSchedule = (updated: BlockingSchedule) => {
    setSchedulesState(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s);
      StorageEngine.setSchedules(next);
      return next;
    });
  };

  const deleteSchedule = (id: string) => {
    setSchedulesState(prev => {
      const next = prev.filter(s => s.id !== id);
      StorageEngine.setSchedules(next);
      return next;
    });
  };

  // Chapter actions (81 Syllabus + Custom)
  const updateChapterStatus = (chapterId: string, status: ChapterStatus) => {
    setNeetChaptersState(prev => {
      const next = prev.map(c => {
        if (c.id === chapterId) {
          const revisionCount = (status === 'Revision' || status === 'Completed') ? c.revisionCount + 1 : c.revisionCount;
          const lastRevisionDate = (status === 'Revision' || status === 'Completed') ? new Date().toISOString().split('T')[0] : c.lastRevisionDate;
          return { ...c, status, revisionCount, lastRevisionDate };
        }
        return c;
      });
      StorageEngine.setNeetChapters(next);
      return next;
    });
  };

  const updateChapterTargetDate = (chapterId: string, date: string) => {
    setNeetChaptersState(prev => {
      const next = prev.map(c => c.id === chapterId ? { ...c, targetCompletionDate: date } : c);
      StorageEngine.setNeetChapters(next);
      return next;
    });
  };

  const updateChapterQuestions = (
    chapterId: string,
    solved: number,
    correct: number,
    wrong: number,
    unattempted: number
  ) => {
    setNeetChaptersState(prev => {
      const next = prev.map(c => {
        if (c.id === chapterId) {
          const accuracyPercentage = (solved > 0 && correct + wrong > 0)
            ? Math.round((correct / (correct + wrong)) * 100)
            : c.accuracyPercentage;
          return {
            ...c,
            questionsSolved: solved,
            correctCount: correct,
            wrongCount: wrong,
            unattemptedCount: unattempted,
            accuracyPercentage
          };
        }
        return c;
      });
      StorageEngine.setNeetChapters(next);
      return next;
    });
  };

  const updateChapterNotes = (chapterId: string, notes: string, keyFormulas?: string[]) => {
    setNeetChaptersState(prev => {
      const next = prev.map(c => {
        if (c.id === chapterId) {
          return {
            ...c,
            notes,
            keyFormulas: keyFormulas || c.keyFormulas
          };
        }
        return c;
      });
      StorageEngine.setNeetChapters(next);
      return next;
    });
  };

  const addCustomChapter = (chapterData: Omit<NeetChapter, 'id'>) => {
    setNeetChaptersState(prev => {
      const newChap: NeetChapter = {
        id: `custom-chap-${Date.now()}`,
        ...chapterData
      };
      const next = [...prev, newChap];
      StorageEngine.setNeetChapters(next);
      return next;
    });
  };

  const deleteCustomChapter = (chapterId: string) => {
    setNeetChaptersState(prev => {
      const next = prev.filter(c => c.id !== chapterId);
      StorageEngine.setNeetChapters(next);
      return next;
    });
  };

  // Weekly Targets actions
  const updateWeeklyTarget = (id: string, updates: Partial<WeeklyNeetTarget>) => {
    setWeeklyTargetsState(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      StorageEngine.setWeeklyTargets(next);
      return next;
    });
  };

  const carryForwardWeeklyTargets = () => {
    const next = StorageEngine.carryForwardTargets();
    setWeeklyTargetsState(next);
  };

  const archiveWeeklyReview = (notes?: string) => {
    const next = StorageEngine.archiveWeeklyReview(notes);
    setWeeklyTargetsState(next);
  };

  // Mock Tests actions
  const addMockTest = (testData: Omit<MockTestRecord, 'id'>) => {
    setMockTestsState(prev => {
      const newTest: MockTestRecord = {
        id: `mock-${Date.now()}`,
        ...testData
      };
      const next = [newTest, ...prev];
      StorageEngine.setMockTests(next);
      return next;
    });
  };

  const deleteMockTest = (testId: string) => {
    setMockTestsState(prev => {
      const next = prev.filter(m => m.id !== testId);
      StorageEngine.setMockTests(next);
      return next;
    });
  };

  const addQuestionToBank = (qData: Omit<QuestionItem, 'id'>) => {
    setQuestionBankState(prev => {
      const newQ: QuestionItem = {
        id: `q-${Date.now()}`,
        ...qData
      };
      const next = [...prev, newQ];
      StorageEngine.setQuestionBank(next);
      return next;
    });
  };

  // Spaced Revision actions
  const addRevisionSchedule = (chapterId: string, chapterTitle: string, subject: NeetSubject) => {
    const today = new Date().toISOString().split('T')[0];
    const intervals = [1, 3, 7, 15, 30];
    const newItems: RevisionScheduleItem[] = intervals.map((intDays, idx) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + intDays);
      return {
        id: `rev-${Date.now()}-${idx}`,
        chapterId,
        chapterTitle,
        subject,
        revisionNumber: idx + 1,
        scheduledDate: dueDate.toISOString().split('T')[0],
        completed: false
      };
    });

    setRevisionItemsState(prev => {
      const next = [...newItems, ...prev];
      StorageEngine.setRevisions(next);
      return next;
    });
  };

  const completeRevisionStep = (scheduleId: string, intervalDays: number) => {
    const next = StorageEngine.completeRevisionInterval(scheduleId, intervalDays);
    setRevisionItemsState(next);
  };

  const deleteRevisionSchedule = (scheduleId: string) => {
    setRevisionItemsState(prev => {
      const next = prev.filter(r => r.id !== scheduleId);
      StorageEngine.setRevisions(next);
      return next;
    });
  };

  // Tasks actions
  const addTask = (taskData: Omit<StudyTask, 'id'>) => {
    setTasksState(prev => {
      const newTask: StudyTask = {
        id: `tsk-${Date.now()}`,
        ...taskData
      };
      const next = [newTask, ...prev];
      StorageEngine.setTasks(next);
      return next;
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasksState(prev => {
      const next: StudyTask[] = prev.map(t => {
        if (t.id === taskId) {
          const newStatus: TaskStatus = t.status === 'Completed' ? 'In Progress' : 'Completed';
          return { ...t, status: newStatus };
        }
        return t;
      });
      StorageEngine.setTasks(next);
      return next;
    });
  };

  const deleteTask = (taskId: string) => {
    setTasksState(prev => {
      const next = prev.filter(t => t.id !== taskId);
      StorageEngine.setTasks(next);
      return next;
    });
  };

  // Sleep actions
  const addSleepRecord = (record: Omit<SleepRecord, 'id'>) => {
    setSleepRecordsState(prev => {
      const newRec: SleepRecord = {
        id: `slp-${Date.now()}`,
        ...record
      };
      const next = [newRec, ...prev];
      StorageEngine.setSleepRecords(next);
      return next;
    });
  };

  // Notification actions
  const markNotificationAsRead = (id: string) => {
    setNotificationsState(prev => {
      const next = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      StorageEngine.setNotifications(next);
      return next;
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotificationsState(prev => {
      const next = prev.map(n => ({ ...n, isRead: true }));
      StorageEngine.setNotifications(next);
      return next;
    });
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // Settings & Mode
  const updateSettings = (updated: Partial<UserSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...updated };
      StorageEngine.setSettings(next);
      return next;
    });
  };

  const setBiologyMode = (mode: BiologyOrganizationMode) => {
    setSettingsState(prev => {
      const next = { ...prev, biologyOrganizationMode: mode };
      StorageEngine.setSettings(next);
      return next;
    });
    setUserProfileState(prev => {
      const next = { ...prev, biologyOrganizationMode: mode };
      StorageEngine.setUserProfile(next);
      return next;
    });
  };

  // Study sessions actions
  const addStudySession = (sessionData: Omit<StudySession, 'id'>) => {
    setStudySessionsState(prev => {
      const newSession: StudySession = {
        id: `ses-${Date.now()}`,
        ...sessionData
      };
      const next = [newSession, ...prev];
      StorageEngine.setStudySessions(next);
      return next;
    });

    // Update user total study time
    setUserProfileState(prev => {
      const next = {
        ...prev,
        totalStudyMinutes: prev.totalStudyMinutes + sessionData.durationMinutes
      };
      StorageEngine.setUserProfile(next);
      return next;
    });

    // Update today's analytics
    setAnalyticsState(prev => {
      const todayStr = new Date().toISOString().split('T')[0];
      const next = prev.map(a => {
        if (a.date === todayStr) {
          const newProductive = a.productiveMinutes + sessionData.durationMinutes;
          const newScore = Math.min(Math.round((newProductive / (newProductive + a.distractedMinutes)) * 100), 99);
          return {
            ...a,
            productiveMinutes: newProductive,
            screenTimeMinutes: a.screenTimeMinutes + sessionData.durationMinutes,
            focusScore: newScore,
            focusSessionsCount: a.focusSessionsCount + 1
          };
        }
        return a;
      });
      StorageEngine.setAnalytics(next);
      return next;
    });
  };

  // Checklist Routines Actions
  const addChecklist = (checklistData: Omit<ChecklistRoutine, 'id' | 'createdAt'>) => {
    setChecklistsState((prev) => {
      const newRoutine: ChecklistRoutine = {
        id: `routine-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...checklistData
      };
      const next = [newRoutine, ...prev];
      StorageEngine.setChecklists(next);
      return next;
    });
  };

  const updateChecklist = (routine: ChecklistRoutine) => {
    setChecklistsState((prev) => {
      const next = prev.map((r) => (r.id === routine.id ? routine : r));
      StorageEngine.setChecklists(next);
      return next;
    });
  };

  const deleteChecklist = (id: string) => {
    setChecklistsState((prev) => {
      const next = prev.filter((r) => r.id !== id);
      StorageEngine.setChecklists(next);
      return next;
    });
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    const updated = StorageEngine.toggleChecklistItem(checklistId, itemId);
    setChecklistsState(updated);
  };

  const addChecklistItem = (
    checklistId: string,
    itemData: Omit<ChecklistItem, 'id' | 'completed'>
  ) => {
    setChecklistsState((prev) => {
      const next = prev.map((r) => {
        if (r.id === checklistId) {
          const newItem: ChecklistItem = {
            id: `item-${Date.now()}`,
            completed: false,
            isCompleted: false,
            ...itemData
          };
          return { ...r, items: [...r.items, newItem] };
        }
        return r;
      });
      StorageEngine.setChecklists(next);
      return next;
    });
  };

  const deleteChecklistItem = (checklistId: string, itemId: string) => {
    setChecklistsState((prev) => {
      const next = prev.map((r) => {
        if (r.id === checklistId) {
          return { ...r, items: r.items.filter((it) => it.id !== itemId) };
        }
        return r;
      });
      StorageEngine.setChecklists(next);
      return next;
    });
  };

  const resetChecklist = (checklistId: string) => {
    const updated = StorageEngine.resetChecklist(checklistId);
    setChecklistsState(updated);
  };

  const duplicateChecklist = (checklistId: string) => {
    const target = checklists.find((r) => r.id === checklistId);
    if (!target) return;
    addChecklist({
      title: `${target.title} (Copy)`,
      description: target.description,
      recurrence: target.recurrence,
      category: target.category,
      items: target.items.map((it, idx) => ({
        ...it,
        id: `item-${Date.now()}-${idx}`,
        completed: false,
        isCompleted: false
      }))
    });
  };

  // Calendar Event Actions
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    setCalendarEventsState((prev) => {
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        ...eventData
      };
      const next = [newEvent, ...prev];
      StorageEngine.setCalendarEvents(next);
      return next;
    });
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEventsState((prev) => {
      const next = prev.filter((ev) => ev.id !== id);
      StorageEngine.setCalendarEvents(next);
      return next;
    });
  };

  // Simulated Block Screen Trigger
  const triggerSimulatedBlock = (name: string, url?: string, reason?: string) => {
    setSimulatedBlockedTarget({
      name,
      url,
      reason: reason || 'Restricted during your active study schedule.'
    });
  };

  const closeSimulatedBlock = () => {
    setSimulatedBlockedTarget(null);
  };

  // JSON Backup / Restore
  const exportBackupJson = () => {
    return StorageEngine.exportAllDataAsJson();
  };

  const importBackupJson = (json: string) => {
    const success = StorageEngine.importAllDataFromJson(json);
    if (success) {
      setUserProfileState(StorageEngine.getUserProfile());
      setUserGoalsState(StorageEngine.getUserGoals());
      setBlockedAppsState(StorageEngine.getBlockedApps());
      setBlockedWebsitesState(StorageEngine.getBlockedWebsites());
      setSchedulesState(StorageEngine.getSchedules());
      setNeetChaptersState(StorageEngine.getNeetChapters());
      setWeeklyTargetsState(StorageEngine.getWeeklyTargets());
      setMockTestsState(StorageEngine.getMockTests());
      setQuestionBankState(StorageEngine.getQuestionBank());
      setRevisionItemsState(StorageEngine.getRevisions());
      setTasksState(StorageEngine.getTasks());
      setSleepRecordsState(StorageEngine.getSleepRecords());
      setNotificationsState(StorageEngine.getNotifications());
      setSettingsState(StorageEngine.getSettings());
      setAnalyticsState(StorageEngine.getAnalytics());
      setStudySessionsState(StorageEngine.getStudySessions());
    }
    return success;
  };

  // Reset
  const resetAllData = () => {
    StorageEngine.resetAll();
    setUserProfileState(StorageEngine.getUserProfile());
    setUserGoalsState(StorageEngine.getUserGoals());
    setBlockedAppsState(StorageEngine.getBlockedApps());
    setBlockedWebsitesState(StorageEngine.getBlockedWebsites());
    setSchedulesState(StorageEngine.getSchedules());
    setNeetChaptersState(StorageEngine.getNeetChapters());
    setWeeklyTargetsState(StorageEngine.getWeeklyTargets());
    setMockTestsState(StorageEngine.getMockTests());
    setQuestionBankState(StorageEngine.getQuestionBank());
    setRevisionItemsState(StorageEngine.getRevisions());
    setTasksState(StorageEngine.getTasks());
    setSleepRecordsState(StorageEngine.getSleepRecords());
    setNotificationsState(StorageEngine.getNotifications());
    setSettingsState(StorageEngine.getSettings());
    setAnalyticsState(StorageEngine.getAnalytics());
    setStudySessionsState(StorageEngine.getStudySessions());
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        syncState,
        triggerManualSync,
        userProfile,
        updateUserProfile,
        userGoals,
        updateUserGoals,
        checklists,
        addChecklist,
        updateChecklist,
        deleteChecklist,
        toggleChecklistItem,
        addChecklistItem,
        deleteChecklistItem,
        resetChecklist,
        duplicateChecklist,
        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
        blockedApps,
        setBlockedAppsState,
        toggleAppBlocked,
        updateAppLimit,
        blockedWebsites,
        addBlockedWebsite,
        bulkAddBlockedWebsites,
        removeBlockedWebsitesByCategory,
        removeBlockedWebsitesByCategories,
        removeBlockedWebsite,
        toggleWebsiteBlocked,
        selected18PlusCategories,
        setSelected18PlusCategories,
        toggle18PlusCategory,
        isAdultShieldEnabled,
        setIsAdultShieldEnabled,
        schedules,
        toggleSchedule,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        neetChapters,
        updateChapterStatus,
        updateChapterTargetDate,
        updateChapterQuestions,
        updateChapterNotes,
        addCustomChapter,
        deleteCustomChapter,
        weeklyTargets,
        updateWeeklyTarget,
        carryForwardWeeklyTargets,
        archiveWeeklyReview,
        mockTests,
        addMockTest,
        deleteMockTest,
        questionBank,
        addQuestionToBank,
        revisionItems,
        addRevisionSchedule,
        completeRevisionStep,
        deleteRevisionSchedule,
        tasks,
        addTask,
        toggleTaskStatus,
        deleteTask,
        sleepRecords,
        addSleepRecord,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        settings,
        updateSettings,
        setBiologyMode,
        analytics,
        studySessions,
        addStudySession,
        simulatedBlockedTarget,
        triggerSimulatedBlock,
        closeSimulatedBlock,
        exportBackupJson,
        importBackupJson,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};


import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { useFocusTimer } from './context/FocusTimerContext';
import { Header } from './components/layout/Header';
import { DesktopNav } from './components/layout/DesktopNav';
import { BottomNav } from './components/layout/BottomNav';
import { FocusScoreCard } from './components/dashboard/FocusScoreCard';
import { TodayGoalCard } from './components/dashboard/TodayGoalCard';
import { QuickActions } from './components/dashboard/QuickActions';
import { NeetCountdownCard } from './components/dashboard/NeetCountdownCard';
import { FocusSetupModal } from './components/focus/FocusSetupModal';
import { ActiveFocusOverlay } from './components/focus/ActiveFocusOverlay';
import { SessionCompleteModal } from './components/focus/SessionCompleteModal';
import { SimulatedBlockScreen } from './components/blocker/SimulatedBlockScreen';
import { AppBlocker } from './components/blocker/AppBlocker';
import { WebsiteBlocker } from './components/blocker/WebsiteBlocker';
import { BlockingSchedules } from './components/blocker/BlockingSchedules';
import { PomodoroTimer } from './components/study/PomodoroTimer';
import { NeetChecklistHub } from './components/neet/NeetChecklistHub';
import { WeeklyTargetsCard } from './components/weekly/WeeklyTargetsCard';
import { MockTestHub } from './components/mocktests/MockTestHub';
import { StudyPlannerHub } from './components/planner/StudyPlannerHub';
import { RevisionPlanner } from './components/revision/RevisionPlanner';
import { TaskChecklist } from './components/tasks/TaskChecklist';
import { AddTaskModal } from './components/tasks/AddTaskModal';
import { ChecklistRoutinesHub } from './components/checklists/ChecklistRoutinesHub';
import { CalendarHub } from './components/calendar/CalendarHub';
import { AnalyticsCharts } from './components/analytics/AnalyticsCharts';
import { ProfileScreen } from './components/settings/ProfileScreen';
import { AuthModal } from './components/settings/AuthModal';
import { SupabaseConfigModal } from './components/settings/SupabaseConfigModal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { getGreeting, getFormattedToday } from './utils/formatters';
import { Card } from './components/common/Card';
import { Shield, Sparkles, BookOpen, Clock, Play, RotateCw, Target, Award, Calendar } from 'lucide-react';

export const MainApp: React.FC = () => {
  const { activeTab, setActiveTab, userProfile, studySessions } = useApp();

  // Modals state
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!userProfile.onboardingCompleted);

  // Sub-tabs for Blocker page
  const [blockerSubTab, setBlockerSubTab] = useState<'apps' | 'websites' | 'schedules'>('apps');

  // Sub-tabs for NEET hub page
  const [neetSubTab, setNeetSubTab] = useState<'syllabus' | 'revision'>('syllabus');

  const greeting = getGreeting();
  const todayStr = getFormattedToday();

  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B] text-slate-100 font-sans pb-20 lg:pb-10">
      {/* Top App Header */}
      <Header />

      {/* Desktop Navigation Tabs */}
      <DesktopNav />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5">
        {/* ==================== TAB 1: HOME / DASHBOARD ==================== */}
        {(activeTab === 'home' || activeTab === 'dashboard') && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Student Greeting Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">{userProfile.name}</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {todayStr} • Daily NEET Preparation + Engineering Routine Active
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
                >
                  Review Goals
                </button>
              </div>
            </div>

            {/* NEET 2027 Journey Banner */}
            <NeetCountdownCard />

            {/* Focus Score & Today's Goal Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FocusScoreCard />
              <TodayGoalCard />
            </div>

            {/* Quick Actions Grid */}
            <QuickActions
              onOpenFocusModal={() => setShowFocusModal(true)}
              onOpenAddTaskModal={() => setShowAddTaskModal(true)}
            />

            {/* Task Checklist Snapshot */}
            <TaskChecklist onOpenAddTaskModal={() => setShowAddTaskModal(true)} />

            {/* Recent Study Sessions Log */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  Recent Study Log
                </h3>
                <span className="text-[11px] text-slate-400">
                  {studySessions.length} recorded sessions
                </span>
              </div>

              <div className="space-y-2.5">
                {studySessions.slice(0, 3).map((ses) => (
                  <div
                    key={ses.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{ses.subject}</span>
                        <span className="text-slate-400">• {ses.chapterTitle}</span>
                      </div>
                      {ses.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5 line-clamp-1">
                          “{ses.notes}”
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-emerald-400 block">+{ses.durationMinutes}m</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ses.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ==================== TAB: TASKS ==================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <TaskChecklist onOpenAddTaskModal={() => setShowAddTaskModal(true)} />
          </div>
        )}

        {/* ==================== TAB: CHECKLIST ROUTINES (SCREENSHOT MATCH) ==================== */}
        {activeTab === 'checklists' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <ChecklistRoutinesHub />
          </div>
        )}

        {/* ==================== TAB: CALENDAR TIMETABLE ==================== */}
        {activeTab === 'calendar' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <CalendarHub />
          </div>
        )}

        {/* ==================== TAB 2: NEET 81-CHAPTER HUB ==================== */}
        {(activeTab === 'neet' || activeTab === 'study') && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">NEET 2027 Syllabus & Revision Hub</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete 81-chapter NCERT checklist, question counters (+4/-1), accuracy tracking & spaced revision
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl">
                <button
                  onClick={() => setNeetSubTab('syllabus')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    neetSubTab === 'syllabus'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  81-Chapter Syllabus
                </button>
                <button
                  onClick={() => setNeetSubTab('revision')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    neetSubTab === 'revision'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Spaced Revision
                </button>
              </div>
            </div>

            {neetSubTab === 'syllabus' ? <NeetChecklistHub /> : <RevisionPlanner />}
          </div>
        )}

        {/* ==================== TAB 3: WEEKLY TARGETS ==================== */}
        {activeTab === 'weekly' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <WeeklyTargetsCard />
          </div>
        )}

        {/* ==================== TAB 4: FOCUS MODE ==================== */}
        {activeTab === 'focus' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Focus Mode & Deep Study</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Launch full-screen distraction-free timer sessions linked to NEET chapters
                </p>
              </div>

              <button
                onClick={() => setShowFocusModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20"
              >
                Quick Focus Setup
              </button>
            </div>

            <PomodoroTimer />
          </div>
        )}

        {/* ==================== TAB 5: BLOCKER ==================== */}
        {activeTab === 'blocker' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">Distraction Blocker</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage restricted applications, distracting websites, daily limits, and automated schedules
                </p>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl">
                {(['apps', 'websites', 'schedules'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setBlockerSubTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      blockerSubTab === tab
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'apps' ? 'Apps' : tab === 'websites' ? 'Websites' : 'Schedules'}
                  </button>
                ))}
              </div>
            </div>

            {blockerSubTab === 'apps' && <AppBlocker />}
            {blockerSubTab === 'websites' && <WebsiteBlocker />}
            {blockerSubTab === 'schedules' && <BlockingSchedules />}
          </div>
        )}

        {/* ==================== TAB 6: MOCK TESTS (720) ==================== */}
        {activeTab === 'mocktests' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <MockTestHub />
          </div>
        )}

        {/* ==================== TAB 7: STUDY PLANNER & TIMETABLE ==================== */}
        {activeTab === 'planner' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <StudyPlannerHub />
          </div>
        )}

        {/* ==================== TAB 8: ANALYTICS ==================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <AnalyticsCharts />
          </div>
        )}

        {/* ==================== TAB 9: PROFILE & SETTINGS ==================== */}
        {(activeTab === 'profile' || activeTab === 'settings') && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <ProfileScreen
              onOpenAuthModal={() => setShowAuthModal(true)}
              onOpenSupabaseModal={() => setShowSupabaseModal(true)}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* ===== GLOBAL MODALS & OVERLAYS ===== */}
      <ActiveFocusOverlay />
      <SessionCompleteModal />
      <SimulatedBlockScreen />

      <FocusSetupModal
        isOpen={showFocusModal}
        onClose={() => setShowFocusModal(false)}
      />

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <SupabaseConfigModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />

      {showOnboarding && (
        <OnboardingFlow
          onComplete={() => setShowOnboarding(false)}
          onOpenAuth={() => {
            setShowOnboarding(false);
            setShowAuthModal(true);
          }}
        />
      )}
    </div>
  );
};

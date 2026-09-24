import React from 'react';
import {
  Home,
  CheckSquare,
  ListTodo,
  Calendar,
  Timer,
  BookOpen,
  Target,
  ShieldAlert,
  Award,
  CalendarDays,
  BarChart3,
  User,
  FileText
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { useFocusTimer } from '../../context/FocusTimerContext';

export const DesktopNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { isRunning } = useFocusTimer();

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.FC<any>; isLive?: boolean }> = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'notes', label: 'Notion Notes', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Timer, isLive: isRunning },
    { id: 'neet', label: 'NEET Planner', icon: BookOpen },
    { id: 'weekly', label: 'Weekly Targets', icon: Target },
    { id: 'blocker', label: 'App Blocker', icon: ShieldAlert },
    { id: 'mocktests', label: 'Mock Tests', icon: Award },
    { id: 'planner', label: 'College Timetable', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Settings', icon: User },
  ];

  return (
    <div className="hidden lg:flex items-center justify-center py-2 px-4 border-b border-white/5 bg-[#0e1733]/60 backdrop-blur-md">
      <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-inner overflow-x-auto max-w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'home' && activeTab === 'dashboard') ||
            (item.id === 'neet' && activeTab === 'study') ||
            (item.id === 'profile' && activeTab === 'settings');

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all select-none whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.isLive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import {
  Home,
  CheckSquare,
  Calendar,
  Timer,
  BookOpen,
  ShieldAlert,
  Award,
  User,
  ListTodo
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { useFocusTimer } from '../../context/FocusTimerContext';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { isRunning } = useFocusTimer();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'checklists', label: 'Routines', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Timer, badge: isRunning ? 'LIVE' : undefined },
    { id: 'neet', label: 'NEET 81', icon: BookOpen },
    { id: 'blocker', label: 'Blocker', icon: ShieldAlert },
    { id: 'mocktests', label: 'Mocks', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B132B]/95 backdrop-blur-lg border-t border-white/10 px-1 py-1 lg:hidden">
      <div className="flex items-center justify-around">
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
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all select-none ${
                isActive
                  ? 'text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-sky-400' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] font-extrabold px-1 rounded-full bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-0.5 tracking-tight whitespace-nowrap">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-sky-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

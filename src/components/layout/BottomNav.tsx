import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Calendar,
  Timer,
  BookOpen,
  ShieldAlert,
  Award,
  User,
  MoreHorizontal,
  BarChart3,
  X,
  Sparkles
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'blocker', label: 'Blocker', icon: ShieldAlert },
    { id: 'focus', label: 'Focus', icon: Timer, badge: isRunning ? 'LIVE' : undefined },
    { id: 'neet', label: 'NEET 81', icon: BookOpen },
    { id: 'checklists', label: 'Routines', icon: CheckSquare },
  ];

  const moreNavItems: NavItem[] = [
    { id: 'calendar', label: 'Study Calendar', icon: Calendar },
    { id: 'mocktests', label: 'Mock Test Hub', icon: Award },
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  const isMoreActive = moreNavItems.some(item => activeTab === item.id || (item.id === 'profile' && activeTab === 'settings'));

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B132B]/98 backdrop-blur-xl border-t border-white/10 px-1 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] lg:hidden max-w-full">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'home' && activeTab === 'dashboard') ||
              (item.id === 'neet' && activeTab === 'study');

            return (
              <button
                key={item.id}
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveTab(item.id);
                }}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all select-none min-w-[56px] ${
                  isActive
                    ? 'text-sky-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-sky-400' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-3 text-[8px] font-extrabold px-1 rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px] text-center">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-sky-400" />
                )}
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all select-none min-w-[56px] ${
              isMoreActive || showMoreMenu
                ? 'text-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px] text-center">More</span>
            {isMoreActive && (
              <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-sky-400" />
            )}
          </button>
        </div>
      </nav>

      {/* More Options Drawer Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-150">
          <div className="bg-[#1C2541] border-t border-white/10 rounded-t-3xl p-5 space-y-4 max-w-full pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                More Features
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'profile' && activeTab === 'settings');

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                      isActive
                        ? 'bg-sky-500/20 border-sky-500/40 text-sky-400 font-bold'
                        : 'bg-slate-900/70 border-white/5 text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-800 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

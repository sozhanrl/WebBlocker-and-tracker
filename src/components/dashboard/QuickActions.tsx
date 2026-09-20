import React from 'react';
import { Timer, ShieldAlert, BookOpen, BarChart3, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickActionsProps {
  onOpenFocusModal: () => void;
  onOpenAddTaskModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenFocusModal,
  onOpenAddTaskModal
}) => {
  const { setActiveTab } = useApp();

  const actions = [
    {
      id: 'focus',
      label: 'Focus Mode',
      sub: 'Pomodoro Timer',
      icon: Timer,
      color: 'from-sky-500 to-blue-600',
      glow: 'shadow-sky-500/20',
      onClick: () => setActiveTab('focus')
    },
    {
      id: 'chapters',
      label: 'Chapter Planner',
      sub: '81 NCERT Units',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/20',
      onClick: () => setActiveTab('neet')
    },
    {
      id: 'checklist',
      label: 'Daily Checklist',
      sub: '14-Block Routine',
      icon: PlusCircle,
      color: 'from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/20',
      onClick: () => setActiveTab('checklists')
    },
    {
      id: 'mocktests',
      label: 'Mock Tests',
      sub: '720 Marks (+4/-1)',
      icon: BarChart3,
      color: 'from-purple-500 to-indigo-600',
      glow: 'shadow-purple-500/20',
      onClick: () => setActiveTab('mocktests')
    },
    {
      id: 'blocker',
      label: 'Blockers',
      sub: 'Apps & Websites',
      icon: ShieldAlert,
      color: 'from-rose-500 to-pink-600',
      glow: 'shadow-rose-500/20',
      onClick: () => setActiveTab('blocker')
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Quick Actions</h3>
        <span className="text-[11px] text-slate-400">One-tap productivity tools</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="p-3.5 rounded-2xl bg-[#1C2541]/80 hover:bg-[#253256] border border-white/10 hover:border-white/20 transition-all text-left flex flex-col justify-between group active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${act.color} flex items-center justify-center text-white mb-2 shadow-md ${act.glow} group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-sky-400 transition-colors">
                  {act.label}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                  {act.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

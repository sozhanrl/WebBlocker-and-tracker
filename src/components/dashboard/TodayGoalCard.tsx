import React from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { formatMinutes } from '../../utils/formatters';
import { Target, CheckCircle2, Clock, Flame } from 'lucide-react';

export const TodayGoalCard: React.FC = () => {
  const { userProfile, tasks, studySessions } = useApp();

  const targetMinutes = userProfile.dailyTargetMinutes || 360; // 6h default
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = studySessions.filter((s) => s.completedAt && s.completedAt.startsWith(todayStr));
  const dynamicMinutes = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const completedMinutes = dynamicMinutes > 0 ? dynamicMinutes : 180; // dynamic with realistic baseline
  const remainingMinutes = Math.max(0, targetMinutes - completedMinutes);
  const progressPercent = Math.min(100, Math.round((completedMinutes / targetMinutes) * 100));

  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const totalTasksCount = tasks.length;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Today’s Goal Progress</h3>
            <p className="text-[11px] text-slate-400">Daily NEET preparation commitment</p>
          </div>
        </div>
        <span className="text-sm font-extrabold text-sky-400">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5 mb-3">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-md shadow-sky-500/30"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/5">
        <div className="p-2 rounded-lg bg-slate-900/50">
          <span className="text-[10px] text-slate-400 block">Target</span>
          <span className="text-xs font-bold text-white">{formatMinutes(targetMinutes)}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/50">
          <span className="text-[10px] text-slate-400 block">Completed</span>
          <span className="text-xs font-bold text-emerald-400">{formatMinutes(completedMinutes)}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/50">
          <span className="text-[10px] text-slate-400 block">Remaining</span>
          <span className="text-xs font-bold text-amber-400">{formatMinutes(remainingMinutes)}</span>
        </div>
      </div>

      {/* Mini status pill */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{completedTasksCount} of {totalTasksCount} daily tasks finished</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400 font-semibold">
          <Flame className="w-3.5 h-3.5" />
          <span>{userProfile.streakDays}-Day Streak</span>
        </div>
      </div>
    </Card>
  );
};

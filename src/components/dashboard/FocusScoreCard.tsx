import React from 'react';
import { Card } from '../common/Card';
import { CircularProgress } from '../common/CircularProgress';
import { useApp } from '../../context/AppContext';
import { formatMinutes } from '../../utils/formatters';
import { ShieldCheck, Smartphone, CheckCircle, TrendingUp } from 'lucide-react';

export const FocusScoreCard: React.FC = () => {
  const { analytics, userProfile } = useApp();
  const todayAnalytics = analytics[analytics.length - 1] || {
    focusScore: 78,
    productiveMinutes: 260,
    distractedMinutes: 75,
    screenTimeMinutes: 335
  };

  return (
    <Card className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
      {/* Circular Progress Ring */}
      <div className="flex flex-col items-center flex-shrink-0">
        <CircularProgress
          percentage={todayAnalytics.focusScore}
          size={160}
          strokeWidth={14}
          label={`${todayAnalytics.focusScore}%`}
          sublabel="Focus Score"
        />
        <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+5% higher than yesterday</span>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="flex-1 w-full space-y-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Today’s Productivity Split</h3>
          <p className="text-xs text-slate-400 mt-0.5">Based on study sessions & prevented distractions</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Productive Time */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold">Productive Time</span>
            </div>
            <span className="text-lg font-extrabold text-white">
              {formatMinutes(todayAnalytics.productiveMinutes)}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Deep study & revision</p>
          </div>

          {/* Distracted Time */}
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400 mb-1">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-semibold">Distracted Time</span>
            </div>
            <span className="text-lg font-extrabold text-white">
              {formatMinutes(todayAnalytics.distractedMinutes)}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Social media & surf</p>
          </div>
        </div>

        {/* Ratio bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Productive ({Math.round((todayAnalytics.productiveMinutes / (todayAnalytics.productiveMinutes + todayAnalytics.distractedMinutes)) * 100)}%)</span>
            <span>Distracted ({Math.round((todayAnalytics.distractedMinutes / (todayAnalytics.productiveMinutes + todayAnalytics.distractedMinutes)) * 100)}%)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-rose-500/30 overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-sky-500 rounded-full transition-all duration-700"
              style={{
                width: `${(todayAnalytics.productiveMinutes / (todayAnalytics.productiveMinutes + todayAnalytics.distractedMinutes)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

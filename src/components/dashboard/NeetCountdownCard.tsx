import React from 'react';
import { Card } from '../common/Card';
import { getNeet2027DaysRemaining } from '../../utils/formatters';
import { Flame, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NeetCountdownCard: React.FC = () => {
  const { setActiveTab, neetChapters } = useApp();
  const daysLeft = getNeet2027DaysRemaining();

  const totalChapters = neetChapters.length;
  const completedOrRevision = neetChapters.filter(c => c.status === 'Completed' || c.status === 'Revision').length;
  const syllabusPercent = totalChapters > 0 ? Math.round((completedOrRevision / totalChapters) * 100) : 0;

  return (
    <Card className="p-5 bg-gradient-to-r from-indigo-950/80 via-[#1C2541] to-slate-900 border-indigo-500/30 relative overflow-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              NEET 2027 Aspirant Journey
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Target: AIIMS / Top Govt Medical College
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            {daysLeft} Days Remaining to NEET 2027
          </h3>
          <p className="text-xs text-slate-300 italic max-w-md">
            “The stethoscope you will wear is earned in the quiet, focused hours of today.”
          </p>
        </div>

        {/* Readiness Meter & CTA */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Syllabus Mastered</span>
            <span className="text-base font-extrabold text-sky-400">
              {syllabusPercent}% <span className="text-xs font-normal text-slate-400">({completedOrRevision}/{totalChapters})</span>
            </span>
          </div>

          <button
            onClick={() => setActiveTab('study')}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 active:scale-95 flex-shrink-0"
          >
            <span>View Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

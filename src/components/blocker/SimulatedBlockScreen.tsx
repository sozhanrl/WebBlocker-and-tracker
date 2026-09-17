import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, Flame, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '../common/Button';

export const SimulatedBlockScreen: React.FC = () => {
  const { simulatedBlockedTarget, closeSimulatedBlock, setActiveTab } = useApp();

  if (!simulatedBlockedTarget) return null;

  const neetQuotes = [
    "“Every hour you spend scrolling is an hour your competition spends mastering organic reactions.”",
    "“The white coat and stethoscope require sacrifices today. Choose your future over a temporary scroll.”",
    "“One correct MCQ in NEET can elevate your rank by thousands. Get back to your NCERT books!”",
    "“Discipline is choosing between what you want now and what you want most.”"
  ];

  const randomQuote = neetQuotes[Math.floor(Math.random() * neetQuotes.length)];

  const handleReturnToStudy = () => {
    closeSimulatedBlock();
    setActiveTab('study');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B132B]/98 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-md text-center p-6 sm:p-8 rounded-3xl bg-[#1C2541] border-2 border-rose-500/40 shadow-2xl shadow-rose-500/20 space-y-6">
        {/* Shield Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-xl shadow-rose-500/30 flex items-center justify-center">
          <div className="w-full h-full bg-[#0B132B] rounded-[22px] flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-rose-400 animate-pulse" />
          </div>
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            FocusForge Shield Active
          </span>
          <h2 className="text-2xl font-extrabold text-white">
            Access Blocked!
          </h2>
          <p className="text-sm font-semibold text-rose-400 mt-1">
            {simulatedBlockedTarget.name} is currently restricted
          </p>
          {simulatedBlockedTarget.url && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {simulatedBlockedTarget.url}
            </p>
          )}
        </div>

        {/* Reason Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-left text-xs space-y-1">
          <span className="font-semibold text-slate-300 block">Blocking Trigger:</span>
          <p className="text-slate-400 leading-relaxed">
            {simulatedBlockedTarget.reason}
          </p>
        </div>

        {/* Motivational NEET Quote */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 to-indigo-950/40 border border-sky-500/20">
          <p className="text-xs text-sky-200 italic font-medium leading-relaxed">
            {randomQuote}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleReturnToStudy}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
            icon={<BookOpen className="w-4 h-4" />}
          >
            Back to NEET Study Timer
          </Button>

          <Button
            variant="ghost"
            onClick={closeSimulatedBlock}
            className="w-full text-xs text-slate-400 hover:text-white"
          >
            Dismiss & Close Warning
          </Button>
        </div>
      </div>
    </div>
  );
};

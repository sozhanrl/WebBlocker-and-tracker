import React from 'react';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { useApp } from '../../context/AppContext';
import { formatSecondsToTimer } from '../../utils/formatters';
import { Play, Pause, Square, AlertTriangle, ShieldCheck, Sparkles, Smartphone, FileText } from 'lucide-react';
import { Button } from '../common/Button';

export const ActiveFocusOverlay: React.FC = () => {
  const {
    isRunning,
    isPaused,
    remainingSeconds,
    progressPercent,
    subject,
    chapterTitle,
    taskTitle,
    isStrictMode,
    distractionsPreventedCount,
    pauseSession,
    resumeSession,
    finishSession,
    cancelSession,
    isEmergencyUnlocking,
    emergencyUnlockSecondsLeft,
    startEmergencyUnlock,
    cancelEmergencyUnlock,
    incrementDistractionPrevented
  } = useFocusTimer();

  const { triggerSimulatedBlock, blockedApps, openTakeNoteModal } = useApp();

  if (!isRunning) return null;

  const handleSimulateDistraction = () => {
    incrementDistractionPrevented();
    triggerSimulatedBlock(
      'Instagram',
      'instagram.com',
      `Locked by FocusForge during active NEET study session (${subject} - ${chapterTitle})`
    );
  };

  const subjectColorMap: Record<string, string> = {
    Physics: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Chemistry: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    Botany: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Zoology: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Mathematics: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    Other: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  };

  const ringRadius = 130;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#0B132B]/98 backdrop-blur-2xl overflow-y-auto">
      {/* Top Session Details */}
      <div className="w-full max-w-xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              subjectColorMap[subject] || subjectColorMap.Other
            }`}
          >
            {subject}
          </span>
          {isStrictMode && (
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              STRICT MODE
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{distractionsPreventedCount} Distractions Blocked</span>
        </div>
      </div>

      {/* Main Countdown Timer */}
      <div className="flex flex-col items-center my-auto py-6">
        <div className="relative flex items-center justify-center">
          <svg width={320} height={320} className="transform -rotate-90">
            <defs>
              <linearGradient id="focusActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06D6A0" />
                <stop offset="50%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <circle
              cx={160}
              cy={160}
              r={ringRadius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={16}
              fill="transparent"
            />
            <circle
              cx={160}
              cy={160}
              r={ringRadius}
              stroke="url(#focusActiveGrad)"
              strokeWidth={16}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Timer Display */}
          <div className="absolute flex flex-col items-center justify-center text-center select-none">
            <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
              {formatSecondsToTimer(remainingSeconds)}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-2">
              {isPaused ? 'SESSION PAUSED' : 'DEEP STUDY STATE'}
            </span>
            <span className="text-xs font-extrabold text-sky-400 mt-0.5">
              {progressPercent}% completed
            </span>
          </div>
        </div>

        {/* Target Task and Chapter */}
        <div className="text-center mt-6 max-w-sm px-4">
          <h3 className="text-base font-bold text-white leading-snug">
            {chapterTitle}
          </h3>
          {taskTitle && (
            <p className="text-xs text-slate-300 mt-1.5 italic bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl">
              🎯 “{taskTitle}”
            </p>
          )}
        </div>

        {/* Simulated Interception test button */}
        <div className="mt-4">
          <button
            onClick={handleSimulateDistraction}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-full border border-white/10 hover:border-rose-500/40 bg-slate-900/40 transition-all"
            title="Simulate opening a blocked app to see FocusForge blocker in action"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulate opening Instagram (Test Blocker)</span>
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-3 pb-4">
        {/* Quick Note during Focus Session */}
        <button
          onClick={() =>
            openTakeNoteModal({
              title: `${subject}: ${chapterTitle || 'Focus Session Note'}`,
              subject: subject,
              content: `### 🎯 Focus Session Notes (${subject})\n- **Chapter**: ${chapterTitle || 'General'}\n- **Task**: ${taskTitle || 'Study Block'}\n\n#### Key Concepts & Formulas:\n- \n\n#### Questions / Doubts:\n- `,
              isStored: true
            })
          }
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 hover:border-violet-500/50 text-xs font-bold transition-all shadow-md active:scale-95 group"
          title="Jot down rough notes, concepts or formulas without leaving focus mode"
        >
          <FileText className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
          <span>Take Note (Notion Notepad)</span>
        </button>

        {/* Play/Pause & Finish Controls */}
        <div className="flex items-center justify-center gap-3 w-full">
          {isPaused ? (
            <Button
              onClick={resumeSession}
              variant="success"
              size="lg"
              className="flex-1 py-3"
              icon={<Play className="w-5 h-5 fill-current" />}
            >
              Resume Focus
            </Button>
          ) : (
            <Button
              onClick={pauseSession}
              variant="secondary"
              size="lg"
              className="flex-1 py-3"
              icon={<Pause className="w-5 h-5" />}
            >
              Pause
            </Button>
          )}

          <Button
            onClick={finishSession}
            variant="primary"
            size="lg"
            className="flex-1 py-3"
            icon={<Sparkles className="w-5 h-5" />}
          >
            Finish Early
          </Button>
        </div>

        {/* Strict Mode Emergency Unlock / Cancel */}
        {isStrictMode ? (
          <div className="w-full text-center">
            {isEmergencyUnlocking ? (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 space-y-2">
                <span className="text-xs font-bold text-rose-400 block">
                  Emergency Unlocking in {emergencyUnlockSecondsLeft}s...
                </span>
                <p className="text-[10px] text-slate-300">
                  Take three deep breaths. Are you sure you want to abandon your NEET focus session?
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEmergencyUnlock}
                    className="text-xs text-white"
                  >
                    Cancel & Keep Studying
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={startEmergencyUnlock}
                className="text-[11px] text-slate-500 hover:text-rose-400 font-semibold underline transition-colors"
              >
                Emergency Exit (Requires 30s confirmation)
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={cancelSession}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            End and Discard Session
          </button>
        )}
      </div>
    </div>
  );
};

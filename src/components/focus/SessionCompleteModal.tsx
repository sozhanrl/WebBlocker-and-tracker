import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { useApp } from '../../context/AppContext';
import { Trophy, ShieldCheck, Clock, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { formatMinutes } from '../../utils/formatters';

export const SessionCompleteModal: React.FC = () => {
  const { completedStats, closeCompletionModal } = useFocusTimer();
  const { userProfile } = useApp();

  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard' | 'Very Hard'>('Moderate');
  const [reflectionNote, setReflectionNote] = useState('');

  if (!completedStats) return null;

  const difficulties: Array<'Easy' | 'Moderate' | 'Hard' | 'Very Hard'> = ['Easy', 'Moderate', 'Hard', 'Very Hard'];

  return (
    <Modal
      isOpen={Boolean(completedStats)}
      onClose={closeCompletionModal}
      title="🎉 Study Session Complete!"
      subtitle="Outstanding discipline, future doctor!"
      maxWidth="md"
    >
      <div className="space-y-5 text-center">
        {/* Trophy emblem */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
          <div className="w-full h-full bg-[#0B132B] rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">
            +{formatMinutes(completedStats.durationMinutes)} Focused Time
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Logged for <span className="font-semibold text-sky-400">{completedStats.subject}</span> ({completedStats.chapterTitle || 'General Chapter'})
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Distractions Blocked</span>
              <span className="text-sm font-bold text-white">
                {completedStats.distractionsPrevented || 4} attempts
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Current Streak</span>
              <span className="text-sm font-bold text-amber-400">
                {userProfile.streakDays} Days Active
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty reflection */}
        <div className="text-left space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-bold text-slate-300 block">How difficult was this session?</label>
          <div className="grid grid-cols-4 gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  difficulty === diff
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Quick reflection note */}
        <div className="text-left space-y-1">
          <label className="text-xs font-bold text-slate-300 block">Quick Note / Mistakes Review</label>
          <input
            type="text"
            placeholder="e.g. Mastered relative velocity formulas, need to recheck question 14"
            value={reflectionNote}
            onChange={(e) => setReflectionNote(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <Button
          onClick={closeCompletionModal}
          size="lg"
          className="w-full mt-2"
          icon={<CheckCircle2 className="w-5 h-5" />}
        >
          Save & Return to Dashboard
        </Button>
      </div>
    </Modal>
  );
};

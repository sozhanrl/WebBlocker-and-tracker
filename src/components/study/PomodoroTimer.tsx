import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { useApp } from '../../context/AppContext';
import { NeetSubject } from '../../types';
import { Timer, BookOpen, Coffee, Play, Sparkles, CheckSquare, Edit3 } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const { startFocusSession, isRunning } = useFocusTimer();
  const { neetChapters } = useApp();

  const [selectedPreset, setSelectedPreset] = useState<'25-5' | '50-10' | '90-15' | 'custom'>('50-10');
  const [studyMinutes, setStudyMinutes] = useState<number>(50);
  const [breakMinutes, setBreakMinutes] = useState<number>(10);
  const [subject, setSubject] = useState<NeetSubject>('Physics');
  const [notes, setNotes] = useState('');

  const filteredChapters = neetChapters.filter(c => c.subject === subject);
  const [chapter, setChapter] = useState(filteredChapters[0]?.title || '');

  const subjects: NeetSubject[] = ['Physics', 'Chemistry', 'Botany', 'Zoology', 'Mathematics', 'Other'];

  const handleSelectPreset = (preset: '25-5' | '50-10' | '90-15' | 'custom') => {
    setSelectedPreset(preset);
    if (preset === '25-5') {
      setStudyMinutes(25);
      setBreakMinutes(5);
    } else if (preset === '50-10') {
      setStudyMinutes(50);
      setBreakMinutes(10);
    } else if (preset === '90-15') {
      setStudyMinutes(90);
      setBreakMinutes(15);
    }
  };

  const handleStart = () => {
    startFocusSession(
      studyMinutes,
      subject,
      chapter || 'General Chapter Study',
      notes,
      false
    );
  };

  return (
    <Card className="p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            NEET Pomodoro Study Engine
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured intervals for high memory retention & formula recall
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          Target: Deep Practice
        </span>
      </div>

      {/* Preset Modes */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 block">Study / Break Interval Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleSelectPreset('25-5')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedPreset === '25-5'
                ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/15'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            <span className="text-xs font-bold block text-white">25m / 5m</span>
            <span className="text-[10px] text-slate-400">Standard Pomodoro</span>
          </button>

          <button
            onClick={() => handleSelectPreset('50-10')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedPreset === '50-10'
                ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/15'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            <span className="text-xs font-bold block text-white">50m / 10m</span>
            <span className="text-[10px] text-slate-400">Deep Study (Recommended)</span>
          </button>

          <button
            onClick={() => handleSelectPreset('90-15')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedPreset === '90-15'
                ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-md shadow-indigo-500/15'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            <span className="text-xs font-bold block text-white">90m / 15m</span>
            <span className="text-[10px] text-slate-400">Exam Simulation Block</span>
          </button>

          <button
            onClick={() => handleSelectPreset('custom')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedPreset === 'custom'
                ? 'bg-purple-500/15 border-purple-500 text-white shadow-md shadow-purple-500/15'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            <span className="text-xs font-bold block text-white">Custom</span>
            <span className="text-[10px] text-slate-400">Manual duration</span>
          </button>
        </div>
      </div>

      {/* Custom Duration Fields */}
      {selectedPreset === 'custom' && (
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Study Duration (Minutes)</label>
            <input
              type="number"
              min="5"
              max="240"
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(parseInt(e.target.value, 10) || 25)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Break Duration (Minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value, 10) || 5)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
            />
          </div>
        </div>
      )}

      {/* Subject & Chapter Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">NEET Subject</label>
          <select
            value={subject}
            onChange={(e) => {
              const newSub = e.target.value as NeetSubject;
              setSubject(newSub);
              const nextChapters = neetChapters.filter(c => c.subject === newSub);
              setChapter(nextChapters[0]?.title || '');
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">Chapter / Topic</label>
          <select
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
          >
            {filteredChapters.map(c => (
              <option key={c.id} value={c.title}>{c.title}</option>
            ))}
            <option value="Self Study & Revision">Self Study & Revision</option>
          </select>
        </div>
      </div>

      {/* Notes Scratchpad */}
      <div>
        <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-sky-400" />
          Session Goals & Notes Scratchpad
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Read NCERT pages 140-158, write formula sheets for projectile motion, solve 15 PYQs"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
        />
      </div>

      {/* Launch Button */}
      <Button
        onClick={handleStart}
        size="lg"
        className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
        icon={<Play className="w-5 h-5 fill-current" />}
      >
        Start {studyMinutes}-Minute Study Timer
      </Button>
    </Card>
  );
};

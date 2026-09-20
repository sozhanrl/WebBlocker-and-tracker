import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { NeetSubjectName } from '../data/neetChapters';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Coffee,
  Brain,
  History,
  Award
} from 'lucide-react';

export const FocusTimer: React.FC = () => {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Subject and chapter linkage
  const [selectedSubject, setSelectedSubject] = useState<NeetSubjectName>('Physics');
  const [chapterTitle, setChapterTitle] = useState('Kinematics');
  const [sessionNotes, setSessionNotes] = useState('');
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const chapters = StorageService.getChapters();
  const availableChapters = chapters.filter((c) => c.subject === selectedSubject);

  // Audio synthesizer using Web Audio API (Zero external assets needed)
  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationsEnabled(perm === 'granted');
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      // Completed session
      setIsRunning(false);
      playChime();

      if (mode === 'focus') {
        StorageService.logFocusSession({
          subject: selectedSubject,
          chapterName: chapterTitle,
          durationMinutes,
          type: 'pomodoro',
          notes: sessionNotes || 'Deep NEET Study Session'
        });
        setCompletedSessionsCount((c) => c + 1);
        sendBrowserNotification('🎉 Focus Block Completed!', `Great job mastering ${selectedSubject} - ${chapterTitle}. Take a well-deserved break!`);
        alert(`Focus Session Finished! Recorded ${durationMinutes}m for ${chapterTitle}.`);
        setMode('shortBreak');
        setDurationMinutes(5);
        setSecondsLeft(5 * 60);
      } else {
        sendBrowserNotification('⚡ Break Over!', 'Ready for another high-yield NEET study block?');
        setMode('focus');
        setDurationMinutes(25);
        setSecondsLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, mode]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const handleModeChange = (newMode: 'focus' | 'shortBreak' | 'longBreak', defaultMins: number) => {
    setMode(newMode);
    setDurationMinutes(defaultMins);
    setSecondsLeft(defaultMins * 60);
    setIsRunning(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPercent = Math.round(((durationMinutes * 60 - secondsLeft) / (durationMinutes * 60)) * 100);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1733] via-[#1C2541] to-[#0B132B] border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              High-Cognition Pomodoro
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            NEET Focus Timer
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Lock in distraction-free intervals directly mapped to syllabus chapters.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={soundEnabled ? 'Sound notifications active' : 'Sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={requestNotificationPermission}
            className={`p-2 rounded-xl border transition-colors ${
              notificationsEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Browser Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1C2541]/90 border border-white/10 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center gap-2 max-w-sm mx-auto p-1 rounded-2xl bg-slate-900/90 border border-white/10">
          <button
            onClick={() => handleModeChange('focus', 25)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'focus' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => handleModeChange('shortBreak', 5)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'shortBreak' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleModeChange('longBreak', 15)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'longBreak' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Circular Countdown Progress Ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#0f172a"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={mode === 'focus' ? '#0ea5e9' : mode === 'shortBreak' ? '#10b981' : '#6366f1'}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              {mode === 'focus' ? 'Deep Study' : 'Rest Window'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
            >
              <Pause className="w-4 h-4 fill-slate-950" />
              Pause Timer
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-sky-500/30 transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              Start Focus Session
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-transform active:scale-95"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Subject & Chapter Linkage Selectors */}
        {mode === 'focus' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left pt-4 border-t border-white/5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Subject</label>
              <select
                value={selectedSubject}
                onChange={(e: any) => setSelectedSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Botany">Botany</option>
                <option value="Zoology">Zoology</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Chapter</label>
              <select
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white truncate"
              >
                {availableChapters.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Focus History & Stats */}
      <div className="p-4 rounded-2xl bg-[#1C2541]/75 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Today's Completed Study Blocks
          </h3>
          <span className="text-[11px] text-emerald-400 font-bold">
            {completedSessionsCount} blocks finished today
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Focus Ratio</span>
            <span className="text-base font-extrabold text-sky-400">25 : 5</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Session Count</span>
            <span className="text-base font-extrabold text-white">{completedSessionsCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Time Studied</span>
            <span className="text-base font-extrabold text-emerald-400">
              {completedSessionsCount * 25}m
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Rest Taken</span>
            <span className="text-base font-extrabold text-indigo-400">
              {completedSessionsCount * 5}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

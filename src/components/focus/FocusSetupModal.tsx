import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { NeetSubject } from '../../types';
import { Timer, Shield, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

interface FocusSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusSetupModal: React.FC<FocusSetupModalProps> = ({ isOpen, onClose }) => {
  const { blockedApps, blockedWebsites, neetChapters } = useApp();
  const { startFocusSession } = useFocusTimer();

  const [duration, setDuration] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [subject, setSubject] = useState<NeetSubject>('Physics');
  const [taskTitle, setTaskTitle] = useState('');
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [breakReminders, setBreakReminders] = useState(true);

  const durationOptions = [15, 25, 45, 60, 90];
  const subjectOptions: NeetSubject[] = ['Physics', 'Chemistry', 'Botany', 'Zoology', 'Mathematics', 'Other'];

  const filteredChapters = neetChapters.filter(c => c.subject === subject);
  const [selectedChapter, setSelectedChapter] = useState(filteredChapters[0]?.title || '');

  const handleStart = () => {
    const finalDuration = customDuration ? parseInt(customDuration, 10) || duration : duration;
    startFocusSession(
      finalDuration,
      subject,
      selectedChapter || 'General Study',
      taskTitle,
      isStrictMode
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Focus Session"
      subtitle="Lock distractions & enter deep study state"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Duration selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">Select Duration</label>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {durationOptions.map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setDuration(mins);
                  setCustomDuration('');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  duration === mins && !customDuration
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
          <input
            type="number"
            min="5"
            max="240"
            placeholder="Or enter custom minutes (e.g. 50)..."
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Subject & Chapter selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">NEET Subject</label>
            <select
              value={subject}
              onChange={(e) => {
                const newSubj = e.target.value as NeetSubject;
                setSubject(newSubj);
                const nextChapters = neetChapters.filter(c => c.subject === newSubj);
                setSelectedChapter(nextChapters[0]?.title || '');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              {subjectOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Chapter</label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              {filteredChapters.map((c) => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
              <option value="Custom Topic">Custom Topic</option>
            </select>
          </div>
        </div>

        {/* Goal / Task note */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">What is your target for this session?</label>
          <input
            type="text"
            placeholder="e.g. Solve 30 NCERT questions on rotational kinematics"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Blocking rules preview */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              Active Blocking Rules
            </span>
            <span className="text-[11px] text-slate-400">
              {blockedApps.filter(a => a.isBlocked).length} apps, {blockedWebsites.filter(w => w.isBlocked).length} websites locked
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {blockedApps.filter(a => a.isBlocked).slice(0, 5).map(app => (
              <span key={app.id} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {app.name}
              </span>
            ))}
            {blockedApps.filter(a => a.isBlocked).length > 5 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                +{blockedApps.filter(a => a.isBlocked).length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Strict Mode Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Strict Mode</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Requires a 30-second cooldown to unlock or cancel. Highly recommended during exam prep.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isStrictMode}
            onChange={(e) => setIsStrictMode(e.target.checked)}
            className="w-4 h-4 accent-rose-500 rounded"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            size="lg"
            className="px-6"
            icon={<Sparkles className="w-4 h-4" />}
          >
            Start Focus Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};

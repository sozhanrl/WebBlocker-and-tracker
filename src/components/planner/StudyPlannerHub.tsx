import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { EngineeringScheduleEditor } from './EngineeringScheduleEditor';
import { TaskChecklist } from '../tasks/TaskChecklist';
import { AddTaskModal } from '../tasks/AddTaskModal';
import { PomodoroTimer } from '../study/PomodoroTimer';
import {
  Clock,
  Calendar,
  Moon,
  Sun,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Plus,
  Play
} from 'lucide-react';
import { Button } from '../common/Button';

export const StudyPlannerHub: React.FC = () => {
  const {
    userProfile,
    sleepRecords,
    addSleepRecord,
    setActiveTab
  } = useApp();

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [plannerSubTab, setPlannerSubTab] = useState<'timeline' | 'routine' | 'timer'>('timeline');

  // Sleep Logger State
  const [bedTime, setBedTime] = useState('23:30');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepHours, setSleepHours] = useState(6.5);
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(4);

  const collegeStart = userProfile.engineeringCollegeStartTime || '14:00';
  const collegeEnd = userProfile.engineeringCollegeEndTime || '19:00';

  const dailySchedule = [
    {
      time: '06:00 AM – 08:30 AM',
      title: 'Morning High-Focus NEET Study',
      desc: 'Physics problem solving & formula derivations (peak cognitive focus).',
      tag: 'NEET Study',
      color: 'border-l-sky-400 bg-sky-500/10 text-sky-300'
    },
    {
      time: '09:00 AM – 01:00 PM',
      title: 'Morning Core Revision & Lab Work',
      desc: 'Chemistry reaction mechanisms & daily practice problems.',
      tag: 'Practice',
      color: 'border-l-amber-400 bg-amber-500/10 text-amber-300'
    },
    {
      time: `${collegeStart} – ${collegeEnd}`,
      title: 'Engineering College Classes',
      desc: 'Lectures and practicals. Distraction blocker automatically active.',
      tag: 'College Routine',
      color: 'border-l-indigo-400 bg-indigo-500/10 text-indigo-300'
    },
    {
      time: '08:00 PM – 10:30 PM',
      title: 'Evening Deep Biology Reading',
      desc: 'NCERT line-by-line textbook review & Botany/Zoology active recall.',
      tag: 'NEET Biology',
      color: 'border-l-emerald-400 bg-emerald-500/10 text-emerald-300'
    },
    {
      time: '10:30 PM – 11:30 PM',
      title: 'Daily MCQ Quota & Spaced Revision',
      desc: 'Solve 30-50 practice questions & check off today\'s spaced revisions.',
      tag: 'Daily Review',
      color: 'border-l-purple-400 bg-purple-500/10 text-purple-300'
    },
    {
      time: '11:30 PM – 06:00 AM',
      title: 'Sleep & Brain Recovery Window',
      desc: 'Optimal 6.5–7 hours sleep to consolidate learned concepts into memory.',
      tag: 'Recovery',
      color: 'border-l-slate-500 bg-slate-800/40 text-slate-400'
    }
  ];

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    addSleepRecord({
      date: new Date().toISOString().split('T')[0],
      bedTime,
      wakeTime,
      totalHours: Number(sleepHours),
      qualityRating: sleepQuality,
      notes: 'Logged daily sleep record.'
    });
    setShowSleepModal(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <Card className="p-5 bg-gradient-to-br from-[#0e1733] via-[#1C2541] to-[#0B132B] border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Daily Master Timetable
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              NEET 2027 + Engineering Routine Planner
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Balance daily engineering college coursework with 5–6 hours of dedicated NEET preparation through structured time-blocking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSleepModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Moon className="w-3.5 h-3.5" />
              Log Sleep
            </button>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-1 mt-4 pt-4 border-t border-white/10">
          {(['timeline', 'routine', 'timer'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setPlannerSubTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                plannerSubTab === tab
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {tab === 'timeline' ? 'Daily Time Blocks' : tab === 'routine' ? 'College Timetable' : 'Study Timer'}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Tab Content */}
      {plannerSubTab === 'timeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Timeline Column */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Structured Daily Time Blocks
              </h3>

              <div className="space-y-2.5">
                {dailySchedule.map((block, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border-l-4 border-y border-r border-white/5 ${block.color} transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">
                        {block.time}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300">
                        {block.tag}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {block.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {block.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Tasks & Sleep Column */}
            <div className="space-y-4">
              <TaskChecklist onOpenAddTaskModal={() => setShowAddTaskModal(true)} />

              {/* Sleep Insights Card */}
              <Card className="p-4 bg-slate-900/80 border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-purple-400" />
                    Sleep Recovery Log
                  </span>
                  <span className="text-[11px] text-purple-300 font-semibold">
                    Target: 7 hrs
                  </span>
                </div>

                {sleepRecords.length > 0 ? (
                  <div className="space-y-2">
                    {sleepRecords.slice(0, 2).map((rec) => (
                      <div key={rec.id} className="p-2.5 rounded-lg bg-slate-800/60 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">{rec.date}</span>
                          <span className="text-[11px] text-slate-400">{rec.bedTime} – {rec.wakeTime}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-purple-300">{rec.totalHours || rec.hoursSlept || 7} hrs</span>
                          <span className="text-[10px] text-amber-400 block">{'★'.repeat(rec.qualityRating || 4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No sleep records logged yet.</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {plannerSubTab === 'routine' && <EngineeringScheduleEditor />}

      {plannerSubTab === 'timer' && <PomodoroTimer />}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
      />

      {/* Sleep Logger Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-400" />
              Log Sleep Recovery
            </h3>

            <form onSubmit={handleSaveSleep} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Bedtime</label>
                  <input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Total Sleep Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="3"
                  max="12"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value) || 7)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Quality Rating</label>
                <div className="flex gap-1">
                  {([1, 2, 3, 4, 5] as const).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSleepQuality(star)}
                      className={`flex-1 py-1 text-sm rounded ${
                        sleepQuality >= star ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <Button variant="ghost" onClick={() => setShowSleepModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

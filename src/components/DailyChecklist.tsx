import React, { useState, useEffect } from 'react';
import {
  StorageService,
  DailyRoutineItem,
  DateTaskEntry,
  MissedReason,
  RoutineTaskStatus
} from '../services/storage';
import {
  CheckSquare,
  Square,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Timer,
  X,
  RotateCcw
} from 'lucide-react';

export const DailyChecklist: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [routineItems, setRoutineItems] = useState<DailyRoutineItem[]>([]);
  const [dayRecord, setDayRecord] = useState<Record<string, DateTaskEntry>>({});
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [countdownStr, setCountdownStr] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({ totalScheduled: 0, totalCompleted: 0, percent: 0 });

  // Missed Task Modal
  const [missedTargetItem, setMissedTargetItem] = useState<DailyRoutineItem | null>(null);
  const [missedReason, setMissedReason] = useState<MissedReason>('College');
  const [missedExplanation, setMissedExplanation] = useState('');
  const [recoveryPlan, setRecoveryPlan] = useState('');
  const [rescheduledTime, setRescheduledTime] = useState('');

  // Add Custom Task Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTime, setNewTime] = useState('15:00–16:00');
  const [newTaskName, setNewTaskName] = useState('');
  const [newCategory, setNewCategory] = useState<DailyRoutineItem['category']>('study');

  const missedReasonsList: MissedReason[] = [
    'College',
    'Health',
    'Family',
    'Lack of sleep',
    'Overslept',
    'Phone distraction',
    'Travel',
    'Tiredness',
    'Emergency',
    'Other'
  ];

  // Refresh routine & records
  const loadData = () => {
    const routine = StorageService.getRoutine();
    setRoutineItems(routine);
    const records = StorageService.getDailyRecord(selectedDate);
    setDayRecord(records);
    setWeeklyStats(StorageService.getWeeklyCompletionStats());
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Clock & Current Active Block detector
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${mins}`;
      setCurrentTimeStr(timeStr);

      // Determine active task if viewing today's date
      const isToday = selectedDate === now.toISOString().slice(0, 10);
      if (isToday && routineItems.length > 0) {
        const active = routineItems.find((item) => {
          if (!item.time.includes('–')) return false;
          const [start, end] = item.time.split('–').map((s) => s.trim());
          return timeStr >= start && timeStr < end;
        });

        if (active) {
          setCurrentBlockId(active.id);
          // Calculate countdown to end of block
          const [, end] = active.time.split('–').map((s) => s.trim());
          const [endH, endM] = end.split(':').map(Number);
          const endTotalMins = endH * 60 + endM;
          const currentTotalMins = now.getHours() * 60 + now.getMinutes();
          const diffMins = Math.max(0, endTotalMins - currentTotalMins);
          const diffSecs = 59 - now.getSeconds();
          setCountdownStr(`${diffMins}m ${diffSecs}s left`);
        } else {
          setCurrentBlockId(null);
          setCountdownStr('');
        }
      } else {
        setCurrentBlockId(null);
        setCountdownStr('');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedDate, routineItems]);

  const handleToggleCompleted = (item: DailyRoutineItem) => {
    const currentStatus = dayRecord[item.id]?.status;
    const nextStatus: RoutineTaskStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed';
    const updated = StorageService.setTaskStatusForDate(selectedDate, item.id, nextStatus);
    setDayRecord(updated);
    setWeeklyStats(StorageService.getWeeklyCompletionStats());
  };

  const handleOpenMissedModal = (item: DailyRoutineItem) => {
    setMissedTargetItem(item);
    setMissedReason('College');
    setMissedExplanation('');
    setRecoveryPlan('Will cover this backlog in evening Question Solving Block (20:00–21:45).');
    setRescheduledTime('20:00');
  };

  const handleSaveMissed = () => {
    if (!missedTargetItem) return;
    const updated = StorageService.setTaskStatusForDate(selectedDate, missedTargetItem.id, 'Missed', {
      reason: missedReason,
      explanation: missedExplanation || 'Missed during daily routine.',
      recoveryPlan,
      rescheduledTime,
      recordedAt: new Date().toISOString()
    });
    setDayRecord(updated);
    setMissedTargetItem(null);
    setWeeklyStats(StorageService.getWeeklyCompletionStats());
  };

  const handleSkipTask = (item: DailyRoutineItem) => {
    const updated = StorageService.setTaskStatusForDate(selectedDate, item.id, 'Skipped');
    setDayRecord(updated);
    setWeeklyStats(StorageService.getWeeklyCompletionStats());
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const newItem: DailyRoutineItem = {
      id: `task-${Date.now()}`,
      time: newTime.trim(),
      task: newTaskName.trim(),
      category: newCategory
    };
    const nextList = [...routineItems, newItem];
    StorageService.saveRoutine(nextList);
    setRoutineItems(nextList);
    setShowAddModal(false);
    setNewTaskName('');
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Delete this routine task?')) {
      const nextList = routineItems.filter((t) => t.id !== id);
      StorageService.saveRoutine(nextList);
      setRoutineItems(nextList);
    }
  };

  const handleResetDay = () => {
    if (confirm(`Reset all checklist entries for ${selectedDate}?`)) {
      routineItems.forEach((r) => {
        StorageService.setTaskStatusForDate(selectedDate, r.id, 'Not Started');
      });
      loadData();
    }
  };

  // Daily statistics
  const totalTasks = routineItems.length;
  const completedCount = routineItems.filter((r) => dayRecord[r.id]?.status === 'Completed').length;
  const missedCount = routineItems.filter((r) => dayRecord[r.id]?.status === 'Missed').length;
  const dailyPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const changeDateBy = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  const categoryColor: Record<DailyRoutineItem['category'], string> = {
    study: 'border-l-sky-400 bg-sky-500/10 text-sky-300',
    personal: 'border-l-teal-400 bg-teal-500/10 text-teal-300',
    break: 'border-l-amber-400 bg-amber-500/10 text-amber-300',
    college: 'border-l-indigo-400 bg-indigo-500/10 text-indigo-300',
    exercise: 'border-l-emerald-400 bg-emerald-500/10 text-emerald-300',
    sleep: 'border-l-slate-500 bg-slate-800/40 text-slate-400'
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1733] via-[#1C2541] to-[#0B132B] border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                14-Block Daily Timetable
              </span>
              {isToday && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  Live Today
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Daily Routine & Checklist
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Disciplined college timetable & 6-hour NEET study schedule with missed task tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button
              onClick={handleResetDay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5"
              title="Reset Day's Checks"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Navigator & Current Time Banner */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none"
              />
            </div>
            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                className="text-[11px] font-bold text-sky-400 hover:underline px-2"
              >
                Jump to Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400">Daily Completion: </span>
              <strong className="text-emerald-400 font-extrabold">{dailyPercent}%</strong>{' '}
              <span className="text-[11px] text-slate-500">({completedCount}/{totalTasks})</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div>
              <span className="text-slate-400">7-Day Consistency: </span>
              <strong className="text-sky-400 font-extrabold">{weeklyStats.percent}%</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-3">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Routine Task Items List */}
      <div className="space-y-2.5">
        {routineItems.map((item) => {
          const entry = dayRecord[item.id];
          const isDone = entry?.status === 'Completed';
          const isMissed = entry?.status === 'Missed';
          const isSkipped = entry?.status === 'Skipped';
          const isCurrentActive = isToday && currentBlockId === item.id;

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isCurrentActive
                  ? 'bg-sky-950/60 border-sky-400/80 shadow-lg shadow-sky-500/20 ring-2 ring-sky-400/30'
                  : isDone
                  ? 'bg-[#1C2541]/80 border-emerald-500/30'
                  : isMissed
                  ? 'bg-[#1C2541]/80 border-rose-500/40'
                  : 'bg-[#1C2541]/70 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Checkbox and Task Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleCompleted(item)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-sky-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-40" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${categoryColor[item.category] || categoryColor.study}`}>
                        {item.time}
                      </span>

                      {isCurrentActive && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500 text-white flex items-center gap-1 animate-pulse">
                          <Timer className="w-3 h-3" />
                          ACTIVE NOW ({countdownStr})
                        </span>
                      )}

                      {isDone && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          ✓ Completed
                        </span>
                      )}

                      {isMissed && (
                        <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                          ✗ Missed: {entry?.missedDetails?.reason}
                        </span>
                      )}

                      {isSkipped && (
                        <span className="text-[10px] font-bold text-slate-400">
                          Skipped
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-xs sm:text-sm font-bold tracking-tight mt-1 truncate ${
                        isDone ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {item.task}
                    </h3>

                    {/* Missed Details Explanation */}
                    {isMissed && entry?.missedDetails && (
                      <div className="mt-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200">
                        <p><strong>Reason:</strong> {entry.missedDetails.reason} — {entry.missedDetails.explanation}</p>
                        <p className="text-emerald-300 mt-0.5"><strong>Recovery:</strong> {entry.missedDetails.recoveryPlan}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {!isDone && (
                    <>
                      <button
                        onClick={() => handleOpenMissedModal(item)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          isMissed
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-rose-400 border-slate-700'
                        }`}
                        title="Mark Missed & Record Reason"
                      >
                        Missed
                      </button>
                      <button
                        onClick={() => handleSkipTask(item)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                        title="Skip Task"
                      >
                        Skip
                      </button>
                    </>
                  )}
                  {item.id.startsWith('task-') && (
                    <button
                      onClick={() => handleDeleteTask(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Custom Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Missed Task Modal */}
      {missedTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                  Missed Task Accountability
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {missedTargetItem.task}
                </h3>
              </div>
              <button
                onClick={() => setMissedTargetItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reason Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">What caused you to miss this task?</label>
              <select
                value={missedReason}
                onChange={(e: any) => setMissedReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
              >
                {missedReasonsList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Explanation */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Detailed Explanation (Optional)</label>
              <input
                type="text"
                placeholder="E.g. College lab viva ran late until 6:30 PM..."
                value={missedExplanation}
                onChange={(e) => setMissedExplanation(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Recovery Plan */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Recovery Plan</label>
              <textarea
                rows={2}
                placeholder="E.g. Solve the missed 30 Physics questions during tonight's block (20:00–21:45)."
                value={recoveryPlan}
                onChange={(e) => setRecoveryPlan(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Rescheduled Time */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Rescheduled Time</label>
              <input
                type="text"
                placeholder="20:00"
                value={rescheduledTime}
                onChange={(e) => setRescheduledTime(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setMissedTargetItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMissed}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Log Missed Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddNewTask} className="w-full max-w-md bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add Custom Timetable Task</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Task Title</label>
              <input
                type="text"
                required
                placeholder="E.g. High-Yield Organic Chemistry Reaction Drill"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Time Block (HH:MM–HH:MM)</label>
                <input
                  type="text"
                  required
                  placeholder="18:30–19:30"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                >
                  <option value="study">NEET Study</option>
                  <option value="college">College</option>
                  <option value="personal">Personal / Meals</option>
                  <option value="exercise">Fitness</option>
                  <option value="break">Break</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

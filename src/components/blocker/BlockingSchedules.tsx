import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { BlockingSchedule } from '../../types';
import { Calendar, Clock, Plus, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';

export const BlockingSchedules: React.FC = () => {
  const { schedules, toggleSchedule, addSchedule, deleteSchedule, blockedApps, blockedWebsites } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form state
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon - Fri
  const [isStrictMode, setIsStrictMode] = useState(false);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addSchedule({
      title: title.trim(),
      startTime,
      endTime,
      daysOfWeek: selectedDays,
      isEnabled: true,
      isStrictMode,
      blockedAppIds: blockedApps.filter(a => a.isBlocked).map(a => a.id),
      blockedWebsiteIds: blockedWebsites.filter(w => w.isBlocked).map(w => w.id)
    });

    setTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Recurring Study Schedules
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automate app & website blocking during scheduled NEET study hours
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Create Schedule
        </Button>
      </Card>

      {/* Schedules List */}
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <Card
            key={schedule.id}
            className={`p-5 transition-all ${
              schedule.isEnabled
                ? 'border-indigo-500/30 bg-[#1C2541]/95'
                : 'opacity-60 bg-slate-900/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{schedule.title}</h4>
                  {schedule.isStrictMode && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      STRICT
                    </span>
                  )}
                </div>

                {/* Time Range */}
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{schedule.startTime} — {schedule.endTime}</span>
                </div>

                {/* Days of Week Badges */}
                <div className="flex items-center gap-1">
                  {dayLabels.map((day, idx) => {
                    const isActive = schedule.daysOfWeek.includes(idx);
                    return (
                      <span
                        key={day}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          isActive
                            ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>

                {/* Scope stats */}
                <p className="text-[11px] text-slate-400 pt-1">
                  Enforces rules for {schedule.blockedAppIds.length} apps & {schedule.blockedWebsiteIds.length} websites
                </p>
              </div>

              {/* Actions & Toggle */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => deleteSchedule(schedule.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Delete schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.isEnabled}
                    onChange={() => toggleSchedule(schedule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Blocking Schedule"
        subtitle="Set recurring focus blocks for NEET study"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Schedule Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Physics Problem Solving Slot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Days selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Repeat on Days</label>
            <div className="flex gap-1.5">
              {dayLabels.map((day, idx) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDays.includes(idx)
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Strict mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
            <div>
              <span className="text-xs font-semibold text-white block">Enforce Strict Mode</span>
              <span className="text-[10px] text-slate-400">Cannot be disabled easily during active hours</span>
            </div>
            <input
              type="checkbox"
              checked={isStrictMode}
              onChange={(e) => setIsStrictMode(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

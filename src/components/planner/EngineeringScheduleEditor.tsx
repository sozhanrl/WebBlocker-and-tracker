import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Clock, Shield, Check, Save, GraduationCap } from 'lucide-react';

export const EngineeringScheduleEditor: React.FC = () => {
  const { userProfile, updateUserProfile, schedules, updateSchedule } = useApp();

  const [collegeStart, setCollegeStart] = useState(userProfile.engineeringCollegeStartTime || '14:00');
  const [collegeEnd, setCollegeEnd] = useState(userProfile.engineeringCollegeEndTime || '19:00');
  const [autoBlock, setAutoBlock] = useState(userProfile.autoBlockDuringCollege !== false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      engineeringCollegeStartTime: collegeStart,
      engineeringCollegeEndTime: collegeEnd,
      autoBlockDuringCollege: autoBlock
    });

    // Also update or sync the engineering schedule in blocking schedules if exists
    const engSch = schedules.find(s => s.id === 'sch-eng');
    if (engSch) {
      updateSchedule({
        ...engSch,
        startTime: collegeStart,
        endTime: collegeEnd,
        isEnabled: autoBlock
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <Card className="p-5 bg-[#1C2541]/90 border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Engineering College Timetable Block
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
          Mon – Fri Routine
        </span>
      </div>

      <p className="text-xs text-slate-300">
        Configure your daily engineering classes window. FocusForge automatically silences distracting apps and websites during college hours to prevent notification fatigue.
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Class Start Time
            </label>
            <input
              type="time"
              value={collegeStart}
              onChange={(e) => setCollegeStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Class End Time
            </label>
            <input
              type="time"
              value={collegeEnd}
              onChange={(e) => setCollegeEnd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-white block">Auto-Block Distractions</span>
              <span className="text-[10px] text-slate-400">Lock social apps & websites during 2:00 PM – 7:00 PM</span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoBlock}
              onChange={(e) => setAutoBlock(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
              <Check className="w-4 h-4" /> Timetable updated!
            </span>
          )}
          <Button variant="primary" type="submit" className="text-xs flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save Schedule
          </Button>
        </div>
      </form>
    </Card>
  );
};

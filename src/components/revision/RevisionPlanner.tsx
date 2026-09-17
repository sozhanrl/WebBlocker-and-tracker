import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { RevisionScheduleItem, NeetSubject } from '../../types';
import {
  RotateCw,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '../common/Button';

export const RevisionPlanner: React.FC = () => {
  const {
    revisionItems,
    completeRevisionStep,
    deleteRevisionSchedule,
    addRevisionSchedule,
    neetChapters
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const dueTodayItems = revisionItems.filter(r => !r.completed && r.scheduledDate <= todayStr);
  const upcomingItems = revisionItems.filter(r => !r.completed && r.scheduledDate > todayStr);
  const completedItems = revisionItems.filter(r => r.completed);

  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault();
    const chapter = neetChapters.find(c => c.id === selectedChapterId);
    if (!chapter) return;

    addRevisionSchedule(chapter.id, chapter.title, chapter.subject);
    setShowAddModal(false);
    setSelectedChapterId('');
  };

  const subjectBadgeColors: Record<NeetSubject, string> = {
    Physics: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Chemistry: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Botany: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Zoology: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Biology: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    Mathematics: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    Other: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  };


  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <Card className="p-5 bg-gradient-to-br from-[#0e1733] via-[#1C2541] to-[#0B132B] border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RotateCw className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1d • 3d • 7d • 15d • 30d Intervals
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Spaced Revision Engine
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Prevent the Ebbinghaus forgetting curve. Automatic spaced repetition intervals ensure long-term retention of critical biology facts and physics derivations.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Schedule Chapter Revision
          </Button>
        </div>

        {/* Counter Highlights */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">Due Today</span>
            <span className="text-xl font-extrabold text-rose-400">{dueTodayItems.length}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">Upcoming Pipeline</span>
            <span className="text-xl font-extrabold text-sky-400">{upcomingItems.length}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">Completed Revisions</span>
            <span className="text-xl font-extrabold text-emerald-400">{completedItems.length}</span>
          </div>
        </div>
      </Card>

      {/* Due Today Revisions Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-400" />
          Due for Review Today ({dueTodayItems.length})
        </h3>

        {dueTodayItems.length === 0 ? (
          <div className="p-5 text-center bg-slate-900/40 rounded-2xl border border-white/5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs text-slate-300 font-semibold">You are completely caught up on revisions for today!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Upcoming revisions will appear automatically based on spaced schedule.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueTodayItems.map((item) => (
              <Card
                key={item.id}
                className="p-4 bg-slate-900/90 border-rose-500/30 shadow-md shadow-rose-500/5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subjectBadgeColors[item.subject]}`}>
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Rev #{item.revisionNumber}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {item.chapterTitle}
                  </h4>
                  <span className="text-[11px] text-rose-300 block">
                    Scheduled: {item.scheduledDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => completeRevisionStep(item.id, 7)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete
                  </button>
                  <button
                    onClick={() => deleteRevisionSchedule(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Revision Pipeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          Upcoming Scheduled Intervals ({upcomingItems.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {upcomingItems.slice(0, 9).map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${subjectBadgeColors[item.subject]}`}>
                    {item.subject}
                  </span>
                  <span className="text-[10px] text-slate-400">Rev #{item.revisionNumber}</span>
                </div>
                <h5 className="font-bold text-slate-200 mt-0.5 line-clamp-1">{item.chapterTitle}</h5>
                <span className="text-[10px] text-sky-400 font-medium">{item.scheduledDate}</span>
              </div>
              <button
                onClick={() => completeRevisionStep(item.id, 7)}
                className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                title="Mark completed early"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Revision Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-amber-400" />
              Schedule Chapter Spaced Revision
            </h3>
            <form onSubmit={handleCreateRevision} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Select Chapter from 81 NCERT Syllabus</label>
                <select
                  required
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choose Chapter --</option>
                  {neetChapters.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.subject}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-200 block">Generated Intervals:</span>
                <p>• Day 1 (Tomorrow) • Day 3 • Day 7 • Day 15 • Day 30</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={!selectedChapterId}>
                  Create Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

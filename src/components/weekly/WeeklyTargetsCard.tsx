import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { NeetSubject, WeeklyNeetTarget } from '../../types';
import {
  Target,
  CheckCircle2,
  Circle,
  RotateCcw,
  Archive,
  Plus,
  Calendar,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '../common/Button';

export const WeeklyTargetsCard: React.FC = () => {
  const {
    weeklyTargets,
    updateWeeklyTarget,
    carryForwardWeeklyTargets,
    archiveWeeklyReview,
    neetChapters
  } = useApp();

  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const subjects: NeetSubject[] = ['Physics', 'Chemistry', 'Botany', 'Zoology'];

  const completedCount = weeklyTargets.filter(t => t.isCompleted).length;
  const totalCount = weeklyTargets.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalTargetQuestions = weeklyTargets.reduce((acc, t) => acc + (t.targetQuestionsCount || 0), 0);
  const totalCompletedQuestions = weeklyTargets.reduce((acc, t) => acc + (t.completedQuestionsCount || 0), 0);

  const handleToggleComplete = (id: string, current?: boolean) => {
    updateWeeklyTarget(id, { isCompleted: !current });
  };

  const handleUpdateQuestions = (id: string, delta: number) => {
    const target = weeklyTargets.find(t => t.id === id);
    if (!target) return;
    const goal = target.targetQuestionsCount || 50;
    const nextVal = Math.max(0, (target.completedQuestionsCount || 0) + delta);
    updateWeeklyTarget(id, {
      completedQuestionsCount: nextVal,
      isCompleted: nextVal >= goal
    });
  };

  const handleArchive = () => {
    archiveWeeklyReview(reviewNotes);
    setShowReviewModal(false);
    setReviewNotes('');
    alert('Weekly progress archived! Fresh goals initialized for the new week.');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Card className="p-5 bg-gradient-to-br from-[#0e1733] via-[#1C2541] to-[#0B132B] border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Weekly Target Sprints
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              4-Subject NEET Weekly Blueprint
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Set realistic chapter targets across all 4 subjects, track daily MCQ quotas, and carry forward unfinished goals on Sunday.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={carryForwardWeeklyTargets}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Carry Forward
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              Sunday Review & Archive
            </button>
          </div>
        </div>

        {/* Weekly Completion Progress */}
        <div className="mt-4 p-3.5 bg-slate-900/80 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 block font-medium">Sprint Completion</span>
              <span className="text-xl font-extrabold text-sky-400">{progressPercent}%</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 block font-medium">MCQ Quota</span>
              <span className="text-base font-bold text-white">
                {totalCompletedQuestions} / {totalTargetQuestions} Solved
              </span>
            </div>
          </div>

          <div className="w-full sm:w-1/2 space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{completedCount} of {totalCount} Subject Goals Achieved</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Target Cards by Subject */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {weeklyTargets.map((target) => {
          const isComplete = !!target.isCompleted;
          const questionsDone = target.completedQuestionsCount || 0;
          const questionsGoal = target.targetQuestionsCount || 50;
          const qPercent = Math.min(100, Math.round((questionsDone / questionsGoal) * 100));

          const subjectColors: Record<NeetSubject, { badge: string; border: string }> = {
            Physics: { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', border: 'border-blue-500/30' },
            Chemistry: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', border: 'border-amber-500/30' },
            Botany: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/30' },
            Zoology: { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', border: 'border-purple-500/30' },
            Biology: { badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30', border: 'border-teal-500/30' },
            Mathematics: { badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', border: 'border-indigo-500/30' },
            Other: { badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30', border: 'border-slate-500/30' }
          };

          const col = subjectColors[target.subject] || subjectColors.Physics;

          return (
            <Card
              key={target.id}
              className={`p-4 transition-all ${
                isComplete
                  ? 'border-emerald-500/40 bg-[#1C2541]/90 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-900/80 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.badge}`}>
                    {target.subject}
                  </span>
                  {target.targetStudyHours && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {target.targetStudyHours} hrs
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleToggleComplete(target.id, target.isCompleted)}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isComplete
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {isComplete ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Achieved
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      Mark Done
                    </>
                  )}
                </button>
              </div>


              {/* Target Chapter Title */}
              <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">
                {target.chapterTitle}
              </h4>

              {/* Target Questions Counter */}
              <div className="bg-slate-900 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-sky-400" />
                    MCQ Target:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuestions(target.id, -10)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      -10
                    </button>
                    <span className="font-bold text-white text-xs">
                      {questionsDone} / {questionsGoal}
                    </span>
                    <button
                      onClick={() => handleUpdateQuestions(target.id, 10)}
                      className="px-1.5 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold"
                    >
                      +10
                    </button>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all duration-300"
                    style={{ width: `${qPercent}%` }}
                  />
                </div>
              </div>

              {/* Revision / Carry forward badge */}
              {target.revisionGoal && (
                <p className="text-[11px] text-amber-300/80 mt-2 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                  ⚡ Focus: {target.revisionGoal}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Sunday Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Sunday Weekly Review & Archive</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Reviewing your weekly sprint helps solidify concepts and address persistent weak areas. Uncompleted goals will be smoothly rolled over.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Weekly Reflection / Mistake Log:
              </label>
              <textarea
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="What went well this week? Which Physics/Chemistry formulas caused negative marks? What is the priority for next week?"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button variant="ghost" onClick={() => setShowReviewModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleArchive} className="bg-emerald-600 hover:bg-emerald-500">
                Complete Review & Archive
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

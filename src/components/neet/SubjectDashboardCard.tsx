import React from 'react';
import { Card } from '../common/Card';
import { NeetSubject, NeetChapter } from '../../types';
import { BookOpen, CheckCircle2, RotateCw, AlertTriangle, ChevronRight } from 'lucide-react';

interface SubjectDashboardCardProps {
  subject: NeetSubject;
  chapters: NeetChapter[];
  onSelect: (subject: NeetSubject) => void;
  isSelected?: boolean;
}

export const SubjectDashboardCard: React.FC<SubjectDashboardCardProps> = ({
  subject,
  chapters,
  onSelect,
  isSelected
}) => {
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(c => c.status === 'Completed').length;
  const revisionChapters = chapters.filter(c => c.status === 'Revision').length;
  const inProgressChapters = chapters.filter(c => c.status === 'In Progress').length;
  const notStartedChapters = chapters.filter(c => c.status === 'Not Started').length;

  const totalQuestionsSolved = chapters.reduce((acc, c) => acc + (c.questionsSolved || 0), 0);
  const totalCorrect = chapters.reduce((acc, c) => acc + (c.correctCount || 0), 0);
  const totalWrong = chapters.reduce((acc, c) => acc + (c.wrongCount || 0), 0);
  const overallAccuracy = (totalCorrect + totalWrong > 0)
    ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
    : 0;

  const subjectProgress = totalChapters > 0
    ? Math.round(((completedChapters + revisionChapters * 0.75 + inProgressChapters * 0.3) / totalChapters) * 100)
    : 0;

  const weakChaptersCount = chapters.filter(c => (c.accuracyPercentage !== undefined && c.accuracyPercentage < 60 && (c.questionsSolved || 0) > 0)).length;

  const subjectColors: Record<NeetSubject, { gradient: string; accent: string; badge: string }> = {
    Physics: {
      gradient: 'from-blue-600/20 via-sky-600/10 to-transparent',
      accent: 'text-sky-400',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    Chemistry: {
      gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
      accent: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    Botany: {
      gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
      accent: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    Zoology: {
      gradient: 'from-purple-600/20 via-indigo-600/10 to-transparent',
      accent: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    Biology: {
      gradient: 'from-emerald-600/20 via-purple-600/10 to-transparent',
      accent: 'text-teal-400',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    Mathematics: {
      gradient: 'from-indigo-600/20 via-blue-600/10 to-transparent',
      accent: 'text-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    Other: {
      gradient: 'from-slate-600/20 via-slate-700/10 to-transparent',
      accent: 'text-slate-400',
      badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  };


  const style = subjectColors[subject] || subjectColors.Physics;

  return (
    <div
      onClick={() => onSelect(subject)}
      className={`cursor-pointer rounded-2xl p-4 transition-all border ${
        isSelected
          ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/10'
          : 'bg-[#1C2541]/70 border-white/10 hover:border-white/25 hover:bg-[#1C2541]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
            {subject}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {totalChapters} Units/Chapters
          </span>
        </div>
        <span className={`text-sm font-extrabold ${style.accent}`}>
          {subjectProgress}% Done
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5 my-2.5">
        <div
          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
            subject === 'Physics' ? 'from-blue-500 to-sky-400' :
            subject === 'Chemistry' ? 'from-amber-500 to-orange-400' :
            subject === 'Botany' ? 'from-emerald-500 to-teal-400' :
            'from-purple-500 to-indigo-400'
          }`}
          style={{ width: `${subjectProgress}%` }}
        />
      </div>

      {/* Chapter Breakdown Chips */}
      <div className="grid grid-cols-4 gap-1 text-center text-[10px] py-1 border-t border-white/5">
        <div>
          <span className="text-slate-400 block">Done</span>
          <span className="font-bold text-emerald-400">{completedChapters}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Rev</span>
          <span className="font-bold text-amber-400">{revisionChapters}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Active</span>
          <span className="font-bold text-sky-400">{inProgressChapters}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Todo</span>
          <span className="font-bold text-slate-400">{notStartedChapters}</span>
        </div>
      </div>

      {/* Question Metrics */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px]">
        <div className="text-slate-300">
          <span className="text-slate-400">MCQs Solved: </span>
          <span className="font-bold text-white">{totalQuestionsSolved}</span>
          {overallAccuracy > 0 && (
            <span className="ml-1 text-emerald-400 font-semibold">({overallAccuracy}% Acc)</span>
          )}
        </div>
        {weakChaptersCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            {weakChaptersCount} Weak
          </span>
        )}
      </div>
    </div>
  );
};

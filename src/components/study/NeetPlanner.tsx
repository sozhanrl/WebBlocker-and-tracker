import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { NeetSubject, ChapterStatus } from '../../types';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCw,
  Calendar,
  Sparkles,
  BarChart,
  Award
} from 'lucide-react';
import { Button } from '../common/Button';

export const NeetPlanner: React.FC = () => {
  const { neetChapters, updateChapterStatus, updateChapterTargetDate } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<NeetSubject>('Physics');

  const subjects: NeetSubject[] = ['Physics', 'Chemistry', 'Botany', 'Zoology'];

  const filteredChapters = neetChapters.filter(c => c.subject === selectedSubject);

  const statusOptions: ChapterStatus[] = ['Not Started', 'In Progress', 'Revision', 'Completed', 'Weak Area'];

  const statusColorMap: Record<ChapterStatus, string> = {
    'Not Started': 'bg-slate-800 text-slate-400 border-slate-700',
    'In Progress': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    'Revision': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Completed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Weak Area': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'On Hold': 'bg-slate-800 text-slate-400 border-slate-700'
  };


  // Subject readiness calculation
  const completedInSubject = filteredChapters.filter(c => c.status === 'Completed').length;
  const revisionInSubject = filteredChapters.filter(c => c.status === 'Revision').length;
  const inProgressInSubject = filteredChapters.filter(c => c.status === 'In Progress').length;
  const totalSubjectChapters = filteredChapters.length;
  const subjectProgress = totalSubjectChapters > 0
    ? Math.round(((completedInSubject + revisionInSubject * 0.75 + inProgressInSubject * 0.3) / totalSubjectChapters) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Subject Tab Switcher & Progress */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              NEET 2027 Syllabus & Chapter Tracker
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Track mastery across NCERT Class 11 & 12 high-weightage chapters
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">{selectedSubject} Readiness</span>
            <span className="text-lg font-extrabold text-emerald-400">
              {subjectProgress}%
            </span>
          </div>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {subjects.map(s => {
            const isSelected = selectedSubject === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Subject Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Progress in {selectedSubject}</span>
            <span>{completedInSubject} Completed • {revisionInSubject} Revision • {inProgressInSubject} In Progress</span>
          </div>
          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${subjectProgress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Chapters List */}
      <div className="space-y-3">
        {filteredChapters.map((chapter) => (
          <Card
            key={chapter.id}
            className={`p-4 sm:p-5 transition-all ${
              chapter.status === 'Completed'
                ? 'border-emerald-500/30 bg-[#1C2541]/90'
                : chapter.status === 'Revision'
                ? 'border-amber-500/30 bg-[#1C2541]/90'
                : 'hover:border-white/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Chapter Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {chapter.classLevel}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    NEET Weight: ~{chapter.weightagePercentage}%
                  </span>
                  {chapter.mockTestScore && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Score: {chapter.mockTestScore}%
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">
                  {chapter.title}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  {chapter.lastRevisionDate && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-sky-400" />
                      Last revised: {chapter.lastRevisionDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-300">
                    <RotateCw className="w-3 h-3 text-amber-400" />
                    {chapter.revisionCount} revisions
                  </span>
                  {chapter.targetCompletionDate && (
                    <span className="flex items-center gap-1 text-sky-400">
                      <Calendar className="w-3 h-3" />
                      Target: {chapter.targetCompletionDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Selector Switcher */}
              <div className="flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <span className="text-xs text-slate-400 sm:hidden">Status:</span>
                <div className="flex items-center gap-1">
                  {statusOptions.map((st) => (
                    <button
                      key={st}
                      onClick={() => updateChapterStatus(chapter.id, st)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        chapter.status === st
                          ? statusColorMap[st] + ' font-extrabold shadow-sm'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

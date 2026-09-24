import React, { useState } from 'react';
import { Card } from '../common/Card';
import { NeetChapter, ChapterStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { useFocusTimer } from '../../context/FocusTimerContext';
import {
  CheckCircle2,
  Clock,
  RotateCw,
  Calendar,
  Sparkles,
  HelpCircle,
  FileText,
  Play,
  Check,
  X,
  Plus,
  Minus,
  Edit2,
  Trash2,
  BookmarkPlus
} from 'lucide-react';

interface ChapterCardProps {
  chapter: NeetChapter;
  onOpenQuestionsModal?: (chapter: NeetChapter) => void;
  onOpenNotesModal?: (chapter: NeetChapter) => void;
  onEditCustomChapter?: (chapter: NeetChapter) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  onOpenQuestionsModal,
  onOpenNotesModal,
  onEditCustomChapter
}) => {
  const {
    updateChapterStatus,
    updateChapterQuestions,
    deleteCustomChapter,
    addRevisionSchedule,
    setActiveTab,
    openTakeNoteModal
  } = useApp();
  const { startFocusSession } = useFocusTimer();

  const [isEditingQuestions, setIsEditingQuestions] = useState(false);
  const [solvedInput, setSolvedInput] = useState(chapter.questionsSolved || 0);
  const [correctInput, setCorrectInput] = useState(chapter.correctCount || 0);
  const [wrongInput, setWrongInput] = useState(chapter.wrongCount || 0);
  const [showNotes, setShowNotes] = useState(false);

  const statusOptions: ChapterStatus[] = ['Not Started', 'In Progress', 'Revision', 'Completed', 'Weak Area'];

  const statusColorMap: Record<ChapterStatus, string> = {
    'Not Started': 'bg-slate-800 text-slate-400 border-slate-700',
    'In Progress': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    'Revision': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Completed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Weak Area': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'On Hold': 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const handleSaveQuestions = () => {
    const unattempted = Math.max(0, solvedInput - (correctInput + wrongInput));
    updateChapterQuestions(chapter.id, solvedInput, correctInput, wrongInput, unattempted);
    setIsEditingQuestions(false);
  };

  const handleStartFocus = () => {
    startFocusSession(25, chapter.subject, chapter.title, `NEET Study: ${chapter.title}`, false);
    setActiveTab('focus');
  };


  const handleScheduleRevision = () => {
    addRevisionSchedule(chapter.id, chapter.title, chapter.subject);
    alert(`Spaced revision schedule created for "${chapter.title}" (1, 3, 7, 15, 30 days)!`);
  };

  return (
    <Card
      className={`p-4 sm:p-5 transition-all ${
        chapter.status === 'Completed'
          ? 'border-emerald-500/30 bg-[#1C2541]/90 shadow-sm'
          : chapter.status === 'Revision'
          ? 'border-amber-500/30 bg-[#1C2541]/90'
          : 'hover:border-white/20'
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {chapter.unitNumber && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Unit {chapter.unitNumber}
              </span>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {chapter.classLevel}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Weight: ~{chapter.weightagePercentage}%
            </span>
            {chapter.isCustom && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Custom Topic
              </span>
            )}
            {chapter.accuracyPercentage !== undefined && (chapter.questionsSolved || 0) > 0 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  chapter.accuracyPercentage >= 75
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : chapter.accuracyPercentage >= 50
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {chapter.accuracyPercentage}% Accuracy
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleStartFocus}
              title="Start Focus Session on this chapter"
              className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 transition-colors flex items-center gap-1 text-[11px] font-bold px-2"
            >
              <Play className="w-3 h-3 fill-sky-300" />
              Focus
            </button>
            <button
              onClick={handleScheduleRevision}
              title="Add to Spaced Revision (1d, 3d, 7d, 15d, 30d)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
            </button>
            {chapter.isCustom && (
              <>
                {onEditCustomChapter && (
                  <button
                    onClick={() => onEditCustomChapter(chapter)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteCustomChapter(chapter.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Chapter Title & Summary */}
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {chapter.title}
          </h4>
          {chapter.notes && (
            <p className="text-xs text-slate-300 mt-1 bg-slate-900/50 p-2 rounded-lg border border-white/5 line-clamp-2">
              <span className="font-semibold text-slate-400">Notes: </span>
              {chapter.notes}
            </p>
          )}
        </div>

        {/* Question Practice Tracker Bar */}
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              Practice MCQs:
            </span>
            {!isEditingQuestions ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  Solved: <strong className="text-white">{chapter.questionsSolved || 0}</strong>
                </span>
                <span className="text-emerald-400">
                  ✓ {chapter.correctCount || 0}
                </span>
                <span className="text-rose-400">
                  ✗ {chapter.wrongCount || 0}
                </span>
                <button
                  onClick={() => {
                    setSolvedInput(chapter.questionsSolved || 0);
                    setCorrectInput(chapter.correctCount || 0);
                    setWrongInput(chapter.wrongCount || 0);
                    setIsEditingQuestions(true);
                  }}
                  className="text-[11px] text-sky-400 hover:underline font-bold"
                >
                  Log Questions
                </button>
                <button
                  onClick={() => {
                    openTakeNoteModal({
                      title: `${chapter.subject}: ${chapter.title}`,
                      subject: chapter.subject,
                      content: `### 📚 ${chapter.title} (${chapter.subject})\n\n#### Key Formulas & High-Yield NCERT Facts:\n- \n\n#### Frequent Mistakes & PYQ Traps:\n- \n\n#### Checklist:\n- [ ] NCERT Theory Read\n- [ ] Examples & In-Text Problems\n- [ ] 50 PYQ MCQs Solved`,
                      isStored: true
                    });
                  }}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 hover:underline ml-1"
                  title="Take or view Notion notes for this chapter"
                >
                  <FileText className="w-3 h-3" /> Note
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveQuestions}
                  className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
                <button
                  onClick={() => setIsEditingQuestions(false)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {isEditingQuestions && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Total Solved</label>
                <input
                  type="number"
                  min="0"
                  value={solvedInput}
                  onChange={(e) => setSolvedInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-emerald-400 block mb-0.5">Correct (+4)</label>
                <input
                  type="number"
                  min="0"
                  value={correctInput}
                  onChange={(e) => setCorrectInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-300"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-400 block mb-0.5">Wrong (-1)</label>
                <input
                  type="number"
                  min="0"
                  value={wrongInput}
                  onChange={(e) => setWrongInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-rose-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer: Revision details & Status Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            {chapter.lastRevisionDate && (
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-sky-400" />
                Rev: {chapter.lastRevisionDate}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-300">
              <RotateCw className="w-3 h-3 text-amber-400" />
              {chapter.revisionCount} revisions
            </span>
            {chapter.targetCompletionDate && (
              <span className="flex items-center gap-1 text-sky-400 font-medium">
                <Calendar className="w-3 h-3" />
                Target: {chapter.targetCompletionDate}
              </span>
            )}
          </div>

          {/* Status Selector Buttons */}
          <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
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
      </div>
    </Card>
  );
};

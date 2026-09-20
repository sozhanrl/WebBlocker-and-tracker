import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { NeetChapterRecord, NeetSubjectName, NeetChapterStatus } from '../data/neetChapters';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCw,
  Plus,
  HelpCircle,
  Edit2,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Target
} from 'lucide-react';

export const ChapterPlanner: React.FC = () => {
  const [chapters, setChapters] = useState<NeetChapterRecord[]>([]);
  const [activeSubject, setActiveSubject] = useState<'All' | NeetSubjectName>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | NeetChapterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'progress_desc' | 'progress_asc' | 'questions_desc' | 'name'>('default');
  
  // Editing state for modal
  const [editingChapter, setEditingChapter] = useState<NeetChapterRecord | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [progressInput, setProgressInput] = useState(0);
  const [questionsInput, setQuestionsInput] = useState(0);
  const [correctInput, setCorrectInput] = useState(0);
  const [incorrectInput, setIncorrectInput] = useState(0);
  const [statusInput, setStatusInput] = useState<NeetChapterStatus>('Not Started');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    setChapters(StorageService.getChapters());
  }, []);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 2500);
  };

  // Filter & Sort
  const filteredChapters = chapters.filter((c) => {
    const matchSubject = activeSubject === 'All' || c.subject === activeSubject;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchStatus && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'progress_desc') return b.completion_percentage - a.completion_percentage;
    if (sortBy === 'progress_asc') return a.completion_percentage - b.completion_percentage;
    if (sortBy === 'questions_desc') return b.questions_solved - a.questions_solved;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleOpenEdit = (c: NeetChapterRecord) => {
    setEditingChapter(c);
    setNotesInput(c.notes || '');
    setProgressInput(c.completion_percentage || 0);
    setQuestionsInput(c.questions_solved || 0);
    setCorrectInput(c.correct_answers || 0);
    setIncorrectInput(c.incorrect_answers || 0);
    setStatusInput(c.status);
  };

  const handleSaveEdit = () => {
    if (!editingChapter) return;
    const updated = StorageService.updateChapter(editingChapter.id, {
      notes: notesInput,
      completion_percentage: progressInput,
      questions_solved: questionsInput,
      correct_answers: correctInput,
      incorrect_answers: incorrectInput,
      status: progressInput === 100 ? 'Completed' : statusInput,
      last_studied_date: new Date().toISOString().slice(0, 10)
    });
    setChapters(updated);
    setEditingChapter(null);
    showNotification(`Updated "${editingChapter.name}"`);
  };

  const handleQuickStatusChange = (id: string, newStatus: NeetChapterStatus) => {
    const newPercent = newStatus === 'Completed' ? 100 : newStatus === 'Not Started' ? 0 : 50;
    const updated = StorageService.updateChapter(id, {
      status: newStatus,
      completion_percentage: newPercent,
      completed_date: newStatus === 'Completed' ? new Date().toISOString().slice(0, 10) : null,
      last_studied_date: new Date().toISOString().slice(0, 10)
    });
    setChapters(updated);
  };

  const handleIncrementRevision = (id: string, currentCount: number) => {
    const updated = StorageService.updateChapter(id, {
      revision_count: currentCount + 1,
      last_studied_date: new Date().toISOString().slice(0, 10),
      status: 'In Progress'
    });
    setChapters(updated);
    showNotification('Revision counter updated!');
  };

  const handleReset = (id: string, name: string) => {
    if (confirm(`Reset progress for "${name}" to Not Started?`)) {
      const updated = StorageService.resetChapterStatus(id);
      setChapters(updated);
      showNotification(`Reset "${name}"`);
    }
  };

  // Stats calculation
  const totalCount = chapters.length;
  const completedCount = chapters.filter((c) => c.status === 'Completed').length;
  const inProgressCount = chapters.filter((c) => c.status === 'In Progress').length;
  const totalQuestions = chapters.reduce((acc, c) => acc + (c.questions_solved || 0), 0);
  const overallPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const subjectBadges: Record<NeetSubjectName, string> = {
    Physics: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Chemistry: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Botany: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Zoology: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4" />
          {notificationMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1733] via-[#1C2541] to-[#0B132B] border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                NEET 2027 Official Syllabus
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              NEET Chapter Planner
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Track mastery across Physics (20), Chemistry (20), Botany (21) and Zoology (20) chapters.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-white/5">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">Mastery</span>
              <span className="text-lg font-black text-emerald-400">{overallPercent}%</span>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">Completed</span>
              <span className="text-sm font-bold text-white">{completedCount} / {totalCount}</span>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">MCQs Solved</span>
              <span className="text-sm font-bold text-sky-400">{totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#1C2541]/80 border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapters, formulas, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-900/80 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="default">Default Syllabus Order</option>
              <option value="progress_desc">Highest Completion</option>
              <option value="progress_asc">Lowest Completion</option>
              <option value="questions_desc">Most MCQs Solved</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['All', 'Physics', 'Chemistry', 'Botany', 'Zoology'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSubject === sub
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-white/5">
          <span className="text-[11px] text-slate-400 mr-1 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {(['All', 'Not Started', 'In Progress', 'Completed', 'Needs Revision'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredChapters.map((chapter) => {
          const isCompleted = chapter.status === 'Completed';
          const isProgress = chapter.status === 'In Progress';
          const isRevision = chapter.status === 'Needs Revision';

          return (
            <div
              key={chapter.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCompleted
                  ? 'bg-[#1C2541]/90 border-emerald-500/40 shadow-sm'
                  : isRevision
                  ? 'bg-[#1C2541]/90 border-amber-500/40'
                  : 'bg-[#1C2541]/70 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subjectBadges[chapter.subject]}`}>
                    {chapter.subject}
                  </span>
                  {chapter.class_level && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {chapter.class_level}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : isProgress
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : isRevision
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {chapter.status}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenEdit(chapter)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Edit notes, questions & details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-white tracking-tight mb-2">
                {chapter.name}
              </h3>

              {/* Progress Bar & Percentage */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>Completion</span>
                  <span className="font-bold text-white">{chapter.completion_percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-400' : isRevision ? 'bg-amber-400' : 'bg-sky-400'
                    }`}
                    style={{ width: `${chapter.completion_percentage}%` }}
                  />
                </div>
              </div>

              {/* Metrics Row: Questions, Revisions, Last Studied */}
              <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-white/5 text-center text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">MCQs</span>
                  <span className="font-bold text-white">
                    {chapter.questions_solved || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Correct / Wrong</span>
                  <span className="font-bold text-emerald-400 text-[11px]">
                    {chapter.correct_answers || 0} <span className="text-rose-400 font-normal">/ {chapter.incorrect_answers || 0}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Revisions</span>
                  <span className="font-bold text-amber-300">
                    {chapter.revision_count || 0}x
                  </span>
                </div>
              </div>

              {/* Notes Preview if available */}
              {chapter.notes && (
                <p className="text-[11px] text-slate-300 bg-slate-900/40 p-2 rounded-lg border border-white/5 mb-3 italic line-clamp-2">
                  "{chapter.notes}"
                </p>
              )}

              {/* Quick Status Control Buttons */}
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1">
                  {(['Not Started', 'In Progress', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleQuickStatusChange(chapter.id, st)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                        chapter.status === st
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleIncrementRevision(chapter.id, chapter.revision_count || 0)}
                    title="Add Revision (+1)"
                    className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    +Rev
                  </button>
                  <button
                    onClick={() => handleReset(chapter.id, chapter.name)}
                    title="Reset Status"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Chapter Modal */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
                  {editingChapter.subject}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {editingChapter.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingChapter(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Progress */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Status</label>
                <select
                  value={statusInput}
                  onChange={(e: any) => setStatusInput(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Needs Revision">Needs Revision</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Progress ({progressInput}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressInput}
                  onChange={(e) => setProgressInput(Number(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>
            </div>

            {/* Practice Questions Breakdown */}
            <div>
              <label className="text-[11px] text-slate-300 block mb-1 font-semibold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                Practice Questions Attempted
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Solved</span>
                  <input
                    type="number"
                    min="0"
                    value={questionsInput}
                    onChange={(e) => setQuestionsInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block">Correct (+4)</span>
                  <input
                    type="number"
                    min="0"
                    value={correctInput}
                    onChange={(e) => setCorrectInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-emerald-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 block">Wrong (-1)</span>
                  <input
                    type="number"
                    min="0"
                    value={incorrectInput}
                    onChange={(e) => setIncorrectInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-rose-300"
                  />
                </div>
              </div>
            </div>

            {/* Personal Notes */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Personal Notes & Formula Reminders</label>
              <textarea
                rows={3}
                placeholder="E.g. Important NCERT diagrams, tricky exceptions, formulas..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setEditingChapter(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

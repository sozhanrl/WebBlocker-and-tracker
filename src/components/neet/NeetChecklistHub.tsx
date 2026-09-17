import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { NeetSubject, ChapterStatus, ClassLevel, NeetChapter } from '../../types';
import { SubjectDashboardCard } from './SubjectDashboardCard';
import { ChapterCard } from './ChapterCard';
import { AddEditChapterModal } from './AddEditChapterModal';
import { BiologyModeSettings } from './BiologyModeSettings';
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Plus,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Dna
} from 'lucide-react';
import { Button } from '../common/Button';

type SortOption =
  | 'sequence'
  | 'weightage-desc'
  | 'weightage-asc'
  | 'accuracy-asc'
  | 'questions-desc'
  | 'title-asc';

export const NeetChecklistHub: React.FC = () => {
  const { neetChapters, settings } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<NeetSubject | 'All'>('Physics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassLevel | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ChapterStatus | 'All'>('All');
  const [sortOption, setSortOption] = useState<SortOption>('sequence');
  const [showAddModal, setShowAddModal] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<NeetChapter | null>(null);
  const [showBioSettings, setShowBioSettings] = useState(false);

  const bioMode = settings.biologyOrganizationMode || 'separate';

  // Determine available subjects based on biology mode
  const subjectList: NeetSubject[] = useMemo(() => {
    if (bioMode === 'combined') {
      return ['Physics', 'Chemistry', 'Biology'];
    }
    return ['Physics', 'Chemistry', 'Botany', 'Zoology'];
  }, [bioMode]);

  // Overall NEET 2027 stats calculation across all 81 chapters
  const totalChaptersCount = neetChapters.length;
  const completedChaptersCount = neetChapters.filter(c => c.status === 'Completed').length;
  const revisionChaptersCount = neetChapters.filter(c => c.status === 'Revision').length;
  const inProgressChaptersCount = neetChapters.filter(c => c.status === 'In Progress').length;
  
  const totalSolvedMCQs = neetChapters.reduce((acc, c) => acc + (c.questionsSolved || 0), 0);
  const totalCorrectMCQs = neetChapters.reduce((acc, c) => acc + (c.correctCount || 0), 0);
  const totalWrongMCQs = neetChapters.reduce((acc, c) => acc + (c.wrongCount || 0), 0);
  const overallNeetAccuracy = (totalCorrectMCQs + totalWrongMCQs > 0)
    ? Math.round((totalCorrectMCQs / (totalCorrectMCQs + totalWrongMCQs)) * 100)
    : 0;

  const totalSyllabusProgress = totalChaptersCount > 0
    ? Math.round(((completedChaptersCount + revisionChaptersCount * 0.75 + inProgressChaptersCount * 0.3) / totalChaptersCount) * 100)
    : 0;

  // Filter and Sort Chapters
  const filteredAndSortedChapters = useMemo(() => {
    let result = neetChapters.filter(chapter => {
      // Subject match
      if (selectedSubject !== 'All') {
        if (selectedSubject === 'Biology' && (chapter.subject === 'Botany' || chapter.subject === 'Zoology' || chapter.subject === 'Biology')) {
          // match biology
        } else if (chapter.subject !== selectedSubject) {
          return false;
        }
      }

      // Class match
      if (selectedClass !== 'All' && chapter.classLevel !== selectedClass) {
        return false;
      }

      // Status match
      if (selectedStatus !== 'All' && chapter.status !== selectedStatus) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = chapter.title.toLowerCase().includes(query);
        const matchNotes = chapter.notes?.toLowerCase().includes(query);
        const matchUnit = chapter.unitNumber?.toString().includes(query);
        if (!matchTitle && !matchNotes && !matchUnit) {
          return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortOption === 'weightage-desc') {
        return (b.weightagePercentage || 0) - (a.weightagePercentage || 0);
      }
      if (sortOption === 'weightage-asc') {
        return (a.weightagePercentage || 0) - (b.weightagePercentage || 0);
      }
      if (sortOption === 'accuracy-asc') {
        return (a.accuracyPercentage || 0) - (b.accuracyPercentage || 0);
      }
      if (sortOption === 'questions-desc') {
        return (b.questionsSolved || 0) - (a.questionsSolved || 0);
      }
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      // default: sequence by unitNumber or natural order
      return (a.unitNumber || 999) - (b.unitNumber || 999);
    });

    return result;
  }, [neetChapters, selectedSubject, selectedClass, selectedStatus, searchQuery, sortOption]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner: Master NEET Readiness & Metrics */}
      <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-[#0e1733] via-[#1C2541] to-[#0B132B] border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                81 NCERT Units Tracked
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                NEET 2027 Syllabus OS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              NEET Mastery & Checklist Hub
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Track Class 11 & 12 NCERT chapters, log practice questions (+4/-1), calculate chapter accuracy, and schedule spaced revisions.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-white/10 flex-shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Syllabus Complete</span>
              <span className="text-xl font-extrabold text-emerald-400">{totalSyllabusProgress}%</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-medium">MCQs Practiced</span>
              <span className="text-xl font-extrabold text-sky-400">{totalSolvedMCQs}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Avg Accuracy</span>
              <span className={`text-xl font-extrabold ${overallNeetAccuracy >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {overallNeetAccuracy}%
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Overall Syllabus Mastery ({completedChaptersCount}/{totalChaptersCount} Chapters Done)</span>
            <span>{revisionChaptersCount} In Revision • {inProgressChaptersCount} In Progress</span>
          </div>
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/50"
              style={{ width: `${totalSyllabusProgress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Subject Dashboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {subjectList.map((subj) => (
          <SubjectDashboardCard
            key={subj}
            subject={subj}
            chapters={neetChapters.filter(c => {
              if (subj === 'Biology') return c.subject === 'Botany' || c.subject === 'Zoology' || c.subject === 'Biology';
              return c.subject === subj;
            })}
            isSelected={selectedSubject === subj}
            onSelect={(s) => setSelectedSubject(s)}
          />
        ))}
      </div>

      {/* Biology Organization Mode Collapsible Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowBioSettings(!showBioSettings)}
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          <Dna className="w-3.5 h-3.5 text-emerald-400" />
          <span>Biology Organization: <strong className="capitalize text-slate-200">{bioMode}</strong></span>
          <span className="text-[10px] text-sky-400">({showBioSettings ? 'Hide Options' : 'Customize'})</span>
        </button>

        <Button
          variant="secondary"
          onClick={() => {
            setChapterToEdit(null);
            setShowAddModal(true);
          }}
          className="text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          Add Custom Chapter
        </Button>
      </div>

      {showBioSettings && <BiologyModeSettings />}

      {/* Search, Filter & Sort Controls */}
      <Card className="p-4 space-y-3 bg-slate-900/90 border-white/10">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 81 chapters, formulas, unit numbers..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Subject Quick Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedSubject('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubject === 'All'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Subjects
            </button>
            {subjectList.map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubject === subj
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Class:</span>
            {(['All', 'Class 11', 'Class 12'] as const).map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  selectedClass === cls
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Status:</span>
            {(['All', 'Not Started', 'In Progress', 'Revision', 'Completed'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  selectedStatus === st
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-800 border border-slate-700 text-white text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-sky-500"
            >
              <option value="sequence">NCERT Syllabus Order</option>
              <option value="weightage-desc">Highest Weightage (~%)</option>
              <option value="weightage-asc">Lowest Weightage</option>
              <option value="accuracy-asc">Lowest Accuracy (Weak Topics)</option>
              <option value="questions-desc">Most MCQs Solved</option>
              <option value="title-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Chapters List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredAndSortedChapters.length}</strong> of {totalChaptersCount} units/chapters
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sky-400 hover:underline text-[11px]"
            >
              Clear search filter
            </button>
          )}
        </div>

        {filteredAndSortedChapters.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-white/5">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-semibold">No chapters match your selected filters</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All Subjects".</p>
          </div>
        ) : (
          filteredAndSortedChapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onEditCustomChapter={(c) => {
                setChapterToEdit(c);
                setShowAddModal(true);
              }}
            />
          ))
        )}
      </div>

      {/* Add / Edit Chapter Modal */}
      <AddEditChapterModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setChapterToEdit(null);
        }}
        chapterToEdit={chapterToEdit}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { ChecklistRoutine, ChecklistItem, ChecklistRecurrence } from '../../types';
import { CreateChecklistModal } from './CreateChecklistModal';
import {
  CheckSquare,
  Plus,
  RotateCcw,
  Copy,
  Trash2,
  Edit2,
  Play,
  Clock,
  Tag,
  Search,
  CheckCircle2,
  Circle,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ChecklistRoutinesHub: React.FC = () => {
  const {
    checklists,
    toggleChecklistItem,
    resetChecklist,
    deleteChecklist,
    addChecklist,
    setActiveTab
  } = useApp();

  const { startFocusSession } = useFocusTimer();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRecurrence, setFilterRecurrence] = useState<'All' | ChecklistRecurrence>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  // Filter checklists based on search and recurrence
  const filteredChecklists = checklists.filter((routine) => {
    const matchesSearch =
      routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (routine.description && routine.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      routine.items.some((item) => (item.title || item.text || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRecurrence =
      filterRecurrence === 'All' || routine.recurrence === filterRecurrence;

    return matchesSearch && matchesRecurrence;
  });

  const handleDuplicate = (routine: ChecklistRoutine) => {
    addChecklist({
      title: `${routine.title} (Copy)`,
      description: routine.description,
      recurrence: routine.recurrence,
      category: routine.category,
      items: routine.items.map((item, idx) => ({
        ...item,
        id: `item-${Date.now()}-${idx}`,
        isCompleted: false
      }))
    });
  };

  const handleStartFocusFromItem = (item: ChecklistItem) => {
    const minutes = item.durationMinutes || 60;
    const subject = item.subject || 'Other';
    startFocusSession(minutes, subject, 'Routine Block', item.title, false);
    setActiveTab('focus');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Checklist Routines
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated daily discipline checklists, 13-block timetable routines, and step-by-step NEET execution
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-md shadow-sky-500/20 whitespace-nowrap"
        >
          Create Checklist
        </Button>
      </div>

      {/* Search & Recurrence Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routines or time blocks..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-xl overflow-x-auto">
          {(['All', 'daily', 'weekly', 'custom'] as const).map((rec) => (
            <button
              key={rec}
              onClick={() => setFilterRecurrence(rec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterRecurrence === rec
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {rec === 'All' ? 'All Routines' : rec}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredChecklists.map((routine) => {
          const totalItems = routine.items.length;
          const completedItems = routine.items.filter((i) => i.isCompleted).length;
          const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
          const isFullyDone = totalItems > 0 && completedItems === totalItems;

          return (
            <Card
              key={routine.id}
              className={`p-5 space-y-4 border transition-all ${
                isFullyDone
                  ? 'border-emerald-500/40 bg-slate-900/90 shadow-emerald-500/5'
                  : 'border-white/10 bg-[#1C2541]/70'
              }`}
            >
              {/* Routine Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {routine.title}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 capitalize">
                      {routine.recurrence} • {totalItems} items
                    </span>
                    {routine.category && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {routine.category}
                      </span>
                    )}
                  </div>
                  {routine.description && (
                    <p className="text-xs text-slate-400">{routine.description}</p>
                  )}
                </div>

                {/* Card Top Right Controls */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => resetChecklist(routine.id)}
                    title="Reset all checkboxes"
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all text-xs flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Reset</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(routine)}
                    title="Duplicate routine"
                    className="p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/20 transition-all text-xs flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Duplicate</span>
                  </button>

                  <button
                    onClick={() => deleteChecklist(routine.id)}
                    title="Delete routine"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Status Pill */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Routine Progress</span>
                  <span
                    className={`font-bold ${
                      isFullyDone ? 'text-emerald-400' : 'text-sky-400'
                    }`}
                  >
                    {progressPercent}% Completed ({completedItems}/{totalItems})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFullyDone
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                        : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-1">
                {routine.items.map((item) => {
                  const isStudyBlock = item.subject && item.subject !== 'Other';
                  return (
                    <div
                      key={item.id}
                      className={`group p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        item.isCompleted
                          ? 'bg-slate-900/40 border-slate-800 opacity-60'
                          : 'bg-slate-900/80 hover:bg-slate-900 border-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Checkbox and Text Info */}
                      <div
                        onClick={() => toggleChecklistItem(routine.id, item.id)}
                        className="flex items-start gap-3 cursor-pointer flex-1 select-none"
                      >
                        <button
                          type="button"
                          className="mt-0.5 flex-shrink-0 text-slate-400 group-hover:text-white transition-colors"
                        >
                          {(item.isCompleted ?? item.completed) ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {(item.timeBlock || item.timeRange) && (
                              <span className="text-[11px] font-bold text-sky-400 font-mono bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/20">
                                {item.timeBlock || item.timeRange}
                              </span>
                            )}
                            <span
                              className={`text-xs sm:text-sm font-semibold transition-all ${
                                (item.isCompleted ?? item.completed)
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-100'
                              }`}
                            >
                              {item.title || item.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 pt-0.5">
                            {item.subject && item.subject !== 'Other' && (
                              <span className="font-semibold text-emerald-400">
                                • {item.subject}
                              </span>
                            )}
                            {item.durationMinutes && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {item.durationMinutes}m
                              </span>
                            )}
                            {item.description && (
                              <span className="text-slate-400 line-clamp-1 italic">
                                — {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Start Focus Button for Study Blocks */}
                      {!item.isCompleted && isStudyBlock && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartFocusFromItem(item);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 hover:border-transparent text-xs font-semibold transition-all flex-shrink-0"
                          title="Start focus timer for this block"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="hidden sm:inline">Focus</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {filteredChecklists.length === 0 && (
          <Card className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No checklists found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No checklist matches your search query or filter. Create a new custom checklist routine to get started.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Create Checklist Routine
            </Button>
          </Card>
        )}
      </div>

      {/* Create Modal */}
      <CreateChecklistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { StudyTask, NeetSubject, TaskStatus } from '../../types';
import {
  CheckSquare,
  Square,
  Plus,
  Clock,
  Calendar,
  Trash2,
  Play,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { formatMinutes } from '../../utils/formatters';

interface TaskChecklistProps {
  onOpenAddTaskModal: () => void;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({ onOpenAddTaskModal }) => {
  const { tasks, toggleTaskStatus, deleteTask } = useApp();
  const { startFocusSession } = useFocusTimer();

  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');

  const subjects = ['All', 'Physics', 'Chemistry', 'Botany', 'Zoology'];
  const statuses: Array<'All' | TaskStatus> = ['All', 'In Progress', 'Not Started', 'Completed'];

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesSubject = subjectFilter === 'All' || task.subject === subjectFilter;
    return matchesStatus && matchesSubject;
  });

  const priorityBadgeMap = {
    Low: 'bg-slate-800 text-slate-400 border-slate-700',
    Medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    High: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  const handleStartTaskTimer = (task: StudyTask) => {
    startFocusSession(
      task.estimatedMinutes || 45,
      task.subject,
      task.chapter || 'Task Study',
      task.title,
      false
    );
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-sky-400" />
              Daily Study Tasks & Revision Checklist
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedCount} of {tasks.length} tasks completed today
            </p>
          </div>

          <Button
            onClick={onOpenAddTaskModal}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSubjectFilter(sub)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  subjectFilter === sub
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'Completed';
          return (
            <Card
              key={task.id}
              className={`p-4 flex items-start justify-between gap-3 transition-all ${
                isDone ? 'opacity-60 bg-slate-900/40' : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {task.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        priorityBadgeMap[task.priority]
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    {task.chapter && (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        • {task.chapter}
                      </span>
                    )}
                  </div>

                  <h4
                    className={`text-sm font-semibold tracking-tight ${
                      isDone ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h4>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {formatMinutes(task.estimatedMinutes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      Due: {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!isDone && (
                  <button
                    onClick={() => handleStartTaskTimer(task)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all"
                    title="Start focus timer for this task"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span className="hidden sm:inline">Focus</span>
                  </button>
                )}

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })}

        {filteredTasks.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-400">No tasks found matching your active filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

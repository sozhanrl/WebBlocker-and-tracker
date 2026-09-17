import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { CalendarEvent } from '../../types';
import { AddEventModal } from './AddEventModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Award,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Filter,
  Play,
  Trash2
} from 'lucide-react';

export const CalendarHub: React.FC = () => {
  const {
    calendarEvents,
    deleteCalendarEvent,
    userProfile,
    mockTests,
    revisionItems,
    setActiveTab
  } = useApp();

  const { startFocusSession } = useFocusTimer();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthYearStr = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  // Calendar Grid Calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];

  // Previous month filler days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 1, day);
    daysArray.push({
      dayNum: day,
      dateStr: date.toISOString().split('T')[0],
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    daysArray.push({
      dayNum: d,
      dateStr: date.toISOString().split('T')[0],
      isCurrentMonth: true
    });
  }

  // Next month filler days to complete grid (up to multiple of 7)
  const remaining = 7 - (daysArray.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      daysArray.push({
        dayNum: d,
        dateStr: date.toISOString().split('T')[0],
        isCurrentMonth: false
      });
    }
  }

  // Events on selected date
  const eventsOnSelectedDate = calendarEvents.filter((ev) => {
    const matchesDate = ev.date === selectedDateStr;
    const matchesFilter = typeFilter === 'All' || ev.type === typeFilter;
    return matchesDate && matchesFilter;
  });

  const getEventTypeBadge = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'mock_test':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'revision':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'college':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'routine':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getEventTypeDot = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'mock_test':
        return 'bg-amber-400';
      case 'revision':
        return 'bg-emerald-400';
      case 'college':
        return 'bg-purple-400';
      case 'routine':
        return 'bg-sky-400';
      default:
        return 'bg-slate-400';
    }
  };

  const handleStartFocusEvent = (ev: CalendarEvent) => {
    startFocusSession(60, ev.subject || 'Other', 'Calendar Schedule', ev.title, false);
    setActiveTab('focus');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Study Calendar & Schedule Timetable
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Integrated timetable of NEET mock tests, spaced revision slots, engineering college hours & daily routines
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-md shadow-sky-500/20 whitespace-nowrap"
        >
          Add Event / Slot
        </Button>
      </div>

      {/* Main Grid: Left Calendar View, Right Day Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Month View (2 cols on large screen) */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          {/* Month Header and Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-sky-400" />
              {monthYearStr}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/10 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/10 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 pb-1">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {daysArray.map((item, idx) => {
              const isSelected = item.dateStr === selectedDateStr;
              const isToday = item.dateStr === new Date().toISOString().split('T')[0];
              const eventsForDay = calendarEvents.filter((e) => e.date === item.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(item.dateStr)}
                  className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/10 shadow-md shadow-sky-500/10 ring-1 ring-sky-500'
                      : item.isCurrentMonth
                      ? 'border-white/5 bg-slate-900/60 hover:bg-slate-900 hover:border-white/20'
                      : 'border-transparent bg-slate-950/40 text-slate-600 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-sky-500 text-white shadow-sm'
                          : isSelected
                          ? 'text-sky-300'
                          : item.isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.dayNum}
                    </span>

                    {eventsForDay.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 px-1">
                        {eventsForDay.length}
                      </span>
                    )}
                  </div>

                  {/* Event Dots/Pills in Tile */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {eventsForDay.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-medium truncate px-1 py-0.5 rounded flex items-center gap-1 ${
                          ev.type === 'mock_test'
                            ? 'bg-amber-500/20 text-amber-300'
                            : ev.type === 'revision'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : ev.type === 'college'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getEventTypeDot(ev.type)}`} />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {eventsForDay.length > 2 && (
                      <span className="text-[8px] text-slate-500 block text-right">
                        +{eventsForDay.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>NEET Mock Tests</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Spaced Revision</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Engineering College</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Study Routine Block</span>
            </div>
          </div>
        </Card>

        {/* Right Panel: Selected Day Agenda & Time Slot Overview */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('default', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>
              <p className="text-[11px] text-slate-400">
                {eventsOnSelectedDate.length} scheduled item{eventsOnSelectedDate.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['All', 'mock_test', 'revision', 'routine', 'college'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold capitalize whitespace-nowrap transition-all ${
                  typeFilter === type
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {type === 'mock_test'
                  ? 'Mocks'
                  : type === 'revision'
                  ? 'Revision'
                  : type === 'college'
                  ? 'College'
                  : type}
              </button>
            ))}
          </div>

          {/* Agenda Items List */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {eventsOnSelectedDate.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 group hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize ${getEventTypeBadge(
                          ev.type
                        )}`}
                      >
                        {ev.type.replace('_', ' ')}
                      </span>
                      {ev.subject && (
                        <span className="text-[10px] font-semibold text-emerald-400">
                          {ev.subject}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1">{ev.title}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartFocusEvent(ev)}
                      title="Launch Focus Mode"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => deleteCalendarEvent(ev.id)}
                      title="Delete Event"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {ev.time && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{ev.time}</span>
                  </div>
                )}

                {ev.description && (
                  <p className="text-[11px] text-slate-400 italic">{ev.description}</p>
                )}
              </div>
            ))}

            {eventsOnSelectedDate.length === 0 && (
              <div className="p-8 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-slate-900/30">
                <Clock className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">No events scheduled for this day</p>
                <p className="text-[11px] text-slate-500">
                  Add revision goals, mock exams or study sessions to stay disciplined.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultDate={selectedDateStr}
      />
    </div>
  );
};

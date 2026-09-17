import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { NeetSubject, TaskPriority } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, neetChapters } = useApp();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<NeetSubject>('Physics');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  const filteredChapters = neetChapters.filter(c => c.subject === subject);
  const [chapter, setChapter] = useState(filteredChapters[0]?.title || '');

  const subjects: NeetSubject[] = ['Physics', 'Chemistry', 'Botany', 'Zoology', 'Mathematics', 'Other'];
  const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      subject,
      chapter,
      priority,
      dueDate,
      estimatedMinutes,
      status: 'Not Started',
      hasReminder: true
    });

    setTitle('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create NEET Study Task"
      subtitle="Add a specific study or problem-solving goal"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Task Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Practice 50 Botany Genetics MCQs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => {
                const newSub = e.target.value as NeetSubject;
                setSubject(newSub);
                const nextChaps = neetChapters.filter(c => c.subject === newSub);
                setChapter(nextChaps[0]?.title || '');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Chapter</label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              {filteredChapters.map(c => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
              <option value="General Study">General Study</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Est. Minutes</label>
            <input
              type="number"
              min="10"
              max="300"
              step="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 60)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

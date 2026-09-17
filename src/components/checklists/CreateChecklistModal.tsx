import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { ChecklistRecurrence, ChecklistItem, NeetSubject } from '../../types';
import { Plus, Trash2, Clock, Layers, BookOpen } from 'lucide-react';

interface CreateChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateChecklistModal: React.FC<CreateChecklistModalProps> = ({ isOpen, onClose }) => {
  const { addChecklist } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<ChecklistRecurrence>('daily');
  const [category, setCategory] = useState('NEET Routine');

  const [items, setItems] = useState<Array<{
    title: string;
    timeBlock: string;
    subject: NeetSubject;
    durationMinutes: number;
    description: string;
  }>>([
    {
      title: 'Morning NEET Study Block',
      timeBlock: '06:00–08:30',
      subject: 'Physics',
      durationMinutes: 150,
      description: 'Mechanics formula drill & 30 PYQs'
    },
    {
      title: 'Midday NCERT Line-by-Line',
      timeBlock: '10:00–12:30',
      subject: 'Botany',
      durationMinutes: 150,
      description: 'Plant Physiology reading & diagram mastery'
    }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        title: '',
        timeBlock: '14:00–16:00',
        subject: 'Other',
        durationMinutes: 60,
        description: ''
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || items.length === 0) return;

    const checklistItems: ChecklistItem[] = items
      .filter((i) => i.title.trim().length > 0)
      .map((i, idx) => ({
        id: `custom-item-${Date.now()}-${idx}`,
        title: i.title,
        timeBlock: i.timeBlock,
        subject: i.subject,
        durationMinutes: i.durationMinutes,
        description: i.description,
        isCompleted: false
      }));

    addChecklist({
      title: title.trim(),
      description: description.trim(),
      recurrence,
      category: category.trim(),
      items: checklistItems
    });

    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Checklist Routine" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Routine Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekend Grand Revision & Speed Drill"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Description & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Recurrence
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as ChecklistRecurrence)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category Tag
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., NEET Routine, Morning Discipline"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Description / Summary
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what this routine accomplishes..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Checklist Routine Items Builder */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Checklist Steps & Time Blocks ({items.length})
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Step
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Step {idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Step Title (e.g. Physics Practice)"
                    value={item.title}
                    onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                    className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />

                  <input
                    type="text"
                    placeholder="06:00–08:00"
                    value={item.timeBlock}
                    onChange={(e) => handleItemChange(idx, 'timeBlock', e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <select
                    value={item.subject}
                    onChange={(e) => handleItemChange(idx, 'subject', e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                    <option value="Other">Other (Wellness / Break)</option>
                  </select>

                  <div className="flex items-center gap-1 bg-slate-950 px-2 rounded-lg border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={item.durationMinutes}
                      onChange={(e) =>
                        handleItemChange(idx, 'durationMinutes', parseInt(e.target.value) || 30)
                      }
                      className="w-full py-1.5 bg-transparent text-white text-xs focus:outline-none"
                      placeholder="Minutes"
                    />
                    <span className="text-[10px] text-slate-400 pr-1">min</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Short notes / focus goal"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Routine</Button>
        </div>
      </form>
    </Modal>
  );
};

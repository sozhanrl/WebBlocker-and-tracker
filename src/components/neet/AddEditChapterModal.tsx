import React, { useState } from 'react';
import { NeetSubject, NeetChapter, ClassLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Plus, BookOpen, Save } from 'lucide-react';
import { Button } from '../common/Button';

interface AddEditChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterToEdit?: NeetChapter | null;
}

export const AddEditChapterModal: React.FC<AddEditChapterModalProps> = ({
  isOpen,
  onClose,
  chapterToEdit
}) => {
  const { addCustomChapter, updateChapterNotes, updateChapterTargetDate } = useApp();

  const [title, setTitle] = useState(chapterToEdit?.title || '');
  const [subject, setSubject] = useState<NeetSubject>(chapterToEdit?.subject || 'Physics');
  const [classLevel, setClassLevel] = useState<ClassLevel>(chapterToEdit?.classLevel || 'Class 11');
  const [weightage, setWeightage] = useState(chapterToEdit?.weightagePercentage || 3.0);
  const [unitNumber, setUnitNumber] = useState<number | undefined>(chapterToEdit?.unitNumber || 1);
  const [notes, setNotes] = useState(chapterToEdit?.notes || '');
  const [targetDate, setTargetDate] = useState(chapterToEdit?.targetCompletionDate || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (chapterToEdit) {
      updateChapterNotes(chapterToEdit.id, notes);
      if (targetDate) {
        updateChapterTargetDate(chapterToEdit.id, targetDate);
      }
    } else {
      addCustomChapter({
        title: title.trim(),
        subject,
        classLevel,
        weightagePercentage: Number(weightage) || 2.5,
        unitNumber: unitNumber ? Number(unitNumber) : undefined,
        status: 'Not Started',
        revisionCount: 0,
        questionsSolved: 0,
        correctCount: 0,
        wrongCount: 0,
        unattemptedCount: 0,
        accuracyPercentage: 0,
        targetCompletionDate: targetDate || undefined,
        notes: notes.trim() || undefined,
        isCustom: true
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              {chapterToEdit ? 'Edit Chapter Details & Notes' : 'Add Custom NEET Chapter / Unit'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Chapter Title *
            </label>
            <input
              type="text"
              required
              disabled={!!chapterToEdit && !chapterToEdit.isCustom}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Physics: Photoelectric Effect"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
            />
          </div>

          {!chapterToEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as NeetSubject)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Botany">Botany</option>
                  <option value="Zoology">Zoology</option>
                  <option value="Biology">Biology (Combined)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Class</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Weightage (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="25"
                disabled={!!chapterToEdit && !chapterToEdit.isCustom}
                value={weightage}
                onChange={(e) => setWeightage(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Personal Notes & Key Formulas
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remember de Broglie wavelength λ = h/p, cutoff frequency formula..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {chapterToEdit ? 'Save Changes' : 'Add Chapter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

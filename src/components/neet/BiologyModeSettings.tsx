import React from 'react';
import { useApp } from '../../context/AppContext';
import { BiologyOrganizationMode } from '../../types';
import { Settings, Check, Dna } from 'lucide-react';

export const BiologyModeSettings: React.FC = () => {
  const { settings, setBiologyMode } = useApp();
  const currentMode = settings.biologyOrganizationMode || 'separate';

  const modes: { id: BiologyOrganizationMode; title: string; desc: string }[] = [
    {
      id: 'separate',
      title: 'Separate Botany & Zoology',
      desc: 'Standard 4-subject NEET format: Botany (24 chapters) + Zoology (27 chapters).'
    },
    {
      id: 'combined',
      title: 'Unified Biology (360 Marks)',
      desc: 'Combines Botany and Zoology into a single unified 51-chapter Biology syllabus.'
    },
    {
      id: 'custom',
      title: 'Custom Biology Hierarchy',
      desc: 'Organized by custom unit hierarchies and personalized topics.'
    }
  ];

  return (
    <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Biology Syllabus Organization
          </h4>
        </div>
        <span className="text-[10px] text-slate-400">
          Current: <strong className="text-emerald-400 capitalize">{currentMode}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {modes.map((m) => {
          const isSelected = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setBiologyMode(m.id)}
              className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>{m.title}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {m.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

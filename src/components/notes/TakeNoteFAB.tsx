import React from 'react';
import { useApp } from '../../context/AppContext';
import { Edit3, Sparkles } from 'lucide-react';

export const TakeNoteFAB: React.FC = () => {
  const { openTakeNoteModal, isTakeNoteModalOpen } = useApp();

  if (isTakeNoteModalOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 lg:bottom-8 lg:right-8 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={() => openTakeNoteModal()}
        className="group relative flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all border border-white/20 select-none"
        title="Take a quick note (Notion Notes)"
      >
        <div className="relative">
          <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <span className="tracking-tight hidden xs:inline sm:inline">Take Note</span>
        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/20 text-white/90">
          Notion
        </span>
      </button>
    </div>
  );
};

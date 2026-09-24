import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  HardDrive,
  Clock,
  CheckSquare,
  Square,
  Heading,
  List,
  Code,
  Quote,
  Bold,
  Check,
  ExternalLink,
  ChevronDown,
  Eye,
  Edit3,
  BookOpen
} from 'lucide-react';
import { NeetSubject } from '../../types';

const EMOJI_OPTIONS = ['📝', '⚡', '🧪', '🌿', '🧬', '💡', '🎯', '📌', '🧮', '📖'];

const SUBJECT_OPTIONS: { label: string; subject?: NeetSubject; color: string }[] = [
  { label: 'General', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { label: 'Physics', subject: 'Physics', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { label: 'Chemistry', subject: 'Chemistry', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { label: 'Botany', subject: 'Botany', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: 'Zoology', subject: 'Zoology', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
];

export const TakeNoteModal: React.FC = () => {
  const {
    isTakeNoteModalOpen,
    takeNoteInitialData,
    closeTakeNoteModal,
    createNotionPage,
    openNotionPage,
    setActiveTab
  } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [icon, setIcon] = useState('📝');
  const [isStored, setIsStored] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('General');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize data when modal opens
  useEffect(() => {
    if (isTakeNoteModalOpen) {
      setTitle(takeNoteInitialData?.title || '');
      setContent(takeNoteInitialData?.content || '');
      setIsStored(takeNoteInitialData?.isStored !== false);
      setSelectedSubject(takeNoteInitialData?.subject || 'General');
      setIcon(
        takeNoteInitialData?.subject === 'Physics' ? '⚡' :
        takeNoteInitialData?.subject === 'Chemistry' ? '🧪' :
        takeNoteInitialData?.subject === 'Botany' ? '🌿' :
        takeNoteInitialData?.subject === 'Zoology' ? '🧬' : '📝'
      );
      setPreviewMode(false);
      setSavedToast(false);

      // Focus textarea or title after mount
      setTimeout(() => {
        if (takeNoteInitialData?.title) {
          textareaRef.current?.focus();
        }
      }, 100);
    }
  }, [isTakeNoteModalOpen, takeNoteInitialData]);

  if (!isTakeNoteModalOpen) return null;

  const insertSnippet = (snippet: string, cursorOffset: number = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = content;
    const updated = current.substring(0, start) + snippet + current.substring(end);
    setContent(updated);
    setTimeout(() => {
      textarea.focus();
      const pos = start + snippet.length + cursorOffset;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleSave = (openInEditor: boolean = false) => {
    const finalTitle = title.trim() || `Quick Note - ${new Date().toLocaleDateString()}`;
    const tags = [selectedSubject];

    const created = createNotionPage({
      title: finalTitle,
      icon,
      content: content.trim(),
      isStored,
      tags,
      section: 'private'
    });

    if (openInEditor) {
      closeTakeNoteModal();
      setActiveTab('notes');
      if (created && created.id) {
        openNotionPage(created.id);
      }
    } else {
      setSavedToast(true);
      setTimeout(() => {
        closeTakeNoteModal();
      }, 600);
    }
  };

  const insertTimestamp = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    insertSnippet(`\n[${timeStr}] `);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#18181B] text-slate-100 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#1F1F23]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg border border-white/10 transition-colors"
                title="Change Icon"
              >
                {icon}
              </button>

              {/* Emoji Selector Dropdown */}
              {showEmojiPicker && (
                <div className="absolute top-11 left-0 z-30 p-2 bg-[#27272A] border border-white/10 rounded-2xl shadow-xl flex gap-1.5 flex-wrap w-48 animate-in fade-in duration-100">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setIcon(em);
                        setShowEmojiPicker(false);
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-white/10 text-base flex items-center justify-center"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight">Notion Take Note</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Quick Capture
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Jot formulas, ideas or NEET revisions instantly</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 border transition-colors ${
                previewMode
                  ? 'bg-sky-500/20 border-sky-500/30 text-sky-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={previewMode ? 'Switch to Edit' : 'Preview Note'}
            >
              {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={closeTakeNoteModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Storage & Subject Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-white/5">
            {/* Subject Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {SUBJECT_OPTIONS.map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSelectedSubject(s.label)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    selectedSubject === s.label
                      ? s.color + ' ring-1 ring-white/20'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Storage Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsStored(!isStored)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                isStored
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
              }`}
              title={isStored ? 'Saved permanently in Notion Notes' : 'Scratchpad note (Do not store)'}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{isStored ? 'Store in Workspace' : 'Scratchpad (Do Not Store)'}</span>
            </button>
          </div>

          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title (e.g. Work-Energy Theorem, Organic Chemistry Reagents...)"
              className="w-full bg-transparent text-lg sm:text-xl font-bold text-white placeholder-slate-500 focus:outline-none border-b border-white/10 pb-2"
            />
          </div>

          {/* Quick Markdown Toolbar */}
          {!previewMode && (
            <div className="flex items-center gap-1 overflow-x-auto py-1 text-slate-400 bg-white/5 rounded-xl px-2 border border-white/5">
              <button
                type="button"
                onClick={() => insertSnippet('\n## ', 0)}
                className="px-2 py-1 rounded hover:bg-white/10 text-xs font-bold hover:text-white"
                title="Heading"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('\n- [ ] ', 0)}
                className="px-2 py-1 rounded hover:bg-white/10 text-xs flex items-center gap-1 hover:text-white"
                title="Checkbox"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Todo</span>
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('\n- ', 0)}
                className="px-2 py-1 rounded hover:bg-white/10 text-xs flex items-center gap-1 hover:text-white"
                title="Bullet"
              >
                <List className="w-3.5 h-3.5" />
                <span>Bullet</span>
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('\n> ', 0)}
                className="px-2 py-1 rounded hover:bg-white/10 text-xs flex items-center gap-1 hover:text-white"
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
                <span>Quote</span>
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('`formula`', -1)}
                className="px-2 py-1 rounded hover:bg-white/10 text-xs flex items-center gap-1 hover:text-white"
                title="Code / Formula"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
              <button
                type="button"
                onClick={insertTimestamp}
                className="px-2 py-1 rounded hover:bg-white/10 text-xs flex items-center gap-1 hover:text-white ml-auto"
                title="Insert Time"
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Time</span>
              </button>
            </div>
          )}

          {/* Content Area */}
          {previewMode ? (
            <div className="min-h-[160px] p-3.5 bg-black/30 rounded-2xl border border-white/5 text-sm space-y-2 text-slate-200">
              {content.trim() ? (
                content.split('\n').map((line, idx) => {
                  const t = line.trim();
                  if (t.startsWith('# ')) {
                    return <h1 key={idx} className="text-lg font-bold text-white mt-2">{t.replace('# ', '')}</h1>;
                  }
                  if (t.startsWith('## ')) {
                    return <h2 key={idx} className="text-base font-bold text-sky-300 mt-2">{t.replace('## ', '')}</h2>;
                  }
                  if (t.startsWith('- [ ] ') || t.startsWith('- [x] ')) {
                    const isChecked = t.startsWith('- [x] ');
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
                        <span className={isChecked ? 'line-through text-slate-500' : ''}>{t.replace(/- \[[ x]\] /, '')}</span>
                      </div>
                    );
                  }
                  if (t.startsWith('- ')) {
                    return <li key={idx} className="ml-4 list-disc">{t.replace('- ', '')}</li>;
                  }
                  if (!t) return <div key={idx} className="h-2" />;
                  return <p key={idx} className="leading-relaxed">{line}</p>;
                })
              ) : (
                <span className="text-slate-500 italic">Empty note preview...</span>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note, formulas, rough calculations, or to-do checklist here...&#10;&#10;Tip: Type '- [ ] ' for interactive checkboxes, or click 'Todo' above."
              rows={8}
              className="w-full bg-[#121214] border border-white/10 rounded-2xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 resize-y transition-colors leading-relaxed font-sans"
            />
          )}

          {!isStored && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Scratchpad Mode:</strong> This note is temporary rough work. Click 'Store in Workspace' above if you want to keep it permanently.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#1F1F23] border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeTakeNoteModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
              title="Save and open in Notion Workspace editor"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Open in Notion</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

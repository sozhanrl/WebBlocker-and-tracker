import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NotionPage } from '../../types';
import {
  ChevronLeft,
  Share2,
  MoreHorizontal,
  Star,
  Plus,
  Trash2,
  HardDrive,
  Clock,
  Sparkles,
  ExternalLink,
  CheckSquare,
  Square,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  FileText,
  Bookmark,
  Check,
  Search,
  PenTool,
  Copy
} from 'lucide-react';

interface NotionPageEditorProps {
  page: NotionPage;
  onBack: () => void;
}

export const NotionPageEditor: React.FC<NotionPageEditorProps> = ({ page, onBack }) => {
  const {
    notionPages,
    updateNotionPage,
    deleteNotionPage,
    toggleFavoriteNotionPage,
    togglePageStorage,
    openNotionPage,
    createNotionPage
  } = useApp();

  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAskAiModal, setShowAskAiModal] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  useEffect(() => {
    setTitle(page.title);
    setContent(page.content);
  }, [page.id]);

  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== page.title || content !== page.content) {
        updateNotionPage(page.id, { title, content });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, content, page.id]);

  const handleToggleStore = () => {
    togglePageStorage(page.id);
  };

  const handleAddSubpage = () => {
    const sub = createNotionPage({
      title: 'Untitled Sub-page',
      parentId: page.id,
      section: 'private',
      isStored: page.isStored
    });
    const currentSubs = page.subPageIds || [];
    updateNotionPage(page.id, { subPageIds: [...currentSubs, sub.id] });
    openNotionPage(sub.id);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    setContent((prev) => prev + `\n${prefix} ` + suffix);
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(`# ${title}\n\n${content}`);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Find child sub-pages
  const childSubpages = notionPages.filter(
    (p) => p.parentId === page.id || (page.subPageIds && page.subPageIds.includes(p.id))
  );

  // Render clickable links and subpages
  const renderContentLines = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Check if line is a URL
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return (
          <div key={idx} className="my-1.5 break-all">
            <a
              href={trimmed}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-sky-300 underline underline-offset-4 flex items-center gap-1.5 text-sm sm:text-base group"
            >
              <span>{trimmed}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 flex-shrink-0" />
            </a>
          </div>
        );
      }

      // Check for markdown headers
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2">
            {trimmed.replace('# ', '')}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg sm:text-xl font-bold text-white mt-3 mb-1.5">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-semibold text-slate-200 mt-2 mb-1">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Check for interactive checklists - [ ]
      if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
        const isChecked = trimmed.startsWith('- [x] ');
        const itemText = trimmed.replace(/- \[[ x]\] /, '');
        return (
          <div
            key={idx}
            onClick={() => {
              const updatedLines = [...lines];
              updatedLines[idx] = isChecked ? `- [ ] ${itemText}` : `- [x] ${itemText}`;
              const nextContent = updatedLines.join('\n');
              setContent(nextContent);
              updateNotionPage(page.id, { content: nextContent });
            }}
            className="flex items-start gap-2.5 my-1.5 cursor-pointer select-none group"
          >
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-300 mt-1 flex-shrink-0" />
            )}
            <span
              className={`text-sm sm:text-base ${
                isChecked ? 'line-through text-slate-500' : 'text-slate-200'
              }`}
            >
              {itemText}
            </span>
          </div>
        );
      }

      // Bullet list
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 text-sm sm:text-base text-slate-200 my-1 list-disc">
            {trimmed.replace(/^[-*]\s+/, '')}
          </li>
        );
      }

      // Blank line
      if (!trimmed) {
        return <div key={idx} className="h-4" />;
      }

      // Normal text paragraph
      return (
        <p key={idx} className="text-sm sm:text-base text-slate-200 my-1.5 leading-relaxed font-sans">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-[85vh] flex flex-col bg-[#191919] text-slate-100 rounded-3xl border border-white/5 shadow-2xl overflow-hidden animate-in fade-in duration-150">
      {/* Top Notion Navigation Bar */}
      <div className="sticky top-0 z-20 bg-[#191919]/95 backdrop-blur-md px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            title="Back to Workspace"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-xs text-slate-400 font-medium truncate">
            {page.isFavorite ? 'Favourites' : 'Private'} / {title || 'Untitled'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Storage Mode Toggle Button */}
          <button
            onClick={handleToggleStore}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
              page.isStored
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 animate-pulse'
            }`}
            title={page.isStored ? 'Note is safely stored in workspace' : 'Scratchpad mode (Do not store)'}
          >
            <HardDrive className="w-3 h-3" />
            <span>{page.isStored ? 'Stored in Workspace' : 'Scratchpad (Do Not Store)'}</span>
          </button>

          {/* Favorite Star */}
          <button
            onClick={() => toggleFavoriteNotionPage(page.id)}
            className={`p-2 rounded-xl transition-colors ${
              page.isFavorite
                ? 'text-amber-400 hover:bg-amber-400/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Favourite"
          >
            <Star className={`w-4 h-4 ${page.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Share / Copy */}
          <button
            onClick={copyMarkdown}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Copy as Markdown"
          >
            {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 mt-1 w-48 py-1.5 bg-[#252525] border border-white/10 rounded-2xl shadow-xl z-30 text-xs text-slate-200">
                <button
                  onClick={() => {
                    handleToggleStore();
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/5 flex items-center gap-2"
                >
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  <span>{page.isStored ? 'Switch to Scratchpad' : 'Store in Workspace'}</span>
                </button>
                <button
                  onClick={() => {
                    handleAddSubpage();
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/5 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Add Sub-page</span>
                </button>
                <button
                  onClick={() => {
                    copyMarkdown();
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/5 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4 text-purple-400" />
                  <span>Copy Markdown</span>
                </button>
                <div className="my-1 border-t border-white/5" />
                <button
                  onClick={() => {
                    if (confirm('Delete this page?')) {
                      deleteNotionPage(page.id);
                      onBack();
                    }
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-500/10 text-rose-400 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Page</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ephemeral Scratchpad Mode Warning Banner */}
      {!page.isStored && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Ephemeral Scratchpad Mode:</strong> This note will <strong>not</strong> be permanently stored on device unless you store it.
            </span>
          </div>
          <button
            onClick={handleToggleStore}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-colors shrink-0"
          >
            💾 Store to Workspace
          </button>
        </div>
      )}

      {/* Main Page Canvas */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-8 py-6">
        {/* Cover / Icon Area */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl select-none mb-3 shadow-sm">
            {page.icon || '📄'}
          </div>

          {/* Notion Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder:text-slate-600 focus:outline-none tracking-tight font-serif"
          />
        </div>

        {/* View / Edit Mode Switcher */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <button
              onClick={() => setIsEditing(false)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                !isEditing ? 'bg-white/10 text-white' : 'hover:text-white'
              }`}
            >
              Reading View
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                isEditing ? 'bg-white/10 text-white' : 'hover:text-white'
              }`}
            >
              Edit Markdown
            </button>
          </div>

          {isEditing && (
            <div className="flex items-center gap-1 text-slate-400 overflow-x-auto py-1">
              <button
                onClick={() => insertFormatting('# ')}
                className="p-1 hover:bg-white/10 rounded text-xs font-bold"
                title="Heading 1"
              >
                H1
              </button>
              <button
                onClick={() => insertFormatting('## ')}
                className="p-1 hover:bg-white/10 rounded text-xs font-bold"
                title="Heading 2"
              >
                H2
              </button>
              <button
                onClick={() => insertFormatting('- [ ] ')}
                className="p-1 hover:bg-white/10 rounded"
                title="To-do checkbox"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('- ')}
                className="p-1 hover:bg-white/10 rounded"
                title="Bullet list"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('> ')}
                className="p-1 hover:bg-white/10 rounded"
                title="Quote callout"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('```\n', '\n```')}
                className="p-1 hover:bg-white/10 rounded"
                title="Code / Formula block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your notes here, paste links, or use - [ ] for checklists..."
            rows={16}
            className="w-full bg-transparent text-sm sm:text-base text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed font-sans"
          />
        ) : (
          <div className="min-h-[260px] pb-10">
            {content.trim() ? (
              renderContentLines(content)
            ) : (
              <p className="text-slate-600 text-sm italic">
                Empty page. Click "Edit Markdown" above or start typing.
              </p>
            )}
          </div>
        )}

        {/* Nested Sub-pages (like 📄 NEET inside Games page) */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Sub-pages ({childSubpages.length})</span>
            <button
              onClick={handleAddSubpage}
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 normal-case font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Sub-page
            </button>
          </div>

          <div className="space-y-2">
            {childSubpages.map((sub) => (
              <div
                key={sub.id}
                onClick={() => openNotionPage(sub.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 cursor-pointer transition-all group select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">{sub.icon || '📄'}</span>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                    {sub.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  {!sub.isStored && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Scratchpad
                    </span>
                  )}
                  <ChevronLeft className="w-4 h-4 rotate-180 text-slate-500 group-hover:text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Floating Notion Action Bar */}
      <div className="sticky bottom-0 bg-[#191919]/95 backdrop-blur-md px-4 py-3 border-t border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
            title="Search Workspace"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAskAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all border border-white/5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Ask AI</span>
          </button>
        </div>

        <button
          onClick={() => {
            const newP = createNotionPage({ title: 'Untitled', isStored: true });
            openNotionPage(newP.id);
          }}
          className="p-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-lg shadow-sky-500/25"
          title="New Page"
        >
          <PenTool className="w-4 h-4" />
        </button>
      </div>

      {/* Ask AI Study Companion Modal */}
      {showAskAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#202020] border border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Notion AI Study Assistant</h3>
              </div>
              <button
                onClick={() => setShowAskAiModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Quickly generate study points, summarize high-yield NCERT facts, or format formula notes for "{title}".
            </p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setContent((prev) => prev + `\n\n### AI Key Takeaways\n- High-yield concept summary\n- Must-revise formulas\n- 5 PYQ practice pattern`);
                  setShowAskAiModal(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-slate-200"
              >
                ✨ Add Key Takeaways & Formula Summary
              </button>
              <button
                onClick={() => {
                  setContent((prev) => prev + `\n\n### NEET Revision Checklist\n- [ ] NCERT Theory read\n- [ ] 30 PYQs solved\n- [ ] Formula sheet reviewed`);
                  setShowAskAiModal(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-slate-200"
              >
                📝 Insert NEET Chapter Revision Checklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

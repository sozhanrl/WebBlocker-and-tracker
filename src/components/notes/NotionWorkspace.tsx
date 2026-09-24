import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NotionPage } from '../../types';
import { NotionPageEditor } from './NotionPageEditor';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Search,
  Sparkles,
  FileText,
  Star,
  HardDrive,
  Clock,
  Trash2,
  Share2,
  Calendar as CalendarIcon,
  Inbox,
  Home,
  X
} from 'lucide-react';

export const NotionWorkspace: React.FC = () => {
  const {
    notionPages,
    activeNotionPageId,
    openNotionPage,
    closeNotionPage,
    createNotionPage,
    deleteNotionPage,
    toggleFavoriteNotionPage,
    togglePageStorage,
    setActiveTab
  } = useApp();

  // Storage filtering: 'all' | 'stored' | 'scratchpad'
  const [storageFilter, setStorageFilter] = useState<'all' | 'stored' | 'scratchpad'>('all');

  // Expanded tree states for pages with subpages
  const [expandedPageIds, setExpandedPageIds] = useState<Record<string, boolean>>({
    'page-games': true // expand games by default to show subpage NEET as in user's screenshot
  });

  // Section collapse states
  const [favouritesOpen, setFavouritesOpen] = useState(true);
  const [privateOpen, setPrivateOpen] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // New Page Modal state
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('📄');
  const [newPageSection, setNewPageSection] = useState<NotionPage['section']>('private');
  const [newPageIsStored, setNewPageIsStored] = useState<boolean>(true);
  const [newPageParentId, setNewPageParentId] = useState<string | undefined>(undefined);

  // Quick Action Menu state
  const [activeMenuPageId, setActiveMenuPageId] = useState<string | null>(null);

  // Ask AI Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // If a page is actively selected, show the NotionPageEditor
  const activePage = notionPages.find(p => p.id === activeNotionPageId);
  if (activePage) {
    return <NotionPageEditor page={activePage} onBack={closeNotionPage} />;
  }

  // Toggle tree expansion
  const toggleExpand = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPageIds(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  // Filtered pages based on storage toggle and search query
  const filteredPages = useMemo(() => {
    return notionPages.filter(page => {
      // Storage filter
      if (storageFilter === 'stored' && page.isStored === false) return false;
      if (storageFilter === 'scratchpad' && page.isStored !== false) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = page.title.toLowerCase().includes(query);
        const matchContent = page.content.toLowerCase().includes(query);
        return matchTitle || matchContent;
      }
      return true;
    });
  }, [notionPages, storageFilter, searchQuery]);

  // Recents carousel pages (first 6 pages or tagged recent)
  const recentPages = useMemo(() => {
    return notionPages.slice(0, 6);
  }, [notionPages]);

  // Favourites pages (top-level favorites)
  const favoritePages = useMemo(() => {
    return filteredPages.filter(p => p.isFavorite && !p.parentId);
  }, [filteredPages]);

  // Private pages (top-level non-favorites)
  const privatePages = useMemo(() => {
    return filteredPages.filter(p => !p.isFavorite && !p.parentId);
  }, [filteredPages]);

  // Handle creating a new page
  const handleCreateNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const created = createNotionPage({
      title: newPageTitle.trim(),
      icon: newPageIcon || '📄',
      content: `# ${newPageTitle.trim()}\n\nStart writing notes or rough calculations here...`,
      isFavorite: newPageSection === 'favorites',
      isStored: newPageIsStored,
      section: newPageSection,
      parentId: newPageParentId
    });

    // Reset form
    setNewPageTitle('');
    setNewPageIcon('📄');
    setNewPageSection('private');
    setNewPageIsStored(true);
    setNewPageParentId(undefined);
    setShowNewPageModal(false);

    // Open newly created page
    if (created && created.id) {
      openNotionPage(created.id);
    }
  };

  // Quick prompt for AI
  const handleAiAsk = () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      const p = aiPrompt.toLowerCase();
      let res = '';
      if (p.includes('neet') || p.includes('biology') || p.includes('physics')) {
        res = `### 📚 NEET High-Yield Summary\n- **Formula / Concept**: Focus on high-frequency NCERT questions.\n- **Quick Revision**: Review chapter test mistakes in Mock Tests tab.\n- **Resource**: Free question bank on selfstudys.com.`;
      } else if (p.includes('scratch') || p.includes('formula') || p.includes('calc')) {
        res = `### 🧮 Ephemeral Calculation\n- Work Done = F × d × cos(θ)\n- Quick note saved to scratchpad. You can click 'Store to Workspace' if you need it permanently!`;
      } else {
        res = `### ✨ Notion AI Draft\nHere is an organized structure for "${aiPrompt}":\n\n1. **Objective & Goals**\n2. **Action Items & Checkpoints**\n3. **Key Resources & Reference Links**\n\n*Click below to insert this into a new page or scratchpad!*`;
      }
      setAiResponse(res);
      setIsAiLoading(false);
    }, 600);
  };

  // Create page from AI response
  const handleCreateFromAi = (asStored: boolean) => {
    if (!aiResponse) return;
    const created = createNotionPage({
      title: aiPrompt ? aiPrompt.slice(0, 30) : 'AI Generated Note',
      icon: '✨',
      content: aiResponse,
      isFavorite: false,
      isStored: asStored,
      section: 'private'
    });
    setShowAiModal(false);
    setAiPrompt('');
    setAiResponse(null);
    if (created && created.id) {
      openNotionPage(created.id);
    }
  };

  // Count stats
  const totalCount = notionPages.length;
  const storedCount = notionPages.filter(p => p.isStored !== false).length;
  const scratchpadCount = notionPages.filter(p => p.isStored === false).length;

  // Render individual page item node (supports nested subpages)
  const renderPageItem = (page: NotionPage, depth = 0): React.ReactNode => {
    const hasSubpages = page.subPageIds && page.subPageIds.length > 0;
    const isExpanded = !!expandedPageIds[page.id];
    const isScratch = page.isStored === false;

    // Find child pages
    const subpages = hasSubpages
      ? notionPages.filter(p => page.subPageIds?.includes(p.id))
      : [];

    return (
      <div key={page.id} className="group flex flex-col">
        <div
          onClick={() => openNotionPage(page.id)}
          className={`flex items-center justify-between py-2 px-2.5 rounded-xl cursor-pointer transition-colors select-none ${
            activeMenuPageId === page.id
              ? 'bg-[#2a2a2a]'
              : 'hover:bg-[#242424]'
          }`}
          style={{ paddingLeft: `${depth * 18 + 10}px` }}
        >
          {/* Left Title & Icon */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Expand / Collapse Chevron */}
            {hasSubpages ? (
              <button
                onClick={(e) => toggleExpand(page.id, e)}
                className="p-1 rounded-md hover:bg-[#333333] text-slate-400 hover:text-white transition-transform"
              >
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            ) : (
              <span className="w-3.5 inline-block" />
            )}

            {/* Page Icon */}
            <span className="text-base shrink-0 leading-none">
              {page.icon || '📄'}
            </span>

            {/* Page Title */}
            <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
              {page.title}
            </span>

            {/* Subpage indicator badge */}
            {hasSubpages && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#303030] text-slate-400 shrink-0">
                {subpages.length} sub-pages
              </span>
            )}

            {/* Ephemeral Scratchpad badge */}
            {isScratch && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold shrink-0 border border-amber-500/30">
                Scratchpad (Temp)
              </span>
            )}
          </div>

          {/* Right Action Icons (••• and +) */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {/* Options Menu Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuPageId(activeMenuPageId === page.id ? null : page.id);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#333333]"
                title="Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Context Popup */}
              {activeMenuPageId === page.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 z-30 w-52 bg-[#252525] border border-[#383838] rounded-2xl p-1.5 shadow-2xl space-y-1 animate-in fade-in duration-150"
                >
                  {/* Toggle Favorite */}
                  <button
                    onClick={() => {
                      toggleFavoriteNotionPage(page.id);
                      setActiveMenuPageId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#303030] transition-colors text-left"
                  >
                    <Star className={`w-3.5 h-3.5 ${page.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                    <span>{page.isFavorite ? 'Remove from Favourites' : 'Add to Favourites'}</span>
                  </button>

                  {/* Store / Do Not Store Toggle */}
                  <button
                    onClick={() => {
                      togglePageStorage(page.id);
                      setActiveMenuPageId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#303030] transition-colors text-left"
                  >
                    {isScratch ? (
                      <>
                        <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-sky-400 font-semibold">Store to Workspace</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-300 font-medium">Convert to Scratchpad</span>
                      </>
                    )}
                  </button>

                  {/* Add Sub-Page */}
                  <button
                    onClick={() => {
                      setNewPageParentId(page.id);
                      setNewPageSection(page.section);
                      setShowNewPageModal(true);
                      setActiveMenuPageId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#303030] transition-colors text-left"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add Sub-Page</span>
                  </button>

                  <div className="h-px bg-[#353535] my-1" />

                  {/* Delete */}
                  <button
                    onClick={() => {
                      deleteNotionPage(page.id);
                      setActiveMenuPageId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Page</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Add Sub-Page button (+) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNewPageParentId(page.id);
                setNewPageSection(page.section);
                setShowNewPageModal(true);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#333333]"
              title="Add Sub-page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nested Sub-pages list */}
        {hasSubpages && isExpanded && (
          <div className="space-y-0.5 border-l border-[#353535] ml-4">
            {subpages.map(sub => renderPageItem(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[85vh] bg-[#191919] text-slate-100 rounded-3xl border border-[#2b2b2b] shadow-2xl overflow-hidden flex flex-col font-sans">
      {/* =========================================================================
          NOTION TOP PILL NAVIGATION BAR (Matches Notion Mobile Screenshot)
          Avatar [R] | Home [🏠] | Comments [💬] | Calendar [📅] | Inbox [📥]
      ========================================================================= */}
      <div className="bg-[#202020] border-b border-[#2e2e2e] px-4 py-2.5 flex items-center justify-between">
        {/* Left Workspace Switcher */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            R
          </div>
          <div className="flex items-center gap-1 cursor-pointer select-none">
            <span className="text-sm font-semibold text-slate-100 tracking-tight">Ravi's Notion</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('home')}
            title="Home"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#2b2b2b] transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAiModal(true)}
            title="Ask AI Assistant"
            className="p-2 rounded-xl text-sky-400 hover:text-sky-300 hover:bg-[#2b2b2b] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            title="Calendar"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#2b2b2b] transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {}}
            title="Inbox / Updates"
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#2b2b2b] transition-colors"
          >
            <Inbox className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          STORAGE OPTION CONTROLS (Permanent Store vs Ephemeral Scratchpad)
      ========================================================================= */}
      <div className="bg-[#202020]/70 px-4 py-3 border-b border-[#2b2b2b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Storage Tabs */}
        <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-[#2e2e2e]">
          <button
            onClick={() => setStorageFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              storageFilter === 'all'
                ? 'bg-[#2a2a2a] text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Pages ({totalCount})
          </button>
          <button
            onClick={() => setStorageFilter('stored')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              storageFilter === 'stored'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3 h-3 text-sky-400" />
            <span>Stored in Workspace ({storedCount})</span>
          </button>
          <button
            onClick={() => setStorageFilter('scratchpad')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              storageFilter === 'scratchpad'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Scratchpads (Do Not Store) ({scratchpadCount})</span>
          </button>
        </div>

        {/* Quick New Page Button */}
        <button
          onClick={() => {
            setNewPageIsStored(storageFilter !== 'scratchpad');
            setShowNewPageModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Page</span>
        </button>
      </div>

      {/* Ephemeral Scratchpad Info Alert if Scratchpad filter is active */}
      {storageFilter === 'scratchpad' && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Scratchpad Mode Active:</strong> Notes created here are temporary for rough work and won't be saved to device disk storage unless you click "Store to Workspace".
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-24">
        {/* =========================================================================
            RECENTS CAROUSEL (Horizontal Scrolling Cards as in user screenshot)
        ========================================================================= */}
        {recentPages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recents</span>
              <span className="text-[11px] text-slate-500">{recentPages.length} active</span>
            </div>

            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1">
              {recentPages.map(page => {
                const isScratch = page.isStored === false;
                return (
                  <div
                    key={page.id}
                    onClick={() => openNotionPage(page.id)}
                    className="flex-shrink-0 w-36 sm:w-44 bg-[#232323] hover:bg-[#2a2a2a] border border-[#303030] hover:border-slate-600 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all shadow-sm group select-none"
                  >
                    <div>
                      {/* Icon header */}
                      <div className="w-9 h-9 rounded-xl bg-[#2e2e2e] flex items-center justify-center text-lg mb-3 shadow-inner group-hover:scale-105 transition-transform">
                        {page.icon || '📄'}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-2 leading-snug">
                        {page.title}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#333333] flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 capitalize truncate max-w-[70px]">
                        {page.section}
                      </span>
                      {isScratch ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-medium">
                          Scratchpad
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-medium">
                          Stored
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            FAVOURITES SECTION (Matches User Screenshot)
        ========================================================================= */}
        {favoritePages.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => setFavouritesOpen(!favouritesOpen)}
              className="w-full flex items-center justify-between py-1.5 px-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#222222] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${favouritesOpen ? '' : '-rotate-90'}`} />
                <span>Favourites</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#2a2a2a] text-slate-400">
                  {favoritePages.length}
                </span>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setNewPageSection('favorites');
                  setShowNewPageModal(true);
                }}
                className="p-1 rounded-lg hover:bg-[#303030] text-slate-400 hover:text-white"
                title="Add to Favourites"
              >
                <Plus className="w-3.5 h-3.5" />
              </div>
            </button>

            {favouritesOpen && (
              <div className="space-y-0.5 pl-1">
                {favoritePages.map(page => renderPageItem(page))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            PRIVATE SECTION (Matches User Screenshot)
        ========================================================================= */}
        <div className="space-y-1">
          <button
            onClick={() => setPrivateOpen(!privateOpen)}
            className="w-full flex items-center justify-between py-1.5 px-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#222222] transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${privateOpen ? '' : '-rotate-90'}`} />
              <span>Private</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#2a2a2a] text-slate-400">
                {privatePages.length}
              </span>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setNewPageSection('private');
                setShowNewPageModal(true);
              }}
              className="p-1 rounded-lg hover:bg-[#303030] text-slate-400 hover:text-white"
              title="Add Private Page"
            >
              <Plus className="w-3.5 h-3.5" />
            </div>
          </button>

          {privateOpen && (
            <div className="space-y-0.5 pl-1">
              {privatePages.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No private pages found in current filter.
                </div>
              ) : (
                privatePages.map(page => renderPageItem(page))
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM NOTION ACTION BAR (Matches User Screenshot)
          [🔍 Search] | [✨ Ask AI] | [📝 New Page]
      ========================================================================= */}
      <div className="bg-[#202020] border-t border-[#2e2e2e] px-4 py-3 flex items-center justify-between gap-3 select-none">
        {/* Search button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#171717] hover:bg-[#272727] text-slate-300 text-xs font-medium border border-[#303030] transition-colors flex-1"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>Search notes, NEET links, scratchpads...</span>
        </button>

        {/* Ask AI button */}
        <button
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Ask AI</span>
        </button>

        {/* New Page button */}
        <button
          onClick={() => {
            setNewPageIsStored(true);
            setShowNewPageModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Page</span>
        </button>
      </div>

      {/* =========================================================================
          NEW PAGE CREATION MODAL WITH STORAGE OPTION SELECTION
      ========================================================================= */}
      {showNewPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#202020] border border-[#353535] rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{newPageIcon}</span>
                <h3 className="text-base font-bold text-white">Create New Page</h3>
              </div>
              <button
                onClick={() => setShowNewPageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPage} className="space-y-4">
              {/* Title and Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Page Title
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPageIcon}
                    onChange={(e) => setNewPageIcon(e.target.value)}
                    placeholder="📄"
                    className="w-12 text-center p-2.5 rounded-xl bg-[#151515] border border-[#353535] text-white text-base focus:outline-none focus:border-sky-500"
                    maxLength={2}
                  />
                  <input
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="e.g. NEET Biology Mock Analysis"
                    autoFocus
                    required
                    className="flex-1 p-2.5 rounded-xl bg-[#151515] border border-[#353535] text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* CORE REQUIREMENT: Option to Store or To Not Store the Note */}
              <div className="p-3 rounded-2xl bg-[#161616] border border-[#2d2d2d] space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Storage Destination & Persistence
                </label>
                <p className="text-[11px] text-slate-400">
                  Choose whether this note should be stored permanently or kept as an ephemeral scratchpad.
                </p>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {/* Option 1: Store in Workspace */}
                  <label
                    onClick={() => setNewPageIsStored(true)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      newPageIsStored
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-[#1e1e1e] border-[#303030] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="storageOption"
                      checked={newPageIsStored}
                      onChange={() => setNewPageIsStored(true)}
                      className="mt-1 accent-sky-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>💾 Store in Workspace (Permanent)</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Persisted on your device across reloads. Synced with your notes database.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Scratchpad (Do Not Store) */}
                  <label
                    onClick={() => setNewPageIsStored(false)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      !newPageIsStored
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-[#1e1e1e] border-[#303030] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="storageOption"
                      checked={!newPageIsStored}
                      onChange={() => setNewPageIsStored(false)}
                      className="mt-1 accent-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>📝 Scratchpad (Do Not Store)</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Temporary rough work, scratch calculations, or temporary links. Won't clutter your device disk unless saved later.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section selection */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewPageSection('private')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                    newPageSection === 'private'
                      ? 'bg-slate-700 border-slate-500 text-white'
                      : 'bg-[#151515] border-[#353535] text-slate-400'
                  }`}
                >
                  Private Section
                </button>
                <button
                  type="button"
                  onClick={() => setNewPageSection('favorites')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                    newPageSection === 'favorites'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-[#151515] border-[#353535] text-slate-400'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Favourites</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPageModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPageTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SEARCH MODAL
      ========================================================================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#202020] border border-[#353535] rounded-3xl p-5 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#141414] border border-[#333333]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all notes, NEET links, games, formulas..."
                autoFocus
                className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="max-h-72 overflow-y-auto space-y-1">
              {filteredPages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No notes found matching "{searchQuery}"
                </div>
              ) : (
                filteredPages.map(page => (
                  <div
                    key={page.id}
                    onClick={() => {
                      setShowSearchModal(false);
                      openNotionPage(page.id);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#282828] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{page.icon || '📄'}</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">{page.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                      <span className="text-slate-400 capitalize">{page.section}</span>
                      {page.isStored === false ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Scratchpad</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">Stored</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#2e2e2e]">
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ASK AI MODAL
      ========================================================================= */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#202020] border border-[#353535] rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Notion AI Assistant</h3>
                  <p className="text-[11px] text-slate-400">Summarize, generate NEET outlines, or draft notes</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  setAiResponse(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Notion AI: 'Summarize NEET Organic Chemistry reactions' or 'Create a formula scratchpad'..."
                rows={3}
                className="w-full p-3 rounded-xl bg-[#151515] border border-[#333333] text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAiPrompt('High yield NEET Physics formula sheet')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-[#272727] text-slate-300 hover:text-white"
                  >
                    ⚡ NEET Physics
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiPrompt('Scratchpad for rough mock test calculations')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-[#272727] text-slate-300 hover:text-white"
                  >
                    📝 Scratchpad
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAiAsk}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiLoading ? 'Generating...' : 'Ask AI'}</span>
                </button>
              </div>

              {/* AI Output preview */}
              {aiResponse && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#171717] border border-purple-500/30 space-y-3">
                  <div className="text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                    {aiResponse}
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2d2d2d]">
                    <button
                      onClick={() => handleCreateFromAi(false)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-medium border border-amber-500/30"
                    >
                      Save as Scratchpad (Do Not Store)
                    </button>
                    <button
                      onClick={() => handleCreateFromAi(true)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 text-white hover:bg-sky-400 text-xs font-bold"
                    >
                      Store in Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

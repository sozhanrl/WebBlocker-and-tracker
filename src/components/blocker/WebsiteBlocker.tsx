import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { getNativeBridge, PermissionStatus, isNativePlatform } from '../../lib/nativeBridge';
import {
  ADULT_18_PLUS_DOMAINS,
  HENTAI_ANIME_DOMAINS,
  HENTAI_MANHWA_DOMAINS,
  HENTAI_MANGA_DOMAINS,
  DOUJINSHI_DOMAINS,
  getDomainsForCategories
} from '../../lib/adultCategories';
import { PermissionDiagnosticsModal } from '../common/PermissionDiagnosticsModal';
import {
  Globe,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Search,
  Power,
  Info,
  Sliders,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const ADULT_CATEGORIES = [
  'Adult Content',
  '18+ Adult & Porn',
  'Hentai (Anime & Streaming)',
  'Hentai Manhwa (Pornhwa 18+)',
  'Hentai Manga (18+)',
  'Doujinshi / Dojin (18+)'
];

interface ChecklistCategoryItem {
  id: string;
  category: string;
  title: string;
  icon: string;
  description: string;
  keyDomains: string[];
  totalCount: number;
  badgeClass: string;
  borderActive: string;
}

const CHECKLIST_CATEGORIES: ChecklistCategoryItem[] = [
  {
    id: 'cat-18plus',
    category: '18+ Adult & Porn',
    title: '18+ Adult & Porn blocking',
    icon: '🔞',
    description: 'Top adult video/tube, live streaming cams, and explicit portals',
    keyDomains: ['pornhub.com', 'xvideos.com', 'spankbang.com', 'xnxx.com', 'chaturbate.com'],
    totalCount: ADULT_18_PLUS_DOMAINS.length,
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    borderActive: 'border-rose-500/40 bg-rose-950/20'
  },
  {
    id: 'cat-hentai-anime',
    category: 'Hentai (Anime & Streaming)',
    title: 'Hentai (Anime & Streaming) blocking',
    icon: '🌸',
    description: 'Hentai anime series, streaming hubs, and video archives',
    keyDomains: ['watchhentai.net', 'hentai20.io', 'hentai20.lol', 'hitomi.la', 'hanime.tv'],
    totalCount: HENTAI_ANIME_DOMAINS.length,
    badgeClass: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    borderActive: 'border-fuchsia-500/40 bg-fuchsia-950/20'
  },
  {
    id: 'cat-manhwa',
    category: 'Hentai Manhwa (Pornhwa 18+)',
    title: 'Hentai Manhwa (Pornhwa 18+) blocking',
    icon: '🎨',
    description: 'Adult Korean webtoons, 18+ manhwa, and pornhwa comic websites',
    keyDomains: ['manytoon.com', 'manhwa18.com', 'toongod.org', 'adultwebtoon.com', 'toonily.com'],
    totalCount: HENTAI_MANHWA_DOMAINS.length,
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    borderActive: 'border-amber-500/40 bg-amber-950/20'
  },
  {
    id: 'cat-manga',
    category: 'Hentai Manga (18+)',
    title: 'Hentai Manga (18+) blocking',
    icon: '📖',
    description: 'Adult Japanese manga, eromanga reader sites, and scanlation archives',
    keyDomains: ['nhentai.net', 'hentai20.io', 'hentai20.lol', 'hentaimanga.pro', 'hentaifox.com'],
    totalCount: HENTAI_MANGA_DOMAINS.length,
    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    borderActive: 'border-violet-500/40 bg-violet-950/20'
  },
  {
    id: 'cat-doujin',
    category: 'Doujinshi / Dojin (18+)',
    title: 'Doujinshi / Dojin (18+) blocking',
    icon: '📑',
    description: 'Top doujin, fan-comics, self-published 18+ doujinshi archives, and galleries',
    keyDomains: ['hitomi.la', 'doujins.com', 'e-hentai.org', 'tsumino.com', 'doujindesu.tv'],
    totalCount: DOUJINSHI_DOMAINS.length,
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    borderActive: 'border-pink-500/40 bg-pink-950/20'
  }
];

export const WebsiteBlocker: React.FC = () => {
  const {
    blockedWebsites,
    addBlockedWebsite,
    removeBlockedWebsitesByCategories,
    removeBlockedWebsite,
    toggleWebsiteBlocked,
    selected18PlusCategories,
    setSelected18PlusCategories,
    toggle18PlusCategory,
    isAdultShieldEnabled,
    setIsAdultShieldEnabled
  } = useApp();

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Social Media');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [displayLimit, setDisplayLimit] = useState(50);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);
  const domainInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddForm) {
      setTimeout(() => {
        domainInputRef.current?.focus();
      }, 100);
    }
  }, [showAddForm]);

  const [vpnStatus, setVpnStatus] = useState<PermissionStatus | null>(null);
  const [isVpnLoading, setIsVpnLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isNative = isNativePlatform();

  const customCategories = [
    'Social Media',
    'Entertainment',
    'Games',
    'Short Videos',
    'News / Surfing',
    'Shopping',
    'Manga & Webtoons',
    'Other'
  ];

  // Purge any legacy bulk adult domains from blockedWebsites on mount so user's list stays clean
  useEffect(() => {
    const hasLegacyBulk = blockedWebsites.some(
      site => site.id?.startsWith('web-bulk-') || ADULT_CATEGORIES.includes(site.category)
    );
    if (hasLegacyBulk) {
      removeBlockedWebsitesByCategories(ADULT_CATEGORIES);
    }
  }, [blockedWebsites, removeBlockedWebsitesByCategories]);

  const checkVpnStatus = useCallback(async () => {
    try {
      const bridge = getNativeBridge();
      const status = await bridge.checkPermissions();
      setVpnStatus(status);
    } catch (e) {
      console.warn('Failed to check VPN status:', e);
    }
  }, []);

  useEffect(() => {
    checkVpnStatus();
    const interval = setInterval(checkVpnStatus, 4000);
    return () => clearInterval(interval);
  }, [checkVpnStatus]);

  const handleStartVpn = async () => {
    try {
      setIsVpnLoading(true);
      setStatusMessage('Starting on-device DNS filter...');
      const bridge = getNativeBridge();
      const res = await bridge.startVpnProtection();
      if (res.needsPermission) {
        setStatusMessage('Please accept the Android VPN connection prompt.');
      } else if (res.started) {
        setStatusMessage('VPN Domain Filter Active!');
      }
      setTimeout(checkVpnStatus, 1500);
    } catch (e: any) {
      console.error(e);
      setStatusMessage(`Failed to start VPN: ${e.message || 'Unknown error'}`);
    } finally {
      setIsVpnLoading(false);
    }
  };

  const handleStopVpn = async () => {
    try {
      setIsVpnLoading(true);
      setStatusMessage('Stopping DNS filter...');
      const bridge = getNativeBridge();
      await bridge.stopVpnProtection();
      setStatusMessage('VPN protection stopped.');
      setTimeout(checkVpnStatus, 1500);
    } catch (e: any) {
      console.error(e);
      setStatusMessage('Failed to stop VPN.');
    } finally {
      setIsVpnLoading(false);
    }
  };

  const normalizeDomainInput = (raw: string): string => {
    let clean = raw.trim().toLowerCase();
    clean = clean.replace(/^(https?:\/\/)/, '');
    clean = clean.split('/')[0];
    clean = clean.split('?')[0];
    clean = clean.split('#')[0];
    if (clean.startsWith('www.')) clean = clean.substring(4);
    if (clean.startsWith('m.')) clean = clean.substring(2);
    if (clean.startsWith('amp.')) clean = clean.substring(4);
    return clean;
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website domain (e.g. twitter.com or reddit.com)');
      return;
    }

    const cleanDomain = normalizeDomainInput(url);
    if (!cleanDomain.includes('.') || cleanDomain.length < 3) {
      setError('Please enter a valid domain format (e.g. reddit.com)');
      return;
    }

    const existing = blockedWebsites.find(w => normalizeDomainInput(w.url) === cleanDomain);
    if (existing) {
      setError(`Domain "${cleanDomain}" is already in your blocklist.`);
      return;
    }

    addBlockedWebsite(cleanDomain, name || cleanDomain, category);
    setUrl('');
    setName('');
    setShowAddForm(false);
    setError(null);
    setStatusMessage(`Domain "${cleanDomain}" added and blocked.`);
  };

  // Instant toggle for Master 18+ Shield (ZERO DELAY)
  const handleToggleMasterShield = () => {
    const nextState = !isAdultShieldEnabled;
    setIsAdultShieldEnabled(nextState);
    if (nextState) {
      setStatusMessage('18+ & Hentai Shield activated immediately.');
    } else {
      setStatusMessage('18+ & Hentai Shield deactivated immediately.');
    }
  };

  // Checklist Actions (ZERO DELAY)
  const handleSelectAllCategories = () => {
    const all = CHECKLIST_CATEGORIES.map(c => c.category);
    setSelected18PlusCategories(all);
    if (!isAdultShieldEnabled) {
      setIsAdultShieldEnabled(true);
    }
    setStatusMessage('All 5 18+ categories selected.');
  };

  const handleClearAllCategories = () => {
    setSelected18PlusCategories([]);
    setStatusMessage('All 18+ categories deselected immediately.');
  };

  // Filter custom websites ONLY - strip out legacy adult bulk items
  const customWebsites = useMemo(() => {
    return blockedWebsites.filter(site => {
      if (!site) return false;
      if (site.id?.startsWith('web-bulk-')) return false;
      if (ADULT_CATEGORIES.includes(site.category)) return false;
      return true;
    });
  }, [blockedWebsites]);

  const activeCuratedDomainsCount = useMemo(() => {
    if (!isAdultShieldEnabled) return 0;
    return getDomainsForCategories(selected18PlusCategories).length;
  }, [isAdultShieldEnabled, selected18PlusCategories]);

  const customBlockedCount = useMemo(() => {
    return customWebsites.filter(w => w.isBlocked).length;
  }, [customWebsites]);

  const totalProtectedCount = activeCuratedDomainsCount + customBlockedCount;

  const isRunning = !!vpnStatus?.isVpnRunning;
  const isGranted = !!vpnStatus?.hasVpnPermission;

  const vpnEngineStatus = useMemo(() => {
    if (!isNative) return 'Web Simulator';
    if (!vpnStatus?.hasVpnPermission) return 'Permission Required';
    if (vpnStatus.anotherVpnActive) return 'Another VPN Active';
    if (vpnStatus.isVpnStarting) return 'Starting';
    if (vpnStatus.isVpnRunning) {
      return totalProtectedCount === 0 ? 'No Active Domains' : 'Running';
    }
    if (vpnStatus.lastVpnError) return 'DNS Engine Error';
    return 'Stopped';
  }, [isNative, vpnStatus, totalProtectedCount]);

  const filteredCustomWebsites = useMemo(() => {
    return customWebsites.filter(site => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === 'all' || site.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [customWebsites, searchTerm, selectedCategoryFilter]);

  const visibleCustomWebsites = useMemo(() => {
    return filteredCustomWebsites.slice(0, displayLimit);
  }, [filteredCustomWebsites, displayLimit]);

  return (
    <div className="space-y-4 max-w-full pb-12 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <Card className="p-4 sm:p-5 space-y-4 bg-gradient-to-br from-[#1C2541] to-[#0B132B] border-sky-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-400 shrink-0" />
                <span>Website &amp; Domain Blocker</span>
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  isRunning
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isRunning ? '● VPN PROTECTION ACTIVE' : '○ VPN PROTECTION STOPPED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              On-device loopback DNS sinkhole intercepts configured domains and returns 127.0.0.1
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            {isRunning ? (
              <Button
                variant="danger"
                size="sm"
                onClick={handleStopVpn}
                disabled={isVpnLoading}
                icon={<Power className="w-4 h-4" />}
                className="flex-1 sm:flex-none justify-center text-xs"
              >
                Stop Protection
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartVpn}
                disabled={isVpnLoading}
                icon={<Power className="w-4 h-4" />}
                className="flex-1 sm:flex-none justify-center text-xs"
              >
                Start Protection
              </Button>
            )}

            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              variant="secondary"
              icon={showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              className="text-xs shrink-0"
            >
              {showAddForm ? 'Close' : 'Add Domain'}
            </Button>

            <Button
              onClick={() => setShowDiagnostics(true)}
              size="sm"
              variant="ghost"
              icon={<Sliders className="w-3.5 h-3.5" />}
              className="text-xs shrink-0 text-slate-300"
              title="View system diagnostics"
            >
              Diagnostics
            </Button>
          </div>
        </div>

        {statusMessage && (
          <p className="text-xs text-sky-400 font-medium animate-pulse">{statusMessage}</p>
        )}

        {/* Diagnostic Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-white/5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">VPN Permission</span>
            <span className={`text-xs font-bold ${isGranted ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isGranted ? 'Granted' : 'Needs Prompt'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">Engine State</span>
            <span
              className={`text-xs font-bold ${
                isRunning ? 'text-emerald-400' : vpnEngineStatus === 'Another VPN Active' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              {vpnEngineStatus}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">Protected Domains</span>
            <span className="text-xs font-bold text-sky-400">
              {totalProtectedCount.toLocaleString()} Total
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">18+ Shield Status</span>
            <span
              className={`text-xs font-bold ${
                isAdultShieldEnabled && selected18PlusCategories.length > 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {isAdultShieldEnabled && selected18PlusCategories.length > 0
                ? `${selected18PlusCategories.length}/5 Packs Active`
                : 'Shield Off'}
            </span>
          </div>
        </div>
      </Card>

      {/* Add Website Form - EXPANDS DIRECTLY BELOW WEBSITE & DOMAIN BLOCKER */}
      {showAddForm && (
        <Card className="p-4 sm:p-5 border-sky-500/30 bg-gradient-to-br from-[#1C2541] to-[#0B132B] shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Add Custom Website Domain</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAddCustom} className="space-y-3">
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Domain Name *</label>
                <input
                  ref={domainInputRef}
                  type="text"
                  placeholder="e.g. reddit.com or twitter.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Friendly Label</label>
                <input
                  type="text"
                  placeholder="e.g. Reddit Frontpage"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  {customCategories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add Domain
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* DNS Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span>On-Device DNS Sinkhole Filtering</span>
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All configured domains return <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">127.0.0.1</code> locally. For absolute protection, disable &lsquo;Secure DNS&rsquo; / &lsquo;Private DNS&rsquo; in your browser and phone settings.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SINGLE CONSOLIDATED 18+ & HENTAI SHIELD CARD (WITH SAMURAI ARTWORK & CHECKLIST) */}
      {/* ========================================================================= */}
      <Card
        className={`overflow-hidden border transition-all ${
          isAdultShieldEnabled && selected18PlusCategories.length > 0
            ? 'border-rose-500/40 bg-gradient-to-br from-[#1C2541] via-[#1a1429] to-[#0B132B] shadow-lg shadow-rose-950/20'
            : 'border-slate-800 bg-[#1C2541]/70'
        }`}
      >
        {/* Banner with Sekiro Samurai Mascot Artwork */}
        <div className="relative bg-gradient-to-r from-black via-slate-950 to-rose-950/50 p-4 sm:p-5 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Samurai Mascot Image */}
            <div className="relative shrink-0 group">
              <div className="w-24 h-36 sm:w-28 sm:h-44 rounded-xl overflow-hidden border-2 border-rose-500/50 shadow-md shadow-rose-500/20 bg-black flex items-center justify-center">
                <img
                  src="/hesitation_is_defeat.png"
                  alt="Hesitation is Defeat - Sekiro Blocker Mascot"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback if image path differs
                    (e.currentTarget as HTMLImageElement).src = '/img_blocker_mascot.jpg';
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full border border-rose-400 uppercase shadow">
                死 DEFEAT
              </div>
            </div>

            {/* Mascot Headline & Shield Controls */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  HESITATION IS DEFEAT
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isAdultShieldEnabled && selected18PlusCategories.length > 0
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isAdultShieldEnabled && selected18PlusCategories.length > 0
                    ? `${activeCuratedDomainsCount} Domains Sinkholed`
                    : 'Shield Disabled'}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
                <span>18+ Adult &amp; Porn Shield</span>
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                One-touch 18+ and adult content protection. Blocks explicit adult tubes, hentai anime streaming, manhwa, manga, and doujinshi archives with zero delay.
              </p>

              {/* Master Switch Row */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={handleToggleMasterShield}
                  className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isAdultShieldEnabled
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  title={isAdultShieldEnabled ? 'Disable 18+ Shield' : 'Enable 18+ Shield'}
                >
                  <Power className="w-4 h-4" />
                  <span>{isAdultShieldEnabled ? '18+ Shield ACTIVE (Click to Turn Off)' : 'Turn ON 18+ Shield'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isChecklistExpanded ? 'Hide Categories' : 'Customize Categories'}</span>
                  {isChecklistExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Retractable Category Checklist Section */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Retractable Accordion Header */}
          <div
            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors select-none"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                18+ Category Selector Checklist
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {selected18PlusCategories.length} of {CHECKLIST_CATEGORIES.length} selected
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isChecklistExpanded && (
                <div className="flex items-center gap-1 mr-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllCategories}
                    className="text-[11px] text-rose-300 hover:bg-rose-500/10 px-2 py-0.5 h-auto"
                  >
                    Select All
                  </Button>
                  <span className="text-slate-600 text-xs">|</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllCategories}
                    className="text-[11px] text-slate-400 hover:bg-slate-800 px-2 py-0.5 h-auto"
                  >
                    Clear All
                  </Button>
                </div>
              )}
              {isChecklistExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {/* Retractable Category Items (Titles only - NO website lists or individual switches!) */}
          {isChecklistExpanded && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
              {CHECKLIST_CATEGORIES.map(cat => {
                const isChecked = selected18PlusCategories.includes(cat.category);
                const isEffectivelyActive = isAdultShieldEnabled && isChecked;

                return (
                  <div
                    key={cat.id}
                    onClick={() => toggle18PlusCategory(cat.category)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isEffectivelyActive
                        ? `${cat.borderActive} shadow-sm`
                        : isChecked
                        ? 'border-slate-700 bg-slate-900/90'
                        : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
                    }`}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                  >
                    {/* Left: Checkbox + Icon + Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0">
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-slate-600 bg-slate-800/80 hover:border-slate-400 transition-colors" />
                        )}
                      </div>

                      <span className="text-xl select-none shrink-0">{cat.icon}</span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                            {cat.title}
                          </span>
                          {isEffectivelyActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Clean Domain count badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cat.badgeClass}`}>
                      {cat.totalCount} Domains
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Smart Keyword Guard Callout */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/20 flex items-start gap-3 text-xs text-slate-300 mt-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>Smart On-Device Wildcard Keyword Guard</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When 18+ Shield is active, any browser URL containing keywords (such as <code className="text-rose-300 bg-slate-800 px-1 py-0.5 rounded">hentai</code>, <code className="text-rose-300 bg-slate-800 px-1 py-0.5 rounded">manhwa18</code>, <code className="text-rose-300 bg-slate-800 px-1 py-0.5 rounded">manga18</code>, <code className="text-rose-300 bg-slate-800 px-1 py-0.5 rounded">pornhwa</code>, <code className="text-rose-300 bg-slate-800 px-1 py-0.5 rounded">doujin</code>, <code className="text-rose-300 bg-slate-800 px-1 py-0.5 rounded">dojin</code>, <code className="text-rose-300 bg-slate-800 px-1 py-0.5 rounded">porn</code>, <code className="text-rose-300 bg-slate-800 px-1 py-0.5 rounded">xxx</code>) is immediately intercepted and blocked, neutralizing mirror sites automatically.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* CUSTOM DOMAINS BLOCKLIST (CLEAN LIST - USER ADDED ONLY) */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Custom Website Filters</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Specific distracting domains added by you (e.g. social media, games, news).
            </p>
          </div>

          <Button
            onClick={() => {
              setShowAddForm(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            size="sm"
            variant="secondary"
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs self-start sm:self-auto"
          >
            Add Custom Domain
          </Button>
        </div>

        {/* Search & Filter Bar */}
        {customWebsites.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search custom domains..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setDisplayLimit(50);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={e => {
                setSelectedCategoryFilter(e.target.value);
                setDisplayLimit(50);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 shrink-0"
            >
              <option value="all">All Categories ({customWebsites.length})</option>
              {customCategories.map(cat => {
                const count = customWebsites.filter(w => w.category === cat).length;
                if (count === 0) return null;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Custom Domains Cards List */}
        <div className="space-y-2.5 max-w-full">
          {customWebsites.length === 0 ? (
            <Card className="p-8 text-center space-y-2 border-dashed border-slate-800">
              <Globe className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No Custom Domains Added</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Adult content is safely managed by the single 18+ checklist above. Use &ldquo;Add Custom Domain&rdquo; to block other specific websites like social media or games.
              </p>
            </Card>
          ) : filteredCustomWebsites.length === 0 ? (
            <Card className="p-6 text-center space-y-2">
              <p className="text-xs text-slate-400">No domains match your search or filter</p>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Showing {Math.min(visibleCustomWebsites.length, filteredCustomWebsites.length)} of {filteredCustomWebsites.length} custom domains
                </span>
                {selectedCategoryFilter !== 'all' && (
                  <button
                    onClick={() => setSelectedCategoryFilter('all')}
                    className="text-sky-400 hover:underline text-[11px]"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {visibleCustomWebsites.map(site => (
                <Card
                  key={site.id}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all min-w-0 ${
                    site.isBlocked
                      ? 'border-rose-500/30 bg-[#1C2541]/95 shadow-sm'
                      : 'bg-[#1C2541]/70 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs block">
                          {site.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 font-medium shrink-0">
                          {site.category}
                        </span>
                        {site.isBlocked && isRunning && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
                            Sinkholed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-full block opacity-75">
                        {site.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Instant Toggle Switch - ZERO 30s TIMER */}
                    <button
                      type="button"
                      onClick={() => toggleWebsiteBlocked(site.id)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        site.isBlocked ? 'bg-rose-500 justify-end' : 'bg-slate-700 justify-start'
                      }`}
                      title={site.isBlocked ? 'Unblock domain immediately' : 'Block domain immediately'}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                    </button>

                    {/* Instant Delete Button - ZERO 30s TIMER */}
                    <button
                      type="button"
                      onClick={() => removeBlockedWebsite(site.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                      title="Delete domain"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}

              {filteredCustomWebsites.length > displayLimit && (
                <div className="text-center pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDisplayLimit(prev => prev + 50)}
                    className="text-xs"
                  >
                    Load More Domains (+50)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Diagnostics Modal */}
      <PermissionDiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => {
          setShowDiagnostics(false);
          checkVpnStatus();
        }}
      />
    </div>
  );
};

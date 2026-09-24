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
  const [isChecklistExpanded, setIsChecklistExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('focusforge_18plus_checklist_expanded') === 'true';
    } catch {
      return false;
    }
  });

  const toggleChecklistExpanded = () => {
    setIsChecklistExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('focusforge_18plus_checklist_expanded', String(next));
      } catch {}
      return next;
    });
  };
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
      setSelected18PlusCategories(CHECKLIST_CATEGORIES.map(c => c.category));
      setStatusMessage('Hesitation is Defeat: 18+ Shield activated.');
    } else {
      setStatusMessage('18+ Shield deactivated.');
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
      {/* HESITATION IS DEFEAT - NEET ASPIRANT DEDICATED SHIELD CARD */}
      {/* ========================================================================= */}
      <Card
        className={`overflow-hidden border transition-all ${
          isAdultShieldEnabled
            ? 'border-rose-500/50 bg-gradient-to-br from-[#1C2541] via-[#1a1429] to-[#0B132B] shadow-xl shadow-rose-950/30'
            : 'border-slate-800 bg-[#1C2541]/70'
        }`}
      >
        <div className="relative bg-gradient-to-r from-black via-slate-950 to-rose-950/50 p-5 sm:p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            {/* Samurai Mascot Image with full visibility */}
            <div className="relative shrink-0 group">
              <div className="w-28 h-44 sm:w-32 sm:h-52 rounded-2xl overflow-hidden border-2 border-rose-500/60 shadow-lg shadow-rose-500/30 bg-black flex items-center justify-center p-1">
                <img
                  src="./hesitation_is_defeat.png"
                  alt="Hesitation is Defeat"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/hesitation_is_defeat.png';
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full border border-rose-400 uppercase shadow-md">
                死 DEFEAT
              </div>
            </div>

            {/* Mascot Headline & Personal NEET MBBS Goal */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-sm">
                  HESITATION IS DEFEAT
                </span>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                    isAdultShieldEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isAdultShieldEnabled ? 'Shield Active (Zero Distraction)' : 'Shield Disabled'}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  <span>Hesitation is Defeat</span>
                </h3>
                <p className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 mt-1">
                  You need to be Doctor MBBS Rajendira Sozhan P
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Absolute focus. No adult content, no manga or manhwa rabbit holes, no hesitation. Every second counts toward your white coat and stethoscope.
              </p>

              {/* Master Switch Button */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={handleToggleMasterShield}
                  className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
                    isAdultShieldEnabled
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  title={isAdultShieldEnabled ? 'Disable Shield' : 'Enable Shield'}
                >
                  <Power className="w-4 h-4" />
                  <span>{isAdultShieldEnabled ? '18+ Shield ACTIVE (Click to Turn Off)' : 'Turn ON 18+ Shield'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Keyword & Domain Guard Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950/60 border-t border-rose-500/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] font-medium text-slate-300">
              Automatic On-Device URL &amp; Keyword Sinkhole Active (18+, Hentai, Manhwa, Porn)
            </span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
            MBBS 2027
          </span>
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

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { getNativeBridge, PermissionStatus, isNativePlatform } from '../../lib/nativeBridge';
import { ADULT_CONTENT_DOMAINS } from '../../lib/adultContentList';
import { PermissionDiagnosticsModal } from '../common/PermissionDiagnosticsModal';
import {
  Globe,
  Plus,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Power,
  Info,
  AlertTriangle,
  Timer,
  CheckCircle2,
  X,
  Loader2,
  Sliders,
  Lock,
  RefreshCw
} from 'lucide-react';

export const WebsiteBlocker: React.FC = () => {
  const {
    blockedWebsites,
    addBlockedWebsite,
    bulkAddBlockedWebsites,
    removeBlockedWebsitesByCategory,
    removeBlockedWebsite,
    toggleWebsiteBlocked
  } = useApp();

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Adult Content');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [displayLimit, setDisplayLimit] = useState(50);

  const [vpnStatus, setVpnStatus] = useState<PermissionStatus | null>(null);
  const [isVpnLoading, setIsVpnLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isNative = isNativePlatform();

  // Adult Content Shield state & 30s unlock cooldown timer
  const [isShieldUnlocking, setIsShieldUnlocking] = useState(false);
  const [unlockSecondsLeft, setUnlockSecondsLeft] = useState(30);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const unlockTimerRef = useRef<any>(null);

  const categories = [
    'Adult Content',
    'Social Media',
    'Entertainment',
    'Games',
    'Short Videos',
    'Manga & Webtoons',
    'News / Surfing',
    'Shopping',
    'Other'
  ];

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

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearInterval(unlockTimerRef.current);
    };
  }, []);

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website domain (e.g. asurascans.com or youtube.com)');
      return;
    }

    const cleanDomain = normalizeDomainInput(url);
    if (!cleanDomain.includes('.') || cleanDomain.length < 3) {
      setError('Please enter a valid domain format (e.g. asurascans.com or instagram.com)');
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
  };

  // Adult Content Shield Actions
  const adultBlockedCount = useMemo(() => {
    return blockedWebsites.filter(w => w.category === 'Adult Content' && w.isBlocked).length;
  }, [blockedWebsites]);

  const isAdultShieldActive = adultBlockedCount > 0;

  const handleToggleAdultShield = () => {
    if (isAdultShieldActive) {
      if (isShieldUnlocking) {
        cancelShieldUnlock();
      } else {
        startShieldUnlock();
      }
    } else {
      setIsBulkLoading(true);
      setTimeout(() => {
        const payload = ADULT_CONTENT_DOMAINS.map(domain => ({
          url: domain,
          name: domain,
          category: 'Adult Content'
        }));
        bulkAddBlockedWebsites(payload);
        setIsBulkLoading(false);
        setStatusMessage(`Adult Content Shield active: ${payload.length.toLocaleString()} domains protected.`);
      }, 50);
    }
  };

  const startShieldUnlock = () => {
    setIsShieldUnlocking(true);
    setUnlockSecondsLeft(30);
    if (unlockTimerRef.current) clearInterval(unlockTimerRef.current);

    unlockTimerRef.current = setInterval(() => {
      setUnlockSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(unlockTimerRef.current!);
          removeBlockedWebsitesByCategory('Adult Content');
          setIsShieldUnlocking(false);
          setStatusMessage('Adult Content Shield deactivated.');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelShieldUnlock = () => {
    if (unlockTimerRef.current) clearInterval(unlockTimerRef.current);
    setIsShieldUnlocking(false);
    setUnlockSecondsLeft(30);
    setStatusMessage('Adult Content Shield remains locked and active.');
  };

  const isRunning = !!vpnStatus?.isVpnRunning;
  const isGranted = !!vpnStatus?.hasVpnPermission;
  const blockedCount = blockedWebsites.filter(w => w.isBlocked).length;

  // Authentic statuses per requirement section 11
  const vpnEngineStatus = useMemo(() => {
    if (!isNative) return 'Web Preview (Simulator)';
    if (!vpnStatus?.hasVpnPermission) return 'Permission Required';
    if (vpnStatus.anotherVpnActive) return 'Another VPN Active';
    if (vpnStatus.isVpnStarting) return 'Starting';
    if (vpnStatus.isVpnRunning) {
      return blockedCount === 0 ? 'No Active Domains' : 'Running';
    }
    if (vpnStatus.lastVpnError) return 'DNS Engine Error';
    return 'Stopped';
  }, [isNative, vpnStatus, blockedCount]);

  const filteredWebsites = useMemo(() => {
    return blockedWebsites.filter(site => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === 'all' || site.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [blockedWebsites, searchTerm, selectedCategoryFilter]);

  const visibleWebsites = useMemo(() => {
    return filteredWebsites.slice(0, displayLimit);
  }, [filteredWebsites, displayLimit]);

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
              icon={<Plus className="w-4 h-4" />}
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
            <span className="text-[10px] text-slate-400 block font-medium">Active Blocked Domains</span>
            <span className="text-xs font-bold text-sky-400">
              {blockedCount.toLocaleString()} Domains
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">Adult Shield</span>
            <span className={`text-xs font-bold ${isAdultShieldActive ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isAdultShieldActive ? 'Shield Active' : 'Shield Off'}
            </span>
          </div>
        </div>
      </Card>

      {/* Persistent Info Banner Required for DoH / Private DNS */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span>DNS Filtering Configuration Notice</span>
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Uses on-device DNS filtering — for full protection, disable &lsquo;Secure DNS&rsquo; / &lsquo;Private DNS&rsquo; in your browser and Android network settings, since encrypted DNS (DoH/DoT) can bypass local filtering.
          </p>
        </div>
      </div>

      {/* Adult Content Shield Card */}
      <Card
        className={`p-4 sm:p-5 border transition-all ${
          isAdultShieldActive
            ? 'border-indigo-500/40 bg-gradient-to-br from-[#1C2541] via-[#151D3B] to-[#0B132B]'
            : 'border-slate-800 bg-[#1C2541]/70'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                isAdultShieldActive
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                  : 'bg-slate-900 border-white/10 text-slate-400'
              }`}
            >
              {isAdultShieldActive ? (
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              ) : (
                <Shield className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Adult Website Domain Blocking
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isAdultShieldActive
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isAdultShieldActive
                    ? `${adultBlockedCount.toLocaleString()} Curated Domains Active`
                    : `${ADULT_CONTENT_DOMAINS.length.toLocaleString()} Domains Ready`}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Blocks known adult, pornographic, and explicit domains via on-device loopback DNS sinkhole.
                Disabling requires a mandatory 30-second delay to safeguard study focus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            {isBulkLoading ? (
              <div className="flex items-center gap-2 text-xs text-indigo-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying Blocklist...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleToggleAdultShield}
                disabled={isBulkLoading}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                  isAdultShieldActive ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                title={isAdultShieldActive ? 'Disable Adult Content Shield' : 'Enable Adult Content Shield'}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isAdultShieldActive ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* 30-Second Unlock Countdown Confirmation Banner */}
        {isShieldUnlocking && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h5 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    <span>Disabling Adult Shield in {unlockSecondsLeft}s</span>
                  </h5>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Mandatory 30-second pause to prevent impulsive unlocking. Adult filter will remain active until timer completes.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={cancelShieldUnlock}
                icon={<X className="w-3.5 h-3.5" />}
                className="text-xs shrink-0 bg-emerald-600 hover:bg-emerald-500 border-none text-white font-bold"
              >
                Keep Shield Active
              </Button>
            </div>

            {/* Visual Countdown Progress Bar */}
            <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-rose-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${Math.round((unlockSecondsLeft / 30) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Add Website Form */}
      {showAddForm && (
        <Card className="p-4 sm:p-5 border-sky-500/30 animate-in fade-in duration-150">
          <h4 className="text-sm font-bold text-white mb-3">Add Custom Domain to Filter</h4>
          <form onSubmit={handleAdd} className="space-y-3">
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Domain Name *</label>
                <input
                  type="text"
                  placeholder="e.g. asurascans.com or youtube.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Friendly Label</label>
                <input
                  type="text"
                  placeholder="e.g. Asura Scans"
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
                  {categories.map(c => (
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
                Add to Blocklist
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter and Search Bar */}
      {blockedWebsites.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search blocked domains..."
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
            <option value="all">All Categories ({blockedWebsites.length.toLocaleString()})</option>
            {categories.map(cat => {
              const count = blockedWebsites.filter(w => w.category === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count.toLocaleString()})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Website Domain List */}
      <div className="space-y-2.5 max-w-full">
        {blockedWebsites.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <Globe className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No website domains configured</p>
            <p className="text-xs text-slate-500">
              Tap &ldquo;Add Domain&rdquo; or enable &ldquo;Adult Content Shield&rdquo; to start filtering distracting websites.
            </p>
          </Card>
        ) : filteredWebsites.length === 0 ? (
          <Card className="p-6 text-center space-y-2">
            <p className="text-xs text-slate-400">No domains match your search or filter</p>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Showing {Math.min(visibleWebsites.length, filteredWebsites.length)} of {filteredWebsites.length.toLocaleString()} domains
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

            {visibleWebsites.map(site => (
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
                    {site.category === 'Adult Content' ? (
                      <Shield className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Globe className="w-5 h-5 text-sky-400" />
                    )}
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
                  <button
                    type="button"
                    onClick={() => toggleWebsiteBlocked(site.id)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      site.isBlocked ? 'bg-rose-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                    title={site.isBlocked ? 'Unblock domain' : 'Block domain'}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                  </button>

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

            {filteredWebsites.length > displayLimit && (
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

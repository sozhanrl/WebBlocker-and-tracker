import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { BlockedApp } from '../../types';
import { getNativeBridge, isNativePlatform, InstalledApp, PermissionStatus } from '../../lib/nativeBridge';
import { PermissionDiagnosticsModal } from '../common/PermissionDiagnosticsModal';
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  Check,
  X,
  Layers,
  Filter,
  Flame,
  Clock,
  Globe,
  Settings,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Button } from '../common/Button';

export const AppBlocker: React.FC = () => {
  const {
    blockedApps,
    setBlockedAppsState,
    toggleAppBlocked,
    updateAppLimit,
    removeBlockedApp,
    clearAllBlockedApps,
    blockedWebsites
  } = useApp();
  const { isRunning: isFocusActive, remainingSeconds, subject, isStrictMode } = useFocusTimer();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAppsModal, setShowAddAppsModal] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [installedPhoneApps, setInstalledPhoneApps] = useState<InstalledApp[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState('All');
  const [includeSystemApps, setIncludeSystemApps] = useState(false);
  const [selectedInModal, setSelectedInModal] = useState<Set<string>>(new Set());
  const [isLoadingNative, setIsLoadingNative] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [permissions, setPermissions] = useState<PermissionStatus>({
    hasUsageStats: false,
    hasAccessibility: false,
    isAccessibilityRunning: false,
    hasNotification: false,
    hasBatteryOptimizationIgnored: false,
    hasVpnPermission: false,
    isVpnRunning: false,
    blockedDomainsCount: 0,
    lastVpnError: '',
    hasExactAlarm: false
  });

  const categories = [
    'All',
    'Social Media',
    'Entertainment',
    'Games',
    'Messaging',
    'Browsers',
    'Shopping & Food',
    'Other Apps'
  ];

  // Check native bridge and real permission status
  const checkPermissions = useCallback(async () => {
    try {
      const nativeCheck = isNativePlatform();
      setIsNative(nativeCheck);
      const bridge = getNativeBridge();
      const status = await bridge.checkPermissions();
      setPermissions(status);
    } catch (e) {
      console.warn('Failed to check permissions:', e);
    }
  }, []);

  // Fetch installed applications from phone via PackageManager
  const loadInstalledApps = useCallback(async () => {
    try {
      setIsLoadingNative(true);
      const isNat = isNativePlatform();
      setIsNative(isNat);
      const bridge = getNativeBridge();
      const res = await bridge.getInstalledApps({ includeSystemApps });

      if (res && res.apps) {
        setInstalledPhoneApps(res.apps);
      }
    } catch (e) {
      console.warn('Failed to fetch installed apps from phone:', e);
    } finally {
      setIsLoadingNative(false);
    }
  }, [includeSystemApps]);

  useEffect(() => {
    checkPermissions();
    loadInstalledApps();

    const handleFocus = () => {
      checkPermissions();
      loadInstalledApps();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkPermissions, loadInstalledApps]);

  // Open "Add Apps" Modal with currently selected apps checked
  const handleOpenAddModal = () => {
    const currentSelectedPkgs = new Set(blockedApps.map(a => a.packageName));
    setSelectedInModal(currentSelectedPkgs);
    setShowAddAppsModal(true);
  };

  // Toggle selection inside Add Apps Modal
  const handleToggleModalSelection = (packageName: string) => {
    setSelectedInModal(prev => {
      const next = new Set(prev);
      if (next.has(packageName)) {
        next.delete(packageName);
      } else {
        next.add(packageName);
      }
      return next;
    });
  };

  // Save selected apps from Add Apps modal into Blocklist
  const handleSaveModalApps = () => {
    const newBlockedApps: BlockedApp[] = [];

    installedPhoneApps.forEach(phoneApp => {
      if (selectedInModal.has(phoneApp.packageName)) {
        const existing = blockedApps.find(b => b.packageName === phoneApp.packageName);
        newBlockedApps.push({
          id: existing?.id || `pkg-${phoneApp.packageName}`,
          name: phoneApp.appName,
          packageName: phoneApp.packageName,
          category: (phoneApp.category || 'Other Apps') as any,
          isBlocked: existing ? existing.isBlocked : true,
          dailyLimitMinutes: existing?.dailyLimitMinutes ?? 15,
          usedTodayMinutes: existing?.usedTodayMinutes ?? 0,
          iconName: 'Smartphone',
          iconBase64: phoneApp.icon,
          isSystemApp: phoneApp.isSystemApp
        });
      }
    });

    setBlockedAppsState(newBlockedApps);

    // Sync immediately to native Kotlin SharedPreferences
    const activePkgs = newBlockedApps.filter(a => a.isBlocked).map(a => a.packageName);
    const activeDomains = blockedWebsites.filter(w => w.isBlocked).map(w => w.url);
    getNativeBridge().updateBlockList({
      blockedPackages: activePkgs,
      blockedDomains: activeDomains,
      isStrict: isStrictMode,
      allowEmergencyUnlock: true,
      activeSubject: subject || 'NEET 2027 Study Session'
    }).catch(console.warn);

    setShowAddAppsModal(false);
  };

  // Toggle blocking state of an individual selected app
  const handleToggleAppBlocked = (appId: string) => {
    toggleAppBlocked(appId);
    const next = blockedApps.map(app => (app.id === appId ? { ...app, isBlocked: !app.isBlocked } : app));
    const activePkgs = next.filter(a => a.isBlocked).map(a => a.packageName);
    const activeDomains = blockedWebsites.filter(w => w.isBlocked).map(w => w.url);
    getNativeBridge().updateBlockList({
      blockedPackages: activePkgs,
      blockedDomains: activeDomains,
      isStrict: isStrictMode,
      allowEmergencyUnlock: true,
      activeSubject: subject || 'NEET 2027 Study Session'
    }).catch(console.warn);
  };

  // Change daily limit for a selected app
  const handleChangeLimit = (appId: string, minutes: number) => {
    updateAppLimit(appId, minutes);
  };

  // Remove an app completely from the blocklist
  const handleRemoveApp = (appId: string) => {
    removeBlockedApp(appId);
    const next = blockedApps.filter(app => app.id !== appId);
    const activePkgs = next.filter(a => a.isBlocked).map(a => a.packageName);
    const activeDomains = blockedWebsites.filter(w => w.isBlocked).map(w => w.url);
    getNativeBridge().updateBlockList({
      blockedPackages: activePkgs,
      blockedDomains: activeDomains,
      isStrict: isStrictMode,
      allowEmergencyUnlock: true,
      activeSubject: subject || 'NEET 2027 Study Session'
    }).catch(console.warn);
  };

  // Remove all apps completely from the blocklist
  const handleClearAllApps = () => {
    clearAllBlockedApps();
    const activeDomains = blockedWebsites.filter(w => w.isBlocked).map(w => w.url);
    getNativeBridge().updateBlockList({
      blockedPackages: [],
      blockedDomains: activeDomains,
      isStrict: isStrictMode,
      allowEmergencyUnlock: true,
      activeSubject: subject || 'NEET 2027 Study Session'
    }).catch(console.warn);
  };

  // Filtered selected apps for the main list
  const filteredSelectedApps = useMemo(() => {
    return blockedApps.filter(app =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blockedApps, searchTerm]);

  // Filtered installed apps for the Add Apps modal
  const filteredModalApps = useMemo(() => {
    return installedPhoneApps.filter(app => {
      const matchesSearch =
        app.appName.toLowerCase().includes(modalSearch.toLowerCase()) ||
        app.packageName.toLowerCase().includes(modalSearch.toLowerCase());
      const matchesCat = modalCategory === 'All' || app.category === modalCategory;
      const matchesSys = includeSystemApps || !app.isSystemApp;
      return matchesSearch && matchesCat && matchesSys;
    });
  }, [installedPhoneApps, modalSearch, modalCategory, includeSystemApps]);

  const activeBlockedCount = blockedApps.filter(a => a.isBlocked).length;
  const activeDomainsCount = blockedWebsites.filter(w => w.isBlocked).length;

  // Truthful status helpers
  const appBlockerStatus = !permissions.hasAccessibility
    ? 'Permission Required'
    : !permissions.isAccessibilityRunning
    ? 'Service Stopped'
    : isFocusActive
    ? 'Active (Focus Session)'
    : 'Ready (Monitoring)';

  const websiteBlockerStatus = permissions.isVpnRunning
    ? 'Active (VPN Filtering)'
    : permissions.hasVpnPermission
    ? 'Inactive (VPN Stopped)'
    : 'Permission Required';

  return (
    <div className="space-y-4 max-w-full pb-12 animate-in fade-in duration-150">
      {/* 1. TRUTHFUL BLOCKER DASHBOARD */}
      <Card className="p-4 sm:p-5 space-y-4 bg-gradient-to-br from-[#1C2541] to-[#0B132B] border-sky-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <span>NEET Study Blocker Dashboard</span>
              </h3>
              {isNative && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  Android Engine
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active distraction shield for apps and domains during study sessions
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              icon={<Plus className="w-4 h-4" />}
              className="flex-1 sm:flex-none justify-center text-xs"
            >
              Add Apps
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                checkPermissions();
                loadInstalledApps();
              }}
              disabled={isLoadingNative}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingNative ? 'animate-spin' : ''}`} />}
              className="text-xs shrink-0"
              title="Refresh installed apps and permission status"
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDiagnostics(true)}
              icon={<Sliders className="w-3.5 h-3.5" />}
              className="text-xs shrink-0 text-slate-300"
              title="View system diagnostics"
            >
              Diagnostics
            </Button>
          </div>
        </div>

        {/* Diagnostic Status Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">App Blocker</span>
            <span
              className={`text-xs font-bold block truncate ${
                permissions.hasAccessibility ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {appBlockerStatus}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">Website Blocker</span>
            <span
              className={`text-xs font-bold block truncate ${
                permissions.isVpnRunning ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {websiteBlockerStatus}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">Focus Session</span>
            <span
              className={`text-xs font-bold block truncate ${
                isFocusActive ? 'text-sky-400 animate-pulse' : 'text-slate-400'
              }`}
            >
              {isFocusActive ? `Running (${Math.floor(remainingSeconds / 60)}m left)` : 'Inactive'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">Targets Configured</span>
            <span className="text-xs font-bold text-white block truncate">
              {activeBlockedCount} Apps • {activeDomainsCount} Domains
            </span>
          </div>
        </div>

        {/* Permission Notice if Accessibility Disabled */}
        {!permissions.hasAccessibility && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-2 text-xs text-rose-300">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">
                Accessibility Focus Guard is required to detect and block apps.
              </span>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                getNativeBridge().requestPermission({ type: 'accessibility' });
              }}
              className="text-[11px] py-1 px-2.5 shrink-0"
            >
              Enable
            </Button>
          </div>
        )}
      </Card>

      {/* 2. SEARCH & CONTROLS */}
      {blockedApps.length > 0 && (
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search configured apps..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="button"
            onClick={handleClearAllApps}
            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            title="Remove all apps from blocklist"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* 3. CONFIGURED APPS LIST */}
      <div className="space-y-3 max-w-full">
        {blockedApps.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Smartphone className="w-12 h-12 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-300">No Apps Configured for Blocking</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap &ldquo;Add Apps&rdquo; to select distracting apps directly from your phone (e.g. Instagram, YouTube, BGMI).
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              icon={<Plus className="w-4 h-4" />}
              className="mx-auto text-xs"
            >
              Select Apps from Phone
            </Button>
          </Card>
        ) : filteredSelectedApps.length === 0 ? (
          <Card className="p-6 text-center space-y-2">
            <p className="text-xs text-slate-400">No apps match &ldquo;{searchTerm}&rdquo;</p>
          </Card>
        ) : (
          filteredSelectedApps.map(app => (
            <Card
              key={app.id}
              className={`p-3.5 sm:p-4 transition-all min-w-0 ${
                app.isBlocked
                  ? 'border-rose-500/30 bg-[#1C2541]/95 shadow-sm'
                  : 'bg-[#1C2541]/70 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Real App Icon */}
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {app.iconBase64 ? (
                      <img
                        src={app.iconBase64}
                        alt={app.name}
                        className="w-8 h-8 rounded-lg object-contain"
                      />
                    ) : (
                      <Smartphone className="w-5 h-5 text-sky-400" />
                    )}
                  </div>

                  {/* App Details */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-sm font-bold text-white truncate max-w-[170px] sm:max-w-xs block">
                        {app.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 font-medium shrink-0">
                        {app.category}
                      </span>
                      {app.isBlocked && isFocusActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold shrink-0">
                          Blocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-full block opacity-75">
                      {app.packageName}
                    </p>
                  </div>
                </div>

                {/* Switch and Delete Action */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleAppBlocked(app.id)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      app.isBlocked ? 'bg-rose-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                    title={app.isBlocked ? 'Unblock app' : 'Block app'}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveApp(app.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from blocklist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Limit & Warning Footer */}
              <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Daily quota:</span>
                  <select
                    value={app.dailyLimitMinutes ?? 15}
                    onChange={e => handleChangeLimit(app.id, parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5 text-[10px] focus:outline-none focus:border-sky-500"
                  >
                    <option value={0}>0 min (Strict Block)</option>
                    <option value={15}>15 min / day</option>
                    <option value={30}>30 min / day</option>
                    <option value={45}>45 min / day</option>
                    <option value={60}>60 min / day</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">Max 5 Warnings • 5m Lockout</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. REAL INSTALLED APPS SELECTOR MODAL                      */}
      {/* ========================================================= */}
      {showAddAppsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-xl max-h-[85vh] flex flex-col bg-[#0B132B] border-sky-500/30 shadow-2xl p-0 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#1C2541] to-[#0B132B] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Select Apps From Your Phone</h3>
                  <p className="text-[11px] text-slate-400">
                    {installedPhoneApps.length > 0
                      ? `${installedPhoneApps.length} launchable apps detected`
                      : 'Scanning phone applications...'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAppsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="p-3 bg-slate-900/90 border-b border-white/5 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search installed apps..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#1C2541] border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setModalCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0 transition-colors ${
                        modalCategory === cat
                          ? 'bg-sky-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSystemApps}
                    onChange={e => setIncludeSystemApps(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                  />
                  <span>Include System Apps</span>
                </label>
              </div>
            </div>

            {/* Installed Apps List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoadingNative ? (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-sky-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading installed apps from device...</p>
                </div>
              ) : filteredModalApps.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <p className="text-xs text-slate-400">No apps match your search</p>
                </div>
              ) : (
                filteredModalApps.map(phoneApp => {
                  const isSelected = selectedInModal.has(phoneApp.packageName);
                  return (
                    <div
                      key={phoneApp.packageName}
                      onClick={() => handleToggleModalSelection(phoneApp.packageName)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500/50 text-white'
                          : 'bg-[#1C2541]/50 border-white/5 text-slate-300 hover:bg-[#1C2541]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {phoneApp.icon ? (
                            <img
                              src={phoneApp.icon}
                              alt={phoneApp.appName}
                              className="w-7 h-7 rounded object-contain"
                            />
                          ) : (
                            <Smartphone className="w-4 h-4 text-sky-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-xs block">
                              {phoneApp.appName}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-white/5 shrink-0">
                              {phoneApp.category || 'App'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono truncate block opacity-75">
                            {phoneApp.packageName}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-sky-500 border-sky-400 text-white'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                {selectedInModal.size} apps selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddAppsModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveModalApps}
                  className="text-xs"
                >
                  Save to Blocklist ({selectedInModal.size})
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Diagnostics Modal */}
      <PermissionDiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => {
          setShowDiagnostics(false);
          checkPermissions();
        }}
      />
    </div>
  );
};

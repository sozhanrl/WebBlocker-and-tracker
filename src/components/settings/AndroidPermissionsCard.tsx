import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { getNativeBridge, isNativePlatform, PermissionStatus } from '../../lib/nativeBridge';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Bell,
  BatteryCharging,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Globe,
  RefreshCw,
  Power,
  ChevronDown,
  Info,
  Lock
} from 'lucide-react';

export const AndroidPermissionsCard: React.FC = () => {
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
    hasExactAlarm: false,
    hasDeviceAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedOem, setSelectedOem] = useState<'oneplus' | 'xiaomi' | 'samsung' | 'vivo' | 'oppo'>('oneplus');

  const checkStatus = useCallback(async () => {
    try {
      const nativeCheck = isNativePlatform();
      setIsNative(nativeCheck);
      const bridge = getNativeBridge();
      const status = await bridge.checkPermissions();
      setPermissions(status);
    } catch (e) {
      console.warn('Failed to check native permissions:', e);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    // Auto-refresh when student returns from Android Settings
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkStatus);

    const interval = setInterval(checkStatus, 4000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkStatus);
      clearInterval(interval);
    };
  }, [checkStatus]);

  const handleRequestPermission = async (
    type: 'usage_stats' | 'accessibility' | 'notification' | 'battery_optimization' | 'vpn' | 'exact_alarm' | 'device_admin',
    label: string
  ) => {
    try {
      setLoading(true);
      setStatusMessage(`Opening Android Settings for ${label}...`);
      const bridge = getNativeBridge();
      await bridge.requestPermission({ type });
      setTimeout(checkStatus, 1500);
    } catch (e) {
      console.error(e);
      setStatusMessage(`Please enable ${label} directly in Android Settings.`);
    } finally {
      setLoading(false);
    }
  };

  const allShieldsActive =
    permissions.hasAccessibility &&
    permissions.isAccessibilityRunning &&
    permissions.hasUsageStats &&
    permissions.hasBatteryOptimizationIgnored &&
    permissions.hasNotification;

  return (
    <Card className="p-4 sm:p-5 space-y-4 border-sky-500/20 bg-gradient-to-br from-[#1C2541]/90 to-[#0B132B] max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Android Native Blocker Guard &amp; Permissions</span>
              {isNative && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  Native Engine
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live shield diagnostics for app blocking, domain filtering, and battery exemptions
            </p>
          </div>
        </div>

        <button
          onClick={checkStatus}
          className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 shrink-0 p-1"
          title="Refresh permission status"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Truthful Overall Health Status Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
          allShieldsActive
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {allShieldsActive ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate">
              {allShieldsActive
                ? 'All Core Android Shield Guards Active & Running'
                : 'Permission Setup Required for Native App & Web Blocking'}
            </span>
            <span className="text-[11px] opacity-80 block">
              {allShieldsActive
                ? 'Accessibility service and background focus protections are active on this device.'
                : 'Grant Accessibility & Usage access to allow FocusForge to intercept distracting apps.'}
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <p className="text-xs text-sky-400 font-medium px-1 animate-pulse">{statusMessage}</p>
      )}

      {/* 5 Real Permission Cards */}
      <div className="space-y-2.5 pt-1">
        {/* 1. Accessibility Focus Guard */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-white/5 gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                permissions.hasAccessibility
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <Eye className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">Accessibility Focus Guard</span>
                {permissions.hasAccessibility ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Service {permissions.isAccessibilityRunning ? 'Running' : 'Enabled'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3 h-3" /> Not Granted (Required)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Detects selected distracting apps during active focus sessions.
              </p>
            </div>
          </div>

          {!permissions.hasAccessibility ? (
            <Button
              size="sm"
              variant="primary"
              disabled={loading}
              onClick={() => handleRequestPermission('accessibility', 'Accessibility Service')}
              className="text-xs shrink-0"
            >
              Enable Accessibility
            </Button>
          ) : (
            <span className="text-xs font-semibold text-emerald-400 shrink-0">Granted</span>
          )}
        </div>

        {/* 2. Screen Time & Usage Access */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-white/5 gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                permissions.hasUsageStats
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">Usage Access</span>
                {permissions.hasUsageStats ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Granted
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3 h-3" /> Not Granted (Recommended)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tracks daily app usage and study productivity.
              </p>
            </div>
          </div>

          {!permissions.hasUsageStats ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={loading}
              onClick={() => handleRequestPermission('usage_stats', 'Usage Access')}
              className="text-xs shrink-0"
            >
              Grant Usage Access
            </Button>
          ) : (
            <span className="text-xs font-semibold text-emerald-400 shrink-0">Granted</span>
          )}
        </div>

        {/* 3. VPN Permission for Local DNS Domain Blocking */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-white/5 gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                permissions.isVpnRunning
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : permissions.hasVpnPermission
                  ? 'bg-sky-500/10 text-sky-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">VPN Permission (Website Blocker)</span>
                {permissions.isVpnRunning ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> VPN Running
                  </span>
                ) : permissions.hasVpnPermission ? (
                  <span className="text-[10px] font-bold text-sky-400 shrink-0">
                    ○ Ready (VPN Stopped)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    ○ Not Granted
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Local on-device loopback DNS filter to sinkhole configured domains.
              </p>
            </div>
          </div>

          {!permissions.hasVpnPermission ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={loading}
              onClick={() => handleRequestPermission('vpn', 'VPN Permission')}
              className="text-xs shrink-0"
            >
              Grant VPN Permission
            </Button>
          ) : (
            <span className={`text-xs font-semibold shrink-0 ${permissions.isVpnRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
              {permissions.isVpnRunning ? 'Running' : 'Ready'}
            </span>
          )}
        </div>

        {/* 4. Battery Optimization */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-white/5 gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                permissions.hasBatteryOptimizationIgnored
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-sky-500/10 text-sky-400'
              }`}
            >
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">Battery Optimization</span>
                {permissions.hasBatteryOptimizationIgnored ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Unrestricted
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3 h-3" /> Optimized (Recommended to exempt)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Helps keep focus sessions and timers running reliably in background.
              </p>
            </div>
          </div>

          {!permissions.hasBatteryOptimizationIgnored ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={loading}
              onClick={() => handleRequestPermission('battery_optimization', 'Battery Optimization')}
              className="text-xs shrink-0"
            >
              Open Battery Settings
            </Button>
          ) : (
            <span className="text-xs font-semibold text-emerald-400 shrink-0">Unrestricted</span>
          )}
        </div>

        {/* 5. Study Notifications */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-white/5 gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                permissions.hasNotification
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">Notifications</span>
                {permissions.hasNotification ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Allowed
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3 h-3" /> Blocked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Shows study timer and focus-session notifications.
              </p>
            </div>
          </div>

          {!permissions.hasNotification ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={loading}
              onClick={() => handleRequestPermission('notification', 'Notifications')}
              className="text-xs shrink-0"
            >
              Allow Notifications
            </Button>
          ) : (
            <span className="text-xs font-semibold text-emerald-400 shrink-0">Allowed</span>
          )}
        </div>

        {/* 6. 5-Strike Device Lockdown (Device Admin) */}
        <div className="flex flex-col p-3.5 rounded-xl bg-slate-900/70 border border-white/5 gap-3 min-w-0">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div
                className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                  permissions.hasDeviceAdmin
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">5-Strike Device Lockdown</span>
                  {permissions.hasDeviceAdmin ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-3 h-3" /> Optional Guard
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Forces an immediate screen lock after 5 repeated attempts on any blocked app or site.
                </p>
              </div>
            </div>

            {!permissions.hasDeviceAdmin ? (
              <Button
                size="sm"
                variant="primary"
                disabled={loading}
                onClick={() => handleRequestPermission('device_admin', 'Device Admin Lockdown')}
                className="text-xs shrink-0 whitespace-nowrap"
              >
                Enable 5-Strike Lockdown
              </Button>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 shrink-0">Active</span>
            )}
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 text-[11px] text-slate-300 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <span>
              This locks your screen for 5 minutes after 5 attempts on the same blocked app/site. It cannot power off your phone — Android doesn't allow that without root access.
            </span>
          </div>
        </div>
      </div>

      {/* OEM Device Compatibility Guide */}
      <div className="pt-2 border-t border-white/5">
        <details className="group rounded-xl bg-slate-900/60 border border-white/5 overflow-hidden transition-all">
          <summary className="p-3.5 cursor-pointer flex items-center justify-between text-xs font-bold text-sky-300 hover:text-sky-200 select-none">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>Device Compatibility &amp; Background Execution Guide</span>
            </div>
            <ChevronDown className="w-4 h-4 text-sky-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="p-3.5 pt-1 text-[11px] text-slate-300 space-y-3 border-t border-white/5">
            {/* OEM Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['oneplus', 'xiaomi', 'samsung', 'vivo', 'oppo'] as const).map(oem => (
                <button
                  key={oem}
                  onClick={() => setSelectedOem(oem)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize shrink-0 transition-colors ${
                    selectedOem === oem
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {oem === 'oneplus'
                    ? 'OnePlus (OxygenOS)'
                    : oem === 'xiaomi'
                    ? 'Xiaomi (MIUI/HyperOS)'
                    : oem === 'samsung'
                    ? 'Samsung (One UI)'
                    : oem === 'vivo'
                    ? 'Vivo (Funtouch OS)'
                    : 'Oppo (ColorOS)'}
                </button>
              ))}
            </div>

            {selectedOem === 'oneplus' && (
              <div className="space-y-1.5 text-slate-300">
                <p className="font-semibold text-sky-300">OnePlus / OxygenOS Setup Steps:</p>
                <p>1. <strong>Battery:</strong> Long-press FocusForge icon $\rightarrow$ App Info $\rightarrow$ Battery usage $\rightarrow$ Set to <em>&ldquo;Allow background activity&rdquo;</em> &amp; <em>&ldquo;Allow auto-launch&rdquo;</em>.</p>
                <p>2. <strong>Lock in Recent Apps:</strong> Open Recent Tasks $\rightarrow$ Tap 3 dots (⋮) above FocusForge $\rightarrow$ Tap <em>&ldquo;Lock&rdquo;</em>.</p>
                <p>3. <strong>Accessibility:</strong> If OxygenOS pauses accessibility services on reboot, opening FocusForge once restores the shield.</p>
              </div>
            )}

            {selectedOem === 'xiaomi' && (
              <div className="space-y-1.5 text-slate-300">
                <p className="font-semibold text-sky-300">Xiaomi / MIUI / HyperOS Setup Steps:</p>
                <p>1. <strong>Autostart:</strong> Settings $\rightarrow$ Apps $\rightarrow$ Permissions $\rightarrow$ Autostart $\rightarrow$ Turn FocusForge ON.</p>
                <p>2. <strong>Battery Saver:</strong> Settings $\rightarrow$ Apps $\rightarrow$ Manage Apps $\rightarrow$ FocusForge $\rightarrow$ Battery Saver $\rightarrow$ Set to <em>&ldquo;No restrictions&rdquo;</em>.</p>
                <p>3. <strong>Restricted Settings:</strong> On Android 13+, tap 3 dots on App Info $\rightarrow$ Allow restricted settings to enable Accessibility.</p>
              </div>
            )}

            {selectedOem === 'samsung' && (
              <div className="space-y-1.5 text-slate-300">
                <p className="font-semibold text-sky-300">Samsung / One UI Setup Steps:</p>
                <p>1. <strong>Battery:</strong> Settings $\rightarrow$ Apps $\rightarrow$ FocusForge $\rightarrow$ Battery $\rightarrow$ Select <em>&ldquo;Unrestricted&rdquo;</em>.</p>
                <p>2. <strong>Never Sleeping Apps:</strong> Settings $\rightarrow$ Battery and device care $\rightarrow$ Battery $\rightarrow$ Background usage limits $\rightarrow$ Never sleeping apps $\rightarrow$ Add FocusForge.</p>
              </div>
            )}

            {selectedOem === 'vivo' && (
              <div className="space-y-1.5 text-slate-300">
                <p className="font-semibold text-sky-300">Vivo / Funtouch OS Setup Steps:</p>
                <p>1. <strong>Background Power:</strong> Settings $\rightarrow$ Battery $\rightarrow$ Background power consumption management $\rightarrow$ FocusForge $\rightarrow$ Set to <em>&ldquo;High background power consumption&rdquo;</em>.</p>
                <p>2. <strong>Autostart:</strong> Settings $\rightarrow$ Applications $\rightarrow$ Autostart $\rightarrow$ Enable FocusForge.</p>
              </div>
            )}

            {selectedOem === 'oppo' && (
              <div className="space-y-1.5 text-slate-300">
                <p className="font-semibold text-sky-300">Oppo / ColorOS Setup Steps:</p>
                <p>1. <strong>Battery:</strong> Settings $\rightarrow$ Battery $\rightarrow$ More battery settings $\rightarrow$ Optimize battery use $\rightarrow$ FocusForge $\rightarrow$ <em>&ldquo;Don't optimize&rdquo;</em>.</p>
                <p>2. <strong>Auto-launch:</strong> App info $\rightarrow$ Battery usage $\rightarrow$ Allow auto-launch &amp; background activity.</p>
              </div>
            )}
          </div>
        </details>
      </div>
    </Card>
  );
};

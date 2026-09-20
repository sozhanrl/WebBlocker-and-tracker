import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { getNativeBridge, PermissionStatus, isNativePlatform } from '../../lib/nativeBridge';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Eye,
  Bell,
  BatteryCharging,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

interface PermissionDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionDiagnosticsModal: React.FC<PermissionDiagnosticsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isNative = isNativePlatform();

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const bridge = getNativeBridge();
      const res = await bridge.checkPermissions();
      setStatus(res);
    } catch (e) {
      console.warn('Failed to load diagnostics:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      const handleFocus = () => refreshStatus();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [isOpen, refreshStatus]);

  if (!isOpen) return null;

  const handleRequest = async (
    type: 'usage_stats' | 'accessibility' | 'notification' | 'battery_optimization' | 'vpn' | 'exact_alarm'
  ) => {
    try {
      const bridge = getNativeBridge();
      await bridge.requestPermission({ type });
      setTimeout(refreshStatus, 1500);
    } catch (e) {
      console.warn(`Failed to request permission ${type}:`, e);
    }
  };

  const handleResetWarnings = async () => {
    try {
      const bridge = getNativeBridge();
      await bridge.resetDailyWarnings();
      await refreshStatus();
      alert('Daily distraction warning counters reset successfully.');
    } catch (e) {
      console.warn('Failed to reset warnings:', e);
    }
  };

  const handleCancelLockout = async () => {
    try {
      const bridge = getNativeBridge();
      await bridge.cancelLockoutIfAllowed();
      await refreshStatus();
    } catch (e) {
      console.warn('Failed to cancel lockout:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0B132B] border-sky-500/30 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1C2541] to-[#0B132B] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Android System &amp; Permission Diagnostics</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live verification of native Android blocking services
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshStatus}
              disabled={isLoading}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh diagnostics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnostic Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* Privacy & Security Disclosure Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/20 space-y-1.5 text-xs text-slate-300">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Zero-Telemetry Privacy Guarantee</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • <strong>App Blocker:</strong> Reads foreground app package name ONLY to enforce student focus rules. It never reads messages, passwords, keystrokes, or private screen content.<br />
              • <strong>Website Blocker:</strong> On-device loopback DNS filter. Browsing traffic and HTTPS payload are never inspected or uploaded.
            </p>
          </div>

          {/* 1. Accessibility Service */}
          <div className="p-3.5 rounded-xl bg-[#1C2541]/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white">Accessibility Focus Guard</span>
                {status?.isAccessibilityRunning ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Service Running &amp; Monitoring
                  </span>
                ) : status?.hasAccessibility ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Enabled (Connecting)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Permission Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Detects foreground distracting apps during active study sessions and triggers the Focus Shield.
              </p>
            </div>

            {!status?.isAccessibilityRunning && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleRequest('accessibility')}
                className="text-xs shrink-0 self-end sm:self-auto"
              >
                Enable in Settings
              </Button>
            )}
          </div>

          {/* 2. Usage Stats */}
          <div className="p-3.5 rounded-xl bg-[#1C2541]/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">Usage Access Permission</span>
                {status?.hasUsageStats ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Granted
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Required for Daily Limits
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Measures daily screen time per app to enforce student limits (e.g. 15 min Instagram quota).
              </p>
            </div>

            {!status?.hasUsageStats && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleRequest('usage_stats')}
                className="text-xs shrink-0 self-end sm:self-auto"
              >
                Grant Access
              </Button>
            )}
          </div>

          {/* 3. On-Device VPN Domain Blocker */}
          <div className="p-3.5 rounded-xl bg-[#1C2541]/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Local DNS VPN Blocker</span>
                {status?.isVpnRunning ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Running (Filtering Port 53)
                  </span>
                ) : status?.anotherVpnActive ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Another VPN Active
                  </span>
                ) : status?.hasVpnPermission ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Permission Granted (Stopped)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Permission Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Intercepts {status?.blockedDomainsCount?.toLocaleString() || 0} configured distracting/adult domains on 10.200.0.2.
              </p>
              {status?.lastVpnError && (
                <p className="text-[10px] text-rose-400">Note: {status.lastVpnError}</p>
              )}
            </div>

            {!status?.hasVpnPermission && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleRequest('vpn')}
                className="text-xs shrink-0 self-end sm:self-auto"
              >
                Grant VPN
              </Button>
            )}
          </div>

          {/* 4. Battery Optimization Exemption */}
          <div className="p-3.5 rounded-xl bg-[#1C2541]/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Battery Optimization Exemption</span>
                {status?.hasBatteryOptimizationIgnored ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Exempted (Background Protected)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Prevents OEM task killers (OnePlus, Samsung, Xiaomi) from stopping background focus timers.
              </p>
            </div>

            {!status?.hasBatteryOptimizationIgnored && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRequest('battery_optimization')}
                className="text-xs shrink-0 self-end sm:self-auto text-amber-400 hover:text-amber-300"
              >
                Disable Optimization
              </Button>
            )}
          </div>

          {/* 5. Notifications */}
          <div className="p-3.5 rounded-xl bg-[#1C2541]/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white">Ongoing Study Notifications</span>
                {status?.hasNotification ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Enabled
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Displays live timer countdown and warning alerts in Android status bar.
              </p>
            </div>

            {!status?.hasNotification && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRequest('notification')}
                className="text-xs shrink-0 self-end sm:self-auto text-sky-400"
              >
                Allow
              </Button>
            )}
          </div>

          {/* 6. Active Lockout Status */}
          {status?.isLockoutActive && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-rose-300">5-Minute Focus Lockout Active</span>
                  <p className="text-[11px] text-slate-300">
                    {status.lockoutRemainingSec}s remaining until study lockout releases.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="danger"
                onClick={handleCancelLockout}
                className="text-xs shrink-0"
              >
                Emergency Release
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#1C2541]/90 border-t border-white/10 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetWarnings}
            className="text-xs text-slate-400 hover:text-white"
          >
            Reset Warning Counts
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onClose}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
};

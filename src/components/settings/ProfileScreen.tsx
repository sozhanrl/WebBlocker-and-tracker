import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { formatMinutes } from '../../utils/formatters';
import { AndroidPermissionsCard } from './AndroidPermissionsCard';
import { BiologyModeSettings } from '../neet/BiologyModeSettings';
import {
  User,
  Flame,
  Clock,
  BookOpen,
  Moon,
  Sun,
  Bell,
  Volume2,
  Shield,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  Database,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Smartphone,
  Dna
} from 'lucide-react';
import { StorageEngine } from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { PermissionDiagnosticsModal } from '../common/PermissionDiagnosticsModal';

interface ProfileScreenProps {
  onOpenAuthModal: () => void;
  onOpenSupabaseModal: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenAuthModal,
  onOpenSupabaseModal
}) => {
  const {
    userProfile,
    settings,
    updateSettings,
    neetChapters,
    resetAllData,
    exportBackupJson,
    importBackupJson
  } = useApp();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showAndroidArchModal, setShowAndroidArchModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const completedChaptersCount = neetChapters.filter(c => c.status === 'Completed').length;
  const totalChaptersCount = neetChapters.length;

  const handleExport = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusforge-neet-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        setImportStatus('Data imported successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportStatus('Failed to import JSON file. Please check file formatting.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress and study data? This cannot be undone.')) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Student Profile Overview Card */}
      <Card className="p-6 bg-gradient-to-r from-sky-950/40 via-[#1C2541] to-indigo-950/40 border-sky-500/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-sky-500/30 shadow-lg shadow-sky-500/20"
          />

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-white">{userProfile.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase">
                {userProfile.examGoal}
              </span>
            </div>
            <p className="text-xs text-slate-400">{userProfile.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{userProfile.streakDays}-Day Streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Clock className="w-4 h-4" />
                <span>{formatMinutes(userProfile.totalStudyMinutes)} Total Study</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>{completedChaptersCount}/{totalChaptersCount} Chapters Mastered</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAuthModal}
            className="flex-shrink-0 text-xs"
          >
            Account / Sign In
          </Button>
        </div>
      </Card>

      {/* Android Native Blocker & Shield Permissions */}
      <AndroidPermissionsCard />

      {/* Biology Organization Mode */}
      <BiologyModeSettings />

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appearance & Sound Settings */}
        <Card className="p-5 space-y-4">
          <h4 className="text-sm font-bold text-white border-b border-white/5 pb-2">
            Preferences & Alerts
          </h4>

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.isDarkMode ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <div>
                <span className="text-xs font-semibold text-white block">Theme</span>
                <span className="text-[10px] text-slate-400">
                  {settings.isDarkMode ? 'Dark Navy Mode (Recommended)' : 'Light Mode'}
                </span>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ isDarkMode: !settings.isDarkMode })}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Toggle
            </button>
          </div>

          {/* Sound alert */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Sound Alerts</span>
                <span className="text-[10px] text-slate-400">Chime on timer start and completion</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-sky-500 rounded"
            />
          </div>

          {/* Break reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Break Reminders</span>
                <span className="text-[10px] text-slate-400">Interval alerts every 25-50 minutes</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.breakReminders}
              onChange={(e) => updateSettings({ breakReminders: e.target.checked })}
              className="w-4 h-4 accent-sky-500 rounded"
            />
          </div>
        </Card>

        {/* Focus & Strict Mode Safeguards */}
        <Card className="p-5 space-y-4">
          <h4 className="text-sm font-bold text-white border-b border-white/5 pb-2">
            Focus & Strict Safeguards
          </h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Emergency Exit Delay</span>
                <span className="text-[10px] text-slate-400">Cooldown period before abandoning strict mode</span>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-400">30 seconds</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Daily Study Target</span>
                <span className="text-[10px] text-slate-400">Target hours for NEET streak calculation</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {formatMinutes(userProfile.dailyTargetMinutes)}/day
            </span>
          </div>
        </Card>
      </div>

      {/* Cloud & Data Management */}
      <Card className="p-5 space-y-4">
        <h4 className="text-sm font-bold text-white border-b border-white/5 pb-2">
          Database & Cloud Synchronization
        </h4>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Supabase Cloud Sync</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isSupabaseConfigured ? 'Connected' : 'Offline / Local Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isSupabaseConfigured
                  ? 'Your study sessions, 81 chapters, mock tests, and tasks are synced to PostgreSQL.'
                  : 'Currently running locally. Connect Supabase to enable cloud database.'}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenSupabaseModal}
            className="flex-shrink-0 text-xs"
          >
            Configure Supabase
          </Button>
        </div>

        {/* Android Native Specs & Local Data Management */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-bold text-white block">Android Native Bridge Engine</span>
                <span className="text-[10px] text-slate-400">AccessibilityService, UsageStats &amp; VPN blocking specs</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDiagnosticsModal(true)}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                System Diagnostics
              </button>
              <button
                onClick={() => setShowAndroidArchModal(true)}
                className="text-xs text-sky-400 hover:underline font-semibold"
              >
                View Docs
              </button>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-300 block mb-2">Local Data Management</span>
          {importStatus && (
            <p className="text-xs text-sky-400 mb-2 font-medium">{importStatus}</p>
          )}
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON Backup
            </Button>

            <label className="inline-flex items-center justify-center font-medium rounded-xl text-xs px-3 py-1.5 gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer select-none transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <Button
              variant="danger"
              size="sm"
              onClick={handleReset}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset All Progress
            </Button>
          </div>
        </div>
      </Card>

      {/* Android Native Architecture Modal */}
      {showAndroidArchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Android Native Architecture Specification</h3>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>FocusForge</strong> includes a fully architected native Android subsystem designed with Kotlin, Jetpack Compose, Coroutines, Room DB, and Android Foreground Services.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1.5">
                <p className="font-bold text-sky-300">Native Android Components:</p>
                <p>• <strong>AppBlockerAccessibilityService:</strong> Real-time foreground app package detection with millisecond-level overlay intervention.</p>
                <p>• <strong>DnsVpnBlockerService:</strong> Local loopback VPN (no external routing) for zero-battery-drain domain filtering (DNS sinkholing).</p>
                <p>• <strong>FocusDeviceAdminReceiver:</strong> Device administrator protection preventing uninstallation during active strict mode sessions.</p>
                <p>• <strong>StrictBlockOverlayActivity:</strong> Full-screen motivational overlay rendered over blocked apps.</p>
              </div>
              <p className="text-[11px] text-slate-400">
                Detailed architecture specifications and Kotlin sample implementations are stored in <code>android/ARCHITECTURE.md</code>.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <Button variant="primary" onClick={() => setShowAndroidArchModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* System Diagnostics Modal */}
      <PermissionDiagnosticsModal
        isOpen={showDiagnosticsModal}
        onClose={() => setShowDiagnosticsModal(false)}
      />
    </div>
  );
};


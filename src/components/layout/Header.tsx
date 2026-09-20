import React, { useState } from 'react';
import {
  Flame,
  Bell,
  Moon,
  Sun,
  CheckCircle2,
  Cloud,
  RefreshCw,
  Sparkles,
  WifiOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getNeet2027DaysRemaining } from '../../utils/formatters';

export const Header: React.FC = () => {
  const {
    userProfile,
    unreadNotificationCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    settings,
    updateSettings,
    setActiveTab,
    syncState,
    triggerManualSync
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const daysRemaining = getNeet2027DaysRemaining();

  const toggleDarkMode = () => {
    updateSettings({ isDarkMode: !settings.isDarkMode });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B132B]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2.5 max-w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Target Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-sky-500 to-indigo-500 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-sky-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  NEET Tracker
                </span>
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-sky-500/30 to-indigo-500/30 text-sky-300 border border-sky-500/40 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  2027
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                FocusForge • 81 NCERT Hub & Blocker
              </p>
            </div>
          </button>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Synced Status Pill (Matching Screenshot with Offline resilience) */}
          <button
            onClick={triggerManualSync}
            title={
              syncState === 'Offline'
                ? 'Offline mode: all changes saved locally on this device.'
                : `Sync status: ${syncState}. Click to re-sync.`
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              syncState === 'Synced'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : syncState === 'Syncing'
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 animate-pulse'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
            }`}
          >
            {syncState === 'Offline' ? (
              <WifiOff className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <CheckCircle2
                className={`w-3.5 h-3.5 ${syncState === 'Syncing' ? 'animate-spin' : ''}`}
              />
            )}
            <span className="hidden xs:inline">
              {syncState === 'Offline' ? 'Offline Ready' : syncState}
            </span>
          </button>

          {/* NEET 2027 Countdown Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>{daysRemaining} Days</span>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{userProfile.streakDays}d</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={settings.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B132B]" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#1C2541] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    {unreadNotificationCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500 text-white">
                        {unreadNotificationCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        notif.isRead
                          ? 'bg-slate-800/40 border-slate-700/40 opacity-75'
                          : 'bg-sky-950/40 border-sky-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-white">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-sky-500/40"
            />
            <span className="text-xs font-semibold text-slate-200 hidden lg:block">
              {userProfile.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

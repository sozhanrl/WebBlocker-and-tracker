import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { AppCategory, BlockedApp } from '../../types';
import {
  Search,
  Shield,
  ShieldAlert,
  Smartphone,
  Clock,
  Instagram,
  Youtube,
  Gamepad2,
  Share2,
  MessageCircle,
  Globe,
  Tv,
  ShoppingBag,
  Sliders
} from 'lucide-react';
import { Button } from '../common/Button';

export const AppBlocker: React.FC = () => {
  const { blockedApps, toggleAppBlocked, updateAppLimit, triggerSimulatedBlock } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingLimitApp, setEditingLimitApp] = useState<BlockedApp | null>(null);
  const [newLimitMinutes, setNewLimitMinutes] = useState<number>(15);

  const categories: string[] = ['All', 'Social Media', 'Entertainment', 'Games', 'Browsers', 'Messaging', 'Shopping'];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Instagram': return <Instagram className="w-5 h-5 text-pink-400" />;
      case 'Youtube': return <Youtube className="w-5 h-5 text-red-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      case 'Share2': return <Share2 className="w-5 h-5 text-blue-400" />;
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-emerald-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-sky-400" />;
      case 'Tv': return <Tv className="w-5 h-5 text-red-500" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-amber-400" />;
      default: return <Smartphone className="w-5 h-5 text-slate-400" />;
    }
  };

  const filteredApps = blockedApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalBlockedCount = blockedApps.filter(a => a.isBlocked).length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Search */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Application Blocking Guard
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {totalBlockedCount} of {blockedApps.length} apps locked during study blocks
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search installed apps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* App List */}
      <div className="space-y-2.5">
        {filteredApps.map((app) => (
          <Card
            key={app.id}
            className={`p-4 flex items-center justify-between gap-3 transition-all ${
              app.isBlocked ? 'border-rose-500/30 bg-[#1C2541]/90' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center flex-shrink-0">
                {getIcon(app.iconName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{app.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                    {app.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    {app.packageName}
                  </span>
                  {app.dailyLimitMinutes !== undefined && (
                    <span className="flex items-center gap-1 text-sky-400 font-medium">
                      <Clock className="w-3 h-3" />
                      Limit: {app.dailyLimitMinutes > 0 ? `${app.dailyLimitMinutes}m/day` : 'Strict 0m'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions & Toggle */}
            <div className="flex items-center gap-3">
              {app.isBlocked && (
                <button
                  onClick={() => triggerSimulatedBlock(app.name, undefined, `Direct test interception for ${app.name}`)}
                  className="hidden sm:inline-block text-[11px] text-slate-400 hover:text-rose-400 font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                  title="Simulate opening this app"
                >
                  Test Block
                </button>
              )}

              {/* Set Limit Button */}
              <button
                onClick={() => {
                  setEditingLimitApp(app);
                  setNewLimitMinutes(app.dailyLimitMinutes ?? 15);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Configure daily usage limit"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={app.isBlocked}
                  onChange={() => toggleAppBlocked(app.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>
          </Card>
        ))}

        {filteredApps.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-400">No applications matched your search or filter.</p>
          </Card>
        )}
      </div>

      {/* Edit Limit Modal */}
      {editingLimitApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#1C2541] border border-white/10 p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white">
              Daily Usage Limit for {editingLimitApp.name}
            </h4>
            <p className="text-xs text-slate-400">
              When usage reaches this limit, {editingLimitApp.name} will be blocked automatically.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[0, 15, 30, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => setNewLimitMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    newLimitMinutes === mins
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mins === 0 ? '0m (Strict)' : `${mins}m`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingLimitApp(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  updateAppLimit(editingLimitApp.id, newLimitMinutes);
                  setEditingLimitApp(null);
                }}
              >
                Save Limit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

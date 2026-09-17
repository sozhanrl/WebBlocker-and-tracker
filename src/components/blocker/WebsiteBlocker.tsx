import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Globe, Plus, Trash2, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react';

export const WebsiteBlocker: React.FC = () => {
  const {
    blockedWebsites,
    addBlockedWebsite,
    removeBlockedWebsite,
    toggleWebsiteBlocked,
    triggerSimulatedBlock
  } = useApp();

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Social Media');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Social Media', 'Entertainment', 'Games', 'Short Videos', 'News / Surfing', 'Other'];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    // Basic domain clean-up
    let cleanUrl = url.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '');

    addBlockedWebsite(cleanUrl, name || cleanUrl, category);
    setUrl('');
    setName('');
    setShowAddForm(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            Website & URL Blocker
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Block distracting domains and subdomains during NEET focus hours
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          {showAddForm ? 'Close Form' : 'Add Website'}
        </Button>
      </Card>

      {/* Add Website Form */}
      {showAddForm && (
        <Card className="p-5 border-sky-500/30 animate-in fade-in duration-150">
          <h4 className="text-sm font-bold text-white mb-3">Add Distracting Website</h4>
          <form onSubmit={handleAdd} className="space-y-3">
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Domain or URL *</label>
                <input
                  type="text"
                  placeholder="e.g. reddit.com or youtube.com/shorts"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Friendly Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Reddit Frontpage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add to Blocklist
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Websites List */}
      <div className="space-y-2.5">
        {blockedWebsites.map((site) => (
          <Card
            key={site.id}
            className={`p-4 flex items-center justify-between gap-3 transition-all ${
              site.isBlocked ? 'border-rose-500/30 bg-[#1C2541]/90' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center flex-shrink-0 text-sky-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{site.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {site.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                  <span>{site.url}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {site.isBlocked && (
                <button
                  onClick={() => triggerSimulatedBlock(site.name, site.url, `Direct test interception for ${site.url}`)}
                  className="hidden sm:inline-block text-[11px] text-slate-400 hover:text-rose-400 font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                  title="Simulate opening this website"
                >
                  Test Block
                </button>
              )}

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={site.isBlocked}
                  onChange={() => toggleWebsiteBlocked(site.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>

              {/* Delete Button */}
              <button
                onClick={() => removeBlockedWebsite(site.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                title="Remove from blocklist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}

        {blockedWebsites.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-400">No websites added to blocklist yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

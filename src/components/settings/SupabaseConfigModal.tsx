import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, updateSupabaseConfig, isSupabaseConfigured } from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(supabaseUrl);
  const [key, setKey] = useState(supabaseAnonKey);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig(url.trim(), key.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
      window.location.reload();
    }, 800);
  };

  const handleClear = () => {
    updateSupabaseConfig('', '');
    setUrl('');
    setKey('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
      window.location.reload();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Synchronization"
      subtitle="Connect FocusForge to your PostgreSQL cloud instance"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Settings saved! Reloading client...</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-400 leading-relaxed">
          <p>
            By default, FocusForge runs in <strong className="text-white">offline-first mode</strong> with instant reactive local storage. Connect your own Supabase project below for permanent cross-device sync.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Supabase Project URL</label>
          <input
            type="url"
            placeholder="https://your-project.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Supabase Anon Public API Key</label>
          <input
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isSupabaseConfigured ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-400 hover:underline"
            >
              Disconnect Cloud Sync
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save & Connect
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load optional credentials from localStorage or Vite env
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('focusforge_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('focusforge_supabase_key') : null;

export const supabaseUrl = storedUrl || import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function updateSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('focusforge_supabase_url', url);
      localStorage.setItem('focusforge_supabase_key', key);
    } else {
      localStorage.removeItem('focusforge_supabase_url');
      localStorage.removeItem('focusforge_supabase_key');
    }
  }
}

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { StorageService } from './storage';

export type CloudSyncStatus = 'Synced' | 'Syncing' | 'Offline' | 'Sync Failed';

// Stored settings override or Vite env
const getStoredConfig = () => {
  if (typeof window === 'undefined') return { url: '', key: '' };
  return {
    url: localStorage.getItem('focusforge_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '',
    key: localStorage.getItem('focusforge_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

const config = getStoredConfig();

export const isCloudConfigured = Boolean(config.url && config.key);

export const supabaseClient: SupabaseClient | null = isCloudConfigured
  ? createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export class SupabaseService {
  private static syncListeners: Array<(status: CloudSyncStatus) => void> = [];
  private static currentStatus: CloudSyncStatus = isCloudConfigured ? 'Synced' : 'Offline';

  static getStatus(): CloudSyncStatus {
    return this.currentStatus;
  }

  static onStatusChange(callback: (status: CloudSyncStatus) => void): () => void {
    this.syncListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
    };
  }

  private static setStatus(status: CloudSyncStatus) {
    this.currentStatus = status;
    this.syncListeners.forEach((cb) => cb(status));
  }

  // ---------------- AUTHENTICATION ----------------
  static async getCurrentUser(): Promise<User | null> {
    if (!supabaseClient) return null;
    try {
      const { data } = await supabaseClient.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  }

  static async signUp(email: string, password: string, name: string): Promise<{ user: User | null; error?: string }> {
    if (!supabaseClient) {
      return { user: null, error: 'Missing cloud configuration. Please set your Supabase URL & Anon Key.' };
    }
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() }
        }
      });
      if (error) return { user: null, error: this.formatAuthError(error) };
      return { user: data.user };
    } catch (err: any) {
      return { user: null, error: this.formatAuthError(err) };
    }
  }

  static async signIn(email: string, password: string): Promise<{ user: User | null; error?: string }> {
    if (!supabaseClient) {
      return { user: null, error: 'Missing cloud configuration.' };
    }
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) return { user: null, error: this.formatAuthError(error) };
      return { user: data.user };
    } catch (err: any) {
      return { user: null, error: this.formatAuthError(err) };
    }
  }

  static async signOut(): Promise<void> {
    if (!supabaseClient) return;
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn('Sign-out error:', e);
    }
  }

  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!supabaseClient) {
      return { success: false, error: 'Missing cloud configuration.' };
    }
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim());
      if (error) return { success: false, error: this.formatAuthError(error) };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: this.formatAuthError(err) };
    }
  }

  // ---------------- CLOUD DATA SYNCHRONIZATION ----------------
  static async syncAll(): Promise<{ success: boolean; message: string }> {
    if (!supabaseClient) {
      this.setStatus('Offline');
      return { success: false, message: 'Offline mode active (Local storage).' };
    }

    try {
      this.setStatus('Syncing');
      const user = await this.getCurrentUser();
      if (!user) {
        this.setStatus('Offline');
        return { success: false, message: 'Not logged in. Stored locally.' };
      }

      const chapters = StorageService.getChapters();
      const dailyRecords = StorageService.getAllDailyRecords();
      const mockTests = StorageService.getMockTests();

      // Upsert chapter progress with user ownership
      const chapterRows = chapters.map((c) => ({
        user_id: user.id,
        subject: c.subject,
        title: c.name,
        status: c.status,
        completion_percentage: c.completion_percentage,
        questions_solved: c.questions_solved,
        questions_correct: c.correct_answers,
        questions_wrong: c.incorrect_answers,
        revision_count: c.revision_count,
        notes: c.notes,
        last_revision_date: c.last_studied_date,
        updated_at: new Date().toISOString()
      }));

      const { error: chErr } = await supabaseClient
        .from('neet_chapters')
        .upsert(chapterRows, { onConflict: 'user_id,subject,title' });

      if (chErr) console.warn('Cloud chapter sync warning:', chErr.message);

      this.setStatus('Synced');
      return { success: true, message: 'Synchronized with Supabase cloud.' };
    } catch (err: any) {
      console.error('Cloud sync failure:', err);
      this.setStatus('Sync Failed');
      return { success: false, message: `Sync failed: ${err.message || 'Network failure'}` };
    }
  }

  // Format auth errors to clean, descriptive strings
  static formatAuthError(error: any): string {
    const msg = error?.message?.toLowerCase() || '';
    if (msg.includes('email not confirmed')) return 'Email not confirmed. Please check your inbox or click the verification link.';
    if (msg.includes('rate limit')) return 'Email rate limit exceeded. Please wait a few moments before trying again.';
    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) return 'Invalid email or password.';
    if (msg.includes('already registered') || msg.includes('user already exists')) return 'An account with this email is already registered.';
    if (msg.includes('failed to fetch') || msg.includes('network')) return 'Network failure. Please check your internet connection.';
    return error?.message || 'Authentication error. Please try again.';
  }
}

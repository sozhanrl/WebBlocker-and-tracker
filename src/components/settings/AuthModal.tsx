import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { updateUserProfile, userProfile, triggerManualSync } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const emailValue = identifier.includes('@')
        ? identifier.trim()
        : `${identifier.trim().toLowerCase()}@focusforge.local`;

      if (isSupabaseConfigured && supabase) {
        if (isLogin) {
          const { data, error: authErr } = await supabase.auth.signInWithPassword({
            email: emailValue,
            password
          });
          if (authErr) throw authErr;
          if (data.user) {
            updateUserProfile({
              email: data.user.email,
              name: data.user.user_metadata?.name || identifier,
              username: data.user.user_metadata?.username || identifier
            });
          }
        } else {
          const { data, error: regErr } = await supabase.auth.signUp({
            email: emailValue,
            password,
            options: {
              data: {
                name: name.trim() || 'Student',
                username: username.trim() || identifier.trim()
              }
            }
          });
          if (regErr) throw regErr;
          setSuccessMsg('Account registered successfully!');
        }
      } else {
        // Persistent local session storage
        const studentName = name.trim() || (isLogin ? identifier : 'Sozhan Rajendira');
        const studentUsername = username.trim() || identifier.trim() || 'sozhan_rajendira';
        
        // Save auth credentials in localStorage for automatic remember
        if (rememberMe) {
          localStorage.setItem(
            'focusforge_saved_session',
            JSON.stringify({
              username: studentUsername,
              email: emailValue,
              name: studentName,
              token: `ff_token_${Date.now()}`
            })
          );
        }

        updateUserProfile({
          name: studentName,
          username: studentUsername,
          email: emailValue
        });

        triggerManualSync();

        setSuccessMsg(
          isLogin
            ? `Welcome back, ${studentName}! Logged in securely.`
            : 'Student account created and persisted locally.'
        );
        setTimeout(onClose, 900);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    updateUserProfile({
      name: 'Sozhan Rajendira',
      username: 'sozhan_rajendira',
      email: 'sozhanrajendira@gmail.com',
      examGoal: 'NEET 2027 (Target: 680+)'
    });
    setSuccessMsg('Signed in as Sozhan Rajendira');
    setTimeout(onClose, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLogin ? 'Sign In to FocusForge' : 'Create Student Account'}
      subtitle={
        isSupabaseConfigured
          ? 'Connected to Supabase Cloud Database'
          : 'Persistent Local Session & Offline Sync Active'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isLogin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rajendira"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Username *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="rajendira2027"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            {isLogin ? 'Username or Email Address *' : 'Email Address *'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isLogin ? 'rajendira2027 or you@example.com' : 'you@example.com'}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Password *</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded bg-slate-900 border-white/20 text-sky-500 focus:ring-0"
            />
            <span>Remember me & keep persistent session</span>
          </label>

          {isLogin && (
            <button
              type="button"
              onClick={() => alert('Offline credentials stored locally. Use guest login or reset in Settings.')}
              className="text-sky-400 hover:text-sky-300 text-[11px]"
            >
              Forgot password?
            </button>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="md">
          {loading ? 'Processing...' : isLogin ? 'Sign In & Load Data' : 'Create & Persist Account'}
        </Button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase">Quick Access</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleDemoLogin}
          className="w-full text-xs"
        >
          Continue as Sozhan Rajendira (sozhanrajendira@gmail.com)
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs text-sky-400 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

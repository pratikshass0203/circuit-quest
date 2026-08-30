import { useState, useEffect } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

export default function AuthModal({ open, onClose, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  useEffect(() => { setMode(initialMode); }, [initialMode, open]);
  useEffect(() => { if (open) { setError(''); setEmail(''); setPassword(''); } }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    onClose();
  };

  const switchMode = (m: 'signin' | 'signup') => { setMode(m); setError(''); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#0a1628] border border-[#142952] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#0f2040] transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 font-mono mb-1.5">EMAIL</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-[#0f2040] border border-[#142952] text-white placeholder-slate-600 text-sm focus:border-[#00d4aa]/50 focus:outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-mono mb-1.5">PASSWORD</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-[#0f2040] border border-[#142952] text-white placeholder-slate-600 text-sm focus:border-[#00d4aa]/50 focus:outline-none transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors text-sm disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'signin' ? <><LogIn size={16} /> Sign In</> : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} className="text-[#00d4aa] hover:underline font-medium">
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

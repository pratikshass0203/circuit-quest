import { useState } from 'react';
import { CircuitBoard, Menu, X, LogIn, UserPlus, Download, LogOut, User } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onAuthClick: (mode: 'signin' | 'signup') => void;
}

const LINKS = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Modules', href: '#modules' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Navbar({ onAuthClick }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const { user, signOut } = useAuth();

  const handleInstall = async () => { await promptInstall(); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/80 backdrop-blur-lg border-b border-[#142952]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center group-hover:bg-[#00d4aa]/20 transition-colors">
              <CircuitBoard size={18} className="text-[#00d4aa]" />
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CircuitQuest</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {LINKS.map(l => (
              <a key={l.href} href={l.href} className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-[#0f2040]">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {canInstall && !isInstalled && (
              <button onClick={handleInstall} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 hover:text-white hover:border-[#00d4aa]/40 text-sm transition-colors">
                <Download size={14} /> Install
              </button>
            )}
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(m => !m)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 hover:text-white transition-colors text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] flex items-center justify-center text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0f2040] border border-[#142952] shadow-xl py-1" onMouseLeave={() => setMenuOpen(false)}>
                    <div className="px-3 py-2 text-xs text-slate-500 border-b border-[#142952] flex items-center gap-2">
                      <User size={12} /> {user.email}
                    </div>
                    <a href="#dashboard" className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-[#0a1628]">Dashboard</a>
                    <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-red-400 hover:bg-[#0a1628] flex items-center gap-2">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => onAuthClick('signin')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-slate-300 hover:text-white text-sm transition-colors">
                  <LogIn size={15} /> Sign In
                </button>
                <button onClick={() => onAuthClick('signup')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] text-sm transition-colors">
                  <UserPlus size={15} /> Get Started
                </button>
              </>
            )}
          </div>

          <button onClick={() => setOpen(o => !o)} className="md:hidden p-2 text-slate-400 hover:text-white">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0f2040] text-sm">
                {l.label}
              </a>
            ))}
            {canInstall && !isInstalled && (
              <button onClick={() => { handleInstall(); setOpen(false); }} className="w-full flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white text-sm">
                <Download size={15} /> Install App
              </button>
            )}
            {user ? (
              <button onClick={() => { signOut(); setOpen(false); }} className="w-full flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-slate-300 hover:text-red-400 text-sm">
                <LogOut size={15} /> Sign Out
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <button onClick={() => { onAuthClick('signin'); setOpen(false); }} className="flex-1 px-4 py-2.5 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 text-sm">Sign In</button>
                <button onClick={() => { onAuthClick('signup'); setOpen(false); }} className="flex-1 px-4 py-2.5 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold text-sm">Get Started</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

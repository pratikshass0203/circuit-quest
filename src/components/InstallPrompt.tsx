import { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallPrompt() {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!canInstall || isInstalled || dismissed) { setVisible(false); return; }
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, dismissed]);

  if (!visible || isInstalled) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) setVisible(false);
  };

  const handleDismiss = () => { setDismissed(true); setVisible(false); };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slide-up">
      <div className="bg-[#0a1628] border border-[#00d4aa]/30 rounded-2xl p-4 shadow-2xl shadow-[#00d4aa]/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/15 border border-[#00d4aa]/30 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-[#00d4aa]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white mb-0.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Install CircuitQuest</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">Practice offline, anytime. Add CircuitQuest to your home screen.</p>
            <div className="flex gap-2">
              <button onClick={handleInstall} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold text-xs hover:bg-[#2fe0c0] transition-colors">
                <Download size={13} /> Install Now
              </button>
              <button onClick={handleDismiss} className="px-3 py-2 rounded-lg text-slate-500 hover:text-white text-xs transition-colors">
                Maybe later
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 rounded-lg text-slate-600 hover:text-white hover:bg-[#0f2040] transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

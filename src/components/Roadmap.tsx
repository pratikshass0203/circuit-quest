import { Rocket, Check } from 'lucide-react';

const MILESTONES = [
  { phase: 'Q1 2025', title: 'MVP Launch', status: 'done', items: ['6 core game modules', 'XP & badge system', 'Basic leaderboard', 'PWA offline support'] },
  { phase: 'Q2 2025', title: 'Campus Edition', status: 'active', items: ['Batch management', 'Faculty dashboard', 'Custom question sets', 'Group leaderboards'] },
  { phase: 'Q3 2025', title: 'AI Tutor', status: 'planned', items: ['Adaptive question generation', 'Personalized hints', 'Weakness detection', 'Study plan builder'] },
  { phase: 'Q4 2025', title: 'Mobile Apps', status: 'planned', items: ['Native iOS app', 'Native Android app', 'Push notifications', 'Cross-device sync'] },
];

const STATUS_STYLES: Record<string, { dot: string; badge: string; border: string }> = {
  done: { dot: 'bg-green-400', badge: 'bg-green-500/10 text-green-400 border-green-500/20', border: 'border-green-500/30' },
  active: { dot: 'bg-[#00d4aa] animate-pulse', badge: 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20', border: 'border-[#00d4aa]/40' },
  planned: { dot: 'bg-slate-600', badge: 'bg-[#0f2040] text-slate-400 border-[#142952]', border: 'border-[#142952]' },
};

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 px-4 bg-[#0a1628]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#00d4aa] uppercase tracking-wider">Roadmap</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            What's Coming Next
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We're shipping fast. Here's what's on the horizon for CircuitQuest.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {MILESTONES.map((m, i) => {
            const style = STATUS_STYLES[m.status];
            return (
              <div key={i} className={`bg-[#0f2040] border ${style.border} rounded-xl p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <span className="text-xs font-mono text-slate-500">{m.phase}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${style.badge}`}>{m.status}</span>
                </div>
                <h3 className="text-white font-bold mb-3 flex items-center gap-1.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <Rocket size={15} className="text-[#00d4aa]" /> {m.title}
                </h3>
                <ul className="space-y-1.5">
                  {m.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-slate-400">
                      <Check size={12} className="text-[#00d4aa] flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

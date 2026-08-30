import { Gamepad2, Zap, Trophy, RefreshCw, BarChart3 } from 'lucide-react';

const FEATURES = [
  { icon: Gamepad2, title: 'Game-Based Modules', desc: 'Six interactive modules turn each topic into a playable challenge with instant feedback.' },
  { icon: Zap, title: 'Instant Feedback', desc: 'Every answer is checked immediately. Wrong guesses explain why, building real intuition.' },
  { icon: Trophy, title: 'XP, Badges & Streaks', desc: 'Gamified progression keeps students coming back daily to maintain streaks and earn badges.' },
  { icon: RefreshCw, title: 'Adaptive Difficulty', desc: 'Questions scale from basic to advanced based on performance, so everyone stays in flow.' },
  { icon: BarChart3, title: 'Live Leaderboards', desc: 'Class and global rankings drive healthy competition and measurable progress tracking.' },
  { icon: Gamepad2, title: 'Offline First', desc: 'PWA support lets students practice anywhere — no internet required after the first download.' },
];

export default function Solution() {
  return (
    <section id="solution" className="py-20 px-4 bg-[#0a1628]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#00d4aa] uppercase tracking-wider">The Solution</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Learn by Playing, Not by Memorizing
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            CircuitQuest turns digital electronics into an interactive game. Students solve puzzles, build circuits, and compete — while mastering every concept along the way.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-[#0f2040] border border-[#142952] rounded-xl p-5 hover:border-[#00d4aa]/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-[#00d4aa]" />
                </div>
                <h3 className="text-white font-semibold mb-1.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

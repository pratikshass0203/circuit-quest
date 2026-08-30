import { Gamepad2, Wifi, Gauge, GraduationCap, Code2, ShieldCheck } from 'lucide-react';

const ADVANTAGES = [
  { icon: Gamepad2, title: 'Game-First Approach', desc: 'Every concept is a playable challenge, not a passive lecture. Engagement is built into the core design.' },
  { icon: Wifi, title: 'Offline-First PWA', desc: 'Students practice anywhere — on campus, on the train, at home — without needing a constant connection.' },
  { icon: Gauge, title: 'Adaptive Difficulty', desc: 'Questions scale automatically to each student\'s level, keeping everyone in the optimal learning zone.' },
  { icon: GraduationCap, title: 'Campus-Ready', desc: 'Built-in batch management, faculty dashboards, and group leaderboards designed for real classrooms.' },
  { icon: Code2, title: 'Open Architecture', desc: 'Modular question system lets educators create custom question sets for their specific curriculum.' },
  { icon: ShieldCheck, title: 'Verified Content', desc: 'Every question is reviewed for accuracy and aligned with standard digital electronics curricula.' },
];

export default function Competitive() {
  return (
    <section id="competitive" className="py-20 px-4 bg-[#0a1628]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#00d4aa] uppercase tracking-wider">Why CircuitQuest</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Built Different, By Design
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Other platforms digitize textbooks. We turned digital electronics into a game students actually want to play.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADVANTAGES.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="bg-[#0f2040] border border-[#142952] rounded-xl p-5 hover:border-[#00d4aa]/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-[#00d4aa]" />
                </div>
                <h3 className="text-white font-semibold mb-1.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{a.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

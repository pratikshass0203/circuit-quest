import { Binary, Workflow, CircuitBoard, Cpu, Map } from 'lucide-react';

const LEVELS = [
  { icon: Binary, title: 'Logic Gates', desc: 'Master AND, OR, XOR, NAND, NOR through truth-table puzzles.', modules: 'Gate Puzzler', color: '#00d4aa' },
  { icon: CircuitBoard, title: 'Circuit Design', desc: 'Build and simulate combinational circuits with real-time feedback.', modules: 'Circuit Builder', color: '#60a5fa' },
  { icon: Workflow, title: 'Sequential Logic', desc: 'Understand flip-flops, counters, and finite state machines.', modules: 'State Machine', color: '#f59e0b' },
  { icon: Cpu, title: 'CPU Architecture', desc: 'Step through instructions, registers, and memory in real time.', modules: 'CPU Boss', color: '#a78bfa' },
  { icon: Map, title: 'Optimization', desc: 'Simplify Boolean expressions and master timing diagrams.', modules: 'Power Quest + Waveform Lab', color: '#ec4899' },
];

export default function CurriculumMap() {
  return (
    <section id="modules" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#00d4aa] uppercase tracking-wider">Curriculum</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            From Gates to CPUs
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A progressive journey through digital electronics — each level builds on the last, turning fundamentals into intuition.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[#142952] hidden sm:block" />
          <div className="space-y-5">
            {LEVELS.map((lvl, i) => {
              const Icon = lvl.icon;
              return (
                <div key={i} className="relative flex items-start gap-4 sm:pl-16">
                  <div className="absolute left-0 top-0 w-12 h-12 rounded-xl bg-[#0f2040] border border-[#142952] flex items-center justify-center sm:z-10 hidden sm:flex">
                    <Icon size={20} style={{ color: lvl.color }} />
                  </div>
                  <div className="flex-1 sm:hidden">
                    <div className="w-12 h-12 rounded-xl bg-[#0f2040] border border-[#142952] flex items-center justify-center mb-3">
                      <Icon size={20} style={{ color: lvl.color }} />
                    </div>
                  </div>
                  <div className="flex-1 bg-[#0a1628] border border-[#142952] rounded-xl p-5 hover:border-[#00d4aa]/30 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{lvl.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 font-mono">Level {i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-2">{lvl.desc}</p>
                    <span className="text-xs text-slate-500 font-mono">→ {lvl.modules}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Grid2x2 as Grid, Cpu, Waves, Battery, Workflow, Trophy, CircuitBoard, type LucideIcon } from 'lucide-react';
import ModuleModal, { type ModuleInfo } from './ModuleModal';

const modules: ModuleInfo[] = [
  { id: 'gate-puzzler', icon: CircuitBoard, title: 'Gate Puzzler', desc: 'Solve logic gate challenges to build Boolean intuition.', tag: 'Logic Gates', xp: 100 },
  { id: 'circuit-builder', icon: Cpu, title: 'Circuit Builder', desc: 'Design combinational circuits from truth tables.', tag: 'Combinational', xp: 150 },
  { id: 'waveform-lab', icon: Waves, title: 'Waveform Lab', desc: 'Visualize and manipulate timing diagrams in real time.', tag: 'Timing', xp: 120 },
  { id: 'power-quest', icon: Battery, title: 'Power Quest', desc: 'Optimize circuits for power and propagation delay.', tag: 'Optimization', xp: 130 },
  { id: 'state-machine', icon: Workflow, title: 'State Machine', desc: 'Design finite state machines to control sequential logic.', tag: 'Sequential', xp: 200 },
  { id: 'cpu-boss', icon: Trophy, title: 'CPU Boss', desc: 'Build a working CPU from the ALU up to the control unit.', tag: 'Architecture', xp: 300 },
];

export default function GameModules() {
  const [activeModule, setActiveModule] = useState<ModuleInfo | null>(null);

  return (
    <section id="modules" className="py-24 px-6 bg-[#0f2040]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#142952] bg-[#0a1628] mb-6">
            <Grid className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-sm text-gray-300">Game Modules</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Six Modules, One Mastery Path
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Each module targets a core concept through guided, interactive gameplay. Click any module to start.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon as LucideIcon;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m)}
                className="group p-8 rounded-2xl border border-[#142952] bg-[#0a1628] hover:border-[#00d4aa]/50 hover:-translate-y-1 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center group-hover:bg-[#00d4aa]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#00d4aa]" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono group-hover:text-[#00d4aa] transition-colors">+{m.xp} XP</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {m.title}
                </h3>
                <p className="text-gray-400 text-sm">{m.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-[#00d4aa] transition-colors">
                  {m.tag}
                  <span className="ml-1">→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeModule && <ModuleModal module={activeModule} onClose={() => setActiveModule(null)} />}
    </section>
  );
}

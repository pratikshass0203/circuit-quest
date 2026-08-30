import { useState } from 'react';
import { X, Trophy, Play, BookOpen, ClipboardList, type LucideIcon } from 'lucide-react';
import LogicGatePuzzle from './LogicGatePuzzle';
import WaveformShowcase from './WaveformShowcase';
import CircuitBuilderDemo from './CircuitBuilderDemo';
import PowerQuestDemo from './PowerQuestDemo';
import StateMachineDemo from './StateMachineDemo';
import CpuBossDemo from './CpuBossDemo';
import QuestionPlayer from './QuestionPlayer';
import TestSeries from './TestSeries';

export type ModuleId = 'gate-puzzler' | 'circuit-builder' | 'waveform-lab' | 'power-quest' | 'state-machine' | 'cpu-boss';

export interface ModuleInfo {
  id: ModuleId;
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
  xp: number;
  locked?: boolean;
}

const moduleContent: Record<ModuleId, { component: React.ReactNode; objectives: string[] }> = {
  'gate-puzzler': {
    component: <LogicGatePuzzle />,
    objectives: ['Understand AND, OR, NOT, XOR, NAND, NOR gates', 'Predict outputs from truth tables', 'Build intuition for Boolean logic'],
  },
  'circuit-builder': {
    component: <CircuitBuilderDemo />,
    objectives: ['Place gates on a grid', 'Wire inputs to outputs', 'Test your circuit live'],
  },
  'waveform-lab': {
    component: <WaveformShowcase />,
    objectives: ['Visualize clock and data signals', 'Understand timing relationships', 'Identify signal propagation'],
  },
  'power-quest': {
    component: <PowerQuestDemo />,
    objectives: ['Minimize gate count', 'Reduce power consumption', 'Simplify Boolean expressions'],
  },
  'state-machine': {
    component: <StateMachineDemo />,
    objectives: ['Design finite state machines', 'Define states and transitions', 'Navigate a story dungeon'],
  },
  'cpu-boss': {
    component: <CpuBossDemo />,
    objectives: ['Understand ALU operations', 'Execute simple instructions', 'Build a mini CPU pipeline'],
  },
};

export default function ModuleModal({ module, onClose }: { module: ModuleInfo; onClose: () => void }) {
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'questions' | 'test'>('demo');
  const content = moduleContent[module.id];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-[#060e1a]/80 backdrop-blur-sm" />
      <div
        className="relative bg-[#0a1628] border border-[#142952] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#0a1628]/95 backdrop-blur-md border-b border-[#142952] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">{module.title}</h3>
            <p className="text-slate-500 text-xs">{module.desc}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <Trophy size={12} className="text-[#00d4aa]" />
              <span className="font-mono">+{module.xp} XP</span>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-lg bg-[#142952] border border-[#1a3366] flex items-center justify-center hover:bg-[#1a3366] transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!started ? (
            <div className="py-8">
              <div className="mb-8">
                <h4 className="text-[#00d4aa] text-sm font-semibold mb-4 tracking-wide">LEARNING OBJECTIVES</h4>
                <ul className="space-y-3">
                  {content.objectives.map((obj, i) => (
                    <li key={obj} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="w-6 h-6 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center text-[#00d4aa] text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setStarted(true)} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors glow-teal">
                <Play size={18} /> Start Module
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2 mb-6 border-b border-[#142952] pb-3">
                <button
                  onClick={() => setActiveTab('demo')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'demo' ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-white'}`}
                >
                  <Play size={14} /> Interactive Demo
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'questions' ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-white'}`}
                >
                  <BookOpen size={14} /> Question Bank
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'test' ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-white'}`}
                >
                  <ClipboardList size={14} /> Test Series
                </button>
              </div>

              {activeTab === 'demo' ? content.component : activeTab === 'questions' ? <QuestionPlayer moduleId={module.id} moduleName={module.title} /> : <TestSeries moduleId={module.id} moduleName={module.title} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

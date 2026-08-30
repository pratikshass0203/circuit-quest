import { useState, useCallback } from 'react';
import { Workflow, ArrowRight } from 'lucide-react';

interface State {
  id: string;
  label: string;
  x: number;
  y: number;
}

const STATES: State[] = [
  { id: 'S0', label: 'IDLE', x: 80, y: 100 },
  { id: 'S1', label: 'READ', x: 260, y: 50 },
  { id: 'S2', label: 'EXEC', x: 260, y: 150 },
  { id: 'S3', label: 'WRITE', x: 440, y: 100 },
];

// transitions[currentState][input] = nextState
const TRANSITIONS: Record<string, [string, string]> = {
  S0: ['S1', 'S0'], // input 0 -> S1(READ), input 1 -> S0(IDLE)
  S1: ['S2', 'S0'], // input 0 -> S2(EXEC), input 1 -> S0(IDLE)
  S2: ['S3', 'S0'], // input 0 -> S3(WRITE), input 1 -> S0(IDLE)
  S3: ['S0', 'S0'], // input 0 -> S0(IDLE), input 1 -> S0(IDLE)
};

export default function StateMachineDemo() {
  const [current, setCurrent] = useState('S0');
  const [history, setHistory] = useState<string[]>(['S0']);

  const trigger = useCallback((input: 0 | 1) => {
    setCurrent(prev => {
      const next = TRANSITIONS[prev][input];
      setHistory(h => [...h.slice(-6), next]);
      return next;
    });
  }, []);

  const reset = useCallback(() => { setCurrent('S0'); setHistory(['S0']); }, []);

  const activeState = STATES.find(s => s.id === current)!;

  return (
    <div className="bg-[#0a1628] border border-[#142952] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
            <Workflow size={16} className="text-[#00d4aa]" />
          </div>
          <h3 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>State Machine Simulator</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">Current: <span className="text-[#00d4aa] font-semibold">{activeState.label}</span></span>
      </div>

      <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-4 mb-5">
        <svg viewBox="0 0 520 200" className="w-full h-44">
          {/* Transitions */}
          {STATES.map(s => {
            const [t0, t1] = TRANSITIONS[s.id];
            const t0State = STATES.find(x => x.id === t0)!;
            const t1State = STATES.find(x => x.id === t1)!;
            return (
              <g key={s.id}>
                <line x1={s.x} y1={s.y} x2={t0State.x} y2={t0State.y}
                  stroke={current === s.id ? '#00d4aa' : '#142952'} strokeWidth="1.5" strokeDasharray="4 3"
                  markerEnd="url(#arrow)" opacity={current === s.id ? 0.6 : 0.4} />
                {t1 !== t0 && (
                  <line x1={s.x} y1={s.y} x2={t1State.x} y2={t1State.y}
                    stroke="#142952" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
                )}
              </g>
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#00d4aa" opacity="0.6" />
            </marker>
          </defs>
          {/* States */}
          {STATES.map(s => {
            const isActive = s.id === current;
            return (
              <g key={s.id}>
                <circle cx={s.x} cy={s.y} r="26" fill={isActive ? '#00d4aa' : '#0a1628'}
                  stroke={isActive ? '#00d4aa' : '#142952'} strokeWidth="2" />
                <text x={s.x} y={s.y - 2} textAnchor="middle" fontSize="11" fontWeight="bold"
                  fill={isActive ? '#0a1628' : '#94a3b8'} fontFamily="monospace">{s.id}</text>
                <text x={s.x} y={s.y + 10} textAnchor="middle" fontSize="8"
                  fill={isActive ? '#0a1628' : '#64748b'} fontFamily="monospace">{s.label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-xs text-slate-500 font-mono">Input:</span>
        {[0, 1].map(v => (
          <button key={v} onClick={() => trigger(v as 0 | 1)}
            className="w-14 h-11 rounded-lg text-lg font-bold font-mono bg-[#0f2040] border border-[#142952] text-slate-300 hover:border-[#00d4aa]/40 hover:text-white transition-all">
            {v}
          </button>
        ))}
        <button onClick={reset} className="ml-2 px-3 py-2 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-white text-xs transition-colors">
          Reset
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-xs text-slate-500 font-mono">Trace:</span>
        {history.map((h, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${i === history.length - 1 ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'text-slate-500'}`}>{h}</span>
            {i < history.length - 1 && <ArrowRight size={10} className="text-slate-700" />}
          </span>
        ))}
      </div>
    </div>
  );
}

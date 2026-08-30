import { useState } from 'react';
import { Cpu, Play, RotateCcw, ChevronRight, Pause } from 'lucide-react';

interface Instruction {
  op: 'ADD' | 'SUB' | 'LOAD' | 'STORE';
  arg: string;
  comment: string;
}

const PROGRAM: Instruction[] = [
  { op: 'LOAD', arg: 'R1, #5', comment: 'R1 = 5' },
  { op: 'LOAD', arg: 'R2, #3', comment: 'R2 = 3' },
  { op: 'ADD', arg: 'R3, R1, R2', comment: 'R3 = R1 + R2' },
  { op: 'STORE', arg: 'M8, R3', comment: 'Mem[8] = R3' },
  { op: 'SUB', arg: 'R1, R1, R2', comment: 'R1 = R1 - R2' },
  { op: 'STORE', arg: 'M9, R1', comment: 'Mem[9] = R1' },
];

const OP_COLORS: Record<string, string> = {
  ADD: 'text-green-400',
  SUB: 'text-red-400',
  LOAD: 'text-blue-400',
  STORE: 'text-amber-400',
};

export default function CpuBossDemo() {
  const [pc, setPc] = useState(0);
  const [registers, setRegisters] = useState<Record<string, number>>({ R1: 0, R2: 0, R3: 0 });
  const [memory, setMemory] = useState<Record<string, number>>({ M8: 0, M9: 0 });
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const step = () => {
    if (pc >= PROGRAM.length) { setDone(true); setRunning(false); return; }
    const inst = PROGRAM[pc];
    setRegisters(prevR => {
      const r = { ...prevR };
      switch (inst.op) {
        case 'LOAD': {
          const [reg, val] = inst.arg.split(', ');
          r[reg] = Number(val.replace('#', ''));
          break;
        }
        case 'ADD': {
          const [dst, s1, s2] = inst.arg.split(', ');
          r[dst] = r[s1] + r[s2];
          break;
        }
        case 'SUB': {
          const [dst, s1, s2] = inst.arg.split(', ');
          r[dst] = r[s1] - r[s2];
          break;
        }
        case 'STORE': {
          const [mem, reg] = inst.arg.split(', ');
          setMemory(prevM => ({ ...prevM, [mem]: r[reg] }));
          break;
        }
      }
      return r;
    });
    setPc(p => {
      const next = p + 1;
      if (next >= PROGRAM.length) { setDone(true); setRunning(false); }
      return next;
    });
  };

  const reset = () => {
    setPc(0);
    setRegisters({ R1: 0, R2: 0, R3: 0 });
    setMemory({ M8: 0, M9: 0 });
    setRunning(false);
    setDone(false);
  };

  return (
    <div className="bg-[#0a1628] border border-[#142952] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
            <Cpu size={16} className="text-[#00d4aa]" />
          </div>
          <h3 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CPU Boss</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">PC: <span className="text-[#00d4aa] font-semibold">{Math.min(pc, PROGRAM.length)}/{PROGRAM.length}</span></span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Program */}
        <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-3">
          <div className="text-xs text-slate-500 font-mono mb-2 px-1">PROGRAM</div>
          <div className="space-y-1">
            {PROGRAM.map((inst, i) => (
              <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg font-mono text-xs transition-all ${
                i === pc && !done ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/30' : 'border border-transparent'
              }`}>
                <span className="text-slate-600 w-4">{i}</span>
                <span className={`font-bold w-12 ${OP_COLORS[inst.op]}`}>{inst.op}</span>
                <span className="text-slate-300 flex-1">{inst.arg}</span>
                <span className="text-slate-600 text-[10px]">{inst.comment}</span>
                {i === pc && !done && <ChevronRight size={12} className="text-[#00d4aa]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Registers & Memory */}
        <div className="space-y-3">
          <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-3">
            <div className="text-xs text-slate-500 font-mono mb-2 px-1">REGISTERS</div>
            <div className="grid grid-cols-3 gap-2">
              {['R1', 'R2', 'R3'].map(r => (
                <div key={r} className="bg-[#0a1628] border border-[#142952] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">{r}</div>
                  <div className="text-lg font-bold font-mono text-[#00d4aa]">{registers[r]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-3">
            <div className="text-xs text-slate-500 font-mono mb-2 px-1">MEMORY</div>
            <div className="grid grid-cols-2 gap-2">
              {['M8', 'M9'].map(m => (
                <div key={m} className="bg-[#0a1628] border border-[#142952] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">{m}</div>
                  <div className="text-lg font-bold font-mono text-amber-400">{memory[m]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={step} disabled={done}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {running ? <Pause size={15} /> : <Play size={15} />} Step
        </button>
        <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-white transition-colors text-sm">
          <RotateCcw size={15} /> Reset
        </button>
      </div>
      {done && <p className="text-center text-green-400 text-sm mt-3 font-medium">✓ Program complete!</p>}
    </div>
  );
}

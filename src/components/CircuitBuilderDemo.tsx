import { useState } from 'react';
import { CircuitBoard, Lightbulb, Trash2 } from 'lucide-react';

type Tool = 'AND' | 'OR' | 'NOT' | null;
type Cell = { type: 'gate'; gate: Tool } | { type: 'wire' } | null;

const COLS = 7;
const ROWS = 4;

function evalGate(gate: Tool, a: number, b: number): number {
  if (!gate) return 0;
  if (gate === 'AND') return a & b;
  if (gate === 'OR') return a | b;
  if (gate === 'NOT') return a ? 0 : 1;
  return 0;
}

export default function CircuitBuilderDemo() {
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null))
  );
  const [tool, setTool] = useState<Tool>('AND');
  const [inputA, setInputA] = useState(1);
  const [inputB, setInputB] = useState(0);

  const placeCell = (r: number, c: number) => {
    if (c === 0 || c === COLS - 1) return;
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      if (tool === null) { next[r][c] = null; return next; }
      next[r][c] = { type: 'gate', gate: tool };
      return next;
    });
  };

  // Evaluate circuit: each row feeds from input A (row 0) or input B (row 1) into gates
  const rowValues: number[] = grid.map((row, rIdx) => {
    let carry = rIdx === 0 ? inputA : rIdx === 1 ? inputB : 0;
    for (let c = 1; c < COLS - 1; c++) {
      const cell = row[c];
      if (cell?.type === 'gate') {
        const b = rIdx === 0 ? inputB : inputA;
        carry = evalGate(cell.gate, carry, b);
      }
    }
    return carry;
  });
  const output = rowValues.some(v => v === 1) ? 1 : 0;

  const clear = () => setGrid(Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null)));

  const tools: Tool[] = ['AND', 'OR', 'NOT'];

  return (
    <div className="bg-[#0a1628] border border-[#142952] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
            <CircuitBoard size={16} className="text-[#00d4aa]" />
          </div>
          <h3 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Circuit Builder</h3>
        </div>
        <button onClick={clear} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-red-400 hover:border-red-500/30 text-xs transition-colors">
          <Trash2 size={13} /> Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {tools.map(t => (
          <button key={t} onClick={() => setTool(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              tool === t ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-white'
            }`}>{t}</button>
        ))}
        <button onClick={() => setTool(null)} className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
          tool === null ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-white'
        }`}>ERASE</button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 font-mono w-16">INPUT A</span>
        <button onClick={() => setInputA(inputA ? 0 : 1)} className={`w-10 h-10 rounded-lg text-lg font-bold font-mono ${inputA ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#142952] text-slate-500'}`}>{inputA}</button>
        <span className="text-xs text-slate-500 font-mono ml-4 w-16">INPUT B</span>
        <button onClick={() => setInputB(inputB ? 0 : 1)} className={`w-10 h-10 rounded-lg text-lg font-bold font-mono ${inputB ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#142952] text-slate-500'}`}>{inputB}</button>
      </div>

      <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-3 mb-5 overflow-x-auto">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 48px)` }}>
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              if (cIdx === 0) {
                return <div key={`${rIdx}-${cIdx}`} className="w-12 h-12 rounded-lg bg-[#142952] flex items-center justify-center text-sm font-mono text-slate-400">{rIdx === 0 ? 'A' : rIdx === 1 ? 'B' : '•'}</div>;
              }
              if (cIdx === COLS - 1) {
                return <div key={`${rIdx}-${cIdx}`} className="w-12 h-12 rounded-lg flex items-center justify-center">
                  {rIdx === Math.floor(ROWS / 2) && <Lightbulb size={28} className={output ? 'text-green-400' : 'text-red-400'} />}
                </div>;
              }
              const isGate = cell?.type === 'gate';
              return <button key={`${rIdx}-${cIdx}`} onClick={() => placeCell(rIdx, cIdx)}
                className={`w-12 h-12 rounded-lg border text-xs font-mono font-bold transition-all ${
                  isGate ? 'bg-[#00d4aa]/15 border-[#00d4aa]/50 text-[#00d4aa]' : 'bg-[#0a1628] border-[#142952] text-slate-600 hover:border-[#00d4aa]/30'
                }`}>{isGate ? (cell as { type: 'gate'; gate: Tool }).gate : '+'}</button>;
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="text-sm text-slate-400 font-mono">OUTPUT:</span>
        <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${output ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
          {output}
        </div>
        <span className="text-xs text-slate-500">LED {output ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  );
}

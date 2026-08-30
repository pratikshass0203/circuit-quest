import { useState, useCallback } from 'react';
import { Zap, ArrowRight, Check, X, RotateCcw } from 'lucide-react';

interface Puzzle {
  expression: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

const PUZZLES: Puzzle[] = [
  { expression: 'A·B + A·B̄', options: ['A', 'B', 'A + B', 'A·B'], correctIndex: 0, hint: 'A·(B + B̄) = A·1 = A' },
  { expression: 'A + A·B', options: ['A·B', 'A', 'B', 'A + B'], correctIndex: 1, hint: 'A·(1 + B) = A·1 = A (Absorption)' },
  { expression: '(A + B)·(A + B̄)', options: ['A', 'B', 'A·B', 'A + B'], correctIndex: 0, hint: 'A + (B·B̄) = A + 0 = A' },
  { expression: 'A·B + Ā·B + A·B̄ + Ā·B̄', options: ['A', 'B', '1', 'A ⊕ B'], correctIndex: 2, hint: 'All minterms = 1 (tautology)' },
  { expression: 'A·(B + C)', options: ['A·B + C', 'A + B·C', 'A·B + A·C', 'A·B·C'], correctIndex: 2, hint: 'Distributive law: A·B + A·C' },
  { expression: 'A + Ā·B', options: ['A·B', 'A + B', 'Ā·B', 'A'], correctIndex: 1, hint: '(A + Ā)·(A + B) = 1·(A+B) = A+B' },
  { expression: 'A·B + Ā·C + B·C', options: ['A·B + Ā·C', 'Ā·C + B·C', 'A·B + B·C', 'A·B·C'], correctIndex: 0, hint: 'Consensus theorem: B·C is redundant' },
];

export default function PowerQuestDemo() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const puzzle = PUZZLES[idx];
  const isCorrect = selected === puzzle.correctIndex;

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setAnswered(a => a + 1);
    if (i === puzzle.correctIndex) setScore(s => s + 1);
  };

  const next = useCallback(() => {
    setIdx(i => (i + 1) % PUZZLES.length);
    setSelected(null);
  }, []);

  const reset = () => {
    setIdx(0);
    setSelected(null);
    setScore(0);
    setAnswered(0);
  };

  return (
    <div className="bg-[#0a1628] border border-[#142952] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
            <Zap size={16} className="text-[#00d4aa]" />
          </div>
          <h3 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Power Quest</h3>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">{answered}/{PUZZLES.length}</span>
          <span className="px-2.5 py-1 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 font-mono font-semibold">{score} pts</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-2 text-center">Simplify this Boolean expression:</p>
      <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-5 mb-5 text-center">
        <span className="text-2xl font-mono font-bold text-white tracking-wide">{puzzle.expression}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {puzzle.options.map((opt, i) => {
          let cls = 'w-full p-3 rounded-xl border text-center font-mono text-sm transition-all ';
          if (selected === null) cls += 'bg-[#0f2040] border-[#142952] text-slate-300 hover:border-[#00d4aa]/40 hover:text-white';
          else if (i === puzzle.correctIndex) cls += 'bg-green-500/10 border-green-500/40 text-green-300';
          else if (i === selected) cls += 'bg-red-500/10 border-red-500/40 text-red-300';
          else cls += 'bg-[#0f2040] border-[#142952] text-slate-600 opacity-50';
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} className={cls}>
              {opt}
              {selected !== null && i === puzzle.correctIndex && <Check size={14} className="inline ml-2 text-green-400" />}
              {selected !== null && i === selected && i !== puzzle.correctIndex && <X size={14} className="inline ml-2 text-red-400" />}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className={`rounded-xl p-4 mb-4 ${isCorrect ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
          <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? <Check size={15} /> : <X size={15} />}
            {isCorrect ? 'Correct! +1 point' : 'Not quite.'}
          </div>
          <p className="text-slate-400 text-xs font-mono">{puzzle.hint}</p>
        </div>
      )}

      <div className="flex justify-center gap-3">
        {answered >= PUZZLES.length ? (
          <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors text-sm">
            <RotateCcw size={15} /> Restart
          </button>
        ) : (
          <button onClick={next} disabled={selected === null} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">
            Next <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { Zap, ArrowRight, Check, X } from 'lucide-react';

type GateType = 'AND' | 'OR' | 'XOR' | 'NOT' | 'NAND' | 'NOR';

const GATES: GateType[] = ['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR'];

function computeGate(gate: GateType, a: number, b: number): number {
  switch (gate) {
    case 'AND': return a & b;
    case 'OR': return a | b;
    case 'XOR': return a ^ b;
    case 'NOT': return a ? 0 : 1;
    case 'NAND': return (a & b) ? 0 : 1;
    case 'NOR': return (a | b) ? 0 : 1;
  }
}

function randomInput(): number { return Math.random() < 0.5 ? 0 : 1; }

export default function LogicGatePuzzle() {
  const [gate, setGate] = useState<GateType>('AND');
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const correct = computeGate(gate, a, b);
  const answered = guess !== null;
  const isCorrect = guess === correct;

  const handleGuess = (val: number) => {
    if (answered) return;
    setGuess(val);
    if (val === correct) setScore(s => s + 1);
  };

  const next = useCallback(() => {
    setA(randomInput());
    setB(randomInput());
    setGuess(null);
    setRound(r => r + 1);
  }, []);

  return (
    <div className="bg-[#0a1628] border border-[#142952] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
            <Zap size={16} className="text-[#00d4aa]" />
          </div>
          <h3 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Logic Gate Puzzler</h3>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">Round {round}</span>
          <span className="px-2.5 py-1 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 font-mono font-semibold">{score} pts</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {GATES.map(g => (
          <button key={g} onClick={() => { setGate(g); setGuess(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              gate === g ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#0f2040] border border-[#142952] text-slate-400 hover:text-white hover:border-[#00d4aa]/40'
            }`}>
            {g}
          </button>
        ))}
      </div>

      <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-5 mb-5">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-2 font-mono">INPUT A</div>
            <button onClick={() => { setA(a ? 0 : 1); setGuess(null); }}
              className={`w-14 h-14 rounded-xl text-2xl font-bold font-mono transition-all ${
                a ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#142952] text-slate-400 border border-[#142952]'
              }`}>{a}</button>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#142952] border border-[#142952]">
            <span className="text-white font-mono font-bold text-lg">{gate}</span>
          </div>
          {gate !== 'NOT' && (
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-2 font-mono">INPUT B</div>
              <button onClick={() => { setB(b ? 0 : 1); setGuess(null); }}
                className={`w-14 h-14 rounded-xl text-2xl font-bold font-mono transition-all ${
                  b ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#142952] text-slate-400 border border-[#142952]'
                }`}>{b}</button>
            </div>
          )}
          <div className="text-slate-600 text-2xl">=</div>
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-2 font-mono">OUTPUT</div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold font-mono ${
              answered ? (isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40') : 'bg-[#0a1628] text-slate-600 border border-[#142952]'
            }`}>{answered ? correct : '?'}</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-3 text-center">Predict the output:</p>
      <div className="flex justify-center gap-3 mb-5">
        {[0, 1].map(v => (
          <button key={v} onClick={() => handleGuess(v)} disabled={answered}
            className={`w-20 h-12 rounded-xl text-lg font-bold font-mono transition-all disabled:opacity-50 ${
              answered && guess === v
                ? (isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40')
                : 'bg-[#0f2040] border border-[#142952] text-slate-300 hover:border-[#00d4aa]/40 hover:text-white'
            }`}>{v}</button>
        ))}
      </div>

      {answered && (
        <div className={`flex items-center justify-center gap-2 text-sm font-medium mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {isCorrect ? <Check size={16} /> : <X size={16} />}
          {isCorrect ? `Correct! ${gate}(${a}${gate !== 'NOT' ? `, ${b}` : ''}) = ${correct}` : `Incorrect. ${gate}(${a}${gate !== 'NOT' ? `, ${b}` : ''}) = ${correct}`}
        </div>
      )}

      <div className="flex justify-center">
        <button onClick={next} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors text-sm">
          Next <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

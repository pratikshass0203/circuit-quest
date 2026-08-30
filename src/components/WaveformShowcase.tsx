import { useState } from 'react';
import { Activity, Sliders } from 'lucide-react';

const SIGNALS = ['CLK', 'DATA', 'OUT'] as const;
type SignalName = typeof SIGNALS[number];

export default function WaveformShowcase() {
  const [freq, setFreq] = useState(1);
  const [phase, setPhase] = useState(0);

  const period = 60 / freq;
  const phaseOffset = (phase / 360) * period;

  const buildPath = (offset: number, invert: boolean): string => {
    const width = 480;
    const high = 10;
    const low = 40;
    let d = `M 0 ${invert ? high : low}`;
    let x = -((offset % period + period) % period);
    let level = invert ? high : low;
    while (x < width) {
      const nextX = x + period / 2;
      const clampedX = Math.max(0, x);
      if (nextX > 0) {
        d += ` L ${Math.min(clampedX, width)} ${level}`;
        const mid = Math.min(Math.max(0, nextX), width);
        if (mid > clampedX) d += ` L ${mid} ${level}`;
        level = level === high ? low : high;
        d += ` L ${Math.min(nextX, width)} ${level}`;
      }
      x = nextX + period / 2;
    }
    d += ` L ${width} ${level}`;
    return d;
  };

  const waveData: Record<SignalName, { path: string; color: string; offset: number; invert: boolean }> = {
    CLK: { path: buildPath(0, false), color: '#00d4aa', offset: 0, invert: false },
    DATA: { path: buildPath(phaseOffset, false), color: '#60a5fa', offset: phaseOffset, invert: false },
    OUT: { path: buildPath(phaseOffset / 2, true), color: '#f59e0b', offset: phaseOffset / 2, invert: true },
  };

  return (
    <div className="bg-[#0a1628] border border-[#142952] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
          <Activity size={16} className="text-[#00d4aa]" />
        </div>
        <h3 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Waveform Lab</h3>
      </div>

      <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-4 mb-5 space-y-3">
        <div className="flex items-center gap-3">
          <Sliders size={14} className="text-slate-500 flex-shrink-0" />
          <span className="text-xs text-slate-400 font-mono w-20">Frequency</span>
          <input type="range" min="0.5" max="4" step="0.5" value={freq} onChange={e => setFreq(Number(e.target.value))}
            className="flex-1 accent-[#00d4aa]" />
          <span className="text-xs text-[#00d4aa] font-mono w-10 text-right">{freq}x</span>
        </div>
        <div className="flex items-center gap-3">
          <Sliders size={14} className="text-slate-500 flex-shrink-0" />
          <span className="text-xs text-slate-400 font-mono w-20">Phase Shift</span>
          <input type="range" min="0" max="360" step="45" value={phase} onChange={e => setPhase(Number(e.target.value))}
            className="flex-1 accent-[#00d4aa]" />
          <span className="text-xs text-[#00d4aa] font-mono w-10 text-right">{phase}°</span>
        </div>
      </div>

      <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-4 space-y-4">
        {SIGNALS.map(name => (
          <div key={name} className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-400 w-10">{name}</span>
            <div className="flex-1 overflow-hidden rounded-lg bg-[#0a1628] border border-[#142952]">
              <svg viewBox="0 0 480 50" className="w-full h-12" preserveAspectRatio="none">
                <line x1="0" y1="25" x2="480" y2="25" stroke="#142952" strokeWidth="1" strokeDasharray="2 4" />
                <path d={waveData[name].path} fill="none" stroke={waveData[name].color} strokeWidth="2.5" strokeLinejoin="miter" strokeLinecap="square" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
        {SIGNALS.map(name => (
          <div key={name} className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full" style={{ background: waveData[name].color }} />
            <span className="font-mono">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

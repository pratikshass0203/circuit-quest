import { ArrowRight, Play, Zap, Trophy, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#00d4aa]/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-medium mb-6">
          <Zap size={13} /> Learn digital electronics by playing
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Master Digital Electronics<br />by Playing
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Solve logic puzzles, build circuits, optimize Boolean expressions, and battle the CPU boss — all while earning XP and climbing the leaderboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <a href="#modules" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors">
            Start Playing <ArrowRight size={17} />
          </a>
          <a href="#solution" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 font-medium hover:text-white hover:border-[#00d4aa]/40 transition-colors">
            <Play size={16} /> See How It Works
          </a>
        </div>
        <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-1.5"><Trophy size={15} className="text-[#00d4aa]" /> 6 Game Modules</div>
          <div className="flex items-center gap-1.5"><Users size={15} className="text-[#00d4aa]" /> Live Leaderboards</div>
          <div className="flex items-center gap-1.5"><Zap size={15} className="text-[#00d4aa]" /> XP & Badges</div>
        </div>
      </div>
    </section>
  );
}

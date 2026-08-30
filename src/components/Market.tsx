import { GraduationCap, Users, BookOpen, TrendingUp } from 'lucide-react';

const STATS = [
  { icon: GraduationCap, value: '2.5M+', label: 'Engineering Students in India', sub: 'Graduate annually' },
  { icon: BookOpen, value: '500+', label: 'Colleges Teach DE', sub: 'Across all states' },
  { icon: Users, value: '85%', label: 'Struggle with Concepts', sub: 'Reported in surveys' },
  { icon: TrendingUp, value: '$4.2B', label: 'EdTech Market', sub: 'Growing 30% YoY' },
];

export default function Market() {
  return (
    <section id="market" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#00d4aa] uppercase tracking-wider">Market Opportunity</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            A Massive, Underserved Market
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Millions of engineering students study digital electronics every year — and nearly all of them need better tools.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-[#0a1628] border border-[#142952] rounded-xl p-5 text-center hover:border-[#00d4aa]/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-[#00d4aa]" />
                </div>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</div>
                <div className="text-sm text-slate-300 font-medium">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

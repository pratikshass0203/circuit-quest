import { BookOpen, Clock, Brain, TrendingDown } from 'lucide-react';

const PROBLEMS = [
  { icon: BookOpen, title: 'Passive Learning', desc: 'Textbooks and lectures don\'t build intuition. Students memorize truth tables without understanding why gates work.' },
  { icon: Clock, title: 'Slow Feedback Loops', desc: 'Waiting days for graded assignments means mistakes go uncorrected. By exam time, misconceptions are deeply ingrained.' },
  { icon: Brain, title: 'Abstract Concepts', desc: 'Boolean algebra, state machines, and timing diagrams feel disconnected from reality without hands-on experimentation.' },
  { icon: TrendingDown, title: 'Declining Engagement', desc: 'Traditional problem sets feel like homework, not play. Motivation drops, and so do completion rates.' },
];

export default function Problem() {
  return (
    <section id="problem" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#00d4aa] uppercase tracking-wider">The Problem</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Digital Electronics is Hard to Teach
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Traditional methods leave students struggling with abstract concepts and lacking the hands-on practice they need to truly master the material.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="bg-[#0a1628] border border-[#142952] rounded-xl p-5 hover:border-[#00d4aa]/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{p.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

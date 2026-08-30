import { Code2, Database, Cloud, Smartphone, GitBranch, Layers } from 'lucide-react';

const STACK = [
  { icon: Code2, name: 'React + TypeScript', desc: 'Component-driven UI with full type safety across the app.' },
  { icon: Database, name: 'Supabase (PostgreSQL)', desc: 'Auth, real-time data, and RLS policies for secure multi-tenant access.' },
  { icon: Cloud, name: 'Edge Functions', desc: 'Deno-based serverless functions for scoring, webhooks, and integrations.' },
  { icon: Smartphone, name: 'PWA + Service Workers', desc: 'Offline-first architecture with IndexedDB caching for all questions.' },
  { icon: GitBranch, name: 'CI/CD Pipeline', desc: 'Automated builds, testing, and deployments via Bolt\'s integrated workflow.' },
  { icon: Layers, name: 'Tailwind CSS', desc: 'Utility-first styling with a consistent, responsive dark theme.' },
];

export default function Technology() {
  return (
    <section id="technology" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#00d4aa] uppercase tracking-wider">Tech Stack</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Modern, Scalable, Reliable
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Built on a proven stack that scales from a single classroom to millions of students.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STACK.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-[#0a1628] border border-[#142952] rounded-xl p-5 hover:border-[#00d4aa]/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[#00d4aa]" />
                  </div>
                  <h3 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.name}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

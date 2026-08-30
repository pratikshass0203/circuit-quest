import { ArrowRight, Zap } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-[#0f2040] border border-[#00d4aa]/30 rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d4aa]/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] text-xs font-medium mb-6">
              <Zap size={13} /> Start in 30 seconds
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ready to Master Digital Electronics?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">
              Join thousands of students learning the fun way. Play your first module free — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#modules" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors">
                Start Playing Free <ArrowRight size={17} />
              </a>
              <a href="#pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0a1628] border border-[#142952] text-slate-300 font-medium hover:text-white hover:border-[#00d4aa]/40 transition-colors">
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

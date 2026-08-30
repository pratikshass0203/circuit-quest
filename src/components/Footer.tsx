import { CircuitBoard, Github, Twitter, Linkedin } from 'lucide-react';

const COMPANY_LINKS = ['About', 'Blog', 'Careers'];
const RESOURCE_LINKS = ['Documentation', 'API Reference', 'Community', 'Support'];
const LEGAL_LINKS = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];

export default function Footer() {
  return (
    <footer className="border-t border-[#142952] bg-[#0a1628] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
                <CircuitBoard size={18} className="text-[#00d4aa]" />
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CircuitQuest</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Master digital electronics by playing. Built for students, designed for classrooms.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-[#0f2040] border border-[#142952] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#00d4aa]/40 transition-colors"><Github size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-[#0f2040] border border-[#142952] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#00d4aa]/40 transition-colors"><Twitter size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-[#0f2040] border border-[#142952] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#00d4aa]/40 transition-colors"><Linkedin size={16} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Company</h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map(l => (
                <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-[#00d4aa] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Resources</h4>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map(l => (
                <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-[#00d4aa] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Legal</h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map(l => (
                <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-[#00d4aa] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#142952] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">© 2025 CircuitQuest. All rights reserved.</p>
          <p className="text-xs text-slate-600">Made with <span className="text-[#00d4aa]">⚡</span> for engineering students.</p>
        </div>
      </div>
    </footer>
  );
}

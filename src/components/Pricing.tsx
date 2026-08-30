import { useState, useEffect } from 'react';
import { Check, Zap, Download, RefreshCw, Trash2, WifiOff, Crown, Building2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { cacheAllQuestions, getCacheInfo, isCacheFresh, clearCache } from '../lib/offlineCache';

type Cycle = 'monthly' | 'annual';
type Currency = 'INR' | 'USD';

interface Tier {
  id: string;
  name: string;
  icon: typeof Crown;
  monthlyINR: number;
  annualINR: number;
  monthlyUSD: number;
  annualUSD: number;
  features: string[];
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'free', name: 'Free', icon: Sparkles, monthlyINR: 0, annualINR: 0, monthlyUSD: 0, annualUSD: 0,
    features: ['Gate Puzzler module', 'Basic questions (50)', 'Daily streak tracking', 'Community leaderboard'],
  },
  {
    id: 'pro', name: 'Pro', icon: Crown, monthlyINR: 199, annualINR: 1999, monthlyUSD: 9, annualUSD: 86,
    features: ['All 6 modules unlocked', 'Unlimited questions', 'Offline access (PWA)', 'Advanced test series', 'Detailed analytics', 'Priority support'],
    highlight: true,
  },
  {
    id: 'campus', name: 'Campus', icon: Building2, monthlyINR: 99, annualINR: 999, monthlyUSD: 4, annualUSD: 38,
    features: ['Everything in Pro', 'Batch/class management', 'Faculty dashboard', 'Group leaderboards', 'Custom question sets', 'Onboarding workshop'],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { subscription, subscribe, isPro } = useSubscription();
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; cachedAt: number | null; count: number } | null>(null);
  const [cacheFresh, setCacheFresh] = useState(false);
  const [caching, setCaching] = useState(false);
  const [cacheMsg, setCacheMsg] = useState('');

  const refreshCache = async () => {
    const info = await getCacheInfo().catch(() => null);
    const fresh = await isCacheFresh().catch(() => false);
    setCacheInfo(info);
    setCacheFresh(fresh);
  };

  useEffect(() => { refreshCache(); }, []);

  const handleCacheAll = async () => {
    setCaching(true);
    setCacheMsg('');
    const count = await cacheAllQuestions().catch(() => 0);
    setCaching(false);
    setCacheMsg(`Cached ${count} questions for offline use.`);
    refreshCache();
  };

  const handleClearCache = async () => {
    await clearCache().catch(() => {});
    setCacheMsg('Offline cache cleared.');
    refreshCache();
  };

  const formatPrice = (tier: Tier) => {
    if (tier.monthlyINR === 0) return '₹0';
    if (currency === 'INR') {
      return cycle === 'monthly' ? `₹${tier.monthlyINR}` : `₹${tier.annualINR}`;
    }
    return cycle === 'monthly' ? `$${tier.monthlyUSD}` : `$${tier.annualUSD}`;
  };

  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'free') return;
    await subscribe(tierId as 'pro' | 'campus');
  };

  const isProUser = isPro;

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Pricing</h2>
          <p className="text-slate-400">Start free. Upgrade when you're ready.</p>
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <div className="flex items-center bg-[#0f2040] border border-[#142952] rounded-lg p-1">
            {(['monthly', 'annual'] as Cycle[]).map(c => (
              <button key={c} onClick={() => setCycle(c)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                  cycle === c ? 'bg-[#00d4aa] text-[#0a1628]' : 'text-slate-400 hover:text-white'
                }`}>{c}</button>
            ))}
          </div>
          <div className="flex items-center bg-[#0f2040] border border-[#142952] rounded-lg p-1">
            {(['INR', 'USD'] as Currency[]).map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currency === c ? 'bg-[#00d4aa] text-[#0a1628]' : 'text-slate-400 hover:text-white'
                }`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TIERS.map(tier => {
            const Icon = tier.icon;
            const isCurrent = subscription?.plan === tier.id;
            return (
              <div key={tier.id} className={`relative rounded-2xl p-6 border transition-all ${
                tier.highlight ? 'bg-[#0f2040] border-[#00d4aa]/40 shadow-lg shadow-[#00d4aa]/5' : 'bg-[#0a1628] border-[#142952]'
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#00d4aa] text-[#0a1628] text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tier.highlight ? 'bg-[#00d4aa]/15 border border-[#00d4aa]/30' : 'bg-[#0f2040] border border-[#142952]'}`}>
                    <Icon size={18} className={tier.highlight ? 'text-[#00d4aa]' : 'text-slate-400'} />
                  </div>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{tier.name}</h3>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-white">{formatPrice(tier)}</span>
                  <span className="text-slate-500 text-sm">/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                {tier.id !== 'free' && cycle === 'annual' && (
                  <p className="text-xs text-[#00d4aa] mb-4">
                    {currency === 'INR' ? `Save ₹${tier.monthlyINR * 12 - tier.annualINR}` : `Save $${Math.round((tier.monthlyUSD * 12 - tier.annualUSD) * 100) / 100}`}
                  </p>
                )}
                {tier.id === 'free' && <div className="mb-4" />}
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check size={15} className="text-[#00d4aa] flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(tier.id)} disabled={isCurrent}
                  className={`w-full py-3 rounded-lg font-semibold transition-all text-sm ${
                    isCurrent ? 'bg-[#0f2040] border border-[#142952] text-slate-500 cursor-default' :
                    tier.highlight ? 'bg-[#00d4aa] text-[#0a1628] hover:bg-[#2fe0c0]' : 'bg-[#0f2040] border border-[#142952] text-white hover:border-[#00d4aa]/40'
                  }`}>
                  {isCurrent ? 'Current Plan' : tier.id === 'free' ? 'Get Started' : 'Subscribe'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Offline Access (Pro only) */}
        {user && isProUser && (
          <div className="bg-[#0a1628] border border-[#142952] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
                <WifiOff size={16} className="text-[#00d4aa]" />
              </div>
              <h3 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Offline Access</h3>
            </div>
            <p className="text-slate-400 text-sm mb-5">Download all questions to practice without an internet connection.</p>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button onClick={handleCacheAll} disabled={caching}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors text-sm disabled:opacity-50">
                <Download size={15} /> {caching ? 'Downloading...' : 'Download All'}
              </button>
              <button onClick={refreshCache}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 hover:text-white transition-colors text-sm">
                <RefreshCw size={15} /> Refresh
              </button>
              <button onClick={handleClearCache}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 hover:text-red-400 hover:border-red-500/30 transition-colors text-sm">
                <Trash2 size={15} /> Clear Cache
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {cacheInfo && (
                <span className="inline-flex items-center gap-1.5">
                  <Zap size={12} className="text-[#00d4aa]" />
                  {cacheInfo.cached ? `${cacheInfo.count} questions cached` : 'No cache'}
                  {cacheInfo.cachedAt && ` · ${new Date(cacheInfo.cachedAt).toLocaleDateString()}`}
                </span>
              )}
              {cacheInfo?.cached && (
                <span className={`inline-flex items-center gap-1.5 ${cacheFresh ? 'text-green-400' : 'text-amber-400'}`}>
                  {cacheFresh ? <Check size={12} /> : <WifiOff size={12} />}
                  {cacheFresh ? 'Cache is fresh' : 'Cache needs refresh'}
                </span>
              )}
            </div>
            {cacheMsg && <p className="text-sm text-[#00d4aa] mt-3">{cacheMsg}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { Zap, Flame, Award, Target, Trophy, Loader2, type LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PlayerState {
  xp: number;
  level: number;
  streak: number;
  badges_earned: string[];
  quests_completed: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  xp_threshold: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  icon: string;
}

interface LeaderboardEntry {
  id: string;
  player_name: string;
  initials: string;
  xp: number;
  level: number;
  is_current_player: boolean;
}

const BADGE_ICONS: Record<string, LucideIcon> = { '🔥': Flame, '⚡': Zap, '🏆': Trophy, '🎯': Target, '⭐': Award, '💎': Award };

export default function EngagementEngine() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [playerRes, badgesRes, questsRes, lbRes] = await Promise.all([
          supabase.from('player_state').select('*').single(),
          supabase.from('badges').select('*'),
          supabase.from('quests').select('*'),
          supabase.from('leaderboard_entries').select('*').order('xp', { ascending: false }).limit(5),
        ]);
        setPlayer(playerRes.data as PlayerState);
        setBadges((badgesRes.data as Badge[]) ?? []);
        setQuests((questsRes.data as Quest[]) ?? []);
        setLeaderboard((lbRes.data as LeaderboardEntry[]) ?? []);
      } catch { /* offline or no data */ }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="text-[#00d4aa] animate-spin" />
      </div>
    );
  }

  const stats = player ? [
    { icon: Zap, label: 'XP', value: player.xp ?? 0, color: '#00d4aa' },
    { icon: Trophy, label: 'Level', value: player.level ?? 1, color: '#60a5fa' },
    { icon: Flame, label: 'Streak', value: `${player.streak ?? 0}d`, color: '#f59e0b' },
    { icon: Award, label: 'Badges', value: (player.badges_earned ?? []).length, color: '#a78bfa' },
  ] : [];

  return (
    <section className="py-20 px-4 bg-[#0a1628]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-[#00d4aa] uppercase tracking-wider">Live Stats</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Your Progress, In Real Time
          </h2>
          <p className="text-slate-400">XP, badges, quests, and leaderboard — all powered by live data.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-[#0f2040] border border-[#142952] rounded-xl p-5 text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: `${s.color}15`, border: `1px solid ${s.color}40` }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Badges */}
          <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Award size={16} className="text-[#00d4aa]" /> Badges
            </h3>
            <div className="space-y-2.5">
              {badges.length === 0 && <p className="text-sm text-slate-500">No badges yet.</p>}
              {badges.map(b => {
                const earned = player?.badges_earned?.includes(b.id);
                const Icon = BADGE_ICONS[b.icon] ?? Award;
                return (
                  <div key={b.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${earned ? 'bg-[#00d4aa]/5 border-[#00d4aa]/20' : 'bg-[#0a1628] border-[#142952] opacity-50'}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${b.color}15`, border: `1px solid ${b.color}40` }}>
                      <Icon size={14} color={b.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">{b.name}</div>
                      <div className="text-xs text-slate-500 truncate">{b.description}</div>
                    </div>
                    <span className="text-xs font-mono text-slate-500 flex-shrink-0">{b.xp_threshold}xp</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quests */}
          <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Target size={16} className="text-[#00d4aa]" /> Quests
            </h3>
            <div className="space-y-2.5">
              {quests.length === 0 && <p className="text-sm text-slate-500">No quests available.</p>}
              {quests.map(q => {
                const done = player?.quests_completed?.includes(q.id);
                return (
                  <div key={q.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${done ? 'bg-green-500/5 border-green-500/20' : 'bg-[#0a1628] border-[#142952]'}`}>
                    <span className="text-lg flex-shrink-0">{q.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">{q.title}</div>
                      <div className="text-xs text-slate-500 truncate">{q.description}</div>
                    </div>
                    <span className={`text-xs font-mono font-semibold flex-shrink-0 ${done ? 'text-green-400' : 'text-[#00d4aa]'}`}>+{q.xp_reward}xp</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Trophy size={16} className="text-[#00d4aa]" /> Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.length === 0 && <p className="text-sm text-slate-500">No entries yet.</p>}
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                  entry.is_current_player ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30' : 'bg-[#0a1628] border-[#142952]'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-700/20 text-orange-400' : 'bg-[#142952] text-slate-500'
                  }`}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-[#142952] text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{entry.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate">{entry.player_name}</div>
                    <div className="text-xs text-slate-500">Level {entry.level}</div>
                  </div>
                  <span className="text-sm font-mono font-semibold text-[#00d4aa] flex-shrink-0">{entry.xp}xp</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

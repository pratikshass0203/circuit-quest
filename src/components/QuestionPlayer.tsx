import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getCachedQuestions } from '../lib/offlineCache';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { classifyTopic } from '../lib/topicClassifier';
import {
  Check, X, ArrowRight, RotateCcw, Trophy, Star, Filter,
  ChevronRight, Zap, Target, BookOpen, WifiOff, Search, FolderTree, Layers,
} from 'lucide-react';

interface Question {
  id: number;
  module_id: string;
  level: 'basic' | 'intermediate' | 'advanced';
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  xp_reward: number;
}

type Level = 'all' | 'basic' | 'intermediate' | 'advanced';
type ViewMode = 'browse' | 'quiz' | 'result';

interface QuestionPlayerProps {
  moduleId: string;
  moduleName: string;
}

const LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-green-500/10 text-green-400 border border-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  advanced: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const LEVEL_XP: Record<string, number> = { basic: 10, intermediate: 15, advanced: 20 };

export default function QuestionPlayer({ moduleId, moduleName }: QuestionPlayerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [levelFilter, setLevelFilter] = useState<Level>('all');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [, setAnswered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('browse');
  const [shuffled, setShuffled] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const online = useOnlineStatus();

  const fetchQuestions = useCallback(async () => {
    if (!online) {
      const cached = await getCachedQuestions(moduleId).catch(() => []);
      setQuestions(cached as Question[]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('module_questions')
      .select('*')
      .eq('module_id', moduleId)
      .order('level', { ascending: true })
      .order('id', { ascending: true });
    if (data) setQuestions(data as Question[]);
    setLoading(false);
  }, [moduleId, online]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // Topic classification
  const questionsWithTopics = useMemo(
    () => questions.map(q => ({ ...q, topic: classifyTopic(q.question) })),
    [questions]
  );

  const topics = useMemo(() => {
    const map: Record<string, { basic: number; intermediate: number; advanced: number; total: number }> = {};
    for (const q of questionsWithTopics) {
      if (!map[q.topic]) map[q.topic] = { basic: 0, intermediate: 0, advanced: 0, total: 0 };
      map[q.topic].total++;
      if (q.level === 'basic') map[q.topic].basic++;
      else if (q.level === 'intermediate') map[q.topic].intermediate++;
      else if (q.level === 'advanced') map[q.topic].advanced++;
    }
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [questionsWithTopics]);

  // Filtered questions for browse view
  const filtered = useMemo(() => {
    let result = questionsWithTopics;
    if (levelFilter !== 'all') result = result.filter(q => q.level === levelFilter);
    if (activeTopic) result = result.filter(q => q.topic === activeTopic);
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase();
      result = result.filter(q =>
        q.question.toLowerCase().includes(sq) ||
        q.topic.toLowerCase().includes(sq) ||
        q.options.some(o => o.toLowerCase().includes(sq))
      );
    }
    return result;
  }, [questionsWithTopics, levelFilter, activeTopic, searchQuery]);

  const counts = {
    basic: questions.filter(q => q.level === 'basic').length,
    intermediate: questions.filter(q => q.level === 'intermediate').length,
    advanced: questions.filter(q => q.level === 'advanced').length,
    all: questions.length,
  };

  const startQuiz = () => {
    const pool = [...filtered].sort(() => Math.random() - 0.5);
    setShuffled(pool);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setXpEarned(0);
    setAnswered(0);
    setView('quiz');
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setAnswered(a => a + 1);
    if (idx === shuffled[current].correct_index) {
      setScore(s => s + 1);
      setXpEarned(x => x + shuffled[current].xp_reward);
    }
  };

  const handleNext = () => {
    if (current + 1 >= shuffled.length) {
      setView('result');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const resetQuiz = () => {
    setView('browse');
    setSelected(null);
    setCurrent(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  // === RESULT VIEW ===
  if (view === 'result') {
    const pct = shuffled.length > 0 ? Math.round((score / shuffled.length) * 100) : 0;
    return (
      <div className="flex flex-col items-center text-center py-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${pct >= 80 ? 'bg-green-500/20 border-2 border-green-500/40' : pct >= 50 ? 'bg-yellow-500/20 border-2 border-yellow-500/40' : 'bg-red-500/20 border-2 border-red-500/40'}`}>
          {pct >= 80 ? <Trophy size={40} className="text-green-400" /> : pct >= 50 ? <Star size={40} className="text-yellow-400" /> : <Target size={40} className="text-red-400" />}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good work!' : 'Keep practising!'}
        </h3>
        <p className="text-slate-400 mb-8">
          You answered <span className="text-white font-semibold">{score}</span> out of{' '}
          <span className="text-white font-semibold">{shuffled.length}</span> correctly ({pct}%)
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
          <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">Score</div>
            <div className="text-2xl font-bold text-white">{score}/{shuffled.length}</div>
          </div>
          <div className="bg-[#0f2040] border border-[#142952] rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Zap size={10} className="text-[#00d4aa]" />XP Earned</div>
            <div className="text-2xl font-bold text-[#00d4aa]">+{xpEarned}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={startQuiz} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 font-medium hover:text-white transition-colors">
            <RotateCcw size={16} /> Try Again
          </button>
          <button onClick={resetQuiz} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors">
            Back to Questions <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // === QUIZ VIEW ===
  if (view === 'quiz') {
    if (shuffled.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No questions match your filters.</p>
          <button onClick={resetQuiz} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors">
            Back to Questions
          </button>
        </div>
      );
    }
    const q = shuffled[current];
    const isCorrect = selected === q.correct_index;
    const progress = (current / shuffled.length) * 100;

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 rounded-full bg-[#0a1628] border border-[#142952] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#2fe0c0] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-slate-500 font-mono flex-shrink-0">{current + 1}/{shuffled.length}</span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEVEL_COLORS[q.level]}`}>
            {q.level.charAt(0).toUpperCase() + q.level.slice(1)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 font-medium">
            {classifyTopic(q.question)}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
            <Check size={12} className="text-green-400" /> {score} correct
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#00d4aa] font-mono">
            <Zap size={12} /> +{xpEarned} XP
          </div>
        </div>

        <div className="bg-[#0a1628] border border-[#142952] rounded-xl p-6 mb-5">
          <p className="text-white text-base font-medium leading-relaxed">{q.question}</p>
        </div>

        <div className="space-y-3 mb-5">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isRight = i === q.correct_index;
            let classes = 'w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center gap-3 ';
            if (selected === null) {
              classes += 'bg-[#0f2040] border-[#142952] text-slate-300 hover:border-[#00d4aa]/40 hover:text-white cursor-pointer';
            } else if (isRight) {
              classes += 'bg-green-500/10 border-green-500/40 text-green-300';
            } else if (isSelected) {
              classes += 'bg-red-500/10 border-red-500/40 text-red-300';
            } else {
              classes += 'bg-[#0f2040] border-[#142952] text-slate-500 opacity-50 cursor-default';
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} className={classes} disabled={selected !== null}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${selected === null ? 'bg-[#142952] text-slate-400' : isRight ? 'bg-green-500/20 text-green-400' : isSelected ? 'bg-red-500/20 text-red-400' : 'bg-[#142952] text-slate-600'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {selected !== null && isRight && <Check size={16} className="text-green-400 flex-shrink-0" />}
                {selected !== null && isSelected && !isRight && <X size={16} className="text-red-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className={`rounded-xl p-4 mb-5 ${isCorrect ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
            <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? <Check size={16} /> : <X size={16} />}
              {isCorrect ? `Correct! +${q.xp_reward} XP earned.` : 'Incorrect.'}
            </div>
            {q.explanation && <p className="text-slate-400 text-sm leading-relaxed">{q.explanation}</p>}
          </div>
        )}

        {selected !== null && (
          <button onClick={handleNext} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold hover:bg-[#2fe0c0] transition-colors">
            {current + 1 >= shuffled.length ? 'View Results' : 'Next Question'}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    );
  }

  // === BROWSE VIEW (default) ===
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
          <BookOpen size={18} className="text-[#00d4aa]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">{moduleName} — Question Bank</h3>
          <p className="text-slate-500 text-sm">{counts.all} questions across 3 difficulty levels</p>
        </div>
      </div>

      {!online && (
        <div className="flex items-center gap-2 mb-6 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5">
          <WifiOff size={14} />
          Offline mode — showing cached questions
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['basic', 'intermediate', 'advanced'] as const).map(lvl => (
          <div key={lvl} className="bg-[#0a1628] border border-[#142952] rounded-xl p-4 text-center">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-2 ${LEVEL_COLORS[lvl]}`}>
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </div>
            <div className="text-2xl font-bold text-white">{counts[lvl]}</div>
            <div className="text-xs text-slate-500 mt-1">+{LEVEL_XP[lvl]} XP each</div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword, topic, or answer..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a1628] border border-[#142952] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Level filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">FILTER BY DIFFICULTY</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'basic', 'intermediate', 'advanced'] as Level[]).map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                levelFilter === lvl
                  ? 'bg-[#00d4aa] text-[#0a1628]'
                  : 'bg-[#0a1628] border border-[#142952] text-slate-400 hover:text-white hover:border-[#1a3366]'
              }`}
            >
              {lvl === 'all' ? `All (${counts.all})` : `${lvl.charAt(0).toUpperCase() + lvl.slice(1)} (${counts[lvl]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Topic classification */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FolderTree size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">CLASSIFY BY TOPIC</span>
          {activeTopic && (
            <button
              onClick={() => setActiveTopic(null)}
              className="ml-auto text-xs text-[#00d4aa] hover:underline"
            >
              Clear topic filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTopic(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !activeTopic ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#0a1628] border border-[#142952] text-slate-400 hover:text-white'
            }`}
          >
            All Topics
          </button>
          {topics.map(([topic, c]) => (
            <button
              key={topic}
              onClick={() => setActiveTopic(activeTopic === topic ? null : topic)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTopic === topic
                  ? 'bg-[#00d4aa] text-[#0a1628]'
                  : 'bg-[#0a1628] border border-[#142952] text-slate-400 hover:text-white hover:border-[#1a3366]'
              }`}
            >
              {topic}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTopic === topic ? 'bg-[#0a1628]/20 text-[#0a1628]' : 'bg-[#142952] text-slate-500'}`}>
                {c.total}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic breakdown when a topic is selected */}
      {activeTopic && (() => {
        const topicData = topics.find(([t]) => t === activeTopic);
        if (!topicData) return null;
        const [, c] = topicData;
        return (
          <div className="mb-6 bg-[#0a1628] border border-[#142952] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={14} className="text-[#00d4aa]" />
              <span className="text-sm text-white font-medium">{activeTopic} — Topic Breakdown</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{c.basic}</div>
                <div className="text-xs text-slate-500">Basic</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{c.intermediate}</div>
                <div className="text-xs text-slate-500">Intermediate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{c.advanced}</div>
                <div className="text-xs text-slate-500">Advanced</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Selected questions summary */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0a1628] border border-[#142952] mb-6">
        <Target size={16} className="text-[#00d4aa] flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm text-white font-medium">{filtered.length} questions selected</div>
          <div className="text-xs text-slate-500">
            {activeTopic ? `Topic: ${activeTopic} · ` : ''}{levelFilter === 'all' ? 'All levels' : levelFilter}
            {searchQuery ? ` · Search: "${searchQuery}"` : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Max XP</div>
          <div className="text-sm font-bold text-[#00d4aa] font-mono">
            {filtered.reduce((sum, q) => sum + q.xp_reward, 0)}
          </div>
        </div>
      </div>

      {/* Question list preview (when not in quiz) */}
      {filtered.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">PREVIEW ({Math.min(filtered.length, 10)} of {filtered.length})</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {filtered.slice(0, 10).map((q, i) => (
              <div key={q.id} className="flex items-start gap-3 bg-[#0a1628] border border-[#142952] rounded-lg px-4 py-3">
                <span className="text-xs text-slate-600 font-mono flex-shrink-0 mt-0.5">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug mb-1">{q.question}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${LEVEL_COLORS[q.level]}`}>
                      {q.level}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 font-medium">
                      {q.topic}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#00d4aa] font-mono flex-shrink-0">+{q.xp_reward}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={startQuiz}
        disabled={filtered.length === 0}
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#00d4aa] text-[#0a1628] font-semibold text-base hover:bg-[#2fe0c0] transition-all glow-teal hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start Quiz <ChevronRight size={18} />
      </button>
    </div>
  );
}

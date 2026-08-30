import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getCachedQuestions } from '../lib/offlineCache';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { classifyTopic } from '../lib/topicClassifier';
import {
  Check, X, Clock, Trophy, Target, Zap, RotateCcw, ChevronRight,
  ClipboardList, Award, AlertCircle, TrendingUp, History,
  Search, FolderTree, Layers, WifiOff,
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

interface PastAttempt {
  id: number;
  level: string;
  score_percent: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  xp_earned: number;
  time_taken_seconds: number;
  created_at: string;
}

type Phase = 'menu' | 'test' | 'result';
type LevelChoice = 'basic' | 'intermediate' | 'advanced' | 'mixed';

interface TestSeriesProps {
  moduleId: string;
  moduleName: string;
}

const PASS_THRESHOLD = 70;
const LEVEL_LABELS: Record<string, string> = {
  basic: 'Basic', intermediate: 'Intermediate', advanced: 'Advanced', mixed: 'Mixed (All Levels)',
};
const LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-green-500/10 text-green-400 border border-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  advanced: 'bg-red-500/10 text-red-400 border border-red-500/20',
  mixed: 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20',
};
const TIME_PER_Q = 45;

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function TestSeries({ moduleId, moduleName }: TestSeriesProps) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [levelChoice, setLevelChoice] = useState<LevelChoice>('basic');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [pastAttempts, setPastAttempts] = useState<PastAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: number; total: number; xp: number; passed: boolean; pct: number; timeTaken: number;
    review: { question: Question; selected: number | null; correct: boolean }[];
  } | null>(null);

  const online = useOnlineStatus();

  const fetchData = useCallback(async () => {
    if (!online) {
      const cached = await getCachedQuestions(moduleId).catch(() => []);
      setAllQuestions(cached as Question[]);
      setLoading(false);
      return;
    }
    const [{ data: qData }, { data: aData }] = await Promise.all([
      supabase.from('module_questions').select('*').eq('module_id', moduleId).order('id'),
      supabase.from('test_attempts').select('*').eq('module_id', moduleId).order('created_at', { ascending: false }).limit(10),
    ]);
    if (qData) setAllQuestions(qData as Question[]);
    if (aData) setPastAttempts(aData as PastAttempt[]);
    setLoading(false);
  }, [moduleId, online]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (phase !== 'test') return;
    if (timeLeft <= 0) { finishTest(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const questionsWithTopics = useMemo(
    () => allQuestions.map(q => ({ ...q, topic: classifyTopic(q.question) })),
    [allQuestions]
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

  const filteredForTopic = useMemo(() => {
    let result = questionsWithTopics;
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
  }, [questionsWithTopics, activeTopic, searchQuery]);

  const startTest = (level: LevelChoice) => {
    let pool = level === 'mixed' ? filteredForTopic : filteredForTopic.filter(q => q.level === level);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(15, pool.length));
    setQuestions(shuffled);
    setLevelChoice(level);
    setCurrent(0);
    setAnswers({});
    setTimeLeft(shuffled.length * TIME_PER_Q);
    setPhase('test');
  };

  const selectAnswer = (qId: number, idx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const finishTest = useCallback(() => {
    let correct = 0;
    let xp = 0;
    const review = questions.map(q => {
      const selected = answers[q.id] ?? null;
      const isCorrect = selected === q.correct_index;
      if (isCorrect) { correct++; xp += q.xp_reward; }
      return { question: q, selected, correct: isCorrect };
    });
    const total = questions.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = pct >= PASS_THRESHOLD;
    const timeTaken = total * TIME_PER_Q - Math.max(0, timeLeft);

    setResult({ correct, total, xp, passed, pct, timeTaken, review });

    supabase.from('test_attempts').insert({
      module_id: moduleId,
      level: levelChoice,
      total_questions: total,
      correct_answers: correct,
      xp_earned: xp,
      time_taken_seconds: timeTaken,
      passed,
      score_percent: pct,
      answers: JSON.stringify(review.map(r => ({
        question_id: r.question.id,
        selected_index: r.selected,
        correct: r.correct,
      }))),
    }).then(() => fetchData());

    setPhase('result');
  }, [questions, answers, timeLeft, moduleId, levelChoice, fetchData]);

  const resetToMenu = () => {
    setPhase('menu');
    setResult(null);
    setQuestions([]);
    setAnswers({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  // --- MENU ---
  if (phase === 'menu') {
    const bestScore = pastAttempts.length > 0 ? Math.max(...pastAttempts.map(a => a.score_percent)) : 0;
    const attemptsPassed = pastAttempts.filter(a => a.passed).length;

    const getLevelCount = (level: LevelChoice) => {
      let pool = filteredForTopic;
      if (level !== 'mixed') pool = pool.filter(q => q.level === level);
      return Math.min(15, pool.length);
    };

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
            <ClipboardList size={18} className="text-[#00d4aa]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{moduleName} — Test Series</h3>
            <p className="text-slate-500 text-sm">Timed exams with {PASS_THRESHOLD}% to pass. Results saved automatically.</p>
          </div>
        </div>

        {!online && (
          <div className="flex items-center gap-2 mb-6 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5">
            <WifiOff size={14} /> Offline mode — showing cached questions
          </div>
        )}

        {pastAttempts.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#0a1628] border border-[#142952] rounded-xl p-4 text-center">
              <Trophy size={16} className="text-[#00d4aa] mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{bestScore}%</div>
              <div className="text-xs text-slate-500">Best Score</div>
            </div>
            <div className="bg-[#0a1628] border border-[#142952] rounded-xl p-4 text-center">
              <Award size={16} className="text-green-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{attemptsPassed}</div>
              <div className="text-xs text-slate-500">Tests Passed</div>
            </div>
            <div className="bg-[#0a1628] border border-[#142952] rounded-xl p-4 text-center">
              <History size={16} className="text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{pastAttempts.length}</div>
              <div className="text-xs text-slate-500">Total Attempts</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword or topic..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a1628] border border-[#142952] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Topic filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FolderTree size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">FILTER BY TOPIC</span>
            {activeTopic && (
              <button onClick={() => setActiveTopic(null)} className="ml-auto text-xs text-[#00d4aa] hover:underline">
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTopic(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!activeTopic ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#0a1628] border border-[#142952] text-slate-400 hover:text-white'}`}
            >
              All Topics
            </button>
            {topics.map(([topic, c]) => (
              <button
                key={topic}
                onClick={() => setActiveTopic(activeTopic === topic ? null : topic)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeTopic === topic ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#0a1628] border border-[#142952] text-slate-400 hover:text-white'}`}
              >
                {topic}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTopic === topic ? 'bg-[#0a1628]/20 text-[#0a1628]' : 'bg-[#142952] text-slate-500'}`}>
                  {c.total}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Topic breakdown */}
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
                <div className="text-center"><div className="text-lg font-bold text-green-400">{c.basic}</div><div className="text-xs text-slate-500">Basic</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-400">{c.intermediate}</div><div className="text-xs text-slate-500">Intermediate</div></div>
                <div className="text-center"><div className="text-lg font-bold text-red-400">{c.advanced}</div><div className="text-xs text-slate-500">Advanced</div></div>
              </div>
            </div>
          );
        })()}

        {/* Level cards */}
        <div className="mb-3 flex items-center gap-2">
          <Target size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">CHOOSE TEST LEVEL</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {(['basic', 'intermediate', 'advanced', 'mixed'] as LevelChoice[]).map(lvl => {
            const count = getLevelCount(lvl);
            const timeMin = Math.ceil((count * TIME_PER_Q) / 60);
            return (
              <button
                key={lvl}
                onClick={() => startTest(lvl)}
                disabled={count === 0}
                className="group bg-[#0a1628] border border-[#142952] rounded-xl p-5 text-left hover:border-[#00d4aa]/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEVEL_COLORS[lvl]}`}>
                    {LEVEL_LABELS[lvl]}
                  </span>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-[#00d4aa] transition-colors" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{count} questions</span>
                  <span className="flex items-center gap-1 text-slate-500"><Clock size={12} /> {timeMin} min</span>
                </div>
              </button>
            );
          })}
        </div>

        {pastAttempts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">RECENT ATTEMPTS</span>
            </div>
            <div className="space-y-2">
              {pastAttempts.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-[#0a1628] border border-[#142952] rounded-lg px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[a.level] || LEVEL_COLORS.mixed}`}>
                    {LEVEL_LABELS[a.level] || a.level}
                  </span>
                  <div className="flex-1 text-sm text-slate-400">{a.correct_answers}/{a.total_questions} correct</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500"><Clock size={11} /> {formatTime(a.time_taken_seconds)}</div>
                  <div className="flex items-center gap-1 text-xs text-[#00d4aa] font-mono"><Zap size={11} /> +{a.xp_earned}</div>
                  <span className={`text-xs font-semibold ${a.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {a.passed ? 'PASSED' : 'FAILED'} · {a.score_percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- TEST IN PROGRESS ---
  if (phase === 'test') {
    const q = questions[current];
    const answered = Object.keys(answers).length;
    const progress = (answered / questions.length) * 100;
    const lowTime = timeLeft <= 30;

    return (
      <div>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-2 rounded-full bg-[#0a1628] border border-[#142952] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#2fe0c0] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className={`flex items-center gap-1.5 font-mono text-sm font-bold flex-shrink-0 ${lowTime ? 'text-red-400 animate-pulse' : 'text-[#00d4aa]'}`}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-slate-500 font-mono">Q{current + 1} of {questions.length}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[q.level]}`}>{LEVEL_LABELS[q.level]}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 font-medium">
            {classifyTopic(q.question)}
          </span>
          <span className="text-xs text-slate-500 ml-auto">{answered} answered</span>
        </div>

        <div className="bg-[#0a1628] border border-[#142952] rounded-xl p-6 mb-5">
          <p className="text-white text-base font-medium leading-relaxed">{q.question}</p>
        </div>

        <div className="space-y-3 mb-6">
          {q.options.map((opt, i) => {
            const isSelected = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(q.id, i)}
                className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                  isSelected ? 'bg-[#00d4aa]/10 border-[#00d4aa]/50 text-white' : 'bg-[#0f2040] border-[#142952] text-slate-300 hover:border-[#00d4aa]/30 hover:text-white'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected ? 'bg-[#00d4aa] text-[#0a1628]' : 'bg-[#142952] text-slate-400'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {isSelected && <Check size={16} className="text-[#00d4aa] flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="px-4 py-2.5 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-400 text-sm font-medium hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            Previous
          </button>
          <div className="hidden sm:flex items-center gap-1.5">
            {questions.map((qq, i) => (
              <button key={qq.id} onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-[#00d4aa] scale-125' : answers[qq.id] !== undefined ? 'bg-[#00d4aa]/40' : 'bg-[#142952]'}`} />
            ))}
          </div>
          {current + 1 < questions.length ? (
            <button onClick={() => setCurrent(c => c + 1)} className="px-4 py-2.5 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 text-sm font-medium hover:text-white transition-colors">
              Next
            </button>
          ) : (
            <button onClick={finishTest} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00d4aa] text-[#0a1628] text-sm font-semibold hover:bg-[#2fe0c0] transition-colors">
              Submit Test <Check size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- RESULT ---
  if (phase === 'result' && result) {
    return (
      <div>
        <div className="flex flex-col items-center text-center py-6 mb-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 ${result.passed ? 'bg-green-500/20 border-2 border-green-500/40' : 'bg-red-500/20 border-2 border-red-500/40'}`}>
            {result.passed ? <Trophy size={40} className="text-green-400" /> : <AlertCircle size={40} className="text-red-400" />}
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{result.passed ? 'Test Passed!' : 'Test Failed'}</h3>
          <p className="text-slate-400 text-sm mb-1">{result.correct} out of {result.total} correct · {result.pct}%</p>
          <p className="text-slate-500 text-xs">Passing score: {PASS_THRESHOLD}% · Time: {formatTime(result.timeTaken)}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#0a1628] border border-[#142952] rounded-xl p-4 text-center">
            <Target size={16} className="text-slate-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{result.pct}%</div>
            <div className="text-xs text-slate-500">Score</div>
          </div>
          <div className="bg-[#0a1628] border border-[#142952] rounded-xl p-4 text-center">
            <Zap size={16} className="text-[#00d4aa] mx-auto mb-1" />
            <div className="text-xl font-bold text-[#00d4aa]">+{result.xp}</div>
            <div className="text-xs text-slate-500">XP Earned</div>
          </div>
          <div className="bg-[#0a1628] border border-[#142952] rounded-xl p-4 text-center">
            <Clock size={16} className="text-blue-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{formatTime(result.timeTaken)}</div>
            <div className="text-xs text-slate-500">Time</div>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">ANSWER REVIEW</span>
        </div>
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto scrollbar-hide">
          {result.review.map((r, i) => (
            <div key={i} className={`rounded-lg border p-3 ${r.correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-start gap-2.5">
                {r.correct ? <Check size={15} className="text-green-400 flex-shrink-0 mt-0.5" /> : <X size={15} className="text-red-400 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug mb-1">{r.question.question}</p>
                  {!r.correct && r.selected !== null && (
                    <p className="text-xs text-red-400">Your answer: {r.question.options[r.selected]}</p>
                  )}
                  {!r.correct && (
                    <p className="text-xs text-green-400">Correct: {r.question.options[r.question.correct_index]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => startTest(levelChoice)} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0f2040] border border-[#142952] text-slate-300 font-medium text-sm hover:text-white transition-colors">
            <RotateCcw size={16} /> Retake
          </button>
          <button onClick={resetToMenu} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00d4aa] text-[#0a1628] font-semibold text-sm hover:bg-[#2fe0c0] transition-colors">
            Back to Tests <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

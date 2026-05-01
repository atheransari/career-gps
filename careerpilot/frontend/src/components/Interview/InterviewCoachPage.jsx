import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import VoiceRecorder from './VoiceRecorder';
import InterviewResults from './InterviewResults';

// ── Helpers ───────────────────────────────────────────────────────────────────
const scoreColor = (s) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

const user = (() => {
  try { return JSON.parse(localStorage.getItem('cp-user') || 'null'); } catch { return null; }
})();

// ── Mini sparkline for progress graph ────────────────────────────────────────
const Sparkline = ({ sessions }) => {
  if (sessions.length < 3) return null;
  const scores = sessions.map(s => s.overall_score).reverse(); // oldest→newest
  const W = 260, H = 60, PAD = 8;
  const min = Math.max(0, Math.min(...scores) - 5);
  const max = Math.min(100, Math.max(...scores) + 5);
  const toX = (i) => PAD + (i / (scores.length - 1)) * (W - PAD * 2);
  const toY = (v) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
  const pts = scores.map((s, i) => `${toX(i)},${toY(s)}`).join(' ');
  const latest = scores[scores.length - 1];
  const color = scoreColor(latest);
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Progress ({sessions.length} sessions)
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
          strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
        {scores.map((s, i) => (
          <circle key={i} cx={toX(i)} cy={toY(s)} r="3" fill={color} stroke="#111827" strokeWidth="1.5" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginTop: 4 }}>
        <span>Oldest</span>
        <span style={{ color, fontWeight: 800 }}>Latest: {latest}</span>
      </div>
    </div>
  );
};

// ── History sidebar entry ─────────────────────────────────────────────────────
const HistoryItem = ({ session, onClick }) => {
  const date = new Date(session.created_at);
  const color = scoreColor(session.overall_score);
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: 8, transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color, background: `${color}15`, padding: '2px 8px', borderRadius: 99 }}>
          {session.overall_score}
        </span>
        <span style={{ fontSize: 10, color: '#475569' }}>
          {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {session.question}
      </p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const InterviewCoachPage = () => {
  const [view, setView] = useState('selection');
  const [type, setType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastMetrics, setLastMetrics] = useState(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Phase 5 new state
  const [textMode, setTextMode] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [warmupMode, setWarmupMode] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [peekSession, setPeekSession] = useState(null);

  // Load history on mount (only if logged in)
  useEffect(() => {
    if (!user) return;
    setLoadingSessions(true);
    api.getInterviewSessions()
      .then(data => setSessions(data || []))
      .catch(() => {}) // silently fail — history is optional
      .finally(() => setLoadingSessions(false));
  }, []);

  const handleStart = async (selectedType) => {
    setType(selectedType);
    setLoading(true);
    setError('');
    try {
      const data = await api.getInterviewQuestions(selectedType);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setTextAnswer('');
      setView('recording');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingStop = async (metrics) => {
    setLastMetrics(metrics);
    setLastTranscript(metrics.transcript);
    await submitAnswer(metrics.transcript, metrics);
  };

  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) { setError('Please type your answer before submitting.'); return; }
    const words = textAnswer.trim().split(/\s+/).length;
    const mockMetrics = {
      transcript: textAnswer,
      duration: Math.round(words / 2),
      pauses: 0,
      fillers: [],
      wpm: words * 2,
    };
    setLastMetrics(mockMetrics);
    setLastTranscript(textAnswer);
    await submitAnswer(textAnswer, mockMetrics);
  };

  const submitAnswer = async (transcript, metrics) => {
    setLoading(true);
    setView('analysis');
    try {
      const result = await api.analyseInterview({
        question: questions[currentIndex],
        transcript,
        duration_seconds: metrics.duration || 0,
        pause_count: metrics.pauses || 0,
        filler_words: metrics.fillers || [],
        words_per_minute: metrics.wpm || 0,
      });
      setAnalysis(result);

      // Auto-save session if user is logged in & not in warmup mode
      if (user && !warmupMode) {
        api.saveInterviewSession({
          session_type: type || 'General',
          question: questions[currentIndex],
          transcript,
          overall_score: result.overall_score ?? 0,
          fluency_score: result.fluency_score ?? 0,
          confidence_score: result.confidence_score ?? 0,
          content_score: result.content_score ?? 0,
          duration_seconds: metrics.duration || 0,
          words_per_minute: metrics.wpm || 0,
          filler_count: (metrics.fillers || []).length,
        }).then(saved => {
          setSessions(prev => [saved, ...prev]);
        }).catch(() => {});
      }

      setView('results');
    } catch (err) {
      setError(err.message);
      setView('recording');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setTextAnswer('');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setView('recording');
    } else {
      setView('selection');
    }
  };

  // ── Render: Type Selection ────────────────────────────────────────────────
  const renderSelection = () => (
    <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 860, margin: '60px auto' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.04em' }}>
        Voice Interview Coach
      </h1>
      <p style={{ color: '#94A3B8', fontSize: 18, marginBottom: 16 }}>
        Master your communication with real-time AI feedback
      </p>

      {/* Mode toggles */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 48 }}>
        <button
          onClick={() => setWarmupMode(w => !w)}
          style={{
            padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: warmupMode ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
            color: warmupMode ? '#F59E0B' : '#64748B',
            outline: warmupMode ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.2s',
          }}
        >
          🔥 Warmup Mode {warmupMode ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setTextMode(m => !m)}
          style={{
            padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: textMode ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            color: textMode ? '#818CF8' : '#64748B',
            outline: textMode ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.2s',
          }}
        >
          ⌨️ Text Mode {textMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {warmupMode && (
        <div style={{ marginBottom: 24, padding: '10px 20px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, fontSize: 13, color: '#F59E0B', maxWidth: 500, margin: '0 auto 32px' }}>
          🔥 Warmup Mode: sessions won't be saved to your history
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
          { name: 'Technical', icon: '💻', desc: 'Coding, system design & domain knowledge.' },
          { name: 'HR', icon: '🤝', desc: 'Culture fit, career goals & logistics.' },
          { name: 'Behavioural', icon: '👤', desc: 'STAR method & situational scenarios.' }
        ].map(item => (
          <div key={item.name} onClick={() => handleStart(item.name)} className="card"
            style={{ padding: 32, cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(255,255,255,0.05)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
          >
            <div style={{ fontSize: 40, marginBottom: 20 }}>{item.icon}</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{item.name}</h3>
            <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render: Recording / Text Input ────────────────────────────────────────
  const renderRecording = () => (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <span style={{
          padding: '6px 12px', background: 'rgba(99,102,241,0.1)', color: '#6366F1',
          borderRadius: 999, fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.05em', marginBottom: 16, display: 'inline-block'
        }}>
          Question {currentIndex + 1} of {questions.length}
          {warmupMode && ' · 🔥 Warmup'}
          {textMode && ' · ⌨️ Text'}
        </span>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.4 }}>
          {questions[currentIndex]}
        </h2>
      </div>

      {textMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <textarea
            value={textAnswer}
            onChange={e => setTextAnswer(e.target.value)}
            placeholder="Type your answer here... (aim for 3–5 sentences)"
            rows={6}
            className="input-field"
            style={{ resize: 'vertical', fontSize: 15, lineHeight: 1.6, padding: '16px 20px' }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textAnswer.trim()}
            className="btn-primary"
            style={{ fontSize: 15, padding: '14px 32px', opacity: textAnswer.trim() ? 1 : 0.5 }}
          >
            Submit Answer →
          </button>
        </div>
      ) : (
        <VoiceRecorder onStop={handleRecordingStop} />
      )}
    </div>
  );

  // ── Render: Analysis loading ────────────────────────────────────────────
  const renderAnalysis = () => (
    <div style={{ textAlign: 'center', padding: '100px 0' }}>
      <div className="shimmer" style={{ width: 80, height: 80, borderRadius: '50%', background: '#6366F1', margin: '0 auto 32px' }} />
      <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
        AI is analyzing your response...
      </h2>
      <p style={{ color: '#94A3B8' }}>Evaluating tone, clarity, and technical correctness.</p>
      <style>{`
        .shimmer { animation: pulse 1.5s infinite; }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(99,102,241,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
      `}</style>
    </div>
  );

  // ── History Sidebar ─────────────────────────────────────────────────────
  const renderSidebar = () => (
    <div style={{
      width: sidebarOpen ? 270 : 44, flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 16, overflow: 'hidden', position: 'relative',
    }}>
      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        style={{
          position: 'absolute', top: 12, right: sidebarOpen ? 12 : '50%', transform: sidebarOpen ? 'none' : 'translateX(50%)',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#818CF8', fontSize: 12,
          transition: 'all 0.3s',
        }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {sidebarOpen && (
        <div style={{ padding: '16px 14px', paddingTop: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            📋 Session History
          </p>

          {!user && (
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
              Log in to save and view your session history.
            </p>
          )}

          {user && (
            <>
              <Sparkline sessions={sessions} />
              {loadingSessions ? (
                [0,1,2].map(i => <div key={i} className="skeleton-box" style={{ height: 64, borderRadius: 10, marginBottom: 8 }} />)
              ) : sessions.length === 0 ? (
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                  No sessions yet. Complete your first interview to see history here.
                </p>
              ) : (
                sessions.map((s, i) => (
                  <HistoryItem key={s.id || i} session={s} onClick={() => setPeekSession(s)} />
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  // ── Peek modal for a past session ──────────────────────────────────────
  const renderPeekModal = () => (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => setPeekSession(null)}
    >
      <div onClick={e => e.stopPropagation()} className="animate-fade-in-up" style={{
        background: '#0D1424', border: '1px solid #1F2937', borderRadius: 20,
        padding: '32px 36px', maxWidth: 520, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Past Session · {peekSession?.session_type}
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 6, lineHeight: 1.4 }}>
              {peekSession?.question}
            </h3>
          </div>
          <button onClick={() => setPeekSession(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1F2937', borderRadius: 8, padding: '6px 10px', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Overall', value: peekSession?.overall_score },
            { label: 'Fluency', value: peekSession?.fluency_score },
            { label: 'Confidence', value: peekSession?.confidence_score },
            { label: 'Content', value: peekSession?.content_score },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(value ?? 0) }}>{value ?? '—'}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px 16px', maxHeight: 120, overflowY: 'auto' }}>
          <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>{peekSession?.transcript}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {peekSession && renderPeekModal()}

        {error && (
          <div className="card" style={{ padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', marginBottom: 24, textAlign: 'center' }}>
            {error}
            <button onClick={() => setError('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
          </div>
        )}

        {loading && view === 'selection' ? (
          <div style={{ textAlign: 'center', marginTop: 100 }}>
            <h3 style={{ color: '#fff' }}>Preparing your session...</h3>
          </div>
        ) : (
          <>
            {view === 'selection' && renderSelection()}
            {view === 'recording' && renderRecording()}
            {view === 'analysis' && renderAnalysis()}
            {view === 'results' && analysis && (
              <InterviewResults
                results={analysis}
                transcript={lastTranscript}
                metrics={lastMetrics}
                onRetry={() => setView('recording')}
                onNext={nextQuestion}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewCoachPage;

import React, { useEffect, useState } from 'react';

const getColor = (score) => {
  if (score < 50) return '#EF4444';
  if (score < 75) return '#F59E0B';
  return '#10B981';
};

const getBg = (score) => {
  if (score < 50) return 'rgba(239,68,68,0.08)';
  if (score < 75) return 'rgba(245,158,11,0.08)';
  return 'rgba(16,185,129,0.08)';
};

const CountUp = ({ target, duration = 1200 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{val}</>;
};

const CircleScore = ({ score }) => {
  const radius = 80; // 200px total including stroke
  const circ = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 120);
    return () => clearTimeout(t);
  }, [score]);
  
  const offset = circ - (progress / 100) * circ;
  const color = getColor(score);

  return (
    <div style={{ position: 'relative', width: 200, height: 200 }}>
      {/* Glowing card effect behind main circle */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        filter: 'blur(16px)',
        zIndex: 0
      }} />
      <svg width="200" height="200" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#1F2937" strokeWidth="16"/>
        <circle
          cx="100" cy="100" r={radius} fill="none"
          stroke={color} strokeWidth="16"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 10px ${color}60)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <span style={{ fontSize: 52, fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>
          <CountUp target={score} />
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>/ 100</span>
      </div>
    </div>
  );
};

const MetricBar = ({ label, score, delay }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 300 + delay * 100);
    return () => clearTimeout(t);
  }, [score, delay]);
  
  const color = getColor(score);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{score}/100</span>
      </div>
      <div style={{ height: 8, background: '#1F2937', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${color}EE)`,
          width: `${width}%`,
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 12px ${color}80`,
        }}/>
      </div>
    </div>
  );
};

const ATSScore = ({ scores, prevScores }) => {
  if (!scores) return null;
  const { overall_score=0, keyword_score=0, formatting_score=0, sections_score=0, action_verbs_score=0, issues=[], strengths=[] } = scores;
  const delta = prevScores ? overall_score - prevScores.overall_score : null;
  const color = getColor(overall_score);

  const label = overall_score >= 75 ? 'Strong' : overall_score >= 50 ? 'Moderate' : 'Needs Fixes';

  return (
    <div className="animate-fade-in-up card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '24px 28px', borderBottom: '1px solid #1F2937',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 70%)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em' }}>ATS Analysis Report</h3>
          </div>
          <p style={{ fontSize: 14, color: '#64748B', marginLeft: 20, fontWeight: 500 }}>How your resume scores against structured ATS systems.</p>
        </div>
        {delta !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999,
            background: delta >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${delta >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <span style={{ fontSize: 18 }}>{delta >= 0 ? '🚀' : '📉'}</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: delta >= 0 ? '#10B981' : '#EF4444' }}>
              {delta >= 0 ? '+' : ''}{delta} pts improved
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '32px 28px' }}>
        {/* Score grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40, marginBottom: 36, alignItems: 'center' }}>
          {/* Circle */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '28px 36px',
            background: '#0D1424',
            borderRadius: 16,
            border: '1px solid #1F2937',
            gap: 16,
          }}>
            <CircleScore score={overall_score} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748B', marginBottom: 8 }}>Overall Match</p>
              <span style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 800,
                background: getBg(overall_score),
                color,
                border: `1px solid ${color}40`,
              }}>{label}</span>
            </div>
          </div>

          {/* Bars */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748B', marginBottom: 24 }}>Detailed Breakdown</p>
            <MetricBar label="Keyword Match" score={keyword_score} delay={1} />
            <MetricBar label="Formatting & Readability" score={formatting_score} delay={2} />
            <MetricBar label="Section Completeness" score={sections_score} delay={3} />
            <MetricBar label="Action Verbs Usage" score={action_verbs_score} delay={4} />
          </div>
        </div>

        {/* Strengths & Issues */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Strengths */}
          <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, padding: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#10B981', marginBottom: 16, fontSize: 15, letterSpacing: '-0.01em' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              </span>
              Strengths
            </h4>
            {strengths.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {strengths.map((s, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#10B981', fontSize: 13, marginTop: 2, flexShrink: 0, fontWeight: 900 }}>✓</span>
                    <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500, lineHeight: 1.6 }}>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 14, color: '#4B5563', fontStyle: 'italic' }}>No notable strengths detected.</p>
            )}
          </div>

          {/* Issues */}
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#EF4444', marginBottom: 16, fontSize: 15, letterSpacing: '-0.01em' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </span>
              Issues to Fix
            </h4>
            {issues.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {issues.map((issue, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#EF4444', fontSize: 12, marginTop: 3, flexShrink: 0, fontWeight: 900 }}>✕</span>
                    <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500, lineHeight: 1.6 }}>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 14, color: '#4B5563', fontStyle: 'italic' }}>No critical issues found! 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSScore;

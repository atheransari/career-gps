import React, { useEffect, useState } from 'react';

const getColor = (score) => {
  if (score < 50) return '#EF4444';
  if (score < 75) return '#F59E0B';
  return '#10B981';
};

const AnimatedRing = ({ score }) => {
  const r = 84;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  const color = getColor(score);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 200);
    return () => clearTimeout(t);
  }, [score, circ]);

  return (
    <svg width="210" height="210" style={{ transform: 'rotate(-90deg)' }}>
      {/* Background glow to the ring */}
      <circle cx="105" cy="105" r={r} fill="none" stroke="#1F2937" strokeWidth="18"/>
      <circle
        cx="105" cy="105" r={r} fill="none"
        stroke={color} strokeWidth="18"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
          filter: `drop-shadow(0 0 16px ${color}90)`,
        }}
      />
    </svg>
  );
};

const SkillGap = ({ skillGapData, jobTitle }) => {
  if (!skillGapData) return null;

  const {
    match_percentage = 0,
    strong_skills = [],
    partial_skills = [],
    missing_skills = [],
    summary = ''
  } = skillGapData;

  const [countVal, setCountVal] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = Math.ceil(match_percentage / 60);
    const t = setInterval(() => {
      v = Math.min(v + step, match_percentage);
      setCountVal(v);
      if (v >= match_percentage) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [match_percentage]);

  const matchLabel = match_percentage >= 75 ? 'Strong Fit' : match_percentage >= 50 ? 'Decent Fit' : 'Needs Work';
  const matchColor = getColor(match_percentage);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }} className="animate-fade-in-up">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.04em', marginBottom: 8 }}>
          Your Gap Analysis
        </h2>
        {jobTitle && (
          <p style={{ color: '#818CF8', fontSize: 16, fontWeight: 700, background: 'rgba(99,102,241,0.1)', display: 'inline-block', padding: '6px 16px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.2)' }}>
            Comparing against: {jobTitle}
          </p>
        )}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #0D1424 0%, #111827 100%)',
        borderRadius: 16, overflow: 'hidden', marginBottom: 32,
        border: '1px solid rgba(99,102,241,0.15)',
        position: 'relative',
        display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center', justifyContent: 'space-between',
        padding: '36px 40px'
      }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: -60, right: 100, width: 240, height: 240, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }}/>

        <div style={{ flex: 1, minWidth: 280, position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, fontWeight: 500, marginBottom: 28 }}>
            {summary || 'A detailed breakdown of how your resume aligns with the job requirements.'}
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[
              { val: strong_skills.length, label: 'Strong', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
              { val: partial_skills.length, label: 'Partial', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
              { val: missing_skills.length, label: 'Missing', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
            ].map(({ val, label, color, bg, border }) => (
              <div key={label} style={{ padding: '12px 20px', borderRadius: 12, background: bg, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{val}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Score ring */}
        <div style={{
          flexShrink: 0, position: 'relative', zIndex: 1,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 20, padding: '24px',
          border: '1px solid #1F2937',
        }}>
          <div style={{ position: 'relative', width: 210, height: 210 }}>
            <AnimatedRing score={match_percentage} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 56, fontWeight: 900, color: matchColor, lineHeight: 1, letterSpacing: '-0.04em' }}>{countVal}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#4B5563', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>% Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Strong */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#10B981', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strong Skills ({strong_skills.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {strong_skills.length > 0 ? strong_skills.map((s, i) => (
              <span key={i} style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700,
                background: '#10B981', color: '#fff', border: '1px solid rgba(16,185,129,0.5)',
                boxShadow: '0 0 12px rgba(16,185,129,0.4)',
              }}>{s.skill}</span>
            )) : <p style={{ fontSize: 14, color: '#64748B', fontStyle: 'italic' }}>None identified</p>}
          </div>
        </div>

        {/* Partial */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#F59E0B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partial Skills ({partial_skills.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {partial_skills.length > 0 ? partial_skills.map((s, i) => (
              <span key={i} style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700,
                background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.4)',
              }}>{s.skill}</span>
            )) : <p style={{ fontSize: 14, color: '#64748B', fontStyle: 'italic' }}>None identified</p>}
          </div>
        </div>

        {/* Missing Layout */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#EF4444', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Missing Skills ({missing_skills.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {missing_skills.length > 0 ? missing_skills.map((s, i) => {
              const isCritical = s.importance === 'critical';
              return (
                <span key={i} 
                  className={isCritical ? "animate-pulse-red" : ""}
                  style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700,
                  background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)',
                }}>
                  {isCritical ? '🔥' : '⚠️'} {s.skill}
                </span>
              );
            }) : <p style={{ fontSize: 14, color: '#64748B', fontStyle: 'italic' }}>No missing skills! Great fit. 🎉</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGap;

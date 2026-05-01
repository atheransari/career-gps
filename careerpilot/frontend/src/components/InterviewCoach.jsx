import React, { useState } from 'react';

const DIFFICULTY_STYLE = {
  Easy:   { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  Medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  Hard:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

const CATEGORY_ICONS = {
  Technical: '⚙️',
  Behavioral: '🧠',
  Situational: '💡',
  'Role-Specific': '🎯',
};

const InterviewCoach = ({ questions = [], jobTitle = '' }) => {
  const [openIdx, setOpenIdx] = useState(0);

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#64748B' }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>No interview questions generated yet.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="badge" style={{ marginBottom: 16 }}>
          🎤 AI Interview Coach
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.04em', marginBottom: 10 }}>Ace Your Interview</h2>
        <p style={{ color: '#4B5563', fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.65, fontWeight: 500 }}>
          {questions.length} questions tailored to your resume and {jobTitle ? `the "${jobTitle}" role` : 'your target role'}.
        </p>
      </div>

      {/* Question Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questions.map((q, i) => {
          const isOpen = openIdx === i;
          const diff = DIFFICULTY_STYLE[q.difficulty] || DIFFICULTY_STYLE.Medium;
          const icon = CATEGORY_ICONS[q.category] || '❓';

          return (
            <div
              key={i}
              className="card"
              style={{
                overflow: 'hidden',
                border: isOpen ? '1px solid rgba(99,102,241,0.4)' : '1px solid #1F2937',
                transition: 'all 0.3s ease',
                boxShadow: isOpen ? '0 0 0 3px rgba(99,102,241,0.1), 0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {/* Question row */}
              <div
                onClick={() => setOpenIdx(isOpen ? null : i)}
                style={{
                  padding: '20px 24px', cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  background: isOpen ? 'rgba(99,102,241,0.03)' : 'transparent',
                }}
              >
                {/* Number */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isOpen ? 'linear-gradient(135deg,#6366F1,#4F46E5)' : '#0D1424',
                  color: isOpen ? '#fff' : '#64748B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 14, transition: 'all 0.3s',
                  border: isOpen ? '1px solid rgba(99,102,241,0.5)' : '1px solid #1F2937',
                }}>
                  {i + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', background: '#0D1424', padding: '3px 10px', borderRadius: 8, border: '1px solid #1F2937' }}>
                      {icon} {q.category}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, color: diff.color, background: diff.bg, border: `1px solid ${diff.border}` }}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.55 }}>{q.question}</p>
                </div>

                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: '#0D1424', border: '1px solid #1F2937',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                }}>
                  <svg style={{ width: 14, height: 14, color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>

              {/* STAR guide */}
              {isOpen && q.star_guide && (
                <div className="animate-fade-in" style={{ padding: '0 24px 24px', borderTop: '1px solid #1F2937', background: 'rgba(99,102,241,0.01)' }}>
                  <p className="section-label" style={{ marginBottom: 16, marginTop: 20 }}>
                    ✦ STAR Framework Answer Guide
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    {[
                      { key: 'situation', label: 'Situation', color: '#6366F1', icon: '📍' },
                      { key: 'task',      label: 'Task',      color: '#A78BFA', icon: '📋' },
                      { key: 'action',    label: 'Action',    color: '#10B981', icon: '⚡' },
                      { key: 'result',    label: 'Result',    color: '#F59E0B', icon: '🏆' },
                    ].map(({ key, label, color, icon }) => (
                      <div key={key} style={{
                        padding: '16px', borderRadius: 12,
                        background: '#0D1424', border: '1px solid #1F2937',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.6 }} />
                        <p style={{ fontSize: 11, fontWeight: 800, color, marginBottom: 8, letterSpacing: '0.06em' }}>
                          {icon} {label}
                        </p>
                        <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
                          {q.star_guide[key] || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom tip */}
      <div style={{
        marginTop: 32, padding: '20px 24px', background: 'rgba(99,102,241,0.05)',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14,
        display: 'flex', gap: 14, alignItems: 'flex-start',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>💡</span>
        </div>
        <div>
          <p style={{ fontWeight: 800, color: '#F1F5F9', fontSize: 13, marginBottom: 4 }}>Pro tip: Time your answers</p>
          <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, fontWeight: 500 }}>
            Practice each answer out loud, timing yourself to 90–120 seconds. Record yourself once and watch it back — most people are surprised by their habits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewCoach;

import React, { useState } from 'react';

const DIFFICULTY_STYLE = {
  Easy:   { color:'#10b981', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.2)' },
  Medium: { color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.2)' },
  Hard:   { color:'#f43f5e', bg:'rgba(244,63,94,0.1)', border:'rgba(244,63,94,0.2)' },
};

const CATEGORY_ICONS = {
  Technical: '⚙️',
  Behavioral: '🧠',
  Situational: '💡',
  'Role-Specific': '🎯',
};

const InterviewCoach = ({ questions = [], jobTitle = '' }) => {
  const [openIdx, setOpenIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'tips'

  if (!questions || questions.length === 0) {
    return (
      <div style={{textAlign:'center',padding:'80px 24px',color:'var(--text2)'}}>
        <p style={{fontSize:17,fontWeight:700}}>No interview questions generated yet.</p>
      </div>
    );
  }

  return (
    <div style={{maxWidth:860,margin:'0 auto'}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 18px',borderRadius:999,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',marginBottom:16}}>
          <span style={{fontSize:14}}>🎤</span>
          <span style={{fontSize:12,fontWeight:800,color:'#6366f1',letterSpacing:'0.1em',textTransform:'uppercase'}}>AI Interview Coach</span>
        </div>
        <h2 style={{fontSize:32,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em',marginBottom:8}}>Ace Your Interview</h2>
        <p style={{color:'var(--text2)',fontSize:15,maxWidth:480,margin:'0 auto',lineHeight:1.6}}>
          {questions.length} questions tailored to your resume and {jobTitle ? `the "${jobTitle}" role` : 'your target role'}.
        </p>
      </div>

      {/* Question Accordion */}
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {questions.map((q, i) => {
          const isOpen = openIdx === i;
          const diff = DIFFICULTY_STYLE[q.difficulty] || DIFFICULTY_STYLE.Medium;
          const icon = CATEGORY_ICONS[q.category] || '❓';

          return (
            <div
              key={i}
              className="card"
              style={{overflow:'hidden',border: isOpen ? '2px solid rgba(99,102,241,0.35)' : '1.5px solid var(--border)',transition:'all 0.3s'}}
            >
              {/* Question row */}
              <div
                onClick={() => setOpenIdx(isOpen ? null : i)}
                style={{
                  padding:'20px 24px',cursor:'pointer',
                  display:'flex',alignItems:'flex-start',gap:16,
                }}
              >
                {/* Number */}
                <div style={{
                  width:40,height:40,borderRadius:12,flexShrink:0,
                  background: isOpen ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg3)',
                  color: isOpen ? '#fff' : 'var(--text3)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontWeight:900,fontSize:15,transition:'all 0.3s',
                  border: isOpen ? 'none' : '1px solid var(--border)',
                }}>
                  {i + 1}
                </div>

                <div style={{flex:1}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:'var(--text3)',background:'var(--bg3)',padding:'2px 8px',borderRadius:6,border:'1px solid var(--border)'}}>
                      {icon} {q.category}
                    </span>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:6,color:diff.color,background:diff.bg,border:`1px solid ${diff.border}`}}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p style={{fontSize:16,fontWeight:700,color:'var(--text)',lineHeight:1.5}}>{q.question}</p>
                </div>

                <div style={{
                  width:32,height:32,borderRadius:8,background:'var(--bg3)',border:'1px solid var(--border)',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                  transition:'transform 0.3s',transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                }}>
                  <svg style={{width:16,height:16,color:'var(--text3)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>

              {/* STAR guide */}
              {isOpen && q.star_guide && (
                <div className="animate-fade-in" style={{padding:'0 24px 24px',borderTop:'1px solid var(--border)'}}>
                  <p style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--text3)',marginBottom:16,marginTop:20}}>
                    ✦ STAR Framework Answer Guide
                  </p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
                    {[
                      { key:'situation', label:'Situation', color:'#6366f1', icon:'📍' },
                      { key:'task',      label:'Task',      color:'#8b5cf6', icon:'📋' },
                      { key:'action',    label:'Action',    color:'#10b981', icon:'⚡' },
                      { key:'result',    label:'Result',    color:'#f59e0b', icon:'🏆' },
                    ].map(({ key, label, color, icon }) => (
                      <div key={key} style={{
                        padding:'14px 16px',borderRadius:12,
                        background:`${color}08`,border:`1px solid ${color}20`,
                      }}>
                        <p style={{fontSize:11,fontWeight:800,color,marginBottom:6,letterSpacing:'0.06em'}}>
                          {icon} {label}
                        </p>
                        <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.5}}>
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
        marginTop:32,padding:'20px 24px',background:'rgba(99,102,241,0.05)',
        border:'1px solid rgba(99,102,241,0.15)',borderRadius:16,
        display:'flex',gap:12,alignItems:'flex-start',
      }}>
        <span style={{fontSize:22,flexShrink:0}}>💡</span>
        <div>
          <p style={{fontWeight:800,color:'var(--text)',fontSize:14,marginBottom:4}}>Pro tip</p>
          <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>
            Practice each answer out loud, timing yourself to 90–120 seconds. Record yourself once and watch it back — most people are surprised by their habits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewCoach;

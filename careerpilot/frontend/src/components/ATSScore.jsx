import React, { useEffect, useRef, useState } from 'react';

const getColor = (score) => {
  if (score < 50) return '#f43f5e';
  if (score < 75) return '#f59e0b';
  return '#10b981';
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
  const radius = 64;
  const circ = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 100);
    return () => clearTimeout(t);
  }, [score]);
  const offset = circ - (progress / 100) * circ;
  return (
    <div style={{position:'relative',width:168,height:168}}>
      <svg width="168" height="168" style={{transform:'rotate(-90deg)'}}>
        <circle cx="84" cy="84" r={radius} fill="none" stroke="var(--bg3)" strokeWidth="14"/>
        <circle
          cx="84" cy="84" r={radius} fill="none"
          stroke={getColor(score)} strokeWidth="14"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{transition:'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.5s'}}
        />
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:42,fontWeight:900,color:getColor(score),lineHeight:1,fontVariantNumeric:'tabular-nums'}}>
          <CountUp target={score} />
        </span>
        <span style={{fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:2}}>/ 100</span>
      </div>
    </div>
  );
};

const MetricBar = ({ label, score }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <div style={{marginBottom:18}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--text2)'}}>{label}</span>
        <span style={{fontSize:13,fontWeight:800,color:getColor(score)}}>{score}/100</span>
      </div>
      <div style={{height:8,background:'var(--bg3)',borderRadius:999,overflow:'hidden'}}>
        <div style={{
          height:'100%',borderRadius:999,
          background: `linear-gradient(90deg, ${getColor(score)}, ${getColor(score)}cc)`,
          width:`${width}%`,
          transition:'width 1s cubic-bezier(0.4,0,0.2,1)',
          boxShadow:`0 2px 8px ${getColor(score)}40`,
        }}/>
      </div>
    </div>
  );
};

const ATSScore = ({ scores, prevScores }) => {
  if (!scores) return null;
  const { overall_score=0, keyword_score=0, formatting_score=0, sections_score=0, action_verbs_score=0, issues=[], strengths=[] } = scores;
  const delta = prevScores ? overall_score - prevScores.overall_score : null;

  return (
    <div className="animate-fade-in-up card" style={{overflow:'hidden'}}>
      {/* Header */}
      <div style={{
        padding:'20px 28px',borderBottom:'1px solid var(--border)',
        display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,
      }}>
        <div>
          <h3 style={{fontSize:20,fontWeight:900,color:'var(--text)',letterSpacing:'-0.02em'}}>ATS Analysis Report</h3>
          <p style={{fontSize:13,color:'var(--text2)',marginTop:2}}>How well your resume scores against ATS systems</p>
        </div>
        {delta !== null && (
          <div style={{
            display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:999,
            background: delta >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${delta >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
          }}>
            <span style={{fontSize:18}}>{delta >= 0 ? '🚀' : '📉'}</span>
            <span style={{fontWeight:900,fontSize:16,color: delta >= 0 ? '#10b981' : '#f43f5e'}}>
              {delta >= 0 ? '+' : ''}{delta} pts after AI rewrite
            </span>
          </div>
        )}
      </div>

      <div style={{padding:'28px'}}>
        {/* Scores Grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,marginBottom:32,alignItems:'center'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 16px',background:'var(--bg3)',borderRadius:16,border:'1px solid var(--border)'}}>
            <p style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text3)',marginBottom:20}}>Overall ATS Match</p>
            <CircleScore score={overall_score} />
          </div>
          <div>
            <p style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text3)',marginBottom:20}}>Detailed Breakdown</p>
            <MetricBar label="Keyword Match" score={keyword_score} />
            <MetricBar label="Formatting & Readability" score={formatting_score} />
            <MetricBar label="Section Completeness" score={sections_score} />
            <MetricBar label="Action Verbs Usage" score={action_verbs_score} />
          </div>
        </div>

        {/* Strengths & Issues */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:14,padding:20}}>
            <h4 style={{display:'flex',alignItems:'center',gap:8,fontWeight:800,color:'#059669',marginBottom:14,fontSize:14}}>
              <svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Strengths
            </h4>
            {strengths.length > 0 ? (
              <ul style={{display:'flex',flexDirection:'column',gap:10}}>
                {strengths.map((s, i) => (
                  <li key={i} style={{display:'flex',alignItems:'flex-start',gap:8}}>
                    <span style={{color:'#10b981',fontSize:16,marginTop:1,flexShrink:0}}>✓</span>
                    <span style={{fontSize:13,color:'var(--text2)',fontWeight:500,lineHeight:1.5}}>{s}</span>
                  </li>
                ))}
              </ul>
            ) : <p style={{fontSize:13,color:'var(--text3)',fontStyle:'italic'}}>No strengths detected.</p>}
          </div>

          <div style={{background:'rgba(244,63,94,0.05)',border:'1px solid rgba(244,63,94,0.15)',borderRadius:14,padding:20}}>
            <h4 style={{display:'flex',alignItems:'center',gap:8,fontWeight:800,color:'#e11d48',marginBottom:14,fontSize:14}}>
              <svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              Issues to Fix
            </h4>
            {issues.length > 0 ? (
              <ul style={{display:'flex',flexDirection:'column',gap:10}}>
                {issues.map((issue, i) => (
                  <li key={i} style={{display:'flex',alignItems:'flex-start',gap:8}}>
                    <span style={{color:'#f43f5e',fontSize:14,marginTop:2,flexShrink:0}}>✕</span>
                    <span style={{fontSize:13,color:'var(--text2)',fontWeight:500,lineHeight:1.5}}>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : <p style={{fontSize:13,color:'var(--text3)',fontStyle:'italic'}}>No critical issues found! 🎉</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSScore;

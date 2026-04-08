import React, { useEffect, useState } from 'react';

const getColor = (score) => {
  if (score < 50) return '#f43f5e';
  if (score < 75) return '#f59e0b';
  return '#10b981';
};

const getStroke = (score) => {
  if (score < 50) return 'rgba(244,63,94,0.7)';
  if (score < 75) return 'rgba(245,158,11,0.7)';
  return 'rgba(16,185,129,0.7)';
};

const AnimatedRing = ({ score }) => {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 150);
    return () => clearTimeout(t);
  }, [score, circ]);

  return (
    <svg width="200" height="200" style={{transform:'rotate(-90deg)'}}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--bg3)" strokeWidth="16"/>
      <circle
        cx="100" cy="100" r={r} fill="none"
        stroke={getStroke(score)} strokeWidth="16"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{transition:'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)'}}
      />
    </svg>
  );
};

const SkillGap = ({ skillGapData }) => {
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
    <div style={{maxWidth:1000,margin:'0 auto'}} className="animate-fade-in-up">
      {/* Hero Header */}
      <div style={{
        background:'linear-gradient(135deg,#1e1b4b 0%,#1e293b 50%,#0f172a 100%)',
        borderRadius:24,overflow:'hidden',marginBottom:24,
        border:'1px solid rgba(99,102,241,0.2)',
        boxShadow:'0 20px 60px -10px rgba(0,0,0,0.4)',
      }}>
        <div style={{padding:'40px 40px',display:'flex',flexWrap:'wrap',gap:32,alignItems:'center',justifyContent:'space-between',position:'relative',overflow:'hidden'}}>
          {/* Glow orbs */}
          <div style={{position:'absolute',top:-80,right:120,width:280,height:280,borderRadius:'50%',background:'rgba(99,102,241,0.12)',filter:'blur(60px)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-60,left:40,width:200,height:200,borderRadius:'50%',background:'rgba(16,185,129,0.08)',filter:'blur(50px)',pointerEvents:'none'}}/>

          <div style={{flex:1,minWidth:260,position:'relative',zIndex:1}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:999,background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.25)',marginBottom:16}}>
              <span style={{fontSize:12}}>📊</span>
              <span style={{fontSize:11,fontWeight:800,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(165,180,252,1)'}}>Skill Match Report</span>
            </div>
            <h2 style={{fontSize:30,fontWeight:900,color:'#fff',letterSpacing:'-0.03em',marginBottom:12,lineHeight:1.15}}>
              Skill Gap Analysis
            </h2>
            <p style={{color:'rgba(148,163,184,1)',fontSize:15,lineHeight:1.7,maxWidth:420}}>
              {summary || 'A detailed breakdown of how your resume aligns with the job requirements.'}
            </p>
            {/* Quick stats */}
            <div style={{display:'flex',gap:16,marginTop:24,flexWrap:'wrap'}}>
              {[
                { val: strong_skills.length, label:'Strong', color:'#10b981', bg:'rgba(16,185,129,0.12)' },
                { val: partial_skills.length, label:'Partial', color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
                { val: missing_skills.length, label:'Missing', color:'#f43f5e', bg:'rgba(244,63,94,0.12)' },
              ].map(({ val, label, color, bg }) => (
                <div key={label} style={{padding:'10px 18px',borderRadius:12,background:bg,border:`1px solid ${color}25`}}>
                  <div style={{fontSize:22,fontWeight:900,color,lineHeight:1}}>{val}</div>
                  <div style={{fontSize:11,fontWeight:700,color:'rgba(148,163,184,0.8)',marginTop:3}}>{label} skills</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score ring */}
          <div style={{flexShrink:0,position:'relative',zIndex:1,background:'rgba(255,255,255,0.04)',borderRadius:20,padding:20,border:'1px solid rgba(255,255,255,0.08)',backdropFilter:'blur(10px)'}}>
            <div style={{position:'relative',width:200,height:200}}>
              <AnimatedRing score={match_percentage} />
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:48,fontWeight:900,color:matchColor,lineHeight:1}}>{countVal}</span>
                <span style={{fontSize:11,fontWeight:700,color:'rgba(148,163,184,0.7)',letterSpacing:'0.1em',textTransform:'uppercase',marginTop:2}}>% Match</span>
                <span style={{fontSize:11,fontWeight:800,color:matchColor,marginTop:6,padding:'2px 10px',borderRadius:999,background:`${matchColor}18`,border:`1px solid ${matchColor}30`}}>
                  {matchLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Columns */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>

        {/* Strong Skills */}
        <div className="card" style={{padding:24}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg style={{width:18,height:18,color:'#10b981'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <h3 style={{fontSize:15,fontWeight:800,color:'var(--text)'}}>Strong Match</h3>
              <p style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>{strong_skills.length} skills</p>
            </div>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {strong_skills.length > 0 ? strong_skills.map((s, i) => (
              <span key={i} style={{
                padding:'6px 12px',borderRadius:8,fontSize:13,fontWeight:700,
                background:'rgba(16,185,129,0.08)',color:'#059669',
                border:'1px solid rgba(16,185,129,0.2)',
                transition:'transform 0.2s',cursor:'default',display:'inline-block',
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >{s.skill}</span>
            )) : <p style={{fontSize:13,color:'var(--text3)',fontStyle:'italic'}}>None identified</p>}
          </div>
        </div>

        {/* Partial Skills */}
        <div className="card" style={{padding:24}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg style={{width:18,height:18,color:'#f59e0b'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <h3 style={{fontSize:15,fontWeight:800,color:'var(--text)'}}>Needs Development</h3>
              <p style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>{partial_skills.length} skills</p>
            </div>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {partial_skills.length > 0 ? partial_skills.map((s, i) => (
              <span key={i} style={{
                padding:'6px 12px',borderRadius:8,fontSize:13,fontWeight:700,
                background:'rgba(245,158,11,0.08)',color:'#d97706',
                border:'1px solid rgba(245,158,11,0.2)',
                transition:'transform 0.2s',cursor:'default',display:'inline-block',
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >{s.skill}</span>
            )) : <p style={{fontSize:13,color:'var(--text3)',fontStyle:'italic'}}>None identified</p>}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="card" style={{padding:24}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg style={{width:18,height:18,color:'#f43f5e'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <h3 style={{fontSize:15,fontWeight:800,color:'var(--text)'}}>Missing Skills</h3>
              <p style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>{missing_skills.length} skills to learn</p>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {missing_skills.length > 0 ? missing_skills.map((s, i) => {
              const impColor = s.importance === 'critical' ? { text:'#f43f5e', bg:'rgba(244,63,94,0.1)', border:'rgba(244,63,94,0.25)' }
                : s.importance === 'important' ? { text:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.25)' }
                : { text:'var(--text3)', bg:'var(--bg3)', border:'var(--border)' };
              return (
                <div key={i} style={{
                  display:'flex',justifyContent:'space-between',alignItems:'center',
                  padding:'10px 14px',borderRadius:10,
                  background:'var(--bg3)',border:'1px solid var(--border)',
                  transition:'all 0.2s',cursor:'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(244,63,94,0.3)'; e.currentTarget.style.transform='translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateX(0)'; }}
                >
                  <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{s.skill}</span>
                  <span style={{fontSize:10,fontWeight:800,padding:'3px 8px',borderRadius:6,textTransform:'uppercase',letterSpacing:'0.06em',color:impColor.text,background:impColor.bg,border:`1px solid ${impColor.border}`}}>
                    {s.importance}
                  </span>
                </div>
              );
            }) : <p style={{fontSize:13,color:'var(--text3)',fontStyle:'italic'}}>No missing skills! Great fit. 🎉</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGap;

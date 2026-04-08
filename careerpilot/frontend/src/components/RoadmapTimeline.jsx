import React, { useState } from 'react';

const RoadmapTimeline = ({ roadmap = [] }) => {
  const [expanded, setExpanded] = useState(null);

  if (!roadmap || roadmap.length === 0) return null;

  const handlePrint = () => window.print();

  const handleCopy = () => {
    const text = roadmap.map(w =>
      `WEEK ${w.week}: ${w.title}\n${(w.tasks || []).map(t => `  • ${t}`).join('\n')}\nOutcome: ${w.outcome || ''}\nResource: ${w.resource?.name || ''} — ${w.resource?.url || ''}`
    ).join('\n\n');
    navigator.clipboard.writeText(text).then(() => alert('Roadmap copied to clipboard!'));
  };

  return (
    <div style={{maxWidth:900,margin:'0 auto'}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:48}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 18px',borderRadius:999,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',marginBottom:16}}>
          <span style={{fontSize:14}}>🗺️</span>
          <span style={{fontSize:12,fontWeight:800,color:'#6366f1',letterSpacing:'0.1em',textTransform:'uppercase'}}>Personalized Roadmap</span>
        </div>
        <h2 style={{fontSize:36,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em',marginBottom:12}}>Your Upskilling Master Plan</h2>
        <p style={{color:'var(--text2)',fontSize:16,maxWidth:520,margin:'0 auto',lineHeight:1.6}}>
          A week-by-week guide crafted specifically to bridge your skill gaps and land your target role.
        </p>
        {/* Action Buttons */}
        <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:24,flexWrap:'wrap'}} className="no-print">
          <button onClick={handlePrint} style={{
            display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',
            background:'var(--bg2)',border:'1.5px solid var(--border)',borderRadius:12,
            fontSize:13,fontWeight:700,color:'var(--text)',cursor:'pointer',transition:'all 0.2s',
          }}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#6366f1'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
          >
            <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Download PDF
          </button>
          <button onClick={handleCopy} style={{
            display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',
            background:'var(--bg2)',border:'1.5px solid var(--border)',borderRadius:12,
            fontSize:13,fontWeight:700,color:'var(--text)',cursor:'pointer',transition:'all 0.2s',
          }}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#6366f1'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
          >
            <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            Copy Roadmap
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div style={{position:'relative'}}>
        {/* Vertical line */}
        <div style={{
          position:'absolute',left:28,top:0,bottom:0,width:2,
          background:'linear-gradient(to bottom, #6366f1, #8b5cf6, #a855f7)',
          borderRadius:999,opacity:0.3,
        }}/>

        <div style={{display:'flex',flexDirection:'column',gap:28}}>
          {roadmap.map((card, i) => {
            const isOpen = expanded === i;
            const colors = ['#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e','#f59e0b','#10b981','#06b6d4'];
            const color = colors[i % colors.length];

            return (
              <div
                key={i}
                className="animate-fade-in-up"
                style={{display:'flex',gap:20,animationDelay:`${i * 0.08}s`,opacity:0}}
              >
                {/* Timeline node */}
                <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',paddingTop:20}}>
                  <div style={{
                    width:56,height:56,borderRadius:'50%',flexShrink:0,
                    background:`linear-gradient(135deg,${color}22,${color}44)`,
                    border:`2px solid ${color}55`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontWeight:900,fontSize:14,color:color,
                    boxShadow:`0 0 0 4px ${color}15`,
                    position:'relative',zIndex:1,
                  }}>
                    W{card.week || i+1}
                  </div>
                </div>

                {/* Card */}
                <div
                  className="card"
                  style={{flex:1,cursor:'pointer',transition:'all 0.3s ease',overflow:'hidden'}}
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <div style={{padding:'20px 24px'}}>
                    {/* Card header */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                      <div style={{flex:1}}>
                        <span style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:color,marginBottom:6,display:'block'}}>
                          Week {card.week || i+1}
                        </span>
                        <h3 style={{fontSize:18,fontWeight:800,color:'var(--text)',letterSpacing:'-0.02em'}}>{card.title}</h3>
                      </div>
                      <div style={{
                        width:32,height:32,borderRadius:8,background:'var(--bg3)',border:'1px solid var(--border)',
                        display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.3s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',flexShrink:0,
                      }}>
                        <svg style={{width:16,height:16,color:'var(--text3)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </div>

                    {/* Outcome always visible */}
                    {card.outcome && (
                      <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'rgba(16,185,129,0.06)',borderRadius:8,border:'1px solid rgba(16,185,129,0.15)'}}>
                        <span style={{fontSize:14}}>🎯</span>
                        <span style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>{card.outcome}</span>
                      </div>
                    )}
                  </div>

                  {/* Expandable body */}
                  {isOpen && (
                    <div className="animate-fade-in" style={{padding:'0 24px 24px',borderTop:'1px solid var(--border)',marginTop:0}}>
                      {card.tasks && card.tasks.length > 0 && (
                        <div style={{marginTop:20}}>
                          <p style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text3)',marginBottom:12}}>Daily Tasks</p>
                          <ul style={{display:'flex',flexDirection:'column',gap:10}}>
                            {card.tasks.map((task, ti) => (
                              <li key={ti} style={{display:'flex',alignItems:'flex-start',gap:10}}>
                                <span style={{width:22,height:22,borderRadius:6,background:`${color}15`,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                                  <svg style={{width:12,height:12,color}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                                </span>
                                <span style={{fontSize:14,color:'var(--text2)',lineHeight:1.5}}>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {card.resource && (
                        <a
                          href={card.resource.url || '#'}
                          target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            marginTop:20,display:'inline-flex',alignItems:'center',gap:8,
                            padding:'9px 16px',borderRadius:10,
                            background:'var(--indigo-light)',border:'1px solid rgba(99,102,241,0.2)',
                            color:'#6366f1',fontSize:13,fontWeight:700,textDecoration:'none',
                            transition:'all 0.2s',
                          }}
                        >
                          <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          {card.resource.name || 'View Resource'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;

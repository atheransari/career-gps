import React, { useState } from 'react';

const ResumeComparison = ({ originalText, rewrittenText }) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState('split'); // 'split' | 'original' | 'rewritten'

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const wordCount = (text) => text ? text.trim().split(/\s+/).length : 0;
  const origWords = wordCount(originalText);
  const rewriteWords = wordCount(rewrittenText);
  const delta = rewriteWords - origWords;

  return (
    <div className="card" style={{overflow:'hidden'}}>
      {/* Header */}
      <div style={{
        padding:'18px 24px',borderBottom:'1px solid var(--border)',
        display:'flex',flexWrap:'wrap',gap:12,alignItems:'center',justifyContent:'space-between',
      }}>
        <div>
          <h2 style={{fontSize:18,fontWeight:900,color:'var(--text)',letterSpacing:'-0.02em'}}>Resume Diff Viewer</h2>
          <p style={{fontSize:13,color:'var(--text2)',marginTop:2}}>AI improvements side-by-side</p>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          {/* Stats */}
          <div style={{display:'flex',gap:8,marginRight:8}}>
            <span style={{fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:8,background:'rgba(244,63,94,0.08)',color:'#f43f5e',border:'1px solid rgba(244,63,94,0.15)'}}>
              Before: {origWords} words
            </span>
            <span style={{fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:8,background:'rgba(16,185,129,0.08)',color:'#10b981',border:'1px solid rgba(16,185,129,0.15)'}}>
              After: {rewriteWords} words {delta > 0 ? `(+${delta})` : `(${delta})`}
            </span>
          </div>

          {/* View toggle */}
          <div style={{display:'flex',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10,padding:3,gap:2}}>
            {[['split','⇔ Split'],['original','◁ Original'],['rewritten','▷ Rewritten']].map(([v, label]) => (
              <button key={v} onClick={() => setActiveView(v)} style={{
                padding:'5px 12px',borderRadius:7,fontSize:11,fontWeight:700,cursor:'pointer',border:'none',
                background: activeView === v ? 'var(--bg2)' : 'transparent',
                color: activeView === v ? 'var(--text)' : 'var(--text3)',
                boxShadow: activeView === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition:'all 0.2s',
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Copy button */}
          <button onClick={handleCopy} style={{
            display:'flex',alignItems:'center',gap:6,padding:'7px 14px',
            background: copied ? 'rgba(16,185,129,0.1)' : 'var(--indigo-light)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}`,
            borderRadius:9,fontSize:12,fontWeight:700,cursor:'pointer',
            color: copied ? '#10b981' : '#6366f1',transition:'all 0.2s',
          }}>
            {copied ? (
              <><svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg> Copied!</>
            ) : (
              <><svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copy Rewritten</>
            )}
          </button>
        </div>
      </div>

      {/* Panels */}
      <div style={{
        display:'grid',
        gridTemplateColumns: activeView === 'split' ? '1fr 1fr' : '1fr',
        gap:0,
      }}>
        {/* Original panel */}
        {(activeView === 'split' || activeView === 'original') && (
          <div style={{borderRight: activeView === 'split' ? '1px solid var(--border)' : 'none'}}>
            <div style={{
              padding:'10px 20px',background:'rgba(244,63,94,0.05)',
              borderBottom:'1px solid rgba(244,63,94,0.1)',
              display:'flex',alignItems:'center',gap:8,
            }}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#f43f5e'}}/>
              <span style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:'#f43f5e'}}>Original</span>
            </div>
            <div style={{height:420,overflowY:'auto',padding:'20px',background:'var(--bg3)'}}>
              <pre style={{fontFamily:'inherit',fontSize:13,color:'var(--text2)',whiteSpace:'pre-wrap',lineHeight:1.7,margin:0}}>
                {originalText || 'No original text.'}
              </pre>
            </div>
          </div>
        )}

        {/* Rewritten panel */}
        {(activeView === 'split' || activeView === 'rewritten') && (
          <div>
            <div style={{
              padding:'10px 20px',background:'rgba(16,185,129,0.05)',
              borderBottom:'1px solid rgba(16,185,129,0.1)',
              display:'flex',alignItems:'center',gap:8,
            }}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#10b981'}}/>
              <span style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:'#10b981'}}>AI Improved ✨</span>
            </div>
            <div style={{height:420,overflowY:'auto',padding:'20px',background:'var(--bg2)'}}>
              <pre style={{fontFamily:'inherit',fontSize:13,color:'var(--text)',whiteSpace:'pre-wrap',lineHeight:1.7,margin:0}}>
                {rewrittenText || 'No rewritten text.'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeComparison;

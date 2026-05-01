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
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #1F2937',
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between',
        background: '#0D1424',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: 18, height: 18, color: '#818CF8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em' }}>Resume Diff Viewer</h2>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>AI improvements side-by-side</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, marginRight: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              Before: {origWords} words
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
              After: {rewriteWords} words {delta > 0 ? `(+${delta})` : `(${delta})`}
            </span>
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', background: '#0D1424', border: '1px solid #1F2937', borderRadius: 10, padding: 3, gap: 2 }}>
            {[['split', '⇔ Split'], ['original', '◁ Original'], ['rewritten', '▷ Rewritten']].map(([v, label]) => (
              <button key={v} onClick={() => setActiveView(v)} style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: activeView === v ? '#1F2937' : 'transparent',
                color: activeView === v ? '#F1F5F9' : '#64748B',
                boxShadow: activeView === v ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Copy button */}
          <button onClick={handleCopy} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}`,
            borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            color: copied ? '#10B981' : '#818CF8', transition: 'all 0.2s',
          }}>
            {copied ? (
              <><svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg> Copied!</>
            ) : (
              <><svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copy Updated</>
            )}
          </button>
        </div>
      </div>

      {/* Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: activeView === 'split' ? '1fr 1fr' : '1fr',
        gap: 0,
      }}>
        {/* Original panel */}
        {(activeView === 'split' || activeView === 'original') && (
          <div style={{ borderRight: activeView === 'split' ? '1px solid #1F2937' : 'none' }}>
            <div style={{
              padding: '10px 20px', background: 'rgba(239,68,68,0.05)',
              borderBottom: '1px solid rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px #EF4444' }} />
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EF4444' }}>Original</span>
            </div>
            <div style={{ height: 460, overflowY: 'auto', padding: '24px', background: '#0D1424' }}>
              <pre style={{ fontFamily: '"Fira Code", monospace', fontSize: 12, color: '#64748B', whiteSpace: 'pre-wrap', lineHeight: 1.8, margin: 0 }}>
                {originalText || 'No original text.'}
              </pre>
            </div>
          </div>
        )}

        {/* Rewritten panel */}
        {(activeView === 'split' || activeView === 'rewritten') && (
          <div>
            <div style={{
              padding: '10px 20px', background: 'rgba(16,185,129,0.05)',
              borderBottom: '1px solid rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10B981' }}>AI Improved ✨</span>
            </div>
            <div style={{ height: 460, overflowY: 'auto', padding: '24px', background: '#111827' }}>
              <pre style={{ fontFamily: '"Fira Code", monospace', fontSize: 12, color: '#D1D5DB', whiteSpace: 'pre-wrap', lineHeight: 1.8, margin: 0 }}>
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

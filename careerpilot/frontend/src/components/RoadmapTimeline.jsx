import React, { useState, useEffect } from 'react';

const RoadmapTimeline = ({ roadmap = [], initialCompletedTasks = [], onTasksChange }) => {
  const [checkedTasks, setCheckedTasks] = useState(new Set(initialCompletedTasks));

  // Sync state if initialCompletedTasks changes (e.g. on resume)
  useEffect(() => {
    setCheckedTasks(new Set(initialCompletedTasks));
  }, [initialCompletedTasks]);

  if (!roadmap || roadmap.length === 0) return null;

  const handlePrint = () => window.print();

  const handleCopy = () => {
    const text = roadmap.map(w =>
      `WEEK ${w.week}: ${w.title}\n${(w.tasks || []).map(t => `  • ${t}`).join('\n')}\nOutcome: ${w.outcome || ''}\nResource: ${w.resource?.name || ''} — ${w.resource?.url || ''}`
    ).join('\n\n');
    navigator.clipboard.writeText(text).then(() => alert('Roadmap copied to clipboard!'));
  };

  const toggleTask = (taskId) => {
    const next = new Set(checkedTasks);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setCheckedTasks(next);
    
    if (onTasksChange) {
      onTasksChange(Array.from(next));
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="badge" style={{ marginBottom: 16 }}>
          🗺️ Personalized Roadmap
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.04em', marginBottom: 10 }}>
          Your Upskilling Master Plan
        </h2>
        <p style={{ color: '#64748B', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.65, fontWeight: 500 }}>
          A week-by-week guide crafted to bridge your skill gaps and land your target role.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }} className="no-print">
          <button onClick={handlePrint} className="btn-secondary" style={{ gap: 8, padding: '10px 20px', fontSize: 14 }}>
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2-2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Download PDF
          </button>
          <button onClick={handleCopy} className="btn-secondary" style={{ gap: 8, padding: '10px 20px', fontSize: 14 }}>
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            Copy Roadmap
          </button>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div style={{ position: 'relative', paddingLeft: 40 }}>
        {/* Glowing Indigo center-left vertical line */}
        <div style={{
          position: 'absolute', left: 56, top: 20, bottom: 20, width: 4,
          background: '#6366F1',
          boxShadow: '0 0 16px #6366F1',
          borderRadius: 999,
        }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {roadmap.map((card, i) => {
            const weekNum = card.week || i + 1;
            
            return (
              <div
                key={i}
                className="animate-slide-in-right"
                style={{
                  display: 'flex', gap: 32,
                  animationDelay: `${i * 0.15}s`, opacity: 0
                }}
              >
                {/* Node - glowing indigo circle */}
                <div style={{ flexShrink: 0, position: 'relative', zIndex: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#6366F1',
                    border: '4px solid #0A0F1E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 14, color: '#fff',
                    boxShadow: '0 0 20px rgba(99,102,241,0.8)',
                  }}>
                    {weekNum}
                  </div>
                </div>

                {/* Card */}
                <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ padding: '24px 28px', background: 'rgba(99,102,241,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#818CF8', marginBottom: 6, display: 'block' }}>
                          Week {weekNum} {card.outcome && `— ${card.outcome}`}
                        </span>
                        <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{card.title}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Tasks & Resources */}
                  <div style={{ padding: '24px 28px' }}>
                    {card.tasks && card.tasks.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {card.tasks.map((task, ti) => {
                            // Using task title + weekly title as identifier for persistence
                            const taskId = `${card.title}-${task}`;
                            const checked = checkedTasks.has(taskId);
                            return (
                              <li key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }} onClick={() => toggleTask(taskId)}>
                                <div style={{
                                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
                                  border: checked ? 'none' : '2px solid #4B5563',
                                  background: checked ? '#6366F1' : 'transparent',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.2s', boxShadow: checked ? '0 0 8px rgba(99,102,241,0.5)' : 'none'
                                }}>
                                  {checked && <svg style={{ width: 12, height: 12, color: '#fff' }} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                </div>
                                <span style={{ fontSize: 15, color: checked ? '#64748B' : '#D1D5DB', lineHeight: 1.5, fontWeight: 500, textDecoration: checked ? 'line-through' : 'none', transition: 'all 0.2s' }}>{task}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    
                    {card.resource && (
                      <a
                        href={card.resource.url || '#'} target="_blank" rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '10px 16px', borderRadius: 10,
                          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                          color: '#818CF8', fontSize: 13, fontWeight: 800, textDecoration: 'none',
                          boxShadow: '0 0 16px rgba(99,102,241,0.15)',
                          transition: 'all 0.3s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(99,102,241,0.15)'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                      >
                        <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        {card.resource.name || 'View Core Resource'}
                      </a>
                    )}
                  </div>
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

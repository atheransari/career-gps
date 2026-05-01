import React, { useState, useEffect } from 'react';

const ScoreBar = ({ label, score, delay }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  const getColor = (s) => {
    if (s >= 80) return '#10B981';
    if (s >= 60) return '#6366F1';
    if (s >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{score}%</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${width}%`, 
          background: getColor(score),
          borderRadius: 10,
          transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: `0 0 10px ${getColor(score)}44`
        }} />
      </div>
    </div>
  );
};

const InterviewResults = ({ results, transcript, metrics, onRetry, onNext }) => {
  const highlightTranscript = (text) => {
    const fillers = ['um', 'uh', 'like', 'basically', 'actually', 'sort of', 'you know'];
    let highlighted = text;
    fillers.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span style="color:#EF4444; font-weight:700; border-bottom: 2px solid rgba(239, 68, 68, 0.4)">${word}</span>`);
    });
    return highlighted;
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Interview Performance</h2>
        <p style={{ color: '#94A3B8', fontSize: 16 }}>Detailed AI analysis of your response</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'start' }}>
        {/* Left: Scores & Metrics */}
        <div>
          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <ScoreBar label="Technical Accuracy" score={results.technical_accuracy} delay={100} />
            <ScoreBar label="Communication Clarity" score={results.communication_clarity} delay={200} />
            <ScoreBar label="Answer Structure" score={results.answer_structure} delay={300} />
            <ScoreBar label="Confidence Score" score={results.confidence_score} delay={400} />
            <ScoreBar label="Overall Performance" score={results.overall_score} delay={500} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Duration</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{metrics.duration}s</div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Pauses</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>{metrics.pauses}</div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>WPM</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981' }}>{metrics.wpm}</div>
            </div>
          </div>
          
          <div className="card" style={{ padding: 24, marginTop: 16, borderLeft: '4px solid #6366F1' }}>
             <p style={{ color: '#D1D5DB', fontSize: 14, fontStyle: 'italic' }}>"{results.duration_feedback}"</p>
          </div>
        </div>

        {/* Right: Insights & Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24, borderTop: '4px solid #10B981' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#10B981', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>✓</span> What Went Well
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.what_went_well?.map((item, i) => (
                <li key={i} style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 1.5 }}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ padding: 24, borderTop: '4px solid #EF4444' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>⚠</span> Improve This
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.improve_this?.map((item, i) => (
                <li key={i} style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 1.5 }}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ padding: 24, background: 'rgba(99,102,241,0.05)', borderStyle: 'dashed', borderColor: 'rgba(99,102,241,0.3)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#818CF8', textTransform: 'uppercase', marginBottom: 16 }}>Perfect Answer Outline</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.ideal_answer_outline?.map((item, i) => (
                <li key={i} style={{ color: '#94A3B8', fontSize: 13, display: 'flex', gap: 10 }}>
                  <span style={{ color: '#6366F1', fontWeight: 900 }}>{i+1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Transcript with highlighting */}
      <div className="card" style={{ marginTop: 40, padding: 32 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 20 }}>Full Transcript Analysis</h3>
        <p 
          style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: 16 }}
          dangerouslySetInnerHTML={{ __html: highlightTranscript(transcript) }} 
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48 }}>
        <button onClick={onRetry} className="btn-secondary" style={{ padding: '14px 32px' }}>Try Same Question</button>
        <button onClick={onNext} className="btn-primary" style={{ padding: '14px 32px' }}>Next Question →</button>
      </div>
    </div>
  );
};

export default InterviewResults;

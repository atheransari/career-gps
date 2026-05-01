import React, { useState } from 'react';

const PERSONAS = [
  {
    name: 'Software Engineer', icon: '💻', color: '#6366F1',
    resume: `ALEX CHEN...` // Shortened for brevity
  },
  {
    name: 'Data Scientist', icon: '📊', color: '#10B981',
    resume: `PRIYA SHARMA...`
  },
  {
    name: 'Product Manager', icon: '🚀', color: '#F59E0B',
    resume: `JAMES RIVERA...`
  }
];

const ResumeUpload = ({ onUpload, onDemoSelect }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (f) => {
    if (!f) return;
    const ok = f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.docx');
    if (ok) { setFile(f); setError(''); }
    else { setFile(null); setError('Please upload a PDF or DOCX file.'); }
  };

  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div className="badge" style={{ marginBottom: 16 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Step 1 of 6
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: '#F1F5F9', marginBottom: 10 }}>
          Upload Your Resume
        </h2>
        <p style={{ color: '#4B5563', fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>
          Drop your PDF below and let AI do the heavy lifting
        </p>
      </div>

      {/* Drop Zone Box Wrapper for rotating dashed border and grid */}
      <div 
        className={`rotating-border-box grid-pattern card`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById('resume-file-input').click()}
        style={{
          boxShadow: isDragging ? '0 0 24px rgba(99,102,241,0.2)' : 'var(--card-shadow)',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
      >
        <section 
          style={{
            padding: '52px 32px', textAlign: 'center',
            background: isDragging ? 'rgba(99,102,241,0.08)' : 'transparent',
            height: '100%', width: '100%', borderRadius: 14,
            transition: 'background 0.3s ease'
          }}
        >
          <input id="resume-file-input" type="file" accept=".pdf,.docx" onChange={(e) => validateAndSetFile(e.target.files[0])} style={{ display: 'none' }} />

          {file ? (
            <div className="animate-scale-in">
              <div style={{
                width: 60, height: 60, borderRadius: 14,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 15px rgba(16,185,129,0.2)'
              }}>
                <svg style={{ width: 28, height: 28, color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p style={{ fontWeight: 800, fontSize: 16, color: '#10B981', marginBottom: 4 }}>{file.name}</p>
              <p style={{ color: '#4B5563', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
            </div>
          ) : (
            <>
              <div style={{
                width: 60, height: 60, borderRadius: 14,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: isDragging ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
                transition: 'box-shadow 0.3s ease'
              }}>
                <svg style={{ width: 26, height: 26, color: '#6366F1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#F1F5F9', marginBottom: 6 }}>Drop your resume here</p>
              <p style={{ color: '#4B5563', fontSize: 14, marginBottom: 4 }}>
                or <span style={{ color: '#6366F1', fontWeight: 700 }}>click to browse</span>
              </p>
              <p style={{ color: '#374151', fontSize: 12, fontWeight: 600 }}>PDF or DOCX · Max 10MB</p>
            </>
          )}
        </section>
      </div>

      {error && (
        <div style={{
          marginTop: 12, padding: '10px 16px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, color: '#EF4444', fontSize: 13, fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {file && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => { if (file) onUpload(file); }}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15 }}
          >
            <svg style={{ width: 18, height: 18, marginRight: 10 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Analyse Resume with AI
          </button>
          <div style={{ marginTop: 8, fontSize: 11, color: '#4B5563', fontWeight: 600 }}>
            ⚡ Powered by Gemini AI
          </div>
        </div>
      )}

      {/* Demo Personas */}
      <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #1F2937', textAlign: 'center' }}>
        <p className="section-label" style={{ marginBottom: 16 }}>⚡ Hackathon Demo — Try a Persona</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {PERSONAS.map(persona => (
            <button
              key={persona.name}
              onClick={() => onDemoSelect(persona)}
              style={{
                padding: '16px 12px', borderRadius: 14, cursor: 'pointer',
                background: '#111827', border: '1px solid #1F2937',
                transition: 'all 0.25s ease', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = persona.color;
                e.currentTarget.style.background = `${persona.color}0D`;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 0 20px ${persona.color}1A`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1F2937';
                e.currentTarget.style.background = '#111827';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 26 }}>{persona.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>{persona.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;

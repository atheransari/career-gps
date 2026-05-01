import React from 'react';

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    color: '#6366F1',
    title: 'AI ATS Scoring',
    desc: 'Get a real ATS score with keyword, formatting & action verb breakdown — exactly as recruiters see it.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    color: '#10B981',
    title: 'AI Resume Rewrite',
    desc: 'Gemini AI rewrites your resume with stronger verbs, quantified achievements & ATS-safe formatting.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    ),
    color: '#F59E0B',
    title: 'Live Job Matching',
    desc: 'We scan 10,000+ real-time job listings and rank them by how well your resume matches.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    ),
    color: '#A78BFA',
    title: 'Skill Gap Analysis',
    desc: 'See exactly which skills you have, need to develop, or are missing for your target role.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
    ),
    color: '#34D399',
    title: 'Roadmap Generator',
    desc: 'Get a downloadable week-by-week upskilling plan with curated free learning resources.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
    color: '#F472B6',
    title: 'Interview Coach',
    desc: 'AI generates the exact interview questions you\'ll face, with STAR-method answer guides.',
  },
];

const HeroPage = ({ onStart, hasSavedSession, onContinueSession }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#F1F5F9', fontFamily: 'Inter, sans-serif' }}>

      {/* Ambient background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', animation: 'float 12s ease-in-out infinite' }} />
      </div>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid #1F2937',
        background: 'rgba(10,15,30,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366F1,#4F46E5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 16,
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}>C</div>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.04em', color: '#F1F5F9' }}>
              Career<span style={{ color: '#6366F1' }}>Pilot</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', letterSpacing: '0.06em' }}>LIVE</span>
            </div>
            <button onClick={onStart} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '100px 28px 80px', textAlign: 'center' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 999,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          marginBottom: 32,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#6366F1' }}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#818CF8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Powered by Gemini AI + Live Job Data
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(38px,6vw,76px)',
          fontWeight: 900,
          color: '#F1F5F9',
          letterSpacing: '-0.05em',
          lineHeight: 1.02,
          marginBottom: 24,
          maxWidth: 820,
          margin: '0 auto 24px',
        }}>
          Your AI Career
          <br />
          <span style={{ background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 40%, #A78BFA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Co-Pilot.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px,2vw,19px)',
          color: '#64748B',
          maxWidth: 520,
          margin: '0 auto 44px',
          lineHeight: 1.7,
          fontWeight: 500,
        }}>
          Upload your resume. Get an ATS score, live job matches, skill gap analysis, personalized roadmap, and interview prep — all in one seamless flow.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onStart} className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
            Analyze My Resume
            <svg style={{ width: 16, height: 16, marginLeft: 10 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
          {hasSavedSession && (
            <button onClick={onContinueSession} className="btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }}>
              ↩ Continue Session
            </button>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginTop: 72, flexWrap: 'wrap' }}>
          {[
            ['6', 'AI-Powered Steps'],
            ['10K+', 'Live Jobs Scanned'],
            ['Free', 'Forever'],
          ].map(([val, label], i) => (
            <div key={label} style={{
              padding: '0 40px',
              borderRight: i < 2 ? '1px solid #1F2937' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#F1F5F9', lineHeight: 1, letterSpacing: '-0.04em' }}>{val}</div>
              <div style={{ fontSize: 12, color: '#4B5563', fontWeight: 600, marginTop: 6, letterSpacing: '0.04em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div className="glow-line" />
      </div>

      {/* FEATURES GRID */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.04em', marginBottom: 12 }}>
            Everything to land your next role
          </h2>
          <p style={{ fontSize: 16, color: '#4B5563', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
            A full career acceleration pipeline in one seamless experience.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: '24px', cursor: 'default', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${f.color}15`,
                border: `1px solid ${f.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 8, letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, fontWeight: 500 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div style={{ borderTop: '1px solid #1F2937' }}>
        <div style={{ textAlign: 'center', padding: '72px 28px', maxWidth: 1180, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.04em', marginBottom: 12 }}>
            Ready to supercharge your job search?
          </h2>
          <p style={{ color: '#4B5563', fontSize: 15, marginBottom: 32, fontWeight: 500 }}>Takes 30 seconds to start. No signup required.</p>
          <button onClick={onStart} className="btn-primary" style={{ fontSize: 15, padding: '14px 40px' }}>
            Get Started Free →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
};

export default HeroPage;

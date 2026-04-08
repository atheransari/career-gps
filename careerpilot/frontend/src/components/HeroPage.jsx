import React from 'react';

const FEATURES = [
  { icon: '🤖', title: 'AI ATS Scoring', desc: 'Get a real ATS score just like recruiters see — with keyword, formatting & action verb breakdown.' },
  { icon: '✍️', title: 'AI Resume Rewrite', desc: 'Gemini AI rewrites your resume with stronger verbs, quantified achievements & ATS-safe formatting.' },
  { icon: '🌐', title: 'Live Job Matching', desc: 'We scan 10,000+ real-time job listings and rank them by how well your resume matches.' },
  { icon: '📊', title: 'Skill Gap Analysis', desc: 'See exactly which skills you have, need to develop, or are missing for your target role.' },
  { icon: '🗺️', title: 'Roadmap Generator', desc: 'Get a downloadable week-by-week upskilling plan with curated free learning resources.' },
  { icon: '🎤', title: 'Interview Coach', desc: 'AI generates the exact interview questions you\'ll face, with STAR-method answer guides.' },
];

const HeroPage = ({ darkMode, onToggleDark, onStart, hasSavedSession, onContinueSession }) => {

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:'Inter, sans-serif'}}>
      {/* Nav */}
      <nav style={{
        position:'sticky',top:0,zIndex:50,
        borderBottom:'1px solid var(--border)',
        background:'var(--bg2)',
        backdropFilter:'blur(12px)',
      }}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{
              width:38,height:38,borderRadius:12,
              background:'linear-gradient(135deg,#6366f1,#4f46e5)',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'#fff',fontWeight:900,fontSize:18,
              boxShadow:'0 4px 14px rgba(99,102,241,0.4)',
            }}>C</div>
            <span style={{fontSize:20,fontWeight:900,letterSpacing:'-0.03em'}}>
              Career<span style={{color:'#6366f1'}}>Pilot</span>
            </span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={onToggleDark} style={{
              width:40,height:40,borderRadius:10,border:'1.5px solid var(--border)',
              background:'var(--bg3)',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',
            }}>
              {darkMode
                ? <svg style={{width:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
                : <svg style={{width:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              }
            </button>
            <button onClick={onStart} className="btn-primary" style={{padding:'10px 22px',fontSize:14}}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        background:`linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%)`,
        backgroundSize:'200% 200%',
        animation:'gradient-shift 8s ease infinite',
        padding:'100px 32px',
        textAlign:'center',
        position:'relative',
        overflow:'hidden',
      }}>
        {/* Floating blobs */}
        <div style={{position:'absolute',top:-80,left:-80,width:320,height:320,borderRadius:'50%',background:'rgba(255,255,255,0.06)',animation:'float 6s ease-in-out infinite'}}/>
        <div style={{position:'absolute',bottom:-60,right:-60,width:260,height:260,borderRadius:'50%',background:'rgba(255,255,255,0.04)',animation:'float 8s ease-in-out infinite reverse'}}/>

        {/* Badge */}
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 20px',borderRadius:999,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',marginBottom:28,backdropFilter:'blur(8px)'}}>
          <span style={{fontSize:14}}>⚡</span>
          <span style={{fontSize:12,fontWeight:800,color:'#fff',letterSpacing:'0.1em',textTransform:'uppercase'}}>Powered by Gemini AI + Live Jobs</span>
        </div>

        <h1 style={{
          fontSize:'clamp(36px,6vw,72px)',
          fontWeight:900,
          color:'#fff',
          letterSpacing:'-0.04em',
          lineHeight:1.05,
          marginBottom:24,
          maxWidth:800,
          margin:'0 auto 24px',
        }}>
          Your AI Career Co-Pilot.<br/>From Resume to Dream Job in 5 Minutes.
        </h1>

        <p style={{
          fontSize:'clamp(16px,2vw,20px)',
          color:'rgba(255,255,255,0.85)',
          maxWidth:580,
          margin:'0 auto 40px',
          lineHeight:1.7,
          fontWeight:500,
        }}>
          Upload your resume. Get an ATS score, live job matches, skill gap analysis, a personalized roadmap, and interview prep — all in one flow.
        </p>

        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={onStart} style={{
            padding:'16px 36px',
            background:'#fff',color:'#4f46e5',
            border:'none',borderRadius:14,
            fontWeight:900,fontSize:17,cursor:'pointer',
            boxShadow:'0 12px 40px rgba(0,0,0,0.2)',
            transition:'all 0.25s ease',letterSpacing:'-0.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 20px 50px rgba(0,0,0,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.2)'; }}
          >
            Analyze My Resume →
          </button>
          {hasSavedSession && (
            <button onClick={onContinueSession} style={{
              padding:'16px 32px',
              background:'rgba(255,255,255,0.15)',color:'#fff',
              border:'1.5px solid rgba(255,255,255,0.3)',borderRadius:14,
              fontWeight:800,fontSize:16,cursor:'pointer',
              backdropFilter:'blur(8px)',transition:'all 0.25s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
            >
              ↩ Continue Where I Left Off
            </button>
          )}
        </div>

        {/* Stats row */}
        <div style={{display:'flex',justifyContent:'center',gap:40,marginTop:60,flexWrap:'wrap'}}>
          {[['6', 'AI-Powered Steps'], ['Live', 'Job Data'], ['Free', 'Forever']].map(([val, label]) => (
            <div key={label} style={{textAlign:'center'}}>
              <div style={{fontSize:32,fontWeight:900,color:'#fff',lineHeight:1}}>{val}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',fontWeight:600,marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'80px 32px'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <h2 style={{fontSize:36,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em',marginBottom:12}}>Everything you need to land the job</h2>
          <p style={{fontSize:17,color:'var(--text2)',maxWidth:480,margin:'0 auto',lineHeight:1.7}}>
            A full career acceleration pipeline in one seamless experience.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px, 1fr))',gap:20}}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{padding:'28px 24px',transition:'all 0.3s'}}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}
            >
              <span style={{fontSize:36,display:'block',marginBottom:16}}>{f.icon}</span>
              <h3 style={{fontSize:17,fontWeight:800,color:'var(--text)',marginBottom:8,letterSpacing:'-0.01em'}}>{f.title}</h3>
              <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.65}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{textAlign:'center',padding:'60px 32px 80px',borderTop:'1px solid var(--border)'}}>
        <h2 style={{fontSize:32,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em',marginBottom:12}}>Ready to supercharge your job search?</h2>
        <p style={{color:'var(--text2)',fontSize:16,marginBottom:32}}>Takes 30 seconds to start. No signup required.</p>
        <button onClick={onStart} className="btn-primary" style={{fontSize:17,padding:'18px 48px'}}>
          Get Started Free →
        </button>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
};

export default HeroPage;

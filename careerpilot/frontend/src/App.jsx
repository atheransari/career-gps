import React, { useState, useEffect } from 'react';
import { api } from './api';
import './index.css';

import ResumeUpload from './components/ResumeUpload';
import ATSScore from './components/ATSScore';
import ResumeComparison from './components/ResumeComparison';
import JobListings from './components/JobListings';
import SkillGap from './components/SkillGap';
import RoadmapTimeline from './components/RoadmapTimeline';
import InterviewCoach from './components/InterviewCoach';
import HeroPage from './components/HeroPage';

const STEP_LABELS = ['Upload', 'ATS Score', 'Job Match', 'Skill Gap', 'Roadmap', 'Interview Prep'];

const LOADING_TIPS = [
  "Analyzing resume structure with AI...",
  "Scanning 10,000+ live job postings...",
  "Building your personalized career roadmap...",
  "Comparing skills against market demand...",
  "Connecting to Gemini AI Engine...",
];

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('careerpilot-dark') === 'true';
  });
  const [showHero, setShowHero] = useState(() => {
    // Show hero on every fresh tab/reload, hide only if user clicked Get Started this session
    return !sessionStorage.getItem('careerpilot-started');
  });
  const [step, setStep] = useState(1);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // App States — persisted in localStorage
  const [resumeText, setResumeText] = useState(() => localStorage.getItem('cp-resumeText') || '');
  const [rewrittenText, setRewrittenText] = useState('');
  const [atsScores, setAtsScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp-atsScores') || 'null'); } catch { return null; }
  });
  const [prevAtsScores, setPrevAtsScores] = useState(null);
  const [jobs, setJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp-jobs') || '[]'); } catch { return []; }
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [skillGap, setSkillGap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp-skillGap') || 'null'); } catch { return null; }
  });
  const [roadmap, setRoadmap] = useState([]);
  const [interviewQuestions, setInterviewQuestions] = useState([]);

  // Detect session recovery
  const hasSavedSession = !!(resumeText && atsScores);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('careerpilot-dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (resumeText) localStorage.setItem('cp-resumeText', resumeText);
    if (atsScores) localStorage.setItem('cp-atsScores', JSON.stringify(atsScores));
    if (jobs.length) localStorage.setItem('cp-jobs', JSON.stringify(jobs));
    if (skillGap) localStorage.setItem('cp-skillGap', JSON.stringify(skillGap));
  }, [resumeText, atsScores, jobs, skillGap]);

  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const showError = (msg) => {
    setErrorMsg(msg);
    setLoadingMsg('');
    setTimeout(() => setErrorMsg(''), 7000);
  };

  const clearSession = () => {
    ['cp-resumeText','cp-atsScores','cp-jobs','cp-skillGap','careerpilot-session'].forEach(k => localStorage.removeItem(k));
    setResumeText(''); setAtsScores(null); setJobs([]); setSkillGap(null); setRoadmap([]); setInterviewQuestions([]);
    setSelectedJob(null); setPrevAtsScores(null); setStep(1);
  };

  const handleStartApp = () => {
    sessionStorage.setItem('careerpilot-started', '1');
    setShowHero(false);
  };

  const handleContinueSession = () => {
    sessionStorage.setItem('careerpilot-started', '1');
    setShowHero(false);
    if (skillGap) setStep(4);
    else if (jobs.length) setStep(3);
    else if (atsScores) setStep(2);
  };

  const handleUploadResume = async (file) => {
    setLoadingMsg("Parsing document...");
    try {
      const data = await api.parseResume(file);
      setResumeText(data.text);
      setLoadingMsg("Calculating ATS Score via AI...");
      const scoreData = await api.getAtsScore(data.text);
      setAtsScores(scoreData);
      setLoadingMsg('');
      setStep(2);
    } catch (e) { showError(e.message); }
  };

  const handleDemoSelect = async (persona) => {
    setLoadingMsg(`Loading ${persona.name} demo...`);
    try {
      setResumeText(persona.resume);
      const scoreData = await api.getAtsScore(persona.resume);
      setAtsScores(scoreData);
      setLoadingMsg('');
      setStep(2);
    } catch(e) { showError(e.message); }
  };

  const handleRewrite = async () => {
    setLoadingMsg("AI is optimizing your resume...");
    try {
      const data = await api.rewriteResume(resumeText);
      setRewrittenText(data.rewritten);
      setLoadingMsg("Re-scoring updated resume...");
      setPrevAtsScores(atsScores);
      const newScore = await api.getAtsScore(data.rewritten);
      setAtsScores(newScore);
      setResumeText(data.rewritten);
      setLoadingMsg('');
    } catch(e) { showError(e.message); }
  };

  const handleTransitionToJobs = async () => {
    setLoadingMsg("Identifying your most suitable job titles...");
    try {
      const titleData = await api.extractJobTitles(resumeText);
      const topTitle = titleData.job_titles?.[0] || 'Software Engineer';
      setLoadingMsg(`Scouting live listings for: ${topTitle}...`);
      const jobsData = await api.fetchJobs(topTitle);
      setJobs(jobsData.jobs || []);
      setLoadingMsg('');
      setStep(3);
    } catch(e) { showError(e.message); }
  };

  const handleJobSelectTransition = async (job) => {
    setSelectedJob(job);
    setLoadingMsg(`Analyzing skill gaps for ${job.title}...`);
    try {
      const gapData = await api.analyzeSkillGap(resumeText, job.job_description);
      setSkillGap(gapData);
      setLoadingMsg('');
      setStep(4);
    } catch(e) { showError(e.message); }
  };

  const handleGenerateRoadmap = async () => {
    if (!skillGap?.missing_skills?.length) {
      showError("No critical skills are missing to build a roadmap!");
      return;
    }
    setLoadingMsg("Building your personalized upskilling master plan...");
    try {
      const missingSkillNames = skillGap.missing_skills.map(s => s.skill);
      const roadmapData = await api.generateRoadmap(missingSkillNames, selectedJob?.title || 'Software Engineer');
      setRoadmap(roadmapData.roadmap || []);
      setLoadingMsg('');
      setStep(5);
    } catch(e) { showError(e.message); }
  };

  const handleGenerateInterview = async () => {
    setLoadingMsg("Generating personalized interview questions...");
    try {
      const data = await api.getInterviewPrep(resumeText, selectedJob?.job_description || '', selectedJob?.title || '');
      setInterviewQuestions(data.questions || []);
      setLoadingMsg('');
      setStep(6);
    } catch(e) { showError(e.message); }
  };

  // Show Hero Landing Page
  if (showHero) {
    return (
      <HeroPage
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onStart={handleStartApp}
        hasSavedSession={hasSavedSession}
        onContinueSession={handleContinueSession}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '6rem' }}>

      {/* Error Toast */}
      {errorMsg && (
        <div className="animate-slide-up" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          display: 'flex', alignItems: 'center',
          background: '#f43f5e', color: '#fff',
          padding: '14px 20px', borderRadius: 16,
          boxShadow: '0 10px 40px -10px rgba(244,63,94,0.6)',
          maxWidth: 380, border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <svg style={{width:22,height:22,marginRight:12,flexShrink:0}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span style={{fontWeight:700,fontSize:14,lineHeight:1.4}}>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{marginLeft:16,background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.8)',padding:4}}>
            <svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',display:'flex',justifyContent:'space-between',alignItems:'center',height:64}}>
          <button onClick={() => setShowHero(true)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
            <div style={{
              width:36,height:36,borderRadius:10,
              background:'linear-gradient(135deg,#6366f1,#4f46e5)',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'#fff',fontWeight:900,fontSize:17,
              boxShadow:'0 4px 12px rgba(99,102,241,0.35)',
            }}>C</div>
            <span style={{fontSize:18,fontWeight:900,letterSpacing:'-0.03em',color:'var(--text)'}}>
              Career<span style={{color:'#6366f1'}}>Pilot</span>
            </span>
          </button>

          <div style={{display:'flex',alignItems:'center',gap:16}}>
            {/* Step Indicator */}
            <span style={{
              background:'var(--indigo-light)',color:'#6366f1',
              padding:'5px 14px',borderRadius:999,
              fontSize:12,fontWeight:800,letterSpacing:'0.06em',textTransform:'uppercase',
              border:'1px solid rgba(99,102,241,0.2)',
            }}>Step {step} of {STEP_LABELS.length}</span>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              style={{
                width:40,height:40,borderRadius:12,border:'1.5px solid var(--border)',
                background:'var(--bg3)',cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'var(--text2)',transition:'all 0.2s',
              }}
              title="Toggle dark mode"
            >
              {darkMode
                ? <svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
                : <svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              }
            </button>

            {/* Clear session */}
            {step > 1 && (
              <button onClick={clearSession} style={{
                fontSize:12,fontWeight:700,color:'var(--text3)',
                background:'none',border:'none',cursor:'pointer',padding:'6px 10px',
                borderRadius:8, transition:'color 0.2s',
              }}>↺ Start over</button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{height:3,background:'var(--bg3)'}}>
          <div style={{
            height:'100%',
            width:`${(step / STEP_LABELS.length) * 100}%`,
            background:'linear-gradient(90deg, #6366f1, #8b5cf6)',
            transition:'width 0.7s cubic-bezier(0.16,1,0.3,1)',
            boxShadow:'0 0 12px rgba(99,102,241,0.4)',
          }}/>
        </div>

        {/* Step Pills */}
        <div style={{display:'flex',justifyContent:'center',gap:6,padding:'10px 0',overflowX:'auto',maxWidth:1200,margin:'0 auto',paddingLeft:24,paddingRight:24}}>
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div key={label} style={{
                display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:999,
                background: active ? 'rgba(99,102,241,0.12)' : done ? 'rgba(16,185,129,0.08)' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.3)' : done ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                transition:'all 0.3s',flexShrink:0,
              }}>
                <div style={{
                  width:20,height:20,borderRadius:'50%',flexShrink:0,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:10,fontWeight:800,
                  background: done ? '#10b981' : active ? '#6366f1' : 'var(--border)',
                  color: done || active ? '#fff' : 'var(--text3)',
                  transition:'all 0.3s',
                }}>
                  {done ? '✓' : num}
                </div>
                <span style={{
                  fontSize:11,fontWeight:700,
                  color: active ? '#6366f1' : done ? '#10b981' : 'var(--text3)',
                  whiteSpace:'nowrap',
                }}>{label}</span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px',minHeight:'60vh'}}>
        {loadingMsg ? (
          <div className="animate-fade-in" style={{
            position:'absolute',inset:0,zIndex:20,
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            background: darkMode ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.85)',
            backdropFilter:'blur(8px)', minHeight:'60vh',
          }}>
            <div style={{textAlign:'center',maxWidth:480,padding:'0 24px'}}>
              <div style={{
                width:72,height:72,borderRadius:'50%',margin:'0 auto 24px',
                background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display:'flex',alignItems:'center',justifyContent:'center',
                boxShadow:'0 0 0 0 rgba(99,102,241,0.4)',
                animation:'pulse-ring 2s infinite',
              }}>
                <svg style={{width:32,height:32,color:'#fff',animation:'spin 1s linear infinite'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" opacity="0.2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{fontSize:22,fontWeight:900,color:'var(--text)',marginBottom:8,letterSpacing:'-0.02em'}}>{loadingMsg}</h3>
              <p style={{color:'var(--text2)',fontSize:14,fontWeight:500,lineHeight:1.6}}>
                {LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]}
              </p>
              <div style={{marginTop:32,display:'flex',flexDirection:'column',gap:10}}>
                {[100,80,60].map((w,i) => (
                  <div key={i} className="skeleton" style={{height:14,width:`${w}%`,margin:'0 auto'}}/>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {step > 1 && (
              <button onClick={prevStep} className="btn-secondary no-print" style={{marginBottom:28,padding:'9px 18px',fontSize:13}}>
                <svg style={{width:16,height:16,marginRight:8}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Previous Step
              </button>
            )}

            {step === 1 && <ResumeUpload onUpload={handleUploadResume} onDemoSelect={handleDemoSelect} darkMode={darkMode} />}

            {step === 2 && (
              <div>
                <ATSScore scores={atsScores} prevScores={prevAtsScores} />
                <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',marginTop:32,paddingTop:28,borderTop:'1px solid var(--border)'}}>
                  <button onClick={handleRewrite} className="btn-secondary">
                    <svg style={{width:18,height:18,marginRight:8,color:'#10b981'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Optimize Resume via AI
                  </button>
                  <button onClick={handleTransitionToJobs} className="btn-primary">
                    Find Matching Jobs
                    <svg style={{width:16,height:16,marginLeft:8}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
                {rewrittenText && (
                  <div className="animate-fade-in-up" style={{marginTop:40}}>
                    <div style={{textAlign:'center',marginBottom:20}}>
                      <span style={{fontSize:11,fontWeight:800,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--text3)'}}>— Resume Diff Viewer —</span>
                    </div>
                    <ResumeComparison originalText={resumeText} rewrittenText={rewrittenText} />
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <JobListings jobs={jobs} atsScores={atsScores} onJobSelect={setSelectedJob} />
                {selectedJob && (
                  <div className="animate-slide-up no-print" style={{
                    position:'fixed',bottom:0,left:0,width:'100%',
                    background:'var(--bg2)',borderTop:'1px solid var(--border)',
                    boxShadow:'0 -20px 40px -20px rgba(0,0,0,0.15)',
                    padding:'16px 24px',zIndex:40,
                    display:'flex',justifyContent:'center',
                  }}>
                    <button onClick={() => handleJobSelectTransition(selectedJob)} className="btn-primary" style={{maxWidth:500,width:'100%',fontSize:16,padding:'16px 32px'}}>
                      Analyze Skill Gap for "{selectedJob.title}"
                      <svg style={{width:20,height:20,marginLeft:10}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <SkillGap skillGapData={skillGap} />
                <div style={{textAlign:'center',marginTop:48,paddingTop:32,borderTop:'1px solid var(--border)'}}>
                  <h3 style={{fontSize:22,fontWeight:900,color:'var(--text)',marginBottom:8}}>Ready to close the gap?</h3>
                  <p style={{color:'var(--text2)',fontSize:15,marginBottom:28}}>Choose your next step below</p>
                  <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={handleGenerateRoadmap} className="btn-primary" style={{fontSize:16,padding:'16px 32px'}}>
                      <svg style={{width:20,height:20,marginRight:10}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                      </svg>
                      Generate Free Master Roadmap
                    </button>
                    <button onClick={handleGenerateInterview} className="btn-secondary" style={{fontSize:15,padding:'15px 28px'}}>
                      <svg style={{width:18,height:18,marginRight:8}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                      Prep for Interview
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <RoadmapTimeline roadmap={roadmap} />
                <div style={{textAlign:'center',marginTop:40,paddingTop:28,borderTop:'1px solid var(--border)'}}>
                  <button onClick={handleGenerateInterview} className="btn-secondary" style={{fontSize:15,padding:'14px 28px'}}>
                    <svg style={{width:18,height:18,marginRight:8}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    Also Prep for Interview →
                  </button>
                </div>
              </div>
            )}

            {step === 6 && <InterviewCoach questions={interviewQuestions} jobTitle={selectedJob?.title || ''} />}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;

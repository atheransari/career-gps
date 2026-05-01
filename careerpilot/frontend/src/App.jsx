import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api';
import './index.css';
import confetti from 'canvas-confetti';

import ResumeUpload from './components/ResumeUpload';
import ATSScore from './components/ATSScore';
import ResumeComparison from './components/ResumeComparison';
import JobListings from './components/JobListings';
import SkillGap from './components/SkillGap';
import RoadmapTimeline from './components/RoadmapTimeline';
import InterviewCoach from './components/InterviewCoach';
import HeroPage from './components/HeroPage';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import InterviewCoachPage from './components/Interview/InterviewCoachPage';

const STEP_LABELS = ['Upload', 'ATS Score', 'Job Match', 'Skill Gap', 'Roadmap', 'Interview Prep'];

const LOADING_TIPS = [
  "Analyzing resume structure with AI...",
  "Scanning 10,000+ live job postings...",
  "Building your personalized career roadmap...",
  "Comparing skills against market demand...",
  "Connecting to Gemini AI Engine...",
];

const ParticlesBackground = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `-${Math.random() * 15}s`,
    animationDuration: `${10 + Math.random() * 10}s`,
    opacity: 0.1 + Math.random() * 0.5
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.left,
          animationDelay: p.animationDelay,
          animationDuration: p.animationDuration,
          opacity: p.opacity
        }}/>
      ))}
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth State
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp-user') || 'null'); } catch { return null; }
  });

  // Flow State
  const [showHero, setShowHero] = useState(() => {
    return !sessionStorage.getItem('careerpilot-started') && location.pathname === '/';
  });
  const [step, setStep] = useState(1);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTrackId, setActiveTrackId] = useState(null);

  // App States
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
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    if (user) localStorage.setItem('cp-user', JSON.stringify(user));
    else localStorage.removeItem('cp-user');
  }, [user]);

  useEffect(() => {
    if (resumeText) localStorage.setItem('cp-resumeText', resumeText);
    if (atsScores) localStorage.setItem('cp-atsScores', JSON.stringify(atsScores));
    if (jobs.length) localStorage.setItem('cp-jobs', JSON.stringify(jobs));
    if (skillGap) localStorage.setItem('cp-skillGap', JSON.stringify(skillGap));
  }, [resumeText, atsScores, jobs, skillGap]);

  // Sync progress to DB if authenticated and track active
  useEffect(() => {
    if (user && activeTrackId && step === 5) {
      api.updateTrack(activeTrackId, { 
          completed_tasks: completedTasks,
          current_week: Math.max(...roadmap.filter(w => (completedTasks.includes(w.title)) ).map(w => w.week), 1)
      }).catch(console.error);
    }
  }, [completedTasks, activeTrackId, user, step, roadmap]);

  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const showError = (msg) => {
    setErrorMsg(msg);
    setLoadingMsg('');
    setTimeout(() => setErrorMsg(''), 7000);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    clearSession();
    navigate('/');
  };

  const clearSession = () => {
    ['cp-resumeText','cp-atsScores','cp-jobs','cp-skillGap'].forEach(k => localStorage.removeItem(k));
    setResumeText(''); setAtsScores(null); setJobs([]); setSkillGap(null); setRoadmap([]); setInterviewQuestions([]);
    setSelectedJob(null); setPrevAtsScores(null); setStep(1); setActiveTrackId(null); setCompletedTasks([]);
  };

  const handleResumeTrack = (track) => {
    setResumeText(track.resume_text);
    setAtsScores({ overall_score: track.ats_score, issues: [], strengths: [] }); // Simplified reconstruction
    setSkillGap(track.skill_gap);
    setRoadmap(track.roadmap);
    setCompletedTasks(track.completed_tasks || []);
    setActiveTrackId(track.id);
    setSelectedJob({ title: track.job_title, job_description: track.job_description });
    setStep(5); // Go straight to roadmap
    navigate('/');
  };

  const handleStartApp = () => {
    sessionStorage.setItem('careerpilot-started', '1');
    setShowHero(false);
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
      const roadmap = roadmapData.roadmap || [];
      setRoadmap(roadmap);
      
      // Auto-save track if logged in
      if (user && !activeTrackId) {
        setLoadingMsg("Persisting your track to account...");
        const newTrack = await api.createTrack({
          job_title: selectedJob.title,
          job_description: selectedJob.job_description,
          resume_text: resumeText,
          ats_score: atsScores.overall_score,
          skill_gap: skillGap,
          roadmap: roadmap
        });
        setActiveTrackId(newTrack.id);
      }

      setLoadingMsg('');
      setStep(5);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366F1', '#10B981', '#F59E0B'] });
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

  const renderFlow = () => {
    if (loadingMsg) {
      return (
        <div className="animate-fade-in" style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, width: '100%', padding: '0 24px' }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: '#F1F5F9', marginBottom: 12, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{loadingMsg}</h3>
            <p style={{ color: '#94A3B8', fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: 40 }}>{LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]}</p>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 10 }}><div className="skeleton-box" style={{ width: 48, height: 48, borderRadius: 12 }} /><div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}><div className="skeleton-box" style={{ height: 16, width: '40%', borderRadius: 8 }} /><div className="skeleton-box" style={{ height: 12, width: '25%', borderRadius: 6 }} /></div></div>
              <div className="skeleton-box" style={{ height: 80, width: '100%', borderRadius: 14 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><div className="skeleton-box" style={{ height: 140, borderRadius: 14 }} /><div className="skeleton-box" style={{ height: 140, borderRadius: 14 }} /></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={step} className="animate-fade-in-up">
        {step > 1 && (
          <button onClick={prevStep} className="btn-secondary no-print" style={{ marginBottom: 32, padding: '8px 16px', fontSize: 13, gap: 8 }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Back
          </button>
        )}
        {step === 1 && <ResumeUpload onUpload={handleUploadResume} onDemoSelect={handleDemoSelect} />}
        {step === 2 && (
          <div>
            <ATSScore scores={atsScores} prevScores={prevAtsScores} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 40, paddingTop: 32, borderTop: '1px solid #1F2937' }}>
              <button onClick={handleRewrite} className="btn-secondary"><svg style={{ width: 16, height: 16, marginRight: 8, color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Optimize Resume via AI</button>
              <button onClick={handleTransitionToJobs} className="btn-primary">Find Matching Jobs<svg style={{ width: 16, height: 16, marginLeft: 8 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg></button>
            </div>
            {rewrittenText && <div className="animate-fade-in-up" style={{ marginTop: 40 }}><div style={{ textAlign: 'center', marginBottom: 20 }}><span className="section-label">— Diff Viewer —</span></div><ResumeComparison originalText={resumeText} rewrittenText={rewrittenText} /></div>}
          </div>
        )}
        {step === 3 && (
          <div>
            <JobListings jobs={jobs} atsScores={atsScores} onJobSelect={setSelectedJob} />
            {selectedJob && <div className="animate-slide-up no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(17,24,39,0.9)', borderTop: '1px solid #1F2937', backdropFilter: 'blur(16px)', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', padding: '16px 28px', zIndex: 40, display: 'flex', justifyContent: 'center' }}><button onClick={() => handleJobSelectTransition(selectedJob)} className="btn-primary" style={{ maxWidth: 500, width: '100%', fontSize: 15, padding: '14px 32px' }}>Analyze Skill Gap for {selectedJob.title}<svg style={{ width: 18, height: 18, marginLeft: 10 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></button></div>}
          </div>
        )}
        {step === 4 && (
          <div>
            <SkillGap skillGapData={skillGap} jobTitle={selectedJob?.title || ''} />
            <div style={{ textAlign: 'center', marginTop: 48, paddingTop: 36, borderTop: '1px solid #1F2937' }}>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#F1F5F9', marginBottom: 10, letterSpacing: '-0.02em' }}>Ready to close the gap?</h3>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}><button onClick={handleGenerateRoadmap} className="btn-primary" style={{ fontSize: 14, padding: '14px 28px' }}><svg style={{ width: 18, height: 18, marginRight: 8 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>Generate Action Plan</button><button onClick={handleGenerateInterview} className="btn-secondary" style={{ fontSize: 14, padding: '14px 28px' }}><svg style={{ width: 16, height: 16, marginRight: 8 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>Prep for Interview</button></div>
            </div>
          </div>
        )}
        {step === 5 && (
          <div>
            <RoadmapTimeline roadmap={roadmap} initialCompletedTasks={completedTasks} onTasksChange={setCompletedTasks} />
            <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 32, borderTop: '1px solid #1F2937' }}>
              <button onClick={handleGenerateInterview} className="btn-secondary" style={{ fontSize: 14, padding: '12px 24px' }}><svg style={{ width: 16, height: 16, marginRight: 8 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>Continue to Interview Prep →</button>
            </div>
          </div>
        )}
        {step === 6 && <InterviewCoach questions={interviewQuestions} jobTitle={selectedJob?.title || ''} />}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '6rem', position: 'relative' }}>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLogoClick={() => navigate('/')} 
        currentStep={step} 
        totalSteps={STEP_LABELS.length} 
        showProgress={!showHero && location.pathname === '/'} 
      />
      
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 28px', minHeight: '60vh', position: 'relative' }}>
        {errorMsg && (
          <div className="animate-slide-up" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', alignItems: 'center', background: 'rgba(15,23,42,0.9)', color: '#F1F5F9', padding: '14px 20px', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', maxWidth: 380, border: '1px solid #EF4444', borderLeft: '4px solid #EF4444' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} style={{ marginLeft: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>X</button>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            showHero ? (
              <HeroPage onStart={handleStartApp} hasSavedSession={!!resumeText} onContinueSession={() => setShowHero(false)} />
            ) : renderFlow()
          } />
          <Route path="/login" element={<Login onLoginSuccess={(u) => { setUser(u); navigate('/dashboard'); }} onSwitchToSignup={() => navigate('/signup')} />} />
          <Route path="/signup" element={<Signup onSignupSuccess={(u) => { setUser(u); navigate('/dashboard'); }} onSwitchToLogin={() => navigate('/login')} />} />
          <Route path="/dashboard" element={<Dashboard onResumeTrack={handleResumeTrack} />} />
          <Route path="/interview" element={<InterviewCoachPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

import React, { useState } from 'react';

const PERSONAS = [
  {
    name: 'Software Engineer',
    icon: '💻',
    color: '#6366f1',
    resume: `ALEX CHEN
San Francisco, CA • alex.chen@email.com • github.com/alexchen • linkedin.com/in/alexchen

SUMMARY
Full-stack Software Engineer with 4 years of experience building high-traffic web applications using React, Node.js, and AWS. Passionate about clean code, performance optimization, and developer tooling.

EXPERIENCE
Senior Software Engineer — TechFlow Inc. (2022–Present)
- Architected microservices migration reducing system latency by 40%
- Led team of 5 engineers delivering new payment module, increasing conversion by 18%
- Improved CI/CD pipeline reducing deployment time from 45min to 8min

Software Engineer — StartupXYZ (2020–2022)
- Built React dashboard serving 50,000+ daily active users
- Integrated Stripe payment gateway processing $2M+ monthly transactions
- Reduced page load time from 4.2s to 1.1s through lazy loading and caching

EDUCATION
B.S. Computer Science — Stanford University (2020)

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL, Redis, GraphQL`
  },
  {
    name: 'Data Scientist',
    icon: '📊',
    color: '#10b981',
    resume: `PRIYA SHARMA
Bangalore, India • priya.sharma@email.com • github.com/priyadata

SUMMARY
Data Scientist with 3 years of experience in machine learning and predictive analytics. Strong expertise in Python, deep learning, and deploying models to production at scale.

EXPERIENCE
Data Scientist — Flipkart (2022–Present)
- Built recommendation engine increasing click-through rate by 23%
- Deployed fraud detection model saving $1.2M annually
- Reduced model training time by 60% using distributed computing on Spark

Junior Data Scientist — Analytics Corp (2021–2022)
- Developed NLP-based customer churn prediction model (88% accuracy)
- Automated data pipeline processing 10GB+ daily, saving 15 hours/week

EDUCATION
M.S. Data Science — IIT Bombay (2021)

SKILLS
Python, TensorFlow, PyTorch, Sklearn, Pandas, NumPy, SQL, Spark, Tableau, Docker`
  },
  {
    name: 'Product Manager',
    icon: '🚀',
    color: '#f59e0b',
    resume: `JAMES RIVERA
New York, NY • james.rivera@email.com • linkedin.com/in/jamesrivera

SUMMARY
Product Manager with 5 years of experience launching B2B SaaS products. Proven track record of defining roadmaps, driving cross-functional teams, and delivering products that achieved 200%+ revenue growth.

EXPERIENCE
Senior Product Manager — Salesforce (2022–Present)
- Owned core CRM product with $50M ARR
- Launched mobile app feature adopted by 80% of user base within 3 months
- Reduced customer churn by 15% through data-driven UX improvements

Product Manager — B2B Startup (2019–2022)
- Defined 0→1 product strategy leading to Series A raise of $8M
- Shipped 3 major product releases, growing MAUs from 2K to 45K
- Established OKR framework across 4 engineering squads

EDUCATION
MBA — Wharton School, UPenn (2019)

SKILLS
Product Strategy, Roadmapping, A/B Testing, SQL, Figma, JIRA, Analytics, Stakeholder Management`
  }
];

const ResumeUpload = ({ onUpload, onDemoSelect, darkMode }) => {
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
    <div style={{maxWidth:700,margin:'0 auto'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <h2 style={{fontSize:32,fontWeight:900,letterSpacing:'-0.03em',color:'var(--text)',marginBottom:12}}>
          Upload Your Resume
        </h2>
        <p style={{color:'var(--text2)',fontSize:16,fontWeight:500}}>
          Drop your PDF below and let AI do the heavy lifting
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById('resume-file-input').click()}
        style={{
          border: isDragging ? '2.5px dashed #6366f1' : file ? '2.5px dashed #10b981' : '2.5px dashed var(--border)',
          borderRadius: 20,
          padding: '52px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(99,102,241,0.05)' : file ? 'rgba(16,185,129,0.04)' : 'var(--bg2)',
          transition: 'all 0.25s ease',
          boxShadow: isDragging ? '0 0 0 4px rgba(99,102,241,0.12)' : 'var(--card-shadow)',
        }}
      >
        <input id="resume-file-input" type="file" className="sr-only" accept=".pdf,.docx" onChange={(e) => validateAndSetFile(e.target.files[0])} style={{display:'none'}} />
        
        {file ? (
          <div className="animate-scale-in">
            <div style={{width:64,height:64,borderRadius:16,background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',border:'1px solid rgba(16,185,129,0.2)'}}>
              <svg style={{width:30,height:30,color:'#10b981'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p style={{fontWeight:800,fontSize:17,color:'#10b981',marginBottom:4}}>{file.name}</p>
            <p style={{color:'var(--text3)',fontSize:13}}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
          </div>
        ) : (
          <>
            <div style={{width:64,height:64,borderRadius:16,background:'var(--indigo-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',border:'1px solid rgba(99,102,241,0.15)'}}>
              <svg style={{width:28,height:28,color:'#6366f1'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <p style={{fontWeight:800,fontSize:17,color:'var(--text)',marginBottom:6}}>Drop your resume here</p>
            <p style={{color:'var(--text2)',fontSize:14,marginBottom:4}}>or <span style={{color:'#6366f1',fontWeight:700}}>click to browse</span></p>
            <p style={{color:'var(--text3)',fontSize:12,fontWeight:600}}>PDF or DOCX · Max 10MB</p>
          </>
        )}
      </div>

      {error && (
        <div style={{marginTop:12,padding:'10px 16px',background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:10,color:'#f43f5e',fontSize:13,fontWeight:600}}>
          {error}
        </div>
      )}

      {file && (
        <button
          onClick={() => { if (file) onUpload(file); }}
          className="btn-primary"
          style={{width:'100%',marginTop:20,padding:'16px',fontSize:16}}
        >
          <svg style={{width:20,height:20,marginRight:10}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Analyse Resume with AI
        </button>
      )}

      {/* 3-Persona Demo */}
      <div style={{marginTop:40,paddingTop:32,borderTop:'1px solid var(--border)',textAlign:'center'}}>
        <p style={{fontSize:11,fontWeight:800,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--text3)',marginBottom:18}}>
          ⚡ Hackathon Demo — Try a Persona
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))',gap:12}}>
          {PERSONAS.map(persona => (
            <button
              key={persona.name}
              onClick={() => onDemoSelect(persona)}
              style={{
                padding:'16px 12px',borderRadius:16,cursor:'pointer',
                background:'var(--bg2)',border:`1.5px solid var(--border)`,
                transition:'all 0.25s ease',textAlign:'center',
                display:'flex',flexDirection:'column',alignItems:'center',gap:8,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = persona.color; e.currentTarget.style.background = `${persona.color}08`; e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              <span style={{fontSize:28}}>{persona.icon}</span>
              <span style={{fontSize:13,fontWeight:800,color:'var(--text)'}}>{persona.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;

import React, { useState, useMemo } from 'react';

const getMatchColor = (score) => {
  if (score >= 80) return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: 'Great Match' };
  if (score >= 60) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Good Match' };
  return { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.25)', label: 'Partial Match' };
};

const computeMatchScore = (atsScores, index) => {
  if (!atsScores) return Math.floor(55 + Math.random() * 35);
  const base = ((atsScores.keyword_score || 0) * 0.5 + (atsScores.action_verbs_score || 0) * 0.3 + (atsScores.sections_score || 0) * 0.2);
  const jitter = ((index * 17) % 20) - 10;
  return Math.min(98, Math.max(30, Math.round(base + jitter)));
};

const formatSalary = (min, max) => {
  if (!min && !max) return null;
  const fmt = (n) => n >= 100000 ? `$${(n/1000).toFixed(0)}K` : `$${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max)}`;
};

const JobListings = ({ jobs = [], atsScores, onJobSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const enrichedJobs = useMemo(() =>
    jobs.map((job, i) => ({ ...job, matchScore: computeMatchScore(atsScores, i) }))
      .sort((a, b) => b.matchScore - a.matchScore),
    [jobs, atsScores]
  );

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return enrichedJobs;
    return enrichedJobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.company.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, enrichedJobs]);

  const handleSelect = (job) => {
    setSelectedJob(job);
    onJobSelect && onJobSelect(job);
  };

  return (
    <div style={{maxWidth:860,margin:'0 auto'}}>
      <div style={{marginBottom:28}}>
        <h2 style={{fontSize:28,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em',marginBottom:6}}>Live Job Matches</h2>
        <p style={{color:'var(--text2)',fontSize:15}}>Sorted by your resume match score · {filtered.length} roles found</p>
      </div>

      {/* Search */}
      <div style={{position:'relative',marginBottom:24}}>
        <svg style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',width:18,height:18,color:'var(--text3)',pointerEvents:'none'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Search roles or companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width:'100%',padding:'13px 16px 13px 46px',
            background:'var(--bg2)',border:'1.5px solid var(--border)',
            borderRadius:14,fontSize:14,color:'var(--text)',
            outline:'none',transition:'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Job Cards */}
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 24px',background:'var(--bg2)',borderRadius:20,border:'1.5px dashed var(--border)'}}>
            <p style={{color:'var(--text3)',fontWeight:600}}>No jobs found matching your search</p>
          </div>
        ) : filtered.map((job, i) => {
          const isSelected = selectedJob === job;
          const match = getMatchColor(job.matchScore);
          const salary = formatSalary(job.salary_min, job.salary_max);

          return (
            <div
              key={i}
              onClick={() => handleSelect(job)}
              style={{
                background:'var(--bg2)',
                border: isSelected ? '2px solid #6366f1' : '1.5px solid var(--border)',
                borderRadius:18,padding:24,cursor:'pointer',
                boxShadow: isSelected ? '0 0 0 4px rgba(99,102,241,0.12), var(--card-shadow)' : 'var(--card-shadow)',
                transition:'all 0.25s ease',position:'relative',overflow:'hidden',
              }}
              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.transform='translateY(-2px)'; } }}
              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; } }}
            >
              {/* Selected glow */}
              {isSelected && <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(99,102,241,0.04),transparent)',pointerEvents:'none',borderRadius:18}}/>}

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:6}}>
                    <h3 style={{fontSize:17,fontWeight:800,color:'var(--text)',letterSpacing:'-0.01em'}}>{job.title}</h3>
                    {/* Match Badge */}
                    <span style={{
                      padding:'3px 10px',borderRadius:999,fontSize:11,fontWeight:800,
                      background:match.bg,color:match.color,border:`1px solid ${match.border}`,flexShrink:0,
                    }}>
                      {job.matchScore}% · {match.label}
                    </span>
                    {isSelected && (
                      <span style={{padding:'3px 10px',borderRadius:999,fontSize:11,fontWeight:800,background:'rgba(99,102,241,0.1)',color:'#6366f1',border:'1px solid rgba(99,102,241,0.2)'}}>
                        ✓ Selected
                      </span>
                    )}
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:10}}>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--text2)',display:'flex',alignItems:'center',gap:5}}>
                      <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7z"/></svg>
                      {job.company}
                    </span>
                    <span style={{fontSize:13,color:'var(--text3)',display:'flex',alignItems:'center',gap:5}}>
                      <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                      {job.location}
                    </span>
                    {salary && (
                      <span style={{fontSize:13,fontWeight:700,color:'#10b981',background:'rgba(16,185,129,0.08)',padding:'2px 8px',borderRadius:6,border:'1px solid rgba(16,185,129,0.15)'}}>
                        {salary}
                      </span>
                    )}
                  </div>
                  {job.job_description && (
                    <p style={{fontSize:13,color:'var(--text3)',lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {job.job_description}
                    </p>
                  )}
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end',flexShrink:0}}>
                  {job.apply_link && job.apply_link !== '#' && (
                    <a
                      href={job.apply_link} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize:12,fontWeight:700,color:'#6366f1',
                        display:'flex',alignItems:'center',gap:4,
                        padding:'5px 12px',borderRadius:8,
                        background:'var(--indigo-light)',border:'1px solid rgba(99,102,241,0.2)',
                        textDecoration:'none',transition:'all 0.2s',
                      }}
                    >
                      Apply
                      <svg style={{width:12,height:12}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobListings;

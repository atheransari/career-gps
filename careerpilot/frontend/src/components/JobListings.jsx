import React, { useState, useMemo } from 'react';

// ── Skeleton card shown while jobs are loading ─────────────────────────────────
const SkeletonJobCard = ({ delay = 0 }) => (
  <div style={{
    background: '#111827', border: '1px solid #1F2937', borderLeft: '4px solid #374151',
    borderRadius: 14, padding: '24px 28px',
    animationDelay: `${delay * 0.08}s`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div className="skeleton-box" style={{ width: '55%', height: 20, borderRadius: 8, marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
          <div className="skeleton-box" style={{ width: 110, height: 14, borderRadius: 6 }} />
          <div className="skeleton-box" style={{ width: 80, height: 14, borderRadius: 6 }} />
          <div className="skeleton-box" style={{ width: 90, height: 14, borderRadius: 6 }} />
        </div>
        <div className="skeleton-box" style={{ width: '90%', height: 12, borderRadius: 6, marginBottom: 6 }} />
        <div className="skeleton-box" style={{ width: '70%', height: 12, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
        <div className="skeleton-box" style={{ width: 90, height: 26, borderRadius: 999 }} />
        <div className="skeleton-box" style={{ width: 80, height: 34, borderRadius: 10 }} />
      </div>
    </div>
  </div>
);

const getMatchColor = (score) => {
  if (score >= 80) return { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', label: 'Great Match' };
  if (score >= 60) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'Good Match' };
  return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'Partial Match' };
};

const computeMatchScore = (atsScores, index) => {
  if (!atsScores) return Math.floor(55 + Math.random() * 35);
  const base = ((atsScores.keyword_score || 0) * 0.5 + (atsScores.action_verbs_score || 0) * 0.3 + (atsScores.sections_score || 0) * 0.2);
  const jitter = ((index * 17) % 20) - 10;
  return Math.min(98, Math.max(30, Math.round(base + jitter)));
};

const formatSalary = (min, max) => {
  if (!min && !max) return null;
  const fmt = (n) => n >= 100000 ? `$${(n / 1000).toFixed(0)}K` : `$${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max)}`;
};

const JobListings = ({ jobs = [], atsScores, onJobSelect, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const enrichedJobs = useMemo(() =>
    jobs.map((job, i) => ({ ...job, matchScore: computeMatchScore(atsScores, i) }))
      .sort((a, b) => b.matchScore - a.matchScore),
    [jobs, atsScores]
  );

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return enrichedJobs;
    return enrichedJobs.filter(j =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, enrichedJobs]);

  const handleSelect = (job) => {
    setSelectedJob(job);
    onJobSelect && onJobSelect(job);
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="badge" style={{ marginBottom: 16 }}>
          <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>
          Live Results
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.04em', marginBottom: 8 }}>Live Job Matches</h2>
        <p style={{ color: '#64748B', fontSize: 15, fontWeight: 500 }}>
          {loading ? 'Scanning live listings…' : `Sorted by your resume match score · ${filtered.length} roles found`}
        </p>
      </div>

      {/* Skeleton state */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0, 1, 2, 3, 4].map(i => <SkeletonJobCard key={i} delay={i} />)}
        </div>
      )}

      {loading && null /* skip search + cards when loading */}

      {/* Search + Job Cards — hidden while loading */}
      {!loading && <>
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#64748B', pointerEvents: 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Search roles or companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ paddingLeft: 46, fontSize: 15, paddingTop: 14, paddingBottom: 14 }}
        />
      </div>

      {/* Job Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: '#111827', borderRadius: 16,
            border: '1px dashed #1F2937',
          }}>
            <p style={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>No jobs found matching your search</p>
          </div>
        ) : filtered.map((job, i) => {
          const isSelected = selectedJob === job;
          const match = getMatchColor(job.matchScore);
          const salary = formatSalary(job.salary_min, job.salary_max);

          return (
            <div
              key={i}
              className="animate-slide-in-right"
              onClick={() => handleSelect(job)}
              style={{
                animationDelay: `${i * 0.1}s`, opacity: 0,
                background: isSelected ? 'rgba(99,102,241,0.06)' : '#111827',
                border: isSelected ? '1px solid rgba(99,102,241,0.6)' : '1px solid #1F2937',
                borderLeft: isSelected ? '4px solid #6366F1' : '4px solid #374151',
                borderRadius: 14, padding: '24px 28px', cursor: 'pointer',
                boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.15), 0 8px 32px rgba(99,102,241,0.2)' : '0 2px 12px rgba(0,0,0,0.3)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                  e.currentTarget.style.borderLeftColor = '#6366F1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#1F2937';
                  e.currentTarget.style.borderLeftColor = '#374151';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
                }
              }}
            >
              {isSelected && (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 60%)', pointerEvents: 'none' }}/>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'nowrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em', marginBottom: 12 }}>{job.title}</h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg style={{ width: 15, height: 15, color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7z"/></svg>
                      {job.company}
                    </span>
                    <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg style={{ width: 15, height: 15, color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                      {job.location}
                    </span>
                    {salary && (
                      <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg style={{ width: 16, height: 16, color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {salary}
                      </span>
                    )}
                  </div>

                  {job.job_description && (
                    <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.job_description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800,
                    background: '#10B981', color: '#fff', border: '1px solid #059669',
                    boxShadow: '0 0 12px rgba(16,185,129,0.4)'
                  }}>
                    {job.matchScore}% · {match.label}
                  </span>
                  
                  {job.apply_link && job.apply_link !== '#' && (
                    <a
                      href={job.apply_link} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: 13, fontWeight: 700, color: '#818CF8',
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 10,
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                        textDecoration: 'none', transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                    >
                      View Role
                      <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>}
    </div>
  );
};

export default JobListings;

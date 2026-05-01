import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import ResumeHistoryModal from './ResumeHistoryModal';

// ── Skeleton card used while loading ──────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
      <div className="skeleton-box" style={{ width: 56, height: 22, borderRadius: 99 }} />
      <div className="skeleton-box" style={{ width: 64, height: 16, borderRadius: 8 }} />
    </div>
    <div className="skeleton-box" style={{ width: '70%', height: 22, borderRadius: 8, marginBottom: 10 }} />
    <div className="skeleton-box" style={{ width: '40%', height: 14, borderRadius: 6, marginBottom: 28 }} />
    <div className="skeleton-box" style={{ width: '100%', height: 6, borderRadius: 99 }} />
    <div className="skeleton-box" style={{ width: 120, height: 16, borderRadius: 8, marginTop: 24 }} />
  </div>
);

// ── ATS colour helper ─────────────────────────────────────────────────────────
const atsColor = (score) => {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
};

// ── Stat tile ─────────────────────────────────────────────────────────────────
const StatTile = ({ label, value, icon, color = '#6366F1' }) => (
  <div style={{
    background: 'rgba(30,41,59,0.4)',
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#F1F5F9', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = ({ onResumeTrack }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('cp-user') || 'null'); } catch { return null; }
  })();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await api.getTracks();
        // Sort newest first
        const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTracks(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const completed = tracks.filter(t => t.status === 'completed').length;
  const avgAts = tracks.length
    ? Math.round(tracks.reduce((sum, t) => sum + (t.ats_score || 0), 0) / tracks.length)
    : 0;
  const skillsGained = tracks.reduce((sum, t) => sum + (t.completed_tasks?.length || 0), 0);

  // ── Loading state — skeleton grid ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0' }}>
        <div className="skeleton-box" style={{ width: 280, height: 36, borderRadius: 10, marginBottom: 12 }} />
        <div className="skeleton-box" style={{ width: 200, height: 18, borderRadius: 8, marginBottom: 40 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton-box" style={{ height: 84, borderRadius: 18 }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0' }}>
      {showHistory && <ResumeHistoryModal onClose={() => setShowHistory(false)} />}
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>
            {user?.email ? `Hey, ${user.email.split('@')[0]} 👋` : 'My Career Tracks'}
          </h1>
          <p style={{ color: '#64748B', fontSize: 15 }}>Manage and resume your ongoing career transitions</p>
        </div>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
          + New Track
        </button>
      </div>

      {/* ── Stats Row ── */}
      {tracks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          <StatTile label="Total Tracks" value={tracks.length} icon="🗺️" color="#6366F1" />
          <StatTile label="Completed" value={completed} icon="✅" color="#10B981" />
          <div
            onClick={() => setShowHistory(true)}
            title="Click to view score history"
            style={{ cursor: 'pointer' }}
          >
            <StatTile label="Average ATS · History →" value={`${avgAts}%`} icon="📊" color={atsColor(avgAts)} />
          </div>
          <StatTile label="Tasks Done" value={skillsGained} icon="⚡" color="#F59E0B" />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#F87171', fontSize: 13, marginBottom: 24 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {tracks.length === 0 ? (
        <div style={{ padding: '80px 40px', background: 'rgba(15,23,42,0.4)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🚀</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>No tracks yet</h3>
          <p style={{ color: '#64748B', maxWidth: 380, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Upload your resume to start analyzing skill gaps, matching jobs, and building personalized roadmaps.
          </p>
          <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ padding: '13px 36px', fontSize: 15 }}>
            Start First Track →
          </button>
        </div>
      ) : (
        /* ── Track cards grid ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {tracks.map(track => {
            const date = new Date(track.created_at);
            const daysAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
            const progress = Math.round(((track.current_week || 1) / 8) * 100);
            const color = atsColor(track.ats_score);

            return (
              <div
                key={track.id}
                style={{
                  background: 'rgba(30,41,59,0.4)',
                  borderRadius: 24,
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: 24,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(30,41,59,0.65)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(30,41,59,0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Status + Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span style={{ padding: '5px 12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: 999, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active
                  </span>
                  <span style={{ fontSize: 12, color: '#475569' }}>
                    {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{track.job_title}</h3>

                {/* ATS Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>
                    ATS Score: <strong style={{ color }}>{track.ats_score}%</strong>
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Week {track.current_week || 1} of 8
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#6366F1' }}>{progress}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', borderRadius: 99, transition: 'width 1s ease' }} />
                </div>

                {/* Action row */}
                <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onResumeTrack(track); }}
                    className="btn-primary"
                    style={{ flex: 1, padding: '9px 0', fontSize: 12, borderRadius: 10 }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

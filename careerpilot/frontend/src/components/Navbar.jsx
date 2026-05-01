import React, { useState, useEffect, useRef } from 'react';
import { checkHealth } from '../api';

const Navbar = ({ user, onLogout, onLogoClick, currentStep, totalSteps, showProgress }) => {
  const [online, setOnline] = useState(null); // null = unknown, true = up, false = down
  const [showColdStart, setShowColdStart] = useState(false);
  const coldStartTimer = useRef(null);
  const pingInterval = useRef(null);

  const doPing = async () => {
    const up = await checkHealth();
    setOnline(up);
    if (up) {
      setShowColdStart(false);
      if (coldStartTimer.current) {
        clearTimeout(coldStartTimer.current);
        coldStartTimer.current = null;
      }
    }
  };

  useEffect(() => {
    // First ping immediately
    doPing();

    // Show cold-start warning after 5s if still offline
    coldStartTimer.current = setTimeout(() => {
      setOnline(prev => {
        if (prev === false) setShowColdStart(true);
        return prev;
      });
    }, 5000);

    // Repeat ping every 30s
    pingInterval.current = setInterval(doPing, 30000);

    return () => {
      clearInterval(pingInterval.current);
      clearTimeout(coldStartTimer.current);
    };
  }, []);

  const dotColor = online === true ? '#10B981' : online === false ? '#EF4444' : '#F59E0B';
  const dotLabel = online === true ? 'Server online' : online === false ? 'Server offline' : 'Checking…';

  return (
    <>
      {/* ── Cold-start toast ── */}
      {showColdStart && (
        <div
          className="animate-slide-up"
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(245,158,11,0.4)',
            borderLeft: '4px solid #F59E0B',
            color: '#FCD34D',
            padding: '14px 20px',
            borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', gap: 12,
            maxWidth: 420, fontSize: 13, fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 18 }}>⏳</span>
          <span>Server is warming up — please wait about 30 seconds, then try again.</span>
          <button onClick={() => setShowColdStart(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 16 }}>✕</button>
        </div>
      )}

      <nav style={{
        background: 'rgba(10,15,30,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <button onClick={onLogoClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,#6366F1,#4F46E5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 15,
              boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
            }}>C</div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.04em', color: '#F1F5F9' }}>
              Career<span style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pilot</span>
            </span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Server health dot */}
            <div
              title={dotLabel}
              style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: dotColor,
                boxShadow: `0 0 6px ${dotColor}`,
                animation: online === null ? 'pulse 1.5s infinite' : online === false ? 'pulse 1s infinite' : 'none',
              }} />
              <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                {online === false ? 'Offline' : online === true ? 'Online' : '...'}
              </span>
            </div>

            <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.08)' }} />

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => window.location.href = '/interview'}
                  style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Voice Interview
                </button>
                <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Dashboard
                </button>
                <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 999, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#818CF8', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <button
                    onClick={onLogout}
                    style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => window.location.href = '/interview'}
                  style={{ fontSize: 13, fontWeight: 600, color: '#10B981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                  Voice Coach
                </button>
                <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <button onClick={() => window.location.href = '/login'} style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>Login</button>
                <button onClick={() => window.location.href = '/signup'} className="btn-primary" style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8 }}>Sign Up</button>
              </div>
            )}

            {showProgress && (
              <span style={{
                background: '#6366F1', color: '#fff',
                padding: '6px 14px', borderRadius: 999,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                boxShadow: '0 0 10px rgba(99,102,241,0.5)'
              }}>Step {currentStep} of {totalSteps}</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{
              height: '100%',
              width: `${(currentStep / totalSteps) * 100}%`,
              background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #6366F1)',
              backgroundSize: '200% 100%',
              animation: 'shimmer-slide 3s infinite linear',
              transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 0 16px rgba(99,102,241,0.8), 0 0 4px rgba(99,102,241,0.5)',
            }}/>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;

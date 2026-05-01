import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('cp-token');
    if (token) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.signup(email, password);
      if (data.email_confirmation_required) {
        setConfirmed(true); // show "check your email" state
      } else {
        onSignupSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    maxWidth: 420,
    margin: '80px auto',
    padding: '40px 36px',
    background: 'rgba(15,23,42,0.7)',
    borderRadius: 24,
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(30,41,59,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '13px 16px',
    borderRadius: 12,
    color: '#fff',
    outline: 'none',
    fontSize: 14,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: '0.06em',
  };

  if (confirmed) {
    return (
      <div className="animate-fade-in" style={cardStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
            ✉️
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>Check Your Email</h2>
          <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            We sent a confirmation link to <strong style={{ color: '#F1F5F9' }}>{email}</strong>.<br />
            Click the link to activate your account, then log in.
          </p>
          <button
            onClick={() => onSwitchToLogin?.() || navigate('/login')}
            className="btn-primary"
            style={{ width: '100%', padding: '13px' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={cardStyle}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366F1,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontWeight: 900, fontSize: 20, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>C</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Create Account</h2>
        <p style={{ color: '#64748B', fontSize: 14 }}>Start your journey with CareerPilot</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, color: '#F87171', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="name@email.com"
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            id="signup-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="Min 6 characters"
          />
          {password.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: password.length >= i * 3 ? (password.length >= 10 ? '#10B981' : '#F59E0B') : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
              ))}
            </div>
          )}
        </div>

        <button id="signup-submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, padding: '14px', fontSize: 15 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              Creating Account...
            </span>
          ) : 'Get Started →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, color: '#64748B', fontSize: 13 }}>
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} style={{ color: '#818CF8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Signup;

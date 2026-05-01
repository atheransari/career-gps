import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('cp-token');
    if (token) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email above first, then click Forgot Password.');
      return;
    }
    try {
      await api.forgotPassword(email);
      setForgotSent(true);
      setError('');
    } catch {
      setError('Could not send reset email. Please try again.');
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

  return (
    <div className="animate-fade-in" style={cardStyle}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366F1,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontWeight: 900, fontSize: 20, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>C</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome Back</h2>
        <p style={{ color: '#64748B', fontSize: 14 }}>Log in to access your career tracks</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, color: '#F87171', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}
        {forgotSent && (
          <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, color: '#34D399', fontSize: 13, fontWeight: 600 }}>
            ✅ Password reset link sent! Check your email.
          </div>
        )}

        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="name@email.com"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{ color: '#818CF8', fontSize: 12, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Forgot Password?
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        <button id="login-submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, padding: '14px', fontSize: 15 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              Authenticating...
            </span>
          ) : 'Sign In →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, color: '#64748B', fontSize: 13 }}>
        Don&apos;t have an account?{' '}
        <button onClick={onSwitchToSignup} style={{ color: '#818CF8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
          Create one
        </button>
      </p>
    </div>
  );
};

export default Login;

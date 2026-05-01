import React, { useEffect, useState } from 'react';
import { api } from '../../api';

// ── Mini SVG line graph (no chart lib needed) ─────────────────────────────────
const LineGraph = ({ data }) => {
  if (!data || data.length < 2) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569', fontSize: 14 }}>
      Upload at least 2 resumes to see your progress graph.
    </div>
  );

  const W = 520, H = 180, PAD = 32;
  const scores = data.map(d => d.ats_score);
  const min = Math.max(0, Math.min(...scores) - 10);
  const max = Math.min(100, Math.max(...scores) + 10);
  const toX = (i) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (s) => H - PAD - ((s - min) / (max - min)) * (H - PAD * 2);

  const points = data.map((d, i) => `${toX(i)},${toY(d.ats_score)}`).join(' ');
  const areaPoints = `${toX(0)},${H - PAD} ${points} ${toX(data.length - 1)},${H - PAD}`;

  const color = scores[scores.length - 1] >= 75 ? '#10B981' : scores[scores.length - 1] >= 50 ? '#F59E0B' : '#EF4444';
  const trend = scores[scores.length - 1] - scores[0];

  return (
    <div>
      {/* Trend badge */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <span style={{
          padding: '4px 14px', borderRadius: 999, fontSize: 13, fontWeight: 800,
          background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: trend >= 0 ? '#10B981' : '#EF4444',
          border: `1px solid ${trend >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {trend >= 0 ? '🚀' : '📉'} {trend >= 0 ? '+' : ''}{trend} pts overall
        </span>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => {
          if (v < min || v > max) return null;
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1F2937" strokeWidth="1" strokeDasharray="4,4"/>
              <text x={PAD - 6} y={y + 4} fill="#475569" fontSize="10" textAnchor="end">{v}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon points={areaPoints} fill={`${color}15`} />

        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />

        {/* Dots */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.ats_score)} r="5" fill={color}
              stroke="#0D1424" strokeWidth="2"
              style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
            <text x={toX(i)} y={toY(d.ats_score) - 12} fill="#94A3B8" fontSize="11"
              textAnchor="middle" fontWeight="700">{d.ats_score}</text>
          </g>
        ))}

        {/* X-axis dates */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 4} fill="#475569" fontSize="9" textAnchor="middle">
            {new Date(d.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ── Modal ──────────────────────────────────────────────────────────────────────
const ResumeHistoryModal = ({ onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getResumeHistory()
      .then(data => setHistory(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-in-up"
        style={{
          background: '#0D1424', border: '1px solid #1F2937', borderRadius: 24,
          padding: '36px 40px', maxWidth: 600, width: '90%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#F1F5F9', marginBottom: 4 }}>📊 Resume Score History</h2>
            <p style={{ color: '#64748B', fontSize: 13 }}>Track your ATS score improvements over time</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1F2937', borderRadius: 10, padding: '8px 14px', color: '#94A3B8', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}
          >✕</button>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="skeleton-box" style={{ height: 180, borderRadius: 14 }} />
            <div className="skeleton-box" style={{ height: 60, borderRadius: 10 }} />
          </div>
        )}
        {error && <p style={{ color: '#EF4444', fontSize: 14, textAlign: 'center' }}>⚠️ {error}</p>}

        {!loading && !error && (
          <>
            <LineGraph data={history} />
            {/* History table */}
            {history.length > 0 && (
              <div style={{ marginTop: 24, maxHeight: 180, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1F2937' }}>
                      <th style={{ textAlign: 'left', color: '#64748B', fontWeight: 700, padding: '8px 0' }}>#</th>
                      <th style={{ textAlign: 'left', color: '#64748B', fontWeight: 700, padding: '8px 0' }}>Date</th>
                      <th style={{ textAlign: 'right', color: '#64748B', fontWeight: 700, padding: '8px 0' }}>ATS Score</th>
                      <th style={{ textAlign: 'right', color: '#64748B', fontWeight: 700, padding: '8px 0' }}>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => {
                      const prev = history[i - 1];
                      const delta = prev ? row.ats_score - prev.ats_score : null;
                      const scoreColor = row.ats_score >= 75 ? '#10B981' : row.ats_score >= 50 ? '#F59E0B' : '#EF4444';
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px 0', color: '#475569' }}>{i + 1}</td>
                          <td style={{ padding: '8px 0', color: '#94A3B8' }}>
                            {new Date(row.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: scoreColor }}>{row.ats_score}</td>
                          <td style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: delta === null ? '#475569' : delta >= 0 ? '#10B981' : '#EF4444' }}>
                            {delta === null ? '—' : `${delta >= 0 ? '+' : ''}${delta}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeHistoryModal;

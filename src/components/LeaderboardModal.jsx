import React, { useState } from 'react';
import { getLeaderboard, getPersonalBest, POPULAR_CAMPUSES } from '../utils/storage';

export default function LeaderboardModal({ onClose, onStartGame }) {
  const [entries] = useState(getLeaderboard());
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const pb = getPersonalBest();

  const filteredEntries = selectedCampus === 'All Campuses'
    ? entries
    : entries.filter(e => e.campus.toLowerCase() === selectedCampus.toLowerCase());

  // Determine top campus
  const topCampus = entries[0]?.campus || 'IIT Bombay';
  const topScore = entries[0]?.score || 4920;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px', padding: '24px 22px', gap: '14px' }}>
        
        {/* Modal Header */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--gold-400)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>
              NIAT FESTIVAL ARCHIVES
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.6rem', textAlign: 'left', marginTop: '2px' }}>
              CROSS-CAMPUS MASTERS
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--gold-400)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.15s ease'
            }}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Campus Leaderboard Banner */}
        <div style={{
          width: '100%',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{ color: 'var(--gold-300)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏆</span>
            <span>LEADING CAMPUS:</span>
            <strong style={{ color: 'var(--marigold-300)' }}>{topCampus} ({topScore} PTS)</strong>
          </span>
          <span style={{ color: 'var(--parchment-surface)', fontSize: '0.76rem' }}>
            {entries.length} Certified Submissions across Campuses
          </span>
        </div>

        {/* Campus Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          width: '100%',
          paddingBottom: '4px'
        }}>
          {POPULAR_CAMPUSES.map(campus => (
            <button
              key={campus}
              onClick={() => setSelectedCampus(campus)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.74rem',
                fontWeight: 600,
                border: selectedCampus === campus ? '1px solid var(--border-prominent)' : '1px solid var(--border-subtle)',
                background: selectedCampus === campus ? 'linear-gradient(135deg, var(--maroon-700), var(--maroon-900))' : 'rgba(26, 4, 8, 0.6)',
                color: selectedCampus === campus ? 'var(--marigold-300)' : 'var(--gold-400)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {campus}
            </button>
          ))}
        </div>

        {/* Personal Best Highlight */}
        {pb && (
          <div style={{
            width: '100%',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem'
          }}>
            <span style={{ color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✨</span>
              <span>YOUR RECORD:</span>
              <strong className="tabular-nums" style={{ color: '#FFF' }}>{pb.score.toLocaleString()} PTS</strong>
            </span>
            <span className="tabular-nums" style={{ color: '#6EE7B7', fontSize: '0.78rem' }}>
              {pb.accuracy}% Flow • {pb.cantosCompleted || 5}/5 Vighnas Overcome
            </span>
          </div>
        )}

        {/* Leaderboard Table */}
        <div style={{ width: '100%', overflowX: 'auto', minHeight: '160px', maxHeight: '240px' }}>
          {filteredEntries.length === 0 ? (
            <div style={{ padding: '30px', color: 'var(--gold-400)', fontStyle: 'italic', fontSize: '0.88rem' }}>
              No scores recorded for {selectedCampus} yet. Be the first from your campus to set the benchmark!
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Celebrant</th>
                  <th>Campus</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                  <th style={{ textAlign: 'center' }}>Flow</th>
                  <th style={{ textAlign: 'center' }}>Vighnas</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ fontWeight: 800, color: idx < 3 ? 'var(--marigold-300)' : 'var(--gold-400)' }}>
                      {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </td>
                    <td style={{ fontWeight: 700, color: '#FFF' }}>{item.playerName}</td>
                    <td style={{ color: 'var(--gold-400)', fontSize: '0.8rem' }}>{item.campus}</td>
                    <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gold-300)' }}>
                      {item.score.toLocaleString()}
                    </td>
                    <td className="tabular-nums" style={{ textAlign: 'center', color: item.accuracy >= 90 ? '#34D399' : 'var(--gold-300)' }}>
                      {item.accuracy}%
                    </td>
                    <td className="tabular-nums" style={{ textAlign: 'center' }}>
                      {item.cantosCompleted || 5}/5
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-divider" />

        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
          <button className="btn-festival-secondary" onClick={onClose}>
            BACK
          </button>
          <button className="btn-festival-primary" style={{ padding: '10px 24px', fontSize: '0.92rem' }} onClick={onStartGame}>
            <span>🪔</span>
            <span>BEGIN FESTIVAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}

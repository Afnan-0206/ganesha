import React, { useState } from 'react';
import { Trophy, Sparkles, Medal } from 'lucide-react';
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
      <div className="modal-content" style={{ maxWidth: '740px' }}>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-text">
            <div className="modal-header-label">
              FESTIVAL ARCHIVES
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.65rem', textAlign: 'left', marginTop: '2px' }}>
              GLOBAL FESTIVAL MASTERS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-modal-close"
            aria-label="Close Leaderboard"
          >
            ✕
          </button>
        </div>

        {/* Campus Leaderboard Banner */}
        <div className="leaderboard-banner anim-fade-up anim-delay-1">
          <span className="leaderboard-banner-leading">
            <Trophy size={16} color="var(--marigold-400)" />
            <span>LEADING CAMPUS:</span>
            <strong style={{ color: 'var(--marigold-300)' }}>{topCampus} ({topScore} PTS)</strong>
          </span>
          <span className="leaderboard-banner-count">
            {entries.length} Certified Submissions across Campuses
          </span>
        </div>

        {/* Campus Filter Pills */}
        <div className="campus-filter-pills hide-scrollbar anim-fade-up anim-delay-2">
          {POPULAR_CAMPUSES.map(campus => (
            <button
              key={campus}
              onClick={() => setSelectedCampus(campus)}
              className={`campus-pill ${selectedCampus === campus ? 'campus-pill--active' : ''}`}
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
              <Sparkles size={16} color="#34D399" />
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
                      {idx < 3 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Medal size={16} color={idx === 0 ? '#FBBF24' : idx === 1 ? '#D1D5DB' : '#B45309'} />
                          {idx + 1}
                        </div>
                      ) : (
                        `#${idx + 1}`
                      )}
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

import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, Medal, Home } from 'lucide-react';
import { getLeaderboard, fetchCloudLeaderboard, getPersonalBest, POPULAR_CAMPUSES } from '../utils/storage';

export default function LeaderboardModal({ onClose, onStartGame, onReturnToTitle }) {
  const [entries, setEntries] = useState(getLeaderboard());
  const [selectedCampus, setSelectedCampus] = useState('All NIAT Campuses');
  const pb = getPersonalBest();

  useEffect(() => {
    let mounted = true;
    fetchCloudLeaderboard().then(data => {
      if (mounted && data && Array.isArray(data)) {
        setEntries(data);
      }
    });
    return () => { mounted = false; };
  }, []);

  const filteredEntries = selectedCampus === 'All NIAT Campuses'
    ? entries
    : entries.filter(e => e.campus.toLowerCase() === selectedCampus.toLowerCase());

  // Determine top campus
  const topCampus = entries[0]?.campus || 'NIAT Hyderabad';
  const topScore = entries[0]?.score || 4980;

  const handleReturnToTitle = () => {
    if (onClose) onClose();
    if (onReturnToTitle) onReturnToTitle();
  };

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: '760px' }}>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-text">
            <div className="modal-header-label">
              NIAT FESTIVAL ARCHIVES
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.65rem', textAlign: 'left', marginTop: '2px' }}>
              NIAT CAMPUS FESTIVAL MASTERS
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
            <span>LEADING NIAT CAMPUS:</span>
            <strong style={{ color: 'var(--marigold-300)' }}>{topCampus} ({topScore} PTS)</strong>
          </span>
          <span className="leaderboard-banner-count">
            {entries.length} Certified NIAT Submissions
          </span>
        </div>

        {/* NIAT Educational Information Banner */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '10px 16px',
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'left',
          boxShadow: 'inset 0 0 15px rgba(56, 189, 248, 0.05)'
        }}>
          <span style={{ fontSize: '1.6rem' }}>🎓</span>
          <div style={{ fontSize: '0.78rem', color: '#BAE6FD', lineHeight: '1.4' }}>
            <strong style={{ color: '#7DD3FC' }}>NIAT (NxtWave Institute of Advanced Technologies):</strong> Empowering the next generation of tech innovators and full-stack software engineers across campuses in Hyderabad, Bengaluru, Vijayawada, Pune, and Delhi-NCR.
          </div>
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
          <div className="personal-best-banner anim-fade-up anim-delay-3">
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
        <div style={{ width: '100%', overflowX: 'auto', minHeight: '160px', maxHeight: '260px' }}>
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
                  <th>NIAT Campus</th>
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

        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {onReturnToTitle && (
            <button
              className="btn-festival-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--gold-400)', color: 'var(--marigold-300)' }}
              onClick={handleReturnToTitle}
            >
              <Home size={15} />
              <span>RETURN TO TITLE</span>
            </button>
          )}
          <button className="btn-festival-secondary" onClick={onClose}>
            CLOSE
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

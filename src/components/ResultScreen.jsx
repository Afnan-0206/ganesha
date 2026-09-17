import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { playManuscriptCompleteFanfare } from '../audio/synthInstruments';
import { getPlayerProfile, savePlayerProfile, submitScoreToLeaderboard } from '../utils/storage';

export default function ResultScreen({ summary, onPlayAgain, onViewLeaderboard, onPracticeStage }) {
  const [profile, setProfile] = useState(getPlayerProfile());
  const [submitted, setSubmitted] = useState(false);

  const totalScore = summary.totalScore || 0;
  const rank = summary.rank || { title: 'STEADFAST CELEBRANT', badge: '✦✦✦' };
  const stageScores = summary.stageScores || { rangoli: 85, pandal: 80, modak: 90, dhol: 85, visarjan: 88 };
  const weakest = summary.weakestVighna || { stage: { id: 'dhol', name: 'DHOL' }, score: 85 };

  useEffect(() => {
    playManuscriptCompleteFanfare();
    // Multi-burst celebration confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FF7700', '#F59E0B', '#FDE68A', '#10B981']
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.3, y: 0.5 },
        colors: ['#D4AF37', '#FBBF24']
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.7, y: 0.5 },
        colors: ['#FF7700', '#F59E0B']
      });
    }, 400);
  }, []);

  const handleSubmitScore = (e) => {
    e.preventDefault();
    if (submitted) return;
    savePlayerProfile(profile);
    submitScoreToLeaderboard({
      playerName: profile.nickname,
      campus: profile.campus,
      score: totalScore,
      accuracy: Math.round((totalScore / 500) * 100),
      cantosCompleted: summary.vighnasOvercome || 5,
      longestCombo: summary.vighnasOvercome || 5
    });
    setSubmitted(true);
  };

  const getScoreColor = (val) => {
    if (val >= 85) return '#34D399';
    if (val >= 70) return 'var(--gold-300)';
    return 'var(--marigold-400)';
  };

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: '620px', padding: '24px 22px', gap: '12px' }}>
        
        {/* Title and Sacred Invocation */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-400)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
            ॥ मंगलमूर्ती मोरया ॥
          </div>
          <h2 className="modal-title" style={{ fontSize: '1.7rem', color: 'var(--marigold-300)', marginTop: '2px' }}>
            GANPATI BAPPA MORAYA!
          </h2>
          <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--parchment-surface)', margin: '4px 0 0 0' }}>
            Your five-fold festival journey is fulfilled. All obstacles have been overcome.
          </p>
        </div>

        {/* Festival Rank Badge */}
        <div className="flow-rating-badge" style={{ fontSize: '0.92rem', padding: '6px 20px' }}>
          <span>{rank.badge}</span>
          <span>{rank.title}</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span className="tabular-nums" style={{ fontWeight: 800 }}>{totalScore} / 500 PTS</span>
        </div>

        {/* 5-Stage Breakdown Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          width: '100%',
          margin: '2px 0'
        }}>
          {Object.entries(stageScores).map(([k, val]) => (
            <div 
              key={k} 
              className="stat-box" 
              style={{ 
                padding: '8px 4px', 
                background: 'rgba(22, 3, 7, 0.75)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span className="stat-box-label" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
                {k.toUpperCase()}
              </span>
              <span 
                className="stat-box-value tabular-nums" 
                style={{ 
                  fontSize: '1.15rem', 
                  color: val >= 85 ? '#34D399' : val >= 70 ? 'var(--gold-300)' : 'var(--marigold-400)' 
                }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* Global Flow & Vighnas Overcome Row */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'rgba(22, 3, 7, 0.75)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 18px',
          fontSize: '0.82rem'
        }}>
          <span style={{ color: 'var(--gold-300)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="diya-flame">🪔</span>
            <span>FESTIVAL FLOW:</span>
            <strong className="tabular-nums" style={{ color: '#34D399' }}>{summary.festivalFlow || 95}%</strong>
          </span>
          <span style={{ color: 'var(--gold-300)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✦</span>
            <span>VIGHNAS OVERCOME:</span>
            <strong className="tabular-nums" style={{ color: 'var(--marigold-300)' }}>{summary.vighnasOvercome || 5} / 5</strong>
          </span>
        </div>

        {/* Weakest Vighna Challenge Callout */}
        {weakest && weakest.stage && (
          <div style={{
            width: '100%',
            background: 'rgba(185, 28, 28, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            color: 'var(--parchment-surface)',
            textAlign: 'left'
          }}>
            <div>
              <div>
                <span>YOUR WEAKEST VIGHNA: </span>
                <strong style={{ color: 'var(--marigold-300)' }}>
                  {weakest.stage.name} ({weakest.score} PTS)
                </strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-400)', marginTop: '2px' }}>
                Refine this skill or conquer it in your next full festival run!
              </div>
            </div>
            {onPracticeStage && weakest.stage.id && (
              <button
                type="button"
                className="btn-festival-secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  borderColor: 'var(--border-prominent)',
                  color: 'var(--gold-300)',
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-sm)'
                }}
                onClick={() => onPracticeStage(weakest.stage.id)}
              >
                🎯 PRACTICE {weakest.stage.name}
              </button>
            )}
          </div>
        )}

        {/* Contest Archive Submission Form */}
        <form onSubmit={handleSubmitScore} style={{ width: '100%', margin: '2px 0' }}>
          <div style={{
            background: 'rgba(22, 3, 7, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold-400)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              RECORD IN ARCHIVES:
            </span>
            <input
              type="text"
              maxLength={20}
              placeholder="Nickname"
              value={profile.nickname}
              onChange={e => setProfile({ ...profile, nickname: e.target.value })}
              disabled={submitted}
              style={{
                flex: 1,
                minWidth: '110px',
                padding: '7px 12px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFF',
                fontSize: '0.82rem'
              }}
            />
            <input
              type="text"
              maxLength={24}
              placeholder="Campus"
              value={profile.campus}
              onChange={e => setProfile({ ...profile, campus: e.target.value })}
              disabled={submitted}
              style={{
                flex: 1,
                minWidth: '110px',
                padding: '7px 12px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFF',
                fontSize: '0.82rem'
              }}
            />
            <button
              type="submit"
              className="btn-festival-secondary"
              disabled={submitted}
              style={{ padding: '7px 16px', fontSize: '0.78rem', opacity: submitted ? 0.6 : 1, borderRadius: 'var(--radius-sm)' }}
            >
              {submitted ? 'RECORDED ✓' : 'SAVE RECORD'}
            </button>
          </div>
        </form>

        <div className="modal-divider" />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
          <button 
            className="btn-festival-primary" 
            style={{ padding: '11px 28px', fontSize: '0.95rem' }} 
            onClick={onPlayAgain}
          >
            <span>🪔</span>
            <span>BEAT MY FESTIVAL</span>
          </button>
          <button 
            className="btn-festival-secondary" 
            style={{ padding: '11px 22px', fontSize: '0.92rem' }} 
            onClick={onViewLeaderboard}
          >
            <span>🏆</span>
            <span>FESTIVAL MASTERS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

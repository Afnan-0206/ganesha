import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, Medal, ArrowRight, RotateCcw, Target, Home } from 'lucide-react';
import { playManuscriptCompleteFanfare } from '../audio/synthInstruments';
import { getPlayerProfile, savePlayerProfile, submitScoreToLeaderboard, getLeaderboard, getPersonalBest, POPULAR_CAMPUSES } from '../utils/storage';

export default function ResultScreen({ summary, onPlayAgain, onViewLeaderboard, onPracticeStage, onReturnToTitle }) {
  const [activeTab, setActiveTab] = useState('result'); // 'result' | 'leaderboard'
  const [profile, setProfile] = useState(getPlayerProfile());
  const [submitted, setSubmitted] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState('All NIAT Campuses');
  const [leaderboardEntries, setLeaderboardEntries] = useState(() => getLeaderboard());

  const totalScore = summary.totalScore || 0;
  const rank = summary.rank || { title: 'STEADFAST CELEBRANT', badge: '✦✦✦' };
  const stageScores = summary.stageScores || { rangoli: 85, aarti: 90, modak: 90, dhol: 85, visarjan: 88 };
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
        particleCount: 60,
        spread: 60,
        origin: { x: 0.25, y: 0.5 },
        colors: ['#D4AF37', '#FBBF24']
      });
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { x: 0.75, y: 0.5 },
        colors: ['#FF7700', '#F59E0B']
      });
    }, 350);
  }, []);

  const handleSubmitScore = (e) => {
    e.preventDefault();
    if (submitted) return;
    savePlayerProfile(profile);
    submitScoreToLeaderboard({
      playerName: profile.nickname || 'Celebrant',
      campus: profile.campus || 'NIAT Hyderabad',
      score: totalScore,
      accuracy: Math.round((totalScore / 500) * 100),
      cantosCompleted: summary.vighnasOvercome || 5,
      longestCombo: summary.vighnasOvercome || 5
    });
    setSubmitted(true);
    setLeaderboardEntries(getLeaderboard());
  };

  const getScoreColor = (val) => {
    if (val >= 85) return '#34D399';
    if (val >= 70) return 'var(--gold-300)';
    return 'var(--marigold-400)';
  };

  const filteredEntries = selectedCampus === 'All NIAT Campuses'
    ? leaderboardEntries
    : leaderboardEntries.filter(e => e.campus.toLowerCase() === selectedCampus.toLowerCase());

  const pb = getPersonalBest();
  const topCampus = leaderboardEntries[0]?.campus || 'NIAT Hyderabad';
  const topScore = leaderboardEntries[0]?.score || 4950;

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: '680px', padding: '28px 32px' }}>

        {/* Tab Navigation: Result vs Leaderboard */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          marginBottom: '16px'
        }}>
          <button
            type="button"
            className={`campus-pill ${activeTab === 'result' ? 'campus-pill--active' : ''}`}
            style={{ padding: '8px 22px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('result')}
          >
            <span>📊</span>
            <span>FESTIVAL RESULT</span>
          </button>
          <button
            type="button"
            className={`campus-pill ${activeTab === 'leaderboard' ? 'campus-pill--active' : ''}`}
            style={{ padding: '8px 22px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={16} color="var(--marigold-400)" />
            <span>CAMPUS LEADERBOARD</span>
          </button>
        </div>

        {activeTab === 'result' ? (
          <>
            {/* Title and Sacred Invocation */}
            <div style={{ textAlign: 'center' }} className="anim-fade-up anim-delay-1">
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-400)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>
                ॥ मंगलमूर्ती मोरया • पंच विघ्न संपन्न ॥
              </div>
              <h2 className="modal-title" style={{ fontSize: '1.85rem', marginTop: '4px' }}>
                GANPATI BAPPA MORYA!
              </h2>
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--parchment-surface)', margin: '4px 0 0 0', opacity: 0.9 }}>
                Your sacred 5-chapter festival journey is fulfilled. All obstacles have been overcome.
              </p>
            </div>

            {/* Festival Rank Badge */}
            <div className="flow-rating-badge anim-scale-in anim-delay-2" style={{ fontSize: '0.96rem', padding: '10px 26px', margin: '14px auto' }}>
              <span>{rank.badge}</span>
              <span>{rank.title}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--marigold-300)' }}>{totalScore} / 500 PTS</span>
            </div>

            {/* 5-Stage Breakdown Grid */}
            <div className="stage-scores-grid anim-fade-up anim-delay-3" style={{ margin: '10px 0' }}>
              {Object.entries(stageScores).map(([k, val]) => (
                <div key={k} className="stage-score-box">
                  <span className="stage-score-label">{k.toUpperCase()}</span>
                  <span
                    className="stage-score-value tabular-nums"
                    style={{ color: getScoreColor(val) }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* Global Flow & Vighnas Overcome Row */}
            <div className="festival-stats-row anim-fade-up anim-delay-4" style={{ margin: '8px 0' }}>
              <span className="festival-stat-item">
                <span className="diya-flame">🪔</span>
                <span>FESTIVAL FLOW:</span>
                <strong className="tabular-nums" style={{ color: '#34D399' }}>{summary.festivalFlow || 95}%</strong>
              </span>
              <span className="festival-stat-item">
                <Sparkles size={15} color="var(--marigold-400)" />
                <span>VIGHNAS OVERCOME:</span>
                <strong className="tabular-nums" style={{ color: 'var(--marigold-300)' }}>{summary.vighnasOvercome || 5} / 5</strong>
              </span>
            </div>

            {/* Weakest Vighna Challenge Callout */}
            {weakest && weakest.stage && (
              <div className="weakest-vighna-callout anim-fade-up anim-delay-5" style={{ margin: '10px 0' }}>
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
                      padding: '7px 14px',
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
            <form onSubmit={handleSubmitScore} style={{ width: '100%', margin: '8px 0' }}>
              <div className="score-form-row anim-fade-up anim-delay-6">
                <span className="score-form-label">
                  RECORD IN ARCHIVES:
                </span>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="Your Name / Nickname"
                  value={profile.nickname}
                  onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                  disabled={submitted}
                  className="score-form-input"
                />
                <input
                  type="text"
                  maxLength={24}
                  placeholder="Your College / Campus"
                  value={profile.campus}
                  onChange={e => setProfile({ ...profile, campus: e.target.value })}
                  disabled={submitted}
                  className="score-form-input"
                />
                <button
                  type="submit"
                  className="btn-festival-secondary"
                  disabled={submitted}
                  style={{ padding: '8px 18px', fontSize: '0.8rem', opacity: submitted ? 0.7 : 1, borderRadius: 'var(--radius-sm)' }}
                >
                  {submitted ? 'RECORDED ✓' : 'SAVE BENCHMARK'}
                </button>
              </div>
            </form>

            <div className="modal-divider" style={{ margin: '14px 0' }} />

            {/* Action Buttons */}
            <div className="anim-fade-up anim-delay-7" style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-festival-primary"
                style={{ padding: '12px 22px', fontSize: '0.92rem' }}
                onClick={onPlayAgain}
              >
                <RotateCcw size={16} />
                <span>PLAY AGAIN</span>
              </button>
              <button
                className="btn-festival-secondary"
                style={{ padding: '12px 20px', fontSize: '0.92rem' }}
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy size={16} />
                <span>LEADERBOARD</span>
              </button>
              <button
                className="btn-festival-secondary"
                style={{ padding: '12px 20px', fontSize: '0.92rem', borderColor: 'var(--gold-400)', color: 'var(--marigold-300)' }}
                onClick={onReturnToTitle}
              >
                <Home size={16} />
                <span>RETURN TO TITLE</span>
              </button>
            </div>
          </>
        ) : (
          /* LEADERBOARD VIEW */
          <div className="anim-fade-up" style={{ width: '100%' }}>
            {/* Campus Leaderboard Banner */}
            <div className="leaderboard-banner" style={{ margin: '0 0 10px 0' }}>
              <span className="leaderboard-banner-leading">
                <Trophy size={16} color="var(--marigold-400)" />
                <span>LEADING NIAT CAMPUS:</span>
                <strong style={{ color: 'var(--marigold-300)' }}>{topCampus} ({topScore} PTS)</strong>
              </span>
              <span className="leaderboard-banner-count">
                {leaderboardEntries.length} Certified NIAT Submissions
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
                <strong style={{ color: '#7DD3FC' }}>NIAT (NxtWave Institute of Advanced Technologies):</strong> The premier industry-focused tech upskilling institute empowering students with full-stack development, AI/ML, and practical coding excellence across campus cohorts in Hyderabad, Bengaluru, Vijayawada, Pune, Delhi-NCR, and innovation labs.
              </div>
            </div>

            {/* Campus Filter Pills */}
            <div className="campus-filter-pills hide-scrollbar" style={{ margin: '0 0 12px 0' }}>
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
              <div className="personal-best-banner" style={{ margin: '0 0 12px 0' }}>
                <span style={{ color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#34D399" />
                  <span>YOUR BEST:</span>
                  <strong className="tabular-nums" style={{ color: '#FFF' }}>{pb.score.toLocaleString()} PTS</strong>
                </span>
                <span className="tabular-nums" style={{ color: '#6EE7B7', fontSize: '0.78rem' }}>
                  {pb.accuracy}% Flow • {pb.cantosCompleted || 5}/5 Vighnas Overcome
                </span>
              </div>
            )}

            {/* Leaderboard Table */}
            <div style={{ width: '100%', overflowX: 'auto', minHeight: '180px', maxHeight: '280px' }}>
              {filteredEntries.length === 0 ? (
                <div style={{ padding: '30px', color: 'var(--gold-400)', fontStyle: 'italic', fontSize: '0.88rem', textAlign: 'center' }}>
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

            <div className="modal-divider" style={{ margin: '14px 0' }} />

            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-festival-secondary"
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                onClick={() => setActiveTab('result')}
              >
                <span>BACK TO RESULT</span>
              </button>
              <button
                className="btn-festival-secondary"
                style={{ padding: '10px 20px', fontSize: '0.9rem', borderColor: 'var(--gold-400)', color: 'var(--marigold-300)' }}
                onClick={onReturnToTitle}
              >
                <Home size={16} />
                <span>RETURN TO TITLE</span>
              </button>
              <button
                className="btn-festival-primary"
                style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                onClick={onPlayAgain}
              >
                <RotateCcw size={16} />
                <span>PLAY FESTIVAL AGAIN</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
